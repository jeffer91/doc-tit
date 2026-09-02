(() => {
"use strict";
const CONFIG={"documentKey":"plan-articulo-academico","title":"Planificación De Artículo Académico","shortName":"Articulo_Academico","codePrefix":"UTET-RGI3-01-PRO-56-","requiredTable":null,"schedule":[{"activity":"Inducción general al proceso de titulación","responsible":"UTET / Coordinación de Carrera","route":"Ordinario"},{"activity":"Finalización de clases","responsible":"Coordinación General de Carreras","route":"Ordinario"},{"activity":"Metodología 1","responsible":"Docente designado / UTET","route":"Ordinario"},{"activity":"Metodología 2","responsible":"Docente designado / UTET","route":"Ordinario"},{"activity":"Metodología 3","responsible":"Docente designado / UTET","route":"Ordinario"},{"activity":"Entrega de la interrogante de investigación","responsible":"Estudiante","route":"Ordinario"},{"activity":"Evaluación de la interrogante de investigación","responsible":"Responsable académico designado","route":"Ordinario"},{"activity":"Clase de refuerzo por carreras 1","responsible":"Coordinación de Carrera","route":"Ordinario"},{"activity":"Clase de refuerzo por carreras 2","responsible":"Coordinación de Carrera","route":"Ordinario"},{"activity":"Cumplimiento de requisitos","responsible":"Unidades responsables de validación","route":"Ordinario"},{"activity":"Entrega del artículo académico completo","responsible":"Estudiante","route":"Ordinario"},{"activity":"Evaluación final institucional con revisión antiplagio","responsible":"Comité evaluador institucional","route":"Ordinario"},{"activity":"Defensa oral","responsible":"Tribunal evaluador","route":"Ordinario"},{"activity":"Tutoría extra supletorio","responsible":"Responsable académico designado","route":"Supletorio"},{"activity":"Entrega del artículo académico supletorio","responsible":"Estudiante","route":"Supletorio"},{"activity":"Rúbrica institucional y plagio supletorio","responsible":"Comité evaluador institucional","route":"Supletorio"},{"activity":"Defensa oral supletorio","responsible":"Tribunal evaluador","route":"Supletorio"}],"activityAliases":{"Inducción general al proceso de titulación":["induccion","induccion general"],"Finalización de clases":["fin de clases","finalizacion clases"],"Entrega de la interrogante de investigación":["interrogante","entrega interrogante"],"Evaluación de la interrogante de investigación":["evaluacion interrogante"],"Clase de refuerzo por carreras 1":["refuerzo 1","clase refuerzo 1"],"Clase de refuerzo por carreras 2":["refuerzo 2","clase refuerzo 2"],"Evaluación final institucional con revisión antiplagio":["antiplagio","evaluacion antiplagio","evaluacion final"],"Defensa oral":["defensa","defensa ordinaria"],"Tutoría extra supletorio":["tutoria extra","tutoria supletorio"],"Entrega del artículo académico supletorio":["entrega supletorio","articulo supletorio"],"Rúbrica institucional y plagio supletorio":["rubrica supletorio","antiplagio supletorio"],"Defensa oral supletorio":["defensa supletorio"]},"tables":{"carreras":{"label":"Carreras y estudiantes","title":"Carreras participantes","help":"Registra carrera, modalidad, lugar y cantidad.","sheet":"CARRERAS","sheetAliases":["distribucion"],"requiredFields":["career","count"],"columns":[{"field":"career","label":"Carrera","width":38},{"field":"modality","label":"Modalidad","width":18},{"field":"place","label":"Lugar","aliases":["sede"],"width":16},{"field":"count","label":"Cantidad","aliases":["cant","estudiantes"],"type":"number","width":12}]},"refuerzos":{"label":"Clases de refuerzo","title":"Refuerzos por carrera","help":"Responsable y fechas de refuerzo cuando estén definidos.","sheet":"REFUERZOS","requiredFields":["career"],"columns":[{"field":"career","label":"Carrera","width":34},{"field":"responsible","label":"Responsable","aliases":["docente","profesor"],"width":28},{"field":"start","label":"Fecha inicio","aliases":["inicio"],"type":"date","width":15},{"field":"end","label":"Fecha fin","aliases":["fin"],"type":"date","width":15},{"field":"observations","label":"Observaciones","width":30}]},"evaluacion":{"label":"Evaluación","title":"Parámetros de evaluación","help":"La plantilla inicia con la ponderación del documento base y puede actualizarse si existe disposición vigente.","sheet":"EVALUACION","requiredFields":["component"],"initialRows":[{"component":"Artículo académico","weight":70,"condition":"Evaluación institucional del componente escrito"},{"component":"Defensa oral","weight":30,"condition":"Evaluación del tribunal"}],"columns":[{"field":"component","label":"Componente","width":28},{"field":"weight","label":"Ponderación %","aliases":["peso","porcentaje"],"type":"number","width":15},{"field":"condition","label":"Condición / criterio","aliases":["criterio"],"width":44}]},"defensas":{"label":"Defensas","title":"Defensa ordinaria y supletoria","help":"Registra organización por carrera cuando corresponda.","sheet":"DEFENSAS","requiredFields":["type"],"columns":[{"field":"type","label":"Tipo","aliases":["instancia"],"width":18},{"field":"career","label":"Carrera","width":32},{"field":"start","label":"Fecha inicio","aliases":["inicio"],"type":"date","width":15},{"field":"end","label":"Fecha fin","aliases":["fin"],"type":"date","width":15},{"field":"mode","label":"Modalidad","width":16},{"field":"observations","label":"Observaciones","width":30}]}}}
const MONTHS=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const FALLBACK_PERIODS=[
{id:"2026-04_2026-09",name:"Abril 2026 – Septiembre 2026",start:"2026-04-01",end:"2026-09-30",status:"Activo"},
{id:"2025-10_2026-03",name:"Octubre 2025 – Marzo 2026",start:"2025-10-01",end:"2026-03-31",status:"Cerrado"},
{id:"2025-04_2025-09",name:"Abril 2025 – Septiembre 2025",start:"2025-04-01",end:"2025-09-30",status:"Cerrado"}
];
const STORAGE_KEY="doc-tit-"+CONFIG.documentKey+"-v1";
const ACTIVE_KEY=STORAGE_KEY+"::active";
let periods=FALLBACK_PERIODS.slice();
let activePeriodId=periods[0].id;
let payload=blankPayload();
let assets={};
let pendingImport=null;
let cloudReady=false;

const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const norm=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const slug=v=>norm(v).replace(/\s+/g,"_");
const activePeriod=()=>periods.find(p=>p.id===activePeriodId)||periods[0];

function blankPayload(){
  const tables={};
  Object.entries(CONFIG.tables).forEach(([key,t])=>{tables[key]=(t.initialRows||[]).map(r=>({...r}));});
  return {schedule:CONFIG.schedule.map(a=>{
    const def=typeof a==="string"?{activity:a}:a;
    return {activity:def.activity,responsible:def.responsible||"",description:def.description||"",route:def.route||"",start:"",end:""};
  }),tables,notes:""};
}
function normalizePayloadData(data){
  const base=blankPayload();
  if(!data||typeof data!=="object") return base;

  const existingSchedule=Array.isArray(data.schedule)?data.schedule:[];
  const byActivity=new Map(existingSchedule.map(r=>[norm(r.activity),r]));
  base.schedule=base.schedule.map(def=>{
    const old=byActivity.get(norm(def.activity))||{};
    return {...def,...old,activity:def.activity,responsible:old.responsible||def.responsible||"",description:def.description||old.description||"",route:def.route||old.route||""};
  });

  const tables={...base.tables};
  Object.entries(data.tables||{}).forEach(([key,rows])=>{
    if(Array.isArray(rows)&&rows.length) tables[key]=rows;
  });

  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||""};
}

function code(){
  const p=activePeriod(); const d=new Date(p.start+"T12:00:00");
  return CONFIG.codePrefix+d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
}
function localSave(){
  localStorage.setItem(STORAGE_KEY+"::"+activePeriodId,JSON.stringify(payload));
  localStorage.setItem(ACTIVE_KEY,activePeriodId);
}
function localLoad(){
  try{
    activePeriodId=localStorage.getItem(ACTIVE_KEY)||activePeriodId;
    const x=JSON.parse(localStorage.getItem(STORAGE_KEY+"::"+activePeriodId)||"null");
    if(x) payload=normalizePayloadData(x);
  }catch(_){}
}
function setCloud(mode,msg){
  const c=$("#cloudCard"),t=$("#cloudText"); if(!c||!t)return;
  c.classList.remove("ok","error"); if(mode==="ok")c.classList.add("ok"); if(mode==="error")c.classList.add("error"); t.textContent=msg;
}
function renderPeriods(){
  $("#periodSelect").innerHTML=periods.map(p=>`<option value="${esc(p.id)}" ${p.id===activePeriodId?"selected":""}>${esc(p.name)}</option>`).join("");
  $("#periodText").textContent=activePeriod().name;
  $("#docCode").textContent=code();
}
function formatCell(v,type){
  if(type==="number") return v===""?"":Number(v);
  return v??"";
}
function renderSections(){
  const host=$("#dynamicSections");
  let html=`<section class="panel"><div class="panel-head"><div><span class="eyebrow">1. Cronograma</span><h3>Fechas del proceso</h3><p class="help">Las actividades y responsables base ya están definidos. Completa o importa las fechas y ajusta el responsable solo si cambia en el período.</p></div></div>
  <div class="table-scroll"><table class="data-table"><thead><tr><th>Actividad</th><th>Responsable</th><th>Fecha inicio</th><th>Fecha fin</th></tr></thead><tbody id="scheduleBody"></tbody></table></div></section>`;
  let n=2;
  Object.entries(CONFIG.tables).forEach(([key,t])=>{
    html+=`<section class="panel"><div class="panel-head"><div><span class="eyebrow">${n++}. ${esc(t.label)} · opcional</span><h3>${esc(t.title)}</h3><p class="help">${esc(t.help||"")} Esta sección no bloquea la generación del documento.</p></div><button class="secondary" type="button" data-add="${key}">+ Agregar fila</button></div>
    <div class="table-scroll"><table class="data-table"><thead><tr>${t.columns.map(c=>`<th>${esc(c.label)}</th>`).join("")}<th></th></tr></thead><tbody id="tbody-${key}"></tbody></table></div></section>`;
  });
  host.innerHTML=html;
  renderSchedule();
  Object.keys(CONFIG.tables).forEach(renderTable);
  host.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{payload.tables[b.dataset.add].push({});renderTable(b.dataset.add);progress();localSave();});
}
function renderSchedule(){
  $("#scheduleBody").innerHTML=payload.schedule.map((r,i)=>`<tr><td><strong>${esc(r.activity)}</strong>${r.route?`<div class="help">${esc(r.route)}</div>`:""}</td><td><input type="text" data-sch="${i}" data-f="responsible" value="${esc(r.responsible||"")}" placeholder="Responsable"></td><td><input type="date" data-sch="${i}" data-f="start" value="${esc(r.start||"")}"></td><td><input type="date" data-sch="${i}" data-f="end" value="${esc(r.end||"")}"></td></tr>`).join("");
  $("#scheduleBody").querySelectorAll("input").forEach(el=>el.onchange=()=>{payload.schedule[+el.dataset.sch][el.dataset.f]=el.value;progress();localSave();});
}
function renderTable(key){
  const t=CONFIG.tables[key],rows=payload.tables[key]||[];
  const body=$("#tbody-"+key);
  body.innerHTML=rows.map((r,i)=>`<tr>${t.columns.map(c=>{
    const type=c.type==="date"?"date":c.type==="number"?"number":"text";
    return `<td><input type="${type}" ${type==="number"?'min="0" step="1"':""} data-row="${i}" data-key="${key}" data-field="${c.field}" value="${esc(formatCell(r[c.field],c.type))}" placeholder="${esc(c.placeholder||"")}"></td>`;
  }).join("")}<td><button class="row-remove" type="button" data-del="${key}" data-row="${i}">×</button></td></tr>`).join("");
  body.querySelectorAll("input").forEach(el=>el.onchange=()=>{const r=payload.tables[el.dataset.key][+el.dataset.row];r[el.dataset.field]=el.type==="number"?(el.value===""?"":Number(el.value)):el.value;progress();localSave();});
  body.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{payload.tables[b.dataset.del].splice(+b.dataset.row,1); if(!payload.tables[b.dataset.del].length)payload.tables[b.dataset.del].push({});renderTable(b.dataset.del);progress();localSave();});
}
function renderAssets(){
  [["logo","logoPreview"],["introImage","introImagePreview"],["methodologyImage","methodologyImagePreview"],["closingImage","closingImagePreview"]].forEach(([k,id])=>{
    const el=$("#"+id); el.innerHTML=assets[k]?`<img src="${assets[k]}" alt="">`:"Opcional";
    if(k==="logo"&&!assets[k])el.textContent="Sin imagen";
  });
}
function scheduleComplete(){return payload.schedule.length===CONFIG.schedule.length&&payload.schedule.every(r=>r.start&&r.end);}
function firstTableComplete(){
  if(!CONFIG.requiredTable) return true;
  const t=CONFIG.tables[CONFIG.requiredTable],rows=payload.tables[CONFIG.requiredTable]||[];
  return rows.some(r=>t.requiredFields.every(f=>String(r[f]??"").trim()!==""));
}
function progress(){
  let done=2,total=4; // período y código son automáticos
  if(scheduleComplete())done++;
  if(assets.logo)done++;
  const pct=Math.round(done/total*100);
  $("#progressBar").style.width=pct+"%";
  $("#progressLabel").textContent=pct+"% completo";
}
async function resizeImage(file,maxW=1400,maxH=850){
  return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{let w=img.width,h=img.height,s=Math.min(1,maxW/w,maxH/h);const cv=document.createElement("canvas");cv.width=Math.round(w*s);cv.height=Math.round(h*s);cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);URL.revokeObjectURL(url);resolve(cv.toDataURL("image/jpeg",.88));};img.onerror=reject;img.src=url;});
}
async function storeImage(key,file){
  const data=await resizeImage(file,key==="logo"?900:1500,key==="logo"?320:900);assets[key]=data;renderAssets();progress();
  if(cloudReady){try{await window.DocTitCloud.uploadAsset({periodKey:activePeriodId,documentKey:CONFIG.documentKey,assetKey:key,dataUrl:data,fileName:file.name});setCloud("ok","Imagen guardada");}catch(e){setCloud("error","Error al guardar imagen");alert(e.message);}}
}
async function loadCurrent(){
  payload=blankPayload();assets={};
  const cache=JSON.parse(localStorage.getItem(STORAGE_KEY+"::"+activePeriodId)||"null"); if(cache)payload=normalizePayloadData(cache);
  if(cloudReady){
    try{
      const doc=await window.DocTitCloud.loadDocument(activePeriodId,CONFIG.documentKey);
      if(doc?.payload) payload=normalizePayloadData(doc.payload);
      assets=await window.DocTitCloud.loadAssets(activePeriodId,CONFIG.documentKey);
    }catch(e){console.warn(e);}
  }
  $("#notesInput").value=payload.notes||"";renderSections();renderAssets();progress();localSave();
}
async function save(){
  payload.notes=$("#notesInput").value.trim();localSave();
  const data={periodKey:activePeriodId,documentKey:CONFIG.documentKey,processCode:"PRO-56",title:CONFIG.title,documentCode:code(),payload,complete:scheduleComplete()&&firstTableComplete()&&!!assets.logo};
  if(cloudReady){try{await window.DocTitCloud.upsertDocument(data);setStatus("Borrador guardado en Supabase","success");}catch(e){setStatus("Guardado local; no se pudo sincronizar","error");}}else setStatus("Borrador guardado localmente","success");
}
function setStatus(msg,type=""){const s=$("#status");s.textContent=msg;s.className="status "+type;}
function isoDate(v){
  if(!v)return""; if(v instanceof Date)return v.toISOString().slice(0,10);
  if(typeof v==="number"){const d=XLSX.SSF.parse_date_code(v);if(d)return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;}
  const s=String(v).trim();const m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);if(m)return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;return"";
}
function matchSheet(wb,key){
  const aliases=[key,CONFIG.tables[key]?.sheet,...(CONFIG.tables[key]?.sheetAliases||[])].filter(Boolean).map(norm);
  return wb.SheetNames.find(n=>aliases.includes(norm(n)))||wb.SheetNames.find(n=>aliases.some(a=>norm(n).includes(a)||a.includes(norm(n))));
}
function mapHeaders(row,columns){
  const result={}; const keys=Object.keys(row);
  columns.forEach(c=>{const aliases=[c.label,c.field,...(c.aliases||[])].map(norm);const found=keys.find(k=>aliases.includes(norm(k)))||keys.find(k=>aliases.some(a=>norm(k).includes(a)||a.includes(norm(k))));if(found)result[c.field]=found;});
  return result;
}
function bestActivity(value){
  const n=norm(value);if(!n)return null;
  const scheduleNames=CONFIG.schedule.map(a=>typeof a==="string"?a:a.activity);
  let exact=scheduleNames.find(a=>norm(a)===n);if(exact)return exact;
  const aliases=CONFIG.activityAliases||{};
  for(const [canonical,list] of Object.entries(aliases)){if([canonical,...list].some(x=>norm(x)===n||norm(x).includes(n)||n.includes(norm(x))))return canonical;}
  let best=null,score=0;scheduleNames.forEach(a=>{const aw=norm(a).split(" "),nw=n.split(" ");const common=aw.filter(w=>nw.includes(w)).length/Math.max(aw.length,nw.length);if(common>score){score=common;best=a;}});return score>=.5?best:null;
}
function readPeriodSheet(wb){
  const sheetName=wb.SheetNames.find(n=>norm(n)==="periodo"||norm(n).includes("periodo"));
  if(!sheetName) return null;
  const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:""});
  const out={};
  rows.forEach(r=>{
    const key=norm(r[0]);
    if(key) out[key]=String(r[1]??"").trim();
  });
  return {
    period:out.periodo||out.period||"",
    code:out.codigo||out.code||"",
    start:out.fecha_inicio||out.inicio||"",
    end:out.fecha_fin||out.fin||""
  };
}
function parseImport(wb){
  const out=JSON.parse(JSON.stringify(normalizePayloadData(payload)));
  const report={recognized:0,warnings:[],blocking:[],details:[]};

  const periodInfo=readPeriodSheet(wb);
  if(periodInfo){
    const expectedPeriod=norm(activePeriod().name);
    const importedPeriod=norm(periodInfo.period);
    const expectedCode=norm(code());
    const importedCode=norm(periodInfo.code);
    if(importedPeriod && importedPeriod!==expectedPeriod){
      report.blocking.push("La plantilla pertenece al período «"+periodInfo.period+"» y la app está abierta en «"+activePeriod().name+"».");
    }
    if(importedCode && importedCode!==expectedCode){
      report.blocking.push("El código de la plantilla ("+periodInfo.code+") no coincide con el documento actual ("+code()+").");
    }
    report.details.push("Período validado: "+(periodInfo.period||"sin dato"));
  }else{
    report.warnings.push("No se encontró la hoja PERIODO. Se conservará el período abierto en la app.");
  }

  const sname=wb.SheetNames.find(n=>norm(n).includes("cronograma"));
  if(sname){
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sname],{defval:""});
    const map=rows.length?mapHeaders(rows[0],[
      {field:"activity",label:"Actividad",aliases:["evento","fase"]},
      {field:"responsible",label:"Responsable",aliases:["docente","encargado"]},
      {field:"start",label:"Fecha inicio",aliases:["inicio","desde","fecha inicial"]},
      {field:"end",label:"Fecha fin",aliases:["fin","hasta","fecha final"]}
    ]):{};
    rows.forEach(r=>{
      const a=bestActivity(r[map.activity]);
      if(!a){
        if(r[map.activity])report.warnings.push("Actividad no reconocida: "+r[map.activity]);
        return;
      }
      const target=out.schedule.find(x=>x.activity===a);
      if(!target) return;
      if(map.responsible && String(r[map.responsible]??"").trim()) target.responsible=String(r[map.responsible]).trim();
      const start=isoDate(r[map.start]);
      const end=isoDate(r[map.end]);
      if(start) target.start=start;
      if(end) target.end=end;
      report.recognized++;
    });
    report.details.push("Cronograma: "+out.schedule.filter(r=>r.start||r.end).length+" actividades con fecha");
  }else{
    report.warnings.push("No se encontró la hoja CRONOGRAMA. Se conservarán las fechas ya registradas.");
  }

  Object.entries(CONFIG.tables).forEach(([key,t])=>{
    const sn=matchSheet(wb,key);
    if(!sn){
      report.details.push(t.label+": se conservan los datos existentes");
      return;
    }
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:""});
    if(!rows.length){
      report.details.push(t.label+": hoja vacía; se conservan los datos existentes");
      return;
    }
    const hm=mapHeaders(rows[0],t.columns);
    const parsed=[];
    rows.forEach(row=>{
      const obj={};
      t.columns.forEach(col=>{
        let v=hm[col.field]?row[hm[col.field]]:"";
        if(col.type==="date") v=isoDate(v);
        else if(col.type==="number"){
          if(v==="") v="";
          else{
            const n=Number(v);
            v=Number.isFinite(n)?n:"";
            if(v==="" && String(row[hm[col.field]]??"").trim()) report.warnings.push("Valor numérico no reconocido en "+t.label+": "+row[hm[col.field]]);
          }
        }else v=String(v??"").trim();
        obj[col.field]=v;
      });
      if(Object.values(obj).some(v=>String(v??"").trim()!=="")) parsed.push(obj);
    });
    if(parsed.length){
      out.tables[key]=parsed;
      report.recognized+=parsed.length;
      report.details.push(t.label+": "+parsed.length+" filas importadas");
    }else{
      report.details.push(t.label+": sin filas útiles; se conservan los datos existentes");
    }
  });

  const os=wb.SheetNames.find(n=>norm(n).includes("observ"));
  if(os){
    const arr=XLSX.utils.sheet_to_json(wb.Sheets[os],{header:1,defval:""});
    const importedNotes=arr.flat().slice(1).filter(v=>String(v).trim()).join("\n").trim();
    if(importedNotes){
      out.notes=importedNotes;
      report.recognized++;
    }
  }

  report.missing=out.schedule.filter(r=>!r.start||!r.end).map(r=>r.activity);
  return {out,report};
}
function showImport(parsed){
  pendingImport=parsed.out;
  const r=parsed.report;
  const box=$("#importReport");
  box.classList.remove("hidden");
  const blocking=r.blocking||[];
  const applyButton=blocking.length
    ? ""
    : '<div style="margin-top:10px"><button id="applyImportBtn" class="primary" type="button">Aplicar datos</button></div>';
  box.innerHTML=`<strong>Importación inteligente</strong>
    <div class="import-kpis">
      <span class="pill oktxt">${r.recognized} datos reconocidos</span>
      <span class="pill ${r.warnings.length?"warntxt":"oktxt"}">${r.warnings.length} advertencias</span>
      <span class="pill ${r.missing.length?"warntxt":"oktxt"}">${r.missing.length} fechas pendientes</span>
      <span class="pill ${blocking.length?"errtxt":"oktxt"}">${blocking.length?"Plantilla no aplicable":"Período correcto"}</span>
    </div>
    <div class="mapping-list">
      ${r.details.map(x=>"✓ "+esc(x)).join("<br>")}
      ${r.warnings.length?"<br>"+r.warnings.map(x=>"⚠ "+esc(x)).join("<br>"):""}
      ${blocking.length?"<br>"+blocking.map(x=>"✕ "+esc(x)).join("<br>"):""}
      ${r.missing.length?"<br>⚠ Faltan fechas: "+esc(r.missing.join(", ")):""}
    </div>${applyButton}`;
  const btn=$("#applyImportBtn");
  if(btn) btn.onclick=()=>{
    payload=normalizePayloadData(pendingImport);
    pendingImport=null;
    $("#notesInput").value=payload.notes||"";
    renderSections();
    progress();
    localSave();
    box.innerHTML="<strong>Datos aplicados.</strong><p class='help'>Se conservaron los datos existentes que no estaban presentes en la plantilla. Revisa y guarda el borrador.</p>";
  };
}
function downloadTemplate(){
  const wb=XLSX.utils.book_new();const p=activePeriod();
  const info=[["PLANTILLA DE DATOS · "+CONFIG.title],["Instrucciones"],["1. Completa únicamente las celdas necesarias."],["2. No cambies el nombre de las hojas si no es necesario."],["3. La app reconoce alias como Inicio/Fecha inicio/Desde y Fin/Fecha fin/Hasta."],["4. Puedes dejar datos pendientes y volver a importar después."],["5. Solo el CRONOGRAMA y el logo son obligatorios para generar. Las demás hojas complementan el documento cuando contienen datos."]];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(info),"INSTRUCCIONES");
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([
    ["Campo","Valor"],
    ["Periodo",p.name],
    ["Fecha inicio",p.start],
    ["Fecha fin",p.end],
    ["Codigo",code()],
    ["Documento",CONFIG.title],
    ["Clave documento",CONFIG.documentKey]
  ]),"PERIODO");
  const sch=[["Actividad","Responsable","Fecha inicio","Fecha fin"],...payload.schedule.map(r=>[r.activity,r.responsible||"",r.start||"",r.end||""])];const sws=XLSX.utils.aoa_to_sheet(sch);sws["!cols"]=[{wch:45},{wch:40},{wch:16},{wch:16}];XLSX.utils.book_append_sheet(wb,sws,"CRONOGRAMA");
  Object.entries(CONFIG.tables).forEach(([key,t])=>{const rows=(payload.tables[key]||[]).filter(r=>Object.values(r).some(v=>String(v??"").trim()!==""));const data=[t.columns.map(c=>c.label),...(rows.length?rows.map(r=>t.columns.map(c=>r[c.field]??"")):[t.columns.map(()=> "")])];const ws=XLSX.utils.aoa_to_sheet(data);ws["!cols"]=t.columns.map(c=>({wch:c.width||20}));XLSX.utils.book_append_sheet(wb,ws,t.sheet);});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Observaciones"],[payload.notes||""]]),"OBSERVACIONES");
  XLSX.writeFile(wb,"Plantilla_"+CONFIG.shortName+"_"+p.name.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]+/g,"-")+".xlsx");
}
async function generate(){
  payload.notes=$("#notesInput").value.trim();
  if(!scheduleComplete()){alert("Completa las fechas del cronograma.");return;}
  if(CONFIG.requiredTable && !firstTableComplete()){alert("Completa al menos una fila de "+CONFIG.tables[CONFIG.requiredTable].label+".");return;}
  if(!assets.logo){alert("Sube el logo institucional.");return;}
  const btn=$("#generateBtn");btn.disabled=true;setStatus("Generando documento…");
  try{
    const result=await window.DocTitFullDocument.generateAndDownload({config:CONFIG,period:activePeriod(),code:code(),payload,assets},code()+" - "+CONFIG.title+".pdf");
    const generatedAt=new Date().toISOString();
    if(cloudReady){try{await window.DocTitCloud.uploadGeneratedPdf({periodKey:activePeriodId,documentKey:CONFIG.documentKey,fileName:result.filename,blob:result.blob});await window.DocTitCloud.upsertDocument({periodKey:activePeriodId,documentKey:CONFIG.documentKey,processCode:"PRO-56",title:CONFIG.title,documentCode:code(),payload,complete:true,generatedAt,generatedFileName:result.filename,generatedPages:result.pages});}catch(e){console.warn(e);}}
    setStatus("PDF generado: "+result.pages+" páginas","success");
  }catch(e){console.error(e);setStatus("Error: "+e.message,"error");alert(e.message);}finally{btn.disabled=false;}
}
async function initCloud(){
  try{await window.DocTitCloud.healthCheck();cloudReady=true;setCloud("ok","Sincronización automática");const rows=await window.DocTitCloud.loadPeriods();if(rows.length)periods=rows.map(r=>({id:r.period_key,name:r.name,start:r.start_date,end:r.end_date,status:r.status}));if(!periods.some(p=>p.id===activePeriodId))activePeriodId=periods[0].id;renderPeriods();await loadCurrent();}catch(e){console.warn(e);setCloud("error","Sin conexión · caché local");renderPeriods();renderSections();renderAssets();progress();}
}
function initPeriodDialog(){
  $("#startMonth").innerHTML=MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("");$("#endMonth").innerHTML=$("#startMonth").innerHTML;
  $("#newPeriodBtn").onclick=()=>{const p=activePeriod(),d1=new Date(p.start+"T12:00:00"),d2=new Date(p.end+"T12:00:00");$("#startMonth").value=d1.getMonth()+1;$("#endMonth").value=d2.getMonth()+1;$("#startYear").value=d1.getFullYear()+1;$("#endYear").value=d2.getFullYear()+1;$("#periodDialog").showModal();};
  $("#cancelPeriodBtn").onclick=()=>$("#periodDialog").close();
  $("#periodForm").onsubmit=async e=>{e.preventDefault();const sm=+$("#startMonth").value,em=+$("#endMonth").value,sy=+$("#startYear").value,ey=+$("#endYear").value;const start=`${sy}-${String(sm).padStart(2,"0")}-01`,last=new Date(ey,em,0).getDate(),end=`${ey}-${String(em).padStart(2,"0")}-${last}`;if(end<start){alert("El período final debe ser posterior.");return;}const id=`${sy}-${String(sm).padStart(2,"0")}_${ey}-${String(em).padStart(2,"0")}`,name=`${MONTHS[sm-1]} ${sy} – ${MONTHS[em-1]} ${ey}`;const p={id,name,start,end,status:"Activo"};periods.unshift(p);activePeriodId=id;if(cloudReady)try{await window.DocTitCloud.upsertPeriod(p);}catch(_){}$("#periodDialog").close();renderPeriods();await loadCurrent();};
}
function bind(){
  $("#periodSelect").onchange=async e=>{activePeriodId=e.target.value;localStorage.setItem(ACTIVE_KEY,activePeriodId);renderPeriods();await loadCurrent();};
  $("#downloadTemplateBtn").onclick=downloadTemplate;
  $("#importInput").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const wb=XLSX.read(await f.arrayBuffer(),{type:"array",cellDates:true});showImport(parseImport(wb));}catch(err){alert("No se pudo leer la plantilla: "+err.message);}e.target.value="";};
  $("#notesInput").onchange=()=>{payload.notes=$("#notesInput").value.trim();localSave();};
  $("#saveBtn").onclick=save;$("#saveBtnBottom").onclick=save;$("#generateBtn").onclick=generate;$("#generateBtnBottom").onclick=generate;
  [["logoUpload","logo"],["introImageUpload","introImage"],["methodologyImageUpload","methodologyImage"],["closingImageUpload","closingImage"]].forEach(([id,key])=>$("#"+id).onchange=e=>{const f=e.target.files?.[0];if(f)storeImage(key,f);e.target.value="";});
}
localLoad();renderPeriods();renderSections();renderAssets();progress();bind();initPeriodDialog();initCloud();
})();