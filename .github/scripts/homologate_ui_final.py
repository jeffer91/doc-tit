from pathlib import Path
import re

ROOT=Path('.')

def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s): (ROOT/p).write_text(s,encoding='utf-8')
def once(s,old,new,label):
    pairs=[(old,new),(old.replace('\\n','\n'),new.replace('\\n','\n'))]
    for source,target in pairs:
        if source in s: return s.replace(source,target,1)
        if target in s: return s
    raise SystemExit(f'pattern missing: {label}')

# Complexivo: wording, semantic state + user-input percentage, same resource terminology.
p='complexivo/app.js';s=read(p)
s=once(s,
    'description: "Completa el cronograma, la distribución y cualquier información adicional. La app analiza el texto libre y genera el PDF completo directamente.",',
    'description: "Completa únicamente las tablas necesarias del período. El resto del documento se genera automáticamente con la configuración institucional vigente.",',
    'complexivo description')
write(p,s)

p='complexivo/data-workspace.js';s=read(p)
s=once(s,
    '.data-workspace-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid #e5ebf0}',
    '.data-workspace-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid #e5ebf0}\n      .data-workspace-head-meta{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}\n      .data-workspace-percent{font-size:11px;color:#667687;font-weight:800;white-space:nowrap}',
    'complexivo workspace head meta css')
s=once(s,
    '<p>Cada documento administra sus propias tablas. Puedes editar una tabla dentro de la app o descargar/subir una plantilla de Excel sin reemplazar las demás.</p>\n        </div>\n        <span id="dataWorkspaceStatus" class="data-workspace-status">Pendiente</span>',
    '<p>Completa únicamente la información que alimenta el formato final. El período, el código y los datos institucionales se generan automáticamente.</p>\n        </div>\n        <div class="data-workspace-head-meta"><span id="dataWorkspacePercent" class="data-workspace-percent">0% completo</span><span id="dataWorkspaceStatus" class="data-workspace-status">Pendiente</span></div>',
    'complexivo workspace header')
s=once(s,'<div class="data-group-title">Otros datos del documento</div>','<div class="data-group-title">Recursos del documento</div>','complexivo resource group')
s=once(s,
    '<p class="data-workspace-note">Las tablas obligatorias determinan si el documento está listo para generarse. Las tablas complementarias pueden llenarse cuando exista información operativa confirmada; no se inventan datos pendientes.</p>',
    '<p class="data-workspace-note">Las tablas obligatorias y el logo institucional determinan si el documento está listo para generarse. Las tablas complementarias no bloquean la generación.</p>',
    'complexivo workspace note')
s=once(s,
'''    const status=$("#dataWorkspaceStatus");
    const headline=$("#dataWorkspaceHeadline");
    const detail=$("#dataWorkspaceDetail");''',
'''    const status=$("#dataWorkspaceStatus");
    const percent=$("#dataWorkspacePercent");
    const headline=$("#dataWorkspaceHeadline");
    const detail=$("#dataWorkspaceDetail");''','complexivo render summary vars')
s=once(s,
'''    if(headline) headline.textContent=pending?`${pending} elemento(s) pendiente(s) para generar el PDF`:"Información obligatoria completa";
    if(detail) detail.textContent=`${completeTables} de ${requiredTables.length} tablas obligatorias completas · ${TABLES.length-requiredTables.length} tablas complementarias · logo ${logoOk?"cargado":"pendiente"}`;''',
'''    const tablePercent=requiredTables.length?Math.round((completeTables/requiredTables.length)*100):100;
    if(percent) percent.textContent=`${tablePercent}% completo`;
    if(headline) headline.textContent=pending?`${pending} elemento${pending===1?"":"s"} pendiente${pending===1?"":"s"} para generar el PDF`:"Información obligatoria completa";
    if(detail) detail.textContent=`${completeTables} de ${requiredTables.length} tablas obligatorias completas · ${TABLES.length-requiredTables.length} tablas complementarias · logo ${logoOk?"cargado":"pendiente"}`;''','complexivo render summary percent')
write(p,s)

# Shared UI for Trabajo + Artículo.
p='shared/module-ui.js';s=read(p)
s=once(s,
'''    if(h3)h3.textContent="Tablas del documento";
    if(!$(".doc-standard-workspace-note",progressPanel)){''',
'''    if(h3)h3.textContent="Tablas del documento";
    const panelHead=$(".panel-head",progressPanel);
    let headStatus=$("#docStandardWorkspaceHeadStatus",progressPanel);
    if(panelHead&&!headStatus){
      headStatus=document.createElement("div");headStatus.id="docStandardWorkspaceHeadStatus";headStatus.className="doc-standard-workspace-head-status";
      const state=document.createElement("span");state.id="docStandardWorkspaceState";state.className="doc-standard-workspace-state pending";state.textContent="Pendiente";
      headStatus.appendChild(state);panelHead.appendChild(headStatus);
    }
    const progressLabel=$("#progressLabel");if(headStatus&&progressLabel&&progressLabel.parentElement!==headStatus)headStatus.insertBefore(progressLabel,headStatus.firstChild);
    if(!$(".doc-standard-workspace-note",progressPanel)){''','shared workspace semantic status')
