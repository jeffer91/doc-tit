(() => {
  "use strict";

  const VERSION="1.2.0";
  const MONTHS=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
  const norm=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();

  const nav=$("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"complexivo";
  let previousPeriodId=$("#periodSelect")?.value||"";
  let dirty=false;
  let switchBypass=false;
  let statusUnlocked=false;
  let currentStatus="Activo";

  function periodName(){
    const s=$("#periodSelect");
    return s?.selectedOptions?.[0]?.textContent?.trim()||$("#periodText")?.textContent?.trim()||$("#periodName")?.textContent?.trim()||"—";
  }
  function docTitle(){return $("#docTitle")?.textContent?.trim()||$("#screenTitle")?.textContent?.trim()||document.title||"Documento";}
  function docCode(){return $("#docCode")?.textContent?.trim()||$("#docCodeBadge")?.textContent?.trim()||"—";}

  function toast(message,mode="info"){
    let el=$("#docCoreToast");
    if(!el){el=document.createElement("div");el.id="docCoreToast";document.body.appendChild(el);}
    el.className=`doc-core-toast ${mode}`;el.textContent=message;el.hidden=false;
    clearTimeout(el._timer);el._timer=setTimeout(()=>{el.hidden=true;},4200);
  }

  function ensureDialogs(){
    if(!$("#docCoreConfirm")){
      const d=document.createElement("dialog");d.id="docCoreConfirm";d.className="doc-core-dialog";
      d.innerHTML='<div class="doc-core-dialog-head"><div><span class="eyebrow">Cambios pendientes</span><h3>Cambiar de período</h3></div></div><p>Tienes cambios desde la última acción de guardado. Elige cómo continuar.</p><div class="doc-core-dialog-actions"><button type="button" class="secondary" data-core-choice="cancel">Cancelar</button><button type="button" class="secondary" data-core-choice="discard">Descartar y cambiar</button><button type="button" class="primary" data-core-choice="save">Guardar y cambiar</button></div>';
      document.body.appendChild(d);
    }
    if(!$("#docCoreReview")){
      const d=document.createElement("dialog");d.id="docCoreReview";d.className="doc-core-dialog doc-core-review-dialog";
      d.innerHTML=`<div class="doc-core-dialog-head"><div><span class="eyebrow">Core documental v${VERSION}</span><h3>Diagnóstico y revisión por sección</h3></div><button type="button" class="doc-core-close" aria-label="Cerrar">×</button></div><div id="docCoreReviewBody"></div>`;
      $(".doc-core-close",d).onclick=()=>d.close();document.body.appendChild(d);
    }
    if(!$("#docCorePreview")){
      const d=document.createElement("dialog");d.id="docCorePreview";d.className="doc-core-dialog doc-core-preview-dialog";
      d.innerHTML='<div class="doc-core-dialog-head"><div><span class="eyebrow">Vista previa de datos</span><h3 id="docCorePreviewTitle">Sección</h3></div><button type="button" class="doc-core-close" aria-label="Cerrar">×</button></div><div id="docCorePreviewBody" class="doc-core-preview-body"></div>';
      $(".doc-core-close",d).onclick=()=>d.close();document.body.appendChild(d);
    }
  }

  function installChrome(){
    ensureDialogs();
    if(!$("#docCoreReviewBtn")){
      const b=document.createElement("button");b.id="docCoreReviewBtn";b.type="button";b.className="secondary doc-core-review-btn";b.textContent="Diagnóstico";b.onclick=openDiagnostics;
      const toolbar=$(".toolbar");
      if(toolbar)toolbar.appendChild(b);
      else if($(".topbar")){const w=document.createElement("div");w.className="doc-core-top-actions";w.appendChild(b);$(".topbar").appendChild(w);}
      else $("header.top")?.appendChild(b);
    }
    if(!$("#docCoreVersion")){
      const f=$(".sidebar-footer")||$(".sidebar");
      if(f){const s=document.createElement("small");s.id="docCoreVersion";s.className="doc-core-version";s.textContent=`Core documental v${VERSION}`;f.appendChild(s);}
    }
  }

  function builderPeriod(){
    const sm=+$("#startMonth")?.value,em=+$("#endMonth")?.value;
    const syEl=$("#startYear"),eyEl=$("#endYear");
    const sy=+(syEl?.value||syEl?.dataset?.value||syEl?.textContent),ey=+(eyEl?.value||eyEl?.dataset?.value||eyEl?.textContent);
    if(!sm||!em||!sy||!ey)return null;
    const a=`${sy}-${String(sm).padStart(2,"0")}`,b=`${ey}-${String(em).padStart(2,"0")}`;
    return{id:`${a}_${b}`,name:`${MONTHS[sm-1]} ${sy} – ${MONTHS[em-1]} ${ey}`,a,b};
  }

  function guardPeriodCreation(){
    const form=$("#periodForm");if(!form||form.dataset.corePeriodGuard)return;form.dataset.corePeriodGuard="1";
    form.addEventListener("submit",e=>{
      const p=builderPeriod();if(!p)return;
      if(p.b<p.a){e.preventDefault();e.stopImmediatePropagation();toast("La fecha final no puede ser anterior a la inicial.","error");return;}
      const exists=$$("#periodSelect option").some(o=>o.value===p.id);
      if(!exists)return;
      e.preventDefault();e.stopImmediatePropagation();$("#periodDialog")?.close();
      requestSwitch(p.id,`El período ${p.name} ya existe. Se seleccionará el existente.`);
    },true);
  }

  function workspaceTarget(t){
    return t instanceof Element&&!t.closest("#periodDialog,#docCoreConfirm,#docCoreReview,#docCorePreview,#ptmodal,#periodSelect,#newPeriodBtn")&&!!t.closest("main");
  }
  function saveButton(){return $("#saveBtn")||$("#saveDraftBtn")||$("#saveBtnBottom");}
  function mutatingButton(t){
    return t instanceof Element&&!!t.closest("#approveScheduleBtn,#addScheduleBtn,[data-add],[data-del],[data-move],.row-remove,#ptapply,#addDistributionRowBtn");
  }

  function trackDirty(){
    document.addEventListener("input",e=>{if(workspaceTarget(e.target))dirty=true;},true);
    document.addEventListener("change",e=>{
      if(e.target?.id!=="periodSelect"&&workspaceTarget(e.target))dirty=true;
      if(e.target?.id==="importInput"&&e.target.files?.[0]){
        try{localStorage.setItem(`doc-tit-import-source::${documentId}`,JSON.stringify({name:e.target.files[0].name,at:new Date().toISOString(),periodId:$("#periodSelect")?.value||""}));}catch(_){}
      }
    },true);
    document.addEventListener("click",e=>{if(mutatingButton(e.target))dirty=true;},true);
    document.addEventListener("doc-tit:template-applied",()=>{dirty=true;},true);
    ["#saveBtn","#saveBtnBottom","#saveDraftBtn"].forEach(s=>$(s)?.addEventListener("click",()=>{setTimeout(()=>{dirty=false;},0);}));
    window.addEventListener("beforeunload",e=>{if(!dirty)return;e.preventDefault();e.returnValue="";});
  }

  function commitSwitch(id,message){
    const s=$("#periodSelect");if(!s)return;
    switchBypass=true;s.value=id;previousPeriodId=id;
    s.dispatchEvent(new Event("change",{bubbles:true}));
    setTimeout(()=>{switchBypass=false;refreshStatus();},0);
    if(message)toast(message);
  }
  function requestSwitch(id,message){
    const s=$("#periodSelect");if(!s||!id||id===previousPeriodId)return;
    if(!dirty||switchBypass){commitSwitch(id,message);return;}
    ensureDialogs();const d=$("#docCoreConfirm");d.showModal();
    $$("[data-core-choice]",d).forEach(b=>b.onclick=()=>{
      const choice=b.dataset.coreChoice;d.close();
      if(choice==="cancel"){switchBypass=true;s.value=previousPeriodId;setTimeout(()=>switchBypass=false,0);return;}
      if(choice==="save")saveButton()?.click();
      dirty=false;commitSwitch(id,message);
    });
  }
  function guardPeriodSwitch(){
    const s=$("#periodSelect");if(!s||s.dataset.coreSwitchGuard)return;s.dataset.coreSwitchGuard="1";previousPeriodId=s.value;
    ["focus","mousedown","keydown"].forEach(ev=>s.addEventListener(ev,()=>{previousPeriodId=s.value;},true));
    s.addEventListener("change",e=>{
      if(switchBypass){previousPeriodId=s.value;return;}
      const next=s.value;if(next===previousPeriodId)return;
      e.preventDefault();e.stopImmediatePropagation();s.value=previousPeriodId;requestSwitch(next);
    },true);
  }

  async function periodRows(){
    try{
      if(window.DocTitCloud?.loadPeriods)return await window.DocTitCloud.loadPeriods();
      if(window.DocTitCloud?.loadWorkspace)return (await window.DocTitCloud.loadWorkspace()).periods||[];
    }catch(_){}
    return[];
  }
  async function refreshStatus(){
    const id=$("#periodSelect")?.value;if(!id)return;
    const rows=await periodRows(),row=rows.find(r=>(r.period_key||r.id)===id);
    currentStatus=row?.status||$("#periodStatus")?.textContent?.trim()||"Activo";statusUnlocked=false;
    let b=$("#corePeriodStatus");
    if(!b&&$(".period-box")){b=document.createElement("span");b.id="corePeriodStatus";b.className="doc-core-period-status";$(".period-box").appendChild(b);}
    if(b){b.textContent=currentStatus;b.dataset.status=norm(currentStatus);}
  }

  function editControl(t){return t instanceof Element&&!!t.closest('input:not([type=button]):not([type=submit]),textarea,select,button[data-add],button[data-del],button[data-move],.row-remove,#logoUpload,#approveScheduleBtn,#addScheduleBtn,#ptapply');}
  function saveAction(t){return t instanceof Element&&!!t.closest("#saveBtn,#saveBtnBottom,#saveDraftBtn");}
  function guardPeriodState(){
    const guard=e=>{
      if(!workspaceTarget(e.target))return;
      const st=norm(currentStatus);if(st==="activo"||statusUnlocked)return;
      if(st==="archivado"&&(editControl(e.target)||saveAction(e.target))){
        e.preventDefault();e.stopImmediatePropagation();toast("Este período está archivado y es de solo consulta. La generación de PDF sigue disponible.","error");return;
      }
      if(st==="cerrado"&&editControl(e.target)){
        const ok=confirm("Este período está cerrado. ¿Deseas habilitar edición para esta sesión?");
        if(!ok){e.preventDefault();e.stopImmediatePropagation();return;}
        statusUnlocked=true;toast("Edición temporal habilitada para el período cerrado.");
      }
    };
    ["beforeinput","change","click"].forEach(ev=>document.addEventListener(ev,guard,true));
  }

  function panels(){
    let out=documentId==="complexivo"?$$("#documentForm > section.panel"):$$("#dynamicSections > section.panel");
    out=out.filter(p=>!p.hidden&&p.getAttribute("aria-hidden")!=="true");
    const logo=$("#logoUpload")?.closest("section.panel");if(logo&&!out.includes(logo))out.push(logo);
    return out;
  }
  function panelTitle(p,i){return $("h3",p)?.textContent?.trim()||$(".eyebrow",p)?.textContent?.trim()||`Sección ${i+1}`;}
  function logoReady(p){
    const x=$("#logoPreview",p)||$("#logoPreview");
    return!!x?.querySelector("img")||!!(x&&!/sin imagen/i.test(x.textContent||"")&&x.textContent.trim());
  }

  function scheduleState(panel,title){
    const rows=$$("#scheduleBody tr",panel);
    const activeRows=rows.filter(tr=>{const c=$('input[type="checkbox"][data-f="active"]',tr);return !c||c.checked;});
    if(!activeRows.length)return{title,required:true,complete:false,state:"Pendiente",detail:"No hay actividades activas"};
    let valid=0,invalid=0;
    activeRows.forEach(tr=>{
      const start=$('[data-f="start"],.schedule-start',tr)?.value||"";
      const end=$('[data-f="end"],.schedule-end',tr)?.value||"";
      const deadline=$('[data-f="deadline"]',tr)?.value||"";
      let ok;
      if(documentId==="trabajo-titulacion")ok=!!(start||end||deadline);
      else ok=!!start&&!!end;
      if(start&&end&&end<start)ok=false;
      if(ok)valid++;else invalid++;
    });
    const approval=$("#scheduleApprovalState",panel)?.textContent?.replace(/^Estado:\s*/i,"").trim()||"";
    if(documentId==="trabajo-titulacion"&&approval&&!/^Aprobado$/i.test(approval))invalid++;
    const complete=invalid===0;
    return{title,required:true,complete,state:complete?"OK":"Pendiente",detail:`${valid} de ${activeRows.length} actividades válidas${approval?` · ${approval}`:""}`};
  }

  function complexDistributionState(panel,title){
    const rows=$$("#distributionBody tr",panel).filter(tr=>{
      return [$(".dist-career",tr)?.value,$(".dist-place",tr)?.value,$(".dist-count",tr)?.value].some(v=>String(v??"").trim()!=="");
    });
    const valid=rows.filter(tr=>{
      const career=$(".dist-career",tr)?.value?.trim(),place=$(".dist-place",tr)?.value?.trim(),count=$(".dist-count",tr)?.value;
      return!!career&&!!place&&count!==""&&Number(count)>=0;
    }).length;
    const complete=rows.length>0&&valid===rows.length;
    return{title,required:true,complete,state:complete?"OK":"Pendiente",detail:`${valid} de ${rows.length} filas completas`};
  }

  function panelState(panel,index){
    const title=panelTitle(panel,index);
    const hint=`${$(".eyebrow",panel)?.textContent||""} ${$(".help",panel)?.textContent||""} ${$(".section-help",panel)?.textContent||""}`;
    const optional=/opcional|complementaria/i.test(hint);
    if($("#logoUpload",panel)){const ok=logoReady(panel);return{title,required:true,complete:ok,state:ok?"OK":"Pendiente",detail:ok?"Logo institucional disponible":"Falta el logo institucional"};}
    if($("#scheduleBody",panel))return scheduleState(panel,title);
    if(documentId==="complexivo"&&$("#distributionBody",panel))return complexDistributionState(panel,title);

    const inputs=$$("input,select,textarea",panel).filter(x=>!["button","submit","file","hidden"].includes(x.type)&&!x.disabled);
    const requiredInputs=inputs.filter(x=>x.required||x.dataset.required==="1");
    const touched=inputs.filter(x=>x.type==="checkbox"?x.checked:String(x.value??"").trim()).length;
    const requiredOk=requiredInputs.every(x=>x.type==="checkbox"?x.checked:String(x.value??"").trim()!=="");
    const complete=optional||(requiredInputs.length?requiredOk:touched>0||inputs.length===0);
    return{title,required:!optional,complete,state:optional?(touched?"Con datos":"Opcional"):(complete?"OK":"Pendiente"),detail:inputs.length?`${touched} de ${inputs.length} campos con información`:"Contenido automático"};
  }

  function sourceMeta(){
    try{const m=JSON.parse(localStorage.getItem(`doc-tit-import-source::${documentId}`)||"null");return m&&m.periodId===$("#periodSelect")?.value?m:null;}catch(_){return null;}
  }
  function diagnostics(){
    const sections=panels().map(panelState),required=sections.filter(x=>x.required),pending=required.filter(x=>!x.complete);
    return{coreVersion:VERSION,documentId,documentTitle:docTitle(),documentCode:docCode(),periodId:$("#periodSelect")?.value||"—",periodName:periodName(),periodStatus:currentStatus,sections,requiredCount:required.length,pendingCount:pending.length,ready:pending.length===0,source:sourceMeta(),cloudOnline:window.DocTitCloud?.isOnline?.()};
  }

  function renderDiagnostics(){
    const info=diagnostics(),host=$("#docCoreReviewBody");if(!host)return;
    const src=info.source?`${esc(info.source.name)} · ${new Date(info.source.at).toLocaleString("es-EC")}`:"Carga manual / datos guardados del período";
    const cloud=info.cloudOnline===false?"Sin conexión · usando caché local":"Conectado / no aplica";
    host.innerHTML=`<div class="doc-core-summary ${info.ready?"ready":"pending"}"><div><strong>${info.ready?"Documento listo para revisión final":"Hay información pendiente"}</strong><span>${info.pendingCount} pendiente(s) de ${info.requiredCount} secciones obligatorias</span></div><span class="doc-core-state">${info.ready?"OK":"REVISAR"}</span></div><div class="doc-core-meta-grid"><div><span>Período</span><strong>${esc(info.periodName)}</strong><small>${esc(info.periodId)} · ${esc(info.periodStatus)}</small></div><div><span>Documento</span><strong>${esc(info.documentTitle)}</strong><small>${esc(info.documentCode)}</small></div><div><span>Origen de datos</span><strong>${src}</strong><small>${esc(cloud)}</small></div><div><span>Core</span><strong>v${VERSION}</strong><small>Validación · períodos · revisión por sección</small></div></div><div class="doc-core-section-list" id="docCoreSectionList"></div>`;
    const list=$("#docCoreSectionList",host);
    panels().forEach((p,i)=>{
      const s=panelState(p,i),a=document.createElement("article");a.className="doc-core-section-item";
      a.innerHTML=`<div><div class="doc-core-section-title"><strong>${esc(s.title)}</strong><span class="doc-core-chip ${s.complete?"ok":s.required?"pending":"optional"}">${esc(s.state)}</span><span class="doc-core-chip ${s.required?"required":"optional"}">${s.required?"Obligatoria":"Complementaria"}</span></div><small>${esc(s.detail)}</small></div><div class="doc-core-section-actions"><button type="button" class="secondary" data-preview>Vista previa</button><button type="button" class="secondary" data-pdf>PDF de datos</button></div>`;
      $("[data-preview]",a).onclick=()=>preview(p,i);$("[data-pdf]",a).onclick=()=>sectionPdf(p,i);list.appendChild(a);
    });
  }
  function openDiagnostics(){ensureDialogs();renderDiagnostics();$("#docCoreReview").showModal();}

  function value(el){
    if(el.tagName==="SELECT")return el.selectedOptions?.[0]?.textContent?.trim()||el.value||"—";
    if(el.type==="checkbox")return el.checked?"Sí":"No";
    if(el.type==="date"&&el.value){const d=new Date(el.value+"T12:00:00");if(!Number.isNaN(d.getTime()))return new Intl.DateTimeFormat("es-EC").format(d);}
    return String(el.value||"—");
  }
  function clonePanel(panel){
    const clone=panel.cloneNode(true),orig=$$("input,select,textarea",panel),clones=$$("input,select,textarea",clone);
    clones.forEach((el,i)=>{const s=document.createElement("span");s.className="doc-core-value";s.textContent=value(orig[i]||el);el.replaceWith(s);});
    $$("button,.doc-standard-editor-close",clone).forEach(x=>x.remove());
    clone.removeAttribute("hidden");clone.setAttribute("aria-hidden","false");clone.classList.remove("is-open","doc-standard-editor","ptclosed");
    return clone;
  }
  function preview(panel,i){
    ensureDialogs();$("#docCorePreviewTitle").textContent=panelTitle(panel,i);const body=$("#docCorePreviewBody");body.innerHTML="";body.appendChild(clonePanel(panel));$("#docCorePreview").showModal();
  }

  function textBlocks(panel){
    const out=[],help=$(".help",panel)?.textContent?.trim()||$(".section-help",panel)?.textContent?.trim();if(help)out.push(help);
    $$("label",panel).forEach(label=>{const c=$("input,select,textarea",label);if(!c||["file","button","submit"].includes(c.type))return;const name=Array.from(label.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent.trim()).filter(Boolean).join(" ")||c.name||c.id;if(name)out.push(`${name}: ${value(c)}`);});
    return out;
  }
  function sectionPdf(panel,i){
    if(!window.jspdf?.jsPDF){toast("No se pudo cargar el motor PDF.","error");return;}
    const{jsPDF}=window.jspdf,doc=new jsPDF({unit:"pt",format:"a4"}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),m=48;let y=52;const title=panelTitle(panel,i);
    const footer=()=>{doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text(`DOC-TIT · Vista de datos · Core v${VERSION}`,m,H-24);doc.text(`Página ${doc.getNumberOfPages()}`,W-m,H-24,{align:"right"});};
    const newPage=()=>{footer();doc.addPage();y=52;},ensure=h=>{if(y+h>H-48)newPage();},paragraph=t=>{if(!t)return;doc.setFont("helvetica","normal");doc.setFontSize(10);const lines=doc.splitTextToSize(String(t),W-m*2);ensure(lines.length*14+10);doc.text(lines,m,y);y+=lines.length*14+10;};
    doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text(docTitle(),m,y);y+=20;doc.setFontSize(11);doc.text(title,m,y);y+=18;doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text(`${periodName()} · ${docCode()}`,m,y);y+=22;textBlocks(panel).forEach(paragraph);
    $$("table",panel).forEach(t=>{
      const head=$$("thead th",t).map(x=>x.textContent.trim()).filter(Boolean);
      const body=$$("tbody tr",t).map(r=>$$("td",r).map(td=>{const c=$("input,select,textarea",td);return c?value(c):td.textContent.trim();}).slice(0,head.length||undefined));
      if(!head.length&&!body.length)return;
      if(typeof doc.autoTable==="function"){doc.autoTable({startY:y,head:head.length?[head]:undefined,body,margin:{left:m,right:m},styles:{fontSize:8,cellPadding:4},headStyles:{fontStyle:"bold"}});y=doc.lastAutoTable.finalY+16;}
      else{paragraph(head.join(" | "));body.forEach(r=>paragraph(r.join(" | ")));}
    });
    footer();const safe=`${documentId}-${title}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-|-$/g,"").toLowerCase();doc.save(`${safe||"seccion"}-datos.pdf`);
  }

  function updateCloudUi(online){
    const isOffline=online===false;
    const card=$("#cloudCard")||$("#cloudStatusCard");
    const text=$("#cloudText")||$("#cloudStatusText");
    const detail=$("#cloudStatusDetail");
    if(card){card.classList.toggle("error",isOffline);card.classList.toggle("ok",!isOffline);}
    if(text&&isOffline)text.textContent="Base de datos · sin conexión";
    if(detail&&isOffline)detail.textContent="Caché local activa · cambios pendientes se sincronizarán al reconectar";
  }
  function installCloudStatus(){
    window.addEventListener("doc-tit:cloud-status",e=>updateCloudUi(e.detail?.online));
    setTimeout(()=>{if(window.DocTitCloud?.isOnline)updateCloudUi(window.DocTitCloud.isOnline());},600);
  }

  function init(){
    installChrome();guardPeriodCreation();trackDirty();guardPeriodSwitch();guardPeriodState();installCloudStatus();refreshStatus();
    const s=$("#periodSelect");if(s)new MutationObserver(()=>{refreshStatus();}).observe(s,{childList:true,subtree:true});
  }

  window.DOC_TIT_CORE=Object.freeze({
    version:VERSION,documentId,periodId:()=>$("#periodSelect")?.value||"",periodName,diagnostics,
    markDirty:()=>{dirty=true;},markSaved:()=>{dirty=false;}
  });

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,120),{once:true});else setTimeout(init,120);
})();