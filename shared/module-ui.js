(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!["trabajo-titulacion","articulo-academico"].includes(documentId))return;

  document.documentElement.classList.add("doc-standardized-page");
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
  const pct=()=>{
    const raw=$("#progressLabel")?.textContent||"0";
    const m=raw.match(/(\d{1,3})/);
    return m?Math.max(0,Math.min(100,Number(m[1]))):0;
  };

  let dynamicObserver=null;
  let refreshTimer=null;

  function institutional(){
    try{return window.DOC_TIT_INSTITUTIONAL?.resolve?.(documentId)||{};}catch(_){return{};}
  }

  function ensureHeading(){
    const top=$("header.top");
    if(!top)return;
    if(top.dataset.docStandardized==="1")return;
    top.dataset.docStandardized="1";
    top.classList.add("doc-standard-heading");

    const left=document.createElement("div");
    left.className="doc-standard-heading-main";
    const eyebrow=$(".eyebrow",top),title=$("h1",top),period=$("#periodText",top);
    [eyebrow,title,period].forEach(el=>{if(el)left.appendChild(el);});

    const badges=document.createElement("div");
    badges.className="doc-standard-badges";
    const code=$("#docCode",top);
    if(code){code.className="doc-standard-badge";badges.appendChild(code);}
    const state=document.createElement("span");
    state.id="docStandardState";
    state.className="doc-standard-badge state-pending";
    state.textContent="Pendiente";
    badges.appendChild(state);
    const generate=$("#generateBtn");
    if(generate){generate.classList.add("doc-standard-generate","pending");badges.appendChild(generate);}
    top.replaceChildren(left,badges);
  }

  function ensureWorkspaceShell(progressPanel,toolbar){
    if(!progressPanel)return;
    progressPanel.classList.add("doc-standard-workspace");
    const eyebrow=$(".panel-head .eyebrow",progressPanel),h3=$(".panel-head h3",progressPanel);
    if(eyebrow)eyebrow.textContent="Carga de información";
    if(h3)h3.textContent="Tablas del documento";
    if(!$(".doc-standard-workspace-note",progressPanel)){
      const note=document.createElement("p");
      note.className="doc-standard-workspace-note";
      note.textContent="Completa únicamente la información que alimenta el formato final. El período, el código y los datos institucionales se generan automáticamente.";
      $(".panel-head>div",progressPanel)?.appendChild(note);
    }

    let summary=$("#docStandardWorkspaceSummary",progressPanel);
    if(!summary){
      summary=document.createElement("div");
      summary.id="docStandardWorkspaceSummary";
      summary.className="doc-standard-workspace-summary";
      summary.innerHTML='<div><strong id="docStandardSummaryHeadline">Pendientes por completar</strong><span id="docStandardSummaryDetail"></span></div><div class="doc-standard-workspace-actions"></div>';
      const progress=$(".progress",progressPanel);
      if(progress)progress.insertAdjacentElement("afterend",summary);else progressPanel.appendChild(summary);
    }
    const actions=$(".doc-standard-workspace-actions",summary);
    if(toolbar&&actions&&toolbar.parentElement!==actions)actions.appendChild(toolbar);

    if(!$("#docStandardTableTitle",progressPanel)){
      const title=document.createElement("div");title.id="docStandardTableTitle";title.className="doc-standard-group-title";title.textContent="Tablas estructuradas";progressPanel.appendChild(title);
      const list=document.createElement("div");list.id="docStandardTableCards";list.className="doc-standard-card-list";progressPanel.appendChild(list);
      const resourceTitle=document.createElement("div");resourceTitle.id="docStandardResourceTitle";resourceTitle.className="doc-standard-group-title";resourceTitle.textContent="Recursos del documento";progressPanel.appendChild(resourceTitle);
      const resourceList=document.createElement("div");resourceList.id="docStandardResourceCards";resourceList.className="doc-standard-card-list doc-standard-resource-list";progressPanel.appendChild(resourceList);
    }
  }

  function ensureLayout(){
    const main=$("main.main"),top=$("header.top");
    if(!main||!top)return;
    let layout=$("#docStandardLayout");
    if(!layout){
      layout=document.createElement("div");layout.id="docStandardLayout";layout.className="doc-standard-layout";
      const content=document.createElement("div");content.className="doc-standard-content";
      const side=document.createElement("aside");side.className="doc-standard-side";
      side.innerHTML='<section class="panel"><span class="eyebrow">Automático</span><h3>La app ya completa</h3><div id="docStandardAuto" class="doc-standard-auto"></div></section>';
      layout.append(content,side);top.insertAdjacentElement("afterend",layout);
    }
    const content=$(".doc-standard-content",layout);
    const toolbar=$(".toolbar"),progressPanel=$("#progressLabel")?.closest("section.panel"),dynamic=$("#dynamicSections"),logoPanel=$("#logoUpload")?.closest("section.panel"),actions=$(".actions");
    if(progressPanel&&progressPanel.parentElement!==content)content.appendChild(progressPanel);
    ensureWorkspaceShell(progressPanel,toolbar);
    if(dynamic&&dynamic.parentElement!==content)content.appendChild(dynamic);
    if(logoPanel&&logoPanel.parentElement!==content)content.appendChild(logoPanel);
    if(actions&&actions.parentElement!==content)content.appendChild(actions);
    const bottom=$("#generateBtnBottom");if(bottom)bottom.hidden=true;
    const saveBottom=$("#saveBtnBottom");if(saveBottom)saveBottom.hidden=true;
    watchDynamic(dynamic);
  }

  function dynamicPanels(){return $$("#dynamicSections>section.panel");}
  function logoPanel(){return $("#logoUpload")?.closest("section.panel")||null;}
  function allEditors(){return [...dynamicPanels(),logoPanel()].filter(Boolean);}

  function ensureEditorClose(panel){
    if($(".doc-standard-editor-close",panel))return;
    const row=document.createElement("div");row.className="doc-standard-editor-close";
    row.innerHTML='<button type="button">← Volver a los datos</button>';
    row.querySelector("button").addEventListener("click",()=>{
      panel.classList.remove("is-open");
      $(".doc-standard-workspace")?.scrollIntoView({behavior:"smooth",block:"start"});
    });
    panel.insertBefore(row,panel.firstChild);
  }

  function markEditors(){
    allEditors().forEach(panel=>{panel.classList.add("doc-standard-editor");ensureEditorClose(panel);});
  }

  function openEditor(panel){
    allEditors().forEach(p=>p.classList.remove("is-open"));
    panel.classList.add("is-open");
    panel.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function logoComplete(){return !!$("#logoPreview img");}
  function scheduleCompleteFromProgress(){
    const value=pct(),logo=logoComplete()?1:0;
    return value-50-(25*logo)>=25;
  }

  function panelState(panel){
    const schedule=!!$("#scheduleBody",panel);
    const eyebrow=$(".eyebrow",panel)?.textContent?.trim()||"";
    const optional=/opcional/i.test(eyebrow);
    if(schedule){
      const rows=$$("#scheduleBody tr",panel);
      const complete=scheduleCompleteFromProgress();
      let dated=0;
      rows.forEach(tr=>{const dates=$$('input[type="date"]',tr);if(dates.length&&dates.some(el=>el.value))dated++;});
      const approval=$("#scheduleApprovalState",panel)?.textContent?.replace(/^Estado:\s*/i,"").trim();
      const meta=approval?`${dated} de ${rows.length} actividades con programación · ${approval}`:`${dated} de ${rows.length} actividades con fechas`;
      return {required:true,complete,status:complete?"Completa":"Pendiente",kind:complete?"complete":"pending",meta};
    }
    const inputs=$$("input,select,textarea",panel).filter(el=>el.type!=="button"&&el.type!=="file");
    const touched=inputs.filter(el=>el.type==="checkbox"?el.checked:String(el.value??"").trim()!=="").length;
    return {required:!optional,complete:optional||touched>0,status:touched?"Con datos":optional?"Complementaria":"Pendiente",kind:touched?"editing":optional?"optional":"pending",meta:touched?`${touched} campo(s) con información`:"Se incluye solo cuando corresponde"};
  }

  function cardForPanel(panel,index){
    const title=$("h3",panel)?.textContent?.trim()||`Tabla ${index+1}`;
    const desc=$(".help",panel)?.textContent?.trim()||"Información estructurada del documento.";
    const state=panelState(panel);
    const card=document.createElement("article");card.className="doc-standard-card";
    card.innerHTML=`<div class="doc-standard-card-main"><div class="doc-standard-card-title-row"><span class="doc-standard-card-title">${esc(title)}</span><span class="doc-standard-card-chip ${state.kind}">${esc(state.status)}</span><span class="doc-standard-card-chip ${state.required?"required":"optional"}">${state.required?"Obligatoria":"Complementaria"}</span></div><p class="doc-standard-card-desc">${esc(desc)}</p><div class="doc-standard-card-meta">${esc(state.meta)}</div></div><div class="doc-standard-card-actions"><button type="button">Abrir tabla</button></div>`;
    card.querySelector("button").addEventListener("click",()=>openEditor(panel));
    return {card,state};
  }

  function buildCards(){
    markEditors();
    const tableHost=$("#docStandardTableCards"),resourceHost=$("#docStandardResourceCards");
    if(!tableHost||!resourceHost)return {pending:1};
    tableHost.innerHTML="";resourceHost.innerHTML="";
    const states=[];
    dynamicPanels().forEach((panel,index)=>{const item=cardForPanel(panel,index);tableHost.appendChild(item.card);states.push(item.state);});

    const logo=logoPanel();
    if(logo){
      const ok=logoComplete();
      const card=document.createElement("article");card.className="doc-standard-card";
      card.innerHTML=`<div class="doc-standard-card-main"><div class="doc-standard-card-title-row"><span class="doc-standard-card-title">Logo institucional</span><span class="doc-standard-card-chip ${ok?"complete":"pending"}">${ok?"Completo":"Pendiente"}</span><span class="doc-standard-card-chip required">Obligatorio</span></div><p class="doc-standard-card-desc">Recurso institucional utilizado en la cabecera del documento.</p><div class="doc-standard-card-meta">${ok?"Logo institucional cargado":"Necesario para generar el PDF"}</div></div><div class="doc-standard-card-actions"><button type="button">Abrir recurso</button></div>`;
      card.querySelector("button").addEventListener("click",()=>openEditor(logo));resourceHost.appendChild(card);
      states.push({required:true,complete:ok});
    }
    return {pending:states.filter(s=>s.required&&!s.complete).length};
  }

  function updateAuto(){
    const host=$("#docStandardAuto");if(!host)return;
    const inst=institutional(),period=$("#periodText")?.textContent?.trim()||"—",code=$("#docCode")?.textContent?.trim()||"—";
    host.innerHTML=`<div class="doc-standard-auto-row"><span>Período</span><strong>${esc(period)}</strong></div><div class="doc-standard-auto-row"><span>Código</span><strong>${esc(code)}</strong></div><div class="doc-standard-auto-row"><span>Unidad</span><strong>${esc(inst.unit||"—")}</strong></div><div class="doc-standard-auto-row"><span>Elaborado por</span><strong>${esc(inst.preparedBy||"—")}${inst.preparedRole?` · ${esc(inst.preparedRole)}`:""}</strong></div><div class="doc-standard-auto-row"><span>Revisado por</span><strong>${esc(inst.reviewedBy||"—")}</strong></div><div class="doc-standard-auto-row"><span>Aprobado por</span><strong>${esc(inst.approvedBy||"—")}</strong></div>`;
  }

  function updateAll(){
    refreshTimer=null;
    const {pending}=buildCards(),ready=pending===0&&pct()>=100;
    const btn=$("#generateBtn"),state=$("#docStandardState"),headline=$("#docStandardSummaryHeadline"),detail=$("#docStandardSummaryDetail");
    if(btn){btn.classList.toggle("ready",ready);btn.classList.toggle("pending",!ready);btn.disabled=!ready;btn.textContent=ready?"Generar PDF":`Generar PDF · ${Math.max(1,pending)} pendiente${pending===1?"":"s"}`;}
    if(state){state.classList.toggle("state-ready",ready);state.classList.toggle("state-pending",!ready);state.textContent=ready?"Listo para generar":"Pendiente";}
    if(headline)headline.textContent=ready?"Documento listo para generar":`${pending} elemento${pending===1?"":"s"} pendiente${pending===1?"":"s"} para generar el PDF`;
    if(detail)detail.textContent=ready?"Todos los datos obligatorios están completos.":"Las tablas complementarias no bloquean la generación.";
    updateAuto();
  }

  function scheduleRefresh(){if(refreshTimer)clearTimeout(refreshTimer);refreshTimer=setTimeout(updateAll,30);}
  function watchDynamic(dynamic){
    if(!dynamic||dynamicObserver)return;
    dynamicObserver=new MutationObserver(scheduleRefresh);dynamicObserver.observe(dynamic,{childList:true});
  }

  function init(){
    ensureHeading();ensureLayout();updateAll();
    const label=$("#progressLabel");if(label)new MutationObserver(scheduleRefresh).observe(label,{childList:true,subtree:true,characterData:true});
    const period=$("#periodText"),code=$("#docCode");[period,code].filter(Boolean).forEach(el=>new MutationObserver(()=>{updateAuto();scheduleRefresh();}).observe(el,{childList:true,subtree:true,characterData:true}));
    document.addEventListener("change",scheduleRefresh,true);document.addEventListener("input",scheduleRefresh,true);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0),{once:true});
  else setTimeout(init,0);
})();
