(() => {
  "use strict";

  const SOURCE_PAGE_COUNT = 45;
  let templatePromise = null;

  const BODY = {
    left: 72,
    right: 72,
    top: 108,
    bottom: 62,
    fontSize: 12,
    lineHeight: 24,
    paragraphIndent: 36
  };

  function clean(v){ return String(v == null ? "" : v).replace(/\s+/g," ").trim(); }

  function collapseSpacedCharacters(v){
    return String(v||"").replace(/(?:\b[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]\b\s+){3,}\b[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]\b/g,m=>m.replace(/\s+/g,""));
  }

  function cleanLegacyText(v){
    return collapseSpacedCharacters(clean(v)
      .replace(/%ª/g,"•")
      .replace(/\bo\s+A los estudiantes\b/gi,"A los estudiantes")
      .replace(/\bo\s+Criterios de evaluación:/gi,"Criterios de evaluación:")
      .replace(/\bo\s+La cantidad de estudiantes por grupo\b/gi,"• La cantidad de estudiantes por grupo")
      .replace(/\bo\s+Los requerimientos técnicos o de software\b/gi,"• Los requerimientos técnicos o de software")
      .replace(/\bo\s+Pruebas técnicas previas\b/gi,"• Pruebas técnicas previas")
      .replace(/\bo\s+Presencia de personal de soporte\b/gi,"• Presencia de personal de soporte")
      .replace(/\bo\s+Coordinación con la unidad de infraestructura tecnológica institucional\b/gi,"• Coordinación con la unidad de infraestructura tecnológica institucional")
      .replace(/\s+%\s*/g," ")
      .replace(/\s+•\s+/g," • "));
  }

  function sourceProse(v){
    const text=cleanLegacyText(v);
    if(!text) return "";
    const parts=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];
    const kept=parts.filter(s=>{
      const citation=/\(\d{4}\)/.test(s);
      const citationCue=/(según|de acuerdo con|quien(?:es)?|afirma|señala|menciona|destaca|en palabras de)/i.test(s);
      return !(citation&&citationCue);
    });
    return clean(kept.join(" "));
  }

  function normalize(v){
    return clean(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  }
  function lowerPeriod(name){
    const s=String(name||"");
    return s ? s.charAt(0).toLowerCase()+s.slice(1) : s;
  }
  function formatDateShort(v){
    if(!v) return "";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
  }
  function formatDateLong(v){
    if(!v) return "";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"long",year:"numeric"}).format(d);
  }

  async function decodeTemplatePages(){
    if(templatePromise) return templatePromise;
    templatePromise=(async()=>{
      const chunks=window.DOC_TIT_TEMPLATE_CHUNKS || [];
      if(chunks.length !== 4 || chunks.some(x=>!x)) throw new Error("No se encontró la plantilla completa.");
      if(typeof DecompressionStream === "undefined") throw new Error("Usa una versión actualizada de Chrome o Edge.");
      const binary=atob(chunks.join(""));
      const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      const text=await new Response(stream).text();
      const pages=JSON.parse(text);
      if(!Array.isArray(pages) || pages.length !== SOURCE_PAGE_COUNT) throw new Error("La plantilla base no contiene las 45 páginas esperadas.");
      return pages;
    })();
    return templatePromise;
  }

  function replacePeriod(text, period){
    const current=String(period.name||"");
    const lower=lowerPeriod(current);
    return String(text||"")
      .replace(/Octubre\s+2025\s+A\s+Marzo\s+2026/gi,current)
      .replace(/octubre\s+2025\s*[–-]\s*marzo\s+2026/gi,lower)
      .replace(/octubre\s+2025\s+a\s+marzo\s+2026/gi,lower);
  }

  function stripTemplateHeaders(text, period){
    return replacePeriod(text,period).split(/\r?\n/).map(x=>x.trim()).filter(t=>{
      if(!t) return false;
      if(/^Página\s+\d+\s+de\s+45$/i.test(t)) return false;
      if(/^UNIDAD TITULACIÓN Y EFICIENCIA/i.test(t)) return false;
      if(/^TERMINAL$/i.test(t)) return false;
      if(/^Código:/i.test(t)) return false;
      if(/^UTET-RGI/i.test(t)) return false;
      if(/^Versión:/i.test(t)) return false;
      if(/^Fecha de Elaboración:/i.test(t)) return false;
      if(/^\d{1,2}\s*-\s*[A-Za-zÁÉÍÓÚáéíóúÑñ]+\s*-\s*\d{4}$/i.test(t)) return false;
      if(/^Planificación De Examen Complexivo/i.test(t)) return false;
      if(normalize(t)===normalize(period.name)) return false;
      return true;
    });
  }

  function lineType(t){
    if(/^[1-4]\.\s+(Reforzar los conocimientos teóricos|Desarrollar habilidades prácticas|Evaluación a través de talleres|Orientación y asesoría):/i.test(t)) return "label";
    if(/^\d+\.\d+\.\d+\.\s+/.test(t)) return "h3";
    if(/^\d+\.\d+\.\s+/.test(t)) return "h2";
    if(/^\d+\.\s+/.test(t)) return "h1";
    if(/^[•]/.test(t)) return "bullet";
    if(/^(Descripción|Objetivo|Características|Requisitos|Condiciones|Beneficios|Procedimiento|Importancia|Estructura|Duración|Modalidad online|Consideraciones técnicas|Asignación por carrera|Distribución por sedes|Ponderación y aprobación):?/i.test(t)) return "label";
    return "p";
  }

  function parseSourceBlocks(pages,period){
    const lines=[];
    for(let p=6;p<=45;p++){
      const stripped=stripTemplateHeaders(pages[p-1],period);
      stripped.forEach(x=>lines.push(x));
    }

    const blocks=[];
    let paragraph=[];

    const flush=()=>{
      if(!paragraph.length) return;
      const t=cleanLegacyText(paragraph.join(" "));
      if(t) blocks.push({type:"p",text:t});
      paragraph=[];
    };

    lines.forEach(t=>{
      const type=lineType(t);
      if(type==="p"){
        paragraph.push(t);
      }else{
        flush();
        blocks.push({type,text:cleanLegacyText(t)});
      }
    });
    flush();
    return blocks;
  }

  function imageFormat(dataUrl){
    if(/^data:image\/png/i.test(dataUrl||"")) return "PNG";
    if(/^data:image\/webp/i.test(dataUrl||"")) return "WEBP";
    return "JPEG";
  }

  function smartSectionKey(heading){
    const h=normalize(heading);
    if(h.includes("metodologia") || h.includes("induccion") || h.includes("diseno del examen")) return "metodologia";
    if(h.includes("requisitos para titulacion") || h.includes("requisitos academicos") || h.includes("requisitos de documentacion") || h.includes("requisitos financieros")) return "requisitos";
    if(h.includes("organizacion y distribucion") || h.includes("asignacion de laboratorios") || h.includes("distribucion de estudiantes")) return "logistica";
    if(h.includes("evaluacion") || h.includes("componente teorico") || h.includes("componente practico")) return "evaluacion";
    if(h.includes("cronogramas")) return "cronograma";
    return null;
  }

  function getAnalysisSentences(ctx,key){
    const sections=ctx.analysis && ctx.analysis.sections ? ctx.analysis.sections : {};
    return Array.isArray(sections[key]) ? sections[key] : [];
  }

  function totals(distribution){
    const byPlace={};
    let total=0;
    (distribution||[]).forEach(r=>{
      const n=Number(r.count)||0;
      const p=r.place||"Sin lugar";
      byPlace[p]=(byPlace[p]||0)+n;
      total+=n;
    });
    return {byPlace,total};
  }

  function introParagraphs(ctx){
    const t=totals(ctx.distribution);
    const places=Object.keys(t.byPlace).join(", ");
    const p=lowerPeriod(ctx.period.name);
    return [
      "El examen complexivo constituye una modalidad de evaluación integral orientada a verificar que el estudiante articule los conocimientos, habilidades y competencias desarrollados durante su trayectoria académica y pueda aplicarlos de manera pertinente en situaciones vinculadas con su perfil de egreso. Su planificación requiere coordinar componentes académicos, administrativos, tecnológicos y logísticos, de modo que la evaluación se ejecute bajo criterios comunes, con trazabilidad documental y con condiciones equivalentes para los participantes.",
      "La presente planificación corresponde al período "+p+" y organiza el proceso desde el cierre de las actividades académicas y la verificación de requisitos hasta el desarrollo de los núcleos de preparación, la aplicación del examen complexivo, el registro de resultados y la eventual instancia de supletorio. El documento funciona como marco general de actuación y se complementa con cronogramas operativos específicos para cada fase.",
      "La planificación se sustenta en un enfoque teórico-práctico. El componente teórico permite valorar conocimientos esenciales y capacidad de análisis, mientras que el componente práctico busca evidenciar la aplicación de saberes frente a problemas, casos o situaciones propias del campo profesional. Esta integración permite que la evaluación no se limite a la reproducción de contenidos, sino que observe la capacidad del estudiante para argumentar, resolver y tomar decisiones de manera fundamentada.",
      "La organización del período considera además la distribución real de estudiantes. Para esta planificación se registran "+t.total+" estudiantes, distribuidos entre "+places+". Esta información permite dimensionar la demanda operativa, prever espacios, organizar jornadas y articular la participación de las carreras sin alterar los nombres oficiales registrados para cada grupo.",
      "El alcance del documento comprende la metodología del proceso, las responsabilidades institucionales, los requisitos de titulación, la preparación mediante seminarios o núcleos, la descripción de los componentes del examen, la distribución de estudiantes, los criterios para la asignación de recursos, la gestión de imponderables, los criterios de evaluación y el cierre del proceso. Cada apartado se relaciona con los demás para asegurar una ejecución ordenada y verificable.",
      "La coordinación entre la Unidad de Titulación y Eficiencia Terminal, las coordinaciones de carrera, Secretaría Académica, las unidades de apoyo y los docentes evaluadores es indispensable para mantener la continuidad del proceso. La planificación establece responsabilidades diferenciadas y evita que las decisiones operativas se adopten de manera aislada, particularmente en aspectos como la validación de requisitos, el uso de plataformas, la logística de espacios, la evaluación y el registro de calificaciones.",
      "Asimismo, se consideran criterios de inclusión, accesibilidad y contingencia. La institución debe prever mecanismos de atención frente a situaciones justificadas que puedan afectar la participación del estudiante o la ejecución de una jornada, procurando que cualquier ajuste conserve los principios académicos del proceso y quede debidamente documentado.",
      "En consecuencia, esta planificación se concibe como un instrumento de gestión académica y de control del proceso de titulación. Su finalidad no es únicamente establecer fechas, sino integrar las condiciones, responsables, recursos y criterios necesarios para que el examen complexivo se desarrolle de forma coherente, transparente y alineada con el perfil profesional de cada carrera."
    ];
  }

  function legalParagraphs(ctx){
    const p=lowerPeriod(ctx.period.name);
    return [
      "La planificación del examen complexivo para el período "+p+" se enmarca en la normativa nacional de educación superior y en la regulación institucional aplicable al proceso de titulación. La base legal permite vincular la planificación operativa con los derechos del estudiante, las finalidades del sistema de educación superior y las obligaciones institucionales relacionadas con evaluación, egreso, titulación y registro de títulos.",
      "La Constitución de la República del Ecuador constituye el marco superior de referencia para el sistema educativo y para las finalidades de la educación superior. Estos principios orientan la organización de procesos académicos que deben asegurar calidad, pertinencia, igualdad de oportunidades y formación integral.",
      "La Ley Orgánica de Educación Superior reconoce los derechos de los estudiantes y regula las responsabilidades de las instituciones de educación superior respecto del acceso, permanencia, egreso y titulación. Para el examen complexivo, esto exige condiciones previamente definidas, verificables y aplicadas de manera consistente.",
      "El Reglamento a la Ley Orgánica de Educación Superior fue expedido por la Presidencia de la República mediante Decreto Ejecutivo No. 494 y publicado en el Suplemento del Registro Oficial No. 110 de 21 de julio de 2022. Su aplicación refuerza la necesidad de mantener trazabilidad sobre información académica, egreso, titulación y registro de títulos.",
      "En el ámbito institucional, el Reglamento del Área de Titulación establece la finalidad y alcance del proceso y orienta la titulación hacia la validación integral de competencias adquiridas durante la formación profesional y su relación con el perfil de egreso.",
      "La planificación adopta una evaluación teórico-práctica y articula requisitos, preparación académica, aplicación del examen, registro de resultados, atención de contingencias y cierre documental. Las disposiciones complementarias que se apliquen durante el período deberán observar la normativa vigente al momento de su ejecución."
    ];
  }

  function resizeImage(file,maxW=1200,maxH=500){
    return new Promise((resolve,reject)=>{
      if(!file){resolve(null);return;}
      if(!/^image\//.test(file.type)){reject(new Error("Selecciona un archivo de imagen."));return;}
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error("No se pudo leer la imagen."));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error("La imagen no es válida."));
        img.onload=()=>{
          const scale=Math.min(1,maxW/img.width,maxH/img.height);
          const w=Math.max(1,Math.round(img.width*scale));
          const h=Math.max(1,Math.round(img.height*scale));
          const canvas=document.createElement("canvas");
          canvas.width=w; canvas.height=h;
          canvas.getContext("2d").drawImage(img,0,0,w,h);
          const type=file.type==="image/png"?"image/png":"image/jpeg";
          resolve(canvas.toDataURL(type,type==="image/jpeg"?0.9:undefined));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function generateAndDownload(ctx,filename){
    if(!window.jspdf || !window.jspdf.jsPDF) throw new Error("No se pudo cargar el generador PDF.");
    const { jsPDF }=window.jspdf;
    const doc=new jsPDF({unit:"pt",format:"a4",compress:true,putOnlyUsedFonts:true});
    doc.setProperties({
      title:"Planificación De Examen Complexivo",
      subject:ctx.period.name,
      author:"Unidad de Titulación y Eficiencia Terminal",
      keywords:"titulación, examen complexivo, planificación, DOC-TIT v15"
    });

    const pageW=doc.internal.pageSize.getWidth();
    const pageH=doc.internal.pageSize.getHeight();
    const bodyW=pageW-BODY.left-BODY.right;
    let y=BODY.top;
    const toc=[];
    const headerDrawn=new Set();
    const analysisInjected=new Set();
    let tableCounter=0;
    let figureCounter=0;

    function drawHeader(pageNo){
      if(headerDrawn.has(pageNo)) return;
      headerDrawn.add(pageNo);
      doc.setPage(pageNo);

      const x=36, top=22, totalW=pageW-72, h=58;
      const logoW=125, codeW=160, centerW=totalW-logoW-codeW;

      doc.setDrawColor(0);
      doc.setLineWidth(0.8);
      doc.rect(x,top,totalW,h);
      doc.line(x+logoW,top,x+logoW,top+h);
      doc.line(x+logoW+centerW,top,x+logoW+centerW,top+h);
      doc.line(x+logoW,top+h/2,x+logoW+centerW,top+h/2);

      if(ctx.assets && ctx.assets.logo){
        try{
          doc.addImage(ctx.assets.logo,imageFormat(ctx.assets.logo),x+6,top+6,logoW-12,h-12,undefined,"FAST");
        }catch(e){}
      }else{
        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("LOGO INSTITUCIONAL",x+logoW/2,top+h/2,{align:"center"});
      }

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.text("UNIDAD DE TITULACIÓN Y EFICIENCIA TERMINAL",x+logoW+centerW/2,top+18,{align:"center"});

      doc.setFont("helvetica","bold");
      doc.setFontSize(9);
      doc.text("Planificación De Examen Complexivo",x+logoW+centerW/2,top+h/2+10,{align:"center"});

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.text(ctx.period.name,x+logoW+centerW/2,top+h/2+22,{align:"center"});

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.text("Código:",x+logoW+centerW+codeW/2,top+17,{align:"center"});

      doc.setFont("helvetica","bold");
      doc.setFontSize(9);
      const codeLines=doc.splitTextToSize(ctx.code,codeW-12);
      doc.text(codeLines,x+logoW+centerW+codeW/2,top+31,{align:"center"});
    }

    function newPage(){
      doc.addPage();
      y=BODY.top;
      drawHeader(doc.getNumberOfPages());

      // La cabecera usa Helvetica; el cuerpo académico siempre vuelve a Times 12.
      doc.setFont("times","normal");
      doc.setFontSize(BODY.fontSize);
    }

    drawHeader(1);

    function ensureSpace(height){
      if(y+height>pageH-BODY.bottom) newPage();
    }

    function wrapWords(text,firstWidth,otherWidth){
      const words=clean(text).split(" ");
      const lines=[];
      let line="";
      let available=firstWidth;
      words.forEach(word=>{
        const candidate=line?line+" "+word:word;
        if(doc.getTextWidth(candidate)<=available){
          line=candidate;
        }else{
          if(line) lines.push(line);
          line=word;
          available=otherWidth;
        }
      });
      if(line) lines.push(line);
      return lines;
    }

    function paragraph(text,opts={}){
      const size=opts.fontSize||BODY.fontSize;
      const indent=opts.indent===false?0:BODY.paragraphIndent;
      const hanging=opts.hanging||0;
      const lineHeight=opts.lineHeight||BODY.lineHeight;
      const style=opts.bold?"bold":opts.italic?"italic":"normal";

      doc.setFont("times",style);
      doc.setFontSize(size);

      const firstW=bodyW-indent;
      const otherW=bodyW-hanging;
      const lines=wrapWords(text,firstW,otherW);

      lines.forEach((line,i)=>{
        const previousPage=doc.getNumberOfPages();
        ensureSpace(lineHeight);

        // Si ensureSpace creó una nueva página, la cabecera cambió temporalmente la fuente.
        doc.setFont("times",style);
        doc.setFontSize(size);

        const x=BODY.left+(i===0?indent:hanging);
        doc.text(line,x,y);
        y+=lineHeight;
      });

      y+=opts.after==null?8:opts.after;
    }

    function bullet(text){
      const raw=clean(text).replace(/^•\s*/,"");
      const indent=24, bulletX=BODY.left+8, textX=BODY.left+indent;

      doc.setFont("times","normal");
      doc.setFontSize(12);
      const lines=wrapWords(raw,bodyW-indent,bodyW-indent);

      lines.forEach((line,i)=>{
        ensureSpace(BODY.lineHeight);

        doc.setFont("times","normal");
        doc.setFontSize(12);

        if(i===0) doc.text("•",bulletX,y);
        doc.text(line,textX,y);
        y+=BODY.lineHeight;
      });
      y+=6;
    }

    function heading(text,level=1,includeToc=true){
      const style=level===3?"bolditalic":"bold";
      const size=level===1?14:level===2?13:12.5;
      const cleaned=clean(text);

      // Regla editorial: todo título de primer nivel inicia una página nueva.
      if(level===1 && y>BODY.top+2) newPage();

      doc.setFont("times",style);
      doc.setFontSize(size);

      const lines=doc.splitTextToSize(cleaned,bodyW);
      const titleHeight=lines.length*22+10;

      // Nunca dejar un título huérfano: reservar el título + al menos dos líneas de contenido.
      ensureSpace(titleHeight+(BODY.lineHeight*2)+12);

      if(includeToc) toc.push({title:cleaned,level,page:doc.getNumberOfPages()});

      doc.setFont("times",style);
      doc.setFontSize(size);
      doc.text(lines,BODY.left,y,{align:"left"});
      y+=lines.length*22+10;

      const key=smartSectionKey(text);
      if(key && !analysisInjected.has(key)){
        analysisInjected.add(key);
        getAnalysisSentences(ctx,key).forEach(s=>paragraph(s));
      }
    }

    function label(text){
      ensureSpace(32+(BODY.lineHeight*2));
      doc.setFont("times","bold"); doc.setFontSize(12);
      doc.text(clean(text),BODY.left,y);
      y+=BODY.lineHeight;
    }

    function reference(text){
      const hanging=36;

      doc.setFont("times","normal");
      doc.setFontSize(12);
      const lines=wrapWords(text,bodyW,bodyW-hanging);

      lines.forEach((line,i)=>{
        ensureSpace(BODY.lineHeight);

        doc.setFont("times","normal");
        doc.setFontSize(12);

        doc.text(line,BODY.left+(i===0?0:hanging),y);
        y+=BODY.lineHeight;
      });
      y+=4;
    }

    function tableCaption(title){
      ensureSpace(54);
      tableCounter+=1;
      doc.setFont("times","bold");
      doc.setFontSize(11);
      doc.text("Tabla "+tableCounter,BODY.left,y);
      y+=17;
      doc.setFont("times","italic");
      doc.setFontSize(11);
      doc.text(doc.splitTextToSize(title,bodyW),BODY.left,y);
      y+=24;
      return tableCounter;
    }

    function tableNote(note){
      ensureSpace(34);
      doc.setFont("times","italic");
      doc.setFontSize(10);
      const lines=doc.splitTextToSize("Nota. "+note,bodyW);
      doc.text(lines,BODY.left,y);
      y+=lines.length*15+18;
    }

    function autoTable(options){
      if(typeof doc.autoTable!=="function") throw new Error("No se pudo cargar el módulo de tablas del PDF.");

      const userDidDrawPage=options.didDrawPage;
      const userDidDrawCell=options.didDrawCell;

      options.theme="plain";
      options.styles={font:"times",fontSize:10,cellPadding:{top:5,right:6,bottom:5,left:6},textColor:0,lineWidth:0,overflow:"linebreak",valign:"top",...((options.styles)||{})};
      options.headStyles={font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0,lineWidth:0,halign:"left",...((options.headStyles)||{})};
      options.showHead="everyPage";

      options.didDrawPage=(data)=>{
        drawHeader(doc.getNumberOfPages());
        if(userDidDrawPage) userDidDrawPage(data);
      };

      options.didDrawCell=(data)=>{
        const left=data.table.settings.margin.left;
        const right=pageW-data.table.settings.margin.right;

        // APA 7: only top rule, header-bottom rule and final bottom rule.
        if(data.section==="head" && data.column.index===0){
          doc.setDrawColor(0);
          doc.setLineWidth(0.8);
          doc.line(left,data.cell.y,right,data.cell.y);
          doc.setLineWidth(0.45);
          doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);
        }

        if(data.section==="body" && data.row.index===data.table.body.length-1 && data.column.index===0){
          doc.setDrawColor(0);
          doc.setLineWidth(0.8);
          doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);
        }

        if(userDidDrawCell) userDidDrawCell(data);
      };

      doc.autoTable(options);
      y=doc.lastAutoTable.finalY+12;
    }

    function scheduleTable(){
      heading("3.10. Cronogramas",2,true);
      paragraph("El cronograma general organiza las fechas de las principales fases del examen complexivo y constituye la referencia temporal para los documentos operativos complementarios.");

      ensureSpace(190);
      tableCaption("Cronograma general del proceso de examen complexivo");

      autoTable({
        startY:y,
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Actividad","Fecha inicio","Fecha fin"]],
        body:(ctx.schedule||[]).map(r=>[r.activity,formatDateShort(r.start),formatDateShort(r.end)]),
        styles:{font:"times",fontSize:10,cellPadding:5,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });

      tableNote("Elaboración propia con base en la planificación académica del período.");
      paragraph("Los cronogramas complementarios de desarrollo de núcleos y de rendición del examen detallarán, cuando corresponda, la distribución por carrera, lugar, fecha, hora, laboratorio y responsables, sin sustituir la planificación general del período.");
    }

    function distributionTables(){
      heading("7. Distribución de estudiantes por carrera y lugar de ejecución",1,true);
      paragraph("La distribución del período se determina a partir de la cantidad de estudiantes registrada por carrera y del lugar previsto para la ejecución del proceso. Los nombres de las carreras se conservan exactamente como constan en el registro institucional.");

      ensureSpace(190);
      tableCaption("Distribución de estudiantes por carrera y lugar de ejecución");

      autoTable({
        startY:y,
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Carrera","Lugar","Cantidad"]],
        body:(ctx.distribution||[]).map(r=>[r.career,r.place,String(Number(r.count)||0)]),
        columnStyles:{0:{cellWidth:bodyW*0.68},1:{cellWidth:bodyW*0.20},2:{cellWidth:bodyW*0.12,halign:"right"}},
        styles:{font:"times",fontSize:10,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });

      tableNote("Elaboración propia con base en la distribución registrada para el período.");

      const t=totals(ctx.distribution);
      const summary=Object.entries(t.byPlace).map(([p,n])=>p+": "+n).join(" · ");
      paragraph("Resumen de distribución: "+summary+". Total general: "+t.total+" estudiantes.",{indent:false,bold:true,lineHeight:20});
    }

    function signatureBlock(fixedTop=null){
      const x=36;
      const w=pageW-72;
      const col=w/3;
      const titleAndSignH=112;
      const nameH=34;
      const roleH=48;
      const totalH=titleAndSignH+nameH+roleH;

      if(fixedTop==null){
        ensureSpace(totalH+24);
        y+=8;
      }
      const top=fixedTop==null?y:fixedTop;

      doc.setDrawColor(0);
      doc.setLineWidth(0.7);

      for(let i=0;i<3;i++){
        const cx=x+i*col;
        doc.rect(cx,top,col,totalH);

        // No separator below ELABORADO/REVISADO/APROBADO.
        // The first horizontal rule appears only before NOMBRE.
        doc.line(cx,top+titleAndSignH,cx+col,top+titleAndSignH);
        doc.line(cx,top+titleAndSignH+nameH,cx+col,top+titleAndSignH+nameH);
      }

      const cells=[
        {title:"ELABORADO POR:",name:ctx.institutional?.preparedBy||"Msg. Jefferson Villarreal",role:ctx.institutional?.preparedRole||"COORDINADOR DE CARRERAS"},
        {title:"REVISADO POR:",name:ctx.institutional?.reviewedBy||"Mgde. Martha Tomalá",role:ctx.institutional?.reviewedRole||"COORDINADORA GENERAL DE CARRERAS"},
        {title:"APROBADO POR:",name:ctx.institutional?.approvedBy||"Mgt. Alex León",role:ctx.institutional?.approvedRole||"VICERRECTOR"}
      ];

      cells.forEach((cell,i)=>{
        const cx=x+i*col;

        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        doc.text(cell.title,cx+7,top+17);

        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("NOMBRE:",cx+7,top+titleAndSignH+20);

        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        const nameX=cx+55;
        const nameLines=doc.splitTextToSize(cell.name,col-62);
        doc.text(nameLines,nameX,top+titleAndSignH+20);

        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("CARGO:",cx+7,top+titleAndSignH+nameH+18);

        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        const roleLines=doc.splitTextToSize(cell.role,col-14);
        doc.text(roleLines,cx+7,top+titleAndSignH+nameH+33);
      });

      if(fixedTop==null) y=top+totalH+12;
      return totalH;
    }

    function cover(){
      const signatureTotalH=112+34+48;
      const signatureTop=pageH-52-signatureTotalH;
      const contentTop=112;
      const contentBottom=signatureTop-42;
      const visualCenter=(contentTop+contentBottom)/2;

      doc.setFont("helvetica","bold");
      doc.setFontSize(23);
      const titleLines=doc.splitTextToSize("Planificación De Examen Complexivo",pageW-120);
      const titleY=visualCenter-(titleLines.length*28)/2-18;
      doc.text(titleLines,pageW/2,titleY,{align:"center"});

      doc.setFont("helvetica","bold");
      doc.setFontSize(17);
      doc.text(ctx.period.name,pageW/2,titleY+titleLines.length*28+32,{align:"center"});

      signatureBlock(signatureTop);
    }

    function reserveIndexPages(){
      newPage();
      newPage();
      // La introducción debe iniciar en una página nueva, nunca sobre el índice.
      newPage();
    }

    function introAndLegal(){
      heading("1. Introducción",1,true);
      const intro=introParagraphs(ctx);
      intro.slice(0,3).forEach(p=>paragraph(p));
      insertSectionImage("introImage");
      intro.slice(3).forEach(p=>paragraph(p));
      getAnalysisSentences(ctx,"general").forEach(p=>paragraph(p));

      heading("2. Base Legal",1,true);
      legalParagraphs(ctx).forEach(p=>paragraph(p));
    }

    function methodologySection(){
      heading("3. Metodología",1,true);

      paragraph(
        "La metodología del examen complexivo organiza el proceso de manera secuencial y verificable, desde la habilitación del estudiante hasta el registro final de resultados. La aplicación es individual y se desarrolla principalmente mediante recursos informáticos, de acuerdo con los instrumentos definidos para cada carrera.",
        {indent:false,after:10}
      );
      insertSectionImage("methodologyImage");

      heading("3.1. Enfoque Metodológico",2,true);
      paragraph("El proceso integra planificación, preparación académica, aplicación, evaluación y mejora continua. Cada fase se vincula con responsables, evidencias y fechas del período para asegurar trazabilidad.");

      heading("3.2. Fase de Inducción al Proceso",2,true);
      paragraph("La inducción comunica a los estudiantes el alcance del examen complexivo, los requisitos de habilitación, la estructura de los componentes teórico y práctico, el cronograma y las condiciones de aplicación.");

      heading("3.3. Fase de Diseño del Examen Complexivo",2,true);
      paragraph("Los instrumentos se diseñan con base en el perfil de egreso y en los contenidos priorizados por cada carrera. El componente práctico debe resolverse individualmente en equipo informático mediante caso, ejercicio, simulación, desarrollo o resolución técnica, según corresponda.");

      heading("3.4. Fase de Organización y Distribución",2,true);
      paragraph("La organización considera cantidad de estudiantes, lugar de ejecución, disponibilidad de equipos, conectividad, software requerido y soporte tecnológico.");

      heading("3.5. Fase de Preparación: Núcleos de Titulación",2,true);
      paragraph("La preparación se desarrolla mediante cuatro núcleos temáticos articulados por la asignatura de Integración Curricular o Titulación. Las sesiones se realizan en jornada nocturna, de forma presencial, y quedan grabadas como recurso de consulta.");

      heading("3.6. Fase de Aplicación del Examen Complexivo",2,true);
      paragraph("La aplicación se realiza de forma individual. Cada estudiante utiliza un equipo informático y desarrolla los instrumentos definidos para el componente teórico y práctico bajo condiciones de control, identificación y registro.");

      heading("3.7. Fase de Evaluación y Retroalimentación",2,true);
      paragraph("Los resultados se valoran mediante criterios previamente establecidos y se registran en los sistemas institucionales. Cuando corresponda, se habilita la instancia de supletorio conforme al cronograma.");

      heading("3.8. Coordinación y Mejora Continua",2,true);
      paragraph("Las incidencias, resultados y observaciones del período se utilizan como insumo para mejorar instrumentos, logística y coordinación de períodos posteriores.");

      responsibilitiesTable();
      scheduleTable();
    }

    function requirementsSection(){
      heading("4. Requisitos para Titulación",1,true);

      paragraph(
        "La habilitación para el examen complexivo se verifica mediante una matriz ejecutiva de requisitos. El estudiante debe cumplir todos los requisitos institucionales aplicables a su carrera, excepto el módulo, asignatura o requisito identificado específicamente como «Titulación», debido a que forma parte del proceso que se encuentra en ejecución.",
        {indent:false,after:10}
      );
      insertSectionImage("requirementsImage");

      ensureSpace(210);
      tableCaption("Matriz de requisitos para habilitación al examen complexivo");
      autoTable({
        startY:y,
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Requisito","Responsable de validación","Evidencia","Condición"]],
        body:[
          ["Cumplimiento académico de la malla aplicable","Secretaría Académica / Coordinación de Carrera","Registro académico institucional","Cumplido, excepto el requisito denominado específicamente «Titulación»"],
          ["Documentación habilitante","Secretaría Académica","Expediente o registro documental","Completo y vigente"],
          ["Obligaciones financieras aplicables","Unidad de Recaudación y Cartera","Estado financiero institucional","Sin pendientes que impidan la habilitación"],
          ["Vinculación con la sociedad","Unidad responsable / Coordinación de Carrera","Registro o certificación institucional","Cumplido según el plan de estudios aplicable"],
          ["Prácticas preprofesionales","Unidad responsable / Coordinación de Carrera","Registro o certificación institucional","Cumplido según el plan de estudios aplicable"],
          ["Lengua extranjera","Unidad o instancia responsable","Registro institucional","Cumplido según el requisito vigente de la carrera"],
          ["Actualización de datos","Secretaría Académica / sistema institucional","Registro actualizado","Completo"]
        ],
        columnStyles:{
          0:{cellWidth:bodyW*0.24},
          1:{cellWidth:bodyW*0.25},
          2:{cellWidth:bodyW*0.23},
          3:{cellWidth:bodyW*0.28}
        },
        styles:{font:"times",fontSize:8.8,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La condición específica de cada requisito debe verificarse con la normativa y los registros institucionales vigentes del período.");

      paragraph("La modalidad académica de la carrera —presencial, en línea u otra autorizada— no determina por sí sola la modalidad de aplicación del examen complexivo. La rendición se planifica presencialmente para todos los estudiantes; cualquier aplicación virtual requiere justificación y autorización institucional expresa.");
    }

    function examDescriptionSection(){
      heading("5. Descripción del Examen Complexivo",1,true);

      paragraph(
        "El examen complexivo es una evaluación individual realizada en equipo informático. Integra un componente teórico y un componente práctico diseñados para comprobar conocimientos, análisis y aplicación técnica de acuerdo con el perfil de egreso de cada carrera.",
        {indent:false,after:10}
      );
      insertSectionImage("examImage");

      heading("5.1. Componente Teórico",2,true);
      paragraph("El componente teórico representa el 40% de la nota final. Se desarrolla individualmente en computador mediante un instrumento estructurado de preguntas. La planificación contempla 40 preguntas y un tiempo máximo de 1 hora y 30 minutos.");

      heading("5.2. Componente Práctico",2,true);
      paragraph("El componente práctico representa el 60% de la nota final y se resuelve individualmente en equipo informático. Según la carrera, puede consistir en un caso, ejercicio, simulación, desarrollo, configuración, análisis o resolución técnica.");
      paragraph("Como regla general, el componente práctico no contempla defensa oral ante tribunal. Si una carrera requiere una actividad adicional de exposición o sustentación, esta deberá constar expresamente en el instrumento específico aprobado para esa carrera y no se asumirá como condición general del examen complexivo.");

      heading("5.3. Condiciones de Aplicación",2,true);
      paragraph("La aplicación debe asegurar identificación del estudiante, disponibilidad del equipo y software requerido, control del tiempo, respaldo de evidencias y trazabilidad del resultado.");
    }

    function seminarsSection(){
      heading("6. Seminarios de Titulación",1,true);

      paragraph(
        "La preparación académica se organiza en cuatro núcleos temáticos. La asignatura de Integración Curricular o Titulación aglutina directamente estos núcleos y articula su desarrollo, seguimiento y evaluación. Los núcleos se desarrollan en jornada nocturna; las sesiones presenciales quedan grabadas para consulta de los estudiantes.",
        {indent:false,after:10}
      );
      insertSectionImage("seminarsImage");

      const nucleusRows=(ctx.schedule||[])
        .filter(r=>/^Núcleo\s+[1-4]$/i.test(r.activity||""))
        .map(r=>{
          const start=new Date(r.start+"T12:00:00");
          const end=new Date(r.end+"T12:00:00");
          const days=(r.start&&r.end)?Math.max(1,Math.round((end-start)/86400000)+1):"";
          return [r.activity,formatDateShort(r.start),formatDateShort(r.end),String(days),"Nocturna · presencial · grabada"];
        });

      if(nucleusRows.length){
        ensureSpace(180);
        tableCaption("Ventana programada para los cuatro núcleos");
        autoTable({
          startY:y,
          margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
          head:[["Núcleo","Inicio","Fin","Días calendario","Condición"]],
          body:nucleusRows,
          columnStyles:{
            0:{cellWidth:bodyW*0.14},
            1:{cellWidth:bodyW*0.16},
            2:{cellWidth:bodyW*0.16},
            3:{cellWidth:bodyW*0.16,halign:"center"},
            4:{cellWidth:bodyW*0.38}
          },
          styles:{font:"times",fontSize:9,cellPadding:4,textColor:0},
          headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
        });
        tableNote("La duración operativa de cada núcleo se rige exclusivamente por la ventana definida en el cronograma del período.");
      }

      heading("6.1. Organización Académica",2,true);
      paragraph("Los contenidos de cada núcleo se definen de acuerdo con las competencias y áreas prioritarias de las carreras. La preparación busca reforzar conocimientos y familiarizar al estudiante con la lógica de resolución individual que se utilizará en el examen.");
    }

    function imponderablesSection(){
      heading("9. Imponderables",1,true);

      paragraph(
        "La planificación contempla mecanismos de respuesta frente a incidencias que puedan afectar la aplicación del examen complexivo, procurando continuidad, equidad y trazabilidad documental.",
        {indent:false,after:10}
      );

      bullet("• Fallas de equipo, conectividad o software: activar soporte tecnológico, reemplazo de equipo o mecanismo de respaldo según disponibilidad.");
      bullet("• Interrupciones institucionales o de infraestructura: documentar la incidencia y reprogramar cuando corresponda.");
      bullet("• Inasistencia justificada del estudiante: aplicar el procedimiento institucional vigente y conservar el respaldo de la justificación.");
      bullet("• Ausencia de personal responsable: activar la sustitución o contingencia definida por la coordinación.");
      bullet("• Toda incidencia relevante debe quedar registrada para efectos de seguimiento y mejora continua.");
    }

    function responsibilitiesTable(){
      heading("3.9. Responsables por Fase del Proceso",2,true);
      paragraph("La correcta ejecución del examen complexivo requiere una asignación clara de responsabilidades para cada fase del proceso. La siguiente tabla organiza la información institucional de la planificación base y evita que los responsables aparezcan como texto corrido.");

      ensureSpace(190);
      tableCaption("Responsables institucionales por fase del proceso");
      autoTable({
        startY:y,
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Fase del proceso","Responsable institucional"]],
        body:[
          ["Diseño metodológico y estructura del examen","Coordinación de Titulación y Coordinaciones de Carrera"],
          ["Validación académica de los componentes del examen","Coordinaciones de Carrera"],
          ["Socialización del proceso con estudiantes","Coordinación de Titulación y Coordinaciones de Carrera"],
          ["Revisión de requisitos académicos y documentales","Secretaría Académica y Coordinación de Titulación"],
          ["Control de pagos y obligaciones financieras","Unidad de Recaudación y Cartera"],
          ["Validación de vinculación y prácticas preprofesionales","Coordinaciones de Carrera y unidades responsables de Vinculación y Prácticas Preprofesionales"],
          ["Inscripción al proceso y uso de plataformas","Unidad de Sistemas (SISACAD)"],
          ["Organización logística y distribución por lugar","Coordinación de Titulación y Coordinaciones de Carrera"],
          ["Asignación de docentes evaluadores y supervisores","Coordinación de Titulación"],
          ["Ejecución de seminarios de titulación","Docentes designados por cada carrera"],
          ["Supervisión de las jornadas del examen","Coordinación de Titulación, Coordinaciones de Carrera y docentes responsables"],
          ["Evaluación y calificación del examen","Colectivo docente"],
          ["Registro de calificaciones y resultados","Coordinaciones de Carrera y Unidad de Sistemas"],
          ["Retroalimentación a estudiantes","Docentes evaluadores y Coordinación de Titulación"],
          ["Revisión post-proceso y mejora continua","Coordinación de Titulación y Coordinación General de Carreras"],
          ["Registro del título en SENESCYT","Coordinación General de Carreras"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.52},1:{cellWidth:bodyW*0.48}},
        styles:{font:"times",fontSize:9.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Organización elaborada a partir de la planificación institucional base.");
    }

    function financialScheduleSection(){
      heading("4.3.1. Cronograma de Pagos del Proceso de Titulación",3,true);
      paragraph("El proceso de titulación contempla pagos escalonados destinados a cubrir los costos administrativos y operativos asociados. La planificación base organiza estas obligaciones por cuotas y momentos de pago, sin establecer en este documento montos específicos.");

      ensureSpace(190);
      tableCaption("Cronograma referencial de pagos del proceso de titulación");
      autoTable({
        startY:y,
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Cuota","Descripción","Momento de pago"]],
        body:[
          ["Primera cuota","Pago inicial para la inscripción en el proceso de titulación","Fecha estipulada en el cronograma"],
          ["Segunda cuota","Cubre costos operativos del segundo mes del proceso","Segundo mes"],
          ["Tercera cuota","Gastos de seguimiento y apoyo académico","Tercer mes"],
          ["Cuarta cuota","Acceso a recursos y servicios institucionales","Cuarto mes"],
          ["Quinta cuota","Pago final para completar las obligaciones financieras","Cierre del proceso de titulación"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.20},1:{cellWidth:bodyW*0.52},2:{cellWidth:bodyW*0.28}},
        styles:{font:"times",fontSize:9.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("El cuadro reproduce la estructura del cronograma financiero de la planificación base; los valores y fechas específicas deben sujetarse a la información institucional vigente.");

      paragraph("Cada cuota debe cancelarse dentro de los plazos institucionales aplicables. El cumplimiento financiero forma parte de las verificaciones previas del proceso de titulación.");
    }

    function laboratoriesSection(){
      const t=totals(ctx.distribution);
      const places=Object.keys(t.byPlace);
      heading("8. Asignación de Laboratorios y Capacidad",1,true);

      paragraph("La asignación de espacios para el período "+lowerPeriod(ctx.period.name)+" se realizará considerando la cantidad de estudiantes por carrera, los requerimientos técnicos o de software y la disponibilidad institucional. De acuerdo con la distribución registrada, la planificación contempla los siguientes lugares de ejecución: "+places.join(", ")+".");
      paragraph("La asignación de laboratorios no se define con un número fijo dentro de esta planificación general. El detalle de laboratorio, jornada, fecha, hora y responsables debe establecerse en el cronograma operativo correspondiente.");

      bullet("• La distribución de espacios se determina principalmente por la cantidad de estudiantes de cada grupo y por los requerimientos técnicos de la carrera.");
      bullet("• Las asignaciones se establecen desde el inicio del proceso y únicamente se modifican cuando exista una necesidad justificada y validada por la coordinación.");
      bullet("• Cuando existan necesidades específicas de accesibilidad, se deben asignar espacios que permitan la participación del estudiante en condiciones adecuadas.");
      bullet("• La rendición se planifica de forma presencial para las modalidades contempladas por la institución. Los casos excepcionales de rendición virtual requieren solicitud formal, justificación y autorización institucional.");
      bullet("• Antes de cada jornada deben realizarse pruebas técnicas y verificaciones de conectividad, equipos y software.");
      bullet("• Se prevé soporte tecnológico durante las jornadas y mecanismos de respaldo de las evidencias generadas.");
      bullet("• El personal docente supervisa el cumplimiento de tiempos, normas y protocolos y apoya la resolución de incidencias logísticas o técnicas menores.");
    }

    function evaluationCriteriaSection(){
      heading("10. Criterios de Evaluación",1,true);

      paragraph(
        "La evaluación del examen complexivo integra dos componentes individuales: teórico y práctico. Ambos se aplican mediante equipo informático y se valoran con criterios previamente definidos para obtener la nota final.",
        {indent:false,after:10}
      );
      insertSectionImage("evaluationImage");

      heading("10.1. Componente Teórico",2,true);
      paragraph("El componente teórico representa el 40% de la nota final. Evalúa conocimientos fundamentales, comprensión y capacidad de análisis mediante un instrumento estructurado de 40 preguntas, con un tiempo máximo de 1 hora y 30 minutos.");
      paragraph("La calificación se obtiene a partir de las respuestas registradas individualmente y debe conservar trazabilidad con el instrumento aplicado.");

      heading("10.2. Componente Práctico",2,true);
      paragraph("El componente práctico representa el 60% de la nota final. Se desarrolla individualmente en computador mediante un caso, ejercicio, simulación, desarrollo, configuración, análisis o resolución técnica, de acuerdo con la naturaleza de la carrera.");
      paragraph("Los criterios de valoración consideran exactitud o calidad técnica, aplicación pertinente de conocimientos, capacidad de análisis, resolución del problema, uso adecuado de herramientas y cumplimiento de los requerimientos establecidos en el instrumento.");
      paragraph("No se contempla una defensa oral ante tribunal como regla general del examen complexivo. Cualquier excepción deberá estar expresamente definida y aprobada para la carrera correspondiente.");

      heading("10.3. Nota Final del Examen Complexivo",2,true);
      paragraph("La nota final se calcula con una ponderación de 40% para el componente teórico y 60% para el componente práctico. La planificación base establece 7/10 como calificación mínima de aprobación.");
      paragraph("El resultado final debe registrarse en los sistemas institucionales y vincularse con las evidencias de aplicación y evaluación.");
    }

    function summarySection(){
      const t=totals(ctx.distribution);
      const places=Object.entries(t.byPlace);
      const schedule=ctx.schedule||[];
      const exam=schedule.find(r=>normalize(r.activity).includes("examen complexivo"));
      const supplementary=schedule.find(r=>normalize(r.activity).includes("supletorio"));

      heading("Resumen Ejecutivo",1,true);

      paragraph(
        "La planificación organiza la preparación y aplicación individual del examen complexivo del período "+lowerPeriod(ctx.period.name)+", con ejecución en equipo informático y articulación de requisitos, núcleos de preparación, logística, evaluación y registro de resultados.",
        {indent:false,after:10}
      );

      bullet("• Estudiantes planificados: "+t.total+".");
      bullet("• Lugares de ejecución: "+places.map(([p,n])=>p+" ("+n+")").join(", ")+".");
      if(exam) bullet("• Examen complexivo: "+formatDateShort(exam.start)+(exam.end&&exam.end!==exam.start?" al "+formatDateShort(exam.end):"")+".");
      if(supplementary) bullet("• Supletorio: "+formatDateShort(supplementary.start)+(supplementary.end&&supplementary.end!==supplementary.start?" al "+formatDateShort(supplementary.end):"")+".");
      bullet("• Preparación: cuatro núcleos articulados por Integración Curricular o Titulación, en jornada nocturna; las sesiones presenciales quedan grabadas.");
      bullet("• Evaluación: componente teórico 40% y componente práctico 60%, ambos de carácter individual.");
      bullet("• Modalidad de aplicación: presencial como regla general; la virtualidad requiere autorización institucional excepcional.");
    }

    function referencesSection(){
      heading("11. Bibliografía",1,true);
      paragraph("Las referencias normativas e institucionales se presentan en formato APA 7 con sangría francesa.",{indent:false});

      [
        "Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador.",
        "Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior.",
        "Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494, Suplemento del Registro Oficial No. 110, 21 de julio de 2022).",
        "Instituto Tecnológico Superior Quito Metropolitano. (2022). Reglamento del Área de Titulación del ITSQMET."
      ].forEach(reference);
    }

    const insertedSectionImages=new Set();

    function insertSectionImage(assetKey){
      if(insertedSectionImages.has(assetKey)) return;
      const dataUrl=ctx.assets && ctx.assets[assetKey];
      if(!dataUrl) return;
      insertedSectionImages.add(assetKey);

      let props;
      try{
        props=doc.getImageProperties(dataUrl);
      }catch(e){
        return;
      }

      const maxW=bodyW*0.92;
      const maxH=175;
      const ratio=(props.width&&props.height)?props.width/props.height:1.7;
      let imgW=maxW;
      let imgH=imgW/ratio;

      if(imgH>maxH){
        imgH=maxH;
        imgW=imgH*ratio;
      }

      // La imagen debe acompañar texto: se reserva espacio para al menos
      // cuatro líneas posteriores. Si no cabe, pasa con el texto a la página siguiente.
      const minTextAfter=BODY.lineHeight*4;
      if(y+imgH+minTextAfter>pageH-BODY.bottom) newPage();

      const x=BODY.left+(bodyW-imgW)/2;
      try{
        doc.addImage(dataUrl,imageFormat(dataUrl),x,y,imgW,imgH,undefined,"FAST");
      }catch(e){
        return;
      }

      y+=imgH+18;
      doc.setFont("times","normal");
      doc.setFontSize(BODY.fontSize);
    }

    function maybeInsertSectionImageBeforeHeading(){}

    function figureCaption(number,title){
      ensureSpace(48);
      doc.setFont("times","bold");
      doc.setFontSize(11);
      doc.text("Figura "+number,BODY.left,y);
      y+=17;
      doc.setFont("times","italic");
      doc.setFontSize(11);
      const lines=doc.splitTextToSize(title,bodyW);
      doc.text(lines,BODY.left,y);
      y+=lines.length*16+8;
    }

    function nextFigure(title){
      figureCounter+=1;
      figureCaption(figureCounter,title);
      return figureCounter;
    }

    function drawVerticalBars(data,title,opts={}){
      if(!data.length) return;
      const chartH=190;
      const chartW=bodyW;
      ensureSpace(chartH+86);
      nextFigure(title);

      const top=y;
      const left=BODY.left+34;
      const bottom=top+chartH-34;
      const right=BODY.left+chartW-10;
      const max=Math.max(...data.map(d=>Number(d.value)||0),1);
      const slot=(right-left)/data.length;
      const barW=Math.max(8,slot*0.55);
      const suffix=opts.suffix||"";

      doc.setDrawColor(90);
      doc.setLineWidth(0.4);
      doc.line(left,bottom,right,bottom);
      doc.line(left,top,left,bottom);

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);

      data.forEach((d,i)=>{
        const value=Number(d.value)||0;
        const h=(value/max)*(chartH-58);
        const x=left+i*slot+(slot-barW)/2;
        doc.setFillColor(76,104,133);
        doc.rect(x,bottom-h,barW,h,"F");
        doc.setTextColor(0);
        doc.text((opts.decimals?value.toFixed(opts.decimals):String(Math.round(value)))+suffix,x+barW/2,bottom-h-4,{align:"center"});
        const label=doc.splitTextToSize(String(d.label),Math.max(slot-2,34)).slice(0,2);
        doc.text(label,x+barW/2,bottom+12,{align:"center"});
      });

      y=top+chartH+18;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      doc.text("Nota. Elaboración propia con base en los datos del período.",BODY.left,y);
      y+=24;
    }

    function drawHorizontalBars(data,title,opts={}){
      if(!data.length) return;
      const rowH=18;
      const chartH=Math.max(190,data.length*rowH+46);
      ensureSpace(chartH+96);
      nextFigure(title);

      const top=y;
      const labelW=190;
      const left=BODY.left+labelW;
      const right=pageW-BODY.right;
      const max=Math.max(...data.map(d=>Number(d.value)||0),1);
      const suffix=opts.suffix||"";

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);

      data.forEach((d,i)=>{
        const value=Number(d.value)||0;
        const yy=top+i*rowH+5;
        const label=doc.splitTextToSize(String(d.label),labelW-12).slice(0,1)[0]||String(d.label);
        doc.text(label,BODY.left,yy+7);
        const bw=((right-left-34)*value)/max;
        doc.setFillColor(76,104,133);
        doc.rect(left,yy,bw,9,"F");
        doc.setTextColor(0);
        const valueLabel=(opts.decimals?value.toFixed(opts.decimals):String(Math.round(value)))+suffix;
        doc.text(valueLabel,Math.min(left+bw+4,right-22),yy+8);
      });

      y=top+chartH-10;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      doc.text("Nota. Elaboración propia con base en los datos del período.",BODY.left,y);
      y+=24;
    }

    function drawTimeline(schedule,title){
      const valid=(schedule||[]).filter(r=>r.start&&r.end);
      if(!valid.length) return;
      const chartH=valid.length*22+56;
      ensureSpace(chartH+82);
      nextFigure(title);

      const dates=valid.flatMap(r=>[new Date(r.start+"T12:00:00"),new Date(r.end+"T12:00:00")]);
      const min=Math.min(...dates.map(d=>d.getTime()));
      const max=Math.max(...dates.map(d=>d.getTime()));
      const span=Math.max(max-min,86400000);

      const top=y;
      const labelW=145;
      const x0=BODY.left+labelW;
      const x1=pageW-BODY.right;

      doc.setDrawColor(130);
      doc.setLineWidth(0.35);
      doc.line(x0,top-8,x1,top-8);

      doc.setFont("helvetica","normal");
      doc.setFontSize(8);
      doc.text(formatDateShort(valid[0].start),x0,top-14,{align:"left"});
      doc.text(formatDateShort(valid[valid.length-1].end),x1,top-14,{align:"right"});
      doc.setFontSize(9);

      valid.forEach((r,i)=>{
        const yy=top+i*22;
        doc.text(r.activity,BODY.left,yy+8);
        const s=new Date(r.start+"T12:00:00").getTime();
        const e=new Date(r.end+"T12:00:00").getTime();
        const bx=x0+((s-min)/span)*(x1-x0);
        const ex=x0+((e-min)/span)*(x1-x0);
        const bw=Math.max(5,ex-bx);
        doc.setFillColor(76,104,133);
        doc.rect(bx,yy,bw,10,"F");
      });

      y=top+chartH-12;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      doc.text("Nota. Las barras representan la duración planificada de cada actividad.",BODY.left,y);
      y+=24;
    }

    function drawPareto(data,title){
      const sorted=data.slice().sort((a,b)=>b.value-a.value);
      if(!sorted.length) return;

      const display=sorted.slice(0,15);
      const rowH=22;
      const chartH=display.length*rowH+56;
      ensureSpace(chartH+88);
      nextFigure(title);

      const top=y;
      const labelW=205;
      const valueW=34;
      const pctW=54;
      const barLeft=BODY.left+labelW;
      const barRight=pageW-BODY.right-valueW-pctW;
      const max=Math.max(...display.map(d=>Number(d.value)||0),1);
      const grandTotal=Math.max(sorted.reduce((s,d)=>s+(Number(d.value)||0),0),1);
      let cumulative=0;

      doc.setFont("helvetica","bold");
      doc.setFontSize(8.5);
      doc.text("Carrera",BODY.left,top);
      doc.text("Est.",barRight+8,top);
      doc.text("% acum.",pageW-BODY.right,top,{align:"right"});
      doc.setDrawColor(110);
      doc.setLineWidth(0.4);
      doc.line(BODY.left,top+5,pageW-BODY.right,top+5);

      doc.setFont("helvetica","normal");
      doc.setFontSize(8.5);

      display.forEach((d,i)=>{
        const value=Number(d.value)||0;
        cumulative+=value;
        const pct=(cumulative/grandTotal)*100;
        const yy=top+18+(i*rowH);
        const label=doc.splitTextToSize(String(d.label),labelW-12).slice(0,1)[0]||String(d.label);
        doc.text(label,BODY.left,yy+7);

        const bw=((barRight-barLeft-8)*value)/max;
        doc.setFillColor(76,104,133);
        doc.rect(barLeft,yy,bw,9,"F");

        doc.setTextColor(0);
        doc.text(String(value),barRight+8,yy+8);
        doc.text(pct.toFixed(1)+"%",pageW-BODY.right,yy+8,{align:"right"});
      });

      y=top+chartH-6;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      const note=doc.splitTextToSize("Nota. Se muestran las 15 carreras con mayor número de estudiantes; el porcentaje acumulado se calcula respecto del total del período.",bodyW);
      doc.text(note,BODY.left,y);
      y+=note.length*14+22;
    }


    function drawGroupBars(data,title){
      if(!data.length) return;
      const chunks=[];
      for(let i=0;i<data.length;i+=12) chunks.push(data.slice(i,i+12));

      chunks.forEach((chunk,index)=>{
        const rowH=30;
        const chartH=chunk.length*rowH+54;
        ensureSpace(chartH+90);

        const part=chunks.length>1?" (parte "+(index+1)+" de "+chunks.length+")":"";
        nextFigure(title+part);

        const top=y;
        const labelW=250;
        const barLeft=BODY.left+labelW;
        const barRight=pageW-BODY.right-34;
        const max=Math.max(...chunk.map(d=>Number(d.value)||0),1);

        doc.setFont("helvetica","normal");
        doc.setFontSize(8.5);

        chunk.forEach((d,i)=>{
          const value=Number(d.value)||0;
          const yy=top+i*rowH;
          const lines=doc.splitTextToSize(String(d.label),labelW-12).slice(0,2);
          doc.text(lines,BODY.left,yy+8);

          const bw=((barRight-barLeft)*value)/max;
          doc.setFillColor(76,104,133);
          doc.rect(barLeft,yy+3,bw,10,"F");
          doc.setTextColor(0);
          doc.text(String(value),barRight+6,yy+12);
        });

        y=top+chartH-6;
        doc.setFont("times","italic");
        doc.setFontSize(9);
        const note=doc.splitTextToSize("Nota. Cada fila representa un grupo carrera-modalidad tal como consta en el registro institucional.",bodyW);
        doc.text(note,BODY.left,y);
        y+=note.length*14+22;
      });
    }

    function graphsSection(){
      const rows=(ctx.distribution||[]).filter(r=>r.career && r.place && Number(r.count)>=0);
      if(!rows.length) return;

      heading("7.1. Lectura gráfica de la distribución",2,true);

      const byPlace={};
      rows.forEach(r=>{
        const n=Number(r.count)||0;
        byPlace[r.place]=(byPlace[r.place]||0)+n;
      });

      drawVerticalBars(
        Object.entries(byPlace).map(([label,value])=>({label,value})),
        "Estudiantes por lugar de ejecución"
      );

      const groups=rows
        .slice()
        .sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0))
        .map(r=>({label:r.career,value:Number(r.count)||0}));
      drawGroupBars(groups,"Estudiantes por grupo carrera-modalidad");

      drawTimeline(ctx.schedule||[],"Cronograma general del proceso de examen complexivo");
    }

    function sourceContent(){
      methodologySection();
      requirementsSection();
      examDescriptionSection();
      seminarsSection();
      distributionTables();
      graphsSection();
      laboratoriesSection();
      imponderablesSection();
      evaluationCriteriaSection();
      referencesSection();
    }

    function tocEntryHeight(entry){
      doc.setFont("times",entry.level===1?"bold":"normal");
      doc.setFontSize(10.5);
      const indent=entry.level===1?0:entry.level===2?18:36;
      const maxLabelW=bodyW-indent-44;
      const lines=doc.splitTextToSize(entry.title,maxLabelW);
      return Math.max(17,lines.length*17);
    }

    function drawTOCPage(pageNo,title,entries){
      doc.setPage(pageNo);
      y=BODY.top;

      if(title){
        doc.setFont("times","bold");
        doc.setFontSize(14);
        doc.text(title,pageW/2,y,{align:"center"});
        y+=34;
      }

      entries.forEach(e=>{
        const indent=e.level===1?0:e.level===2?18:36;
        const fontStyle=e.level===1?"bold":"normal";

        doc.setFont("times",fontStyle);
        doc.setFontSize(10.5);

        const maxLabelW=bodyW-indent-44;
        const labelLines=doc.splitTextToSize(e.title,maxLabelW);
        const rowH=Math.max(17,labelLines.length*17);
        const baseY=y;

        doc.text(labelLines,BODY.left+indent,baseY);

        const lastLine=labelLines[labelLines.length-1]||"";
        const lastY=baseY+(labelLines.length-1)*17;
        const startX=BODY.left+indent+doc.getTextWidth(lastLine)+5;
        const endX=BODY.left+bodyW-28;

        doc.setLineDashPattern([1,2],0);
        if(startX<endX) doc.line(startX,lastY-2,endX,lastY-2);
        doc.setLineDashPattern([],0);

        doc.text(String(e.page),BODY.left+bodyW,lastY,{align:"right"});
        y+=rowH;
      });
    }

    function fillIndex(){
      const dedup=[];
      const seen=new Set();

      toc.forEach(e=>{
        const key=normalize(e.title);
        if(!key || seen.has(key)) return;
        seen.add(key);
        dedup.push(e);
      });

      const heights=dedup.map(tocEntryHeight);
      const totalHeight=heights.reduce((s,h)=>s+h,0);
      const target=totalHeight/2;

      let cumulative=0;
      let splitAt=1;
      for(let i=0;i<heights.length;i++){
        if(cumulative+heights[i]>target && i>0){
          splitAt=i;
          break;
        }
        cumulative+=heights[i];
        splitAt=i+1;
      }

      drawTOCPage(2,"Índice",dedup.slice(0,splitAt));
      drawTOCPage(3,"",dedup.slice(splitAt));
    }

    function footers(){
      const total=doc.getNumberOfPages();
      for(let p=1;p<=total;p++){
        doc.setPage(p);
        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        doc.text("Página "+p+" de "+total,pageW-36,pageH-22,{align:"right"});
      }
      return total;
    }

    cover();
    reserveIndexPages();
    summarySection();
    introAndLegal();
    sourceContent();

    fillIndex();
    const totalPages=footers();

    const safeName=(filename||"documento.pdf").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();
    const finalName=safeName.endsWith(".pdf")?safeName:safeName+".pdf";
    const blob=doc.output("blob");
    doc.save(finalName);
    return {pages:totalPages,filename:finalName,blob};
  }

  window.DocTitFullDocument={
    resizeImage,
    decodeTemplatePages,
    generateAndDownload
  };
})();