from pathlib import Path
import re

# --- PDF generator ---
p = Path('trabajo-titulacion/full-document.js')
text = p.read_text(encoding='utf-8')

if 'const INDICATORS_CONFIG=window.DOC_TIT_TRABAJO_INDICATORS||{};' not in text:
    text = text.replace(
        'const SCHEDULE_CONFIG=window.DOC_TIT_TRABAJO_SCHEDULE||{};\n',
        'const SCHEDULE_CONFIG=window.DOC_TIT_TRABAJO_SCHEDULE||{};\nconst INDICATORS_CONFIG=window.DOC_TIT_TRABAJO_INDICATORS||{};\n',
        1
    )

start = '{"type":"h","text":"10. Análisis De Resultados Y Mejora Continua","level":1}'
end = '{"type":"h","text":"11. Bibliografía","level":1}'
a = text.index(start)
b = text.index(end, a)
text = text[:a] + start + ',{"type":"resultsAnalysis"},' + text[b:]

if 'function renderResultsAnalysis()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = r'''  function resolveResultsAnalysis(){
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
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old = '      else if(item.type==="scheduleSection")renderScheduleSection();\n      else if(item.type==="optional")renderOptionalData();'
new = '      else if(item.type==="scheduleSection")renderScheduleSection();\n      else if(item.type==="resultsAnalysis")renderResultsAnalysis();\n      else if(item.type==="optional")renderOptionalData();'
if old in text:
    text = text.replace(old, new, 1)
elif 'else if(item.type==="resultsAnalysis")renderResultsAnalysis();' not in text:
    raise SystemExit('No se encontró renderItems() para resultsAnalysis')

p.write_text(text, encoding='utf-8')

# --- Period snapshots ---
p = Path('trabajo-titulacion/app.js')
text = p.read_text(encoding='utf-8')

if 'function currentResultsAnalysisSnapshot()' not in text:
    marker = 'function blankPayload(){'
    helper = '''function currentResultsAnalysisSnapshot(){\n  const block=window.DOC_TIT_TRABAJO_INDICATORS;\n  if(!block||!Array.isArray(block.indicators)||!block.indicators.length)return null;\n  return JSON.parse(JSON.stringify(block));\n}\nfunction blankPayload(){'''
    if marker not in text:
        raise SystemExit('No se encontró blankPayload()')
    text = text.replace(marker, helper, 1)

old_snapshot = 'induction:currentInductionSnapshot(),scheduleStructure:structure}'
new_snapshot = 'induction:currentInductionSnapshot(),scheduleStructure:structure,resultsAnalysis:currentResultsAnalysisSnapshot()}'
if old_snapshot in text:
    text = text.replace(old_snapshot, new_snapshot, 1)
elif 'resultsAnalysis:currentResultsAnalysisSnapshot()' not in text:
    raise SystemExit('No se encontró contentSnapshots en blankPayload()')

old_norm = '  if(!contentSnapshots.scheduleStructure)contentSnapshots.scheduleStructure=structure||currentScheduleStructureSnapshot();\n  const scheduleMeta='
new_norm = '  if(!contentSnapshots.scheduleStructure)contentSnapshots.scheduleStructure=structure||currentScheduleStructureSnapshot();\n  if(!contentSnapshots.resultsAnalysis)contentSnapshots.resultsAnalysis=currentResultsAnalysisSnapshot();\n  const scheduleMeta='
if old_norm in text:
    text = text.replace(old_norm, new_norm, 1)
elif 'if(!contentSnapshots.resultsAnalysis)contentSnapshots.resultsAnalysis=currentResultsAnalysisSnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData() para resultsAnalysis')

p.write_text(text, encoding='utf-8')

# --- Script loading and cache busting ---
p = Path('trabajo-titulacion/index.html')
text = p.read_text(encoding='utf-8')
for name in ['content-config.js','requirements-config.js','process-config.js','logistics-config.js','induction-config.js','schedule-config.js','full-document.js','app.js']:
    text = re.sub(rf'{re.escape(name)}\?v=[^"<]+', f'{name}?v=20260910-section10-1', text)
if 'indicators-config.js' not in text:
    needle = '<script src="schedule-config.js?v=20260910-section10-1"></script>'
    repl = needle + '\n<script src="indicators-config.js?v=20260910-section10-1"></script>'
    if needle not in text:
        raise SystemExit('No se encontró schedule-config.js en index.html')
    text = text.replace(needle, repl, 1)
p.write_text(text, encoding='utf-8')

print('Trabajo Section 10 patch applied')
