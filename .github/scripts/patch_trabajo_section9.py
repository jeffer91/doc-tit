from pathlib import Path
import re

# -------------------- app.js --------------------
path = Path('trabajo-titulacion/app.js')
text = path.read_text(encoding='utf-8')

if 'const SCHEDULE_CONFIG=window.DOC_TIT_TRABAJO_SCHEDULE||{};' not in text:
    text = text.replace('const MONTHS=[', 'const SCHEDULE_CONFIG=window.DOC_TIT_TRABAJO_SCHEDULE||{};\nconst MONTHS=[', 1)

if 'function currentScheduleStructureSnapshot()' not in text:
    marker = 'function blankPayload(){'
    helper = '''function currentScheduleStructureSnapshot(){
  const block=window.DOC_TIT_TRABAJO_SCHEDULE;
  if(!block||!Array.isArray(block.activities)||!block.activities.length||!Array.isArray(block.phases)||!block.phases.length)return null;
  return JSON.parse(JSON.stringify(block));
}
function blankPayload(){'''
    text = text.replace(marker, helper, 1)

old_blank = '''function blankPayload(){
  const tables={};
  Object.entries(CONFIG.tables).forEach(([key,t])=>{tables[key]=(t.initialRows||[]).map(r=>({...r}));});
  return {schedule:CONFIG.schedule.map(a=>{
    const def=typeof a==="string"?{activity:a}:a;
    return {activity:def.activity,responsible:def.responsible||"",description:def.description||"",route:def.route||"",start:"",end:""};
  }),tables,notes:"",contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot(),requirements:currentRequirementsSnapshot(),processDescription:currentProcessSnapshot(),administrativeLogistics:currentLogisticsSnapshot(),induction:currentInductionSnapshot()}};
}'''
new_blank = '''function blankPayload(){
  const tables={};
  Object.entries(CONFIG.tables).forEach(([key,t])=>{tables[key]=(t.initialRows||[]).map(r=>({...r}));});
  const structure=currentScheduleStructureSnapshot();
  const source=(structure?.activities?.length?structure.activities:CONFIG.schedule);
  const schedule=source.map((a,i)=>{
    const def=typeof a==="string"?{activity:a}:a;
    return {id:def.id||`actividad_${String(i+1).padStart(2,"0")}`,order:Number(def.order)||i+1,phaseId:def.phaseId||"",activity:def.activity||"",responsible:def.responsible||"",description:def.description||"",route:def.route||"",start:"",end:"",deadline:"",observation:"",active:def.active!==false};
  });
  return {schedule,scheduleMeta:{version:1,status:"Borrador"},tables,notes:"",contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot(),requirements:currentRequirementsSnapshot(),processDescription:currentProcessSnapshot(),administrativeLogistics:currentLogisticsSnapshot(),induction:currentInductionSnapshot(),scheduleStructure:structure}};
}'''
if old_blank in text:
    text = text.replace(old_blank, new_blank, 1)
elif 'scheduleMeta:{version:1,status:"Borrador"}' not in text:
    raise SystemExit('No se pudo reemplazar blankPayload()')

old_norm_schedule = '''  const existingSchedule=Array.isArray(data.schedule)?data.schedule:[];
  const byActivity=new Map(existingSchedule.map(r=>[norm(r.activity),r]));
  base.schedule=base.schedule.map(def=>{
    const old=byActivity.get(norm(def.activity))||{};
    return {...def,...old,activity:def.activity,responsible:old.responsible||def.responsible||"",description:def.description||old.description||"",route:def.route||old.route||""};
  });'''
