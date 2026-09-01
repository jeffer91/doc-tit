(() => {
  const STORAGE_KEY = "doc-tit-v1";

  const catalog = {
    "PRO-56": {
      name: "Planificación semestral del proceso de titulación",
      description: "Planificaciones que abren y organizan el proceso del período.",
      documents: [{
        id: "plan-examen-complexivo",
        name: "Planificación de Examen Complexivo",
        prefix: "UTET-RGI1-",
        sequence: "01",
        process: "PRO-56",
        version: "1.0",
        description: "Planificación integral del examen complexivo por período académico. Reutiliza la estructura institucional y solicita únicamente los datos variables del período.",
        requirements: [
          {id:"period", label:"Período académico", source:"Automático del período", automatic:true},
          {id:"date", label:"Fecha de elaboración", source:"Debes confirmarla", automatic:false},
          {id:"code", label:"Código documental", source:"Generado automáticamente", automatic:true},
          {id:"version", label:"Versión", source:"Predeterminado 1.0, editable", automatic:false},
          {id:"responsibles", label:"Responsables", source:"Configuración institucional, salvo cambios", automatic:true},
          {id:"logistics", label:"Particularidades logísticas", source:"Solo si cambian sedes, laboratorios o recursos", automatic:false, optional:true},
          {id:"observations", label:"Imponderables / observaciones", source:"Opcional", automatic:false, optional:true}
        ],
        dependencies: [
          {name:"Cronograma general del proceso", state:"Pendiente de incorporar"},
          {name:"Cronograma de núcleos / seminarios", state:"Pendiente de incorporar"},
          {name:"Cronograma de examen complexivo", state:"Pendiente de incorporar"}
        ]
      }]
    },
    "PRO-58": {
      name: "Seguimiento de requisitos",
      description: "Verificación individual y consolidada de requisitos de titulación.",
      documents: [
        {id:"req-acta", name:"Acta de Seguimiento de Requisitos", locked:true},
        {id:"req-individual", name:"Informe Individual de Verificación de Requisitos", locked:true},
        {id:"req-final", name:"Reporte Final de Requisitos", locked:true}
      ]
    },
    "PRO-95": {
      name: "Evaluación semestral",
      description: "Consolida resultados y cumplimiento del proceso al cierre del período.",
      documents: [
        {id:"informe-final", name:"Informe Final del Proceso de Titulación", locked:true}
      ]
    },
    "PRO-97": {
      name: "Inducción del proceso de titulación",
      description: "Registro e informe de la inducción del período.",
      documents: [
        {id:"registro-induccion", name:"Registro de Asistencia de Inducción", locked:true},
        {id:"informe-induccion", name:"Informe de Finalización de la Inducción", locked:true}
      ]
    }
  };

  const defaultState = {
    periods: [
      {id:"2025-10_2026-03", name:"Octubre 2025 – Marzo 2026", start:"2025-10-01", end:"2026-03-31", status:"Cerrado"},
      {id:"2025-04_2025-09", name:"Abril 2025 – Septiembre 2025", start:"2025-04-01", end:"2025-09-30", status:"Cerrado"}
    ],
    activePeriodId:"2025-10_2026-03",
    institutional:{
      preparedBy:"Msg. Jefferson Villarreal · Gestor de Procesos Académicos",
      reviewedBy:"Ing. Martha Tomalá · Coordinadora General de Carreras",
      approvedBy:"Dr. Alex León T. · Vicerrector"
    },
    documents:{}
  };

  let state = loadState();
  let activeDocument = null;

  const $ = (s) => document.querySelector(s);
  const els = {
    periodSelect: $("#periodSelect"),
    periodStatus: $("#periodStatus"),
    periodName: $("#periodName"),
    processMenu: $("#processMenu"),
    processCards: $("#processCards"),
    dashboardView: $("#dashboardView"),
    documentView: $("#documentView"),
    previewView: $("#previewView"),
    documentForm: $("#documentForm"),
    responsiblesFields: $("#responsiblesFields")
  };

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return {...structuredClone(defaultState), ...parsed};
    }catch{return structuredClone(defaultState)}
  }
  function saveState(){localStorage.setItem(STORAGE_KEY, JSON.stringify(state))}
  function activePeriod(){return state.periods.find(p=>p.id===state.activePeriodId) || state.periods[0]}
  function monthYear(date){
    const d = new Date(date+"T12:00:00");
    return {year:d.getFullYear(), month:String(d.getMonth()+1).padStart(2,"0")};
  }
  function documentCode(doc, period){
    const {year,month} = monthYear(period.start);
    return `${doc.prefix}${doc.sequence}-${doc.process}-${year}-${month}`;
  }
  function docStoreKey(docId){return `${state.activePeriodId}::${docId}`}
  function getDocData(docId){return state.documents[docStoreKey(docId)] || {}}
  function setDocData(docId,data){state.documents[docStoreKey(docId)] = {...getDocData(docId), ...data};saveState()}

  function renderPeriods(){
    els.periodSelect.innerHTML = state.periods.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
    els.periodSelect.value = state.activePeriodId;
    const p = activePeriod();
    els.periodName.textContent = p.name;
    els.periodStatus.textContent = p.status || "Activo";
  }

  function renderMenus(){
    els.processMenu.innerHTML = "";
    els.processCards.innerHTML = "";
    Object.entries(catalog).forEach(([code,proc],index)=>{
      const group = document.createElement("div");
      group.className = "process-group" + (index===0 ? " open":"");
      group.innerHTML = `
        <button class="process-button" type="button">
          <span class="process-code">${code}</span>
          <span>${proc.name}</span>
        </button>
        <div class="submenu">
          ${proc.documents.map(d=>`<button type="button" data-doc="${d.id}" data-proc="${code}">${d.name}${d.locked?" · próximamente":""}</button>`).join("")}
        </div>`;
      group.querySelector(".process-button").addEventListener("click",()=>group.classList.toggle("open"));
      group.querySelectorAll("[data-doc]").forEach(btn=>btn.addEventListener("click",()=>openDocument(btn.dataset.proc,btn.dataset.doc)));
      els.processMenu.appendChild(group);

      const card = document.createElement("article");
      card.className="process-card";
      card.innerHTML=`<span class="process-code">${code}</span><strong>${proc.name}</strong><p>${proc.description}</p><p style="margin-top:10px"><b>${proc.documents.length}</b> documento(s)</p>`;
      card.addEventListener("click",()=>{group.classList.add("open");group.scrollIntoView({behavior:"smooth",block:"center"})});
      els.processCards.appendChild(card);
    });
    $("#statProcesses").textContent = Object.keys(catalog).length;
    $("#statDocuments").textContent = Object.values(catalog).reduce((a,p)=>a+p.documents.length,0);
    const generated = Object.values(state.documents).filter(d=>d.generatedAt).length;
    $("#statGenerated").textContent = generated;
    $("#statReady").textContent = Object.values(state.documents).filter(d=>d.complete).length;
  }

  function showView(view){
    [els.dashboardView,els.documentView,els.previewView].forEach(v=>v.classList.remove("active"));
    view.classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function openDocument(procCode, docId){
    const proc = catalog[procCode];
    const doc = proc.documents.find(d=>d.id===docId);
    if(!doc) return;
    if(doc.locked){
      alert("Este documento ya está ubicado en su proceso, pero todavía no se ha analizado contigo. Lo incorporaremos cuando me envíes su documento real.");
      return;
    }
    activeDocument = {...doc, procCode, procName:proc.name};
    $("#docProcessLabel").textContent = `${procCode} · ${proc.name}`;
    $("#docTitle").textContent = doc.name;
    $("#docDescription").textContent = doc.description;
    $("#docCodeBadge").textContent = documentCode(doc, activePeriod());
    renderDocumentForm(doc);
    renderRequirements(doc);
    renderDependencies(doc);
    renderAutomatic(doc);
    showView(els.documentView);
    $("#screenTitle").textContent = doc.name;
  }

  function renderDocumentForm(doc){
    const saved = getDocData(doc.id);
    const form = els.documentForm;
    const p = activePeriod();
    form.elaborationDate.value = saved.elaborationDate || p.start;
    form.version.value = saved.version || doc.version || "1.0";
    form.responsiblesChanged.value = saved.responsiblesChanged || "no";
    form.preparedBy.value = saved.preparedBy || "";
    form.reviewedBy.value = saved.reviewedBy || "";
    form.approvedBy.value = saved.approvedBy || "";
    form.logistics.value = saved.logistics || "";
    form.observations.value = saved.observations || "";
    els.responsiblesFields.classList.toggle("hidden", form.responsiblesChanged.value!=="yes");
    updateProgress();
  }

  function renderRequirements(doc){
    const box = $("#requirementsList");
    box.innerHTML = doc.requirements.map(r=>`
      <div class="requirement ${r.automatic?"done":""}" data-req="${r.id}">
        <div class="req-icon">${r.automatic?"✓":"○"}</div>
        <div><strong>${r.label}${r.optional?" · opcional":""}</strong><small>${r.source}</small></div>
      </div>`).join("");
  }

  function renderDependencies(doc){
    $("#dependenciesList").innerHTML = doc.dependencies.map(d=>`
      <div class="dependency"><strong>${d.name}</strong><span>${d.state}</span></div>`).join("");
  }

  function renderAutomatic(doc){
    const p=activePeriod();
    const data=[
      ["Período",p.name],["Inicio",formatDate(p.start)],["Fin",formatDate(p.end)],
      ["Proceso",doc.process],["Código",documentCode(doc,p)],
      ["Elaborado por",state.institutional.preparedBy],
      ["Revisado por",state.institutional.reviewedBy],
      ["Aprobado por",state.institutional.approvedBy]
    ];
    $("#automaticData").innerHTML=data.map(([k,v])=>`<div class="auto-row"><span>${k}</span><strong>${v}</strong></div>`).join("");
  }

  function collectForm(){
    const fd = new FormData(els.documentForm);
    return Object.fromEntries(fd.entries());
  }
  function updateProgress(){
    if(!activeDocument) return;
    const d = collectForm();
    const required = ["elaborationDate","version"];
    if(d.responsiblesChanged==="yes") required.push("preparedBy","reviewedBy","approvedBy");
    const done = required.filter(k=>String(d[k]||"").trim()).length;
    const pct = Math.round((done/required.length)*100);
    $("#progressText").textContent = `${pct}% completo`;
    $("#progressBar").style.width = pct+"%";
    $("#docStateBadge").textContent = pct===100 ? "Listo para generar" : "Datos incompletos";
    $("#docStateBadge").className = "badge " + (pct===100 ? "" : "neutral");
    setDocData(activeDocument.id,{complete:pct===100});
  }

  function saveDraft(){
    if(!activeDocument) return;
    setDocData(activeDocument.id, collectForm());
    updateProgress();
    alert("Borrador guardado en este navegador y asociado al período seleccionado.");
  }

  function generatePreview(){
    const data = collectForm();
    if(!data.elaborationDate || !data.version){alert("Completa la fecha de elaboración y la versión.");return}
    if(data.responsiblesChanged==="yes" && (!data.preparedBy || !data.reviewedBy || !data.approvedBy)){
      alert("Completa los tres responsables o selecciona usar la configuración institucional.");return;
    }
    setDocData(activeDocument.id,{...data,generatedAt:new Date().toISOString(),complete:true});
    renderPreview(data);
    $("#statGenerated").textContent = Object.values(state.documents).filter(d=>d.generatedAt).length;
    showView(els.previewView);
    $("#screenTitle").textContent = "Vista del documento";
  }

  function renderPreview(data){
    const p=activePeriod(), doc=activeDocument;
    const code=documentCode(doc,p);
    const prep=data.responsiblesChanged==="yes"?data.preparedBy:state.institutional.preparedBy;
    const rev=data.responsiblesChanged==="yes"?data.reviewedBy:state.institutional.reviewedBy;
    const app=data.responsiblesChanged==="yes"?data.approvedBy:state.institutional.approvedBy;
    $("#printDocument").innerHTML = `
      <div class="paper-header">
        <div><strong>UNIDAD TITULACIÓN Y EFICIENCIA TERMINAL</strong></div>
        <div><strong>${doc.name}</strong><br>${p.name}</div>
        <div><strong>Código:</strong><br>${code}<br><strong>Versión:</strong> ${escapeHtml(data.version)}</div>
      </div>
      <p><strong>Fecha de elaboración:</strong> ${formatDate(data.elaborationDate)}</p>
      <h1>${doc.name}<br>${p.name}</h1>
      <h2>1. Introducción</h2>
      <p>El examen complexivo es una evaluación integral orientada a validar los conocimientos teóricos y prácticos adquiridos por los estudiantes durante su formación. Esta planificación organiza el proceso del período académico seleccionado y articula sus fases, requisitos, responsables, cronogramas y recursos.</p>
      <h2>2. Base legal</h2>
      <p>La base legal se mantiene como contenido institucional de la plantilla. En la versión definitiva se conservará y actualizará desde una única fuente para evitar que cada período duplique normativa.</p>
      <h2>3. Metodología</h2>
      <p>La planificación se estructura en fases de inducción, diseño del examen, organización y distribución, preparación mediante seminarios, aplicación, evaluación, retroalimentación y mejora continua.</p>
      <h2>4. Datos operativos del período</h2>
      <p><strong>Período:</strong> ${p.name}. <strong>Inicio:</strong> ${formatDate(p.start)}. <strong>Fin:</strong> ${formatDate(p.end)}.</p>
      <p><strong>Particularidades logísticas:</strong> ${escapeHtml(data.logistics || "Sin particularidades adicionales registradas para este período.")}</p>
      <h2>5. Imponderables y observaciones</h2>
      <p>${escapeHtml(data.observations || "No se registran observaciones adicionales al momento de generar esta versión.")}</p>
      <h2>6. Documentos relacionados</h2>
      <p>Esta planificación se vinculará con el cronograma general, el cronograma de núcleos o seminarios y el cronograma de examen complexivo del mismo período. Estos documentos se incorporarán progresivamente al sistema y compartirán la misma referencia de período.</p>
      <div class="signature-grid">
        <div><strong>ELABORADO POR</strong><br><br>${escapeHtml(prep)}</div>
        <div><strong>REVISADO POR</strong><br><br>${escapeHtml(rev)}</div>
        <div><strong>APROBADO POR</strong><br><br>${escapeHtml(app)}</div>
      </div>`;
  }

  function formatDate(v){
    if(!v) return "—";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"long",year:"numeric"}).format(d);
  }
  function escapeHtml(v){
    return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  }

  function createPeriod(){
    const fd=new FormData($("#periodForm"));
    const d=Object.fromEntries(fd.entries());
    if(!d.name||!d.start||!d.end) return;
    const id=`${d.start}_${d.end}_${Date.now()}`;
    state.periods.unshift({id,name:d.name,start:d.start,end:d.end,status:"Activo"});
    state.activePeriodId=id;saveState();renderAll();$("#periodDialog").close();$("#periodForm").reset();
  }

  function exportBackup(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download=`doc-tit-respaldo-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);
  }
  function restoreBackup(file){
    const reader=new FileReader();
    reader.onload=()=>{try{const parsed=JSON.parse(reader.result);if(!parsed.periods) throw new Error();state=parsed;saveState();renderAll();alert("Respaldo restaurado.");}catch{alert("El archivo no corresponde a un respaldo válido de DOC-TIT.");}};
    reader.readAsText(file);
  }

  function renderAll(){renderPeriods();renderMenus();showView(els.dashboardView);$("#screenTitle").textContent="Documentos por período"}

  els.periodSelect.addEventListener("change",e=>{state.activePeriodId=e.target.value;saveState();renderAll()});
  $("#newPeriodBtn").addEventListener("click",()=>$("#periodDialog").showModal());
  $("#createPeriodBtn").addEventListener("click",e=>{e.preventDefault();createPeriod()});
  $("#backBtn").addEventListener("click",()=>{showView(els.dashboardView);$("#screenTitle").textContent="Documentos por período"});
  $("#previewBackBtn").addEventListener("click",()=>{showView(els.documentView);$("#screenTitle").textContent=activeDocument.name});
  $("#openFirstDocBtn").addEventListener("click",()=>openDocument("PRO-56","plan-examen-complexivo"));
  els.documentForm.addEventListener("input",updateProgress);
  els.documentForm.responsiblesChanged.addEventListener("change",e=>{els.responsiblesFields.classList.toggle("hidden",e.target.value!=="yes");updateProgress()});
  $("#saveDraftBtn").addEventListener("click",saveDraft);
  els.documentForm.addEventListener("submit",e=>{e.preventDefault();generatePreview()});
  $("#printBtn").addEventListener("click",()=>window.print());
  $("#backupBtn").addEventListener("click",exportBackup);
  $("#restoreInput").addEventListener("change",e=>{if(e.target.files[0]) restoreBackup(e.target.files[0])});

  renderAll();
})();