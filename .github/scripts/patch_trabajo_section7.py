from pathlib import Path

# --- PDF generator ---
path = Path('trabajo-titulacion/full-document.js')
text = path.read_text(encoding='utf-8')

if 'const INDUCTION_CONFIG=window.DOC_TIT_TRABAJO_INDUCTION||{};' not in text:
    marker = 'const LOGISTICS_CONFIG=window.DOC_TIT_TRABAJO_LOGISTICS||{};\n'
    if marker not in text:
        raise SystemExit('No se encontró LOGISTICS_CONFIG en full-document.js')
    text = text.replace(marker, marker + 'const INDUCTION_CONFIG=window.DOC_TIT_TRABAJO_INDUCTION||{};\n', 1)

start = '{"type":"h","text":"7. Inducción De Titulación","level":1}'
end = '{"type":"h","text":"8. Informe Y Autorizaciones","level":1}'
a = text.index(start)
b = text.index(end, a)
text = text[:a] + start + ',{"type":"induction"},' + text[b:]

if 'function renderInduction()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = r'''  function resolveInduction(){
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
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old = '      else if(item.type==="administrativeLogistics")renderAdministrativeLogistics();\n      else if(item.type==="image")inlineImage(item.key);'
new = '      else if(item.type==="administrativeLogistics")renderAdministrativeLogistics();\n      else if(item.type==="induction")renderInduction();\n      else if(item.type==="image")inlineImage(item.key);'
if old in text:
    text = text.replace(old, new, 1)
elif 'else if(item.type==="induction")renderInduction();' not in text:
    raise SystemExit('No se encontró renderItems() para induction')

path.write_text(text, encoding='utf-8')

# --- Period snapshot ---
app = Path('trabajo-titulacion/app.js')
text = app.read_text(encoding='utf-8')

if 'function currentInductionSnapshot()' not in text:
    marker = 'function blankPayload(){'
    helper = '''function currentInductionSnapshot(){
  const block=window.DOC_TIT_TRABAJO_INDUCTION;
  if(!block||!Array.isArray(block.modalities)||!block.modalities.length||!Array.isArray(block.orientation)||!Array.isArray(block.communication))return null;
  return JSON.parse(JSON.stringify(block));
}
function blankPayload(){'''
    if marker not in text:
        raise SystemExit('No se encontró blankPayload()')
    text = text.replace(marker, helper, 1)

old_snap = 'administrativeLogistics:currentLogisticsSnapshot()}'
new_snap = 'administrativeLogistics:currentLogisticsSnapshot(),induction:currentInductionSnapshot()}'
if old_snap in text:
    text = text.replace(old_snap, new_snap, 1)
elif 'induction:currentInductionSnapshot()' not in text:
    raise SystemExit('No se encontró contentSnapshots en blankPayload()')

old_norm = '  if(!contentSnapshots.administrativeLogistics)contentSnapshots.administrativeLogistics=currentLogisticsSnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
new_norm = '  if(!contentSnapshots.administrativeLogistics)contentSnapshots.administrativeLogistics=currentLogisticsSnapshot();\n  if(!contentSnapshots.induction)contentSnapshots.induction=currentInductionSnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
if old_norm in text:
    text = text.replace(old_norm, new_norm, 1)
elif 'if(!contentSnapshots.induction)contentSnapshots.induction=currentInductionSnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData()')

app.write_text(text, encoding='utf-8')

# --- Script loading / cache busting ---
idx = Path('trabajo-titulacion/index.html')
text = idx.read_text(encoding='utf-8')
import re
for name in ['content-config.js','requirements-config.js','process-config.js','logistics-config.js','full-document.js','app.js']:
    text = re.sub(rf'{re.escape(name)}\?v=[^"<]+', f'{name}?v=20260910-section7-1', text)
if 'induction-config.js' not in text:
    marker = '<script src="logistics-config.js?v=20260910-section7-1"></script>'
    if marker not in text:
        raise SystemExit('No se encontró logistics-config.js en index.html')
    text = text.replace(marker, marker + '\n<script src="induction-config.js?v=20260910-section7-1"></script>', 1)
else:
    text = re.sub(r'induction-config\.js\?v=[^"<]+', 'induction-config.js?v=20260910-section7-1', text)
idx.write_text(text, encoding='utf-8')
