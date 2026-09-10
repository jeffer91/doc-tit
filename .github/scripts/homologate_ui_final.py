from pathlib import Path
import re

ROOT=Path('.')

def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s): (ROOT/p).write_text(s,encoding='utf-8')
def once(s,old,new,label):
    if old in s: return s.replace(old,new,1)
    if new in s: return s
    raise SystemExit(f'pattern missing: {label}')

# -----------------------------------------------------------------------------
# Complexivo: same wording, status+percentage and resource terminology.
# -----------------------------------------------------------------------------
p='complexivo/app.js';s=read(p)
s=once(
    s,
    'description: "Completa el cronograma, la distribución y cualquier información adicional. La app analiza el texto libre y genera el PDF completo directamente.",',
    'description: "Completa únicamente las tablas necesarias del período. El resto del documento se genera automáticamente con la configuración institucional vigente.",',
    'complexivo description'
)
write(p,s)

p='complexivo/data-workspace.js';s=read(p)
s=once(
    s,
    '.data-workspace-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid #e5ebf0}',
    '.data-workspace-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid #e5ebf0}\\n      .data-workspace-head-meta{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}\\n      .data-workspace-percent{font-size:11px;color:#667687;font-weight:800;white-space:nowrap}',
    'complexivo workspace head meta css'
)
s=once(
    s,
    '<p>Cada documento administra sus propias tablas. Puedes editar una tabla dentro de la app o descargar/subir una plantilla de Excel sin reemplazar las demás.</p>\\n        </div>\\n        <span id="dataWorkspaceStatus" class="data-workspace-status">Pendiente</span>',
    '<p>Completa únicamente la información que alimenta el formato final. El período, el código y los datos institucionales se generan automáticamente.</p>\\n        </div>\\n        <div class="data-workspace-head-meta"><span id="dataWorkspacePercent" class="data-workspace-percent">0% completo</span><span id="dataWorkspaceStatus" class="data-workspace-status">Pendiente</span></div>',
    'complexivo workspace header'
)
s=once(s,'<div class="data-group-title">Otros datos del documento</div>','<div class="data-group-title">Recursos del documento</div>','complexivo resource group')
s=once(
    s,
    '<p class="data-workspace-note">Las tablas obligatorias determinan si el documento está listo para generarse. Las tablas complementarias pueden llenarse cuando exista información operativa confirmada; no se inventan datos pendientes.</p>',
    '<p class="data-workspace-note">Las tablas obligatorias y el logo institucional determinan si el documento está listo para generarse. Las tablas complementarias no bloquean la generación.</p>',
    'complexivo workspace note'
)
old='''    const status=$("#dataWorkspaceStatus");\n    const headline=$("#dataWorkspaceHeadline");\n    const detail=$("#dataWorkspaceDetail");'''
new='''    const status=$("#dataWorkspaceStatus");\n    const percent=$("#dataWorkspacePercent");\n    const headline=$("#dataWorkspaceHeadline");\n    const detail=$("#dataWorkspaceDetail");'''
s=once(s,old,new,'complexivo render summary vars')
old='''    if(headline) headline.textContent=pending?`${pending} elemento(s) pendiente(s) para generar el PDF`:"Información obligatoria completa";\n    if(detail) detail.textContent=`${completeTables} de ${requiredTables.length} tablas obligatorias completas · ${TABLES.length-requiredTables.length} tablas complementarias · logo ${logoOk?"cargado":"pendiente"}`;'''
new='''    const tablePercent=requiredTables.length?Math.round((completeTables/requiredTables.length)*100):100;\n    if(percent) percent.textContent=`${tablePercent}% completo`;\n    if(headline) headline.textContent=pending?`${pending} elemento${pending===1?"":"s"} pendiente${pending===1?"":"s"} para generar el PDF`:"Información obligatoria completa";\n    if(detail) detail.textContent=`${completeTables} de ${requiredTables.length} tablas obligatorias completas · ${TABLES.length-requiredTables.length} tablas complementarias · logo ${logoOk?"cargado":"pendiente"}`;'''
s=once(s,old,new,'complexivo render summary percent')
write(p,s)

