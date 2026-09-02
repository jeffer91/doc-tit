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

  function cleanLegacyText(v){
    return clean(v)
      .replace(/%ª/g,"•")
      .replace(/\bo\s+A los estudiantes\b/gi,"A los estudiantes")
      .replace(/\bo\s+Criterios de evaluación:/gi,"Criterios de evaluación:")
      .replace(/\bo\s+La cantidad de estudiantes por grupo\b/gi,"• La cantidad de estudiantes por grupo")
      .replace(/\bo\s+Los requerimientos técnicos o de software\b/gi,"• Los requerimientos técnicos o de software")
      .replace(/\bo\s+Pruebas técnicas previas\b/gi,"• Pruebas técnicas previas")
      .replace(/\bo\s+Presencia de personal de soporte\b/gi,"• Presencia de personal de soporte")
      .replace(/\bo\s+Coordinación con la unidad de infraestructura tecnológica institucional\b/gi,"• Coordinación con la unidad de infraestructura tecnológica institucional");
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
      "La planificación del examen complexivo para el período "+p+" se enmarca en la normativa nacional de educación superior y en la regulación institucional aplicable al proceso de titulación. La base legal permite vincular la planificación operativa con los derechos del estudiante, las finalidades del sistema de educación superior y las obligaciones institucionales relacionadas con la evaluación, egreso, titulación y registro de títulos.",
      "La Constitución de la República del Ecuador constituye el marco superior de referencia. El documento institucional de base identifica el artículo 344 dentro del régimen educativo y el artículo 350 como fundamento de las finalidades de la educación superior, entre ellas la formación académica y profesional, la investigación, la innovación y la generación de soluciones para los problemas del país. Estos principios orientan la organización de procesos académicos que deben asegurar calidad, pertinencia y formación integral.",
      "En relación con los derechos estudiantiles, la Ley Orgánica de Educación Superior reconoce el derecho a acceder, permanecer, egresar y titularse conforme a los méritos académicos y sin discriminación. Para la planificación del examen complexivo, este principio exige que las condiciones de participación, evaluación, información y acceso a los recursos se definan previamente y se apliquen de manera consistente.",
      "La planificación institucional de referencia incorpora además la responsabilidad de las instituciones de educación superior respecto de la validez y pertinencia de los procesos académicos y de titulación. Bajo esta lógica, el examen complexivo debe responder al perfil de egreso de cada carrera y permitir una comprobación integral de los aprendizajes alcanzados.",
      "El Reglamento General a la Ley Orgánica de Educación Superior también forma parte del marco utilizado por la planificación, especialmente en lo relacionado con la información académica, el egreso y el registro de títulos en los sistemas nacionales correspondientes. Esta obligación refuerza la necesidad de mantener trazabilidad desde la habilitación del estudiante hasta la consolidación final de resultados y documentación.",
      "En el ámbito institucional, el Reglamento del Área de Titulación establece la finalidad y alcance del proceso y orienta la titulación hacia la validación de competencias adquiridas durante la formación profesional y su relación con el perfil de egreso, la resolución de problemas y el desarrollo de propuestas aplicadas.",
      "La normativa institucional define el examen complexivo como una evaluación integral de la preparación teórico-práctica del estudiante. La planificación adopta esta estructura al diferenciar el componente teórico y el componente práctico, manteniendo mecanismos específicos de preparación, aplicación y evaluación para cada uno.",
      "La aplicación de este marco normativo implica que el proceso no puede limitarse al momento de rendición del examen. Debe incluir la verificación previa de requisitos académicos, documentales y financieros; el cumplimiento de las obligaciones institucionales relacionadas con vinculación, prácticas preprofesionales y lengua extranjera cuando correspondan; la preparación académica; la organización logística; la evaluación; el registro de resultados; y la atención de situaciones excepcionales debidamente justificadas.",
      "La normativa institucional también exige que las responsabilidades sean identificables. Por ello, la planificación distribuye funciones entre la Unidad de Titulación y Eficiencia Terminal, coordinaciones de carrera, Secretaría Académica, unidades de apoyo, docentes y demás actores que intervienen en el proceso. Esta asignación permite mantener control, seguimiento y evidencia sobre cada fase.",
      "En concordancia con los principios de calidad y transparencia, los cronogramas, listados de estudiantes, registros de asistencia, instrumentos de evaluación, resultados e incidencias deben conservar una relación verificable con el período académico correspondiente. De este modo, la base legal no se presenta únicamente como una enumeración normativa, sino como el fundamento que orienta las decisiones académicas y operativas contenidas en el presente documento.",
      "En consecuencia, cualquier procedimiento complementario que se derive de esta planificación deberá observar la normativa vigente y los reglamentos institucionales aplicables al momento de su ejecución. Cuando exista una actualización normativa, la institución deberá aplicar la disposición vigente y dejar constancia de los ajustes que correspondan en los documentos operativos del proceso."
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
      keywords:"titulación, examen complexivo, planificación, DOC-TIT v10"
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
      doc.setFont("times",opts.bold?"bold":opts.italic?"italic":"normal");
      doc.setFontSize(size);
      const firstW=bodyW-indent;
      const otherW=bodyW-hanging;
      const lines=wrapWords(text,firstW,otherW);
      lines.forEach((line,i)=>{
        ensureSpace(lineHeight);
        const x=BODY.left+(i===0?indent:hanging);
        doc.text(line,x,y);
        y+=lineHeight;
      });
      y+=opts.after==null?8:opts.after;
    }

    function bullet(text){
      doc.setFont("times","normal"); doc.setFontSize(12);
      const raw=clean(text).replace(/^•\s*/,"");
      const indent=24, bulletX=BODY.left+8, textX=BODY.left+indent;
      const lines=wrapWords(raw,bodyW-indent,bodyW-indent);
      lines.forEach((line,i)=>{
        ensureSpace(BODY.lineHeight);
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

      doc.setFont("times",style);
      doc.setFontSize(size);

      const lines=doc.splitTextToSize(cleaned,bodyW);
      const titleHeight=lines.length*22+10;
      const blankBefore=(level===1 && y>BODY.top+2)?BODY.lineHeight:0;

      ensureSpace(blankBefore+titleHeight+BODY.lineHeight*2);

      if(level===1 && y>BODY.top+2) y+=BODY.lineHeight;

      if(includeToc) toc.push({title:cleaned,level,page:doc.getNumberOfPages()});

      doc.setFont("times",style);
      doc.setFontSize(size);
      doc.text(lines,BODY.left,y,{align:"left"});
      y+=lines.length*22+8;

      const key=smartSectionKey(text);
      if(key && !analysisInjected.has(key)){
        analysisInjected.add(key);
        getAnalysisSentences(ctx,key).forEach(s=>paragraph(s));
      }
    }

    function label(text){
      ensureSpace(32);
      doc.setFont("times","bold"); doc.setFontSize(12);
      doc.text(clean(text),BODY.left,y);
      y+=BODY.lineHeight;
    }

    function reference(text){
      doc.setFont("times","normal"); doc.setFontSize(12);
      const hanging=36;
      const lines=wrapWords(text,bodyW,bodyW-hanging);
      lines.forEach((line,i)=>{
        ensureSpace(BODY.lineHeight);
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
      options.styles={font:"times",fontSize:10,cellPadding:4,textColor:0,lineWidth:0,...(options.styles||{})};
      options.headStyles={font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0,lineWidth:0,...(options.headStyles||{})};

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

      tableCaption("Cronograma general del proceso de examen complexivo");
      ensureSpace(120);

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
      heading("7. Distribución de Estudiantes por Carrera y Nivel",1,true);
      paragraph("La distribución del período se determina a partir de la cantidad de estudiantes registrada por carrera y del lugar previsto para la ejecución del proceso. Los nombres de las carreras se conservan exactamente como constan en el registro institucional.");

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
      introParagraphs(ctx).forEach(p=>paragraph(p));
      getAnalysisSentences(ctx,"general").forEach(p=>paragraph(p));

      heading("2. Base Legal",1,true);
      legalParagraphs(ctx).forEach(p=>paragraph(p));
    }

    function responsibilitiesTable(){
      heading("3.9. Responsables por Fase del Proceso",2,true);
      paragraph("La correcta ejecución del examen complexivo requiere una asignación clara de responsabilidades para cada fase del proceso. La siguiente tabla organiza la información institucional de la planificación base y evita que los responsables aparezcan como texto corrido.");

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

    function summarySection(){
      const t=totals(ctx.distribution);
      const places=Object.entries(t.byPlace);
      heading("11. Resumen General",1,true);
      paragraph("La presente planificación organiza el proceso de examen complexivo del período "+lowerPeriod(ctx.period.name)+" y articula cronograma, requisitos, preparación, evaluación, distribución estudiantil, logística e imponderables.");

      heading("11.1. Modalidad de Aplicación",2,true);
      bullet("• La rendición se planifica de forma presencial. Una aplicación virtual solo procede de manera excepcional, con solicitud formal, justificación y autorización institucional.");

      heading("11.2. Fases del Proceso",2,true);
      bullet("• El proceso contempla cierre de clases, revisión de requisitos, cuatro núcleos de preparación, registro de notas, examen complexivo y supletorio, conforme al cronograma del período.");

      heading("11.3. Organización por Lugares",2,true);
      paragraph("La distribución registrada comprende "+t.total+" estudiantes. Los lugares y cantidades son: "+places.map(([p,n])=>p+" ("+n+")").join(", ")+". La planificación logística debe conservar esta distribución o documentar formalmente cualquier cambio.");

      heading("11.4. Evaluación Integral",2,true);
      bullet("• El componente teórico representa el 40% de la nota final.");
      bullet("• El componente práctico representa el 60% de la nota final.");
      bullet("• La planificación base establece una calificación mínima de 7/10 para la aprobación de cada componente.");

      heading("11.5. Gestión de Imponderables",2,true);
      bullet("• Se contemplan actuaciones frente a fallas técnicas, inasistencia justificada y ausencia de personal asignado, dejando registro de los incidentes que afecten la jornada.");

      heading("11.6. Inclusión y Accesibilidad",2,true);
      bullet("• Se deben prever condiciones adecuadas para estudiantes con necesidades específicas, manteniendo los criterios académicos del proceso.");
    }

    function referencesSection(){
      heading("12. Bibliografía",1,true);
      paragraph("Las referencias normativas e institucionales se presentan en formato APA 7 con sangría francesa.",{indent:false});

      [
        "Asamblea Nacional del Ecuador. (2008). Constitución de la República del Ecuador.",
        "Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior.",
        "Asamblea Nacional del Ecuador. (2010). Reglamento General a la Ley Orgánica de Educación Superior.",
        "Instituto Tecnológico Superior Quito Metropolitano. (2022). Reglamento del Área de Titulación del ITSQMET.",
        "Secretaría Nacional de Planificación y Desarrollo. (2021). Plan Nacional de Desarrollo 2021-2025."
      ].forEach(reference);
    }

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
      ensureSpace(chartH+82);
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

      const chartH=230;
      ensureSpace(chartH+92);
      nextFigure(title);

      const top=y;
      const left=BODY.left+30;
      const bottom=top+chartH-58;
      const right=pageW-BODY.right-8;
      const max=Math.max(...sorted.map(d=>d.value),1);
      const total=Math.max(sorted.reduce((s,d)=>s+d.value,0),1);
      const slot=(right-left)/sorted.length;
      const barW=Math.max(5,slot*0.52);
      let cumulative=0;
      let prev=null;

      doc.setDrawColor(90);
      doc.setLineWidth(0.4);
      doc.line(left,bottom,right,bottom);
      doc.line(left,top,left,bottom);

      doc.setFont("helvetica","normal");
      doc.setFontSize(7.5);

      sorted.forEach((d,i)=>{
        const x=left+i*slot+(slot-barW)/2;
        const h=(d.value/max)*(chartH-86);
        doc.setFillColor(76,104,133);
        doc.rect(x,bottom-h,barW,h,"F");

        cumulative+=d.value;
        const pct=(cumulative/total)*100;
        const px=x+barW/2;
        const py=bottom-(pct/100)*(chartH-86);

        doc.setFillColor(30,30,30);
        doc.circle(px,py,1.8,"F");
        if(prev){
          doc.setDrawColor(30);
          doc.setLineWidth(0.8);
          doc.line(prev.x,prev.y,px,py);
        }
        prev={x:px,y:py};

        const short=String(d.label).length>14?String(d.label).slice(0,13)+"…":String(d.label);
        doc.text(short,px,bottom+12,{align:"center",angle:55});
      });

      doc.setFont("helvetica","normal");
      doc.setFontSize(8);
      doc.text("Línea: porcentaje acumulado",right,bottom-(chartH-86)-8,{align:"right"});

      y=top+chartH+6;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      doc.text("Nota. Las barras muestran estudiantes por carrera y la línea representa el porcentaje acumulado.",BODY.left,y);
      y+=24;
    }

    function graphsSection(){
      const rows=(ctx.distribution||[]).filter(r=>r.career && r.place && Number(r.count)>=0);
      if(!rows.length) return;

      heading("7.1. Representación Gráfica de la Distribución",2,true);

      const byPlace={};
      const careersByPlace={};
      rows.forEach(r=>{
        const n=Number(r.count)||0;
        byPlace[r.place]=(byPlace[r.place]||0)+n;
        if(!careersByPlace[r.place]) careersByPlace[r.place]=new Set();
        careersByPlace[r.place].add(r.career);
      });

      const total=Object.values(byPlace).reduce((s,n)=>s+n,0)||1;

      // Figura 1: estudiantes por lugar.
      drawVerticalBars(
        Object.entries(byPlace).map(([label,value])=>({label,value})),
        "Estudiantes por lugar de ejecución"
      );

      // Figura 2: participación porcentual por lugar.
      drawVerticalBars(
        Object.entries(byPlace).map(([label,value])=>({label,value:(value/total)*100})),
        "Participación porcentual de estudiantes por lugar",
        {suffix:"%",decimals:1}
      );

      // Figura 3: todas las carreras, ordenadas de mayor a menor.
      const allCareers=rows
        .slice()
        .sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0))
        .map(r=>({label:r.career,value:Number(r.count)||0}));
      drawHorizontalBars(allCareers,"Estudiantes por carrera");

      // Figura 4: resumen top 10.
      drawHorizontalBars(allCareers.slice(0,10),"Diez carreras con mayor número de estudiantes");

      // Figura 5: Pareto.
      drawPareto(allCareers,"Concentración acumulada de estudiantes por carrera");

      // Figura 6: número de carreras atendidas por lugar.
      drawVerticalBars(
        Object.entries(careersByPlace).map(([label,set])=>({label,value:set.size})),
        "Número de carreras por lugar de ejecución"
      );

      // Figura 7: duración de cada actividad.
      const durationData=(ctx.schedule||[]).filter(r=>r.start&&r.end).map(r=>{
        const start=new Date(r.start+"T12:00:00");
        const end=new Date(r.end+"T12:00:00");
        const days=Math.max(1,Math.round((end-start)/86400000)+1);
        return {label:r.activity,value:days};
      });
      drawHorizontalBars(durationData,"Duración planificada de las actividades del cronograma",{suffix:" d"});

      // Figura 8: línea temporal completa.
      drawTimeline(ctx.schedule||[],"Cronograma general del proceso de examen complexivo");
    }

    function sourceContent(blocks){
      const inserted={schedule:false,distribution:false};
      let started=false;
      let skipMode=null;

      for(const b of blocks){
        const n=normalize(b.text);

        // The curated Introduction and Base Legal are already rendered.
        // Ignore residual text from the old template until section 3 starts.
        if(!started){
          if(b.type==="h1" && n.startsWith("3 metodologia")){
            started=true;
          }else{
            continue;
          }
        }

        if(skipMode==="responsibilities"){
          if(n.startsWith("3 10 cronogramas")) skipMode=null;
          else continue;
        }
        if(skipMode==="schedule"){
          if(b.type==="h1" && n.startsWith("4 requisitos")) skipMode=null;
          else continue;
        }
        if(skipMode==="financial"){
          if(n.startsWith("4 3 2 politicas")) skipMode=null;
          else continue;
        }
        if(skipMode==="distribution"){
          if(b.type==="h1" && n.startsWith("8 asignacion de laboratorios")) skipMode=null;
          else continue;
        }
        if(skipMode==="labs"){
          if(b.type==="h1" && n.startsWith("9 imponderables")) skipMode=null;
          else continue;
        }
        if(skipMode==="summary"){
          if(b.type==="h1" && n.startsWith("12 bibliografia")) skipMode=null;
          else continue;
        }

        if(n.startsWith("3 9 responsables por fase")){
          responsibilitiesTable();
          skipMode="responsibilities";
          continue;
        }

        if(n.startsWith("3 10 cronogramas")){
          scheduleTable();
          inserted.schedule=true;
          skipMode="schedule";
          continue;
        }

        if(n.startsWith("4 3 1 cronograma de pagos")){
          financialScheduleSection();
          skipMode="financial";
          continue;
        }

        if(n.startsWith("7 distribucion de estudiantes")){
          distributionTables();
          graphsSection();
          inserted.distribution=true;
          skipMode="distribution";
          continue;
        }

        if(n.startsWith("8 asignacion de laboratorios")){
          laboratoriesSection();
          skipMode="labs";
          continue;
        }

        if(n.startsWith("11 resumen general")){
          summarySection();
          skipMode="summary";
          continue;
        }

        if(n.startsWith("12 bibliografia")){
          referencesSection();
          break;
        }

        if(b.type==="h1"){
          heading(b.text,1,true);
        }else if(b.type==="h2"){
          heading(b.text,2,true);
        }else if(b.type==="h3"){
          heading(b.text,3,true);
        }else if(b.type==="bullet"){
          const txt=sourceProse(b.text);
          if(txt) bullet(txt);
        }else if(b.type==="label"){
          const txt=sourceProse(b.text);
          if(txt) label(txt);
        }else{
          const txt=sourceProse(b.text);
          if(txt) paragraph(txt);
        }
      }

      if(!inserted.schedule) scheduleTable();
      if(!inserted.distribution){
        distributionTables();
        graphsSection();
      }
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

      doc.setFont("times","bold");
      doc.setFontSize(14);
      doc.text(title,pageW/2,y,{align:"center"});
      y+=34;

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
      drawTOCPage(3,"Índice (continuación)",dedup.slice(splitAt));
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

    const sourcePages=await decodeTemplatePages();
    const blocks=parseSourceBlocks(sourcePages,ctx.period);

    cover();
    reserveIndexPages();
    introAndLegal();
    sourceContent(blocks);

    fillIndex();
    const totalPages=footers();

    const safeName=(filename||"documento.pdf").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();
    doc.save(safeName.endsWith(".pdf")?safeName:safeName+".pdf");
    return {pages:totalPages,filename:safeName};
  }

  window.DocTitFullDocument={
    resizeImage,
    decodeTemplatePages,
    generateAndDownload
  };
})();