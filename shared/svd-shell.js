(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!documentId)return;

  const manifest=window.DOC_TIT_SECTION_MANIFEST?.[documentId];
  const sectionDefs=Array.isArray(manifest?.sections)&&manifest.sections.length
    ? manifest.sections
    : [
        {id:"information",label:"Información",kind:"utility"},
        {id:"cover",label:"Portada",kind:"presentation"},
        {id:"header",label:"Cabecera",kind:"presentation"},
        {id:"resources",label:"Recursos",kind:"resource"}
      ];

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const main=()=>$("main.main");
  const activeKey=`doc-tit-svd-section-${documentId}`;
  const GLOBAL_PERIOD_KEY="doc-tit-global-active-period";
  const FINAL_PREFIX="doc-tit-svd-final";

  let activeSection=sectionDefs.some(item=>item.id===localStorage.getItem(activeKey))
    ? localStorage.getItem(activeKey)
    : "information";
  let refreshTimer=null;
  let globalPeriodBound=false;
  let generationWatchBound=false;

  function ensureStyles(){
    if(document.querySelector('link[data-doc-tit-svd-shell]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.dataset.docTitSvdShell="1";
    const path=String(window.location.pathname||"");
    const marker="/doc-tit/";
    const idx=path.indexOf(marker);
    const base=idx>=0?path.slice(0,idx)+marker:"/doc-tit/";
    link.href=base+"shared/svd-shell.css?v=20260914-sections-1";
    document.head.appendChild(link);
  }

  function documentTitle(){
    return $("#docTitle")?.textContent?.trim()||$("#screenTitle")?.textContent?.trim()||"Documento";
  }
  function currentPeriodId(){return $("#periodSelect")?.value||"";}
  function currentSection(){return sectionDefs.find(item=>item.id===activeSection)||sectionDefs[0];}

  function finalKey(docId=documentId,periodId=currentPeriodId()){
    return `${FINAL_PREFIX}::${periodId}::${docId}`;
  }
  function readManualFinalized(docId,periodId){
    try{
      const raw=localStorage.getItem(finalKey(docId,periodId));
      if(raw===null)return null;
      const parsed=JSON.parse(raw);
      return typeof parsed?.finalized==="boolean"?parsed.finalized:null;
    }catch(_){return null;}
  }
  function writeFinalized(value){
    const periodId=currentPeriodId();
    if(!periodId)return;
    try{localStorage.setItem(finalKey(documentId,periodId),JSON.stringify({finalized:!!value,updatedAt:new Date().toISOString()}));}catch(_){}
  }
  function fallbackFinalized(docId,periodId){
    try{
      if(docId==="complexivo"){
        const state=JSON.parse(localStorage.getItem("doc-tit-complexivo-v1")||"null");
        const row=state?.documents?.[`${periodId}::plan-examen-complexivo`];
        return !!(row?.generatedAt||row?.generatedFileName);
      }
      const cache=JSON.parse(localStorage.getItem("doc-tit-cloud-cache-v3")||"null");
      const key=docId==="trabajo-titulacion"?"plan-trabajo-titulacion":"plan-articulo-academico";
      const row=cache?.documents?.[`${periodId}::${key}`];
      return !!(row?.generated_at||row?.generated_file_name);
    }catch(_){return false;}
  }
  function isFinalized(docId,periodId){
    const manual=readManualFinalized(docId,periodId);
    return manual===null?fallbackFinalized(docId,periodId):manual;
  }
  function markCurrentStale(target){
    if(!(target instanceof Element)||target.id==="periodSelect"||target.closest("dialog"))return;
    if(!target.closest("main"))return;
    writeFinalized(false);
  }

  function shell(){
    let root=$("#svdShell");
    if(root)return root;
    const host=main();
    if(!host)return null;

    root=document.createElement("section");
    root.id="svdShell";
    root.className="svd-shell";
    root.innerHTML=`
      <div class="svd-topline">
        <div class="svd-brand"><strong>DOC-TIT</strong><span>Gestión documental</span></div>
        <div class="svd-period-slot"></div>
        <details class="svd-details"><summary>Más detalles</summary><div class="svd-details-body"></div></details>
      </div>
      <div class="svd-documents-slot" aria-label="Documentos"></div>
      <nav class="svd-section-tabs" aria-label="Secciones del documento"></nav>`;
    host.prepend(root);

    const period=$(".sidebar .period-box")||$(".period-box");
    if(period)$(".svd-period-slot",root)?.appendChild(period);
    const globalNav=$("[data-doc-tit-navigation]");
    if(globalNav)$(".svd-documents-slot",root)?.appendChild(globalNav);

    const details=$(".svd-details-body",root);
    const cloud=$("#cloudCard")||$("#cloudStatusCard");
    const footer=$(".sidebar-footer");
    if(cloud)details?.appendChild(cloud);
    if(footer)details?.appendChild(footer);
    if(details&&!details.children.length)$(".svd-details",root)?.remove();

    const tabs=$(".svd-section-tabs",root);
    sectionDefs.forEach(item=>{
      const button=document.createElement("button");
      button.type="button";
      button.dataset.svdSection=item.id;
      button.dataset.sectionKind=item.kind||"document";
      button.title=item.title||item.label;
      button.innerHTML=`<span>${item.label}</span><i class="svd-tab-dot" aria-hidden="true"></i>`;
      button.addEventListener("click",()=>activate(item.id,true));
      tabs?.appendChild(button);
    });

    document.documentElement.classList.add("svd2");
    document.documentElement.dataset.docTitDocument=documentId;
    bindDocumentLinks();
    return root;
  }

  function bindDocumentLinks(){
    $$(".svd-documents-slot .doc-tit-nav-link").forEach(link=>{
      if(link.dataset.svdPeriodBound==="1")return;
      link.dataset.svdPeriodBound="1";
      link.addEventListener("click",()=>{
        const periodId=currentPeriodId();
        if(periodId)try{localStorage.setItem(GLOBAL_PERIOD_KEY,periodId);}catch(_){}
      });
    });
  }

  function syncGlobalPeriod(){
    const select=$("#periodSelect");
    if(!select||!select.options.length)return;
    let global="";
    try{global=localStorage.getItem(GLOBAL_PERIOD_KEY)||"";}catch(_){}
    if(global&&select.value!==global&&Array.from(select.options).some(o=>o.value===global)){
      select.value=global;
      select.dispatchEvent(new Event("change",{bubbles:true}));
      return;
    }
    if(select.value)try{localStorage.setItem(GLOBAL_PERIOD_KEY,select.value);}catch(_){}
    if(!globalPeriodBound){
      globalPeriodBound=true;
      select.addEventListener("change",()=>{
        if(select.value)try{localStorage.setItem(GLOBAL_PERIOD_KEY,select.value);}catch(_){}
        setTimeout(()=>{refreshDocumentCards();refreshStatus();},0);
      });
    }
  }

  function presentationMode(mode){
    const panel=$("#docPresentationSections");
    if(!panel)return;
    panel.classList.remove("svd-show-cover","svd-show-header");
    if(mode==="cover")panel.classList.add("svd-show-cover");
    if(mode==="header")panel.classList.add("svd-show-header");
    panel.querySelectorAll(".doc-presentation-card").forEach(card=>{
      const own=card.dataset.presentation;
      const open=own===mode;
      card.classList.toggle("open",open);
      card.querySelector(":scope > button")?.setAttribute("aria-expanded",open?"true":"false");
    });
  }

  function activate(section,persist=false){
    if(!sectionDefs.some(item=>item.id===section))section="information";
    activeSection=section;
    if(persist){try{localStorage.setItem(activeKey,section);}catch(_){}}
    const root=shell();
    if(!root)return;

    document.documentElement.dataset.docTitSection=section;
    $$("[data-svd-section]",root).forEach(btn=>{
      const selected=btn.dataset.svdSection===section;
      btn.classList.toggle("active",selected);
      btn.setAttribute("aria-current",selected?"page":"false");
    });

    presentationMode(section==="cover"||section==="header"?section:"");
    refreshStatus();
    refreshDocumentCards();
    document.dispatchEvent(new CustomEvent("doc-tit:section-changed",{detail:{documentId,section,definition:currentSection()}}));
  }

  function hasValue(input){
    if(input.type==="checkbox")return input.checked;
    if(input.type==="file")return !!input.files?.length||!!$("img",input.closest("label")||document);
    return String(input.value??"").trim()!=="";
  }

  function coreSectionComplete(requirement){
    try{
      const diag=window.DOC_TIT_CORE?.diagnostics?.();
      if(!diag?.sections)return null;
      const matcher=requirement==="schedule"?/cronograma|fechas del proceso/i:
        requirement==="distribution"?/distribuci[oó]n|carreras.*lugar|carreras.*cantidad/i:
        requirement==="resources"?/logo institucional/i:null;
      if(!matcher)return null;
      const found=diag.sections.find(item=>matcher.test(String(item?.title||"")));
      return found?!!found.complete:null;
    }catch(_){return null;}
  }

  function fallbackScheduleComplete(){
    const panel=$("#scheduleBody")?.closest("section.panel");
    if(!panel)return false;
    const rows=$$("tbody tr",panel);
    if(!rows.length)return false;
    if(documentId==="trabajo-titulacion"){
      const activeRows=rows.filter(row=>{
        const check=$('input[type="checkbox"][data-f="active"]',row);
        return !check||check.checked;
      });
      if(!activeRows.length)return false;
      const valid=activeRows.every(row=>{
        const start=$('[data-f="start"]',row)?.value||"";
        const end=$('[data-f="end"]',row)?.value||"";
        const deadline=$('[data-f="deadline"]',row)?.value||"";
        if(!start&&!end&&!deadline)return false;
        if(start&&end&&end<start)return false;
        return true;
      });
      const approval=$("#scheduleApprovalState",panel)?.textContent?.replace(/^Estado:\s*/i,"").trim()||"";
      return valid&&(!approval||/^Aprobado$/i.test(approval));
    }
    return rows.every(row=>{
      const dates=$$('input[type="date"]',row);
      if(dates.length<2)return false;
      const start=dates[0]?.value||"",end=dates[1]?.value||"";
      return !!start&&!!end&&end>=start;
    });
  }

  function fallbackDistributionComplete(){
    const panel=$("#distributionBody")?.closest("section.panel");
    if(!panel)return false;
    const rows=$$("tbody tr",panel).filter(row=>{
      const fields=$$("input,select,textarea",row).filter(el=>el.type!=="button");
      return fields.some(hasValue);
    });
    if(!rows.length)return false;
    return rows.every(row=>{
      const career=$(".dist-career",row)?.value?.trim();
      const place=$(".dist-place",row)?.value?.trim();
      const count=$(".dist-count",row)?.value;
      return !!career&&!!place&&count!==""&&Number(count)>=0;
    });
  }

  function requirementComplete(requirement){
    if(requirement==="schedule"){
      const core=coreSectionComplete("schedule");
      return core===null?fallbackScheduleComplete():core;
    }
    if(requirement==="distribution"){
      const core=coreSectionComplete("distribution");
      return core===null?fallbackDistributionComplete():core;
    }
    return true;
  }

  function sectionComplete(item){
    if(item.id==="information")return true;
    if(item.id==="resources"){
      const core=coreSectionComplete("resources");
      return core===null?!!$("#logoPreview img"):core;
    }
    if(item.id==="cover"||item.id==="header"){
      const resources=sectionDefs.find(x=>x.id==="resources");
      const resourceReady=resources?sectionComplete(resources):true;
      const period=currentPeriodId();
      const code=$("#docCode")?.textContent?.trim()||$("#docCodeBadge")?.textContent?.trim()||"";
      return resourceReady&&!!documentTitle()&&!!period&&!!code;
    }
    const requirements=Array.isArray(item.requires)?item.requires:[];
    return requirements.every(requirementComplete);
  }

  function refreshStatus(){
    const root=$("#svdShell");
    if(!root)return;
    sectionDefs.forEach(item=>{
      const btn=$(`[data-svd-section="${item.id}"]`,root);
      const dot=$(".svd-tab-dot",btn);
      if(!dot)return;
      const complete=sectionComplete(item);
      dot.classList.toggle("complete",complete);
      dot.classList.toggle("pending",!complete&&item.id!=="information");
      dot.hidden=item.id==="information";
    });
  }

  function refreshDocumentCards(){
    const root=$("#svdShell");
    const periodId=currentPeriodId();
    if(!root||!periodId)return;
    $$(".doc-tit-nav-link",root).forEach(link=>{
      const docId=link.dataset.documentId||"";
      const finalized=isFinalized(docId,periodId);
      link.classList.toggle("finalized",finalized);
      link.dataset.svdStateLabel=finalized?"Finalizado":docId===documentId?"Seleccionado":"Disponible";
    });
  }

  function watchGenerationStatus(){
    if(generationWatchBound)return;
    generationWatchBound=true;
    const bind=status=>{
      if(!status)return;
      const check=()=>{
        const text=String(status.textContent||"").trim();
        if(/PDF generado/i.test(text)){
          writeFinalized(true);
          refreshDocumentCards();
        }
      };
      new MutationObserver(check).observe(status,{childList:true,subtree:true,characterData:true});
      check();
    };
    bind($("#status"));
    bind($("#generationStatus"));
  }

  function syncHeader(){
    const root=shell();
    if(!root)return;
    const periodBox=$(".svd-period-slot .period-box",root);
    if(periodBox){
      const label=$("label",periodBox);
      if(label&&label.textContent!=="Período activo")label.textContent="Período activo";
    }
    bindDocumentLinks();
    syncGlobalPeriod();
  }

  function refresh(){
    refreshTimer=null;
    if(!shell())return;
    syncHeader();
    activate(activeSection,false);
    watchGenerationStatus();
  }
  function scheduleRefresh(){
    if(refreshTimer)return;
    refreshTimer=setTimeout(refresh,80);
  }

  function init(){
    ensureStyles();
    let tries=0;
    const boot=()=>{
      tries++;
      if(shell()){
        refresh();
        return;
      }
      if(tries<30)setTimeout(boot,100);
    };
    boot();

    document.addEventListener("input",event=>{markCurrentStale(event.target);scheduleRefresh();},true);
    document.addEventListener("change",event=>{markCurrentStale(event.target);scheduleRefresh();},true);
    document.addEventListener("click",event=>{
      if(event.target?.closest("#ptapply,#applyImportBtn,#approveScheduleBtn,#addScheduleBtn,[data-add],[data-del],[data-move],.row-remove"))markCurrentStale(event.target);
      if(event.target?.closest(".doc-presentation-card,#newPeriodBtn,#ptapply,#applyImportBtn,#approveScheduleBtn,#addScheduleBtn,[data-add],[data-del],[data-move],.row-remove"))setTimeout(scheduleRefresh,100);
    },true);
    new MutationObserver(scheduleRefresh).observe(document.body,{childList:true,subtree:true});
    window.addEventListener("doc-tit:data-changed",scheduleRefresh);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
