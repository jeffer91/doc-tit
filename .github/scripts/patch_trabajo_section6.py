from pathlib import Path
import json

# --- PDF generator ---
path = Path('trabajo-titulacion/full-document.js')
text = path.read_text(encoding='utf-8')

if 'const LOGISTICS_CONFIG=window.DOC_TIT_TRABAJO_LOGISTICS||{};' not in text:
    text = text.replace(
        'const PROCESS_CONFIG=window.DOC_TIT_TRABAJO_PROCESS||{};\n',
        'const PROCESS_CONFIG=window.DOC_TIT_TRABAJO_PROCESS||{};\nconst LOGISTICS_CONFIG=window.DOC_TIT_TRABAJO_LOGISTICS||{};\n',
        1
    )

start = '{"type":"h","text":"6. Gestión Administrativa Y Logística","level":1}'
end = '{"type":"h","text":"7. Inducción De Titulación","level":1}'
a = text.index(start)
b = text.index(end, a)
text = text[:a] + start + ',{"type":"administrativeLogistics"},' + text[b:]

if 'function renderAdministrativeLogistics()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = r'''  function resolveAdministrativeLogistics(){
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
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old = '      else if(item.type==="processDescription")renderProcessDescription();\n      else if(item.type==="image")inlineImage(item.key);'
new = '      else if(item.type==="processDescription")renderProcessDescription();\n      else if(item.type==="administrativeLogistics")renderAdministrativeLogistics();\n      else if(item.type==="image")inlineImage(item.key);'
if old in text:
    text = text.replace(old, new, 1)
elif 'else if(item.type==="administrativeLogistics")renderAdministrativeLogistics();' not in text:
    raise SystemExit('No se encontró renderItems() para administrativeLogistics')

# Eliminar ramas antiguas que generaban las tablas 1 y 2 con contenido hardcodeado o datos del período.
fixed_start = '  }else if(name==="fixedAssignments"){'
fixed_end = '\n  }\n}\n\n  function renderItems(){'
if fixed_start in text:
    a = text.index(fixed_start)
    b = text.index(fixed_end, a)
    text = text[:a] + '\n  }\n}\n\n  function renderItems(){' + text[b+len(fixed_end):]

path.write_text(text, encoding='utf-8')

# --- Period snapshot + remove period-level resources table ---
app = Path('trabajo-titulacion/app.js')
text = app.read_text(encoding='utf-8')

prefix = 'const CONFIG='
marker = '\nconst MONTHS='
start_i = text.index(prefix) + len(prefix)
end_i = text.index(marker, start_i)
config = json.loads(text[start_i:end_i])
config.get('tables', {}).pop('recursos', None)
config_json = json.dumps(config, ensure_ascii=False, separators=(',', ':'))
text = text[:start_i] + config_json + text[end_i:]

if 'function currentLogisticsSnapshot()' not in text:
    marker_fn = 'function blankPayload(){'
    helper_fn = '''function currentLogisticsSnapshot(){
  const block=window.DOC_TIT_TRABAJO_LOGISTICS;
  if(!block||!block.assignmentsTable||!block.digitalResourcesTable||!block.communication)return null;
  return JSON.parse(JSON.stringify(block));
}
function blankPayload(){'''
    if marker_fn not in text:
        raise SystemExit('No se encontró blankPayload()')
    text = text.replace(marker_fn, helper_fn, 1)

old_snap = 'contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot(),requirements:currentRequirementsSnapshot(),processDescription:currentProcessSnapshot()}'
new_snap = 'contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot(),requirements:currentRequirementsSnapshot(),processDescription:currentProcessSnapshot(),administrativeLogistics:currentLogisticsSnapshot()}'
if old_snap in text:
    text = text.replace(old_snap, new_snap, 1)
elif 'administrativeLogistics:currentLogisticsSnapshot()' not in text:
    raise SystemExit('No se encontró contentSnapshots en blankPayload()')

old_norm = '  if(!contentSnapshots.processDescription)contentSnapshots.processDescription=currentProcessSnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
new_norm = '  if(!contentSnapshots.processDescription)contentSnapshots.processDescription=currentProcessSnapshot();\n  if(!contentSnapshots.administrativeLogistics)contentSnapshots.administrativeLogistics=currentLogisticsSnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
if old_norm in text:
    text = text.replace(old_norm, new_norm, 1)
elif 'if(!contentSnapshots.administrativeLogistics)contentSnapshots.administrativeLogistics=currentLogisticsSnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData()')

app.write_text(text, encoding='utf-8')

# --- Script loading / cache busting ---
idx = Path('trabajo-titulacion/index.html')
text = idx.read_text(encoding='utf-8')
for name in ['content-config.js','requirements-config.js','process-config.js','full-document.js','app.js']:
    import re
    text = re.sub(rf'{re.escape(name)}\?v=[^"<]+', f'{name}?v=20260909-section6-1', text)
if 'logistics-config.js' not in text:
    text = text.replace(
        '<script src="process-config.js?v=20260909-section6-1"></script>',
        '<script src="process-config.js?v=20260909-section6-1"></script>\n<script src="logistics-config.js?v=20260909-section6-1"></script>',
        1
    )
idx.write_text(text, encoding='utf-8')