# -----------------------------------------------------------------------------
# Shared UI for Trabajo + Artículo: semantic workspace state, user-only progress,
# concise cards, and schedule download/upload actions where the template is only
# the schedule (Trabajo de Titulación).
# -----------------------------------------------------------------------------
p='shared/module-ui.js';s=read(p)

old='''    if(h3)h3.textContent="Tablas del documento";\n    if(!$(".doc-standard-workspace-note",progressPanel)){'''
new='''    if(h3)h3.textContent="Tablas del documento";\n    const panelHead=$(".panel-head",progressPanel);\n    let headStatus=$("#docStandardWorkspaceHeadStatus",progressPanel);\n    if(panelHead&&!headStatus){\n      headStatus=document.createElement("div");headStatus.id="docStandardWorkspaceHeadStatus";headStatus.className="doc-standard-workspace-head-status";\n      const state=document.createElement("span");state.id="docStandardWorkspaceState";state.className="doc-standard-workspace-state pending";state.textContent="Pendiente";\n      headStatus.appendChild(state);panelHead.appendChild(headStatus);\n    }\n    const progressLabel=$("#progressLabel");if(headStatus&&progressLabel&&progressLabel.parentElement!==headStatus)headStatus.insertBefore(progressLabel,headStatus.firstChild);\n    if(!$(".doc-standard-workspace-note",progressPanel)){'''
s=once(s,old,new,'shared workspace semantic status')

# Normalize whole-template action labels without removing the hidden file input.
old='''    const actions=$(".doc-standard-workspace-actions",summary);\n    if(toolbar&&actions&&toolbar.parentElement!==actions)actions.appendChild(toolbar);'''
new='''    const actions=$(".doc-standard-workspace-actions",summary);\n    if(toolbar&&actions&&toolbar.parentElement!==actions)actions.appendChild(toolbar);\n    const downloadBtn=$("#downloadTemplateBtn");if(downloadBtn)downloadBtn.textContent="Descargar plantilla";\n    const importInput=$("#importInput"),importLabel=importInput?.closest("label");\n    if(importLabel){const textNode=Array.from(importLabel.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);if(textNode)textNode.textContent="Subir plantilla ";}'''
s=once(s,old,new,'shared action labels')

# Direct, document-aware schedule completion. Automatic period/code no longer inflate it.
pat=re.compile(r'  function scheduleCompleteFromProgress\(\)\{.*?\n  \}\n\n  function panelState\(panel\)\{',re.S)
replacement='''  function panelState(panel){'''
if pat.search(s): s=pat.sub(replacement,s,count=1)
elif 'function scheduleCompleteFromProgress()' in s: raise SystemExit('could not remove progress-derived schedule gate')

old='''    if(schedule){\n      const rows=$$("#scheduleBody tr",panel);\n      const complete=scheduleCompleteFromProgress();\n      let dated=0;\n      rows.forEach(tr=>{const dates=$$('input[type="date"]',tr);if(dates.length&&dates.some(el=>el.value))dated++;});\n      const approval=$("#scheduleApprovalState",panel)?.textContent?.replace(/^Estado:\\s*/i,"").trim();\n      const meta=approval?`${dated} de ${rows.length} actividades con programación · ${approval}`:`${dated} de ${rows.length} actividades con fechas`;\n      return {required:true,complete,status:complete?"Completa":"Pendiente",kind:complete?"complete":"pending",meta};\n    }'''
new='''    if(schedule){\n      const rows=$$("#scheduleBody tr",panel);\n      const activeRows=rows.filter(tr=>{const check=$("input[type=\\"checkbox\\"][data-f=\\"active\\"]",tr);return !check||check.checked;});\n      const approval=$("#scheduleApprovalState",panel)?.textContent?.replace(/^Estado:\\s*/i,"").trim()||"";\n      let dated=0;\n      activeRows.forEach(tr=>{const dates=$$('input[type="date"]',tr);if(dates.length&&dates.some(el=>el.value))dated++;});\n      const datesComplete=activeRows.length>0&&activeRows.every(tr=>{const dates=$$('input[type="date"]',tr);if(!dates.length)return false;return documentId==="trabajo-titulacion"?dates.some(el=>el.value):dates.every(el=>el.value);});\n      const complete=datesComplete&&(!approval||/^Aprobado$/i.test(approval));\n      const meta=approval?`${dated} de ${activeRows.length} actividades con programación · ${approval}`:`${dated} de ${activeRows.length} actividades con fechas`;\n      return {required:true,complete,status:complete?"Completa":"Pendiente",kind:complete?"complete":"pending",meta};\n    }'''
s=once(s,old,new,'shared schedule state')

