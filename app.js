(() => {
  const STORAGE_KEY = "doc-tit-v2";
  const LEGACY_STORAGE_KEY = "doc-tit-v1";
  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const SCHEDULE_ACTIVITIES = [
    "Fin de clases",
    "Semana Requisitos",
    "Núcleo 1",
    "Núcleo 2",
    "Núcleo 3",
    "Núcleo 4",
    "Notas de núcleos",
    "Examen complexivo",
    "Supletorio"
  ];

  const APR_SEP_2026_SCHEDULE = [
    {activity:"Fin de clases", start:"2026-09-25", end:"2026-09-26"},
    {activity:"Semana Requisitos", start:"2026-09-28", end:"2026-10-02"},
    {activity:"Núcleo 1", start:"2026-10-05", end:"2026-10-08"},
    {activity:"Núcleo 2", start:"2026-10-12", end:"2026-10-15"},
    {activity:"Núcleo 3", start:"2026-10-16", end:"2026-10-20"},
    {activity:"Núcleo 4", start:"2026-10-21", end:"2026-10-24"},
    {activity:"Notas de núcleos", start:"2026-10-26", end:"2026-10-27"},
    {activity:"Examen complexivo", start:"2026-10-28", end:"2026-10-31"},
    {activity:"Supletorio", start:"2026-11-09", end:"2026-11-11"}
  ];

  const APR_SEP_2026_DISTRIBUTION = [
    {career:"CONTABILIDAD", place:"Norte", count:37},
    {career:"EDUCACION INICIAL", place:"Norte", count:30},
    {career:"EDUCACIÓN BÁSICA", place:"Norte", count:23},
    {career:"ADMINISTRACION", place:"Norte", count:20},
    {career:"GESTION DEL TALENTO HUMANO", place:"Norte", count:20},
    {career:"EDUCACION INICIAL ONLINE", place:"Norte", count:16},
    {career:"GESTION DEL TALENTO HUMANO ONLINE", place:"Norte", count:15},
    {career:"SEGURIDAD CIUDADANA Y ORDEN PÚBLICO ONLINE", place:"Norte", count:14},
    {career:"ADMINISTRACION ONLINE", place:"Norte", count:12},
    {career:"CONTABILIDAD ONLINE", place:"Norte", count:12},
    {career:"MECÁNICA AUTOMOTRIZ", place:"Norte", count:9},
    {career:"EDUCACIÓN BÁSICA ONLINE", place:"Norte", count:4},
    {career:"SEGURIDAD Y PREVENCIÓN DE RIESGOS LABORALES", place:"Norte", count:4},
    {career:"ENFERMERÍA", place:"Sur", count:63},
    {career:"MARKETING DIGITAL Y COMERCIO ELECTRONICO", place:"Sur", count:61},
    {career:"REDES Y TELECOMUNICACIONES", place:"Sur", count:36},
    {career:"ESTÉTICA INTEGRAL", place:"Sur", count:35},
    {career:"DESARROLLO DE SOFTWARE", place:"Sur", count:27},
    {career:"REDES Y TELECOMUNICACIONES ONLINE", place:"Sur", count:13},
    {career:"DESARROLLO DE SOFTWARE ONLINE", place:"Sur", count:6},
    {career:"VENTAS ONLINE", place:"Sur", count:2},
    {career:"DISEÑO MULTIMEDIA", place:"Sur", count:11},
    {career:"MARKETING DIGITAL Y COMERCIO ELECTRONICO ONLINE", place:"Sur", count:9},
    {career:"PROCESAMIENTO EN ALIMENTOS", place:"Manta", count:11}
  ];

  const catalog = {
    "PRO-56": {
      name: "Planificación semestral",
      fullName: "Planificación semestral del proceso de titulación",
      documents: [{
        id: "plan-examen-complexivo",
        name: "Planificación de Examen Complexivo",
        prefix: "UTET-RGI1-",
        sequence: "01",
        process: "PRO-56",
        version: "1.0",
        description: "Para generar esta planificación solo necesitas el cronograma y la distribución de estudiantes por carrera, lugar y cantidad.",
        requirements: [
          {id:"period", label:"Período académico", source:"Automático", automatic:true},
          {id:"schedule", label:"Cronograma", source:"Fechas de las 9 actividades", automatic:false},
          {id:"distribution", label:"Carreras · Lugar · Cantidad", source:"Distribución del período", automatic:false},
          {id:"logo", label:"Logo institucional", source:"Se usa en el encabezado de las 45 páginas", automatic:false},
          {id:"code", label:"Código, fecha y versión", source:"Automáticos", automatic:true}
        ]
      }]
    },
    "PRO-58": {
      name: "Seguimiento de requisitos",
      fullName: "Seguimiento de requisitos",
      documents: [
        {id:"req-acta", name:"Acta de Seguimiento de Requisitos", locked:true},
        {id:"req-individual", name:"Informe Individual de Verificación de Requisitos", locked:true},
        {id:"req-final", name:"Reporte Final de Requisitos", locked:true}
      ]
    },
    "PRO-95": {
      name: "Evaluación semestral",
      fullName: "Evaluación semestral del proceso de titulación",
      documents: [{id:"informe-final", name:"Informe Final del Proceso de Titulación", locked:true}]
    },
    "PRO-97": {
      name: "Inducción",
      fullName: "Inducción del proceso de titulación",
      documents: [
        {id:"registro-induccion", name:"Registro de Asistencia de Inducción", locked:true},
        {id:"informe-induccion", name:"Informe de Finalización de la Inducción", locked:true}
      ]
    }
  };

  const defaultState = {
    periods: [
      {id:"2026-04_2026-09", name:"Abril 2026 – Septiembre 2026", start:"2026-04-01", end:"2026-09-30", status:"Activo"},
      {id:"2025-10_2026-03", name:"Octubre 2025 – Marzo 2026", start:"2025-10-01", end:"2026-03-31", status:"Cerrado"},
      {id:"2025-04_2025-09", name:"Abril 2025 – Septiembre 2025", start:"2025-04-01", end:"2025-09-30", status:"Cerrado"}
    ],
    activePeriodId:"2026-04_2026-09",
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
    dashboardView: $("#dashboardView"),
    documentView: $("#documentView"),
    previewView: $("#previewView"),
    documentForm: $("#documentForm"),
    periodDialog: $("#periodDialog")
  };

  function clone(value){return JSON.parse(JSON.stringify(value))}
  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) return normalizeState(JSON.parse(raw));
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if(legacy) return normalizeState(JSON.parse(legacy));
    }catch(e){}
    return clone(defaultState);
  }
  function normalizeState(parsed){
    const base = clone(defaultState);
    const merged = {...base, ...parsed};
    merged.periods = Array.isArray(parsed.periods) ? parsed.periods.slice() : base.periods.slice();
    base.periods.forEach(dp=>{if(!merged.periods.some(p=>p.id===dp.id)) merged.periods.unshift(dp)});
    if(!merged.periods.some(p=>p.id===merged.activePeriodId)) merged.activePeriodId=base.activePeriodId;
    merged.institutional = {...base.institutional, ...(parsed.institutional||{})};
    merged.documents = parsed.documents || {};
    return merged;
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
  function allDocumentCount(){return Object.values(catalog).reduce((sum,p)=>sum+p.documents.length,0)}
  function periodDocumentData(){
    const prefix=state.activePeriodId+"::";
    return Object.entries(state.documents).filter(([key])=>key.startsWith(prefix)).map(([,data])=>data);
  }

  function renderPeriods(){
    els.periodSelect.innerHTML=state.periods.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
    els.periodSelect.value=state.activePeriodId;
    const p=activePeriod();
    els.periodName.textContent=p.name;
    els.periodStatus.textContent=p.status||"Activo";
    const generated=periodDocumentData().filter(d=>d.generatedAt).length;
    $("#periodDocumentSummary").textContent=`${allDocumentCount()} documentos · ${generated} generados`;
  }

  function renderMenus(){
    els.processMenu.innerHTML="";
    Object.entries(catalog).forEach(([code,proc],index)=>{
      const group=document.createElement("div");
      group.className="process-group"+(index===0?" open":"");
      group.innerHTML=`
        <button class="process-button" type="button">
          <span class="process-code">${code}</span>
          <span class="process-name">${proc.name}</span>
        </button>
        <div class="submenu">
          ${proc.documents.map(d=>`<button type="button" data-doc="${d.id}" data-proc="${code}">${d.name}${d.locked?" · próximamente":""}</button>`).join("")}
        </div>`;
      group.querySelector(".process-button").addEventListener("click",()=>group.classList.toggle("open"));
      group.querySelectorAll("[data-doc]").forEach(btn=>btn.addEventListener("click",()=>openDocument(btn.dataset.proc,btn.dataset.doc)));
      els.processMenu.appendChild(group);
    });
  }

  function showView(view){
    [els.dashboardView,els.documentView,els.previewView].forEach(v=>v.classList.remove("active"));
    view.classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function openDocument(procCode,docId){
    const proc=catalog[procCode];
    const doc=proc.documents.find(d=>d.id===docId);
    if(!doc) return;
    if(doc.locked){
      alert("Este documento todavía no se ha analizado. Lo incorporaremos cuando revisemos su documento real.");
      return;
    }
    activeDocument={...doc,procCode,procName:proc.fullName||proc.name};
    $("#docProcessLabel").textContent=`${procCode} · ${proc.fullName||proc.name}`;
    $("#docTitle").textContent=doc.name;
    $("#docDescription").textContent=doc.description;
    $("#docCodeBadge").textContent=documentCode(doc,activePeriod());
    renderRequirements(doc);
    renderAutomatic(doc);
    renderDocumentForm(doc);
    showView(els.documentView);
    $("#screenTitle").textContent=doc.name;
  }

  function starterSchedule(){
    if(state.activePeriodId==="2026-04_2026-09") return clone(APR_SEP_2026_SCHEDULE);
    return SCHEDULE_ACTIVITIES.map(activity=>({activity,start:"",end:""}));
  }
  function starterDistribution(){
    if(state.activePeriodId==="2026-04_2026-09") return clone(APR_SEP_2026_DISTRIBUTION);
    return [{career:"",place:"",count:""}];
  }

  function renderDocumentForm(doc){
    const saved=getDocData(doc.id);
    renderSchedule(saved.schedule||starterSchedule());
    renderDistribution(saved.distribution||starterDistribution());
    renderAssetPreviews(saved.assets||{});
    updateProgress();
  }

  function renderAssetPreviews(assets){
    const configs=[
      ["logoPreview",assets.logo,"Sin imagen"]
    ];
    configs.forEach(([id,src,empty])=>{
      const el=$("#"+id);
      if(el) el.innerHTML=src?`<img src="${src}" alt="Imagen cargada">`:`<span>${empty}</span>`;
    });
  }

  async function storeAsset(key,file){
    if(!activeDocument||!file) return;
    try{
      const maxW=key==="logo"?900:700;
      const maxH=key==="logo"?320:360;
      const dataUrl=await window.DocTitFullDocument.resizeImage(file,maxW,maxH);
      const saved=getDocData(activeDocument.id);
      const assets={...(saved.assets||{}),[key]:dataUrl};
      setDocData(activeDocument.id,{assets});
      renderAssetPreviews(assets);
      updateProgress();
    }catch(err){
      alert(err.message||"No se pudo cargar la imagen.");
    }
  }

  function renderSchedule(rows){
    $("#scheduleBody").innerHTML=rows.map((row,i)=>`
      <tr data-index="${i}">
        <td>${escapeHtml(row.activity)}</td>
        <td><input class="schedule-start" type="date" value="${escapeAttr(row.start||"")}" aria-label="Inicio ${escapeAttr(row.activity)}"></td>
        <td><input class="schedule-end" type="date" value="${escapeAttr(row.end||"")}" aria-label="Fin ${escapeAttr(row.activity)}"></td>
      </tr>`).join("");
  }

  function distributionRowHtml(row={career:"",place:"",count:""}){
    return `<tr>
      <td><input class="dist-career" type="text" value="${escapeAttr(row.career||"")}" placeholder="Carrera"></td>
      <td><input class="dist-place" type="text" list="placesList" value="${escapeAttr(row.place||"")}" placeholder="Lugar"></td>
      <td><input class="dist-count" type="number" min="0" step="1" value="${row.count===""?"":Number(row.count)}" placeholder="0"></td>
      <td><button type="button" class="row-remove" aria-label="Eliminar fila">×</button></td>
    </tr>`;
  }

  function renderDistribution(rows){
    $("#distributionBody").innerHTML=rows.map(r=>distributionRowHtml(r)).join("");
    bindRemoveButtons();
    updateDistributionTotals();
  }

  function bindRemoveButtons(){
    document.querySelectorAll(".row-remove").forEach(btn=>{
      btn.onclick=()=>{
        const tbody=$("#distributionBody");
        if(tbody.rows.length<=1){
          tbody.innerHTML=distributionRowHtml();
          bindRemoveButtons();
        }else{
          btn.closest("tr").remove();
        }
        updateDistributionTotals();
        updateProgress();
      };
    });
  }

  function collectSchedule(){
    return Array.from($("#scheduleBody").querySelectorAll("tr")).map((tr,i)=>({
      activity:SCHEDULE_ACTIVITIES[i],
      start:tr.querySelector(".schedule-start").value,
      end:tr.querySelector(".schedule-end").value
    }));
  }

  function collectDistribution(){
    return Array.from($("#distributionBody").querySelectorAll("tr")).map(tr=>({
      career:tr.querySelector(".dist-career").value.trim(),
      place:tr.querySelector(".dist-place").value.trim(),
      count:tr.querySelector(".dist-count").value===""?"":Number(tr.querySelector(".dist-count").value)
    })).filter(r=>r.career||r.place||r.count!=="");
  }

  function updateDistributionTotals(){
    const rows=collectDistribution();
    const totals={};
    let total=0;
    rows.forEach(r=>{
      const n=Number(r.count)||0;
      const place=r.place||"Sin lugar";
      totals[place]=(totals[place]||0)+n;
      total+=n;
    });
    const chips=Object.entries(totals).map(([place,n])=>`<span class="total-chip">${escapeHtml(place)}: <strong>${n}</strong></span>`);
    chips.push(`<span class="total-chip">Total: <strong>${total}</strong></span>`);
    $("#distributionTotals").innerHTML=chips.join("");
  }

  function renderRequirements(doc){
    $("#requirementsList").innerHTML=doc.requirements.map(r=>`
      <div class="requirement ${r.automatic?"done":""}" data-req="${r.id}">
        <div class="req-icon">${r.automatic?"✓":"○"}</div>
        <div><strong>${r.label}</strong><small>${r.source}</small></div>
      </div>`).join("");
  }

  function renderAutomatic(doc){
    const p=activePeriod();
    const data=[
      ["Período",p.name],
      ["Código",documentCode(doc,p)],
      ["Fecha de elaboración",formatDate(p.start)],
      ["Versión","1.0"],
      ["Elaborado por",state.institutional.preparedBy],
      ["Revisado por",state.institutional.reviewedBy],
      ["Aprobado por",state.institutional.approvedBy]
    ];
    $("#automaticData").innerHTML=data.map(([k,v])=>`<div class="auto-row"><span>${k}</span><strong>${escapeHtml(v)}</strong></div>`).join("");
  }

  function scheduleComplete(schedule){return schedule.length===SCHEDULE_ACTIVITIES.length && schedule.every(r=>r.start&&r.end)}
  function distributionComplete(rows){return rows.length>0 && rows.every(r=>r.career&&r.place&&r.count!==""&&Number(r.count)>=0)}

  function updateProgress(){
    if(!activeDocument) return;
    const schedule=collectSchedule();
    const distribution=collectDistribution();
    const assets=getDocData(activeDocument.id).assets||{};
    const scheduleOk=scheduleComplete(schedule);
    const distributionOk=distributionComplete(distribution);
    const logoOk=!!assets.logo;
    const setReq=(id,ok)=>{
      const row=document.querySelector('[data-req="'+id+'"]');
      if(!row)return;
      row.classList.toggle("done",ok);
      const icon=row.querySelector(".req-icon");
      if(icon)icon.textContent=ok?"✓":"○";
    };
    setReq("schedule",scheduleOk);
    setReq("distribution",distributionOk);
    setReq("logo",logoOk);
    const pct=Math.round(((2+(scheduleOk?1:0)+(distributionOk?1:0)+(logoOk?1:0))/5)*100);
    $("#progressText").textContent=`${pct}% completo`;
    $("#progressBar").style.width=pct+"%";
    $("#docStateBadge").textContent=pct===100?"Listo para generar":"Datos incompletos";
    $("#docStateBadge").className="badge "+(pct===100?"":"neutral");
  }

  function collectDocumentData(){
    const saved=activeDocument?getDocData(activeDocument.id):{};
    return {schedule:collectSchedule(),distribution:collectDistribution(),assets:saved.assets||{}};
  }

  function saveDraft(){
    if(!activeDocument) return;
    const data=collectDocumentData();
    const complete=scheduleComplete(data.schedule)&&distributionComplete(data.distribution)&&!!data.assets.logo;
    setDocData(activeDocument.id,{...data,complete});
    renderPeriods();
    updateProgress();
    alert("Borrador guardado para este período.");
  }

  async function generatePreview(){
    const data=collectDocumentData();
    if(!scheduleComplete(data.schedule)){
      alert("Completa las fechas de las 9 actividades del cronograma.");
      return;
    }
    if(!distributionComplete(data.distribution)){
      alert("Completa Carrera, Lugar y Cantidad en todas las filas utilizadas.");
      return;
    }
    if(!data.assets.logo){
      alert("Sube el logo institucional. Se utilizará en el encabezado de las 45 páginas.");
      return;
    }
    const button=$("#generateBtn");
    const oldText=button.textContent;
    button.disabled=true;
    button.textContent="Generando 45 páginas…";
    try{
      const p=activePeriod(),doc=activeDocument;
      $("#printDocument").innerHTML=await window.DocTitFullDocument.render({
        period:p,
        doc,
        schedule:data.schedule,
        distribution:data.distribution,
        assets:data.assets,
        institutional:state.institutional,
        code:documentCode(doc,p)
      });
      setDocData(activeDocument.id,{...data,generatedAt:new Date().toISOString(),complete:true});
      renderPeriods();
      showView(els.previewView);
      $("#screenTitle").textContent="Vista de la planificación · 45 páginas";
    }catch(err){
      console.error(err);
      alert("No se pudo generar el documento completo: "+(err.message||err));
    }finally{
      button.disabled=false;
      button.textContent=oldText;
    }
  }

  function formatDate(v){
    if(!v)return"—";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"long",year:"numeric"}).format(d);
  }
  function formatDateShort(v){
    if(!v)return"";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
  }
  function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
  function escapeAttr(v){return escapeHtml(v)}

  function populateMonthSelectors(){
    const options=MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("");
    $("#startMonth").innerHTML=options;$("#endMonth").innerHTML=options;
  }
  function getYearValue(id){return Number($("#"+id).dataset.value)}
  function setYearValue(id,value){
    const safe=Math.min(2100,Math.max(2000,Number(value)));
    const out=$("#"+id);out.dataset.value=String(safe);out.textContent=String(safe);
  }
  function monthIndexFromDate(date){return new Date(date+"T12:00:00").getMonth()+1}
  function yearFromDate(date){return new Date(date+"T12:00:00").getFullYear()}
  function openPeriodDialog(){
    const p=activePeriod();
    $("#startMonth").value=String(monthIndexFromDate(p.start));
    $("#endMonth").value=String(monthIndexFromDate(p.end));
    setYearValue("startYear",yearFromDate(p.start)+1);
    setYearValue("endYear",yearFromDate(p.end)+1);
    $("#periodError").classList.add("hidden");
    updatePeriodPreview();
    els.periodDialog.showModal();
  }
  function updatePeriodPreview(){
    const sm=Number($("#startMonth").value),em=Number($("#endMonth").value);
    const sy=getYearValue("startYear"),ey=getYearValue("endYear");
    $("#periodPreviewName").textContent=`${MONTHS[sm-1]} ${sy} – ${MONTHS[em-1]} ${ey}`;
    const valid=ey>sy||(ey===sy&&em>=sm);
    $("#periodError").classList.toggle("hidden",valid);
    return valid;
  }
  function lastDayOfMonth(year,month){return new Date(year,month,0).getDate()}
  function createPeriod(){
    if(!updatePeriodPreview())return;
    const sm=Number($("#startMonth").value),em=Number($("#endMonth").value);
    const sy=getYearValue("startYear"),ey=getYearValue("endYear");
    const start=`${sy}-${String(sm).padStart(2,"0")}-01`;
    const end=`${ey}-${String(em).padStart(2,"0")}-${String(lastDayOfMonth(ey,em)).padStart(2,"0")}`;
    const name=`${MONTHS[sm-1]} ${sy} – ${MONTHS[em-1]} ${ey}`;
    const existing=state.periods.find(p=>p.start===start&&p.end===end);
    if(existing){
      state.activePeriodId=existing.id;
    }else{
      const id=`${sy}-${String(sm).padStart(2,"0")}_${ey}-${String(em).padStart(2,"0")}`;
      state.periods.unshift({id,name,start,end,status:"Activo"});
      state.activePeriodId=id;
    }
    saveState();renderAll();els.periodDialog.close();
  }

  function exportBackup(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download=`doc-tit-respaldo-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);
  }
  function restoreBackup(file){
    const reader=new FileReader();
    reader.onload=()=>{try{const parsed=JSON.parse(reader.result);if(!parsed.periods)throw new Error();state=normalizeState(parsed);saveState();renderAll();alert("Respaldo restaurado.");}catch{alert("El archivo no corresponde a un respaldo válido de DOC-TIT.");}};
    reader.readAsText(file);
  }

  function renderAll(){renderPeriods();renderMenus();showView(els.dashboardView);$("#screenTitle").textContent="Gestión documental"}

  populateMonthSelectors();

  els.periodSelect.addEventListener("change",e=>{state.activePeriodId=e.target.value;saveState();renderAll()});
  $("#newPeriodBtn").addEventListener("click",openPeriodDialog);
  document.querySelectorAll("[data-year-target]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.dataset.yearTarget;setYearValue(id,getYearValue(id)+Number(btn.dataset.delta));updatePeriodPreview();
  }));
  $("#startMonth").addEventListener("change",updatePeriodPreview);
  $("#endMonth").addEventListener("change",updatePeriodPreview);
  $("#createPeriodBtn").addEventListener("click",e=>{e.preventDefault();createPeriod()});
  $("#backBtn").addEventListener("click",()=>{showView(els.dashboardView);$("#screenTitle").textContent="Gestión documental"});
  $("#previewBackBtn").addEventListener("click",()=>{showView(els.documentView);$("#screenTitle").textContent=activeDocument.name});
  $("#addDistributionRowBtn").addEventListener("click",()=>{
    $("#distributionBody").insertAdjacentHTML("beforeend",distributionRowHtml());
    bindRemoveButtons();updateDistributionTotals();updateProgress();
  });
  els.documentForm.addEventListener("input",e=>{if(e.target.matches(".dist-count,.dist-place,.dist-career"))updateDistributionTotals();updateProgress()});
  $("#logoUpload")?.addEventListener("change",e=>{
    const file=e.target.files&&e.target.files[0];
    if(file)storeAsset("logo",file);
    e.target.value="";
  });
  $("#saveDraftBtn").addEventListener("click",saveDraft);
  els.documentForm.addEventListener("submit",e=>{e.preventDefault();generatePreview()});
  $("#printBtn").addEventListener("click",()=>window.print());
  $("#backupBtn").addEventListener("click",exportBackup);
  $("#restoreInput").addEventListener("change",e=>{if(e.target.files[0])restoreBackup(e.target.files[0])});

  renderAll();
})();