new_norm_schedule = '''  const existingSchedule=Array.isArray(data.schedule)?data.schedule:[];
  const storedStructure=data.contentSnapshots?.scheduleStructure;
  const structure=(storedStructure&&Array.isArray(storedStructure.activities)&&storedStructure.activities.length)?storedStructure:currentScheduleStructureSnapshot();
  const source=(structure?.activities?.length?structure.activities:base.schedule);
  const byId=new Map(existingSchedule.filter(r=>r?.id).map(r=>[String(r.id),r]));
  const byActivity=new Map(existingSchedule.filter(r=>r?.activity).map(r=>[norm(r.activity),r]));
  const consumed=new Set();
  const configured=source.map((a,i)=>{
    const def=typeof a==="string"?{activity:a}:a;
    const old=byId.get(String(def.id||""))||byActivity.get(norm(def.activity))||{};
    if(old.id)consumed.add(String(old.id));
    if(old.activity)consumed.add("activity:"+norm(old.activity));
    return {
      id:old.id||def.id||`actividad_${String(i+1).padStart(2,"0")}`,
      order:Number(old.order)||Number(def.order)||i+1,
      phaseId:old.phaseId||def.phaseId||"",
      activity:old.activity||def.activity||"",
      responsible:old.responsible||def.responsible||"",
      description:old.description||def.description||"",
      route:old.route||def.route||"",
      start:old.start||"",end:old.end||"",deadline:old.deadline||"",observation:old.observation||"",
      active:old.active===false?false:(old.active===true?true:def.active!==false)
    };
  });
  const extras=existingSchedule.filter(r=>{
    if(r?.id&&consumed.has(String(r.id)))return false;
    if(r?.activity&&consumed.has("activity:"+norm(r.activity)))return false;
    return !!cleanScheduleText(r?.activity);
  }).map((r,i)=>({...r,id:r.id||`custom_${Date.now()}_${i}`,order:Number(r.order)||configured.length+i+1,active:r.active!==false,start:r.start||"",end:r.end||"",deadline:r.deadline||"",observation:r.observation||""}));
  base.schedule=[...configured,...extras].sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999));
  base.schedule.forEach((r,i)=>r.order=i+1);'''
# helper needed by normalization before UI helpers
if 'function cleanScheduleText(' not in text:
    text = text.replace('function formatCell(v,type){', 'function cleanScheduleText(v){return String(v??"").replace(/\\s+/g," ").trim();}\nfunction formatCell(v,type){', 1)
if old_norm_schedule in text:
    text = text.replace(old_norm_schedule, new_norm_schedule, 1)
elif 'const storedStructure=data.contentSnapshots?.scheduleStructure;' not in text:
    raise SystemExit('No se pudo reemplazar normalización de cronograma')

old_snap_tail = '''  if(!contentSnapshots.induction)contentSnapshots.induction=currentInductionSnapshot();
  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'''
new_snap_tail = '''  if(!contentSnapshots.induction)contentSnapshots.induction=currentInductionSnapshot();
  if(!contentSnapshots.scheduleStructure)contentSnapshots.scheduleStructure=structure||currentScheduleStructureSnapshot();
  const scheduleMeta={...(base.scheduleMeta||{}),...(data.scheduleMeta||{})};
  return {...base,...data,schedule:base.schedule,scheduleMeta,tables,notes:data.notes||"",contentSnapshots};'''
if old_snap_tail in text:
    text = text.replace(old_snap_tail, new_snap_tail, 1)
elif 'if(!contentSnapshots.scheduleStructure)' not in text:
    raise SystemExit('No se pudo agregar snapshot del cronograma')