s=once(s,
'''    const actions=$(".doc-standard-workspace-actions",summary);
    if(toolbar&&actions&&toolbar.parentElement!==actions)actions.appendChild(toolbar);''',
'''    const actions=$(".doc-standard-workspace-actions",summary);
    if(toolbar&&actions&&toolbar.parentElement!==actions)actions.appendChild(toolbar);
    const downloadBtn=$("#downloadTemplateBtn");if(downloadBtn)downloadBtn.textContent="Descargar plantilla";
    const importInput=$("#importInput"),importLabel=importInput?.closest("label");
    if(importLabel){const textNode=Array.from(importLabel.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);if(textNode)textNode.textContent="Subir plantilla ";}''','shared action labels')

s=re.sub(r'  function scheduleCompleteFromProgress\(\)\{.*?\n  \}\n\n(?=  function panelState\(panel\)\{)','',s,count=1,flags=re.S)
s=once(s,
'''    if(schedule){
      const rows=$$("#scheduleBody tr",panel);
      const complete=scheduleCompleteFromProgress();
      let dated=0;
      rows.forEach(tr=>{const dates=$$('input[type="date"]',tr);if(dates.length&&dates.some(el=>el.value))dated++;});
      const approval=$("#scheduleApprovalState",panel)?.textContent?.replace(/^Estado:\s*/i,"").trim();
      const meta=approval?`${dated} de ${rows.length} actividades con programación · ${approval}`:`${dated} de ${rows.length} actividades con fechas`;
      return {required:true,complete,status:complete?"Completa":"Pendiente",kind:complete?"complete":"pending",meta};
    }''',
'''    if(schedule){
      const rows=$$("#scheduleBody tr",panel);
      const activeRows=rows.filter(tr=>{const check=$("input[type=\"checkbox\"][data-f=\"active\"]",tr);return !check||check.checked;});
      const approval=$("#scheduleApprovalState",panel)?.textContent?.replace(/^Estado:\s*/i,"").trim()||"";
      let dated=0;
      activeRows.forEach(tr=>{const dates=$$('input[type="date"]',tr);if(dates.length&&dates.some(el=>el.value))dated++;});
      const datesComplete=activeRows.length>0&&activeRows.every(tr=>{const dates=$$('input[type="date"]',tr);if(!dates.length)return false;return documentId==="trabajo-titulacion"?dates.some(el=>el.value):dates.every(el=>el.value);});
      const complete=datesComplete&&(!approval||/^Aprobado$/i.test(approval));
      const meta=approval?`${dated} de ${activeRows.length} actividades con programación · ${approval}`:`${dated} de ${activeRows.length} actividades con fechas`;
      return {required:true,complete,status:complete?"Completa":"Pendiente",kind:complete?"complete":"pending",meta};
    }''','shared schedule state')

pat=re.compile(r'  function cardForPanel\(panel,index\)\{.*?\n  \}\n\n  function buildCards\(\)\{',re.S)
new_card='''  function cardForPanel(panel,index){
    const schedule=!!$("#scheduleBody",panel);
    const title=schedule?"Cronograma general":($("h3",panel)?.textContent?.trim()||`Tabla ${index+1}`);
    const desc=schedule?"Fechas y responsables de las actividades del proceso.":($(".help",panel)?.textContent?.trim()||"Información estructurada del documento.");
    const state=panelState(panel);
    const card=document.createElement("article");card.className="doc-standard-card";
    const scheduleActions=schedule&&documentId==="trabajo-titulacion"?'<button type="button" data-card-action="download">Descargar</button><button type="button" data-card-action="upload">Subir</button>':'';
    card.innerHTML=`<div class="doc-standard-card-main"><div class="doc-standard-card-title-row"><span class="doc-standard-card-title">${esc(title)}</span><span class="doc-standard-card-chip ${state.kind}">${esc(state.status)}</span><span class="doc-standard-card-chip ${state.required?"required":"optional"}">${state.required?"Obligatoria":"Complementaria"}</span></div><p class="doc-standard-card-desc">${esc(desc)}</p><div class="doc-standard-card-meta">${esc(state.meta)}</div></div><div class="doc-standard-card-actions">${scheduleActions}<button type="button" class="primary-action" data-card-action="open">Abrir tabla</button></div>`;
    $("[data-card-action=\"open\"]",card)?.addEventListener("click",()=>openEditor(panel));
    $("[data-card-action=\"download\"]",card)?.addEventListener("click",()=>$("#downloadTemplateBtn")?.click());
    $("[data-card-action=\"upload\"]",card)?.addEventListener("click",()=>$("#importInput")?.click());
    return {card,state};
  }

  function buildCards(){'''
