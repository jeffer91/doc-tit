from pathlib import Path
import re

ROOT=Path('.')

def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s): (ROOT/p).write_text(s,encoding='utf-8')

# index.html: dejar únicamente entradas que realmente alimentan el documento.
p='trabajo-titulacion/index.html'
s=read(p)
s=s.replace('↓ Plantilla de datos','↓ Plantilla del cronograma')
s=s.replace('↑ Importar datos','↑ Importar cronograma')
s=re.sub(r'\n\s*<section class="panel" hidden aria-hidden="true">\s*<div class="panel-head"><div><span class="eyebrow">Información adicional</span>.*?</section>\s*', '\n', s, count=1, flags=re.S)
s=re.sub(r'\n\s*<label class="asset" hidden aria-hidden="true"><strong>Imagen de introducción</strong>.*?</label>', '', s, count=1, flags=re.S)
s=re.sub(r'\n\s*<label class="asset" hidden aria-hidden="true"><strong>Imagen de metodología</strong>.*?</label>', '', s, count=1, flags=re.S)
s=re.sub(r'\n\s*<label class="asset" hidden aria-hidden="true"><strong>Imagen de cierre/evaluación</strong>.*?</label>', '', s, count=1, flags=re.S)
s=s.replace('El logo institucional se utiliza en la cabecera y es el único recurso gráfico requerido por esta planificación.','Se solicita únicamente el logo institucional porque forma parte de la cabecera del formato.')
s=re.sub(r'app\.js\?v=[^"<]+','app.js?v=20260910-inputs-2',s)
s=re.sub(r'full-document\.js\?v=[^"<]+','full-document.js?v=20260910-inputs-2',s)
write(p,s)

# app.js: retirar datos, notas e imágenes que no alimentan el PDF.
p='trabajo-titulacion/app.js'
s=read(p)
s=re.sub(r',"tables":\{.*?\}\}\nconst SCHEDULE_CONFIG=', ',"tables":{}}\nconst SCHEDULE_CONFIG=', s, count=1, flags=re.S)
s=s.replace(',notes:"",contentSnapshots:',',contentSnapshots:')
s=s.replace(',notes:data.notes||"",contentSnapshots',' ,contentSnapshots')
s=s.replace('  $("#notesInput").value=payload.notes||"";renderSections();renderAssets();progress();localSave();','  renderSections();renderAssets();progress();localSave();')
s=s.replace('  payload.notes=$("#notesInput").value.trim();localSave();','  localSave();')
s=s.replace('    $("#notesInput").value=payload.notes||"";\n','')
s=s.replace('  payload.notes=$("#notesInput").value.trim();\n','')
s=s.replace('  $("#notesInput").onchange=()=>{payload.notes=$("#notesInput").value.trim();localSave();};\n','')
s=s.replace('  [["logo","logoPreview"],["introImage","introImagePreview"],["methodologyImage","methodologyImagePreview"],["closingImage","closingImagePreview"]].forEach(([k,id])=>{','  [["logo","logoPreview"]].forEach(([k,id])=>{')
s=s.replace('  [["logoUpload","logo"],["introImageUpload","introImage"],["methodologyImageUpload","methodologyImage"],["closingImageUpload","closingImage"]].forEach(([id,key])=>$("#"+id).onchange=e=>{const f=e.target.files?.[0];if(f)storeImage(key,f);e.target.value="";});','  [["logoUpload","logo"]].forEach(([id,key])=>$("#"+id).onchange=e=>{const f=e.target.files?.[0];if(f)storeImage(key,f);e.target.value="";});')
# Evitar cualquier texto que sugiera datos complementarios no usados.
s=s.replace('Puedes dejar datos pendientes y volver a importar después.','Puedes completar el cronograma por etapas y volver a importarlo después.')
write(p,s)

print('Entradas de Trabajo de Titulación simplificadas: solo cronograma y logo.')
