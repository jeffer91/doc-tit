(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!documentId)return;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const main=()=>$("main.main");
  const activeKey=`doc-tit-svd-section-${documentId}`;
  const sectionDefs=documentId==="complexivo"?
    [
      ["information","Información"],
      ["schedule","Cronograma"],
      ["distribution","Distribución"],
      ["resources","Recursos"],
      ["cover","Portada"],
      ["header","Cabecera"]
    ]:
    [
      ["information","Información"],
      ["schedule","Cronograma"],
      ["resources","Recursos"],
      ["cover","Portada"],
      ["header","Cabecera"]
    ];

  let activeSection=sectionDefs.some(([id])=>id===localStorage.getItem(activeKey))?localStorage.getItem(activeKey):"information";
  let refreshTimer=null;

  function ensureStyles(){
    if(document.querySelector('link[data-doc-tit-svd-shell]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.dataset.docTitSvdShell="1";
    const path=String(window.location.pathname||"");
    const marker="/doc-tit/";
    const idx=path.indexOf(marker);
    const base=idx>=0?path.slice(0,idx)+marker:"/doc-tit/";
    link.href=base+"shared/svd-shell.css?v=20260911-1";
    document.head.appendChild(link);
  }

  function documentTitle(){
    return $("#docTitle")?.textContent?.trim()||$("#screenTitle")?.textContent?.trim()||"Documento";
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
    sectionDefs.forEach(([id,label])=>{
      const button=document.createElement("button");
      button.type="button";
      button.dataset.svdSection=id;
      button.innerHTML=`<span>${label}</span><i class="svd-tab-dot" aria-hidden="true"></i>`;
      button.addEventListener("click",()=>activate(id,true));
      tabs?.appendChild(button);
    });
    document.documentElement.classList.add("svd2");
    return root;
  }

  function panelByText(regex){
    return $$("section.panel").find(panel=>regex.test(String($("h3",panel)?.textContent||$(".eyebrow",panel)?.textContent||"")))||null;
  }

  function targets(){
    const presentation=$("#docPresentationSections");
    const schedule=$("#scheduleBody")?.closest("section.panel")||$("input[data-f='activity']")?.closest("section.panel")||panelByText(/cronograma|fechas del proceso/i);
    const distribution=$("#distributionBody")?.closest("section.panel")||panelByText(/distribuci[oó]n|carreras, lugar/i);
    const logo=$("#logoUpload")?.closest("section.panel")||null;
    const workspace=$(".doc-standard-workspace")||$("#requirementsList")?.closest("section.panel")||null;
    const side=$(".doc-standard-side")||$("#documentView .side-column")||null;
    const form=$("#documentForm");
    return {presentation,schedule,distribution,logo,workspace,side,form};
  }

  function hide(el,value){
    if(!el)return;
    el.classList.toggle("svd-section-hidden",!!value);
  }

  function closeEditors(except=null){
    $$(".doc-standard-editor").forEach(panel=>{
      if(panel===except)return;
      panel.classList.remove("is-open","svd-force-visible");
    });
  }

  function presentationMode(panel,mode){
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

  function applyWorkArticle(section,t){
    const presentationOnly=section==="cover"||section==="header";
    hide(t.workspace,section!=="information");
    hide(t.side,section!=="information");
    hide(t.presentation,!presentationOnly);

    if(section==="information"){
      closeEditors();
      presentationMode(t.presentation,"");
      return;
    }
    if(section==="schedule"){
      closeEditors(t.schedule);
      if(t.schedule){t.schedule.classList.add("is-open","svd-force-visible");hide(t.schedule,false);}
      presentationMode(t.presentation,"");
      return;
    }
    if(section==="resources"){
      closeEditors(t.logo);
      if(t.logo){t.logo.classList.add("is-open","svd-force-visible");hide(t.logo,false);}
      presentationMode(t.presentation,"");
      return;
    }
    closeEditors();
    presentationMode(t.presentation,section);
  }

  function applyComplexivo(section,t){
    const info=t.workspace;
    const sections=t.form?$$(':scope > section.panel',t.form):[];
    sections.forEach(panel=>hide(panel,true));
    hide(info,section!=="information");
    hide(t.side,section!=="information");
    hide(t.presentation,!(section==="cover"||section==="header"));

    if(section==="schedule")hide(t.schedule,false);
    if(section==="distribution")hide(t.distribution,false);
    if(section==="resources")hide(t.logo,false);
    if(section==="cover"||section==="header")presentationMode(t.presentation,section);
    else presentationMode(t.presentation,"");
  }

  function activate(section,persist=false){
    if(!sectionDefs.some(([id])=>id===section))section="information";
    activeSection=section;
    if(persist){try{localStorage.setItem(activeKey,section);}catch(_){}}
    const root=shell();
    if(!root)return;
    $$("[data-svd-section]",root).forEach(btn=>{
      const selected=btn.dataset.svdSection===section;
      btn.classList.toggle("active",selected);
      btn.setAttribute("aria-current",selected?"page":"false");
    });
    const t=targets();
    if(documentId==="complexivo")applyComplexivo(section,t);else applyWorkArticle(section,t);
    refreshStatus();
  }

  function hasValue(input){
    if(input.type==="checkbox")return input.checked;
    if(input.type==="file")return !!input.files?.length||!!$("img",input.closest("label")||document);
    return String(input.value??"").trim()!=="";
  }

  function sectionComplete(section,t){
    if(section==="information")return true;
    if(section==="resources")return !!$("#logoPreview img");
    if(section==="cover"||section==="header")return !!$("#logoPreview img")&&!!documentTitle();
    const panel=section==="schedule"?t.schedule:t.distribution;
    if(!panel)return false;
    if(section==="schedule"){
      const rows=$$("tbody tr",panel).filter(row=>row.offsetParent!==null||!row.hidden);
      if(!rows.length)return false;
      return rows.every(row=>{
        const active=$('input[type="checkbox"][data-f="active"]',row);
        if(active&&!active.checked)return true;
        const dates=$$('input[type="date"]',row);
        return dates.length>0&&dates.some(input=>!!input.value);
      });
    }
    const rows=$$("tbody tr",panel);
    return rows.length>0&&rows.every(row=>{
      const fields=$$("input,select,textarea",row).filter(el=>el.type!=="button");
      return fields.length>0&&fields.every(hasValue);
    });
  }

  function refreshStatus(){
    const root=$("#svdShell");
    if(!root)return;
    const t=targets();
    sectionDefs.forEach(([id])=>{
      const btn=$(`[data-svd-section="${id}"]`,root);
      const dot=$(".svd-tab-dot",btn);
      if(!dot)return;
      const complete=sectionComplete(id,t);
      dot.classList.toggle("complete",complete);
      dot.classList.toggle("pending",!complete&&id!=="information");
      dot.hidden=id==="information";
    });
  }

  function syncHeader(){
    const root=shell();
    if(!root)return;
    const periodBox=$(".svd-period-slot .period-box",root);
    if(periodBox){
      const label=$("label",periodBox);
      if(label&&label.textContent!=="Período activo")label.textContent="Período activo";
    }
  }

  function refresh(){
    refreshTimer=null;
    if(!shell())return;
    syncHeader();
    activate(activeSection,false);
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

    document.addEventListener("input",scheduleRefresh,true);
    document.addEventListener("change",scheduleRefresh,true);
    document.addEventListener("click",event=>{
      if(event.target?.closest(".doc-standard-card-actions, .doc-presentation-card, #newPeriodBtn"))setTimeout(scheduleRefresh,100);
    },true);
    const observer=new MutationObserver(scheduleRefresh);
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("doc-tit:data-changed",scheduleRefresh);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
