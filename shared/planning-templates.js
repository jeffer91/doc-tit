(() => {
  "use strict";

  const CONFIGS = {
    complexivo: {
      title: "Examen Complexivo",
      base: "UTET-RGI1-01-PRO-56",
      blocks: [
        { key:"cronograma", title:"Cronograma", kind:"complex-schedule", selector:"#scheduleBody", required:true,
          columns:[["activity","Actividad",true],["start","Fecha inicio",true,"date"],["end","Fecha fin",true,"date"]] },
        { key:"distribucion", title:"Distribución de carreras", kind:"complex-distribution", selector:"#distributionBody", required:true,
          columns:[["career","Carrera",true],["place","Lugar / sede",true],["count","Cantidad",true,"number"]] }
      ]
    },
    "trabajo-titulacion": {
      title: "Trabajo de Titulación",
      base: "UGPA-RGI2-01-PRO-56",
      blocks: [
        { key:"cronograma", title:"Cronograma", kind:"generic-schedule", selector:"#scheduleBody", required:true,
          columns:[
            ["activity","Actividad",true],
            ["start","Fecha inicio",false,"date"],
            ["end","Fecha fin",false,"date"],
            ["deadline","Fecha límite",false,"date"],
            ["description","Descripción",false],
            ["responsible","Rol / unidad responsable",false,"role"],
            ["observation","Observación",false],
            ["active","Activo",false,"boolean"]
          ] }
      ]
    },
    "articulo-academico": {
      title: "Artículo Académico",
      base: "UTET-RGI3-01-PRO-56",
      blocks: [
        { key:"cronograma", title:"Cronograma", kind:"generic-schedule", selector:"#scheduleBody", required:true,
          columns:[["activity","Actividad",true],["responsible","Rol / unidad responsable",false,"role"],["start","Fecha inicio",true,"date"],["end","Fecha fin",true,"date"]] },
        { key:"carreras", title:"Distribución de carreras", kind:"generic-table", selector:"#tbody-carreras", table:"carreras",
          columns:[["career","Carrera",true],["modality","Modalidad"],["place","Lugar / sede"],["count","Cantidad",true,"number"]] },
        { key:"refuerzos", title:"Clases de refuerzo", kind:"generic-table", selector:"#tbody-refuerzos", table:"refuerzos",
          columns:[["career","Carrera",true],["responsible","Rol / unidad responsable",false,"role"],["start","Fecha inicio",false,"date"],["end","Fecha fin",false,"date"],["observations","Observaciones"]] },
        { key:"evaluacion", title:"Parámetros de evaluación", kind:"generic-table", selector:"#tbody-evaluacion", table:"evaluacion",
          columns:[["component","Componente",true],["weight","Ponderación %",false,"number"],["condition","Condición / criterio"]] },
        { key:"defensas", title:"Organización de defensas", kind:"generic-table", selector:"#tbody-defensas", table:"defensas",
          columns:[["type","Tipo",true],["career","Carrera"],["start","Fecha inicio",false,"date"],["end","Fecha fin",false,"date"],["mode","Modalidad"],["observations","Observaciones"]] }
      ]
    }
  };

  const ROLE_WORDS = ["coordin","tutor","lector","utet","unidad","estudiante","tribunal","docente","responsable","comité","comite","gestor","secret","vicerrect","carrera","área","area","departamento","dirección","direccion","investigación","investigacion","institucional","equipo"];
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const norm = v => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));

  const documentId = $("[data-doc-tit-navigation]")?.dataset.activeDocument || "";
  const cfg = CONFIGS[documentId];
  if (!cfg) return;

  let activeBlock = null;
  let pending = null;
  let refreshTimer = null;
  let observer = null;

  function period(){
    const s = $("#periodSelect");
    const id = s?.value || "";
    const name = s?.selectedOptions?.[0]?.textContent?.trim() || $("#periodText")?.textContent?.trim() || "";
    const m = id.match(/^(\d{4})-(\d{2})/);
    return { id, name, year:m?.[1] || "", month:m?.[2] || "" };
  }
  function code(){
    const p = period();
    return p.year ? `${cfg.base}-${p.year}-${p.month}` : cfg.base;
  }
  function isRole(v){
    const x = norm(v);
    return !x || ROLE_WORDS.some(w => x.includes(norm(w)));
  }
  function availableBlocks(){
    return cfg.blocks.filter(block => !!$(block.selector));
  }

  function injectCss(){
    if ($("#ptcss")) return;
    const s = document.createElement("style");
    s.id = "ptcss";
    s.textContent = `
      #ptcenter{margin:0 0 18px;background:#fff;border:1px solid #dfe6ef;border-radius:16px;padding:18px;box-shadow:0 8px 24px rgba(11,45,79,.05)}
      .pth{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:13px}.pth h2{margin:3px 0 5px;font-size:20px}.pth p{margin:0;color:#687386;font-size:12px;line-height:1.45}
      .ptrule{max-width:340px;background:#f2faf6;border:1px solid #cfe5d8;border-radius:11px;padding:9px 11px;color:#176c49;font-size:10px}
      .ptgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ptcard{border:1px solid #dfe6ef;border-radius:13px;padding:12px;background:#fbfcfe}
      .pttop{display:flex;justify-content:space-between;gap:10px}.ptcard h3{font-size:14px;margin:0 0 4px}.ptcard p,.ptmeta{font-size:10px;color:#687386;line-height:1.4;margin:0}.ptmeta{margin:9px 0}
      .ptstatus{font-size:9px;font-weight:900;border-radius:999px;padding:4px 7px;white-space:nowrap;background:#f0f3f7;color:#647386}.ptstatus.ok{background:#e7f6ee;color:#18704a}.ptstatus.warn{background:#fff2d8;color:#8a5a09}
      .ptactions{display:flex;gap:6px;flex-wrap:wrap}.ptb{border:0;border-radius:8px;padding:7px 9px;font-size:10px;font-weight:800;cursor:pointer}.ptb.p{background:#1a9ed8;color:#fff}.ptb.s{background:#edf3f8;color:#25425c}.ptb.g{background:transparent;color:#315370;border:1px solid #d5e0e9}
      .ptdetail.ptclosed{display:none!important}#ptmodal{border:0;padding:0;border-radius:18px;width:min(960px,94vw);max-height:90vh;box-shadow:0 35px 90px rgba(0,0,0,.27)}#ptmodal::backdrop{background:rgba(5,18,32,.58)}
      .ptmi{padding:20px}.ptmh{display:flex;justify-content:space-between}.ptmh h2{margin:2px 0}.ptclose{border:0;background:#eef2f6;border-radius:8px;width:32px;height:32px;font-size:20px}
      .ptsteps{display:flex;gap:7px;margin:14px 0}.ptsteps span{font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;background:#f1f4f7;color:#7a8796}.ptsteps .a{background:#e5f4fb;color:#0c729b}
      .ptdrop{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px dashed #b9c9d8;background:#f8fafc;border-radius:12px;padding:14px}.ptdrop span{font-size:10px;color:#758295;flex:1}
      .ptres{margin-top:12px;max-height:45vh;overflow:auto}.ptk{display:flex;gap:7px;flex-wrap:wrap}.ptk span{font-size:10px;background:#f2f4f7;border-radius:999px;padding:5px 8px}
      .ptmsg{font-size:10px;padding:8px 10px;border-radius:9px;margin:7px 0}.ptmsg.bad{background:#fff0ef;color:#902a24}.ptprev{overflow:auto;border:1px solid #dfe6ef;border-radius:9px;margin-top:9px}.ptprev table{width:100%;border-collapse:collapse;min-width:620px}.ptprev th,.ptprev td{font-size:9px;padding:7px;border-bottom:1px solid #edf1f5;text-align:left}.ptprev th{background:#f5f7fa}
      .ptma{display:flex;justify-content:flex-end;gap:7px;margin-top:13px}@media(max-width:800px){.ptgrid{grid-template-columns:1fr}.pth{flex-direction:column}}
    `;
    document.head.appendChild(s);
  }

  function ensureXlsx(){
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise((resolve,reject)=>{
      const s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      s.onload=()=>resolve(window.XLSX);
      s.onerror=()=>reject(new Error("No se pudo cargar Excel"));
      document.head.appendChild(s);
    });
  }

  function fieldValue(input, type){
    if (!input) return "";
    if (type === "boolean") return input.type === "checkbox" ? (input.checked ? "Sí" : "No") : String(input.value || "");
    if (type === "number") return input.value === "" ? "" : Number(input.value);
    return String(input.value ?? "").trim();
  }

  function scheduleActivity(tr){
    return $("[data-f='activity']",tr)?.value?.trim()
      || $(".schedule-activity",tr)?.value?.trim()
      || $("td:nth-child(2) input",tr)?.value?.trim()
      || $("td:first-child strong",tr)?.textContent?.trim()
      || $("td:first-child",tr)?.textContent?.trim()
      || "";
  }

  function rows(block){
    const trs = $$(`${block.selector} tr`);
    if (block.kind === "complex-schedule") {
      return trs.map(tr=>({
        activity: $("td:first-child",tr)?.textContent?.trim() || "",
        start: $(".schedule-start",tr)?.value || "",
        end: $(".schedule-end",tr)?.value || ""
      }));
    }
    if (block.kind === "generic-schedule") {
      return trs.map(tr=>{
        const out={activity:scheduleActivity(tr)};
        block.columns.forEach(col=>{
          const [field,, ,type] = col;
          if(field==="activity") return;
          out[field]=fieldValue($(`[data-f='${field}']`,tr),type);
        });
        return out;
      });
    }
    if (block.kind === "complex-distribution") {
      return trs.map(tr=>({
        career:$(".dist-career",tr)?.value?.trim() || "",
        place:$(".dist-place",tr)?.value?.trim() || "",
        count:$(".dist-count",tr)?.value === "" ? "" : Number($(".dist-count",tr)?.value)
      })).filter(r=>r.career||r.place||r.count!=="");
    }
    return trs.map(tr=>{
      const out={};
      block.columns.forEach(col=>{
        const [field,, ,type]=col;
        out[field]=fieldValue($(`[data-field='${field}']`,tr),type);
        if(type==="role" && out[field] && !isRole(out[field])) out[field]="";
      });
      return out;
    }).filter(row=>Object.values(row).some(v=>String(v).trim()!==""));
  }

  function blockState(block){
    const data=rows(block);
    if(!data.length) return {text:block.required?"Pendiente":"Opcional", cls:"", count:0};
    let bad=false;
    data.forEach(row=>{
      block.columns.forEach(col=>{
        const [field,,required,type]=col;
        const val=row[field];
        if(required && !String(val??"").trim()) bad=true;
        if(type==="role" && val && !isRole(val)) bad=true;
      });
      if(row.start && row.end && row.start>row.end) bad=true;
    });
    if(block.kind.includes("schedule")){
      const active=data.filter(row=>String(row.active??"Sí").toLowerCase()!=="no");
      if(!active.length) bad=true;
      if(documentId==="trabajo-titulacion"){
        if(active.some(r=>!r.start&&!r.end&&!r.deadline)) bad=true;
        const approval=$("#scheduleApprovalState")?.textContent || "";
        if(approval && !/aprobado/i.test(approval)) bad=true;
      } else if(active.some(r=>!r.start||!r.end)) bad=true;
    }
    return {text:bad?"Requiere revisión":"Cargado", cls:bad?"warn":"ok", count:data.length};
  }

  function center(){
    const anchor=documentId==="complexivo"?$(".doc-heading"):$(".toolbar");
    if(!anchor)return;
    let host=$("#ptcenter");
    if(!host){host=document.createElement("section");host.id="ptcenter";anchor.after(host);}
    const blocks=availableBlocks();
    if(!blocks.length){host.remove();return;}
    let html=`<div class="pth"><div><small>INFORMACIÓN REQUERIDA</small><h2>Plantillas de planificación</h2><p>Descarga cada plantilla, complétala y vuelve a subirla. Solo se muestran bloques que existen realmente en este documento.</p></div><div class="ptrule"><b>Planificación institucional</b><br>Usa roles o unidades; evita nombres de personas en campos de responsabilidad.</div></div><div class="ptgrid">`;
    blocks.forEach(block=>{
      const st=blockState(block);
      html+=`<article class="ptcard"><div class="pttop"><div><h3>${esc(block.title)}</h3><p>${block.kind.includes("schedule")?"Actividades y fechas del proceso.":"Información agregada del período."}</p></div><span class="ptstatus ${st.cls}">${st.text}</span></div><div class="ptmeta">${st.cls==="ok"?`${st.count} registro(s) cargado(s)`:block.required?"Necesario para completar el documento":"Información complementaria"}</div><div class="ptactions"><button class="ptb s" data-d="${block.key}">Descargar plantilla</button><button class="ptb p" data-u="${block.key}">${st.cls==="ok"?"Reemplazar datos":"Subir plantilla"}</button><button class="ptb g" data-v="${block.key}">Ver / corregir</button></div></article>`;
    });
    host.innerHTML=html+"</div>";
    $$('[data-d]',host).forEach(b=>b.onclick=()=>download(b.dataset.d));
    $$('[data-u]',host).forEach(b=>b.onclick=()=>openImport(b.dataset.u));
    $$('[data-v]',host).forEach(b=>b.onclick=()=>togglePanel(b.dataset.v));
    blocks.forEach(block=>{
      const panel=$(block.selector)?.closest("section.panel");
      if(panel&&!panel.dataset.pt){panel.dataset.pt="1";panel.classList.add("ptdetail","ptclosed");}
    });
  }

  function togglePanel(key){
    const block=availableBlocks().find(b=>b.key===key);
    const panel=block?$(block.selector)?.closest("section.panel"):null;
    if(!panel)return;
    panel.classList.toggle("ptclosed");
    if(!panel.classList.contains("ptclosed")) panel.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function download(key){
    const block=availableBlocks().find(b=>b.key===key); if(!block)return;
    const X=await ensureXlsx(), wb=X.utils.book_new(), p=period();
    X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([
      [`PLANTILLA · ${cfg.title} · ${block.title}`],
      ["Complete solo la hoja DATOS."],
      ["No cambie META ni los encabezados."],
      ["Mantenga el orden y nombre de actividades cuando sea un cronograma."],
      [`Período: ${p.name}`],
      [`Código: ${code()}`]
    ]),"INSTRUCCIONES");
    X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([
      ["Campo","Valor"],["document_id",documentId],["template_key",block.key],["version","2"],["period_id",p.id],["period_name",p.name],["document_code",code()]
    ]),"META");
    let data=rows(block); if(!data.length)data=[{}];
    X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([block.columns.map(c=>c[1]),...data.map(row=>block.columns.map(c=>row[c[0]]??""))]),"DATOS");
    X.writeFile(wb,`DOC-TIT_${cfg.title}_${block.title}_${p.id}.xlsx`.replace(/[^A-Za-z0-9_.-]+/g,"_"));
  }

  function ensureModal(){
    if($("#ptmodal"))return;
    const d=document.createElement("dialog"); d.id="ptmodal";
    d.innerHTML=`<div class="ptmi"><div class="ptmh"><div><small>IMPORTAR PLANTILLA</small><h2 id="pttitle">Cargar datos</h2></div><button class="ptclose" type="button">×</button></div><div class="ptsteps"><span class="a">1 · Archivo</span><span>2 · Validación</span><span>3 · Confirmación</span></div><label class="ptdrop"><b>Selecciona el Excel</b><span>Debe ser la plantilla descargada desde este bloque.</span><input id="ptfile" type="file" accept=".xlsx,.xls" hidden><button type="button" class="ptb s" id="ptchoose">Elegir archivo</button></label><div class="ptres" id="ptres"></div><div class="ptma"><button class="ptb g" id="ptcancel" type="button">Cancelar</button><button class="ptb p" id="ptapply" type="button" disabled>Cargar datos</button></div></div>`;
    document.body.appendChild(d);
    $(".ptclose",d).onclick=()=>d.close();
    $("#ptcancel",d).onclick=()=>d.close();
    $("#ptchoose",d).onclick=()=>$("#ptfile",d).click();
    $("#ptfile",d).onchange=async e=>{const f=e.target.files?.[0];if(f)await processImport(f);e.target.value="";};
    $("#ptapply",d).onclick=applyImport;
  }

  function openImport(key){
    activeBlock=availableBlocks().find(b=>b.key===key); if(!activeBlock)return;
    pending=null; ensureModal();
    $("#pttitle").textContent=`Cargar ${activeBlock.title}`;
    $("#ptres").innerHTML="";
    $("#ptapply").disabled=true;
    $("#ptmodal").showModal();
  }

  function parseDate(X,v){
    if(!v)return"";
    if(v instanceof Date&&!isNaN(v))return v.toISOString().slice(0,10);
    if(typeof v==="number"){const d=X.SSF.parse_date_code(v);if(d)return`${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;}
    const s=String(v).trim(),m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:m?`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`:"";
  }

  async function processImport(file){
    const X=await ensureXlsx(), wb=X.read(await file.arrayBuffer(),{type:"array",cellDates:true});
    const errors=[], p=period(), meta={};
    const ms=wb.Sheets.META;
    if(ms) X.utils.sheet_to_json(ms,{header:1,defval:""}).slice(1).forEach(r=>{if(r[0])meta[String(r[0])]=String(r[1]??"");});
    else errors.push("Falta la hoja META.");
    if(meta.document_id!==documentId)errors.push("La plantilla corresponde a otra planificación.");
    if(meta.template_key!==activeBlock.key)errors.push("La plantilla corresponde a otro bloque.");
    if(meta.period_id!==p.id)errors.push(`La plantilla es de «${meta.period_name||meta.period_id}» y la app está en «${p.name}».`);
    if(meta.document_code&&meta.document_code!==code())errors.push(`El código ${meta.document_code} no coincide con ${code()}.`);

    const ds=wb.Sheets.DATOS; const parsed=[];
    if(!ds) errors.push("Falta la hoja DATOS.");
    else{
      const grid=X.utils.sheet_to_json(ds,{header:1,defval:""}), headers=(grid[0]||[]).map(String), indexes={};
      activeBlock.columns.forEach(col=>{
        indexes[col[0]]=headers.findIndex(h=>norm(h)===norm(col[1]));
        if(indexes[col[0]]<0)errors.push(`Falta la columna «${col[1]}».`);
      });
      if(!errors.some(x=>x.startsWith("Falta la columna"))){
        grid.slice(1).forEach((row,i)=>{
          const out={};
          activeBlock.columns.forEach(col=>{
            const [field,label,required,type]=col;
            let value=row[indexes[field]];
            if(type==="date")value=parseDate(X,value);
            else if(type==="number")value=String(value??"").trim()===""?"":Number(value);
            else if(type==="boolean")value=/^(si|sí|true|1|activo|activado)$/i.test(String(value??"").trim())?"Sí":/^(no|false|0|inactivo|desactivado)$/i.test(String(value??"").trim())?"No":"";
            else value=String(value??"").trim();
            out[field]=value;
            if(required&&!String(value??"").trim())errors.push(`Fila ${i+2}: «${label}» es obligatorio.`);
            if(type==="role"&&value&&!isRole(value))errors.push(`Fila ${i+2}: «${label}» debe ser un rol o unidad, no un nombre.`);
          });
          if(Object.values(out).some(v=>String(v).trim()!==""))parsed.push(out);
        });
      }
      if(activeBlock.kind.includes("schedule")){
        const existing=rows(activeBlock).map(r=>norm(r.activity));
        if(parsed.length!==existing.length)errors.push(`El cronograma debe contener ${existing.length} actividades.`);
        parsed.forEach((row,i)=>{
          if(existing[i]&&norm(row.activity)!==existing[i])errors.push(`Fila ${i+2}: no cambies el nombre ni el orden de las actividades.`);
          if(row.start&&row.end&&row.start>row.end)errors.push(`Fila ${i+2}: la fecha final no puede ser anterior a la inicial.`);
          if(documentId==="trabajo-titulacion"&&String(row.active||"Sí").toLowerCase()!=="no"&&!row.start&&!row.end&&!row.deadline)errors.push(`Fila ${i+2}: registra al menos una fecha o plazo.`);
        });
      }
    }
    pending={rows:parsed,errors,fileName:file.name};
    $("#ptres").innerHTML=`<div class="ptk"><span><b>${parsed.length}</b> registros</span><span><b>${errors.length}</b> errores</span></div>${errors.length?`<div class="ptmsg bad">${errors.map(x=>"✕ "+esc(x)).join("<br>")}</div>`:""}<div class="ptprev"><table><thead><tr>${activeBlock.columns.map(c=>`<th>${esc(c[1])}</th>`).join("")}</tr></thead><tbody>${parsed.slice(0,8).map(row=>`<tr>${activeBlock.columns.map(c=>`<td>${esc(row[c[0]]??"")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    $("#ptapply").disabled=!!errors.length||!parsed.length;
  }

  function setInput(input,value,eventType="change"){
    if(!input)return;
    if(input.type==="checkbox") input.checked=String(value).toLowerCase()!=="no";
    else input.value=value??"";
    input.dispatchEvent(new Event(eventType,{bubbles:true}));
    if(eventType!=="change")input.dispatchEvent(new Event("change",{bubbles:true}));
  }

  function applyImport(){
    if(!pending||pending.errors.length||!activeBlock)return;
    const imported=pending.rows, block=activeBlock;
    if(block.kind==="complex-schedule"||block.kind==="generic-schedule"){
      $$(`${block.selector} tr`).forEach((tr,i)=>{
        const row=imported[i]; if(!row)return;
        block.columns.forEach(col=>{
          const [field,, ,type]=col;
          if(field==="activity")return;
          const input=block.kind==="complex-schedule"
            ? (field==="start"?$(".schedule-start",tr):field==="end"?$(".schedule-end",tr):null)
            : $(`[data-f='${field}']`,tr);
          setInput(input,row[field],type==="boolean"?"change":"change");
        });
      });
    } else if(block.kind==="complex-distribution"){
      const tb=$(block.selector); if(!tb)return;
      while(tb.rows.length>Math.max(1,imported.length)) $(".row-remove",tb)?.click();
      while(tb.rows.length<imported.length) $("#addDistributionRowBtn")?.click();
      $$(`${block.selector} tr`).forEach((tr,i)=>{
        const row=imported[i];if(!row)return;
        setInput($(".dist-career",tr),row.career,"input");
        setInput($(".dist-place",tr),row.place,"input");
        setInput($(".dist-count",tr),row.count,"input");
      });
    } else {
      const tb=$(block.selector); if(!tb)return;
      const panel=tb.closest("section.panel"), add=panel?.querySelector(`[data-add='${block.table}']`);
      while(tb.rows.length>Math.max(1,imported.length)) $(".row-remove",tb)?.click();
      while(tb.rows.length<imported.length)add?.click();
      $$(`${block.selector} tr`).forEach((tr,i)=>{
        const row=imported[i];if(!row)return;
        block.columns.forEach(col=>setInput($(`[data-field='${col[0]}']`,tr),row[col[0]]));
      });
    }
    try{
      localStorage.setItem(`doc-tit-import-source::${documentId}`,JSON.stringify({name:pending.fileName,at:new Date().toISOString(),periodId:period().id}));
    }catch(_){}
    $("#ptmodal").close(); pending=null;
    scheduleRefresh();
    document.dispatchEvent(new CustomEvent("doc-tit:template-applied",{detail:{documentId,block:block.key}}));
  }

  function applyRoleGuards(){
    if(documentId==="trabajo-titulacion"){
      $$("#scheduleBody [data-f='responsible']").forEach(i=>i.dataset.roleOnly="1");
    }else if(documentId==="articulo-academico"){
      $$("#scheduleBody [data-f='responsible'],#tbody-refuerzos [data-field='responsible']").forEach(i=>i.dataset.roleOnly="1");
    }
  }

  function installRoleGuard(){
    if(document.documentElement.dataset.ptRoleGuard)return;
    document.documentElement.dataset.ptRoleGuard="1";
    document.addEventListener("change",e=>{
      const input=e.target;
      if(input?.dataset?.roleOnly==="1"&&!isRole(input.value)){
        input.value="";
        input.setCustomValidity("Registra un rol o unidad institucional, no el nombre de una persona.");
        input.reportValidity();
        setTimeout(()=>input.setCustomValidity(""),2000);
      }
    },true);
  }

  function patchComplexivoCode(){
    if(documentId!=="complexivo")return;
    const c=code();
    [$("#docCodeBadge"),$("#docCode")].filter(Boolean).forEach(el=>el.textContent=c);
    $$(".auto-row").forEach(row=>{if(norm($("span",row)?.textContent)==="codigo"){const v=$("strong",row);if(v)v.textContent=c;}});
  }

  function refresh(){
    refreshTimer=null;
    $("#downloadTemplateBtn")?.style.setProperty("display","none");
    const nativeImport=$("#importInput");
    if(nativeImport){nativeImport.style.display="none";nativeImport.closest("label")?.style.setProperty("display","none");}
    applyRoleGuards();
    center();
    patchComplexivoCode();
  }
  function scheduleRefresh(){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(refresh,80);
  }
  function watchDom(){
    const dynamic=$("#dynamicSections")||$("#documentForm")||document.body;
    if(observer)observer.disconnect();
    observer=new MutationObserver(scheduleRefresh);
    observer.observe(dynamic,{childList:true,subtree:true});
    document.addEventListener("change",scheduleRefresh,true);
    document.addEventListener("input",scheduleRefresh,true);
    $("#periodSelect")?.addEventListener("change",()=>setTimeout(scheduleRefresh,80));
  }

  injectCss();
  ensureModal();
  installRoleGuard();
  refresh();
  watchDom();
})();