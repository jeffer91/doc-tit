from pathlib import Path

# --- PDF generator ---
path = Path('trabajo-titulacion/full-document.js')
text = path.read_text(encoding='utf-8')

if 'const PROCESS_CONFIG=window.DOC_TIT_TRABAJO_PROCESS||{};' not in text:
    text = text.replace(
        'const CONTENT_CONFIG=window.DOC_TIT_TRABAJO_CONTENT||{};\n',
        'const CONTENT_CONFIG=window.DOC_TIT_TRABAJO_CONTENT||{};\nconst PROCESS_CONFIG=window.DOC_TIT_TRABAJO_PROCESS||{};\n',
        1
    )

start = '{"type":"h","text":"5. Descripción De Los Procesos De Titulación","level":1}'
end = '{"type":"h","text":"6. Gestión Administrativa Y Logística","level":1}'
a = text.index(start)
b = text.index(end, a)
text = text[:a] + start + ',{"type":"processDescription"},' + text[b:]

if 'function renderProcessDescription()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = r'''  function resolveProcessDescription(){
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
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old = '      else if(item.type==="requirements")renderRequirements();\n      else if(item.type==="image")inlineImage(item.key);'
new = '      else if(item.type==="requirements")renderRequirements();\n      else if(item.type==="processDescription")renderProcessDescription();\n      else if(item.type==="image")inlineImage(item.key);'
if old in text:
    text = text.replace(old, new, 1)
elif 'else if(item.type==="processDescription")renderProcessDescription();' not in text:
    raise SystemExit('No se encontró renderItems() para processDescription')

path.write_text(text, encoding='utf-8')

# --- Period snapshot ---
app = Path('trabajo-titulacion/app.js')
text = app.read_text(encoding='utf-8')
if 'function currentProcessSnapshot()' not in text:
    marker = 'function blankPayload(){'
    helper = '''function currentProcessSnapshot(){
  const block=window.DOC_TIT_TRABAJO_PROCESS;
  if(!block||!block.assignment||!block.projectDevelopment||!block.grades||!block.defense)return null;
  return JSON.parse(JSON.stringify(block));
}
function blankPayload(){'''
    if marker not in text:
        raise SystemExit('No se encontró blankPayload()')
    text = text.replace(marker, helper, 1)

old = 'contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot(),requirements:currentRequirementsSnapshot()}'
new = 'contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot(),requirements:currentRequirementsSnapshot(),processDescription:currentProcessSnapshot()}'
if old in text:
    text = text.replace(old, new, 1)
elif 'processDescription:currentProcessSnapshot()' not in text:
    raise SystemExit('No se encontró contentSnapshots de blankPayload()')

old = '  if(!contentSnapshots.requirements)contentSnapshots.requirements=currentRequirementsSnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
new = '  if(!contentSnapshots.requirements)contentSnapshots.requirements=currentRequirementsSnapshot();\n  if(!contentSnapshots.processDescription)contentSnapshots.processDescription=currentProcessSnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
if old in text:
    text = text.replace(old, new, 1)
elif 'if(!contentSnapshots.processDescription)contentSnapshots.processDescription=currentProcessSnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData()')

app.write_text(text, encoding='utf-8')

# --- Script loading / cache busting ---
idx = Path('trabajo-titulacion/index.html')
text = idx.read_text(encoding='utf-8')
text = text.replace('content-config.js?v=20260909-section4-1', 'content-config.js?v=20260909-section5-1')
text = text.replace('requirements-config.js?v=20260909-section4-1', 'requirements-config.js?v=20260909-section5-1')
if 'process-config.js' not in text:
    text = text.replace('<script src="requirements-config.js?v=20260909-section5-1"></script>', '<script src="requirements-config.js?v=20260909-section5-1"></script>\n<script src="process-config.js?v=20260909-section5-1"></script>')
text = text.replace('full-document.js?v=20260909-section4-1', 'full-document.js?v=20260909-section5-1')
text = text.replace('app.js?v=20260909-section4-1', 'app.js?v=20260909-section5-1')
idx.write_text(text, encoding='utf-8')
