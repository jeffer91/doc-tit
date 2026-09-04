(() => {
  "use strict";

  const STORAGE_KEY = "doc-tit-complexivo-v1";
  const LEGACY_KEYS = ["doc-tit-v3","doc-tit-v2","doc-tit-v1"];
  const ASSET_DB_NAME = "doc-tit-complexivo-assets";
  const ASSET_DB_VERSION = 1;
  const ASSET_STORE = "document-assets";
  const assetCache = new Map();
  let pendingLegacyAssets = [];
  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const SCHEDULE_ACTIVITIES = [
    "Fin de clases",
    "Semana de Requisitos",
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
    {activity:"Semana de Requisitos", start:"2026-09-28", end:"2026-10-02"},
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
        name: "Planificación del Examen Complexivo",
        fileTitle: "Planificación del Examen Complexivo",
        prefix: "UTET-RGI1-",
        sequence: "01",
        process: "PRO-56",
        version: "1.0",
        description: "Completa el cronograma, la distribución y cualquier información adicional. La app analiza el texto libre y genera el PDF completo directamente.",
        requirements: [
          {id:"period", label:"Período académico", source:"Automático", automatic:true},
          {id:"schedule", label:"Cronograma", source:"Fechas de las 9 actividades", automatic:false},
          {id:"distribution", label:"Carreras · Lugar · Cantidad", source:"Distribución del período", automatic:false},
          {id:"logo", label:"Logo institucional", source:"Cabecera de todas las páginas", automatic:false},
          {id:"code", label:"Código documental", source:"Automático", automatic:true}
        ]
      }]
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
      preparedBy:"Mgs. Jefferson Villarreal",
      preparedRole:"Coordinador de Titulación y Eficiencia Terminal",
      reviewedBy:"Ing. Martha Tomalá",
      reviewedRole:"Coordinadora General de Carreras",
      approvedBy:"Dr. Alex León",
      approvedRole:"Vicerrector"
    },
    documents:{}
  };

  let state = loadState();
  let activeDocument = null;
  let cloudReady = false;
  let suppressCloudSync = false;
  const cloudSyncTimers = new Map();

  const $ = s => document.querySelector(s);
  const els = {
    periodSelect: $("#periodSelect"),
    periodStatus: $("#periodStatus"),
    periodName: $("#periodName"),
    processMenu: $("#processMenu"),
    dashboardView: $("#dashboardView"),
    documentView: $("#documentView"),
    documentForm: $("#documentForm"),
    periodDialog: $("#periodDialog"),
    cloudStatusCard: $("#cloudStatusCard")
  };

  function clone(v){ return JSON.parse(JSON.stringify(v)); }

  function findCatalogDocument(docId){
    for(const [procCode,proc] of Object.entries(catalog)){
      const doc=proc.documents.find(d=>d.id===docId);
      if(doc) return {...doc,procCode,procName:proc.fullName||proc.name,process:procCode};
    }
    return null;
  }

  function setCloudStatus(mode,detail){
    const card=$("#cloudStatusCard");
    const title=$("#cloudStatusText");
    const subtitle=$("#cloudStatusDetail");
    if(!card||!title||!subtitle) return;

    card.classList.remove("connected","error");
    if(mode==="connected") card.classList.add("connected");
    if(mode==="error") card.classList.add("error");

    title.textContent=mode==="connected"?"Base de datos conectada":"Base de datos";
    subtitle.textContent=detail||(
      mode==="connected"?"Supabase · sincronizado":
      mode==="error"?"Sin conexión · usando caché local":"Conectando…"
    );
  }

  async function syncPeriodToCloud(period){
    if(!cloudReady||!period) return;
    await window.DocTitCloud.upsertPeriod(period);
  }

  async function syncDocumentToCloud(docId,periodId=state.activePeriodId){
    if(!cloudReady||suppressCloudSync) return;
    const period=state.periods.find(p=>p.id===periodId);
    const doc=findCatalogDocument(docId);
    const data=state.documents[`${periodId}::${docId}`];
    if(!period||!doc||!data) return;

    await window.DocTitCloud.upsertDocument({
      period,
      document:doc,
      data,
      code:documentCode(doc,period)
    });
  }

  function queueDocumentSync(docId,periodId=state.activePeriodId){
    if(!cloudReady||suppressCloudSync) return;
    const key=`${periodId}::${docId}`;
    clearTimeout(cloudSyncTimers.get(key));
    const timer=setTimeout(()=>{
      syncDocumentToCloud(docId,periodId).catch(err=>{
        console.error("No se pudo sincronizar el documento.",err);
        setCloudStatus("error","Error al sincronizar");
      });
      cloudSyncTimers.delete(key);
    },700);
    cloudSyncTimers.set(key,timer);
  }

  async function migrateLocalWorkspaceToCloud(){
    if(localStorage.getItem("doc-tit-cloud-migrated-v1")==="1") return;

    for(const period of state.periods){
      await window.DocTitCloud.upsertPeriod(period);
    }
    await window.DocTitCloud.upsertSetting("institutional",state.institutional);

    for(const [storeKey,data] of Object.entries(state.documents||{})){
      const splitAt=storeKey.indexOf("::");
      if(splitAt<0) continue;
      const periodId=storeKey.slice(0,splitAt);
      const docId=storeKey.slice(splitAt+2);
      const period=state.periods.find(p=>p.id===periodId);
      const doc=findCatalogDocument(docId);
      if(period&&doc){
        await window.DocTitCloud.upsertDocument({
          period,
          document:doc,
          data,
          code:documentCode(doc,period)
        });
      }

      try{
        const assets=await readAssetsByKey(storeKey);
        for(const [assetKey,dataUrl] of Object.entries(assets||{})){
          if(!dataUrl) continue;
          await window.DocTitCloud.uploadAsset({
            periodKey:periodId,
            documentKey:docId,
            assetKey,
            dataUrl,
            fileName:`${assetKey}.jpg`
          });
        }
      }catch(err){
        console.warn("No se pudo migrar una imagen local.",err);
      }
    }

    localStorage.setItem("doc-tit-cloud-migrated-v1","1");
  }

  async function pushCurrentWorkspaceToCloud(){
    if(!cloudReady) return;

    for(const period of state.periods||[]){
      await window.DocTitCloud.upsertPeriod(period);
    }
    await window.DocTitCloud.upsertSetting("institutional",state.institutional);

    for(const [storeKey,data] of Object.entries(state.documents||{})){
      const splitAt=storeKey.indexOf("::");
      if(splitAt<0) continue;
      const periodId=storeKey.slice(0,splitAt);
      const docId=storeKey.slice(splitAt+2);
      const period=state.periods.find(p=>p.id===periodId);
      const doc=findCatalogDocument(docId);
      if(period&&doc){
        await window.DocTitCloud.upsertDocument({
          period,
          document:doc,
          data,
          code:documentCode(doc,period)
        });
      }
    }
  }

  async function hydrateFromCloud(){
    const workspace=await window.DocTitCloud.loadWorkspace();

    suppressCloudSync=true;
    try{
      if(workspace.periods.length){
        const localById=new Map((state.periods||[]).map(p=>[p.id,p]));
        workspace.periods.forEach(row=>{
          localById.set(row.period_key,{
            id:row.period_key,
            name:row.name,
            start:row.start_date,
            end:row.end_date,
            status:row.status||"Activo"
          });
        });
        state.periods=Array.from(localById.values()).sort((a,b)=>String(b.start).localeCompare(String(a.start)));
      }

      const docs={...(state.documents||{})};
      for(const row of workspace.documents){
        const key=`${row.period_key}::${row.document_key}`;
        docs[key]={
          ...(docs[key]||{}),
          schedule:Array.isArray(row.schedule)?row.schedule:[],
          distribution:Array.isArray(row.distribution)?row.distribution:[],
          smartText:row.smart_text||"",
          analysis:row.analysis||null,
          complete:!!row.complete,
          generatedAt:row.generated_at||null,
          generatedFileName:row.generated_file_name||null,
          generatedPages:row.generated_pages||null,
          cloudUpdatedAt:row.updated_at||null
        };
      }
      state.documents=docs;

      const institutional=workspace.settings.find(row=>row.key==="institutional");
      if(institutional?.value && typeof institutional.value==="object"){
        state.institutional={...state.institutional,...institutional.value};
      }

      if(!state.periods.some(p=>p.id===state.activePeriodId)){
        state.activePeriodId=state.periods[0]?.id||defaultState.activePeriodId;
      }

      saveState();
    }finally{
      suppressCloudSync=false;
    }

    renderAll();
  }

  async function initCloud(){
    if(!window.DocTitCloud){
      cloudReady=false;
      setCloudStatus("error","Supabase no cargó · usando caché local");
      return;
    }

    setCloudStatus("loading","Conectando automáticamente…");

    try{
      await window.DocTitCloud.healthCheck();
      cloudReady=true;

      // Mezcla la base con la caché local para no perder cambios que aún no se
      // hubieran sincronizado.
      await hydrateFromCloud();
      await migrateLocalWorkspaceToCloud();

      setCloudStatus("connected","Supabase · sincronización automática");
    }catch(err){
      console.error("No se pudo conectar con Supabase.",err);
      cloudReady=false;
      setCloudStatus("error","Sin conexión · usando caché local");
    }
  }

  function stripAssetsFromDocuments(documents){
    const cleaned={};
    Object.entries(documents||{}).forEach(([key,value])=>{
      const item={...(value||{})};
      delete item.assets;
      cleaned[key]=item;
    });
    return cleaned;
  }

  function loadState(){
    try{
      const current=localStorage.getItem(STORAGE_KEY);
      if(current) return normalizeState(JSON.parse(current));
      for(const key of LEGACY_KEYS){
        const raw=localStorage.getItem(key);
        if(raw) return normalizeState(JSON.parse(raw));
      }
    }catch(e){
      console.warn("No se pudo leer el estado local de DOC-TIT.",e);
    }
    return clone(defaultState);
  }

  function normalizeState(parsed){
    const base=clone(defaultState);
    const merged={...base,...(parsed||{})};
    merged.periods=Array.isArray(parsed?.periods)?parsed.periods.slice():base.periods.slice();
    base.periods.forEach(dp=>{ if(!merged.periods.some(p=>p.id===dp.id)) merged.periods.unshift(dp); });
    if(!merged.periods.some(p=>p.id===merged.activePeriodId)) merged.activePeriodId=base.activePeriodId;

    merged.institutional=clone(base.institutional);

    const originalDocuments=clone(parsed?.documents||{});
    pendingLegacyAssets=[];
    Object.entries(originalDocuments).forEach(([key,item])=>{
      if(item?.assets && Object.keys(item.assets).length){
        pendingLegacyAssets.push({key,assets:item.assets});
      }
    });
    merged.documents=stripAssetsFromDocuments(originalDocuments);
    return merged;
  }

  function serializableState(){
    return {
      ...state,
      documents:stripAssetsFromDocuments(state.documents)
    };
  }

  function saveState(){
    const serialized=JSON.stringify(serializableState());
    try{
      localStorage.setItem(STORAGE_KEY,serialized);
    }catch(err){
      if(err?.name==="QuotaExceededError" || /quota/i.test(String(err?.message||""))){
        // Older versions stored Base64 images in localStorage. Remove the oversized
        // record and rewrite only the lightweight document metadata.
        try{
          localStorage.removeItem(STORAGE_KEY);
          LEGACY_KEYS.forEach(key=>localStorage.removeItem(key));
          localStorage.setItem(STORAGE_KEY,serialized);
        }catch(secondErr){
          console.error("No se pudo recuperar el almacenamiento local.",secondErr);
          throw secondErr;
        }
      }else{
        throw err;
      }
    }
  }

  function openAssetDb(){
    return new Promise((resolve,reject)=>{
      if(!("indexedDB" in window)){
        reject(new Error("El navegador no permite guardar imágenes locales."));
        return;
      }
      const request=indexedDB.open(ASSET_DB_NAME,ASSET_DB_VERSION);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(ASSET_STORE)) db.createObjectStore(ASSET_STORE);
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error("No se pudo abrir el almacén de imágenes."));
    });
  }

  async function readAssetsByKey(key){
    if(assetCache.has(key)) return assetCache.get(key);
    const db=await openAssetDb();
    try{
      const value=await new Promise((resolve,reject)=>{
        const tx=db.transaction(ASSET_STORE,"readonly");
        const req=tx.objectStore(ASSET_STORE).get(key);
        req.onsuccess=()=>resolve(req.result||{});
        req.onerror=()=>reject(req.error);
      });
      assetCache.set(key,value||{});
      return value||{};
    }finally{
      db.close();
    }
  }

  async function writeAssetsByKey(key,assets){
    const db=await openAssetDb();
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(ASSET_STORE,"readwrite");
        tx.objectStore(ASSET_STORE).put(assets||{},key);
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
        tx.onabort=()=>reject(tx.error||new Error("No se pudieron guardar las imágenes."));
      });
      assetCache.set(key,assets||{});
    }finally{
      db.close();
    }
  }

  async function migrateLegacyAssets(){
    if(!pendingLegacyAssets.length) return;
    const pending=pendingLegacyAssets.slice();
    pendingLegacyAssets=[];
    for(const item of pending){
      try{
        const existing=await readAssetsByKey(item.key);
        await writeAssetsByKey(item.key,{...item.assets,...existing});
      }catch(err){
        console.warn("No se pudo migrar una imagen antigua a IndexedDB.",err);
      }
    }
  }

  function activePeriod(){ return state.periods.find(p=>p.id===state.activePeriodId)||state.periods[0]; }
  function monthYear(date){
    const d=new Date(date+"T12:00:00");
    return {year:d.getFullYear(),month:String(d.getMonth()+1).padStart(2,"0")};
  }
  function documentCode(doc,period){
    // El RGI conserva literalmente el código documental asignado; el período no forma parte del código.
    return `${doc.prefix}${doc.sequence}-${doc.process}`;
  }
  function docStoreKey(docId){ return `${state.activePeriodId}::${docId}`; }
  function getDocData(docId){ return state.documents[docStoreKey(docId)]||{}; }
  function getCachedAssets(docId){ return assetCache.get(docStoreKey(docId))||{}; }
  async function loadAssetsForDoc(docId){
    const storageKey=docStoreKey(docId);
    if(cloudReady){
      try{
        const assets=await window.DocTitCloud.loadAssets(state.activePeriodId,docId);
        assetCache.set(storageKey,assets);
        try{ await writeAssetsByKey(storageKey,assets); }catch(e){}
        return assets;
      }catch(err){
        console.warn("No se pudieron descargar las imágenes desde Supabase.",err);
      }
    }
    return readAssetsByKey(storageKey);
  }

  function setDocData(docId,data){
    const safe={...(data||{})};
    delete safe.assets;
    state.documents[docStoreKey(docId)]={...getDocData(docId),...safe};
    saveState();
    queueDocumentSync(docId);
  }

  function allDocumentCount(){ return Object.values(catalog).reduce((sum,p)=>sum+p.documents.length,0); }
  function periodDocumentData(){
    const prefix=state.activePeriodId+"::";
    return Object.entries(state.documents).filter(([k])=>k.startsWith(prefix)).map(([,d])=>d);
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
    [els.dashboardView,els.documentView].forEach(v=>v.classList.remove("active"));
    view.classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  async function openDocument(procCode,docId){
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
    showView(els.documentView);
    renderAssetPreviews({});
    try{
      await loadAssetsForDoc(doc.id);
    }catch(err){
      console.warn("No se pudieron cargar las imágenes guardadas.",err);
    }
    renderDocumentForm(doc);
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
    renderAssetPreviews(getCachedAssets(doc.id));
    $("#smartTextInput").value=saved.smartText||"";
    renderSmartAnalysis(saved.analysis||null);
    renderGenerationStatus(saved);
    updateProgress();
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

  function renderAssetPreviews(assets){
    const configs=[
      ["logoPreview","logo","Sin imagen"],
      ["introImagePreview","introImage","Opcional"],
      ["methodologyImagePreview","methodologyImage","Opcional"],
      ["requirementsImagePreview","requirementsImage","Opcional"],
      ["examImagePreview","examImage","Opcional"],
      ["seminarsImagePreview","seminarsImage","Opcional"],
      ["evaluationImagePreview","evaluationImage","Opcional"]
    ];

    configs.forEach(([previewId,key,emptyText])=>{
      const el=$("#"+previewId);
      if(!el) return;
      el.innerHTML=assets[key]
        ? `<img src="${assets[key]}" alt="Imagen cargada">`
        : `<span>${emptyText}</span>`;
    });
  }

  async function storeAssetImage(key,file){
    if(!activeDocument||!file) return;

    try{
      const isLogo=key==="logo";
      const dataUrl=await window.DocTitFullDocument.resizeImage(
        file,
        isLogo?900:1400,
        isLogo?320:800
      );

      const storageKey=docStoreKey(activeDocument.id);
      const current={...(assetCache.get(storageKey)||{})};
      current[key]=dataUrl;
      assetCache.set(storageKey,current);

      // Caché local de respaldo.
      try{ await writeAssetsByKey(storageKey,current); }catch(e){}

      renderAssetPreviews(current);
      updateProgress();

      if(cloudReady){
        await window.DocTitCloud.uploadAsset({
          periodKey:state.activePeriodId,
          documentKey:activeDocument.id,
          assetKey:key,
          dataUrl,
          fileName:file.name
        });
        setCloudStatus("connected","Imagen guardada en Supabase");
      }else{
        setCloudStatus("error","Imagen en caché · Supabase sin conexión");
      }
    }catch(err){
      console.error(err);
      setCloudStatus("error","Error al guardar imagen");
      alert(err.message||"No se pudo guardar la imagen.");
    }
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
      ["Versión","1.0"],
      ["Elaborado por",`${state.institutional.preparedBy} · ${state.institutional.preparedRole}`],
      ["Revisado por",`${state.institutional.reviewedBy} · ${state.institutional.reviewedRole}`],
      ["Aprobado por",`${state.institutional.approvedBy} · ${state.institutional.approvedRole}`]
    ];
    $("#automaticData").innerHTML=data.map(([k,v])=>`<div class="auto-row"><span>${k}</span><strong>${escapeHtml(v)}</strong></div>`).join("");
  }

  function scheduleComplete(schedule){
    return schedule.length===SCHEDULE_ACTIVITIES.length&&schedule.every(r=>r.start&&r.end);
  }
  function distributionComplete(rows){
    return rows.length>0&&rows.every(r=>r.career&&r.place&&r.count!==""&&Number(r.count)>=0);
  }

  function updateProgress(){
    if(!activeDocument) return;
    const scheduleOk=scheduleComplete(collectSchedule());
    const distributionOk=distributionComplete(collectDistribution());
    const assets=getCachedAssets(activeDocument.id);
    const logoOk=!!assets.logo;

    const setReq=(id,ok)=>{
      const row=document.querySelector('[data-req="'+id+'"]');
      if(!row) return;
      row.classList.toggle("done",ok);
      const icon=row.querySelector(".req-icon");
      if(icon) icon.textContent=ok?"✓":"○";
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

  function splitSentences(text){
    return String(text||"")
      .replace(/\r/g,"\n")
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s=>s.trim())
      .filter(Boolean);
  }

  function keywordScore(sentence,words){
    const n=normalize(sentence);
    return words.reduce((score,w)=>score+(n.includes(normalize(w))?1:0),0);
  }

  function analyzeSmartText(text){
    const sentences=splitSentences(text);
    const sections={general:[],metodologia:[],requisitos:[],logistica:[],evaluacion:[],cronograma:[]};
    const dictionaries={
      metodologia:["metodología","inducción","núcleo","seminario","preparación","capacitación","acompañamiento"],
      requisitos:["requisito","documento","cédula","pago","financiero","vinculación","prácticas","idioma","inglés","malla","secretaría"],
      logistica:["laboratorio","aula","sede","norte","sur","manta","software","equipo","computador","distribución","online"],
      evaluacion:["examen","pregunta","duración","minutos","hora","teórico","práctico","nota","ponderación","calificación","tribunal","supletorio"],
      cronograma:["fecha","día","semana","cronograma","inicio","fin","octubre","noviembre","septiembre","agosto","julio","junio","mayo","abril"]
    };

    sentences.forEach(s=>{
      let best="general",max=0;
      Object.entries(dictionaries).forEach(([key,words])=>{
        const score=keywordScore(s,words);
        if(score>max){max=score;best=key;}
      });
      sections[best].push(s);
    });

    const dates=[...new Set((text.match(/\b(?:0?[1-9]|[12]\d|3[01])[\/\-.](?:0?[1-9]|1[0-2])[\/\-.](?:20\d{2})\b/g)||[]))];
    const places=["Norte","Sur","Manta"].filter(p=>new RegExp("\\b"+p+"\\b","i").test(text));
    const quantities=[...new Set((text.match(/\b\d+\s*(?:estudiantes?|preguntas?|minutos?|horas?)\b/gi)||[]).map(x=>x.trim()))];

    const warnings=[];
    const scheduleDates=new Set();
    collectSchedule().forEach(r=>{
      [r.start,r.end].filter(Boolean).forEach(v=>{
        const d=new Date(v+"T12:00:00");
        scheduleDates.add(new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d));
      });
    });
    const extraDates=dates.filter(d=>{
      const parts=d.split(/[\/\-.]/);
      const normalized=[parts[0].padStart(2,"0"),parts[1].padStart(2,"0"),parts[2]].join("/");
      return !scheduleDates.has(normalized);
    });
    if(extraDates.length) warnings.push("Se detectaron fechas adicionales que no constan en el cronograma: "+extraDates.join(", ")+".");
    if(/firma|qr/i.test(text)) warnings.push("Las firmas no se cargan como imagen: el PDF mantiene espacios en blanco para firma al final.");

    const detectedSections=Object.entries(sections).filter(([,arr])=>arr.length).map(([k])=>k);
    return {
      sourceText:text,
      analyzedAt:new Date().toISOString(),
      sections,
      dates,
      places,
      quantities,
      warnings,
      detectedSections
    };
  }

  function renderSmartAnalysis(analysis){
    const box=$("#smartAnalysisResult");
    if(!box) return;
    if(!analysis){
      box.className="smart-analysis empty";
      box.innerHTML="<strong>Análisis inteligente</strong><p>Escribe información y pulsa “Analizar información”.</p>";
      return;
    }

    const labels={
      general:"Contexto general",
      metodologia:"Metodología / preparación",
      requisitos:"Requisitos",
      logistica:"Logística / sedes",
      evaluacion:"Evaluación",
      cronograma:"Cronograma"
    };
    const sections=Object.entries(analysis.sections||{}).filter(([,arr])=>arr&&arr.length);
    const chips=[];
    if(analysis.dates?.length) chips.push(`<span>${analysis.dates.length} fecha(s)</span>`);
    if(analysis.places?.length) chips.push(`<span>${analysis.places.join(" · ")}</span>`);
    if(analysis.quantities?.length) chips.push(`<span>${analysis.quantities.length} dato(s) numérico(s)</span>`);

    box.className="smart-analysis";
    box.innerHTML=`
      <div class="smart-analysis-head">
        <div><strong>Información analizada</strong><small>Se distribuirá automáticamente en el PDF.</small></div>
        <span class="analysis-ok">✓ Analizado</span>
      </div>
      ${chips.length?`<div class="analysis-chips">${chips.join("")}</div>`:""}
      <div class="analysis-sections">
        ${sections.map(([key,arr])=>`<div><b>${labels[key]||key}</b><span>${arr.length} idea(s) detectada(s)</span></div>`).join("")}
      </div>
      ${analysis.warnings?.length?`<div class="analysis-warnings">${analysis.warnings.map(w=>`<p>⚠ ${escapeHtml(w)}</p>`).join("")}</div>`:""}
    `;
  }

  function runSmartAnalysis(showMessage=true){
    if(!activeDocument) return null;
    const text=$("#smartTextInput").value.trim();
    if(!text){
      setDocData(activeDocument.id,{smartText:"",analysis:null});
      renderSmartAnalysis(null);
      if(showMessage) alert("Escribe información adicional antes de analizar.");
      return null;
    }
    const analysis=analyzeSmartText(text);
    setDocData(activeDocument.id,{smartText:text,analysis});
    renderSmartAnalysis(analysis);
    if(showMessage) {
      const count=analysis.detectedSections.length;
      $("#smartAnalysisResult").scrollIntoView({behavior:"smooth",block:"nearest"});
    }
    return analysis;
  }

  function collectDocumentData(){
    const saved=activeDocument?getDocData(activeDocument.id):{};
    const smartText=$("#smartTextInput")?.value.trim()||"";
    let analysis=saved.analysis||null;
    if(smartText && (!analysis || analysis.sourceText!==smartText)) analysis=analyzeSmartText(smartText);
    if(!smartText) analysis=null;
    return {
      schedule:collectSchedule(),
      distribution:collectDistribution(),
      assets:activeDocument?getCachedAssets(activeDocument.id):{},
      smartText,
      analysis
    };
  }

  async function saveDraft(){
    if(!activeDocument) return;

    const data=collectDocumentData();
    const complete=scheduleComplete(data.schedule)&&distributionComplete(data.distribution)&&!!data.assets.logo;
    setDocData(activeDocument.id,{...data,complete});
    renderSmartAnalysis(data.analysis);
    renderPeriods();
    updateProgress();
    renderGenerationStatus(getDocData(activeDocument.id));

    if(cloudReady){
      try{
        await syncDocumentToCloud(activeDocument.id);
        setCloudStatus("connected","Borrador guardado en Supabase");
        alert("Borrador guardado.");
      }catch(err){
        console.error(err);
        setCloudStatus("error","Borrador en caché · error de sincronización");
        alert("Borrador guardado localmente. No se pudo sincronizar con Supabase.");
      }
    }else{
      alert("Borrador guardado localmente. Se sincronizará cuando Supabase esté disponible.");
    }
  }

  function renderGenerationStatus(saved){
    const box=$("#generationStatus");
    if(!box) return;
    if(saved?.generatedAt && saved?.generatedFileName){
      box.classList.remove("hidden","working","error");
      box.classList.add("success");
      box.innerHTML=`<strong>Último PDF generado</strong><span>${escapeHtml(saved.generatedFileName)}${saved.generatedPages?` · ${saved.generatedPages} páginas`:""}</span>`;
    }else{
      box.className="generation-status hidden";
      box.innerHTML="";
    }
  }

  function validateGenerationData(data){
    const errors=[];
    const warnings=[];
    if(!scheduleComplete(data.schedule)) errors.push("Completa las fechas de las 9 actividades del cronograma.");
    if(!distributionComplete(data.distribution)) errors.push("Completa Carrera, Lugar y Cantidad en todas las filas utilizadas.");
    if(!data.assets.logo) errors.push("Sube el logo institucional.");
    (data.schedule||[]).forEach(r=>{if(r.start&&r.end&&r.start>r.end)errors.push("La fecha de inicio no puede ser posterior a la fecha fin en: "+r.activity+".");});
    const scheduled=(data.schedule||[]).filter(r=>r.start);
    for(let i=1;i<scheduled.length;i++){
      if(scheduled[i].start<scheduled[i-1].start){errors.push("El cronograma debe mantener las actividades en orden cronológico.");break;}
    }
    const total=(data.distribution||[]).reduce((sum,r)=>sum+(Number(r.count)||0),0);
    if(total<=0)errors.push("El total de estudiantes debe ser mayor que cero.");
    const ev=window.DOC_TIT_COMPLEXIVO_PDF?.config?.policy?.evaluation||{};
    if(Number(ev.theoreticalWeight)+Number(ev.practicalWeight)!==100)errors.push("La ponderación teórica y práctica debe sumar 100 %.");
    const period=activePeriod();
    if((data.schedule||[]).some(r=>r.end&&period?.end&&r.end>period.end))warnings.push("Existen actividades posteriores al fin nominal del período; el PDF incluirá la aclaración correspondiente.");
    return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
  }

  async function generatePdf(){
    const data=collectDocumentData();
    const validation=validateGenerationData(data);
    if(validation.errors.length){alert("No se puede generar el PDF:\n\n- "+validation.errors.join("\n- "));return;}
    if(validation.warnings.length)console.warn("Validaciones DOC-TIT:",validation.warnings);

    const button=$("#generateBtn");
    const status=$("#generationStatus");
    const oldText=button.textContent;
    button.disabled=true;
    button.textContent="Generando PDF…";
    status.className="generation-status working";
    status.innerHTML="<strong>Generando documento completo</strong><span>Organizando contenido, índice, APA 7, cabeceras y firmas…</span>";

    try{
      const p=activePeriod();
      const doc=activeDocument;
      const code=documentCode(doc,p);
      const title=doc.fileTitle||doc.name;
      const fileName=`${code} - ${title}.pdf`;

      const result=await window.DocTitFullDocument.generateAndDownload({
        period:p,
        doc,
        schedule:data.schedule,
        distribution:data.distribution,
        assets:data.assets,
        analysis:data.analysis,
        institutional:state.institutional,
        meta:{version:doc.version||window.DOC_TIT_COMPLEXIVO_PDF?.config?.policy?.version||"1.0",elaborationDate:new Date().toISOString().slice(0,10)},
        code
      },fileName);

      const generatedAt=new Date().toISOString();

      setDocData(activeDocument.id,{
        ...data,
        generatedAt,
        generatedFileName:fileName,
        generatedPages:result.pages,
        complete:true
      });

      let cloudSaved=false;
      if(cloudReady){
        try{
          if(result.blob){
            await window.DocTitCloud.uploadGeneratedPdf({
              periodKey:state.activePeriodId,
              documentKey:activeDocument.id,
              fileName,
              blob:result.blob
            });
          }
          await syncDocumentToCloud(activeDocument.id);
          cloudSaved=true;
          setCloudStatus("connected","PDF guardado en Supabase");
        }catch(cloudErr){
          console.error("El PDF se generó, pero no pudo sincronizarse.",cloudErr);
          setCloudStatus("error","PDF descargado · pendiente de sincronizar");
        }
      }

      renderPeriods();
      renderSmartAnalysis(data.analysis);
      status.className="generation-status success";
      status.innerHTML=cloudSaved
        ? `<strong>PDF descargado y guardado</strong><span>${escapeHtml(fileName)} · ${result.pages} páginas · Supabase</span>`
        : `<strong>PDF descargado</strong><span>${escapeHtml(fileName)} · ${result.pages} páginas</span>`;
    }catch(err){
      console.error(err);
      status.className="generation-status error";
      status.innerHTML=`<strong>No se pudo generar</strong><span>${escapeHtml(err.message||String(err))}</span>`;
      alert("No se pudo generar el PDF: "+(err.message||err));
    }finally{
      button.disabled=false;
      button.textContent=oldText;
    }
  }

  function formatDate(v){
    if(!v) return "—";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"long",year:"numeric"}).format(d);
  }

  function escapeHtml(v){
    return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  }
  function escapeAttr(v){ return escapeHtml(v); }

  function populateMonthSelectors(){
    const options=MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("");
    $("#startMonth").innerHTML=options;
    $("#endMonth").innerHTML=options;
  }
  function getYearValue(id){ return Number($("#"+id).dataset.value); }
  function setYearValue(id,value){
    const safe=Math.min(2100,Math.max(2000,Number(value)));
    const out=$("#"+id);
    out.dataset.value=String(safe);
    out.textContent=String(safe);
  }
  function monthIndexFromDate(date){ return new Date(date+"T12:00:00").getMonth()+1; }
  function yearFromDate(date){ return new Date(date+"T12:00:00").getFullYear(); }

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
  function lastDayOfMonth(year,month){ return new Date(year,month,0).getDate(); }

  async function createPeriod(){
    if(!updatePeriodPreview()) return;
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
    saveState();

    if(cloudReady){
      try{
        await syncPeriodToCloud(state.periods.find(p=>p.id===state.activePeriodId));
        setCloudStatus("connected","Período guardado en Supabase");
      }catch(err){
        console.error(err);
        setCloudStatus("error","Error al guardar período");
        alert("El período quedó en caché local, pero no pudo guardarse en la base de datos.");
      }
    }

    renderAll();
    els.periodDialog.close();
  }

  function exportBackup(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`doc-tit-respaldo-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function restoreBackup(file){
    const reader=new FileReader();
    reader.onload=async ()=>{
      try{
        const parsed=JSON.parse(reader.result);
        if(!parsed.periods) throw new Error();
        state=normalizeState(parsed);
        saveState();
        renderAll();

        if(cloudReady){
          try{
            await pushCurrentWorkspaceToCloud();
            setCloudStatus("connected","Respaldo restaurado y sincronizado");
          }catch(err){
            console.error(err);
            setCloudStatus("error","Respaldo local · error de sincronización");
          }
        }

        alert("Respaldo restaurado.");
      }catch{
        alert("El archivo no corresponde a un respaldo válido de DOC-TIT.");
      }
    };
    reader.readAsText(file);
  }

  function renderAll(){
    renderPeriods();
    renderMenus();
    showView(els.dashboardView);
    $("#screenTitle").textContent="Gestión documental";
  }

  populateMonthSelectors();

  els.periodSelect.addEventListener("change",e=>{
    state.activePeriodId=e.target.value;
    saveState();
    renderAll();
  });
  $("#newPeriodBtn").addEventListener("click",openPeriodDialog);
  document.querySelectorAll("[data-year-target]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.dataset.yearTarget;
    setYearValue(id,getYearValue(id)+Number(btn.dataset.delta));
    updatePeriodPreview();
  }));
  $("#startMonth").addEventListener("change",updatePeriodPreview);
  $("#endMonth").addEventListener("change",updatePeriodPreview);
  $("#createPeriodBtn").addEventListener("click",async e=>{e.preventDefault();await createPeriod();});
  $("#backBtn").addEventListener("click",()=>{
    showView(els.dashboardView);
    $("#screenTitle").textContent="Gestión documental";
  });
  $("#addDistributionRowBtn").addEventListener("click",()=>{
    $("#distributionBody").insertAdjacentHTML("beforeend",distributionRowHtml());
    bindRemoveButtons();
    updateDistributionTotals();
    updateProgress();
  });
  els.documentForm.addEventListener("input",e=>{
    if(e.target.matches(".dist-count,.dist-place,.dist-career")) updateDistributionTotals();
    if(e.target.id==="smartTextInput"){
      const saved=getDocData(activeDocument.id);
      if(saved.analysis && saved.analysis.sourceText!==e.target.value.trim()){
        renderSmartAnalysis(null);
      }
    }
    updateProgress();
  });
  [
    ["logoUpload","logo"],
    ["introImageUpload","introImage"],
    ["methodologyImageUpload","methodologyImage"],
    ["requirementsImageUpload","requirementsImage"],
    ["examImageUpload","examImage"],
    ["seminarsImageUpload","seminarsImage"],
    ["evaluationImageUpload","evaluationImage"]
  ].forEach(([inputId,key])=>{
    $("#"+inputId)?.addEventListener("change",e=>{
      const file=e.target.files&&e.target.files[0];
      if(file) storeAssetImage(key,file);
      e.target.value="";
    });
  });
  $("#analyzeTextBtn")?.addEventListener("click",()=>runSmartAnalysis(true));
  $("#saveDraftBtn").addEventListener("click",saveDraft);
  els.documentForm.addEventListener("submit",e=>{
    e.preventDefault();
    generatePdf();
  });
  $("#backupBtn").addEventListener("click",exportBackup);
  $("#restoreInput").addEventListener("change",e=>{
    if(e.target.files[0]) restoreBackup(e.target.files[0]);
  });


  try{
    saveState();
  }catch(err){
    console.error("No se pudo compactar el almacenamiento local de DOC-TIT.",err);
  }
  migrateLegacyAssets().catch(err=>console.warn("Migración de imágenes incompleta.",err));
  renderAll();
  initCloud();
})();