(() => {
"use strict";
const KIND="trabajo";
const TITLE="Planificación de Trabajo de Titulación";
const AUTHOR_ROLE="Gestor de Procesos Académicos";
const CONTENT_CONFIG=window.DOC_TIT_TRABAJO_CONTENT||{};
const PROCESS_CONFIG=window.DOC_TIT_TRABAJO_PROCESS||{};
const LOGISTICS_CONFIG=window.DOC_TIT_TRABAJO_LOGISTICS||{};
const INDUCTION_CONFIG=window.DOC_TIT_TRABAJO_INDUCTION||{};
const AUTHORIZATIONS_CONFIG=window.DOC_TIT_TRABAJO_AUTHORIZATIONS||{};
const SCHEDULE_CONFIG=window.DOC_TIT_TRABAJO_SCHEDULE||{};
const INDICATORS_CONFIG=window.DOC_TIT_TRABAJO_INDICATORS||{};
const CONCLUSIONS_CONFIG=window.DOC_TIT_TRABAJO_CONCLUSIONS||{};
const RECOMMENDATIONS_CONFIG=window.DOC_TIT_TRABAJO_RECOMMENDATIONS||{};
const CONTENT=[
{"type":"h","text":"1. Introducción","level":1},
{"type":"h","text":"1.1. Contexto General","level":2},
{"type":"p","text":"El proceso de titulación en la educación superior constituye una etapa fundamental que marca el cierre del proceso formativo y la evaluación de competencias adquiridas por los estudiantes, permitiéndoles demostrar su capacidad para enfrentar problemas específicos de su disciplina (Montes, 2019). Según Calderón y Díaz (2017), la titulación no solo confirma la adquisición de conocimientos teóricos y prácticos, sino que también valida la aptitud del estudiante para integrarse de manera competente en el entorno profesional y contribuir al desarrollo de su campo."},
{"type":"p","text":"En el Instituto Superior Tecnológico Quito Metropolitano (ITSQMET), el proceso de titulación está estructurado para cumplir con estándares de calidad académica y garantizar una formación integral de sus estudiantes, en concordancia con los lineamientos de la educación superior en Ecuador. Tal como se plantea en la Ley Orgánica de Educación Superior (LOES), el objetivo principal de las instituciones de educación superior es asegurar que los graduados posean las habilidades necesarias para responder a las demandas del mercado laboral y contribuir significativamente al progreso del país (Castillo y Gómez, 2018)."},
{"type":"p","text":"Este enfoque también se sustenta en el concepto de eficiencia terminal, el cual busca que los estudiantes completen sus estudios en el tiempo previsto, optimizando recursos institucionales y minimizando la deserción (Torres, 2020). Según Escobar y Vásquez (2016), la eficiencia terminal es un indicador clave en las instituciones educativas, ya que impacta no solo en la reputación académica, sino también en la sostenibilidad financiera de la institución, al reducir costos asociados a la permanencia prolongada de los estudiantes en el sistema."},
{"type":"p","text":"El proceso de titulación en el ITSQMET, por lo tanto, no solo se centra en la evaluación del aprendizaje, sino que también procura asegurar que los estudiantes egresen con una formación sólida que les permita enfrentar un entorno laboral complejo y en constante cambio. En este sentido, el ITSQMET, al igual que otras instituciones educativas que buscan mantener altos estándares de calidad, promueve en sus egresados valores de ética, responsabilidad e innovación, aspectos clave para que puedan contribuir efectivamente en sus campos de especialización (González, 2019)."},
{"type":"p","text":"Este documento se encuentra alineado con el Reglamento del Proceso de Titulación vigente del ITSQMET y sus instructivos complementarios."},
{"type":"h","text":"1.2. Objetivos del Plan de Trabajo de Titulación","level":2},
{"type":"p","text":"Los objetivos principales de este Plan de Trabajo de Titulación son los siguientes:","opts":{"indent":false}},
{"type":"objective","number":1,"title":"Orientar a los Estudiantes en el Proceso de Titulación","text":"Proveer una guía detallada que acompañe a los estudiantes desde la planificación hasta la defensa de sus proyectos de titulación, asegurando que cada fase del proceso esté claramente estructurada y respaldada."},
{"type":"objective","number":2,"title":"Establecer Procedimientos Estandarizados","text":"Implementar protocolos claros y procedimientos eficientes que aseguren la homogeneidad en el desarrollo de los proyectos de titulación, facilitando la asignación de tutores, la revisión de documentos y la evaluación final de los estudiantes."},
{"type":"objective","number":3,"title":"Promover la Eficiencia Terminal","text":"Reducir el tiempo de permanencia en el proceso de titulación, asegurando que los estudiantes puedan completar sus estudios en los plazos establecidos sin comprometer la calidad del trabajo académico."},
{"type":"objective","number":4,"title":"Garantizar el Cumplimiento de Requisitos Académicos y Administrativos","text":"Asegurar que todos los requisitos relacionados con prácticas preprofesionales, vinculación, documentación, financiamiento y aprobación de créditos sean verificados y cumplidos antes de la defensa de titulación."},
{"type":"objective","number":5,"title":"Fomentar la Calidad y Rigor Académico en los Trabajos de Titulación","text":"Asegurar que los trabajos de titulación reflejen el nivel de competencia profesional y académica esperado, promoviendo la aplicación de métodos de investigación sólidos, análisis crítico y resolución de problemas específicos de cada carrera."},
{"type":"h","text":"1.3. Importancia de la Titulación y la Eficiencia Terminal","level":2},
{"type":"p","text":"La titulación es un pilar fundamental dentro de la trayectoria educativa de un estudiante, pues simboliza no solo la culminación exitosa de su formación académica, sino también el reconocimiento oficial de sus habilidades y conocimientos adquiridos en su especialidad. Un título no es simplemente un documento, sino una credencial que abre puertas en el ámbito profesional y que respalda la idoneidad y competencia del estudiante para contribuir efectivamente en su campo de trabajo. En este sentido, la titulación representa un compromiso tanto para el estudiante como para la institución, ya que asegura que los egresados posean las herramientas necesarias para enfrentar los retos y oportunidades de un entorno laboral dinámico y en constante evolución."},
{"type":"p","text":"La eficiencia terminal cobra una importancia especial en este proceso, ya que busca minimizar las barreras que puedan retrasar la finalización de los estudios. La eficiencia terminal no solo contribuye al éxito del estudiante al reducir tiempos y costos, sino que también optimiza los recursos de la institución, mejorando la tasa de graduación y fortaleciendo la reputación académica del ITSQMET. Este enfoque en la eficiencia permite que los estudiantes culminen su proceso formativo en los tiempos previstos, aumentando su motivación y facilitando su transición hacia el mercado laboral con una preparación completa y actualizada."},
{"type":"h","text":"1.4. Documentos de referencia","level":2},
{"type":"p","text":"Esta planificación se articula con los siguientes documentos institucionales:","opts":{"indent":false}},
{"type":"referenceDocs"},
{"type":"h","text":"2. Base Legal","level":1},{"type":"legalBase"},{"type":"h","text":"3. Metodología","level":1},{"type":"methodology"},{"type":"h","text":"4. Requisitos Para La Aprobación De La Titulación","level":1},{"type":"requirements"},{"type":"h","text":"5. Descripción De Los Procesos De Titulación","level":1},{"type":"processDescription"},{"type":"h","text":"6. Gestión Administrativa Y Logística","level":1},{"type":"administrativeLogistics"},{"type":"h","text":"7. Inducción De Titulación","level":1},{"type":"induction"},{"type":"h","text":"8. Informe y Autorizaciones","level":1},{"type":"authorizations"},{"type":"h","text":"9. Cronograma de Actividades","level":1},{"type":"scheduleSection"},{"type":"h","text":"10. Análisis De Resultados Y Mejora Continua","level":1},{"type":"resultsAnalysis"},{"type":"h","text":"11. Conclusiones","level":1},{"type":"conclusions"},{"type":"h","text":"12. Recomendaciones","level":1},{"type":"recommendations"},{"type":"h","text":"13. Bibliografía","level":1},{"type":"refs"}];
const REFERENCES=[
...(CONTENT_CONFIG.introduction?.bibliography||[
"Montes, P. (2019). Fundamentos de la educación superior: Teoría y práctica en el siglo XXI.",
"Calderón, M. & Díaz, P. (2017). El proceso de titulación en la educación superior y su impacto en la formación profesional.",
"Castillo, R. & Gómez, M. (2018). Educación superior en Ecuador: Retos y perspectivas.",
"Torres, A. (2020). Eficiencia y calidad en la educación superior: Desafíos para las instituciones en Latinoamérica.",
"Escobar, C. & Vásquez, J. (2016). Eficiencia terminal en la educación superior: Un análisis de su impacto en la sostenibilidad institucional.",
"González, J. (2019). Calidad educativa y titulación en instituciones técnicas y tecnológicas."
]),
"Secretaría Nacional de Planificación (SENPLADES). (2021). Plan Nacional de Desarrollo 2021-2025.",
"Consejo de Europa. (2001). Marco Común Europeo de Referencia para las Lenguas.",
"Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador. Registro Oficial 449.",
"Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior. Registro Oficial Suplemento 298.",
"Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494). Suplemento del Registro Oficial No. 110.",
"Instituto Superior Tecnológico Quito Metropolitano. (2025). Reglamento de la Unidad de Titulación y Eficiencia Terminal (UTET-REG-25, versión 2.0). Resolución N.° ITSQMET-OCS-2025-03-02/27-MAR-2025, 27 de marzo de 2025."
];
const {jsPDF}=window.jspdf;

function clean(v){return String(v??"").replace(/\s+/g," ").trim();}
function sentenceCaseHeading(text){
  const source=clean(text);
  const match=source.match(/^((?:\d+\.)+\s*)(.*)$/);
  const prefix=match?match[1]:"";
  let label=match?match[2]:source;
  if(!label)return source;
  label=label.toLocaleLowerCase("es-EC");
  const protectedTerms=[
    [/\bitsqmet\b/gi,"ITSQMET"],[/\butet\b/gi,"UTET"],[/\bugpa\b/gi,"UGPA"],
    [/\bocs\b/gi,"OCS"],[/\bloes\b/gi,"LOES"],[/\bsisacad\b/gi,"SISACAD"],
    [/\bmcer\b/gi,"MCER"],[/\ba2\b/gi,"A2"],[/\bpdf\b/gi,"PDF"],
    [/instituto superior tecnológico quito metropolitano/gi,"Instituto Superior Tecnológico Quito Metropolitano"],
    [/unidad de gestión de procesos académicos/gi,"Unidad de Gestión de Procesos Académicos"],
    [/unidad de titulación y eficiencia terminal/gi,"Unidad de Titulación y Eficiencia Terminal"],
    [/trabajo de titulación/gi,"Trabajo de Titulación"],
    [/examen complexivo/gi,"Examen Complexivo"]
  ];
  protectedTerms.forEach(([pattern,value])=>{label=label.replace(pattern,value);});
  label=label.charAt(0).toLocaleUpperCase("es-EC")+label.slice(1);
  return prefix+label;
}
function fmtDate(v){
  if(!v)return "—";
  const d=new Date(v+"T12:00:00");
  return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
}
function imageFormat(data){return /^data:image\/png/i.test(data)?"PNG":/^data:image\/webp/i.test(data)?"WEBP":"JPEG";}
function hasRows(rows){return Array.isArray(rows)&&rows.some(r=>Object.values(r||{}).some(v=>String(v??"").trim()!==""));}

async function generateAndDownload(ctx,filename){
  const doc=new jsPDF({orientation:"portrait",unit:"pt",format:"a4",compress:true});
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
  const BODY={left:72,right:72,top:106,bottom:48,font:12,line:20,indent:34};
  const bodyW=W-BODY.left-BODY.right;
  let y=BODY.top;
  const toc=[];
  const headerDone=new Set();
  let tableNo=0;

  doc.setProperties({title:TITLE,subject:"Planificación semestral del proceso de titulación",author:"ITSQMET",creator:"DOC-TIT"});

  function institutional(){
    const fallback={
      preparedBy:"Mgs. Jefferson Villarreal",preparedRole:AUTHOR_ROLE,
      reviewedBy:"Ing. Martha Tomalá",reviewedRole:"Coordinadora General de Carreras",
      approvedBy:"Dr. Alex León",approvedRole:"Vicerrector",
      unit:"Unidad de Gestión de Procesos Académicos"
    };
    try{return {...fallback,...(window.DOC_TIT_INSTITUTIONAL?.resolve?.("trabajo-titulacion")||{})};}
    catch(_){return fallback;}
  }
  function fitImage(data,x,y,maxW,maxH){
    if(!data)return;
    try{
      const props=doc.getImageProperties(data);const ratio=props.width/props.height;
      let w=maxW,h=w/ratio;if(h>maxH){h=maxH;w=h*ratio;}
      doc.addImage(data,imageFormat(data),x+(maxW-w)/2,y+(maxH-h)/2,w,h,undefined,"FAST");
    }catch(_){}
  }
  function header(){
    const p=doc.getNumberOfPages();if(headerDone.has(p))return;headerDone.add(p);
    const inst=institutional();
    const x=30,top=20,totalW=W-60,h=62,leftW=totalW*.25,centerW=totalW*.50,rightW=totalW*.25;
    doc.setDrawColor(0);doc.setLineWidth(.7);doc.rect(x,top,totalW,h);
    doc.line(x+leftW,top,x+leftW,top+h);doc.line(x+leftW+centerW,top,x+leftW+centerW,top+h);
    fitImage(ctx.assets?.logo,x+6,top+5,leftW-12,h-10);

    doc.setFont("helvetica","normal");doc.setFontSize(7.6);
    const unitLines=doc.splitTextToSize(String(inst.unit||"").toUpperCase(),centerW-14).slice(0,2);
    doc.text(unitLines,x+leftW+centerW/2,top+13,{align:"center"});
    doc.setFont("helvetica","bold");doc.setFontSize(8.6);
    const titleLines=doc.splitTextToSize(TITLE,centerW-14).slice(0,2);
    doc.text(titleLines,x+leftW+centerW/2,top+31,{align:"center"});
    doc.setFont("helvetica","normal");doc.setFontSize(7.8);
    const periodLines=doc.splitTextToSize(clean(ctx.period?.name),centerW-14).slice(0,2);
    doc.text(periodLines,x+leftW+centerW/2,top+54,{align:"center"});

    const rx=x+leftW+centerW;
    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text("Código:",rx+rightW/2,top+17,{align:"center"});
    doc.setFont("helvetica","bold");doc.setFontSize(8.1);
    const codeLines=doc.splitTextToSize(clean(ctx.code),rightW-12).slice(0,3);
    doc.text(codeLines,rx+rightW/2,top+34,{align:"center"});
  }

  function newPage(){
    doc.addPage();y=BODY.top;header();doc.setFont("times","normal");doc.setFontSize(BODY.font);
  }
  function ensure(h){if(y+h>H-BODY.bottom)newPage();}
  function paragraph(text,opts={}){
    if(!clean(text))return;
    const style=opts.bold?"bold":opts.italic?"italic":"normal";
    const indent=opts.indent===false?0:BODY.indent;
    const size=opts.size||BODY.font;
    doc.setFont("times",style);doc.setFontSize(size);
    const maxW=bodyW-indent;
    const lines=doc.splitTextToSize(clean(text),maxW);
    lines.forEach((line,i)=>{
      ensure(BODY.line);
      doc.setFont("times",style);doc.setFontSize(size);
      const x=BODY.left+(i===0?indent:0);
      const lineMax=i===0?maxW:bodyW;
      if(opts.justify===false||i===lines.length-1)doc.text(line,x,y);
      else doc.text(line,x,y,{align:"justify",maxWidth:lineMax});
      y+=BODY.line;
    });
    y+=opts.after??7;
  }
  function bullet(text){
    const raw=clean(text).replace(/^•\s*/,"");
    doc.setFont("times","normal");doc.setFontSize(12);
    const lines=doc.splitTextToSize(raw,bodyW-30);
    lines.forEach((line,i)=>{
      ensure(BODY.line);
      doc.setFont("times","normal");doc.setFontSize(12);
      if(i===0)doc.text("•",BODY.left+7,y);
      doc.text(line,BODY.left+27,y);y+=BODY.line;
    });
    y+=4;
  }
  function objective(number,title,text){
    const x=BODY.left+18,maxW=bodyW-18,lineH=BODY.line;
    const lead=`${number}. ${clean(title)}: `;
    const description=clean(text);
    doc.setFont("times","bold");doc.setFontSize(12);
    const leadLines=doc.splitTextToSize(lead,maxW);
    ensure((leadLines.length+3)*lineH);
    if(leadLines.length>1){
      leadLines.forEach(line=>{ensure(lineH);doc.setFont("times","bold");doc.text(line,x,y);y+=lineH;});
      doc.setFont("times","normal");
      doc.splitTextToSize(description,maxW).forEach(line=>{ensure(lineH);doc.text(line,x,y);y+=lineH;});
    }else{
      doc.setFont("times","bold");doc.text(lead,x,y);
      const leadW=doc.getTextWidth(lead),available=Math.max(70,maxW-leadW);
      const words=description.split(/\s+/);let first=[],rest=[];
      for(const word of words){
        const candidate=[...first,word].join(" ");
        doc.setFont("times","normal");
        if(!rest.length&&doc.getTextWidth(candidate)<=available)first.push(word);else rest.push(word);
      }
      doc.setFont("times","normal");
      if(first.length)doc.text(first.join(" "),x+leadW,y);
      y+=lineH;
      const remaining=rest.join(" ");
      if(remaining)doc.splitTextToSize(remaining,maxW).forEach(line=>{ensure(lineH);doc.text(line,x,y);y+=lineH;});
    }
    y+=5;
  }
  function legalParagraph(text){
    const raw=clean(text);if(!raw)return;
    const hanging=26,lineH=BODY.line;
    doc.setFont("times","normal");doc.setFontSize(12);
    const words=raw.split(/\s+/),lines=[];
    let current="",lineIndex=0;
    for(const word of words){
      const maxW=lineIndex===0?bodyW:bodyW-hanging;
      const candidate=current?current+" "+word:word;
      if(!current||doc.getTextWidth(candidate)<=maxW){
        current=candidate;
      }else{
        lines.push(current);lineIndex++;current=word;
      }
    }
    if(current)lines.push(current);
    ensure(Math.min(lines.length,2)*lineH+10);
    lines.forEach((line,i)=>{
      ensure(lineH);
      doc.setFont("times","normal");doc.setFontSize(12);
      const x=BODY.left+(i===0?0:hanging);
      const maxW=i===0?bodyW:bodyW-hanging;
      if(i===lines.length-1)doc.text(line,x,y);
      else doc.text(line,x,y,{align:"justify",maxWidth:maxW});
      y+=lineH;
    });
    y+=9;
  }
  function methodologyBullet(label,text){
    const bulletX=BODY.left+7,textX=BODY.left+27,maxW=bodyW-27,lineH=BODY.line;
    const lead=clean(label)+":";
    const body=clean(text);
    doc.setFont("times","bold");doc.setFontSize(12);
    const leadW=doc.getTextWidth(lead+" ");
    const words=body.split(/\s+/);let first=[],rest=[];
    for(const word of words){
      const candidate=[...first,word].join(" ");
      doc.setFont("times","normal");
      if(!rest.length&&doc.getTextWidth(candidate)<=Math.max(60,maxW-leadW))first.push(word);else rest.push(word);
    }
    ensure(lineH*2);
    doc.setFont("times","normal");doc.text("•",bulletX,y);
    doc.setFont("times","bold");doc.text(lead,textX,y);
    doc.setFont("times","normal");
    if(first.length)doc.text(first.join(" "),textX+leadW,y);
    y+=lineH;
    const remaining=rest.join(" ");
    if(remaining){
      const lines=doc.splitTextToSize(remaining,maxW);
      lines.forEach(line=>{ensure(lineH);doc.setFont("times","normal");doc.text(line,textX,y);y+=lineH;});
    }
    y+=4;
  }
  function heading(text,level=1,include=true){
    if(level===1&&y>BODY.top+3)newPage();
    const size=level===1?14:level===2?12.5:12;
    const style=level===3?"bolditalic":"bold";
    doc.setFont("times",style);doc.setFontSize(size);
    const displayText=sentenceCaseHeading(text);
    const lines=doc.splitTextToSize(displayText,bodyW);
    ensure(lines.length*22+BODY.line*3);
    if(include)toc.push({title:displayText,level,page:doc.getNumberOfPages()});
    doc.text(lines,BODY.left,y);y+=lines.length*22+10;
  }
  function inlineImage(key){
    const data=ctx.assets?.[key];if(!data)return;
    let props;try{props=doc.getImageProperties(data);}catch(_){return;}
    const maxW=bodyW*.92,maxH=180,ratio=props.width/props.height;let w=maxW,h=w/ratio;
    if(h>maxH){h=maxH;w=h*ratio;}
    if(y+h+BODY.line*4>H-BODY.bottom)newPage();
    const x=BODY.left+(bodyW-w)/2;
    try{doc.addImage(data,imageFormat(data),x,y,w,h,undefined,"FAST");}catch(_){return;}
    y+=h+18;doc.setFont("times","normal");doc.setFontSize(12);
  }
  function tableCaption(title){
    tableNo++;ensure(50);doc.setFont("times","bold");doc.setFontSize(11);doc.text("Tabla "+tableNo,BODY.left,y);y+=17;
    doc.setFont("times","italic");doc.text(title,BODY.left,y);y+=22;
  }
  function apaTable(title,head,rows,widths,note="Elaboración propia con base en los datos del período."){
    if(!rows?.length)return;
    ensure(170);tableCaption(title);
    doc.autoTable({
      startY:y,margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},theme:"plain",
      head:[head],body:rows,
      styles:{font:"times",fontSize:8.8,cellPadding:4,textColor:0,overflow:"linebreak",valign:"top"},
      showHead:"everyPage",rowPageBreak:"avoid",
      headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0},
      columnStyles:widths||{},
      didDrawPage:()=>header(),
      didDrawCell:data=>{
        const left=data.table.settings.margin.left,right=W-data.table.settings.margin.right;
        if(data.section==="head"&&data.column.index===0){doc.setDrawColor(0);doc.setLineWidth(.8);doc.line(left,data.cell.y,right,data.cell.y);doc.setLineWidth(.45);doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);}
        if(data.section==="body"&&data.row.index===data.table.body.length-1&&data.column.index===0){doc.setLineWidth(.8);doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);}
      }
    });
    y=doc.lastAutoTable.finalY+12;
    doc.setFont("times","italic");doc.setFontSize(9);
    const lines=doc.splitTextToSize("Nota. "+note,bodyW);doc.text(lines,BODY.left,y);y+=lines.length*13+22;
  }
  function cover(){
    header();
    doc.setFont("helvetica","bold");doc.setFontSize(23);
    const lines=doc.splitTextToSize(TITLE,W-120);
    doc.text(lines,W/2,236,{align:"center"});
    doc.setFontSize(17);doc.text(ctx.period.name,W/2,236+lines.length*31+30,{align:"center"});
    const top=H-260,x=36,w=W-72,col=w/3,totalH=175;
    const inst=institutional();
    const cells=[
      ["ELABORADO POR:",inst.preparedBy,inst.preparedRole],
      ["REVISADO POR:",inst.reviewedBy,inst.reviewedRole],
      ["APROBADO POR:",inst.approvedBy,inst.approvedRole]
    ];
    doc.setDrawColor(0);doc.setLineWidth(.7);
    cells.forEach((c,i)=>{
      const cx=x+i*col;doc.rect(cx,top,col,totalH);doc.line(cx,top+104,cx+col,top+104);doc.line(cx,top+138,cx+col,top+138);
      doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(c[0],cx+7,top+17);
      doc.setFont("helvetica","bold");doc.text("NOMBRE:",cx+7,top+124);doc.setFont("helvetica","normal");doc.text(doc.splitTextToSize(c[1],col-62),cx+55,top+124);
      doc.setFont("helvetica","bold");doc.text("CARGO:",cx+7,top+156);doc.setFont("helvetica","normal");doc.text(doc.splitTextToSize(c[2],col-14),cx+7,top+170);
    });
  }
  function executive(){
    heading("Resumen Ejecutivo",1,true);
    paragraph(KIND==="trabajo"
      ?"La planificación organiza de forma secuencial el desarrollo del Trabajo de Titulación, desde la asignación de tutor y lector hasta la defensa y el registro final de calificaciones, incorporando requisitos, acompañamiento académico, gestión administrativa y mecanismos de mejora continua."
      :"La planificación organiza la modalidad de titulación mediante Artículo Académico como un proceso individual, secuencial y verificable que integra inducción, tres sesiones de metodología, interrogante de investigación, refuerzos, requisitos, evaluación institucional, revisión antiplagio, defensa oral y ruta supletoria.",{indent:false});
    bullet("Período académico: "+ctx.period.name+".");
    bullet("Código documental: "+ctx.code+".");
    bullet("El cronograma importado desde la plantilla constituye la fuente operativa de fechas para el período.");
    if(clean(ctx.payload?.notes))bullet("La planificación incorpora observaciones específicas registradas por el usuario para este período.");
  }
  function resolveScheduleStructure(){
    const snapshot=ctx.payload?.contentSnapshots?.scheduleStructure;
    if(snapshot&&Array.isArray(snapshot.activities)&&snapshot.activities.length&&Array.isArray(snapshot.phases)&&snapshot.phases.length)return snapshot;
    const current=SCHEDULE_CONFIG;
    if(current&&Array.isArray(current.activities)&&current.activities.length&&Array.isArray(current.phases)&&current.phases.length)return current;
    return null;
  }
  function scheduleDateText(r){
    if(r.start&&r.end)return `${fmtDate(r.start)} – ${fmtDate(r.end)}`;
    if(r.deadline)return `Hasta ${fmtDate(r.deadline)}`;
    if(r.start)return fmtDate(r.start);
    if(r.end)return fmtDate(r.end);
    return "";
  }
  function schedulePdfErrors(rows){
    const errors=[];
    (rows||[]).filter(r=>r.active!==false).forEach((r,i)=>{
      const name=clean(r.activity)||`Actividad ${i+1}`;
      if(!r.start&&!r.end&&!r.deadline)errors.push(`${name}: falta fecha o plazo.`);
      if(r.start&&r.end&&r.end<r.start)errors.push(`${name}: la fecha final no puede ser anterior a la inicial.`);
      const combined=[r.activity,r.description,r.responsible,r.observation].map(clean).join(" ");
      if(/\b(por definir|n\/?a|pendiente|sin fecha)\b/i.test(combined))errors.push(`${name}: contiene un texto no permitido.`);
    });
    return errors;
  }
  function sectionNote(text){
    const raw=clean(text);if(!raw)return;
    ensure(BODY.line*2);
    doc.setFont("times","italic");doc.setFontSize(9.5);
    const lines=doc.splitTextToSize("Nota: "+raw,bodyW);
    doc.text(lines,BODY.left,y);y+=lines.length*14+18;
    doc.setFont("times","normal");doc.setFontSize(12);
  }
  function renderScheduleSection(){
    const structure=resolveScheduleStructure();
    if(!structure)throw new Error("No existe una configuración institucional validada del cronograma de Trabajo de Titulación.");
    paragraph(structure.intro||"");
    heading("9.1. Calendario de Actividades por Proceso",2,true);
    const activeRows=(ctx.payload.schedule||[]).filter(r=>r.active!==false).slice().sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999));
    const errors=schedulePdfErrors(activeRows);
    if(errors.length)throw new Error("El cronograma no está listo para generar: "+errors.join(" "));
    const table=structure.table||{};
    const rows=activeRows.map(r=>[r.activity||"",scheduleDateText(r),r.description||"",r.responsible||""]);
    apaTable(table.title||"Calendario de actividades por proceso",table.columns||["Actividad","Fecha / Plazo","Descripción","Responsable"],rows,{0:{cellWidth:bodyW*.24},1:{cellWidth:bodyW*.17},2:{cellWidth:bodyW*.35},3:{cellWidth:bodyW*.24}},table.note||"");
    heading("9.2. Fases Del Trabajo De Titulación",2,true);
    paragraph(structure.phasesIntro||"");
    (structure.phases||[]).slice().sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999)).forEach((phase,i)=>{
      processNumberedTitle(phase.order||i+1,phase.title||"");
      processText(phase.text||"",1,"o");
    });
    sectionNote(structure.phasesNote||"");
  }
  function renderOptionalData(){
    const tables=ctx.payload.tables||{};
    if(hasRows(tables.carreras)){
      heading("Datos Operativos Por Carrera",2,true);
      paragraph("La siguiente tabla se incluye únicamente porque el usuario registró información por carrera en la plantilla. No constituye un requisito obligatorio para generar esta planificación.",{indent:false});
      apaTable("Datos operativos por carrera",["Carrera","Modalidad","Lugar","Cantidad"],tables.carreras.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.career||"",r.modality||"",r.place||"",String(r.count??"")]),{0:{cellWidth:bodyW*.48},1:{cellWidth:bodyW*.18},2:{cellWidth:bodyW*.18},3:{cellWidth:bodyW*.16}});
    }
  }
  function renderNotes(){
    if(!clean(ctx.payload?.notes))return;
    heading("Información adicional del período",2,true);
    String(ctx.payload.notes).split(/\n+/).map(clean).filter(Boolean).forEach(p=>paragraph(p,{indent:false}));
  }
  function resolveLegalBase(){
    const snapshot=ctx.payload?.contentSnapshots?.legalBase;
    if(snapshot&&Array.isArray(snapshot.paragraphs)&&snapshot.paragraphs.length)return snapshot;
    const current=CONTENT_CONFIG.legalBase;
    if(current&&Array.isArray(current.paragraphs)&&current.paragraphs.length)return current;
    return null;
  }
  function renderLegalBase(){
    const block=resolveLegalBase();
    if(!block)throw new Error("No existe una Base Legal validada para Trabajo de Titulación.");
    block.paragraphs.forEach(item=>legalParagraph(item));
  }
  function resolveMethodology(){
    const snapshot=ctx.payload?.contentSnapshots?.methodology;
    if(snapshot&&snapshot.process&&Array.isArray(snapshot.phases)&&snapshot.phases.length)return snapshot;
    const current=CONTENT_CONFIG.methodology;
    if(current&&current.process&&Array.isArray(current.phases)&&current.phases.length)return current;
    return null;
  }
  function renderMethodology(){
    const block=resolveMethodology();
    if(!block)throw new Error("No existe una metodología validada para Trabajo de Titulación.");
    const process=block.process||{};
    heading(`3.1. Proceso De Trabajo De Titulación (${clean(process.code)})`,2,true);
    (block.processParagraphs||[]).forEach(item=>paragraph(item));
    heading("3.2. Fases Del Trabajo De Titulación",2,true);
    paragraph(block.phasesIntro||"");
    (block.phases||[]).forEach(phase=>{
      heading(`${phase.number} ${phase.title}`,3,true);
      (phase.paragraphs||[]).forEach(item=>paragraph(item));
      (phase.bullets||[]).forEach(item=>{
        const raw=clean(item);const pos=raw.indexOf(":");
        if(pos>0)methodologyBullet(raw.slice(0,pos),raw.slice(pos+1));
        else bullet(raw);
      });
      if(clean(phase.closingParagraph))paragraph(phase.closingParagraph);
    });
  }
  function resolveRequirements(){
    const snapshot=ctx.payload?.contentSnapshots?.requirements;
    if(snapshot&&snapshot.academic&&snapshot.documentation)return snapshot;
    const current=window.DOC_TIT_TRABAJO_REQUIREMENTS;
    if(current&&current.academic&&current.documentation)return current;
    return null;
  }
  function listHeading(text){
    const raw=clean(text);if(!raw)return;
    doc.setFont("times","bold");doc.setFontSize(12);
    const lines=doc.splitTextToSize(raw,bodyW-18);
    ensure(lines.length*BODY.line+8);
    doc.text(lines,BODY.left+18,y);y+=lines.length*BODY.line+5;
  }
  function renderRequirementItems(items){
    (items||[]).forEach(item=>{
      if(typeof item==="string")bullet(item);
      else if(item&&clean(item.label))methodologyBullet(item.label,item.text||"");
    });
  }
  function renderRequirementGroups(groups){
    (groups||[]).forEach(group=>{
      listHeading(group.title||"");
      renderRequirementItems(group.items||[]);
    });
  }
  function renderRequirements(){
    const block=resolveRequirements();
    if(!block)throw new Error("No existe una configuración institucional validada de requisitos de titulación.");

    paragraph(block.intro||"");

    const academic=block.academic||{};
    heading("4.1. Requisitos Académicos",2,true);
    paragraph(academic.intro||"");
    heading("4.1.1. Malla Curricular Completa",3,true);
    paragraph(academic.curriculum||"");
    heading("4.1.2. Materias Transversales",3,true);
    paragraph(academic.transversal?.intro||"");
    renderRequirementItems(academic.transversal?.items||[]);
    heading("4.1.3. Materias Autónomas",3,true);
    paragraph(academic.autonomous?.intro||"");
    renderRequirementItems(academic.autonomous?.items||[]);

    const documentation=block.documentation||{};
    heading("4.2. Requisitos de Documentación",2,true);
    paragraph(documentation.intro||"");
    heading("4.2.1. Modalidades Híbrida, Presencial y Online",3,true);
    paragraph(documentation.modalityIntro||"");
    renderRequirementGroups(documentation.groups||[]);
    // El documento fuente contiene un segundo bloque documental sin encabezado de categoría.
    // Se reproduce sin inventar una modalidad o categoría inexistente.
    renderRequirementGroups(documentation.unidentifiedContinuation||[]);

    const financial=block.financial||{};
    heading("4.3. Requisitos Financieros",2,true);
    paragraph(financial.intro||"");
    heading("4.3.1. Requisitos Financieros Generales",3,true);
    paragraph(financial.generalIntro||"");
    renderRequirementItems(financial.items||[]);

    const engagement=block.communityEngagement||{};
    heading("4.4. Vinculación con la Sociedad",2,true);
    paragraph(engagement.intro||"");
    heading("4.4.1. Importancia de la Vinculación con la Sociedad",3,true);
    paragraph(engagement.importance||"");
    heading("4.4.2. Requisitos para la Vinculación con la Sociedad",3,true);
    paragraph(engagement.requirementsIntro||"");
    renderRequirementItems(engagement.requirements||[]);
    heading("4.4.3. Ejemplos de Proyectos de Vinculación por Carrera",3,true);
    paragraph(engagement.examplesIntro||"");
    (engagement.examples||[]).forEach(item=>methodologyBullet(item.career,item.text||""));

    const internships=block.internships||{};
    heading("4.5. Prácticas Preprofesionales",2,true);
    paragraph(internships.intro||"");
    heading("4.5.1. Objetivo e Importancia de las Prácticas Preprofesionales",3,true);
    paragraph(internships.importance||"");
    heading("4.5.2. Requisitos para la Realización de las Prácticas Preprofesionales",3,true);
    paragraph(internships.requirementsIntro||"");
    renderRequirementItems(internships.requirements||[]);
    heading("4.5.3. Documentación de Culminación de Prácticas Preprofesionales",3,true);
    paragraph(internships.completionIntro||"");
    renderRequirementItems(internships.completionDocuments||[]);

    const language=block.foreignLanguage||{};
    heading("4.6. Requisito de Lengua Extranjera",2,true);
    (language.intro||[]).forEach(item=>paragraph(item));
    heading("4.6.1. Objetivo del Requisito de Lengua Extranjera",3,true);
    paragraph(language.objective||"");
    heading("4.6.2. Cumplimiento del Nivel A2 en Lengua Extranjera",3,true);
    paragraph(language.complianceIntro||"");
    renderRequirementGroups(language.compliance||[]);
    heading("4.6.3. Procedimiento para la Entrega del Certificado de Nivel A2",3,true);
    renderRequirementGroups(language.certificateProcedure||[]);

    const dataUpdate=block.dataUpdate||{};
    heading("4.7. Actualización de Datos",2,true);
    paragraph(dataUpdate.intro||"");
    heading("4.7.1. Objetivo de la Actualización de Datos",3,true);
    paragraph(dataUpdate.objective||"");
    heading("4.7.2. Procedimiento para la Actualización de Datos",3,true);
    paragraph(dataUpdate.procedureIntro||"");
    renderRequirementGroups(dataUpdate.procedure||[]);
    heading("4.7.3. Importancia de la Actualización de Datos",3,true);
    paragraph(dataUpdate.importanceIntro||"");
    renderRequirementItems(dataUpdate.importance||[]);
  }
  function resolveProcessDescription(){
    const snapshot=ctx.payload?.contentSnapshots?.processDescription;
    if(snapshot&&snapshot.assignment&&snapshot.projectDevelopment&&snapshot.grades&&snapshot.defense)return snapshot;
    const current=PROCESS_CONFIG;
    if(current&&current.assignment&&current.projectDevelopment&&current.grades&&current.defense)return current;
    return null;
  }
  function processText(text,level=1,marker="o"){
    const raw=clean(text);if(!raw)return;
    const markerX=BODY.left+(level===1?24:50);
    const textX=markerX+14;
    const maxW=W-BODY.right-textX;
    doc.setFont("times","normal");doc.setFontSize(12);
    const lines=doc.splitTextToSize(raw,maxW);
    ensure(Math.min(lines.length,2)*BODY.line+5);
    lines.forEach((line,i)=>{
      ensure(BODY.line);
      doc.setFont("times","normal");doc.setFontSize(12);
      if(i===0&&marker)doc.text(marker,markerX,y);
      if(i===lines.length-1)doc.text(line,textX,y);
      else doc.text(line,textX,y,{align:"justify",maxWidth:maxW});
      y+=BODY.line;
    });
    y+=3;
  }
  function processBullet(label,text,level=1,marker="o"){
    const cleanLabel=clean(label),raw=clean(text);
    if(!cleanLabel){processText(raw,level,marker);return;}
    const markerX=BODY.left+(level===1?24:50);
    const textX=markerX+14;
    const maxW=W-BODY.right-textX;
    const lead=cleanLabel+":";
    doc.setFont("times","bold");doc.setFontSize(12);
    const leadW=doc.getTextWidth(lead+" ");
    const words=raw.split(/\s+/).filter(Boolean);let first=[],rest=[];
    for(const word of words){
      const candidate=[...first,word].join(" ");
      doc.setFont("times","normal");
      if(!rest.length&&doc.getTextWidth(candidate)<=Math.max(48,maxW-leadW))first.push(word);else rest.push(word);
    }
    ensure(BODY.line*2);
    doc.setFont("times","normal");doc.text(marker,markerX,y);
    doc.setFont("times","bold");doc.text(lead,textX,y);
    doc.setFont("times","normal");
    if(first.length)doc.text(first.join(" "),textX+leadW,y);
    y+=BODY.line;
    const remaining=rest.join(" ");
    if(remaining){
      const lines=doc.splitTextToSize(remaining,maxW);
      lines.forEach((line,i)=>{
        ensure(BODY.line);doc.setFont("times","normal");
        if(i===lines.length-1)doc.text(line,textX,y);
        else doc.text(line,textX,y,{align:"justify",maxWidth:maxW});
        y+=BODY.line;
      });
    }
    y+=3;
  }
  function processNumberedTitle(number,title){
    listHeading(`${number}. ${clean(title)}:`);
  }
  function renderProcessSteps(steps,criteria=[]){
    (steps||[]).forEach(step=>{
      processNumberedTitle(step.number,step.title);
      (step.paragraphs||[]).forEach(p=>processText(p,1,"o"));
      if(step.criteria)(criteria||[]).forEach(item=>processBullet(item.label,item.text,2,"▪"));
      if(clean(step.closing))processText(step.closing,1,"o");
    });
  }
  function renderProcessDescription(){
    const block=resolveProcessDescription();
    if(!block)throw new Error("No existe una versión institucional validada del proceso de Trabajo de Titulación.");

    const assignment=block.assignment||{};
    heading("5.1. Asignación de Tutor y Lector",2,true);
    paragraph(assignment.intro||"");
    heading("5.1.1. Criterios para la Asignación de Tutor y Lector",3,true);
    paragraph(assignment.criteriaIntro||"");
    (assignment.criteria||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      processText(item.text,1,"o");
    });
    heading("5.1.2. Responsabilidades del Tutor y del Lector",3,true);
    paragraph(assignment.responsibilitiesIntro||"");
    listHeading("1. Responsabilidades del Tutor:");
    (assignment.tutorResponsibilities||[]).forEach(item=>processBullet(item.label,item.text,1,"o"));
    listHeading("2. Responsabilidades del Lector:");
    (assignment.readerResponsibilities||[]).forEach(item=>processBullet(item.label,item.text,1,"o"));

    const project=block.projectDevelopment||{};
    heading("5.2. Desarrollo del Proyecto de Tesis",2,true);
    paragraph(project.intro||"");
    heading("5.2.1. Requisitos de Marco Investigativo, Hipótesis y Resolución",3,true);
    paragraph(project.structureIntro||"");
    (project.structure||[]).forEach(group=>{
      processNumberedTitle(group.number,group.title);
      processText(group.intro||"",1,"o");
      (group.items||[]).forEach(item=>processBullet(item.label,item.text,2,"▪"));
    });
    heading("5.2.2. Plazos y Entregas del Proyecto de Tesis",3,true);
    paragraph(project.milestonesIntro||"");
    (project.milestones||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      processBullet("Fecha límite",item.deadline||"",1,"o");
      processText(item.text||"",1,"o");
    });
    paragraph(project.milestonesClosing||"");

    const grades=block.grades||{};
    heading("5.3. Envío y Registro de Notas",2,true);
    paragraph(grades.intro||"");
    heading("5.3.1. Proceso de Envío de Notas por el Tutor y el Lector",3,true);
    renderProcessSteps(grades.sendingSteps||[]);
    heading("5.3.2. Registro de Notas en el Sistema Institucional",3,true);
    renderProcessSteps(grades.registrationSteps||[]);

    const defense=block.defense||{};
    heading("5.4. Organización de la Defensa de Grado",2,true);
    paragraph(defense.intro||"");
    heading("5.4.1. Designación de Fecha para la Defensa",3,true);
    renderProcessSteps(defense.dateSteps||[]);
    heading("5.4.2. Composición del Tribunal de Defensa",3,true);
    listHeading("1. Miembros del Tribunal:");
    processText(`El tribunal evaluador está compuesto por ${defense.tribunal?.memberCount||3} miembros, seleccionados en función de su experiencia y conocimiento en el área temática de la tesis. Los roles en el tribunal son los siguientes:`,1,"o");
    (defense.tribunal?.roles||[]).forEach(item=>processBullet(item.label,item.text,2,"▪"));
    listHeading("2. Criterios de Selección:");
    processText(defense.tribunal?.selection||"",1,"o");
    listHeading("3. Roles y Responsabilidades:");
    processText(defense.tribunal?.responsibilities||"",1,"o");
    heading("5.4.3. Procedimiento de Evaluación en la Defensa de Grado",3,true);
    renderProcessSteps(defense.evaluationSteps||[],defense.evaluationCriteria||[]);
  }
  function resolveAdministrativeLogistics(){
    const snapshot=ctx.payload?.contentSnapshots?.administrativeLogistics;
    if(snapshot&&snapshot.assignmentsTable&&snapshot.digitalResourcesTable&&snapshot.communication)return snapshot;
    const current=LOGISTICS_CONFIG;
    if(current&&current.assignmentsTable&&current.digitalResourcesTable&&current.communication)return current;
    return null;
  }
  function renderAdministrativeLogistics(){
    const block=resolveAdministrativeLogistics();
    if(!block)throw new Error("No existe una configuración institucional validada de Gestión Administrativa y Logística.");

    paragraph(block.intro||"");

    const assignments=block.assignmentsTable||{};
    const assignmentRows=(assignments.rows||[])
      .slice()
      .sort((a,b)=>(a.order||0)-(b.order||0))
      .map(r=>[r.element||"",r.description||"",r.quantity||"",r.responsibleRole||""]);
    apaTable(
      assignments.title||"Elementos y Asignaciones para el Proceso de Titulación",
      assignments.columns||["Elemento","Descripción","Cantidad por estudiante","Responsable"],
      assignmentRows,
      {0:{cellWidth:bodyW*.20},1:{cellWidth:bodyW*.39},2:{cellWidth:bodyW*.18},3:{cellWidth:bodyW*.23}},
      assignments.note||""
    );

    const resources=block.digitalResourcesTable||{};
    const resourceRows=(resources.resources||[])
      .filter(r=>r.active!==false)
      .slice()
      .sort((a,b)=>(a.order||0)-(b.order||0))
      .map(r=>[r.name||"",r.description||"",r.studentAccess||"",r.responsibleRole||""]);
    apaTable(
      resources.title||"Recursos Digitales Asignados para el Proceso de Titulación",
      resources.columns||["Recurso Digital","Descripción","Acceso por Estudiante","Responsable de Gestión"],
      resourceRows,
      {0:{cellWidth:bodyW*.19},1:{cellWidth:bodyW*.39},2:{cellWidth:bodyW*.18},3:{cellWidth:bodyW*.24}},
      resources.note||""
    );

    const communication=block.communication||{};
    heading("6.1. Comunicación Directa con el Tutor y el Coordinador de Titulación",2,true);
    paragraph(communication.intro||"");

    heading("6.1.1. Seguimiento Individual por el Tutor",3,true);
    (communication.tutorFollowUp||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      (item.paragraphs||[]).forEach(p=>processText(p,1,"o"));
    });

    heading("6.1.2. Coordinación con el Coordinador de Titulación",3,true);
    (communication.coordinatorFollowUp||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      (item.paragraphs||[]).forEach(p=>processText(p,1,"o"));
    });
    if(clean(communication.closing))paragraph(communication.closing);
  }
  function resolveAuthorizations(){
    const snapshot=ctx.payload?.contentSnapshots?.authorizations;
    if(snapshot&&snapshot.report&&snapshot.financialPermissions)return snapshot;
    const current=AUTHORIZATIONS_CONFIG;
    if(current&&current.report&&current.financialPermissions)return current;
    return null;
  }
  function renderAuthorizations(){
    const block=resolveAuthorizations();
    if(!block)throw new Error("No existe una configuración institucional validada de Informe y Autorizaciones.");
    paragraph(block.intro||"");

    const report=block.report||{};
    heading("8.1. Desarrollo del Informe de Titulación",2,true);
    paragraph(report.intro||"");
    heading("8.1.1. Seguimiento y Evaluación de Gestiones",3,true);
    (report.tracking||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      processText(item.text||"",1,"o");
    });

    const financial=block.financialPermissions||{};
    heading("8.2. Permisos y Autorizaciones Financieras",2,true);
    paragraph(financial.intro||"");
    heading("8.2.1. Gestión de Permisos para Estudiantes con Pagos Pendientes",3,true);
    (financial.temporaryPermission||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      processText(item.text||"",1,"o");
    });
    heading("8.2.2. Aprobación por el Departamento de Facturación",3,true);
    (financial.billingApproval||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      processText(item.text||"",1,"o");
    });
  }
  function resolveInduction(){
    const snapshot=ctx.payload?.contentSnapshots?.induction;
    if(snapshot&&Array.isArray(snapshot.modalities)&&snapshot.modalities.length&&Array.isArray(snapshot.orientation)&&Array.isArray(snapshot.communication))return snapshot;
    const current=INDUCTION_CONFIG;
    if(current&&Array.isArray(current.modalities)&&current.modalities.length&&Array.isArray(current.orientation)&&Array.isArray(current.communication))return current;
    return null;
  }
  function renderInduction(){
    const block=resolveInduction();
    if(!block)throw new Error("No existe una configuración institucional validada de Inducción de Titulación.");

    paragraph(block.intro||"");

    heading("7.1. Orientación sobre Modalidades de Titulación (Complexivo y Tesis)",2,true);
    (block.orientation||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      (item.paragraphs||[]).forEach(p=>processText(p,1,"o"));
    });

    heading("7.2. Comunicación de Fechas y Procesos Relevantes",2,true);
    (block.communication||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      (item.paragraphs||[]).forEach(p=>processText(p,1,"o"));
    });
  }
  function resolveResultsAnalysis(){
    const snapshot=ctx.payload?.contentSnapshots?.resultsAnalysis;
    if(snapshot&&Array.isArray(snapshot.indicators)&&snapshot.indicators.length)return snapshot;
    const current=INDICATORS_CONFIG;
    if(current&&Array.isArray(current.indicators)&&current.indicators.length)return current;
    return null;
  }
  function validateIndicatorCatalog(block){
    const active=(block?.indicators||[]).filter(item=>item?.active!==false);
    if(!active.length)throw new Error("No existe un catálogo institucional activo de indicadores de titulación.");
    active.forEach((item,index)=>{
      if(!clean(item.name)||!clean(item.description)||!clean(item.formulaText)){
        throw new Error(`El indicador ${item?.id||index+1} no tiene nombre, descripción y fórmula institucional completos.`);
      }
    });
    return active.slice().sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999));
  }
  function renderResultsAnalysis(){
    const block=resolveResultsAnalysis();
    if(!block)throw new Error("No existe una configuración institucional validada de indicadores de titulación.");
    const indicators=validateIndicatorCatalog(block);

    paragraph(block.intro||"");
    paragraph(block.lead||"Los indicadores utilizados incluyen:",{indent:false});

    indicators.forEach(indicator=>{
      processBullet(indicator.name||"",indicator.description||"",1,"•");
      processBullet("Fórmula",indicator.formulaText||"",1,"");
    });

    if(clean(block.sourcesText))paragraph(block.sourcesText);
    else if(Array.isArray(block.informationSources)&&block.informationSources.length){
      paragraph(`La información se recopila desde fuentes oficiales como ${block.informationSources.join(", ")}.`);
    }
    if(clean(block.improvementText))paragraph(block.improvementText);
  }
  function numberedParagraph(number,text){
    const raw=clean(text);if(!raw)return;
    const lead=`${number}. `,x=BODY.left,maxW=bodyW,lineH=BODY.line;
    doc.setFont("times","bold");doc.setFontSize(12);const leadW=doc.getTextWidth(lead);
    const words=raw.split(/\s+/).filter(Boolean);let first=[],rest=[];
    for(const word of words){
      const candidate=[...first,word].join(" ");doc.setFont("times","normal");
      if(!rest.length&&doc.getTextWidth(candidate)<=Math.max(60,maxW-leadW))first.push(word);else rest.push(word);
    }
    ensure(lineH*2);doc.setFont("times","bold");doc.text(lead,x,y);doc.setFont("times","normal");
    if(first.length)doc.text(first.join(" "),x+leadW,y);y+=lineH;
    const remaining=rest.join(" ");
    if(remaining){const lines=doc.splitTextToSize(remaining,maxW);lines.forEach((line,i)=>{ensure(lineH);if(i===lines.length-1)doc.text(line,x,y);else doc.text(line,x,y,{align:"justify",maxWidth:maxW});y+=lineH;});}
    y+=7;
  }
  function resolveConclusions(){
    const snapshot=ctx.payload?.contentSnapshots?.conclusions;
    if(snapshot&&Array.isArray(snapshot.conclusions)&&snapshot.conclusions.length)return snapshot;
    const current=CONCLUSIONS_CONFIG;
    if(current&&Array.isArray(current.conclusions)&&current.conclusions.length)return current;
    return null;
  }
  function conclusionConditionMet(item){
    const condition=clean(item?.condition||"always").toLowerCase();
    if(!condition||condition==="always")return true;
    if(condition==="cronograma_aprobado")return ctx.payload?.scheduleMeta?.status==="Aprobado";
    return false;
  }
  function conclusionText(item){
    let raw=String(item?.textBase||"");
    const allowed=new Set(item?.variablesAllowed||[]);
    if(raw.includes("[PERIODO_ACADEMICO]")){
      if(!allowed.has("PERIODO_ACADEMICO"))throw new Error(`La conclusión ${item?.id||""} intenta usar una variable no autorizada.`);
      const periodName=clean(ctx.period?.name);
      if(!periodName)throw new Error("No existe un período académico seleccionado para generar las conclusiones.");
      raw=raw.replaceAll("[PERIODO_ACADEMICO]",periodName);
    }
    return clean(raw);
  }
  function renderConclusions(){
    const block=resolveConclusions();
    if(!block)throw new Error("No existe una configuración institucional validada de conclusiones de planificación.");
    const active=(block.conclusions||[]).filter(item=>item?.active!==false).slice().sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999));
    if(!active.length)throw new Error("No existen conclusiones institucionales activas para esta planificación.");
    const forbidden=(block.forbiddenExecutionPhrases||[]).map(x=>clean(x).toLowerCase()).filter(Boolean);
    active.forEach((item,index)=>{
      if(!conclusionConditionMet(item)){
        if(clean(item?.condition).toLowerCase()==="cronograma_aprobado")throw new Error("Para generar las conclusiones, el cronograma del período debe estar completo y aprobado.");
        return;
      }
      const raw=conclusionText(item);
      if(!raw)throw new Error(`La conclusión ${item?.id||index+1} no tiene texto institucional.`);
      const lower=raw.toLowerCase();
      const bad=forbidden.find(phrase=>lower.includes(phrase));
      if(bad)throw new Error(`La conclusión ${item?.id||index+1} contiene lenguaje de resultados no permitido: “${bad}”.`);
      numberedParagraph(index+1,raw);
    });
  }
  function resolveRecommendations(){
    const snapshot=ctx.payload?.contentSnapshots?.recommendations;
    if(snapshot&&Array.isArray(snapshot.recommendations)&&snapshot.recommendations.length)return snapshot;
    const current=RECOMMENDATIONS_CONFIG;
    if(current&&Array.isArray(current.recommendations)&&current.recommendations.length)return current;
    return null;
  }
  function recommendationConditionMet(item){
    const condition=clean(item?.condition||"always").toLowerCase();
    if(!condition||condition==="always")return true;
    if(condition==="cronograma_aprobado")return ctx.payload?.scheduleMeta?.status==="Aprobado";
    return false;
  }
  function recommendationText(item){
    let raw=String(item?.textBase||"");
    const allowed=new Set(item?.variablesAllowed||[]);
    if(raw.includes("[PERIODO_ACADEMICO]")){
      if(!allowed.has("PERIODO_ACADEMICO"))throw new Error(`La recomendación ${item?.id||""} intenta usar una variable no autorizada.`);
      const periodName=clean(ctx.period?.name);
      if(!periodName)throw new Error("No existe un período académico seleccionado para generar las recomendaciones.");
      raw=raw.replaceAll("[PERIODO_ACADEMICO]",periodName);
    }
    return clean(raw);
  }
  function renderRecommendations(){
    const block=resolveRecommendations();
    if(!block)throw new Error("No existe una configuración institucional validada de recomendaciones de planificación.");
    const active=(block.recommendations||[]).filter(item=>item?.active!==false).slice().sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999));
    if(!active.length)throw new Error("No existen recomendaciones institucionales activas para esta planificación.");
    const forbidden=(block.forbiddenResultPhrases||[]).map(x=>clean(x).toLowerCase()).filter(Boolean);
    active.forEach((item,index)=>{
      if(!recommendationConditionMet(item)){
        if(clean(item?.condition).toLowerCase()==="cronograma_aprobado")throw new Error("Para generar las recomendaciones, el cronograma del período debe estar completo y aprobado.");
        return;
      }
      const raw=recommendationText(item);
      if(!raw)throw new Error(`La recomendación ${item?.id||index+1} no tiene texto institucional.`);
      const lower=raw.toLowerCase();
      const bad=forbidden.find(phrase=>lower.includes(phrase));
      if(bad)throw new Error(`La recomendación ${item?.id||index+1} contiene lenguaje de resultados no permitido: “${bad}”.`);
      numberedParagraph(index+1,raw);
    });
  }
  function renderReferenceDocuments(){
    const docs=CONTENT_CONFIG.introduction?.referenceDocuments||[
      "Reglamento de Titulación del ITSQMET.",
      "Instructivo para el Proceso de Titulación.",
      "Formatos oficiales de evaluación y seguimiento.",
      "Cronograma institucional aprobado para el período académico vigente."
    ];
    docs.forEach(item=>bullet(item));
  }
  function renderReferences(){
    REFERENCES.forEach(ref=>paragraph(ref,{indent:false}));
  }
  function renderCustom(name){
  const tables=ctx.payload.tables||{};
  if(name==="tutors"){
    if(hasRows(tables.tutores)){
      apaTable("Asignaciones de tutor y lector del período",["Carrera","Tutor","Lector","Observaciones"],tables.tutores.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.career||"",r.tutor||"",r.reader||"",r.observations||""]),{0:{cellWidth:bodyW*.28},1:{cellWidth:bodyW*.24},2:{cellWidth:bodyW*.24},3:{cellWidth:bodyW*.24}});
    }
  }else if(name==="defenses"){
    if(hasRows(tables.defensas)){
      apaTable("Organización de defensas del período",["Carrera","Inicio","Fin","Modalidad","Observaciones"],tables.defensas.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.career||"",fmtDate(r.start),fmtDate(r.end),r.mode||"",r.observations||""]),{0:{cellWidth:bodyW*.30},1:{cellWidth:bodyW*.14},2:{cellWidth:bodyW*.14},3:{cellWidth:bodyW*.15},4:{cellWidth:bodyW*.27}});
    }

  }
}

  function renderItems(){
    for(const item of CONTENT){
      if(item.type==="h")heading(item.text,item.level||1,item.toc!==false);
      else if(item.type==="p")paragraph(item.text,item.opts||{});
      else if(item.type==="b")bullet(item.text);
      else if(item.type==="objective")objective(item.number,item.title,item.text);
      else if(item.type==="referenceDocs")renderReferenceDocuments();
      else if(item.type==="legalBase")renderLegalBase();
      else if(item.type==="methodology")renderMethodology();
      else if(item.type==="requirements")renderRequirements();
      else if(item.type==="processDescription")renderProcessDescription();
      else if(item.type==="administrativeLogistics")renderAdministrativeLogistics();
      else if(item.type==="induction")renderInduction();
      else if(item.type==="authorizations")renderAuthorizations();
      else if(item.type==="image")inlineImage(item.key);
      else if(item.type==="scheduleSection")renderScheduleSection();
      else if(item.type==="resultsAnalysis")renderResultsAnalysis();
      else if(item.type==="conclusions")renderConclusions();
      else if(item.type==="recommendations")renderRecommendations();
      else if(item.type==="optional")renderOptionalData();
      else if(item.type==="notes")renderNotes();
      else if(item.type==="refs")renderReferences();
      else if(item.type==="custom"&&typeof renderCustom==="function")renderCustom(item.name);
    }
  }

  cover();newPage();newPage();newPage();executive();renderItems();

  const unique=[];const seen=new Set();
  toc.forEach(e=>{const k=e.title.toLowerCase();if(!seen.has(k)){seen.add(k);unique.push(e);}});
  const half=Math.ceil(unique.length/2);
  function drawToc(page,entries,title){
    doc.setPage(page);let ty=BODY.top;
    if(title){doc.setFont("times","bold");doc.setFontSize(14);doc.text(title,W/2,ty,{align:"center"});ty+=34;}
    entries.forEach(e=>{
      doc.setFont("times",e.level===1?"bold":"normal");doc.setFontSize(10);
      const indent=e.level===1?0:e.level===2?18:32;
      const label=doc.splitTextToSize(e.title,bodyW-indent-44);
      doc.text(label,BODY.left+indent,ty);
      const lastY=ty+(label.length-1)*15;
      doc.text(String(e.page),W-BODY.right,lastY,{align:"right"});
      ty+=Math.max(18,label.length*15);
    });
  }
  drawToc(2,unique.slice(0,half),"Índice");
  drawToc(3,unique.slice(half),"");

  const total=doc.getNumberOfPages();
  for(let p=2;p<=total;p++){
    doc.setPage(p);doc.setFont("helvetica","normal");doc.setFontSize(9);
    doc.text("Página "+p+" de "+total,W-36,H-22,{align:"right"});
  }
  const finalName=(filename||ctx.code+" - "+TITLE+".pdf").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();
  const blob=doc.output("blob");doc.save(finalName);
  return{pages:total,filename:finalName,blob};
}
window.DocTitFullDocument={generateAndDownload};
})();