# Concise schedule card; Trabajo also gets the same three actions as Complexivo.
pat=re.compile(r'  function cardForPanel\(panel,index\)\{.*?\n  \}\n\n  function buildCards\(\)\{',re.S)
replacement='''  function cardForPanel(panel,index){\n    const schedule=!!$("#scheduleBody",panel);\n    const title=schedule?"Cronograma general":($("h3",panel)?.textContent?.trim()||`Tabla ${index+1}`);\n    const desc=schedule?"Fechas y responsables de las actividades del proceso.":($(".help",panel)?.textContent?.trim()||"Información estructurada del documento.");\n    const state=panelState(panel);\n    const card=document.createElement("article");card.className="doc-standard-card";\n    const scheduleActions=schedule&&documentId==="trabajo-titulacion"?'<button type="button" data-card-action="download">Descargar</button><button type="button" data-card-action="upload">Subir</button>':'';\n    card.innerHTML=`<div class="doc-standard-card-main"><div class="doc-standard-card-title-row"><span class="doc-standard-card-title">${esc(title)}</span><span class="doc-standard-card-chip ${state.kind}">${esc(state.status)}</span><span class="doc-standard-card-chip ${state.required?"required":"optional"}">${state.required?"Obligatoria":"Complementaria"}</span></div><p class="doc-standard-card-desc">${esc(desc)}</p><div class="doc-standard-card-meta">${esc(state.meta)}</div></div><div class="doc-standard-card-actions">${scheduleActions}<button type="button" class="primary-action" data-card-action="open">Abrir tabla</button></div>`;\n    $("[data-card-action=\\"open\\"]",card)?.addEventListener("click",()=>openEditor(panel));\n    $("[data-card-action=\\"download\\"]",card)?.addEventListener("click",()=>$("#downloadTemplateBtn")?.click());\n    $("[data-card-action=\\"upload\\"]",card)?.addEventListener("click",()=>$("#importInput")?.click());\n    return {card,state};\n  }\n\n  function buildCards(){'''
if pat.search(s): s=pat.sub(replacement,s,count=1)
else: raise SystemExit('cardForPanel not found')

# Build returns table completion separately from resource completion.
old='''    const states=[];\n    dynamicPanels().forEach((panel,index)=>{const item=cardForPanel(panel,index);tableHost.appendChild(item.card);states.push(item.state);});'''
new='''    const states=[],tableStates=[];\n    dynamicPanels().forEach((panel,index)=>{const item=cardForPanel(panel,index);tableHost.appendChild(item.card);states.push(item.state);tableStates.push(item.state);});'''
s=once(s,old,new,'shared build table states')
old='''    return {pending:states.filter(s=>s.required&&!s.complete).length};'''
new='''    const requiredTables=tableStates.filter(s=>s.required);\n    const completeRequiredTables=requiredTables.filter(s=>s.complete).length;\n    return {pending:states.filter(s=>s.required&&!s.complete).length,requiredTables:requiredTables.length,completeRequiredTables,logoOk:logoComplete(),complementaryTables:tableStates.filter(s=>!s.required).length};'''
s=once(s,old,new,'shared build return')

