(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!documentId)return;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  let timer=null;
  let observer=null;

  function activeSection(){
    return $(".svd-section-tabs [data-svd-section].active")?.dataset.svdSection||"information";
  }

  function setText(el,text){
    if(el&&el.textContent!==text)el.textContent=text;
  }

  function templateKey(card){
    return $("[data-d]",card)?.dataset.d||$("[data-u]",card)?.dataset.u||$("[data-v]",card)?.dataset.v||"";
  }

  function allowedTemplate(key,section){
    if(section==="schedule")return key==="cronograma";
    if(section==="distribution")return key==="distribucion";
    if(section==="information"&&documentId==="articulo-academico")return key!=="cronograma";
    return false;
  }

  function organizeTemplates(section){
    const host=$("#ptcenter");
    if(!host)return;

    const content=$(".doc-standard-content")||$("#documentForm")||$("main.main");
    if(content&&host.parentElement!==content)content.prepend(host);

    const head=$(".pth h2",host);
    setText(head,"Plantillas del período");

    let visible=0;
    $$(".ptcard",host).forEach((card,index)=>{
      const key=templateKey(card);
      card.dataset.referenceTemplateKey=key;
      const show=allowedTemplate(key,section);
      card.hidden=!show;
      if(show){
        visible++;
        const title=$("h3",card);
        if(title){
          const clean=String(title.textContent||"").replace(/^\d+\.\s*/,"");
          setText(title,`${visible}. ${clean}`);
        }
        const upload=$("[data-u]",card),download=$("[data-d]",card),view=$("[data-v]",card);
        if(upload){setText(upload,"Subir plantilla");upload.classList.add("p");}
        if(download){setText(download,"Plantilla");download.classList.add("s");}
        if(view){setText(view,"Ver datos");view.classList.add("g");}
        const actions=$(".ptactions",card);
        if(actions&&upload&&actions.firstElementChild!==upload)actions.prepend(upload);
      }
    });
    host.hidden=visible===0;
  }

  function annotateCards(){
    $$("#docStandardTableCards .doc-standard-card").forEach(card=>{
      const title=$(".doc-standard-card-title",card)?.textContent||"";
      card.classList.toggle("reference-duplicate-schedule",/cronograma/i.test(title));
    });
  }

  function syncEditorState(section){
    $$(".doc-standard-editor[data-pt='1'], .doc-standard-editor.ptdetail").forEach(panel=>{
      const open=!panel.classList.contains("ptclosed");
      const isSchedule=!!$("#scheduleBody",panel);
      const isDistribution=!!$("#distributionBody",panel);
      const relevant=(section==="schedule"&&isSchedule)||(section==="distribution"&&isDistribution);
      panel.classList.toggle("reference-open",relevant&&open);
      if(!relevant)panel.classList.remove("reference-open");
    });
  }

  function documentState(){
    const source=$("#generateBtn")||$("#generateBtnBottom");
    const ready=!!source&&!source.disabled;
    const headline=$("#docStandardSummaryHeadline")?.textContent?.trim();
    const detail=$("#docStandardSummaryDetail")?.textContent?.trim();
    return {
      ready,
      headline:headline||(ready?"Todo está completo para generar el documento.":"Hay información pendiente antes de generar el documento."),
      detail:detail||""
    };
  }

  function clickSource(selector){
    const source=$(selector);
    if(source&&!source.disabled)source.click();
  }

  function ensureDocumentCard(section){
    if(!["trabajo-titulacion","articulo-academico"].includes(documentId))return;
    const content=$(".doc-standard-content");
    if(!content)return;

    let card=$("#referenceDocumentCard");
    if(!card){
      card=document.createElement("section");
      card.id="referenceDocumentCard";
      card.className="reference-document-card";
      card.innerHTML=`
        <div class="reference-document-head"><strong>Documento completo</strong><span class="reference-document-badge">Pendiente</span></div>
        <p class="reference-document-message"></p>
        <div class="reference-document-actions">
          <button type="button" class="reference-action secondary" data-reference-action="save">Guardar borrador</button>
          <button type="button" class="reference-action secondary" data-reference-action="diagnostic">Diagnóstico</button>
          <button type="button" class="reference-action primary" data-reference-action="generate">Generar PDF</button>
        </div>`;
      content.appendChild(card);
      $("[data-reference-action='save']",card).addEventListener("click",()=>clickSource("#saveBtn,#saveDraftBtn,#saveBtnBottom"));
      $("[data-reference-action='diagnostic']",card).addEventListener("click",()=>clickSource("#docCoreReviewBtn"));
      $("[data-reference-action='generate']",card).addEventListener("click",()=>clickSource("#generateBtn,#generateBtnBottom"));
    }

    card.hidden=section!=="information";
    if(card.hidden)return;
    if(card.parentElement!==content)content.appendChild(card);

    const state=documentState();
    card.classList.toggle("ready",state.ready);
    setText($(".reference-document-badge",card),state.ready?"Listo":"Pendiente");
    setText($(".reference-document-message",card),state.ready?"Todo está completo para generar el documento.":state.headline);
    const generate=$("[data-reference-action='generate']",card);
    if(generate){generate.disabled=!state.ready;setText(generate,"Generar PDF");}
    const diagnostic=$("[data-reference-action='diagnostic']",card);
    if(diagnostic)diagnostic.hidden=!$("#docCoreReviewBtn");
    const save=$("[data-reference-action='save']",card);
    if(save)save.hidden=!$("#saveBtn,#saveDraftBtn,#saveBtnBottom");
  }

  function simplifyInformation(section){
    const side=$(".doc-standard-side");
    const sideTitle=$(".doc-standard-side h3");
    if(sideTitle)setText(sideTitle,"Información del documento");
    if(side)side.hidden=section!=="information";

    const workspace=$(".doc-standard-workspace");
    if(workspace)workspace.hidden=true;
  }

  function apply(){
    timer=null;
    const section=activeSection();
    document.documentElement.dataset.referenceSection=section;
    organizeTemplates(section);
    annotateCards();
    syncEditorState(section);
    simplifyInformation(section);
    ensureDocumentCard(section);
  }

  function schedule(){
    if(timer)return;
    timer=setTimeout(apply,40);
  }

  function init(){
    document.documentElement.classList.add("doc-reference-ui");
    apply();

    document.addEventListener("click",event=>{
      if(event.target?.closest(".svd-section-tabs [data-svd-section],#ptcenter [data-v],#ptcenter [data-u],#ptcenter [data-d],#ptapply,#saveBtn,#saveDraftBtn,#generateBtn,#generateBtnBottom,#docCoreReviewBtn"))setTimeout(schedule,0);
    },true);
    document.addEventListener("change",schedule,true);
    document.addEventListener("input",schedule,true);

    observer=new MutationObserver(schedule);
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","hidden","disabled"]});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,120),{once:true});
  else setTimeout(init,120);
})();