# Replace schedule UI panel and renderer
start = 'function renderSections(){'
end = '\nfunction renderTable(key){'
a = text.index(start)
b = text.index(end, a)
new_ui = r'''function renderSections(){
  const host=$("#dynamicSections");
  let html=`<section class="panel"><div class="panel-head"><div><span class="eyebrow">1. Cronograma</span><h3>Cronograma de Trabajo de Titulación</h3><p class="help">Las actividades institucionales están precargadas. Cada actividad activa debe tener al menos una fecha o plazo. Puedes editar, agregar, desactivar y reordenar actividades para este período.</p></div><button class="secondary" type="button" id="addScheduleBtn">+ Agregar actividad</button></div>
  <div class="table-scroll"><table class="data-table"><thead><tr><th>Orden</th><th>Actividad</th><th>Fecha inicio</th><th>Fecha fin</th><th>Fecha límite</th><th>Descripción</th><th>Responsable</th><th>Observación</th><th>Activo</th><th></th></tr></thead><tbody id="scheduleBody"></tbody></table></div></section>`;
  let n=2;
  Object.entries(CONFIG.tables).forEach(([key,t])=>{
    html+=`<section class="panel"><div class="panel-head"><div><span class="eyebrow">${n++}. ${esc(t.label)} · opcional</span><h3>${esc(t.title)}</h3><p class="help">${esc(t.help||"")} Esta sección no bloquea la generación del documento.</p></div><button class="secondary" type="button" data-add="${key}">+ Agregar fila</button></div>
    <div class="table-scroll"><table class="data-table"><thead><tr>${t.columns.map(c=>`<th>${esc(c.label)}</th>`).join("")}<th></th></tr></thead><tbody id="tbody-${key}"></tbody></table></div></section>`;
  });
  host.innerHTML=html;
  renderSchedule();
  Object.keys(CONFIG.tables).forEach(renderTable);
  const addSchedule=$("#addScheduleBtn");
  if(addSchedule)addSchedule.onclick=()=>{
    payload.schedule.push({id:`custom_${Date.now()}`,order:payload.schedule.length+1,phaseId:"",activity:"Nueva actividad",description:"",responsible:"",start:"",end:"",deadline:"",observation:"",active:true});
    if(payload.scheduleMeta)payload.scheduleMeta.status="Borrador";
    renderSchedule();progress();localSave();
  };
  host.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{payload.tables[b.dataset.add].push({});renderTable(b.dataset.add);progress();localSave();});
}
function renderSchedule(){
  const body=$("#scheduleBody");if(!body)return;
  payload.schedule.sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999));
  payload.schedule.forEach((r,i)=>r.order=i+1);
  body.innerHTML=payload.schedule.map((r,i)=>`<tr class="${r.active===false?'schedule-inactive':''}">
    <td><strong>${i+1}</strong></td>
    <td><input type="text" data-sch="${i}" data-f="activity" value="${esc(r.activity||'')}" placeholder="Actividad"></td>
    <td><input type="date" data-sch="${i}" data-f="start" value="${esc(r.start||'')}"></td>
    <td><input type="date" data-sch="${i}" data-f="end" value="${esc(r.end||'')}"></td>
    <td><input type="date" data-sch="${i}" data-f="deadline" value="${esc(r.deadline||'')}"></td>
    <td><input type="text" data-sch="${i}" data-f="description" value="${esc(r.description||'')}" placeholder="Descripción"></td>
    <td><input type="text" data-sch="${i}" data-f="responsible" value="${esc(r.responsible||'')}" placeholder="Rol responsable"></td>
    <td><input type="text" data-sch="${i}" data-f="observation" value="${esc(r.observation||'')}" placeholder="Opcional"></td>
    <td><input type="checkbox" data-sch="${i}" data-f="active" ${r.active===false?'':'checked'} aria-label="Actividad activa"></td>
    <td><div style="display:flex;gap:4px"><button class="row-remove" type="button" data-move="up" data-index="${i}" title="Subir">↑</button><button class="row-remove" type="button" data-move="down" data-index="${i}" title="Bajar">↓</button></div></td>
  </tr>`).join("");
  body.querySelectorAll("input").forEach(el=>el.onchange=()=>{
    const row=payload.schedule[+el.dataset.sch];
    row[el.dataset.f]=el.type==="checkbox"?el.checked:el.value;
    if(payload.scheduleMeta)payload.scheduleMeta.status="Borrador";
    progress();localSave();
  });
  body.querySelectorAll("[data-move]").forEach(btn=>btn.onclick=()=>{
    const i=+btn.dataset.index;const j=btn.dataset.move==="up"?i-1:i+1;
    if(j<0||j>=payload.schedule.length)return;
    [payload.schedule[i],payload.schedule[j]]=[payload.schedule[j],payload.schedule[i]];
    payload.schedule.forEach((r,k)=>r.order=k+1);
    if(payload.scheduleMeta)payload.scheduleMeta.status="Borrador";
    renderSchedule();progress();localSave();
  });
}
function scheduleValidation(){
  const errors=[];
  const active=(payload.schedule||[]).filter(r=>r.active!==false);
  if(!active.length)errors.push("Debe existir al menos una actividad activa en el cronograma.");
  active.forEach((r,i)=>{
    const name=cleanScheduleText(r.activity)||`Actividad ${i+1}`;
    if(!r.start&&!r.end&&!r.deadline)errors.push(`${name}: falta fecha o plazo.`);
    if(r.start&&r.end&&r.end<r.start)errors.push(`${name}: la fecha final no puede ser anterior a la fecha inicial.`);
    const combined=[r.activity,r.description,r.responsible,r.observation].map(cleanScheduleText).join(" ");
    if(/\b(por definir|n\/?a|pendiente|sin fecha)\b/i.test(combined))errors.push(`${name}: contiene un texto no permitido para el cronograma final.`);
  });
  return errors;
}
function scheduleComplete(){return scheduleValidation().length===0;}
'''
text = text[:a] + new_ui + text[b:]

