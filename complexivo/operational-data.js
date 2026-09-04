(() => {
  "use strict";

  const ns=window.DOC_TIT_COMPLEXIVO_PDF=window.DOC_TIT_COMPLEXIVO_PDF||{};
  const STATUS_OPTIONS=["Planificado","En proceso","Completado"];

  function periodKey(){
    return document.querySelector("#periodSelect")?.value||"sin-periodo";
  }
  function storageKey(){ return `doc-tit-complexivo-operational-v2::${periodKey()}`; }
  function escapeHtml(v){ return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }
  function escapeAttr(v){ return escapeHtml(v); }
  function defaults(){ return (ns.operationalDefaults||[]).map(r=>({...r})); }
  function nucleusDefaults(){ return [1,2,3,4].map(n=>({id:`nucleus${n}`,nucleus:`Núcleo ${n}`,date:"",career:"",teacher:"",guide:"",material:"",classroom:"",evidence:""})); }

  function loadStored(){
    try{
      return JSON.parse(localStorage.getItem(storageKey())||"{}")||{};
    }catch{
      return {};
    }
  }

  function formatRange(start,end){
    const fmt=v=>{
      if(!v) return "";
      const d=new Date(v+"T12:00:00");
      return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
    };
    if(start&&end) return `${fmt(start)} – ${fmt(end)}`;
    return fmt(start||end);
  }

  function scheduleRangeForNucleus(n){
    const rows=[...document.querySelectorAll("#scheduleBody tr")];
    const row=rows[n+1];
    if(!row) return "";
    return formatRange(row.querySelector(".schedule-start")?.value,row.querySelector(".schedule-end")?.value);
  }

  function renderOperationalRows(rows){
    const tbody=document.querySelector("#operationalPlanBody");
    if(!tbody) return;
    tbody.innerHTML=rows.map(r=>`
      <tr data-id="${escapeAttr(r.id)}">
        <td class="op-activity"><strong>${escapeHtml(r.activity)}</strong></td>
        <td><input class="op-start" type="date" value="${escapeAttr(r.start||"")}"></td>
        <td><input class="op-deadline" type="date" value="${escapeAttr(r.deadline||"")}"></td>
        <td><textarea class="op-responsible" rows="2">${escapeHtml(r.responsible||"")}</textarea></td>
        <td><textarea class="op-coordination" rows="2">${escapeHtml(r.coordination||"")}</textarea></td>
        <td><input class="op-person" type="text" value="${escapeAttr(r.person||"")}" placeholder="Nombre, si se dispone"></td>
        <td><textarea class="op-product" rows="2">${escapeHtml(r.product||"")}</textarea></td>
        <td><textarea class="op-evidence" rows="2">${escapeHtml(r.evidence||"")}</textarea></td>
        <td><select class="op-status">${STATUS_OPTIONS.map(s=>`<option value="${s}" ${s===(r.status||"Planificado")?"selected":""}>${s}</option>`).join("")}</select></td>
        <td><textarea class="op-observations" rows="2" placeholder="Novedades del período">${escapeHtml(r.observations||"")}</textarea></td>
      </tr>`).join("");
  }

  function renderNucleusRows(rows){
    const tbody=document.querySelector("#nucleusPlanBody");
    if(!tbody) return;
    tbody.innerHTML=rows.map((r,i)=>`
      <tr data-id="${escapeAttr(r.id)}">
        <td><strong>${escapeHtml(r.nucleus)}</strong></td>
        <td><input class="nuc-date" type="text" value="${escapeAttr(r.date||scheduleRangeForNucleus(i+1))}" placeholder="Fecha o rango"></td>
        <td><input class="nuc-career" type="text" value="${escapeAttr(r.career||"")}" placeholder="Carrera o grupo"></td>
        <td><input class="nuc-teacher" type="text" value="${escapeAttr(r.teacher||"")}" placeholder="Docente responsable"></td>
        <td><select class="nuc-guide"><option value="">Por registrar</option><option value="Sí" ${r.guide==="Sí"?"selected":""}>Sí</option><option value="No" ${r.guide==="No"?"selected":""}>No</option></select></td>
        <td><select class="nuc-material"><option value="">Por registrar</option><option value="Sí" ${r.material==="Sí"?"selected":""}>Sí</option><option value="No" ${r.material==="No"?"selected":""}>No</option></select></td>
        <td><input class="nuc-classroom" type="text" value="${escapeAttr(r.classroom||"")}" placeholder="Aula / recurso"></td>
        <td><input class="nuc-evidence" type="text" value="${escapeAttr(r.evidence||"")}" placeholder="Evidencia"></td>
      </tr>`).join("");
  }

  function collectOperationalRows(){
    return [...document.querySelectorAll("#operationalPlanBody tr")].map(tr=>({
      id:tr.dataset.id,
      activity:tr.querySelector(".op-activity")?.innerText.trim()||"",
      start:tr.querySelector(".op-start")?.value||"",
      deadline:tr.querySelector(".op-deadline")?.value||"",
      responsible:tr.querySelector(".op-responsible")?.value.trim()||"",
      coordination:tr.querySelector(".op-coordination")?.value.trim()||"",
      person:tr.querySelector(".op-person")?.value.trim()||"",
      product:tr.querySelector(".op-product")?.value.trim()||"",
      evidence:tr.querySelector(".op-evidence")?.value.trim()||"",
      status:tr.querySelector(".op-status")?.value||"Planificado",
      observations:tr.querySelector(".op-observations")?.value.trim()||""
    }));
  }

  function collectNucleusRows(){
    return [...document.querySelectorAll("#nucleusPlanBody tr")].map((tr,i)=>({
      id:tr.dataset.id,
      nucleus:`Núcleo ${i+1}`,
      date:tr.querySelector(".nuc-date")?.value.trim()||scheduleRangeForNucleus(i+1),
      career:tr.querySelector(".nuc-career")?.value.trim()||"",
      teacher:tr.querySelector(".nuc-teacher")?.value.trim()||"",
      guide:tr.querySelector(".nuc-guide")?.value||"",
      material:tr.querySelector(".nuc-material")?.value||"",
      classroom:tr.querySelector(".nuc-classroom")?.value.trim()||"",
      evidence:tr.querySelector(".nuc-evidence")?.value.trim()||""
    }));
  }

  function save(){
    if(!document.querySelector("#operationalPlanBody")) return;
    try{
      localStorage.setItem(storageKey(),JSON.stringify({operationalPlan:collectOperationalRows(),nucleusPlan:collectNucleusRows()}));
    }catch(err){
      console.warn("No se pudieron guardar los datos operativos localmente.",err);
    }
  }

  function load(){
    const stored=loadStored();
    const defaultsById=new Map(defaults().map(r=>[r.id,r]));
    const savedById=new Map((stored.operationalPlan||[]).map(r=>[r.id,r]));
    renderOperationalRows([...defaultsById.values()].map(base=>({...base,...(savedById.get(base.id)||{})})));

    const nucleusById=new Map((stored.nucleusPlan||[]).map(r=>[r.id,r]));
    renderNucleusRows(nucleusDefaults().map(base=>({...base,...(nucleusById.get(base.id)||{})})));
  }

  function injectStyles(){
    if(document.querySelector("#operationalDataStyles")) return;
    const style=document.createElement("style");
    style.id="operationalDataStyles";
    style.textContent=`
      .operational-table-wrap{overflow:auto;border:1px solid #dbe3ea;border-radius:12px;margin-top:14px}
      .operational-table{border-collapse:collapse;min-width:1900px;width:100%;font-size:12px}
      .operational-table.nucleus{min-width:1280px}
      .operational-table th,.operational-table td{border-bottom:1px solid #e7edf2;padding:8px;vertical-align:top;text-align:left}
      .operational-table th{background:#f5f8fb;position:sticky;top:0;z-index:1;white-space:nowrap}
      .operational-table input,.operational-table textarea,.operational-table select{width:100%;box-sizing:border-box;border:1px solid #c9d5df;border-radius:7px;padding:7px;background:white;font:inherit;min-width:100px}
      .operational-table textarea{resize:vertical;min-width:170px}
      .operational-table .op-activity{min-width:260px;max-width:300px}
      .operational-note{font-size:12px;color:#5c6a76;margin-top:10px;line-height:1.45}
      .operational-subtitle{margin:22px 0 4px;font-size:15px}
    `;
    document.head.appendChild(style);
  }

  function injectPanel(){
    if(document.querySelector("#operationalDataPanel")) return;
    const smart=document.querySelector(".smart-panel");
    if(!smart) return;
    const panel=document.createElement("section");
    panel.className="panel";
    panel.id="operationalDataPanel";
    panel.innerHTML=`
      <div class="panel-head"><div><span class="eyebrow">3. Plan operativo y núcleos</span><h3>Actividades, responsables, fechas y evidencias</h3><p class="section-help">Completa las fechas y datos reales del período. Las fechas no se inventan; si todavía no están definidas, pueden quedar pendientes hasta contar con la programación aprobada.</p></div></div>
      <h4 class="operational-subtitle">Plan operativo del Examen Complexivo</h4>
      <div class="operational-table-wrap"><table class="operational-table"><thead><tr><th>Actividad</th><th>Inicio</th><th>Fecha límite</th><th>Responsable principal</th><th>Área de coordinación</th><th>Persona responsable</th><th>Producto esperado</th><th>Evidencia</th><th>Estado</th><th>Observaciones</th></tr></thead><tbody id="operationalPlanBody"></tbody></table></div>
      <p class="operational-note">Estas actividades alimentan directamente la sección 3.11 del PDF y permiten documentar la preparación, configuración, prueba, aplicación y cierre.</p>
      <h4 class="operational-subtitle">Docentes y control de los cuatro Núcleos de Titulación</h4>
      <div class="operational-table-wrap"><table class="operational-table nucleus"><thead><tr><th>Núcleo</th><th>Fecha</th><th>Carrera</th><th>Docente responsable</th><th>Guía entregada</th><th>Material cargado</th><th>Aula</th><th>Evidencia</th></tr></thead><tbody id="nucleusPlanBody"></tbody></table></div>
    `;
    smart.parentNode.insertBefore(panel,smart);
    panel.addEventListener("input",save);
    panel.addEventListener("change",save);
    load();
  }

  function wrapPdfGenerator(){
    const target=window.DocTitFullDocument;
    if(!target?.generateAndDownload || target.__operationalWrapped) return;
    const original=target.generateAndDownload.bind(target);
    target.generateAndDownload=async function(ctx,filename){
      save();
      ctx={...ctx,operationalPlan:collectOperationalRows(),nucleusPlan:collectNucleusRows()};
      return original(ctx,filename);
    };
    target.__operationalWrapped=true;
  }

  function init(){
    injectStyles();
    injectPanel();
    wrapPdfGenerator();
    document.querySelector("#periodSelect")?.addEventListener("change",()=>setTimeout(load,0));
    const title=document.querySelector("#docTitle");
    if(title){
      new MutationObserver(()=>setTimeout(load,0)).observe(title,{childList:true,subtree:true,characterData:true});
    }
    document.querySelector("#scheduleBody")?.addEventListener("change",()=>{
      const stored=loadStored();
      if(!(stored.nucleusPlan||[]).some(r=>r.date)) renderNucleusRows(nucleusDefaults());
    });
  }

  init();
  window.DocTitComplexivoOperationalData={collectOperationalRows,collectNucleusRows,save,load};
})();
