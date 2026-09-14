(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  if(nav?.dataset.activeDocument!=="trabajo-titulacion")return;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const EMPTY_MARK="—";
  const SEED_ACTIVITIES=new Set([
    "Asignación de Tutor y Lector","Reunión Inicial con Tutor","Entrega del Primer Borrador",
    "Retroalimentación del Primer Borrador","Entrega del Segundo Borrador","Retroalimentación del Segundo Borrador",
    "Entrega del Tercer Borrador","Aprobación Final del Tercer Borrador por Tutor","Revisión del Proyecto por el Lector",
    "Aprobación Final del Proyecto","Confirmación de Fecha de Defensa","Preparación para la Defensa",
    "Defensa de Tesis","Registro Final de Calificaciones"
  ]);
  let parsedImport=null;
  let cleaning=false;
  let refreshTimer=null;

  function norm(v){return String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
  function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));}
  function period(){
    const select=$("#periodSelect");
    return {id:select?.value||"",name:select?.selectedOptions?.[0]?.textContent?.trim()||$("#periodText")?.textContent?.trim()||""};
  }
  function scheduleRows(){return $$("#scheduleBody tr");}
  function rowActivity(row){return $("[data-f='activity']",row)?.value?.trim()||"";}
  function rowActive(row){return !!$("[data-f='active']",row)?.checked;}
  function hasDates(row){return ["start","end","deadline"].some(key=>!!$("[data-f='"+key+"']",row)?.value);}
  function change(input,value){
    if(!input)return;
    if(input.type==="checkbox"){
      const next=!!value;if(input.checked===next)return;input.checked=next;
    }else{
      const next=String(value??"");if(input.value===next)return;input.value=next;
    }
    input.dispatchEvent(new Event("change",{bubbles:true}));
  }
  function markEmpty(row){
    change($("[data-f='activity']",row),EMPTY_MARK);
    ["start","end","deadline"].forEach(k=>change($("[data-f='"+k+"']",row),""));
    change($("[data-f='active']",row),false);
  }
  function hideEmptyRows(){
    scheduleRows().forEach(row=>{
      const empty=rowActivity(row)===EMPTY_MARK&&!rowActive(row)&&!hasDates(row);
      row.classList.toggle("doc-tit-empty-schedule-row",empty);
    });
    const card=$$("#ptcenter .ptcard").find(c=>$("[data-u='cronograma']",c));
    if(card&&/^cargado$/i.test(String($(".ptstatus",card)?.textContent||"").trim())){
      const count=scheduleRows().filter(r=>rowActive(r)&&rowActivity(r)!==EMPTY_MARK).length;
      const meta=$(".ptmeta",card);if(meta)meta.textContent=`${count} actividad${count===1?"":"es"} cargada${count===1?"":"s"}`;
    }
  }
  function removeLegacySeedIfPristine(){
    if(cleaning)return;
    const rows=scheduleRows();if(rows.length<SEED_ACTIVITIES.size)return;
    const first=rows.slice(0,SEED_ACTIVITIES.size);
    const allSeed=first.every(r=>SEED_ACTIVITIES.has(rowActivity(r))||rowActivity(r)===EMPTY_MARK);
    const anyEntered=first.some(r=>hasDates(r));
    const hasCustomActive=rows.slice(SEED_ACTIVITIES.size).some(r=>rowActive(r)&&rowActivity(r)&&rowActivity(r)!==EMPTY_MARK);
    if(!allSeed||anyEntered||hasCustomActive){hideEmptyRows();return;}
    cleaning=true;
    first.forEach(row=>{
      if(rowActivity(row)!==EMPTY_MARK)markEmpty(row);
    });
    cleaning=false;
    hideEmptyRows();
  }

  function ensureStyle(){
    if($("#workScheduleTemplateStyle"))return;
    const style=document.createElement("style");style.id="workScheduleTemplateStyle";
    style.textContent=`
      #scheduleBody tr.doc-tit-empty-schedule-row{display:none!important}
      #workScheduleImport{border:0;border-radius:14px;padding:0;width:min(860px,94vw);max-height:90vh;box-shadow:0 26px 70px rgba(15,35,55,.28)}
      #workScheduleImport::backdrop{background:rgba(13,29,44,.54)}
      .wsi{padding:18px}.wsi-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.wsi-head h2{margin:2px 0 4px;font-size:18px}.wsi-head p{margin:0;color:#6d7a88;font-size:11px;line-height:1.45}.wsi-x{border:0;background:#eef2f6;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:18px}
      .wsi-file{margin-top:14px;border:1px dashed #b9c8d6;background:#f8fafc;border-radius:10px;padding:13px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.wsi-file input{font-size:11px}.wsi-note{font-size:10px;color:#697787;flex:1}
      .wsi-status{margin-top:10px;font-size:10px;border-radius:8px;padding:9px 10px;background:#f1f5f8;color:#526474}.wsi-status.bad{background:#fff0ed;color:#92372f}.wsi-status.ok{background:#eaf7ef;color:#216c48}
      .wsi-preview{margin-top:10px;max-height:42vh;overflow:auto;border:1px solid #e0e6eb;border-radius:9px}.wsi-preview table{width:100%;border-collapse:collapse;min-width:600px}.wsi-preview th,.wsi-preview td{padding:7px 8px;border-bottom:1px solid #edf1f4;text-align:left;font-size:9.5px}.wsi-preview th{background:#f5f7f9;color:#43576a;position:sticky;top:0}.wsi-preview .phase td{background:#f6f9fb;font-weight:800;color:#24425d}
      .wsi-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:12px}.wsi-actions button{border:0;border-radius:8px;padding:8px 11px;font-size:10px;font-weight:800;cursor:pointer}.wsi-cancel{background:#eef2f5;color:#34516b}.wsi-apply{background:#0b4b7d;color:white}.wsi-apply:disabled{opacity:.45;cursor:not-allowed}
    `;
    document.head.appendChild(style);
  }
  function ensureXlsx(){
    if(window.XLSX)return Promise.resolve(window.XLSX);
    return new Promise((resolve,reject)=>{
      const script=document.createElement("script");script.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.onload=()=>resolve(window.XLSX);script.onerror=()=>reject(new Error("No se pudo cargar el lector de Excel."));document.head.appendChild(script);
    });
  }
  function excelPeriodName(){return period().name.replace(/\s*[–—-]\s*/g," a ");}
  function exampleDate(){
    const m=period().id.match(/^(\d{4})-(\d{2})/);if(!m)return"DD/MM/AAAA";
    return `01/${m[2]}/${m[1]}`;
  }
  async function downloadTemplate(){
    const X=await ensureXlsx(),book=X.utils.book_new(),d=exampleDate();
    const data=[
      ["Trabajo de titulación","", ""],
      [excelPeriodName(),"", ""],
      ["Fase 1: Inicio y planificación","", ""],
      ["Actividad","Fecha inicio","Fecha fin"],
      ["Ejemplo: Nombre de la actividad",d,d],
      ["","", ""],
      ["Fase 2: Desarrollo y tutorías","", ""],
      ["Actividad","Fecha inicio","Fecha fin"],
      ["Ejemplo: Nombre de la actividad",d,d],
      ["","", ""],
      ["Fase 3: Defensa final","", ""],
      ["Actividad","Fecha inicio","Fecha fin"],
      ["Ejemplo: Nombre de la actividad",d,d]
    ];
    const sheet=X.utils.aoa_to_sheet(data);
    sheet["!cols"]=[{wch:48},{wch:16},{wch:16}];
    X.utils.book_append_sheet(book,sheet,"CRONOGRAMA");
    const p=period();
    X.writeFile(book,`DOC-TIT_Trabajo_de_Titulacion_Cronograma_${p.id}.xlsx`);
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
  function periodMatches(grid){
    const p=norm(period().name),tokens=p.match(/(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{4}/g)||[];
    if(!tokens.length)return true;
    const top=norm(grid.slice(0,5).flat().join(" "));
    return tokens.every(t=>top.includes(t));
  }
  async function parseFile(file){
    const X=await ensureXlsx(),book=X.read(await file.arrayBuffer(),{type:"array",cellDates:true});
    const errors=[];
    if(book.SheetNames.length!==1)errors.push("El Excel debe tener una sola hoja.");
    const sheet=book.Sheets[book.SheetNames[0]],grid=sheet?X.utils.sheet_to_json(sheet,{header:1,defval:"",raw:true}):[];
    if(!grid.length)errors.push("La hoja está vacía.");
    if(grid.length&&!periodMatches(grid))errors.push(`El período del archivo no coincide con «${period().name}».`);
    const rows=[];let currentPhase="";let headerSeen=false;
    grid.forEach((row,index)=>{
      const a=String(row?.[0]??"").trim(),b=row?.[1]??"",c=row?.[2]??"";
      if(!a&&!String(b).trim()&&!String(c).trim())return;
      if(/^fase\s*\d*\s*:/i.test(a)) {currentPhase=a;return;}
      const na=norm(a),nb=norm(b),nc=norm(c);
      if(na==="actividad"&&nb==="fecha inicio"&&nc==="fecha fin"){headerSeen=true;return;}
      if(/^ejemplo\s*:/i.test(a))return;
      if(!headerSeen)return;
      if(!a){errors.push(`Fila ${index+1}: falta la actividad.`);return;}
      const start=excelDate(b,X),end=excelDate(c,X);
      if(!start||!end){errors.push(`Fila ${index+1}: usa fechas válidas en formato DD/MM/AAAA.`);return;}
      if(end<start){errors.push(`Fila ${index+1}: la fecha fin no puede ser anterior a la fecha inicio.`);return;}
      rows.push({phase:currentPhase,activity:a,start,end,sourceRow:index+1});
    });
    if(!headerSeen)errors.push("No se encontró el encabezado: Actividad | Fecha inicio | Fecha fin.");
    if(!rows.length&&!errors.length)errors.push("No se encontraron actividades para importar.");
    return {rows,errors};
  }

  function ensureModal(){
    ensureStyle();let dialog=$("#workScheduleImport");if(dialog)return dialog;
    dialog=document.createElement("dialog");dialog.id="workScheduleImport";
    dialog.innerHTML=`<div class="wsi"><div class="wsi-head"><div><h2>Subir cronograma</h2><p>Una sola hoja. Puedes organizar las actividades por fases y repetir el encabezado en cada fase.</p></div><button class="wsi-x" type="button" aria-label="Cerrar">×</button></div><div class="wsi-file"><input type="file" accept=".xlsx,.xls" id="workScheduleFile"><span class="wsi-note">Formato esperado: Actividad · Fecha inicio · Fecha fin</span></div><div class="wsi-status">Selecciona el Excel del cronograma.</div><div class="wsi-preview" hidden></div><div class="wsi-actions"><button type="button" class="wsi-cancel">Cancelar</button><button type="button" class="wsi-apply" disabled>Aplicar cronograma</button></div></div>`;
    document.body.appendChild(dialog);
    $(".wsi-x",dialog).onclick=()=>dialog.close();$(".wsi-cancel",dialog).onclick=()=>dialog.close();
    $("#workScheduleFile",dialog).onchange=async event=>{
      parsedImport=null;const file=event.target.files?.[0],status=$(".wsi-status",dialog),preview=$(".wsi-preview",dialog),apply=$(".wsi-apply",dialog);
      preview.hidden=true;preview.innerHTML="";apply.disabled=true;
      if(!file){status.className="wsi-status";status.textContent="Selecciona el Excel del cronograma.";return;}
      try{
        const result=await parseFile(file);parsedImport=result;
        if(result.errors.length){status.className="wsi-status bad";status.innerHTML=result.errors.map(esc).join("<br>");return;}
        status.className="wsi-status ok";status.textContent=`${result.rows.length} actividades listas para importar.`;
        let last="",html='<table><thead><tr><th>Fase</th><th>Actividad</th><th>Fecha inicio</th><th>Fecha fin</th></tr></thead><tbody>';
        result.rows.forEach(r=>{const phase=r.phase||"Sin fase";html+=`<tr class="${phase!==last?"phase":""}"><td>${esc(phase!==last?phase:"")}</td><td>${esc(r.activity)}</td><td>${esc(r.start)}</td><td>${esc(r.end)}</td></tr>`;last=phase;});
        preview.innerHTML=html+"</tbody></table>";preview.hidden=false;apply.disabled=false;
      }catch(error){status.className="wsi-status bad";status.textContent=error?.message||"No se pudo leer el Excel.";}
    };
    $(".wsi-apply",dialog).onclick=()=>applyImport(dialog);
    return dialog;
  }

  function setRow(row,data){
    change($("[data-f='activity']",row),data.activity);
    change($("[data-f='start']",row),data.start);
    change($("[data-f='end']",row),data.end);
    change($("[data-f='deadline']",row),"");
    change($("[data-f='description']",row),"");
    change($("[data-f='responsible']",row),"");
    change($("[data-f='observation']",row),data.phase||"");
    change($("[data-f='active']",row),true);
  }
  function applyImport(dialog){
    if(!parsedImport||parsedImport.errors.length||!parsedImport.rows.length)return;
    cleaning=true;
    let rows=scheduleRows();
    rows.slice(0,SEED_ACTIVITIES.size).forEach(markEmpty);
    let custom=rows.slice(SEED_ACTIVITIES.size);
    while(custom.length<parsedImport.rows.length){
      $("#addScheduleBtn")?.click();rows=scheduleRows();custom=rows.slice(SEED_ACTIVITIES.size);
      if(custom.length===0)break;
    }
    parsedImport.rows.forEach((data,i)=>{if(custom[i])setRow(custom[i],data);});
    custom.slice(parsedImport.rows.length).forEach(markEmpty);
    cleaning=false;
    hideEmptyRows();
    dialog.close();
    document.dispatchEvent(new CustomEvent("doc-tit:template-applied",{detail:{documentId:"trabajo-titulacion",block:"cronograma",rows:parsedImport.rows.length}}));
    window.setTimeout(()=>{$("#saveBtn")?.click();document.dispatchEvent(new Event("change",{bubbles:true}));},120);
    parsedImport=null;
  }
  function openUpload(){
    const dialog=ensureModal();parsedImport=null;
    const file=$("#workScheduleFile",dialog),status=$(".wsi-status",dialog),preview=$(".wsi-preview",dialog),apply=$(".wsi-apply",dialog);
    if(file)file.value="";if(status){status.className="wsi-status";status.textContent="Selecciona el Excel del cronograma.";}if(preview){preview.hidden=true;preview.innerHTML="";}if(apply)apply.disabled=true;
    dialog.showModal();
  }

  function intercept(event){
    const button=event.target?.closest?.("[data-d='cronograma'],[data-u='cronograma']");if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(button.hasAttribute("data-d"))downloadTemplate();else openUpload();
  }
  document.addEventListener("click",intercept,true);

  function scheduleRefresh(){if(refreshTimer)return;refreshTimer=setTimeout(()=>{refreshTimer=null;removeLegacySeedIfPristine();hideEmptyRows();},70);}
  new MutationObserver(scheduleRefresh).observe(document.body,{childList:true,subtree:true});
  document.addEventListener("change",scheduleRefresh,true);
  document.addEventListener("doc-tit:section-changed",scheduleRefresh);

  ensureStyle();scheduleRefresh();
  window.DOC_TIT_WORK_SCHEDULE_TEMPLATE={downloadTemplate,openUpload};
})();