# Remove old duplicate scheduleComplete if still present
text = re.sub(r'\nfunction scheduleComplete\(\)\{return payload\.schedule\.length===CONFIG\.schedule\.length&&payload\.schedule\.every\(r=>r\.start&&r\.end\);\}\n', '\n', text, count=1)

# Replace import schedule block
s1 = '  const sname=wb.SheetNames.find(n=>norm(n).includes("cronograma"));'
s2 = '\n  Object.entries(CONFIG.tables).forEach(([key,t])=>{'
a = text.index(s1)
b = text.index(s2, a)
new_import = r'''  const sname=wb.SheetNames.find(n=>norm(n).includes("cronograma"));
  if(sname){
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[sname],{defval:""});
    const map=rows.length?mapHeaders(rows[0],[
      {field:"order",label:"Orden",aliases:["secuencia"]},
      {field:"activity",label:"Actividad",aliases:["evento","fase"]},
      {field:"start",label:"Fecha inicio",aliases:["inicio","desde","fecha inicial"]},
      {field:"end",label:"Fecha fin",aliases:["fin","hasta","fecha final"]},
      {field:"deadline",label:"Fecha límite",aliases:["fecha limite","limite","plazo"]},
      {field:"description",label:"Descripción",aliases:["descripcion","detalle"]},
      {field:"responsible",label:"Responsable",aliases:["docente","encargado"]},
      {field:"observation",label:"Observación",aliases:["observacion","obs"]},
      {field:"active",label:"Activo",aliases:["activa","habilitado"]}
    ]):{};
    rows.forEach((r,rowIndex)=>{
      const rawActivity=String(r[map.activity]??"").trim();
      if(!rawActivity)return;
      const canonical=bestActivity(rawActivity);
      let target=canonical?out.schedule.find(x=>norm(x.activity)===norm(canonical)):null;
      if(!target){
        target={id:`custom_import_${Date.now()}_${rowIndex}`,order:out.schedule.length+1,phaseId:"",activity:rawActivity,description:"",responsible:"",start:"",end:"",deadline:"",observation:"",active:true};
        out.schedule.push(target);
      }
      if(map.order&&Number(r[map.order]))target.order=Number(r[map.order]);
      if(map.description&&String(r[map.description]??"").trim())target.description=String(r[map.description]).trim();
      if(map.responsible&&String(r[map.responsible]??"").trim())target.responsible=String(r[map.responsible]).trim();
      if(map.observation)target.observation=String(r[map.observation]??"").trim();
      const start=isoDate(r[map.start]),end=isoDate(r[map.end]),deadline=isoDate(r[map.deadline]);
      if(start)target.start=start;
      if(end)target.end=end;
      if(deadline)target.deadline=deadline;
      if(map.active){
        const av=norm(r[map.active]);
        if(["no","false","0","inactivo","desactivado"].includes(av))target.active=false;
        else if(["si","sí","true","1","activo","activado"].includes(av))target.active=true;
      }
      report.recognized++;
    });
    out.schedule.sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999)).forEach((r,i)=>r.order=i+1);
    report.details.push("Cronograma: "+out.schedule.filter(r=>r.active!==false&&(r.start||r.end||r.deadline)).length+" actividades activas con programación");
  }else{
    report.warnings.push("No se encontró la hoja CRONOGRAMA. Se conservará la programación ya registrada.");
  }
'''
text = text[:a] + new_import + text[b:]
text = text.replace('report.missing=out.schedule.filter(r=>!r.start||!r.end).map(r=>r.activity);','report.missing=out.schedule.filter(r=>r.active!==false&&!r.start&&!r.end&&!r.deadline).map(r=>r.activity);',1)

