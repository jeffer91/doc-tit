(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!documentId)return;

  const manifest=window.DOC_TIT_SECTION_MANIFEST?.[documentId]||{sections:[],templateSections:{},editorSections:{}};
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  let timer=null;
  let observer=null;

  const editorSelectors={
    schedule:"#scheduleBody",
    distribution:"#distributionBody",
    operational:"#operationalPlanBody",
    nuclei:"#nucleusPlanBody",
    carreras:"#tbody-carreras",
    refuerzos:"#tbody-refuerzos",
    evaluacion:"#tbody-evaluacion",
    defensas:"#tbody-defensas"
  };

  function activeSection(){
    return document.documentElement.dataset.docTitSection
      ||$(".svd-section-tabs [data-svd-section].active")?.dataset.svdSection
      ||"information";
  }
  function sectionDef(id=activeSection()){
    return manifest.sections?.find(item=>item.id===id)||{id,label:id,title:id,kind:"document"};
  }
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
  function contentHost(){
    return $(".doc-standard-content")||$("#documentView .content-column")||$("main.main");
  }
  function docMeta(){
    return (window.DOC_TIT_DOCUMENTS||[]).find(doc=>doc.id===documentId)||{};
  }
  function code(){return $("#docCode")?.textContent?.trim()||$("#docCodeBadge")?.textContent?.trim()||docMeta().code||"—";}
  function period(){return $("#periodSelect")?.selectedOptions?.[0]?.textContent?.trim()||$("#periodText")?.textContent?.trim()||"—";}
  function institutional(){
    const fallback={
      unit:documentId==="trabajo-titulacion"?"Unidad de Gestión de Procesos Académicos":"Unidad de Titulación y Eficiencia Terminal",
      preparedBy:"Mgs. Jefferson Villarreal",
      preparedRole:documentId==="articulo-academico"?"Coordinador de Titulación y Eficiencia Terminal":"Gestor de Procesos Académicos",
      reviewedBy:"Ing. Martha Tomalá",
      approvedBy:"Dr. Alex León"
    };
    try{return {...fallback,...(window.DOC_TIT_INSTITUTIONAL?.resolve?.(documentId)||{})};}
    catch(_){return fallback;}
  }
  function sourceGenerate(){return $("#generateBtn")||$("#generateBtnBottom");}
  function documentState(){
    const source=sourceGenerate();
    const ready=!!source&&!source.disabled;
    const headline=$("#docStandardSummaryHeadline")?.textContent?.trim()
      ||$("#dataWorkspaceHeadline")?.textContent?.trim()
      ||(ready?"Todo está completo para generar el documento.":"Hay información pendiente antes de generar el documento.");
    return {ready,headline};
  }

  function ensureHeading(){
    const main=$("main.main");
    const shell=$("#svdShell");
    if(!main||!shell)return null;
    let heading=$("#referenceDocHeading");
    if(!heading){
      heading=document.createElement("header");
      heading.id="referenceDocHeading";
      heading.className="reference-doc-heading";
      heading.innerHTML=`<div><span class="reference-eyebrow">PRO-56 · PLANIFICACIÓN SEMESTRAL</span><h1></h1></div><div class="reference-heading-badges"><span class="reference-code"></span><span class="reference-heading-state"></span></div>`;
      shell.after(heading);
    }
    setText($("h1",heading),docMeta().title||$("#docTitle")?.textContent?.trim()||"Documento");
    setText($(".reference-code",heading),code());
    const state=documentState();
    const badge=$(".reference-heading-state",heading);
    if(badge){badge.classList.toggle("ready",state.ready);setText(badge,state.ready?"Listo":"Pendiente");}
    return heading;
  }

  function ensureReferenceView(){
    const host=contentHost();
    if(!host)return null;
    let root=$("#referenceView");
    if(!root){
      root=document.createElement("div");
      root.id="referenceView";
      root.className="reference-view";
      host.prepend(root);
    }
    return root;
  }

  function ensureInfoCard(){
    const root=ensureReferenceView();
    if(!root)return null;
    let card=$("#referenceInfoCard");
    if(!card){
      card=document.createElement("section");
      card.id="referenceInfoCard";
      card.className="reference-info-card";
      root.appendChild(card);
    }
    const inst=institutional();
    card.innerHTML=`
      <h2>Información del documento</h2>
      <div class="reference-info-grid">
        <div><span>Período</span><strong>${esc(period())}</strong></div>
        <div><span>Código</span><strong>${esc(code())}</strong></div>
        <div><span>Unidad</span><strong>${esc(inst.unit||"—")}</strong></div>
        <div><span>Elaborado por</span><strong>${esc(inst.preparedBy||"—")}${inst.preparedRole?` · ${esc(inst.preparedRole)}`:""}</strong></div>
        <div><span>Revisado por</span><strong>${esc(inst.reviewedBy||"—")}</strong></div>
        <div><span>Aprobado por</span><strong>${esc(inst.approvedBy||"—")}</strong></div>
      </div>`;
    return card;
  }

  function clickSource(selector){
    const source=$(selector);
    if(source&&!source.disabled)source.click();
  }

  function ensureDocumentCard(){
    const root=ensureReferenceView();
    if(!root)return null;
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
      root.appendChild(card);
      $("[data-reference-action='save']",card).addEventListener("click",()=>clickSource("#saveBtn,#saveDraftBtn,#saveBtnBottom"));
      $("[data-reference-action='diagnostic']",card).addEventListener("click",()=>clickSource("#docCoreReviewBtn"));
      $("[data-reference-action='generate']",card).addEventListener("click",()=>clickSource("#generateBtn,#generateBtnBottom"));
    }
    const state=documentState();
    card.classList.toggle("ready",state.ready);
    setText($(".reference-document-badge",card),state.ready?"Listo":"Pendiente");
    setText($(".reference-document-message",card),state.ready?"Todo está completo para generar el documento.":state.headline);
    const generate=$("[data-reference-action='generate']",card);
    if(generate)generate.disabled=!state.ready;
    const diagnostic=$("[data-reference-action='diagnostic']",card);
    if(diagnostic)diagnostic.hidden=!$("#docCoreReviewBtn");
    const save=$("[data-reference-action='save']",card);
    if(save)save.hidden=!$("#saveBtn,#saveDraftBtn,#saveBtnBottom");
    return card;
  }

  function templateKey(card){
    return $("[data-d]",card)?.dataset.d||$("[data-u]",card)?.dataset.u||$("[data-v]",card)?.dataset.v||"";
  }
  function templatesFor(section){
    return Object.entries(manifest.templateSections||{}).filter(([,target])=>target===section).map(([key])=>key);
  }
  function panelForKey(key){
    const selector=editorSelectors[key];
    return selector?$(selector)?.closest("section.panel"):null;
  }
  function closeEditors(except=[]){
    const keep=new Set(except.filter(Boolean));
    Object.keys(editorSelectors).forEach(key=>{
      const panel=panelForKey(key);
      if(!panel||keep.has(panel))return;
      panel.classList.remove("reference-open","is-open","svd-force-visible");
    });
  }
  function openEditorKey(key){
    const panel=panelForKey(key);
    if(!panel)return;
    closeEditors([panel]);
    panel.classList.remove("ptclosed");
    panel.classList.add("reference-open","is-open","svd-force-visible");
    setTimeout(()=>panel.scrollIntoView({behavior:"smooth",block:"start"}),20);
  }

  function ensureSectionPanel(section){
    const root=ensureReferenceView();
    if(!root)return null;
    let panel=$("#referenceSectionPanel");
    if(!panel){
      panel=document.createElement("section");
      panel.id="referenceSectionPanel";
      panel.className="reference-section-panel";
      panel.innerHTML=`<div class="reference-section-head"><div><span>SECCIÓN DEL DOCUMENTO</span><h2></h2></div><span class="reference-section-badge"></span></div><p class="reference-section-help"></p><div class="reference-section-extra"></div><div class="reference-section-data"></div>`;
      root.appendChild(panel);
    }
    const def=sectionDef(section);
    setText($("h2",panel),def.title||def.label);
    const keys=templatesFor(section);
    const tab=$(`.svd-section-tabs [data-svd-section="${section}"]`);
    const pending=!!$(".svd-tab-dot.pending",tab);
    const badge=$(".reference-section-badge",panel);
    if(badge){
      badge.classList.toggle("pending",pending);
      setText(badge,pending?"Pendiente":keys.length?"Datos del período":"Automática");
    }
    setText($(".reference-section-help",panel),keys.length
      ? "Completa únicamente los datos del período que alimentan esta sección. El contenido institucional restante se genera automáticamente."
      : "Esta sección forma parte del documento final y se genera automáticamente con el contenido institucional configurado.");

    const extra=$(".reference-section-extra",panel);
    if(extra){
      extra.innerHTML="";
      if(documentId==="complexivo"&&section==="metodologia"&&$("#operationalPlanBody")){
        const b=document.createElement("button");b.type="button";b.className="reference-action secondary";b.textContent="Ver plan operativo";b.onclick=()=>openEditorKey("operational");extra.appendChild(b);
      }
      if(documentId==="complexivo"&&section==="seminarios"&&$("#nucleusPlanBody")){
        const b=document.createElement("button");b.type="button";b.className="reference-action secondary";b.textContent="Ver núcleos de titulación";b.onclick=()=>openEditorKey("nuclei");extra.appendChild(b);
      }
    }
    return panel;
  }

  function organizeTemplates(section){
    const host=$("#ptcenter");
    const panel=$("#referenceSectionPanel");
    const slot=$(".reference-section-data",panel);
    if(!host||!slot)return;
    const allowed=new Set(templatesFor(section));
    let visible=0;
    $$(".ptcard",host).forEach(card=>{
      const key=templateKey(card);
      const show=allowed.has(key);
      card.hidden=!show;
      if(!show)return;
      visible++;
      const title=$("h3",card);
      if(title){
        const clean=String(title.textContent||"").replace(/^\d+\.\s*/,"");
        setText(title,`${visible}. ${clean}`);
      }
      const upload=$("[data-u]",card),download=$("[data-d]",card),view=$("[data-v]",card);
      if(upload)setText(upload,"Subir plantilla");
      if(download)setText(download,"Plantilla");
      if(view)setText(view,"Ver datos");
      const actions=$(".ptactions",card);
      if(actions&&upload&&actions.firstElementChild!==upload)actions.prepend(upload);
    });
    host.hidden=visible===0;
    const head=$(".pth h2",host);setText(head,"Plantillas del período");
    if(visible&&host.parentElement!==slot)slot.appendChild(host);
  }

  function ensureResourcePanel(){
    const root=ensureReferenceView();
    if(!root)return null;
    let panel=$("#referenceResourcePanel");
    if(!panel){
      panel=document.createElement("section");
      panel.id="referenceResourcePanel";
      panel.className="reference-section-panel";
      panel.innerHTML=`<div class="reference-section-head"><div><span>RECURSOS DEL DOCUMENTO</span><h2>Recursos</h2></div></div><article class="reference-resource-card"><div><strong>Logo institucional</strong><p>Se utiliza en la cabecera y en la presentación del documento.</p></div><div class="reference-resource-actions"><span class="reference-resource-status"></span><button type="button" class="reference-action primary">Editar</button></div></article>`;
      root.appendChild(panel);
      $("button",panel).addEventListener("click",()=>{
        const logo=$("#logoUpload")?.closest("section.panel");
        if(!logo)return;
        closeEditors([logo]);
        logo.classList.add("reference-open","is-open","svd-force-visible");
        setTimeout(()=>logo.scrollIntoView({behavior:"smooth",block:"start"}),20);
      });
    }
    const ok=!!$("#logoPreview img");
    const status=$(".reference-resource-status",panel);
    if(status){status.classList.toggle("ready",ok);setText(status,ok?"Cargado":"Pendiente");}
    return panel;
  }

  function presentationMode(section){
    const panel=$("#docPresentationSections");
    if(!panel)return;
    const show=section==="cover"||section==="header";
    panel.classList.toggle("reference-presentation-visible",show);
    panel.classList.remove("svd-show-cover","svd-show-header");
    if(section==="cover")panel.classList.add("svd-show-cover");
    if(section==="header")panel.classList.add("svd-show-header");
    panel.querySelectorAll(".doc-presentation-card").forEach(card=>{
      const open=card.dataset.presentation===section;
      card.classList.toggle("open",open);
      card.querySelector(":scope > button")?.setAttribute("aria-expanded",open?"true":"false");
    });
  }

  function hideLegacy(){
    $(".doc-standard-side")?.setAttribute("hidden","");
    $(".doc-standard-workspace")?.setAttribute("hidden","");
    $("#dataWorkspace")?.setAttribute("hidden","");
    $("#requirementsList")?.closest("section.panel")?.setAttribute("hidden","");
    $("#documentView .side-column")?.setAttribute("hidden","");
    $("#documentView > .doc-heading")?.setAttribute("hidden","");
    $("#backBtn")?.setAttribute("hidden","");
    $$(".doc-standard-layout>.actions,.document-actions,#docStandardTableTitle,#docStandardTableCards,#docStandardResourceTitle,#docStandardResourceCards").forEach(el=>el.setAttribute("hidden",""));
  }

  function editorBelongsToSection(key,section){
    return manifest.editorSections?.[key]===section;
  }
  function syncEditors(section){
    Object.keys(editorSelectors).forEach(key=>{
      const panel=panelForKey(key);
      if(!panel)return;
      const relevant=editorBelongsToSection(key,section);
      const wasOpened=panel.classList.contains("is-open")||!panel.classList.contains("ptclosed")&&panel.classList.contains("ptdetail");
      panel.classList.toggle("reference-open",relevant&&wasOpened);
      if(!relevant)panel.classList.remove("reference-open","svd-force-visible");
    });
  }

  function apply(){
    timer=null;
    const section=activeSection();
    document.documentElement.classList.add("doc-reference-ui",`doc-${documentId}`);
    document.documentElement.dataset.referenceSection=section;
    ensureHeading();
    hideLegacy();

    const root=ensureReferenceView();
    const info=ensureInfoCard();
    const complete=ensureDocumentCard();
    const sectionPanel=ensureSectionPanel(section);
    const resource=ensureResourcePanel();
    const def=sectionDef(section);
    const presentation=section==="cover"||section==="header";

    if(root)root.hidden=presentation;
    if(info)info.hidden=section!=="information";
    if(complete)complete.hidden=section!=="information";
    if(sectionPanel)sectionPanel.hidden=def.kind!=="document";
    if(resource)resource.hidden=section!=="resources";

    presentationMode(section);
    organizeTemplates(section);
    syncEditors(section);
  }

  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(apply,50);
  }

  function init(){
    apply();
    document.addEventListener("doc-tit:section-changed",schedule);
    document.addEventListener("click",event=>{
      if(event.target?.closest(".svd-section-tabs [data-svd-section],#ptcenter [data-v],#ptcenter [data-u],#ptcenter [data-d],#ptapply,#saveBtn,#saveDraftBtn,#generateBtn,#generateBtnBottom,#docCoreReviewBtn"))setTimeout(schedule,0);
    },true);
    document.addEventListener("change",schedule,true);
    document.addEventListener("input",schedule,true);
    observer=new MutationObserver(schedule);
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","hidden","disabled"]});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,160),{once:true});
  else setTimeout(init,160);
})();
