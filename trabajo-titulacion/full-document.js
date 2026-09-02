(() => {
"use strict";
const TYPE="trabajo";
const {jsPDF}=window.jspdf;

function clean(v){return String(v??"").replace(/\s+/g," ").trim();}
function fmtDate(v){if(!v)return"—";const d=new Date(v+"T12:00:00");return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);}
function imageFormat(data){return /^data:image\/png/i.test(data)?"PNG":/^data:image\/webp/i.test(data)?"WEBP":"JPEG";}

async function generateAndDownload(ctx,filename){
  const doc=new jsPDF({orientation:"portrait",unit:"pt",format:"a4",compress:true});
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
  const BODY={left:72,right:72,top:110,bottom:52,font:12,line:21,indent:32};
  const bodyW=W-BODY.left-BODY.right;
  let y=BODY.top;
  const toc=[];
  const headerDone=new Set();
  let tableNo=0;

  doc.setProperties({title:ctx.config.title,subject:"Planificación semestral del proceso de titulación",author:"Unidad de Titulación y Eficiencia Terminal",creator:"DOC-TIT"});

  function header(){
    const p=doc.getNumberOfPages();if(headerDone.has(p))return;headerDone.add(p);
    const x=36,top=22,totalW=W-72,h=58,logoW=125,codeW=160,centerW=totalW-logoW-codeW;
    doc.setDrawColor(0);doc.setLineWidth(.7);doc.rect(x,top,totalW,h);doc.line(x+logoW,top,x+logoW,top+h);doc.line(x+logoW+centerW,top,x+logoW+centerW,top+h);doc.line(x+logoW,top+h/2,x+logoW+centerW,top+h/2);
    if(ctx.assets?.logo){try{doc.addImage(ctx.assets.logo,imageFormat(ctx.assets.logo),x+6,top+6,logoW-12,h-12,undefined,"FAST");}catch(_){}}
    doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("UNIDAD DE TITULACIÓN Y EFICIENCIA TERMINAL",x+logoW+centerW/2,top+18,{align:"center"});
    doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text(ctx.config.title,x+logoW+centerW/2,top+h/2+9,{align:"center"});
    doc.setFont("helvetica","normal");doc.text(ctx.period.name,x+logoW+centerW/2,top+h/2+22,{align:"center"});
    doc.text("Código:",x+logoW+centerW+codeW/2,top+17,{align:"center"});doc.setFont("helvetica","bold");doc.text(ctx.code,x+logoW+centerW+codeW/2,top+35,{align:"center"});
  }
  function newPage(){doc.addPage();y=BODY.top;header();doc.setFont("times","normal");doc.setFontSize(12);}
  function ensure(h){if(y+h>H-BODY.bottom)newPage();}
  function paragraph(text,opts={}){
    const style=opts.bold?"bold":opts.italic?"italic":"normal",indent=opts.indent===false?0:BODY.indent;
    doc.setFont("times",style);doc.setFontSize(opts.size||12);
    const lines=doc.splitTextToSize(clean(text),bodyW-indent);
    lines.forEach((line,i)=>{ensure(BODY.line);doc.setFont("times",style);doc.setFontSize(opts.size||12);doc.text(line,BODY.left+(i===0?indent:0),y);y+=BODY.line;});
    y+=opts.after??8;
  }
  function bullet(text){const t=clean(text).replace(/^•\s*/,"");doc.setFont("times","normal");doc.setFontSize(12);const lines=doc.splitTextToSize(t,bodyW-28);lines.forEach((line,i)=>{ensure(BODY.line);doc.setFont("times","normal");doc.setFontSize(12);if(i===0)doc.text("•",BODY.left+5,y);doc.text(line,BODY.left+25,y);y+=BODY.line;});y+=5;}
  function heading(text,level=1){
    if(level===1&&y>BODY.top+2)newPage();
    const size=level===1?14:level===2?13:12,style=level===3?"bolditalic":"bold";
    doc.setFont("times",style);doc.setFontSize(size);const lines=doc.splitTextToSize(text,bodyW);ensure(lines.length*22+50);toc.push({title:text,level,page:doc.getNumberOfPages()});doc.text(lines,BODY.left,y);y+=lines.length*22+10;
  }
  function tableCaption(title){tableNo++;ensure(48);doc.setFont("times","bold");doc.setFontSize(11);doc.text("Tabla "+tableNo,BODY.left,y);y+=17;doc.setFont("times","italic");doc.text(title,BODY.left,y);y+=22;}
  function apaTable(title,head,rows,widths){
    if(!rows?.length)return;ensure(180);tableCaption(title);
    doc.autoTable({startY:y,margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},theme:"plain",head:[head],body:rows,
      styles:{font:"times",fontSize:9.3,cellPadding:4,textColor:0,lineWidth:0,overflow:"linebreak",valign:"top"},
      headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0,lineWidth:0},
      columnStyles:widths||{},
      didDrawPage:()=>header(),
      didDrawCell:data=>{const left=data.table.settings.margin.left,right=W-data.table.settings.margin.right;if(data.section==="head"&&data.column.index===0){doc.setDrawColor(0);doc.setLineWidth(.8);doc.line(left,data.cell.y,right,data.cell.y);doc.setLineWidth(.45);doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);}if(data.section==="body"&&data.row.index===data.table.body.length-1&&data.column.index===0){doc.setLineWidth(.8);doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);}}
    });y=doc.lastAutoTable.finalY+12;doc.setFont("times","italic");doc.setFontSize(9);doc.text("Nota. Elaboración propia con base en los datos del período.",BODY.left,y);y+=24;
  }
  function inlineImage(key){
    const data=ctx.assets?.[key];if(!data)return;let props;try{props=doc.getImageProperties(data);}catch(_){return;}
    const maxW=bodyW*.92,maxH=175,ratio=props.width/props.height;let w=maxW,h=w/ratio;if(h>maxH){h=maxH;w=h*ratio;}if(y+h+BODY.line*4>H-BODY.bottom)newPage();const x=BODY.left+(bodyW-w)/2;try{doc.addImage(data,imageFormat(data),x,y,w,h,undefined,"FAST");}catch(_){return;}y+=h+18;
  }
  function cover(){
    header();doc.setFont("helvetica","bold");doc.setFontSize(23);const lines=doc.splitTextToSize(ctx.config.title,W-120);doc.text(lines,W/2,240,{align:"center"});doc.setFontSize(17);doc.text(ctx.period.name,W/2,240+lines.length*30+30,{align:"center"});
    const top=H-260,x=36,w=W-72,col=w/3,totalH=175;doc.setDrawColor(0);doc.setLineWidth(.7);
    const cells=[
      ["ELABORADO POR:","Mgs. Jefferson Villarreal","Coordinador de Titulación y Eficiencia Terminal"],
      ["REVISADO POR:","Ing. Martha Tomalá","Coordinadora General de Carreras"],
      ["APROBADO POR:","Dr. Alex León","Vicerrector"]
    ];
    cells.forEach((c,i)=>{const cx=x+i*col;doc.rect(cx,top,col,totalH);doc.line(cx,top+105,cx+col,top+105);doc.line(cx,top+138,cx+col,top+138);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(c[0],cx+7,top+17);doc.setFont("helvetica","bold");doc.text("NOMBRE:",cx+7,top+125);doc.setFont("helvetica","normal");doc.text(doc.splitTextToSize(c[1],col-62),cx+55,top+125);doc.setFont("helvetica","bold");doc.text("CARGO:",cx+7,top+156);doc.setFont("helvetica","normal");doc.text(doc.splitTextToSize(c[2],col-14),cx+7,top+170);});
  }
  function executive(){
    heading("Resumen Ejecutivo",1);
    const total=(ctx.payload.tables?.carreras||[]).reduce((s,r)=>s+(Number(r.count)||0),0);
    paragraph(TYPE==="trabajo"
      ?"La planificación organiza el desarrollo del trabajo de titulación mediante asignación de tutor y lector, elaboración progresiva de borradores, revisión académica, aprobación, defensa y registro final de resultados."
      :"La planificación organiza el desarrollo del artículo académico desde la inducción y las metodologías de apoyo hasta la entrega, evaluación institucional, antiplagio, defensa y ruta de supletorio.",{indent:false});
    if(total)bullet("Estudiantes registrados en la plantilla: "+total+".");
    bullet("Período: "+ctx.period.name+".");
    bullet("La información operativa se toma de las tablas importadas o completadas en la app.");
  }
  function sectionsTrabajo(){
    heading("1. Introducción",1);paragraph("La planificación de Trabajo de Titulación establece la secuencia académica y operativa para acompañar al estudiante desde la asignación de tutor y lector hasta la defensa y el registro final de resultados. El documento articula seguimiento, responsabilidades, cronograma y recursos para asegurar trazabilidad durante el período.");paragraph("El trabajo se desarrolla progresivamente mediante entregas y retroalimentaciones que permiten verificar avances, corregir observaciones y consolidar la versión final.");inlineImage("introImage");
    heading("2. Base Legal",1);paragraph("El proceso se ejecuta conforme a la normativa nacional de educación superior y a la regulación institucional aplicable a titulación. Las disposiciones operativas del período deben mantener coherencia con los requisitos de egreso, evaluación, registro y archivo institucional.");paragraph("Cuando exista actualización normativa, prevalece la disposición vigente y debe dejarse constancia de cualquier ajuste aplicado al proceso.");
    heading("3. Metodología",1);paragraph("La metodología organiza el acompañamiento por fases: asignación, orientación inicial, elaboración de borradores, retroalimentación, aprobación, revisión del lector, preparación de defensa y cierre académico.");inlineImage("methodologyImage");
    heading("3.1. Acompañamiento del tutor",2);paragraph("El tutor orienta el desarrollo académico, revisa avances y registra observaciones que permitan al estudiante mejorar progresivamente el trabajo.");
    heading("3.2. Revisión del lector",2);paragraph("El lector realiza una revisión posterior a la aprobación del tutor y emite observaciones o validación según el procedimiento institucional.");
    heading("4. Cronograma del proceso",1);
    apaTable("Calendario de actividades por proceso",
      ["Actividad","Descripción","Responsable","Inicio","Fin"],
      ctx.payload.schedule.map(r=>[r.activity,r.description||"",r.responsible||"",fmtDate(r.start),fmtDate(r.end)]),
      {0:{cellWidth:bodyW*.23},1:{cellWidth:bodyW*.27},2:{cellWidth:bodyW*.24},3:{cellWidth:bodyW*.13},4:{cellWidth:bodyW*.13}}
    );
    paragraph("La secuencia inicia con la asignación de tutor y lector y concluye con el registro final de calificaciones. Las fechas y responsables pueden actualizarse desde la plantilla de datos del período.");
    heading("5. Carreras y estudiantes",1);const car=ctx.payload.tables?.carreras||[];apaTable("Carreras participantes",["Carrera","Modalidad","Lugar","Cantidad"],car.map(r=>[r.career||"",r.modality||"",r.place||"",String(r.count??"")]),{0:{cellWidth:bodyW*.48},1:{cellWidth:bodyW*.18},2:{cellWidth:bodyW*.18},3:{cellWidth:bodyW*.16}});
    heading("6. Asignación de Tutor y Lector",1);const tut=ctx.payload.tables?.tutores||[];apaTable("Asignaciones académicas",["Carrera","Tutor","Lector","Observaciones"],tut.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.career||"",r.tutor||"",r.reader||"",r.observations||""]),{0:{cellWidth:bodyW*.30},1:{cellWidth:bodyW*.23},2:{cellWidth:bodyW*.23},3:{cellWidth:bodyW*.24}});paragraph("Las asignaciones deben mantenerse actualizadas y comunicarse a los estudiantes por los canales institucionales definidos.");
    heading("7. Desarrollo y seguimiento",1);bullet("Primer borrador: revisión del planteamiento, estructura y avance inicial.");bullet("Segundo borrador: consolidación del desarrollo y atención de observaciones.");bullet("Tercer borrador: versión próxima a cierre para validación del tutor.");bullet("Aprobación del tutor: habilita la revisión posterior del lector.");bullet("Revisión del lector: verifica coherencia y condiciones previas a defensa.");
    heading("8. Recursos y plataformas",1);const rec=ctx.payload.tables?.recursos||[];apaTable("Recursos asignados al proceso",["Recurso","Responsable","Uso"],rec.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.resource||"",r.responsible||"",r.use||""]),{0:{cellWidth:bodyW*.28},1:{cellWidth:bodyW*.28},2:{cellWidth:bodyW*.44}});paragraph("Los recursos digitales y de comunicación apoyan tutorías, entrega de avances, registro y coordinación de actividades.");
    heading("9. Defensa",1);const def=ctx.payload.tables?.defensas||[];apaTable("Organización de defensas",["Carrera","Inicio","Fin","Modalidad","Observaciones"],def.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.career||"",fmtDate(r.start),fmtDate(r.end),r.mode||"",r.observations||""]),{0:{cellWidth:bodyW*.30},1:{cellWidth:bodyW*.14},2:{cellWidth:bodyW*.14},3:{cellWidth:bodyW*.15},4:{cellWidth:bodyW*.27}});paragraph("La defensa se ejecuta conforme a las condiciones definidas para cada carrera y al cronograma aprobado.");
    heading("10. Evaluación y registro final",1);
    paragraph("La evaluación final integra la valoración académica del trabajo y el desempeño del estudiante en la defensa, conforme a los instrumentos institucionales aplicables. Las calificaciones deben registrarse en los sistemas correspondientes y respaldarse mediante actas, rúbricas y evidencias del proceso.");
    paragraph("El tutor y el lector cumplen funciones de acompañamiento y revisión académica. La defensa corresponde al tribunal evaluador designado y debe mantener independencia respecto de las revisiones previas.");

    heading("11. Análisis de resultados y mejora continua",1);
    paragraph("Al cierre de cada período, la Coordinación de Titulación consolida indicadores del proceso como insumo para la toma de decisiones y la mejora institucional.");
    bullet("Eficiencia terminal: estudiantes que culminan en tiempo y forma / total de estudiantes del proceso × 100.");
    bullet("Tasa de aprobación en defensa: estudiantes que aprueban la defensa / total de estudiantes del proceso × 100.");
    bullet("Índice de revisión de borradores a tiempo: borradores revisados dentro del plazo / total de borradores × 100.");
    bullet("Tiempo promedio de culminación: suma de tiempos individuales desde asignación de tutor hasta defensa / número total de estudiantes.");
    bullet("Índice de satisfacción: resultado consolidado de las encuestas institucionales aplicadas al cierre.");
    paragraph("Las observaciones e indicadores permiten ajustar cronogramas, acompañamiento docente, recursos y mecanismos de coordinación para el siguiente período.");
    inlineImage("closingImage");

    heading("12. Bibliografía",1);paragraph("Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador.",{indent:false});paragraph("Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior.",{indent:false});paragraph("Instituto Tecnológico Superior Quito Metropolitano. Reglamento institucional vigente del área de titulación.",{indent:false});
  }
  function sectionsArticulo(){
    heading("1. Introducción",1);paragraph("La planificación de Artículo Académico organiza el proceso de elaboración, evaluación y defensa del artículo dentro del período académico. La secuencia integra inducción, apoyo metodológico, definición de interrogante, clases de refuerzo, verificación de requisitos, entrega del documento, revisión institucional, antiplagio, defensa y supletorio.");inlineImage("introImage");
    heading("2. Base Legal",1);paragraph("El proceso se desarrolla conforme a la normativa nacional de educación superior y a la regulación institucional aplicable a titulación, evaluación, propiedad intelectual y registro académico.");paragraph("Las condiciones específicas de evaluación y control documental deben corresponder a la normativa vigente del período.");
    heading("3. Metodología",1);paragraph("La metodología articula tres momentos de apoyo metodológico, la definición de la interrogante de investigación, el desarrollo progresivo del artículo y el acompañamiento académico por carrera.");inlineImage("methodologyImage");
    heading("3.1. Metodologías 1, 2 y 3",2);paragraph("Las metodologías proporcionan orientación progresiva para estructura, redacción académica, fuentes, coherencia metodológica y preparación del artículo.");
    heading("3.2. Interrogante de investigación",2);paragraph("La interrogante orienta el desarrollo del artículo y debe mantener relación con el campo profesional y con los objetivos académicos definidos para la modalidad.");
    heading("4. Cronograma del proceso",1);apaTable("Cronograma general del Artículo Académico",["Actividad","Fecha inicio","Fecha fin"],ctx.payload.schedule.map(r=>[r.activity,fmtDate(r.start),fmtDate(r.end)]),{0:{cellWidth:bodyW*.58},1:{cellWidth:bodyW*.21},2:{cellWidth:bodyW*.21}});
    heading("5. Carreras y estudiantes",1);const car=ctx.payload.tables?.carreras||[];apaTable("Carreras participantes",["Carrera","Modalidad","Lugar","Cantidad"],car.map(r=>[r.career||"",r.modality||"",r.place||"",String(r.count??"")]),{0:{cellWidth:bodyW*.48},1:{cellWidth:bodyW*.18},2:{cellWidth:bodyW*.18},3:{cellWidth:bodyW*.16}});
    heading("6. Clases de refuerzo",1);const ref=ctx.payload.tables?.refuerzos||[];apaTable("Refuerzos por carrera",["Carrera","Responsable","Inicio","Fin","Observaciones"],ref.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.career||"",r.responsible||"",fmtDate(r.start),fmtDate(r.end),r.observations||""]),{0:{cellWidth:bodyW*.27},1:{cellWidth:bodyW*.23},2:{cellWidth:bodyW*.13},3:{cellWidth:bodyW*.13},4:{cellWidth:bodyW*.24}});paragraph("Los refuerzos permiten resolver dudas específicas de las carreras y acompañar la consolidación del artículo.");
    heading("7. Requisitos y habilitación",1);paragraph("La habilitación para entrega, evaluación y defensa depende del cumplimiento de los requisitos institucionales aplicables al período. La verificación debe realizarse con registros oficiales y responsables claramente identificados.");
    heading("8. Entrega, evaluación institucional y antiplagio",1);paragraph("El artículo completo se entrega dentro de las fechas planificadas y pasa por revisión institucional y control antiplagio conforme a las condiciones vigentes. Las observaciones deben comunicarse con trazabilidad y dentro de los tiempos establecidos.");
    heading("9. Defensa ordinaria",1);const def=ctx.payload.tables?.defensas||[];apaTable("Defensas ordinarias y supletorias",["Tipo","Carrera","Inicio","Fin","Modalidad","Observaciones"],def.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.type||"",r.career||"",fmtDate(r.start),fmtDate(r.end),r.mode||"",r.observations||""]),{0:{cellWidth:bodyW*.13},1:{cellWidth:bodyW*.24},2:{cellWidth:bodyW*.12},3:{cellWidth:bodyW*.12},4:{cellWidth:bodyW*.14},5:{cellWidth:bodyW*.25}});
    heading("10. Ruta de supletorio",1);paragraph("La ruta de supletorio comprende tutoría adicional, nueva entrega del artículo, evaluación mediante rúbrica y control antiplagio, y defensa de supletorio conforme al cronograma del período.");
    heading("11. Evaluación",1);const ev=ctx.payload.tables?.evaluacion||[];apaTable("Ponderación de evaluación",["Componente","Ponderación %","Condición / criterio"],ev.filter(r=>Object.values(r).some(Boolean)).map(r=>[r.component||"",String(r.weight??""),r.condition||""]),{0:{cellWidth:bodyW*.30},1:{cellWidth:bodyW*.20},2:{cellWidth:bodyW*.50}});paragraph("El documento base establece una ponderación de 70% para el artículo académico y 30% para la defensa. La app permite actualizar estos valores si existe una disposición institucional vigente para el período.");
    heading("12. Seguimiento, contingencias y cierre",1);paragraph("Las incidencias de entrega, evaluación, antiplagio o defensa deben registrarse y resolverse mediante los responsables institucionales. El cierre consolida resultados, evidencias y observaciones para seguimiento y mejora continua.");inlineImage("closingImage");
    heading("13. Bibliografía",1);paragraph("Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador.",{indent:false});paragraph("Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior.",{indent:false});paragraph("Instituto Tecnológico Superior Quito Metropolitano. Reglamento institucional vigente del área de titulación.",{indent:false});
  }

  cover();newPage();newPage();newPage();executive();if(TYPE==="trabajo")sectionsTrabajo();else sectionsArticulo();

  // Fill TOC in reserved pages 2–3.
  const unique=[];const seen=new Set();toc.forEach(e=>{const k=e.title.toLowerCase();if(!seen.has(k)){seen.add(k);unique.push(e);}});
  const half=Math.ceil(unique.length/2);
  function drawToc(page,entries,title){doc.setPage(page);let ty=BODY.top;doc.setFont("times","bold");doc.setFontSize(14);if(title){doc.text(title,W/2,ty,{align:"center"});ty+=34;}entries.forEach(e=>{doc.setFont("times",e.level===1?"bold":"normal");doc.setFontSize(10);const indent=e.level===1?0:18;const label=doc.splitTextToSize(e.title,bodyW-indent-44);doc.text(label,BODY.left+indent,ty);const lastY=ty+(label.length-1)*15;doc.text(String(e.page),W-BODY.right,lastY,{align:"right"});ty+=Math.max(18,label.length*15);});}
  drawToc(2,unique.slice(0,half),"Índice");drawToc(3,unique.slice(half),"");

  const total=doc.getNumberOfPages();for(let p=1;p<=total;p++){doc.setPage(p);doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("Página "+p+" de "+total,W-36,H-22,{align:"right"});}
  const finalName=(filename||ctx.code+" - "+ctx.config.title+".pdf").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();
  const blob=doc.output("blob");doc.save(finalName);return{pages:total,filename:finalName,blob};
}
window.DocTitFullDocument={generateAndDownload};
})();