# Template instructions and schedule sheet
text = text.replace('["5. Solo el CRONOGRAMA y el logo son obligatorios para generar. Las demás hojas complementan el documento cuando contienen datos."]', '["5. Cada actividad activa del CRONOGRAMA debe tener al menos una fecha o plazo. El logo también es obligatorio. Las demás hojas complementan el documento cuando contienen datos."]', 1)
old_sch = 'const sch=[["Actividad","Responsable","Fecha inicio","Fecha fin"],...payload.schedule.map(r=>[r.activity,r.responsible||"",r.start||"",r.end||""])];const sws=XLSX.utils.aoa_to_sheet(sch);sws["!cols"]=[{wch:45},{wch:40},{wch:16},{wch:16}];XLSX.utils.book_append_sheet(wb,sws,"CRONOGRAMA");'
new_sch = 'const sch=[["Orden","Actividad","Fecha inicio","Fecha fin","Fecha límite","Descripción","Responsable","Observación","Activo"],...payload.schedule.map((r,i)=>[r.order||i+1,r.activity||"",r.start||"",r.end||"",r.deadline||"",r.description||"",r.responsible||"",r.observation||"",r.active===false?"No":"Sí"])];const sws=XLSX.utils.aoa_to_sheet(sch);sws["!cols"]=[{wch:9},{wch:45},{wch:16},{wch:16},{wch:16},{wch:55},{wch:42},{wch:35},{wch:10}];XLSX.utils.book_append_sheet(wb,sws,"CRONOGRAMA");'
if old_sch in text:
    text = text.replace(old_sch,new_sch,1)
elif '"Fecha límite","Descripción","Responsable"' not in text:
    raise SystemExit('No se pudo actualizar plantilla de cronograma')

old_generate = 'if(!scheduleComplete()){alert("Completa las fechas del cronograma.");return;}'
new_generate = 'const scheduleErrors=scheduleValidation();if(scheduleErrors.length){alert("Corrige el cronograma antes de generar el PDF:\\n\\n"+scheduleErrors.join("\\n"));return;}'
if old_generate in text:
    text = text.replace(old_generate,new_generate,1)

path.write_text(text,encoding='utf-8')

# -------------------- full-document.js --------------------
path = Path('trabajo-titulacion/full-document.js')
text = path.read_text(encoding='utf-8')
if 'const SCHEDULE_CONFIG=window.DOC_TIT_TRABAJO_SCHEDULE||{};' not in text:
    text = text.replace('const INDUCTION_CONFIG=window.DOC_TIT_TRABAJO_INDUCTION||{};', 'const INDUCTION_CONFIG=window.DOC_TIT_TRABAJO_INDUCTION||{};\nconst SCHEDULE_CONFIG=window.DOC_TIT_TRABAJO_SCHEDULE||{};', 1)

# Replace section 9 content block with controlled renderer
start = '{"type":"h","text":"9. Cronograma De Actividades","level":1}'
end = '{"type":"h","text":"10. Análisis De Resultados Y Mejora Continua","level":1}'
a = text.index(start)
b = text.index(end,a)
text = text[:a] + start + ',{"type":"scheduleSection"},' + text[b:]

old_render = '''  function renderSchedule(){
    const rows=(ctx.payload.schedule||[]).map(r=>[r.activity,r.description||"",r.responsible||"",fmtDate(r.start),fmtDate(r.end)]);
    apaTable("Cronograma de actividades del período",["Actividad","Descripción","Responsable","Inicio","Fin"],rows,{0:{cellWidth:bodyW*.24},1:{cellWidth:bodyW*.26},2:{cellWidth:bodyW*.24},3:{cellWidth:bodyW*.13},4:{cellWidth:bodyW*.13}});
  }'''