if pat.search(s): s=pat.sub(lambda m:new_card,s,count=1)
elif 'data-card-action="download"' not in s: raise SystemExit('cardForPanel not found')

s=once(s,
'''    const states=[];
    dynamicPanels().forEach((panel,index)=>{const item=cardForPanel(panel,index);tableHost.appendChild(item.card);states.push(item.state);});''',
'''    const states=[],tableStates=[];
    dynamicPanels().forEach((panel,index)=>{const item=cardForPanel(panel,index);tableHost.appendChild(item.card);states.push(item.state);tableStates.push(item.state);});''','shared build table states')
s=once(s,
'''    return {pending:states.filter(s=>s.required&&!s.complete).length};''',
'''    const requiredTables=tableStates.filter(s=>s.required);
    const completeRequiredTables=requiredTables.filter(s=>s.complete).length;
    return {pending:states.filter(s=>s.required&&!s.complete).length,requiredTables:requiredTables.length,completeRequiredTables,logoOk:logoComplete(),complementaryTables:tableStates.filter(s=>!s.required).length};''','shared build return')

pat=re.compile(r'  function updateAll\(\)\{.*?\n  \}\n\n  function scheduleRefresh\(\)',re.S)
new_update='''  function updateAll(){
    refreshTimer=null;
    const {pending,requiredTables,completeRequiredTables,logoOk,complementaryTables}=buildCards(),ready=pending===0;
    const tablePercent=requiredTables?Math.round((completeRequiredTables/requiredTables)*100):100;
    const btn=$("#generateBtn"),state=$("#docStandardState"),workspaceState=$("#docStandardWorkspaceState"),headline=$("#docStandardSummaryHeadline"),detail=$("#docStandardSummaryDetail"),progressLabel=$("#progressLabel"),progressBar=$("#progressBar");
    if(progressLabel)progressLabel.textContent=`${tablePercent}% completo`;
    if(progressBar)progressBar.style.width=`${tablePercent}%`;
    if(btn){btn.classList.toggle("ready",ready);btn.classList.toggle("pending",!ready);btn.disabled=!ready;btn.textContent=ready?"Generar PDF":`Generar PDF · ${Math.max(1,pending)} pendiente${pending===1?"":"s"}`;}
    if(state){state.classList.toggle("state-ready",ready);state.classList.toggle("state-pending",!ready);state.textContent=ready?"Listo para generar":"Pendiente";}
    if(workspaceState){workspaceState.classList.toggle("ready",ready);workspaceState.classList.toggle("pending",!ready);workspaceState.textContent=ready?"Listo":"Pendiente";}
    if(headline)headline.textContent=ready?"Información obligatoria completa":`${pending} elemento${pending===1?"":"s"} pendiente${pending===1?"":"s"} para generar el PDF`;
    if(detail)detail.textContent=`${completeRequiredTables} de ${requiredTables} tablas obligatorias completas · ${complementaryTables} tablas complementarias · logo ${logoOk?"cargado":"pendiente"}`;
    updateAuto();
  }

  function scheduleRefresh()'''
if pat.search(s): s=pat.sub(lambda m:new_update,s,count=1)
elif 'const tablePercent=requiredTables?' not in s: raise SystemExit('updateAll not found')
write(p,s)

p='shared/module-ui.css';s=read(p)
append='''
/* Final homologation: workspace state and card actions */
.doc-standard-workspace .panel-head{align-items:flex-start!important}
.doc-standard-workspace-head-status{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.doc-standard-workspace-head-status .progress-label{font-size:11px!important;color:#687386!important;font-weight:800!important;white-space:nowrap}
.doc-standard-workspace-state{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800;white-space:nowrap}
.doc-standard-workspace-state.pending{background:#fde8e8;color:#991b1b}
.doc-standard-workspace-state.ready{background:#e8f5ee;color:#166534}
.doc-standard-card-actions button{border:0;border-radius:8px;padding:7px 10px;font:inherit;font-size:11px;font-weight:700;cursor:pointer;background:#e9eff5;color:#173755}
.doc-standard-card-actions button.primary-action{background:#153b62;color:#fff}
.doc-standard-card-actions button:hover{filter:brightness(.97)}
@media(max-width:720px){.doc-standard-workspace-head-status{justify-content:flex-start}}
'''
if '/* Final homologation: workspace state and card actions */' not in s:s+=append
write(p,s)

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