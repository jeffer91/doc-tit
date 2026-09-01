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
      const t=clean(paragraph.join(" "));
      if(t) blocks.push({type:"p",text:t});
      paragraph=[];
    };

    lines.forEach(t=>{
      const type=lineType(t);
      if(type==="p"){
        paragraph.push(t);
      }else{
        flush();
        blocks.push({type,text:clean(t)});
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
      keywords:"titulación, examen complexivo, planificación"
    });

    const pageW=doc.internal.pageSize.getWidth();
    const pageH=doc.internal.pageSize.getHeight();
    const bodyW=pageW-BODY.left-BODY.right;
    let y=BODY.top;
    const toc=[];
    const headerDrawn=new Set();
    const analysisInjected=new Set();

    function drawHeader(pageNo){
      if(headerDrawn.has(pageNo)) return;
      headerDrawn.add(pageNo);
      doc.setPage(pageNo);
      const x=36, top=22, totalW=pageW-72, h=58;
      const logoW=130, codeW=98, centerW=totalW-logoW-codeW;
      doc.setDrawColor(0); doc.setLineWidth(0.8);
      doc.rect(x,top,totalW,h);
      doc.line(x+logoW,top,x+logoW,top+h);
      doc.line(x+logoW+centerW,top,x+logoW+centerW,top+h);
      doc.line(x+logoW,top+h/2,x+logoW+centerW,top+h/2);

      if(ctx.assets && ctx.assets.logo){
        try{
          doc.addImage(ctx.assets.logo,imageFormat(ctx.assets.logo),x+6,top+6,logoW-12,h-12,undefined,"FAST");
        }catch(e){}
      }else{
        doc.setFont("times","bold"); doc.setFontSize(8);
        doc.text("LOGO INSTITUCIONAL",x+logoW/2,top+h/2,{align:"center"});
      }

      doc.setFont("times","normal"); doc.setFontSize(10);
      doc.text("UNIDAD DE TITULACIÓN Y EFICIENCIA TERMINAL",x+logoW+centerW/2,top+18,{align:"center"});
      doc.setFont("times","bold"); doc.setFontSize(9.2);
      doc.text("Planificación De Examen Complexivo",x+logoW+centerW/2,top+h/2+11,{align:"center"});
      doc.setFont("times","normal"); doc.setFontSize(8.5);
      doc.text(ctx.period.name,x+logoW+centerW/2,top+h/2+23,{align:"center"});

      doc.setFont("times","normal"); doc.setFontSize(8.5);
      doc.text("Código:",x+logoW+centerW+codeW/2,top+18,{align:"center"});
      doc.setFont("times","bold"); doc.setFontSize(7.5);
      const codeLines=doc.splitTextToSize(ctx.code,codeW-10);
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
      const align=level===1?"center":"left";
      doc.setFont("times",style); doc.setFontSize(size);
      const max=bodyW;
      const lines=doc.splitTextToSize(clean(text),max);
      const height=lines.length*22+12;
      ensureSpace(height+BODY.lineHeight*2);
      if(includeToc) toc.push({title:clean(text),level,page:doc.getNumberOfPages()});
      doc.text(lines,align==="center"?pageW/2:BODY.left,y,{align});
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
      y=doc.lastAutoTable.finalY+16;
    }

    function scheduleTable(){
      heading("3.10. Cronogramas",2,true);
      paragraph("El cronograma general organiza las fechas de las principales fases del examen complexivo y constituye la referencia temporal para los documentos operativos complementarios.");
      ensureSpace(120);
      autoTable({
        startY:y,
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Actividad","Fecha inicio","Fecha fin"]],
        body:(ctx.schedule||[]).map(r=>[r.activity,formatDateShort(r.start),formatDateShort(r.end)]),
        styles:{font:"times",fontSize:10,cellPadding:5,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      paragraph("Los cronogramas complementarios de desarrollo de núcleos y de rendición del examen detallarán, cuando corresponda, la distribución por carrera, lugar, fecha, hora, laboratorio y responsables, sin sustituir la planificación general del período.");
    }

    function distributionTables(){
      heading("7. Distribución de Estudiantes por Carrera y Nivel",1,true);
      paragraph("La distribución del período se determina a partir de la cantidad de estudiantes registrada por carrera y del lugar previsto para la ejecución del proceso. Los nombres de las carreras se conservan exactamente como constan en el registro institucional.");
      autoTable({
        startY:y,
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Carrera","Lugar","Cant."]],
        body:(ctx.distribution||[]).map(r=>[r.career,r.place,String(Number(r.count)||0)]),
        columnStyles:{0:{cellWidth:bodyW*0.68},1:{cellWidth:bodyW*0.20},2:{cellWidth:bodyW*0.12,halign:"right"}},
        styles:{font:"times",fontSize:9.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      const t=totals(ctx.distribution);
      const summary=Object.entries(t.byPlace).map(([p,n])=>p+": "+n).join(" · ");
      paragraph("Resumen de distribución: "+summary+". Total general: "+t.total+" estudiantes.",{indent:false,bold:true,lineHeight:20});
    }

    function signatureBlock(fixedTop=null){
      const x=BODY.left, w=bodyW, col=w/3;
      const titleH=24, signH=88, nameH=32, roleH=46;
      const totalH=titleH+signH+nameH+roleH;

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
        doc.line(cx,top+titleH,cx+col,top+titleH);
        doc.line(cx,top+titleH+signH,cx+col,top+titleH+signH);
        doc.line(cx,top+titleH+signH+nameH,cx+col,top+titleH+signH+nameH);
      }

      const cells=[
        {title:"ELABORADO POR:",name:ctx.institutional?.preparedBy||"Msg. Jefferson Villarreal",role:ctx.institutional?.preparedRole||"COORDINADOR DE CARRERAS"},
        {title:"REVISADO POR:",name:ctx.institutional?.reviewedBy||"Mgde. Martha Tomalá",role:ctx.institutional?.reviewedRole||"COORDINADORA GENERAL DE CARRERAS"},
        {title:"APROBADO POR:",name:ctx.institutional?.approvedBy||"Mgt. Alex León",role:ctx.institutional?.approvedRole||"VICERRECTOR"}
      ];

      cells.forEach((cell,i)=>{
        const cx=x+i*col;
        doc.setFont("times","normal");
        doc.setFontSize(9);
        doc.text(cell.title,cx+6,top+16);

        doc.setFont("times","bold");
        doc.text("NOMBRE:",cx+6,top+titleH+signH+20);
        doc.setFont("times","normal");
        const nameLines=doc.splitTextToSize(cell.name,col-58);
        doc.text(nameLines,cx+52,top+titleH+signH+20);

        doc.setFont("times","bold");
        doc.text("CARGO:",cx+6,top+titleH+signH+nameH+17);
        doc.setFont("times","normal");
        const roleLines=doc.splitTextToSize(cell.role,col-12);
        doc.text(roleLines,cx+6,top+titleH+signH+nameH+31);
      });

      if(fixedTop==null) y=top+totalH+12;
    }

    function cover(){
      y=220;
      doc.setFont("times","bold");
      doc.setFontSize(23);
      doc.text("Planificación De Examen Complexivo",pageW/2,y,{align:"center"});
      y+=58;
      doc.setFontSize(19);
      doc.text(ctx.period.name,pageW/2,y,{align:"center"});

      // Las firmas forman parte de la portada, con espacio en blanco para firma manuscrita.
      signatureBlock(500);
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

    function figureCaption(number,title){
      ensureSpace(44);
      doc.setFont("times","bold");
      doc.setFontSize(11);
      doc.text("Figura "+number,BODY.left,y);
      y+=16;
      doc.setFont("times","italic");
      doc.setFontSize(11);
      doc.text(title,BODY.left,y);
      y+=18;
    }

    function drawVerticalBars(data,title,figureNo){
      if(!data.length) return;
      const chartH=190;
      const chartW=bodyW;
      ensureSpace(chartH+74);
      figureCaption(figureNo,title);

      const top=y;
      const left=BODY.left+34;
      const bottom=top+chartH-34;
      const right=BODY.left+chartW-10;
      const max=Math.max(...data.map(d=>d.value),1);
      const slot=(right-left)/data.length;
      const barW=Math.max(8,slot*0.55);

      doc.setDrawColor(90);
      doc.setLineWidth(0.4);
      doc.line(left,bottom,right,bottom);
      doc.line(left,top,left,bottom);

      doc.setFont("times","normal");
      doc.setFontSize(8);

      data.forEach((d,i)=>{
        const h=(d.value/max)*(chartH-58);
        const x=left+i*slot+(slot-barW)/2;
        doc.setFillColor(76,104,133);
        doc.rect(x,bottom-h,barW,h,"F");
        doc.setTextColor(0);
        doc.text(String(d.value),x+barW/2,bottom-h-4,{align:"center"});
        const label=doc.splitTextToSize(d.label,Math.max(slot-2,34)).slice(0,2);
        doc.text(label,x+barW/2,bottom+12,{align:"center"});
      });

      y=top+chartH+18;
      doc.setFont("times","normal");
      doc.setFontSize(9);
      doc.text("Nota. Elaboración propia con base en los datos del período.",BODY.left,y);
      y+=24;
    }

    function drawHorizontalBars(data,title,figureNo){
      if(!data.length) return;
      const rowH=18;
      const chartH=Math.max(190,data.length*rowH+46);
      ensureSpace(chartH+72);
      figureCaption(figureNo,title);

      const top=y;
      const labelW=170;
      const left=BODY.left+labelW;
      const right=pageW-BODY.right;
      const max=Math.max(...data.map(d=>d.value),1);

      doc.setFont("times","normal");
      doc.setFontSize(8.5);

      data.forEach((d,i)=>{
        const yy=top+i*rowH+5;
        const label=doc.splitTextToSize(d.label,labelW-12).slice(0,1)[0]||d.label;
        doc.text(label,BODY.left,yy+7);
        const bw=((right-left-30)*d.value)/max;
        doc.setFillColor(76,104,133);
        doc.rect(left,yy,bw,9,"F");
        doc.setTextColor(0);
        doc.text(String(d.value),Math.min(left+bw+4,right-18),yy+8);
      });

      y=top+chartH-10;
      doc.setFont("times","normal");
      doc.setFontSize(9);
      doc.text("Nota. Elaboración propia con base en los datos del período.",BODY.left,y);
      y+=24;
    }

    function drawTimeline(schedule,title,figureNo){
      const valid=(schedule||[]).filter(r=>r.start&&r.end);
      if(!valid.length) return;
      const chartH=valid.length*22+56;
      ensureSpace(chartH+72);
      figureCaption(figureNo,title);

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

      doc.setFont("times","normal");
      doc.setFontSize(8.5);

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
      doc.setFont("times","normal");
      doc.setFontSize(9);
      doc.text("Nota. Las barras representan la duración planificada de cada actividad.",BODY.left,y);
      y+=24;
    }

    function graphsSection(){
      const rows=(ctx.distribution||[]).filter(r=>Number(r.count)>=0);
      if(!rows.length) return;

      heading("7.1. Representación Gráfica de la Distribución",2,true);

      const byPlace={};
      rows.forEach(r=>{byPlace[r.place]=(byPlace[r.place]||0)+(Number(r.count)||0);});
      drawVerticalBars(
        Object.entries(byPlace).map(([label,value])=>({label,value})),
        "Estudiantes por lugar de ejecución",
        1
      );

      const online=rows.filter(r=>/\bONLINE\b/i.test(r.career)).reduce((s,r)=>s+(Number(r.count)||0),0);
      const other=rows.filter(r=>!/\bONLINE\b/i.test(r.career)).reduce((s,r)=>s+(Number(r.count)||0),0);
      drawVerticalBars(
        [{label:"Identificados como ONLINE",value:online},{label:"Resto de carreras",value:other}],
        "Distribución según identificación ONLINE en el nombre de la carrera",
        2
      );

      const topCareers=rows
        .slice()
        .sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0))
        .slice(0,10)
        .map(r=>({label:r.career,value:Number(r.count)||0}));
      drawHorizontalBars(topCareers,"Diez carreras con mayor número de estudiantes",3);

      drawTimeline(ctx.schedule||[],"Cronograma general del proceso de examen complexivo",4);
    }

    function sourceContent(blocks){
      const inserted={schedule:false,distribution:false};
      let skipMode=null;

      for(const b of blocks){
        const n=normalize(b.text);

        if(skipMode==="schedule"){
          if(b.type==="h1" && n.startsWith("4 requisitos")){
            skipMode=null;
          }else{
            continue;
          }
        }
        if(skipMode==="distribution"){
          if(b.type==="h1" && n.startsWith("8 asignacion de laboratorios")){
            skipMode=null;
          }else{
            continue;
          }
        }

        if(n.startsWith("3 10 cronogramas")){
          scheduleTable();
          inserted.schedule=true;
          skipMode="schedule";
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
          heading(b.text,1,true);
          paragraph("La asignación de espacios se realizará considerando la cantidad de estudiantes, los requerimientos técnicos de cada carrera y la disponibilidad institucional. La definición exacta de laboratorio, fecha, hora y responsables corresponde al cronograma operativo de rendición.");
          continue;
        }

        if(b.type==="h1"){
          heading(b.text,1,true);
        }else if(b.type==="h2"){
          heading(b.text,2,true);
        }else if(b.type==="h3"){
          heading(b.text,3,true);
        }else if(b.type==="bullet"){
          bullet(b.text);
        }else if(b.type==="label"){
          label(b.text);
        }else{
          if(n.includes("bibliografia") || n.includes("constitucion de la republica") || n.includes("editorial") || n.includes("revista")){
            reference(b.text);
          }else{
            paragraph(b.text);
          }
        }
      }

      if(!inserted.schedule) scheduleTable();
      if(!inserted.distribution){
        distributionTables();
        graphsSection();
      }
    }

    function drawTOCPage(pageNo,title,entries){
      doc.setPage(pageNo);
      y=BODY.top;
      doc.setFont("times","bold"); doc.setFontSize(14);
      doc.text(title,pageW/2,y,{align:"center"});
      y+=34;
      entries.forEach(e=>{
        const indent=e.level===1?0:e.level===2?18:36;
        const fontStyle=e.level===1?"bold":"normal";
        doc.setFont("times",fontStyle);
        doc.setFontSize(10.5);
        const label=e.title;
        const pageText=String(e.page);
        const maxLabelW=bodyW-indent-44;
        const labelLines=doc.splitTextToSize(label,maxLabelW);
        const first=labelLines[0]||"";
        ensureTocSpace(labelLines.length*18+4,pageNo);
        const yy=y;
        doc.text(labelLines,BODY.left+indent,yy);
        const startX=BODY.left+indent+doc.getTextWidth(first)+5;
        const endX=BODY.left+bodyW-28;
        doc.setLineDashPattern([1,2],0);
        if(startX<endX) doc.line(startX,yy-2,endX,yy-2);
        doc.setLineDashPattern([],0);
        doc.text(pageText,BODY.left+bodyW,yy,{align:"right"});
        y+=Math.max(17,labelLines.length*17);
      });

      function ensureTocSpace(h){
        if(y+h>pageH-BODY.bottom){
          // TOC is intentionally limited to two reserved pages; overflow continues on page 3.
        }
      }
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
      const mid=Math.ceil(dedup.length/2);
      drawTOCPage(2,"Índice",dedup.slice(0,mid));
      drawTOCPage(3,"Índice (continuación)",dedup.slice(mid));
    }

    function footers(){
      const total=doc.getNumberOfPages();
      for(let p=1;p<=total;p++){
        doc.setPage(p);
        doc.setFont("times","normal"); doc.setFontSize(9);
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