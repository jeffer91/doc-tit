from pathlib import Path
import re

# --- PDF generator ---
p = Path('trabajo-titulacion/full-document.js')
text = p.read_text(encoding='utf-8')

if 'const CONCLUSIONS_CONFIG=window.DOC_TIT_TRABAJO_CONCLUSIONS||{};' not in text:
    text = text.replace(
        'const INDICATORS_CONFIG=window.DOC_TIT_TRABAJO_INDICATORS||{};\n',
        'const INDICATORS_CONFIG=window.DOC_TIT_TRABAJO_INDICATORS||{};\nconst CONCLUSIONS_CONFIG=window.DOC_TIT_TRABAJO_CONCLUSIONS||{};\n',
        1
    )

old_tail = '{"type":"h","text":"11. Bibliografía","level":1},{"type":"refs"}'
new_tail = '{"type":"h","text":"11. Conclusiones","level":1},{"type":"conclusions"},{"type":"h","text":"12. Bibliografía","level":1},{"type":"refs"}'
if old_tail in text:
    text = text.replace(old_tail, new_tail, 1)
elif '"type":"conclusions"' not in text or '"12. Bibliografía"' not in text:
    raise SystemExit('No se encontró el cierre Sección 11/Bibliografía esperado')

if 'function renderConclusions()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = r'''  function resolveConclusions(){
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
      listHeading(`${index+1}.`);
      paragraph(raw,{indent:false});
    });
  }
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old_render = '      else if(item.type==="resultsAnalysis")renderResultsAnalysis();\n      else if(item.type==="optional")renderOptionalData();'
new_render = '      else if(item.type==="resultsAnalysis")renderResultsAnalysis();\n      else if(item.type==="conclusions")renderConclusions();\n      else if(item.type==="optional")renderOptionalData();'
if old_render in text:
    text = text.replace(old_render, new_render, 1)
elif 'else if(item.type==="conclusions")renderConclusions();' not in text:
    raise SystemExit('No se encontró renderItems() para conclusions')

p.write_text(text, encoding='utf-8')

# --- App state, snapshots, schedule approval ---
p = Path('trabajo-titulacion/app.js')
text = p.read_text(encoding='utf-8')

if 'function currentConclusionsSnapshot()' not in text:
    marker = 'function blankPayload(){'
    helper = '''function currentConclusionsSnapshot(){\n  const block=window.DOC_TIT_TRABAJO_CONCLUSIONS;\n  if(!block||!Array.isArray(block.conclusions)||!block.conclusions.length)return null;\n  return JSON.parse(JSON.stringify(block));\n}\nfunction blankPayload(){'''
    if marker not in text:
        raise SystemExit('No se encontró blankPayload()')
    text = text.replace(marker, helper, 1)

old_snapshot = 'scheduleStructure:structure,resultsAnalysis:currentResultsAnalysisSnapshot()}'
new_snapshot = 'scheduleStructure:structure,resultsAnalysis:currentResultsAnalysisSnapshot(),conclusions:currentConclusionsSnapshot()}'
if old_snapshot in text:
    text = text.replace(old_snapshot, new_snapshot, 1)
elif 'conclusions:currentConclusionsSnapshot()' not in text:
    raise SystemExit('No se encontró contentSnapshots en blankPayload()')

old_norm = '  if(!contentSnapshots.resultsAnalysis)contentSnapshots.resultsAnalysis=currentResultsAnalysisSnapshot();\n  const scheduleMeta='
new_norm = '  if(!contentSnapshots.resultsAnalysis)contentSnapshots.resultsAnalysis=currentResultsAnalysisSnapshot();\n  if(!contentSnapshots.conclusions)contentSnapshots.conclusions=currentConclusionsSnapshot();\n  const scheduleMeta='
if old_norm in text:
    text = text.replace(old_norm, new_norm, 1)
elif 'if(!contentSnapshots.conclusions)contentSnapshots.conclusions=currentConclusionsSnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData() para conclusions')

old_complete = 'function scheduleComplete(){return scheduleValidation().length===0;}'
new_complete = 'function scheduleComplete(){return scheduleValidation().length===0&&payload.scheduleMeta?.status==="Aprobado";}'
if old_complete in text:
    text = text.replace(old_complete, new_complete, 1)
elif new_complete not in text:
    raise SystemExit('No se encontró scheduleComplete()')

old_button = '<button class="secondary" type="button" id="addScheduleBtn">+ Agregar actividad</button>'
new_button = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="pill" id="scheduleApprovalState"></span><button class="secondary" type="button" id="approveScheduleBtn">Aprobar cronograma</button><button class="secondary" type="button" id="addScheduleBtn">+ Agregar actividad</button></div>'
if old_button in text:
    text = text.replace(old_button, new_button, 1)
elif 'id="approveScheduleBtn"' not in text:
    raise SystemExit('No se encontró botón de agregar actividad')

anchor = '  const addSchedule=$("#addScheduleBtn");\n'
if 'const approveSchedule=$("#approveScheduleBtn");' not in text:
    approval = '''  const approvalState=$("#scheduleApprovalState");\n  if(approvalState)approvalState.textContent="Estado: "+(payload.scheduleMeta?.status||"Borrador");\n  const approveSchedule=$("#approveScheduleBtn");\n  if(approveSchedule)approveSchedule.onclick=()=>{\n    const errors=scheduleValidation();\n    if(errors.length){alert("No se puede aprobar el cronograma:\\n\\n"+errors.join("\\n"));return;}\n    payload.scheduleMeta={...(payload.scheduleMeta||{}),version:Number(payload.scheduleMeta?.version)||1,status:"Aprobado"};\n    localSave();renderSections();progress();setStatus("Cronograma aprobado para el período","success");\n  };\n  const addSchedule=$("#addScheduleBtn");\n'''
    if anchor not in text:
        raise SystemExit('No se encontró ancla addScheduleBtn')
    text = text.replace(anchor, approval, 1)

# Any imported cronograma must return to draft until explicitly approved again.
needle = '  const sname=wb.SheetNames.find(n=>norm(n).includes("cronograma"));\n  if(sname){\n'
replacement = '  const sname=wb.SheetNames.find(n=>norm(n).includes("cronograma"));\n  if(sname){\n    out.scheduleMeta={...(out.scheduleMeta||{}),status:"Borrador"};\n'
if needle in text:
    text = text.replace(needle, replacement, 1)
elif 'out.scheduleMeta={...(out.scheduleMeta||{}),status:"Borrador"};' not in text:
    raise SystemExit('No se encontró importación de cronograma')

p.write_text(text, encoding='utf-8')

# --- Script loading and cache busting ---
p = Path('trabajo-titulacion/index.html')
text = p.read_text(encoding='utf-8')
for name in ['content-config.js','requirements-config.js','process-config.js','logistics-config.js','induction-config.js','schedule-config.js','indicators-config.js','full-document.js','app.js']:
    text = re.sub(rf'{re.escape(name)}\?v=[^"<]+', f'{name}?v=20260910-section11-1', text)
if 'conclusions-config.js' not in text:
    needle = '<script src="indicators-config.js?v=20260910-section11-1"></script>'
    repl = needle + '\n<script src="conclusions-config.js?v=20260910-section11-1"></script>'
    if needle not in text:
        raise SystemExit('No se encontró indicators-config.js en index.html')
    text = text.replace(needle, repl, 1)
p.write_text(text, encoding='utf-8')

print('Trabajo Section 11 patch applied')