new_render = r'''  function resolveScheduleStructure(){
    const snapshot=ctx.payload?.contentSnapshots?.scheduleStructure;
    if(snapshot&&Array.isArray(snapshot.activities)&&snapshot.activities.length&&Array.isArray(snapshot.phases)&&snapshot.phases.length)return snapshot;
    const current=SCHEDULE_CONFIG;
    if(current&&Array.isArray(current.activities)&&current.activities.length&&Array.isArray(current.phases)&&current.phases.length)return current;
    return null;
  }
  function scheduleDateText(r){
    if(r.start&&r.end)return `${fmtDate(r.start)} – ${fmtDate(r.end)}`;
    if(r.deadline)return `Hasta ${fmtDate(r.deadline)}`;
    if(r.start)return fmtDate(r.start);
    if(r.end)return fmtDate(r.end);
    return "";
  }
  function schedulePdfErrors(rows){
    const errors=[];
    (rows||[]).filter(r=>r.active!==false).forEach((r,i)=>{
      const name=clean(r.activity)||`Actividad ${i+1}`;
      if(!r.start&&!r.end&&!r.deadline)errors.push(`${name}: falta fecha o plazo.`);
      if(r.start&&r.end&&r.end<r.start)errors.push(`${name}: la fecha final no puede ser anterior a la inicial.`);
      const combined=[r.activity,r.description,r.responsible,r.observation].map(clean).join(" ");
      if(/\b(por definir|n\/?a|pendiente|sin fecha)\b/i.test(combined))errors.push(`${name}: contiene un texto no permitido.`);
    });
    return errors;
  }
  function sectionNote(text){
    const raw=clean(text);if(!raw)return;
    ensure(BODY.line*2);
    doc.setFont("times","italic");doc.setFontSize(9.5);
    const lines=doc.splitTextToSize("Nota: "+raw,bodyW);
    doc.text(lines,BODY.left,y);y+=lines.length*14+18;
    doc.setFont("times","normal");doc.setFontSize(12);
  }
  function renderScheduleSection(){
    const structure=resolveScheduleStructure();
    if(!structure)throw new Error("No existe una configuración institucional validada del cronograma de Trabajo de Titulación.");
    paragraph(structure.intro||"");
    heading("9.1. Calendario de Actividades por Proceso",2,true);
    const activeRows=(ctx.payload.schedule||[]).filter(r=>r.active!==false).slice().sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999));
    const errors=schedulePdfErrors(activeRows);
    if(errors.length)throw new Error("El cronograma no está listo para generar: "+errors.join(" "));
    const table=structure.table||{};
    const rows=activeRows.map(r=>[r.activity||"",scheduleDateText(r),r.description||"",r.responsible||""]);
    apaTable(table.title||"Calendario de actividades por proceso",table.columns||["Actividad","Fecha / Plazo","Descripción","Responsable"],rows,{0:{cellWidth:bodyW*.24},1:{cellWidth:bodyW*.17},2:{cellWidth:bodyW*.35},3:{cellWidth:bodyW*.24}},table.note||"");
    heading("9.2. Fases Del Trabajo De Titulación",2,true);
    paragraph(structure.phasesIntro||"");
    (structure.phases||[]).slice().sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999)).forEach((phase,i)=>{
      processNumberedTitle(phase.order||i+1,phase.title||"");
      processText(phase.text||"",1,"o");
    });
    sectionNote(structure.phasesNote||"");
  }'''
if old_render in text:
    text = text.replace(old_render,new_render,1)
elif 'function renderScheduleSection()' not in text:
    raise SystemExit('No se pudo reemplazar renderSchedule()')

text = text.replace('styles:{font:"times",fontSize:8.8,cellPadding:4,textColor:0,overflow:"linebreak",valign:"top"},', 'styles:{font:"times",fontSize:8.8,cellPadding:4,textColor:0,overflow:"linebreak",valign:"top"},\n      showHead:"everyPage",rowPageBreak:"avoid",', 1)
text = text.replace('else if(item.type==="schedule")renderSchedule();','else if(item.type==="scheduleSection")renderScheduleSection();',1)

path.write_text(text,encoding='utf-8')

# -------------------- index.html --------------------
path = Path('trabajo-titulacion/index.html')
text = path.read_text(encoding='utf-8')
# cache bust current scripts
for name in ['content-config.js','requirements-config.js','process-config.js','logistics-config.js','induction-config.js','full-document.js','app.js']:
    text = re.sub(rf'{re.escape(name)}\?v=[^"<]+', f'{name}?v=20260910-section9-1', text)
if 'schedule-config.js' not in text:
    needle='<script src="induction-config.js?v=20260910-section9-1"></script>'
    text=text.replace(needle,needle+'\n<script src="schedule-config.js?v=20260910-section9-1"></script>',1)
path.write_text(text,encoding='utf-8')
