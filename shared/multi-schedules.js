(() => {
  "use strict";

  const nav = document.querySelector("[data-doc-tit-navigation]");
  const documentId = nav?.dataset.activeDocument || "";
  if (!documentId) return;

  const SUPABASE_URL = "https://pxlokuzauwrnvnjaahjq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gTZSuLEoeqjnEzZZGj-zmg_zRiIbJpi";
  const GATEWAY = SUPABASE_URL + "/functions/v1/doc-tit-sync";
  const CACHE_PREFIX = "doc-tit-multi-schedules-v1";
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const norm = v => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const slug = v => norm(v).replace(/\s+/g,"-").replace(/^-+|-+$/g,"") || "cronograma";

  let schedules = [];
  let selectedKey = "";
  let pendingImport = null;
  let replacingKey = "";
  let refreshTimer = null;

  function periodKey(){return $("#periodSelect")?.value || "";}
  function cacheKey(){return `${CACHE_PREFIX}::${periodKey()}::${documentId}`;}
  function activeSection(){return document.documentElement.dataset.docTitSection || "information";}
  function scheduleSection(){return window.DOC_TIT_SECTION_MANIFEST?.[documentId]?.templateSections?.cronograma || "information";}

  function emitChanged(){
    window.dispatchEvent(new CustomEvent("doc-tit:schedules-changed", {detail:{documentId,periodKey:periodKey(),count:schedules.length,schedules:getSchedules()}}));
  }
  function getSchedules(){return schedules.map(item=>({...item,rows:(item.rows||[]).map(row=>({...row}))}));}
  function saveLocal(){
    try{localStorage.setItem(cacheKey(),JSON.stringify({schedules,selectedKey,updatedAt:new Date().toISOString()}));}catch(_){}
  }
  function loadLocal(){
    try{
      const raw=JSON.parse(localStorage.getItem(cacheKey())||"null");
      schedules=Array.isArray(raw?.schedules)?raw.schedules:[];
      selectedKey=raw?.selectedKey||schedules[0]?.schedule_key||"";
    }catch(_){schedules=[];selectedKey="";}
  }
  async function gateway(action,input={}){
    const res=await fetch(GATEWAY,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify({action,input})});
    let body=null;try{body=await res.json();}catch(_){}
    if(!res.ok||!body?.ok)throw new Error(body?.error||`No se pudo sincronizar (${res.status}).`);
    return body.data;
  }
  async function loadCloud(){
    if(navigator.onLine===false)return false;
    try{
      const rows=await gateway("loadSchedules",{periodKey:periodKey(),documentKey:documentId});
      if(Array.isArray(rows)){
        schedules=rows.map(row=>({schedule_key:row.schedule_key,name:row.name,rows:Array.isArray(row.rows)?row.rows:[],source_file_name:row.source_file_name||"",status:row.status||"Cargado",updated_at:row.updated_at||null}));
        if(!schedules.some(x=>x.schedule_key===selectedKey))selectedKey=schedules[0]?.schedule_key||"";
        saveLocal();
      }
      return true;
    }catch(error){console.warn("DOC-TIT cronogramas: modo local",error);return false;}
  }
  async function upsertCloud(item){
    if(navigator.onLine===false)return false;
    await gateway("upsertSchedule",{schedule:{periodKey:periodKey(),documentKey:documentId,scheduleKey:item.schedule_key,name:item.name,rows:item.rows,sourceFileName:item.source_file_name||"",status:item.status||"Cargado"}});
    return true;
  }
  async function deleteCloud(key){
    if(navigator.onLine===false)return false;
    await gateway("deleteSchedule",{periodKey:periodKey(),documentKey:documentId,scheduleKey:key});
    return true;
  }

  function ensureXlsx(){
    if(window.XLSX)return Promise.resolve(window.XLSX);
    return new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.onload=()=>resolve(window.XLSX);script.onerror=()=>reject(new Error("No se pudo cargar el lector de Excel."));
      document.head.appendChild(script);
    });
  }
  function excelDate(value,X){
    if(value instanceof Date&&!Number.isNaN(value.getTime()))return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`;
    if(typeof value==="number"&&Number.isFinite(value)){
      const p=X.SSF?.parse_date_code?.(value);if(p)return `${p.y}-${String(p.m).padStart(2,"0")}-${String(p.d).padStart(2,"0")}`;
    }
    const raw=String(value??"").trim();if(!raw)return"";
    let m=raw.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);if(m)return `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;
    m=raw.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);if(m)return `${m[3]}-${String(m[2]).padStart(2,"0")}-${String(m[1]).padStart(2,"0")}`;
    return"";
  }
  function guessName(fileName){
    let base=String(fileName||"").replace(/\.[^.]+$/," ").trim();
    const p=periodKey();if(p)base=base.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i")," ");
    base=base.replace(/doc[-_ ]?tit/ig," ").replace(/articulo[_ -]?academico/ig," ").replace(/trabajo[_ -]?de[_ -]?titulacion/ig," ").replace(/examen[_ -]?complexivo/ig," ").replace(/cronograma/ig," ").replace(/completo/ig," ").replace(/[()_\-]+/g," ").replace(/\s+/g," ").trim();
    if(!base)return `Cronograma ${schedules.length+1}`;
    return base.replace(/\b\w/g,c=>c.toUpperCase());
  }
  function findHeader(grid){
    for(let i=0;i<Math.min(grid.length,40);i++){
      const row=(grid[i]||[]).map(norm);
      const activity=row.findIndex(v=>v==="actividad"||v.includes("actividad"));
      const start=row.findIndex(v=>v.includes("fecha inicio")||v==="inicio");
      const end=row.findIndex(v=>v.includes("fecha fin")||v==="fin");
      const responsible=row.findIndex(v=>v.includes("responsable")||v.includes("rol unidad"));
      if(activity>=0&&start>=0&&end>=0)return {index:i,activity,start,end,responsible};
    }
    return null;
  }
  async function parseWorkbook(file){
    const X=await ensureXlsx();
    const wb=X.read(await file.arrayBuffer(),{type:"array",cellDates:true});
    const sheetName=wb.SheetNames.find(n=>norm(n)==="datos")||wb.SheetNames.find(n=>norm(n).includes("cronograma"))||wb.SheetNames[0];
    const sheet=wb.Sheets[sheetName];
    const grid=sheet?X.utils.sheet_to_json(sheet,{header:1,defval:"",raw:true}):[];
    const errors=[];
    if(!grid.length)return {rows:[],errors:["El archivo no contiene datos de cronograma."],sheetName};
    const header=findHeader(grid);
    if(!header)return {rows:[],errors:["No se encontró el encabezado Actividad · Fecha inicio · Fecha fin."],sheetName};
    const rows=[];let phase="";
    for(let i=header.index+1;i<grid.length;i++){
      const row=grid[i]||[];
      const a=String(row[header.activity]??"").trim();
      const rawStart=row[header.start],rawEnd=row[header.end];
      if(!a&&!String(rawStart??"").trim()&&!String(rawEnd??"").trim())continue;
      if(/^fase\s*\d*\s*:/i.test(a)){phase=a;continue;}
      if(norm(a)==="actividad"||/^ejemplo\s*:/i.test(a))continue;
      if(!a){errors.push(`Fila ${i+1}: falta la actividad.`);continue;}
      const start=excelDate(rawStart,X),end=excelDate(rawEnd,X);
      if(!start||!end){errors.push(`Fila ${i+1}: usa fechas válidas en inicio y fin.`);continue;}
      if(end<start){errors.push(`Fila ${i+1}: la fecha fin no puede ser anterior al inicio.`);continue;}
      rows.push({activity:a,responsible:header.responsible>=0?String(row[header.responsible]??"").trim():"",start,end,phase});
    }
    if(!rows.length&&!errors.length)errors.push("No se encontraron actividades para importar.");
    return {rows,errors,sheetName};
  }

  function ensureModal(){
    let dialog=$("#multiScheduleImport");if(dialog)return dialog;
    dialog=document.createElement("dialog");dialog.id="multiScheduleImport";
    dialog.innerHTML=`<div class="ms-modal"><div class="ms-modal-head"><div><h2>Agregar cronograma</h2><p>Puedes cargar varios cronogramas dentro del mismo período. Cada uno se guarda por separado.</p></div><button type="button" class="ms-x">×</button></div><label class="ms-field"><span>Nombre del cronograma</span><input id="multiScheduleName" type="text" placeholder="Ej. Universitarios, Superiores"></label><label class="ms-file"><input id="multiScheduleFile" type="file" accept=".xlsx,.xls"><span>Selecciona el Excel del cronograma</span></label><div class="ms-status" id="multiScheduleStatus">Selecciona un archivo.</div><div class="ms-preview" id="multiSchedulePreview" hidden></div><div class="ms-modal-actions"><button type="button" class="ms-cancel">Cancelar</button><button type="button" class="ms-save" disabled>Guardar cronograma</button></div></div>`;
    document.body.appendChild(dialog);
    $(".ms-x",dialog).onclick=()=>dialog.close();$(".ms-cancel",dialog).onclick=()=>dialog.close();
    $("#multiScheduleFile",dialog).onchange=async e=>{
      const file=e.target.files?.[0],name=$("#multiScheduleName",dialog),status=$("#multiScheduleStatus",dialog),preview=$("#multiSchedulePreview",dialog),save=$(".ms-save",dialog);
      pendingImport=null;preview.hidden=true;preview.innerHTML="";save.disabled=true;
      if(!file){status.className="ms-status";status.textContent="Selecciona un archivo.";return;}
      if(!name.value.trim())name.value=guessName(file.name);
      status.className="ms-status";status.textContent="Leyendo cronograma…";
      try{
        const parsed=await parseWorkbook(file);pendingImport={...parsed,fileName:file.name};
        if(parsed.errors.length){status.className="ms-status bad";status.innerHTML=parsed.errors.map(esc).join("<br>");return;}
        status.className="ms-status ok";status.textContent=`${parsed.rows.length} actividades reconocidas.`;
        let html='<table><thead><tr><th>Actividad</th><th>Responsable</th><th>Inicio</th><th>Fin</th></tr></thead><tbody>';
        parsed.rows.slice(0,80).forEach(r=>{html+=`<tr><td>${esc(r.activity)}</td><td>${esc(r.responsible)}</td><td>${esc(r.start)}</td><td>${esc(r.end)}</td></tr>`;});
        preview.innerHTML=html+"</tbody></table>";preview.hidden=false;save.disabled=false;
      }catch(error){status.className="ms-status bad";status.textContent=error?.message||"No se pudo leer el archivo.";}
    };
    $(".ms-save",dialog).onclick=()=>saveImport(dialog);
    return dialog;
  }
  function openImport(existingKey=""){
    const dialog=ensureModal();replacingKey=existingKey;pendingImport=null;
    const existing=schedules.find(s=>s.schedule_key===existingKey);
    $(".ms-modal-head h2",dialog).textContent=existing?"Reemplazar cronograma":"Agregar cronograma";
    $("#multiScheduleName",dialog).value=existing?.name||"";
    $("#multiScheduleFile",dialog).value="";
    $("#multiScheduleStatus",dialog).className="ms-status";$("#multiScheduleStatus",dialog).textContent="Selecciona un archivo.";
    $("#multiSchedulePreview",dialog).hidden=true;$("#multiSchedulePreview",dialog).innerHTML="";$(".ms-save",dialog).disabled=true;
    dialog.showModal();
  }
  async function saveImport(dialog){
    if(!pendingImport||pendingImport.errors.length||!pendingImport.rows.length)return;
    const name=$("#multiScheduleName",dialog).value.trim();
    if(!name){$("#multiScheduleStatus",dialog).className="ms-status bad";$("#multiScheduleStatus",dialog).textContent="Escribe un nombre para distinguir este cronograma.";return;}
    let key=replacingKey||slug(name);
    if(!replacingKey){let base=key,n=2;while(schedules.some(s=>s.schedule_key===key)){key=`${base}-${n++}`;}}
    const item={schedule_key:key,name,rows:pendingImport.rows,source_file_name:pendingImport.fileName,status:"Cargado",updated_at:new Date().toISOString()};
    const idx=schedules.findIndex(s=>s.schedule_key===key);if(idx>=0)schedules[idx]=item;else schedules.push(item);
    selectedKey=key;saveLocal();render();bridgeToLegacy(item);emitChanged();dialog.close();
    try{await upsertCloud(item);setSyncMessage("Cronograma sincronizado");}catch(error){console.warn(error);setSyncMessage("Cronograma guardado localmente",true);}
    pendingImport=null;replacingKey="";
  }

  function ensureViewModal(){
    let dialog=$("#multiScheduleView");if(dialog)return dialog;
    dialog=document.createElement("dialog");dialog.id="multiScheduleView";
    dialog.innerHTML='<div class="ms-modal"><div class="ms-modal-head"><div><h2></h2><p></p></div><button type="button" class="ms-x">×</button></div><div class="ms-preview"></div><div class="ms-modal-actions"><button type="button" class="ms-cancel">Cerrar</button></div></div>';
    document.body.appendChild(dialog);$(".ms-x",dialog).onclick=()=>dialog.close();$(".ms-cancel",dialog).onclick=()=>dialog.close();return dialog;
  }
  function viewSchedule(item){
    const dialog=ensureViewModal();$("h2",dialog).textContent=item.name;$(".ms-modal-head p",dialog).textContent=`${item.rows.length} actividades · ${item.source_file_name||"Cronograma guardado"}`;
    let html='<table><thead><tr><th>Actividad</th><th>Responsable</th><th>Inicio</th><th>Fin</th></tr></thead><tbody>';
    item.rows.forEach(r=>{html+=`<tr><td>${esc(r.activity)}</td><td>${esc(r.responsible||"")}</td><td>${esc(r.start||"")}</td><td>${esc(r.end||"")}</td></tr>`;});
    $(".ms-preview",dialog).innerHTML=html+"</tbody></table>";dialog.showModal();
  }
  async function downloadSchedule(item){
    const X=await ensureXlsx(),wb=X.utils.book_new();
    const data=[["Actividad","Rol / unidad responsable","Fecha inicio","Fecha fin"],...item.rows.map(r=>[r.activity,r.responsible||"",r.start||"",r.end||""])];
    const ws=X.utils.aoa_to_sheet(data);ws["!cols"]=[{wch:48},{wch:34},{wch:15},{wch:15}];X.utils.book_append_sheet(wb,ws,"CRONOGRAMA");
    X.writeFile(wb,`DOC-TIT_${documentId}_Cronograma_${periodKey()}_${slug(item.name)}.xlsx`);
  }
  async function removeSchedule(item){
    if(!window.confirm(`¿Eliminar el cronograma «${item.name}»?`))return;
    schedules=schedules.filter(s=>s.schedule_key!==item.schedule_key);if(selectedKey===item.schedule_key)selectedKey=schedules[0]?.schedule_key||"";saveLocal();render();emitChanged();
    if(schedules[0])bridgeToLegacy(schedules[0]);
    try{await deleteCloud(item.schedule_key);setSyncMessage("Cronograma eliminado");}catch(error){console.warn(error);setSyncMessage("Se eliminó localmente; falta sincronizar",true);}
  }
  function setSyncMessage(text,error=false){const status=$("#status");if(status){status.textContent=text;status.className="status "+(error?"error":"success");}}

  function setInput(input,value){if(!input)return;if(input.type==="checkbox")input.checked=!!value;else input.value=value??"";input.dispatchEvent(new Event("change",{bubbles:true}));}
  function bridgeToLegacy(item){
    const rows=item?.rows||[];if(!rows.length)return;
    window.setTimeout(()=>{
      const trs=$$("#scheduleBody tr");if(!trs.length)return;
      if(documentId==="trabajo-titulacion"){
        while($$("#scheduleBody tr").length<rows.length)$("#addScheduleBtn")?.click();
        const all=$$("#scheduleBody tr");
        all.forEach((tr,i)=>{const row=rows[i];setInput($("[data-f='activity']",tr),row?.activity||"—");setInput($("[data-f='start']",tr),row?.start||"");setInput($("[data-f='end']",tr),row?.end||"");setInput($("[data-f='deadline']",tr),"");setInput($("[data-f='responsible']",tr),row?.responsible||"");setInput($("[data-f='observation']",tr),row?.phase||"");setInput($("[data-f='active']",tr),!!row);});
        window.setTimeout(()=>$("#approveScheduleBtn")?.click(),100);
      }else if(documentId==="articulo-academico"){
        trs.forEach((tr,i)=>{const row=rows[i%rows.length];setInput($("[data-f='responsible']",tr),row?.responsible||"");setInput($("[data-f='start']",tr),row?.start||"");setInput($("[data-f='end']",tr),row?.end||"");});
      }else if(documentId==="complexivo"){
        trs.forEach((tr,i)=>{const row=rows[i%rows.length];setInput($(".schedule-start",tr),row?.start||"");setInput($(".schedule-end",tr),row?.end||"");});
      }
      window.setTimeout(()=>{$("#saveBtn")?.click();$("#saveDraftBtn")?.click();},160);
    },80);
  }

  function installPdfBridge(){
    const tryInstall=()=>{
      const api=window.DocTitFullDocument;if(!api?.generateAndDownload||api.__multiSchedulesWrapped)return false;
      const original=api.generateAndDownload.bind(api);
      api.generateAndDownload=async(ctx,fileName)=>{
        const sets=getSchedules();
        if(sets.length){
          const flattened=[];
          sets.forEach((set,index)=>{if(index)flattened.push({activity:`— ${set.name} —`,responsible:"",route:"",start:"",end:"",observation:""});set.rows.forEach(row=>flattened.push({...row,route:row.route||set.name,observation:row.observation||row.phase||""}));});
          ctx={...ctx,payload:{...(ctx.payload||{}),scheduleSets:sets,schedule:flattened}};
        }
        return original(ctx,fileName);
      };
      api.__multiSchedulesWrapped=true;return true;
    };
    if(!tryInstall()){let attempts=0;const t=setInterval(()=>{attempts++;if(tryInstall()||attempts>40)clearInterval(t);},100);}
  }

  function hideLegacyCronogramaCard(){$$("#ptcenter .ptcard").forEach(card=>{if($("[data-u='cronograma'],[data-d='cronograma']",card))card.classList.add("ms-legacy-hidden");});}
  function ensurePanel(){let panel=$("#multiSchedulePanel");if(panel)return panel;panel=document.createElement("section");panel.id="multiSchedulePanel";panel.className="ms-panel";return panel;}
  function placePanel(panel){
    const section=activeSection();
    if(section==="information"){
      const ref=$("#referencePendingPanel")||$("#referenceDocumentCard")||$("#referenceView");
      if(ref?.parentElement){if(ref.id==="referencePendingPanel")ref.before(panel);else ref.after(panel);return;}
    }
    if(section===scheduleSection()){const host=$("#referenceView")||$(".main");if(host)host.appendChild(panel);return;}
    panel.hidden=true;
  }
  function render(){
    refreshTimer=null;hideLegacyCronogramaCard();
    const panel=ensurePanel();const section=activeSection();panel.hidden=!(section==="information"||section===scheduleSection());
    let html=`<div class="ms-head"><div><strong>Cronogramas</strong><span>${schedules.length?schedules.length+" cargado"+(schedules.length===1?"":"s"):"Ninguno cargado"}</span></div><div class="ms-head-actions"><button type="button" class="ms-template">Descargar plantilla</button><button type="button" class="ms-add">+ Agregar cronograma</button></div></div>`;
    if(!schedules.length)html+=`<div class="ms-empty"><strong>Falta cargar al menos un cronograma.</strong><span>En un mismo período puedes registrar varios, por ejemplo Superiores y Universitarios.</span></div>`;
    else{html+='<div class="ms-list">';schedules.forEach(item=>{html+=`<article class="ms-item" data-key="${esc(item.schedule_key)}"><div class="ms-main"><div><strong>${esc(item.name)}</strong><span>${item.rows.length} actividades${item.source_file_name?" · "+esc(item.source_file_name):""}</span></div><em>Cargado</em></div><div class="ms-actions"><button type="button" data-act="view">Ver</button><button type="button" data-act="replace">Reemplazar</button><button type="button" data-act="download">Descargar</button><button type="button" data-act="delete" class="danger">Eliminar</button></div></article>`;});html+='</div>';}
    panel.innerHTML=html;placePanel(panel);
    $(".ms-add",panel)?.addEventListener("click",()=>openImport());
    $(".ms-template",panel)?.addEventListener("click",()=>{const source=$$("#ptcenter [data-d='cronograma']").find(b=>!b.disabled);if(source)source.click();else $("#downloadTemplateBtn")?.click();});
    $$(".ms-item",panel).forEach(card=>{const item=schedules.find(s=>s.schedule_key===card.dataset.key);if(!item)return;$("[data-act='view']",card).onclick=()=>viewSchedule(item);$("[data-act='replace']",card).onclick=()=>openImport(item.schedule_key);$("[data-act='download']",card).onclick=()=>downloadSchedule(item);$("[data-act='delete']",card).onclick=()=>removeSchedule(item);});
  }
  function scheduleRender(){if(refreshTimer)return;refreshTimer=setTimeout(render,60);}

  async function reload(){loadLocal();render();emitChanged();const cloud=await loadCloud();if(cloud){render();emitChanged();}if(schedules.length)bridgeToLegacy(schedules.find(s=>s.schedule_key===selectedKey)||schedules[0]);}

  document.addEventListener("doc-tit:section-changed",scheduleRender);
  document.addEventListener("doc-tit:template-applied",scheduleRender);
  $("#periodSelect")?.addEventListener("change",()=>window.setTimeout(reload,80));
  window.addEventListener("online",()=>loadCloud().then(()=>{render();emitChanged();}).catch(()=>{}));
  new MutationObserver(m=>{if(m.every(x=>x.target instanceof Element&&x.target.closest?.("#multiSchedulePanel,#multiScheduleImport,#multiScheduleView")))return;scheduleRender();}).observe(document.body,{childList:true,subtree:true});

  window.DOC_TIT_MULTI_SCHEDULES={getSchedules,hasSchedules:()=>schedules.length>0,openImport,reload,getSelected:()=>schedules.find(s=>s.schedule_key===selectedKey)||schedules[0]||null};
  installPdfBridge();reload();
})();