# Gate + progress now reflects only user-completed structured tables; logo is reported separately.
pat=re.compile(r'  function updateAll\(\)\{.*?\n  \}\n\n  function scheduleRefresh\(\)',re.S)
replacement='''  function updateAll(){\n    refreshTimer=null;\n    const {pending,requiredTables,completeRequiredTables,logoOk,complementaryTables}=buildCards(),ready=pending===0;\n    const tablePercent=requiredTables?Math.round((completeRequiredTables/requiredTables)*100):100;\n    const btn=$("#generateBtn"),state=$("#docStandardState"),workspaceState=$("#docStandardWorkspaceState"),headline=$("#docStandardSummaryHeadline"),detail=$("#docStandardSummaryDetail"),progressLabel=$("#progressLabel"),progressBar=$("#progressBar");\n    if(progressLabel)progressLabel.textContent=`${tablePercent}% completo`;\n    if(progressBar)progressBar.style.width=`${tablePercent}%`;\n    if(btn){btn.classList.toggle("ready",ready);btn.classList.toggle("pending",!ready);btn.disabled=!ready;btn.textContent=ready?"Generar PDF":`Generar PDF · ${Math.max(1,pending)} pendiente${pending===1?"":"s"}`;}\n    if(state){state.classList.toggle("state-ready",ready);state.classList.toggle("state-pending",!ready);state.textContent=ready?"Listo para generar":"Pendiente";}\n    if(workspaceState){workspaceState.classList.toggle("ready",ready);workspaceState.classList.toggle("pending",!ready);workspaceState.textContent=ready?"Listo":"Pendiente";}\n    if(headline)headline.textContent=ready?"Información obligatoria completa":`${pending} elemento${pending===1?"":"s"} pendiente${pending===1?"":"s"} para generar el PDF`;\n    if(detail)detail.textContent=`${completeRequiredTables} de ${requiredTables} tablas obligatorias completas · ${complementaryTables} tablas complementarias · logo ${logoOk?"cargado":"pendiente"}`;\n    updateAuto();\n  }\n\n  function scheduleRefresh()'''
if pat.search(s): s=pat.sub(replacement,s,count=1)
else: raise SystemExit('updateAll not found')
write(p,s)

# Shared CSS: semantic status in workspace + same card action hierarchy as Complexivo.
p='shared/module-ui.css';s=read(p)
append='''\n/* Final homologation: workspace state and card actions */\n.doc-standard-workspace .panel-head{align-items:flex-start!important}\n.doc-standard-workspace-head-status{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}\n.doc-standard-workspace-head-status .progress-label{font-size:11px!important;color:#687386!important;font-weight:800!important;white-space:nowrap}\n.doc-standard-workspace-state{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800;white-space:nowrap}\n.doc-standard-workspace-state.pending{background:#fde8e8;color:#991b1b}\n.doc-standard-workspace-state.ready{background:#e8f5ee;color:#166534}\n.doc-standard-card-actions button{border:0;border-radius:8px;padding:7px 10px;font:inherit;font-size:11px;font-weight:700;cursor:pointer;background:#e9eff5;color:#173755}\n.doc-standard-card-actions button.primary-action{background:#153b62;color:#fff}\n.doc-standard-card-actions button:hover{filter:brightness(.97)}\n@media(max-width:720px){.doc-standard-workspace-head-status{justify-content:flex-start}}\n'''
if '/* Final homologation: workspace state and card actions */' not in s:s+=append
write(p,s)

# Cache bust shared UI and Complexivo assets.
for p in ['trabajo-titulacion/index.html','articulo-academico/index.html']:
    s=read(p)
    s=re.sub(r'\.\./shared/module-ui\.css\?v=[^"<]+','../shared/module-ui.css?v=20260910-audit-4',s)
    s=re.sub(r'\.\./shared/module-ui\.js\?v=[^"<]+','../shared/module-ui.js?v=20260910-audit-4',s)
    write(p,s)

p='complexivo/index.html';s=read(p)
s=re.sub(r'app\.js\?v=[^"<]+','app.js?v=20260910-audit-4',s)
s=re.sub(r'data-workspace\.js\?v=[^"<]+','data-workspace.js?v=20260910-audit-4',s)
write(p,s)

print('Final UI homologation applied')