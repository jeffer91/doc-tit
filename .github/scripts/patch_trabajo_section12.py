from pathlib import Path
import re

# --- PDF generator ---
p = Path('trabajo-titulacion/full-document.js')
text = p.read_text(encoding='utf-8')

if 'const RECOMMENDATIONS_CONFIG=window.DOC_TIT_TRABAJO_RECOMMENDATIONS||{};' not in text:
    text = text.replace(
        'const CONCLUSIONS_CONFIG=window.DOC_TIT_TRABAJO_CONCLUSIONS||{};\n',
        'const CONCLUSIONS_CONFIG=window.DOC_TIT_TRABAJO_CONCLUSIONS||{};\nconst RECOMMENDATIONS_CONFIG=window.DOC_TIT_TRABAJO_RECOMMENDATIONS||{};\n',
        1
    )

old_tail = '{"type":"h","text":"11. Conclusiones","level":1},{"type":"conclusions"},{"type":"h","text":"12. Bibliografía","level":1},{"type":"refs"}'
new_tail = '{"type":"h","text":"11. Conclusiones","level":1},{"type":"conclusions"},{"type":"h","text":"12. Recomendaciones","level":1},{"type":"recommendations"},{"type":"h","text":"13. Bibliografía","level":1},{"type":"refs"}'
if old_tail in text:
    text = text.replace(old_tail, new_tail, 1)
elif '"type":"recommendations"' not in text or '"13. Bibliografía"' not in text:
    raise SystemExit('No se encontró el cierre Sección 11/12 esperado')

if 'function renderRecommendations()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = r'''  function resolveRecommendations(){
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
      listHeading(`${index+1}.`);
      paragraph(raw,{indent:false});
    });
  }
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old_render = '      else if(item.type==="conclusions")renderConclusions();\n      else if(item.type==="optional")renderOptionalData();'
new_render = '      else if(item.type==="conclusions")renderConclusions();\n      else if(item.type==="recommendations")renderRecommendations();\n      else if(item.type==="optional")renderOptionalData();'
if old_render in text:
    text = text.replace(old_render, new_render, 1)
elif 'else if(item.type==="recommendations")renderRecommendations();' not in text:
    raise SystemExit('No se encontró renderItems() para recommendations')

p.write_text(text, encoding='utf-8')

# --- App snapshots ---
p = Path('trabajo-titulacion/app.js')
text = p.read_text(encoding='utf-8')

if 'function currentRecommendationsSnapshot()' not in text:
    marker = 'function blankPayload(){'
    helper = '''function currentRecommendationsSnapshot(){\n  const block=window.DOC_TIT_TRABAJO_RECOMMENDATIONS;\n  if(!block||!Array.isArray(block.recommendations)||!block.recommendations.length)return null;\n  return JSON.parse(JSON.stringify(block));\n}\nfunction blankPayload(){'''
    if marker not in text:
        raise SystemExit('No se encontró blankPayload()')
    text = text.replace(marker, helper, 1)

old_snapshot = 'resultsAnalysis:currentResultsAnalysisSnapshot(),conclusions:currentConclusionsSnapshot()}'
new_snapshot = 'resultsAnalysis:currentResultsAnalysisSnapshot(),conclusions:currentConclusionsSnapshot(),recommendations:currentRecommendationsSnapshot()}'
if old_snapshot in text:
    text = text.replace(old_snapshot, new_snapshot, 1)
elif 'recommendations:currentRecommendationsSnapshot()' not in text:
    raise SystemExit('No se encontró contentSnapshots en blankPayload()')

old_norm = '  if(!contentSnapshots.conclusions)contentSnapshots.conclusions=currentConclusionsSnapshot();\n  const scheduleMeta='
new_norm = '  if(!contentSnapshots.conclusions)contentSnapshots.conclusions=currentConclusionsSnapshot();\n  if(!contentSnapshots.recommendations)contentSnapshots.recommendations=currentRecommendationsSnapshot();\n  const scheduleMeta='
if old_norm in text:
    text = text.replace(old_norm, new_norm, 1)
elif 'if(!contentSnapshots.recommendations)contentSnapshots.recommendations=currentRecommendationsSnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData() para recommendations')

p.write_text(text, encoding='utf-8')

# --- Script loading and cache busting ---
p = Path('trabajo-titulacion/index.html')
text = p.read_text(encoding='utf-8')
for name in ['content-config.js','requirements-config.js','process-config.js','logistics-config.js','induction-config.js','schedule-config.js','indicators-config.js','conclusions-config.js','full-document.js','app.js']:
    text = re.sub(rf'{re.escape(name)}\?v=[^"<]+', f'{name}?v=20260910-section12-1', text)
if 'recommendations-config.js' not in text:
    needle = '<script src="conclusions-config.js?v=20260910-section12-1"></script>'
    repl = needle + '\n<script src="recommendations-config.js?v=20260910-section12-1"></script>'
    if needle not in text:
        raise SystemExit('No se encontró conclusions-config.js en index.html')
    text = text.replace(needle, repl, 1)
p.write_text(text, encoding='utf-8')

print('Trabajo Section 12 patch applied')
