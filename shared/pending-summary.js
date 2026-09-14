(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!documentId)return;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const manifest=window.DOC_TIT_SECTION_MANIFEST?.[documentId]||{sections:[],templateSections:{}};
  let timer=null;
  let lastSignature="";

  function activeSection(){
    return document.documentElement.dataset.docTitSection||"information";
  }
  function sectionDef(id){
    return manifest.sections?.find(item=>item.id===id)||{id,label:id,title:id};
  }
  function templateKey(card){
    return $("[data-u]",card)?.dataset.u||$("[data-d]",card)?.dataset.d||$("[data-v]",card)?.dataset.v||"";
  }
  function templateStatus(card){
    return String($(".ptstatus",card)?.textContent||"").trim();
  }
  function sourceButton(attr,key){
    return $$(`#ptcenter [data-${attr}]`).find(button=>button.dataset[attr]===key)||null;
  }
  function clickSource(attr,key){
    const source=sourceButton(attr,key);
    if(source&&!source.disabled)source.click();
  }
  function openSection(section){
    const tab=$(`.svd-section-tabs [data-svd-section="${section}"]`);
    if(tab){tab.click();return true;}
    const more=$(`.svd-section-more [data-svd-more-section="${section}"]`);
    if(more){more.click();return true;}
    return false;
  }
  function viewTemplate(key,section){
    openSection(section);
    window.setTimeout(()=>clickSource("v",key),140);
  }

  function pendingTemplates(){
    return $$("#ptcenter .ptcard").map(card=>{
      const key=templateKey(card),status=templateStatus(card),section=manifest.templateSections?.[key]||"";
      if(!key||!section)return null;
      if(/^(cargado|opcional)$/i.test(status))return null;
      const title=String($("h3",card)?.textContent||sectionDef(section).label||key).replace(/^\d+\.\s*/,"").trim();
      return {type:"template",key,section,title,status:status||"Pendiente"};
    }).filter(Boolean);
  }

  function pendingSections(represented){
    return $$(".svd-section-tabs [data-svd-section]").map(tab=>{
      const id=tab.dataset.svdSection||"";
      if(!id||id==="information"||represented.has(id))return null;
      if(!$(".svd-tab-dot.pending",tab))return null;
      const def=sectionDef(id);
      return {type:"section",section:id,title:def.label||def.title||id,status:"Pendiente"};
    }).filter(Boolean);
  }

  function stateReady(){
    const button=$("#generateBtn")||$("#generateBtnBottom");
    return !!button&&!button.disabled;
  }
  function diagnostic(){
    $("#docCoreReviewBtn")?.click();
  }

  function ensurePanel(){
    const root=$("#referenceView");
    if(!root)return null;
    let panel=$("#referencePendingPanel");
    if(!panel){
      panel=document.createElement("section");
      panel.id="referencePendingPanel";
      panel.className="reference-pending-panel";
      const complete=$("#referenceDocumentCard");
      if(complete?.parentElement===root)complete.after(panel);else root.appendChild(panel);
    }
    return panel;
  }

  function render(){
    timer=null;
    const panel=ensurePanel();
    if(!panel)return;

    const templates=pendingTemplates();
    const represented=new Set(templates.map(item=>item.section));
    const sections=pendingSections(represented);
    const items=[...templates,...sections];
    const ready=stateReady();
    const visible=activeSection()==="information"&&!ready;

    const signature=JSON.stringify({section:activeSection(),ready,items});
    if(signature===lastSignature){panel.hidden=!visible;return;}
    lastSignature=signature;

    panel.hidden=!visible;
    if(!visible)return;

    if(!items.length){
      panel.innerHTML=`<div class="reference-pending-head"><div><strong>Pendiente por revisar</strong><span>No se pudo identificar automáticamente el elemento faltante.</span></div></div><div class="reference-pending-fallback"><span>Abre el diagnóstico para ver exactamente qué falta.</span><button type="button" class="reference-action secondary" data-pending-diagnostic>Diagnóstico</button></div>`;
      $("[data-pending-diagnostic]",panel)?.addEventListener("click",diagnostic);
      return;
    }

    panel.innerHTML=`<div class="reference-pending-head"><div><strong>Pendientes para completar</strong><span>${items.length} ${items.length===1?"elemento pendiente":"elementos pendientes"}</span></div></div><div class="reference-pending-list"></div>`;
    const list=$(".reference-pending-list",panel);

    items.forEach(item=>{
      const card=document.createElement("article");
      card.className="reference-pending-item";
      if(item.type==="template"){
        card.innerHTML=`<div class="reference-pending-main"><div><strong>${item.title}</strong><span>Completa esta plantilla para continuar con el documento.</span></div><em>${item.status}</em></div><div class="reference-pending-actions"><button type="button" class="reference-action secondary" data-pending-action="download">Descargar plantilla</button><button type="button" class="reference-action primary" data-pending-action="upload">Subir plantilla</button><button type="button" class="reference-action secondary" data-pending-action="view">Ver / corregir</button></div>`;
        $("[data-pending-action='download']",card)?.addEventListener("click",()=>clickSource("d",item.key));
        $("[data-pending-action='upload']",card)?.addEventListener("click",()=>clickSource("u",item.key));
        $("[data-pending-action='view']",card)?.addEventListener("click",()=>viewTemplate(item.key,item.section));
      }else{
        card.innerHTML=`<div class="reference-pending-main"><div><strong>${item.title}</strong><span>Esta sección requiere atención antes de generar el documento.</span></div><em>${item.status}</em></div><div class="reference-pending-actions"><button type="button" class="reference-action secondary" data-pending-action="open">Abrir sección</button></div>`;
        $("[data-pending-action='open']",card)?.addEventListener("click",()=>openSection(item.section));
      }
      list?.appendChild(card);
    });
  }

  function schedule(){
    if(timer)return;
    timer=window.setTimeout(render,70);
  }

  document.addEventListener("doc-tit:section-changed",schedule);
  document.addEventListener("input",schedule,true);
  document.addEventListener("change",schedule,true);
  document.addEventListener("click",event=>{
    if(event.target?.closest("#ptapply,#applyImportBtn,#approveScheduleBtn,[data-u],[data-d],[data-v]"))window.setTimeout(schedule,120);
  },true);

  new MutationObserver(mutations=>{
    if(mutations.every(m=>m.target instanceof Element&&m.target.closest?.("#referencePendingPanel")))return;
    schedule();
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","hidden","disabled"]});

  schedule();
})();
