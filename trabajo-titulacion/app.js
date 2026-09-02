(() => {
"use strict";
const CONFIG={"documentKey":"plan-trabajo-titulacion","title":"Planificación De Trabajo De Titulación","shortName":"Trabajo_Titulacion","codePrefix":"UGPA-RGI2-01-PRO-56-","requiredTable":"carreras","schedule":[{"activity":"Asignación de Tutor y Lector","responsible":"Coordinador de Titulación / Coordinación General de Carreras","description":"Designación del tutor y lector para acompañamiento y revisión académica."},{"activity":"Reunión Inicial con Tutor","responsible":"Estudiante / Tutor","description":"Primer encuentro para acordar plan de trabajo y objetivos."},{"activity":"Entrega del Primer Borrador","responsible":"Estudiante","description":"Presentación del primer borrador para revisión del tutor."},{"activity":"Retroalimentación del Primer Borrador","responsible":"Tutor","description":"Revisión y comentarios sobre el primer borrador."},{"activity":"Entrega del Segundo Borrador","responsible":"Estudiante","description":"Segundo borrador con incorporación de observaciones."},{"activity":"Retroalimentación del Segundo Borrador","responsible":"Tutor","description":"Revisión y comentarios sobre el segundo borrador."},{"activity":"Entrega del Tercer Borrador","responsible":"Estudiante","description":"Versión avanzada ajustada según revisiones previas."},{"activity":"Aprobación Final del Tercer Borrador por Tutor","responsible":"Tutor","description":"Aprobación del tutor para habilitar revisión del lector."},{"activity":"Revisión del Proyecto por el Lector","responsible":"Lector","description":"Revisión técnica y formal del trabajo aprobado por tutor."},{"activity":"Aprobación Final del Proyecto","responsible":"Lector","description":"Validación final previa a defensa."},{"activity":"Confirmación de Fecha de Defensa","responsible":"Coordinador de Titulación / Coordinación General de Carreras","description":"Confirmación y comunicación de fecha y modalidad de defensa."},{"activity":"Preparación para la Defensa","responsible":"Estudiante","description":"Ajustes finales y preparación de la defensa."},{"activity":"Defensa de Tesis","responsible":"Estudiante / Tribunal Evaluador / Coordinación General de Carreras","description":"Presentación y defensa del trabajo ante tribunal."},{"activity":"Registro Final de Calificaciones","responsible":"Coordinador de Titulación / Coordinación General de Carreras","description":"Registro de calificaciones finales en el sistema institucional."}],"activityAliases":{"Asignación de Tutor y Lector":["asignacion tutor lector","tutor y lector"],"Reunión Inicial con Tutor":["reunion tutor","reunion inicial"],"Entrega del Primer Borrador":["borrador 1","primer borrador","primer avance"],"Retroalimentación del Primer Borrador":["retroalimentacion borrador 1","revision primer borrador"],"Entrega del Segundo Borrador":["borrador 2","segundo borrador","segundo avance"],"Retroalimentación del Segundo Borrador":["retroalimentacion borrador 2","revision segundo borrador"],"Entrega del Tercer Borrador":["borrador 3","tercer borrador","tercer avance"],"Aprobación Final del Tercer Borrador por Tutor":["aprobacion tutor","aprobacion tercer borrador"],"Revisión del Proyecto por el Lector":["revision lector","revision proyecto lector"],"Aprobación Final del Proyecto":["aprobacion final","aprobacion lector"],"Confirmación de Fecha de Defensa":["confirmacion defensa","fecha defensa"],"Preparación para la Defensa":["preparacion defensa"],"Defensa de Tesis":["defensa","defensa tesis","defensa trabajo"],"Registro Final de Calificaciones":["registro notas","calificaciones finales"]},"tables":{"carreras":{"label":"Carreras y estudiantes","title":"Carreras participantes","help":"Registra carrera, modalidad, lugar y cantidad.","sheet":"CARRERAS","sheetAliases":["distribucion"],"requiredFields":["career","count"],"columns":[{"field":"career","label":"Carrera","aliases":["programa"],"width":38},{"field":"modality","label":"Modalidad","aliases":["tipo"],"width":18},{"field":"place","label":"Lugar","aliases":["sede"],"width":16},{"field":"count","label":"Cantidad","aliases":["cant","estudiantes","numero estudiantes"],"type":"number","width":12}]},"tutores":{"label":"Tutor y lector","title":"Asignación académica","help":"Completa únicamente cuando las asignaciones ya estén definidas.","sheet":"TUTORES_LECTORES","sheetAliases":["tutores","lectores"],"requiredFields":["career"],"columns":[{"field":"career","label":"Carrera","width":34},{"field":"tutor","label":"Tutor","aliases":["docente tutor"],"width":26},{"field":"reader","label":"Lector","aliases":["lector revisor"],"width":26},{"field":"observations","label":"Observaciones","aliases":["obs"],"width":34}]},"defensas":{"label":"Defensas","title":"Organización de defensas","help":"Registra rangos por carrera cuando ya estén definidos.","sheet":"DEFENSAS","requiredFields":["career"],"columns":[{"field":"career","label":"Carrera","width":32},{"field":"start","label":"Fecha inicio","aliases":["inicio","desde"],"type":"date","width":15},{"field":"end","label":"Fecha fin","aliases":["fin","hasta"],"type":"date","width":15},{"field":"mode","label":"Modalidad","aliases":["tipo"],"width":16},{"field":"observations","label":"Observaciones","width":30}]},"recursos":{"label":"Recursos","title":"Recursos y plataformas","help":"Incluye recursos operativos cuando cambien por período.","sheet":"RECURSOS","requiredFields":["resource"],"columns":[{"field":"resource","label":"Recurso","aliases":["plataforma","elemento"],"width":28},{"field":"responsible","label":"Responsable","aliases":["encargado"],"width":28},{"field":"use","label":"Uso","aliases":["descripcion"],"width":42}]}}}
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
    if(x) payload=x;
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
    html+=`<section class="panel"><div class="panel-head"><div><span class="eyebrow">${n++}. ${esc(t.label)}</span><h3>${esc(t.title)}</h3><p class="help">${esc(t.help||"")}</p></div><button class="secondary" type="button" data-add="${key}">+ Agregar fila</button></div>
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
  const firstKey=CONFIG.requiredTable||Object.keys(CONFIG.tables)[0],t=CONFIG.tables[firstKey],rows=payload.tables[firstKey]||[];
  return rows.some(r=>t.requiredFields.every(f=>String(r[f]??"").trim()!==""));
}
function progress(){
  let done=0,total=4;
  if(scheduleComplete())done++;
  if(firstTableComplete())done++;
  if(assets.logo)done++;
  if(Object.values(payload.tables).some(rows=>rows.some(r=>Object.values(r).some(v=>String(v??"").trim()!==""))))done++;
  const pct=Math.round(done/total*100);$("#progressBar").style.width=pct+"%";$("#progressLabel").textContent=pct+"% completo";
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
  const cache=JSON.parse(localStorage.getItem(STORAGE_KEY+"::"+activePeriodId)||"null"); if(cache)payload=cache;
  if(cloudReady){
    try{
      const doc=await window.DocTitCloud.loadDocument(activePeriodId,CONFIG.documentKey);
      if(doc?.payload) payload={...blankPayload(),...doc.payload,tables:{...blankPayload().tables,...(doc.payload.tables||{})}};
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
function parseImport(wb){
  const out=blankPayload(),report={recognized:0,warnings:[],details:[]};
  const sname=wb.SheetNames.find(n=>norm(n).includes("cronograma"));
  if(sname){
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sname],{defval:""});
    const map=rows.length?mapHeaders(rows[0],[{field:"activity",label:"Actividad",aliases:["evento","fase"]},{field:"responsible",label:"Responsable",aliases:["docente","encargado"]},{field:"start",label:"Fecha inicio",aliases:["inicio","desde","fecha inicial"]},{field:"end",label:"Fecha fin",aliases:["fin","hasta","fecha final"]}]):{};
    rows.forEach(r=>{const a=bestActivity(r[map.activity]);if(!a){if(r[map.activity])report.warnings.push("Actividad no reconocida: "+r[map.activity]);return;}const target=out.schedule.find(x=>x.activity===a);if(map.responsible&&r[map.responsible])target.responsible=String(r[map.responsible]).trim();target.start=isoDate(r[map.start]);target.end=isoDate(r[map.end]);report.recognized++;});
    report.details.push("Cronograma: "+out.schedule.filter(r=>r.start||r.end).length+" actividades");
  }else report.warnings.push("No se encontró la hoja CRONOGRAMA.");

  Object.entries(CONFIG.tables).forEach(([key,t])=>{
    const sn=matchSheet(wb,key);if(!sn){report.warnings.push("No se encontró la hoja "+t.sheet+".");return;}
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{defval:""}); if(!rows.length)return;
    const hm=mapHeaders(rows[0],t.columns); const parsed=[];
    rows.forEach(row=>{const obj={};t.columns.forEach(col=>{let v=hm[col.field]?row[hm[col.field]]:"";if(col.type==="date")v=isoDate(v);else if(col.type==="number")v=v===""?"":Number(v)||0;else v=String(v??"").trim();obj[col.field]=v;});if(Object.values(obj).some(v=>String(v??"").trim()!==""))parsed.push(obj);});
    out.tables[key]=parsed.length?parsed:[{}];report.recognized+=parsed.length;report.details.push(t.label+": "+parsed.length+" filas");
  });

  const os=wb.SheetNames.find(n=>norm(n).includes("observ"));if(os){const arr=XLSX.utils.sheet_to_json(wb.Sheets[os],{header:1,defval:""});out.notes=arr.flat().slice(1).filter(Boolean).join("\n");}
  report.missing=out.schedule.filter(r=>!r.start||!r.end).map(r=>r.activity);
  return {out,report};
}
function showImport(parsed){
  pendingImport=parsed.out;const r=parsed.report;const box=$("#importReport");box.classList.remove("hidden");
  box.innerHTML=`<strong>Importación inteligente</strong><div class="import-kpis"><span class="pill oktxt">${r.recognized} datos reconocidos</span><span class="pill ${r.warnings.length?"warntxt":"oktxt"}">${r.warnings.length} advertencias</span><span class="pill ${r.missing.length?"warntxt":"oktxt"}">${r.missing.length} fechas pendientes</span></div><div class="mapping-list">${r.details.map(x=>"✓ "+esc(x)).join("<br>")}${r.warnings.length?"<br>"+r.warnings.map(x=>"⚠ "+esc(x)).join("<br>"):""}${r.missing.length?"<br>⚠ Faltan fechas: "+esc(r.missing.join(", ")):""}</div><div style="margin-top:10px"><button id="applyImportBtn" class="primary" type="button">Aplicar datos</button></div>`;
  $("#applyImportBtn").onclick=()=>{payload=pendingImport;pendingImport=null;$("#notesInput").value=payload.notes||"";renderSections();progress();localSave();box.innerHTML="<strong>Datos aplicados.</strong><p class='help'>Revisa las tablas y guarda el borrador.</p>";};
}
function downloadTemplate(){
  const wb=XLSX.utils.book_new();const p=activePeriod();
  const info=[["PLANTILLA DE DATOS · "+CONFIG.title],["Instrucciones"],["1. Completa únicamente las celdas necesarias."],["2. No cambies el nombre de las hojas si no es necesario."],["3. La app reconoce alias como Inicio/Fecha inicio/Desde y Fin/Fecha fin/Hasta."],["4. Puedes dejar datos pendientes y volver a importar después."]];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(info),"INSTRUCCIONES");
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Campo","Valor"],["Periodo",p.name],["Fecha inicio",p.start],["Fecha fin",p.end],["Codigo",code()]]),"PERIODO");
  const sch=[["Actividad","Responsable","Fecha inicio","Fecha fin"],...payload.schedule.map(r=>[r.activity,r.responsible||"",r.start||"",r.end||""])];const sws=XLSX.utils.aoa_to_sheet(sch);sws["!cols"]=[{wch:45},{wch:40},{wch:16},{wch:16}];XLSX.utils.book_append_sheet(wb,sws,"CRONOGRAMA");
  Object.entries(CONFIG.tables).forEach(([key,t])=>{const rows=(payload.tables[key]||[]).filter(r=>Object.values(r).some(v=>String(v??"").trim()!==""));const data=[t.columns.map(c=>c.label),...(rows.length?rows.map(r=>t.columns.map(c=>r[c.field]??"")):[t.columns.map(()=> "")])];const ws=XLSX.utils.aoa_to_sheet(data);ws["!cols"]=t.columns.map(c=>({wch:c.width||20}));XLSX.utils.book_append_sheet(wb,ws,t.sheet);});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Observaciones"],[payload.notes||""]]),"OBSERVACIONES");
  XLSX.writeFile(wb,"Plantilla_"+CONFIG.shortName+"_"+p.name.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]+/g,"-")+".xlsx");
}
async function generate(){
  payload.notes=$("#notesInput").value.trim(); if(!scheduleComplete()){alert("Completa las fechas del cronograma.");return;} if(!firstTableComplete()){alert("Completa al menos una fila de "+CONFIG.tables[CONFIG.requiredTable].label+".");return;} if(!assets.logo){alert("Sube el logo institucional.");return;}
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