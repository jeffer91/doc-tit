(() => {
  "use strict";

  const TABLES = [
    {
      id: "schedule",
      title: "Cronograma general",
      description: "Fechas de las nueve actividades del proceso.",
      required: true,
      target: "#scheduleBody",
      sheet: "Cronograma"
    },
    {
      id: "distribution",
      title: "Distribución de estudiantes",
      description: "Carrera, lugar de ejecución y cantidad de estudiantes.",
      required: true,
      target: "#distributionBody",
      sheet: "Distribucion"
    },
    {
      id: "operational",
      title: "Plan operativo",
      description: "Responsables, fechas, productos, evidencias y estado de las actividades.",
      required: false,
      target: "#operationalPlanBody",
      sheet: "Plan_Operativo"
    },
    {
      id: "nuclei",
      title: "Núcleos de Titulación",
      description: "Registro operativo complementario de los cuatro núcleos.",
      required: false,
      target: "#nucleusPlanBody",
      sheet: "Nucleos"
    }
  ];

  const RESOURCE_BLOCKS = [
    {id:"logo",title:"Logo institucional",description:"Recurso obligatorio para la cabecera del documento.",target:"#logoUpload",required:true}
  ];

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
  const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

  let importMode = "all";
  let refreshTimer = null;

  function injectStyles(){
    if($("#docDataWorkspaceStyles")) return;
    const style=document.createElement("style");
    style.id="docDataWorkspaceStyles";
    style.textContent=`
      .legacy-requirements-panel{display:none!important}
      .data-workspace{border:1px solid #d9e3ec;background:#fff;padding:0;overflow:hidden}
      .data-workspace-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid #e5ebf0}
      .data-workspace-head h3{margin:4px 0 6px;font-size:20px;color:#102c46}
      .data-workspace-head p{margin:0;color:#667687;font-size:13px;line-height:1.5;max-width:680px}
      .data-workspace-status{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800;background:#fff1ef;color:#a13d31;white-space:nowrap}
      .data-workspace-status.ready{background:#e8f5ee;color:#23704b}
      .data-workspace-summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 24px;background:#f7f9fb;border-bottom:1px solid #e5ebf0}
      .data-workspace-summary strong{display:block;color:#16334f;font-size:13px;margin-bottom:3px}
      .data-workspace-summary span{font-size:11px;color:#617284}
      .data-workspace-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      .data-workspace-actions button,.data-card-actions button{border:0;border-radius:8px;padding:8px 12px;font:inherit;font-size:11px;font-weight:700;cursor:pointer;background:#e9eff5;color:#173755}
      .data-workspace-actions button.primary-action,.data-card-actions button.primary-action{background:#153b62;color:#fff}
      .data-workspace-actions button:hover,.data-card-actions button:hover{filter:brightness(.97)}
      .data-group-title{padding:20px 24px 8px;color:#647589;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
      .data-card-list{padding:0 16px 10px;display:grid;gap:10px}
      .data-card{border:1px solid #e0e7ee;border-radius:12px;padding:15px 16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px 18px;align-items:center;background:#fff}
      .data-card:hover{border-color:#c9d7e3;box-shadow:0 3px 12px rgba(22,53,82,.05)}
      .data-card-main{min-width:0}
      .data-card-title-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:5px}
      .data-card-title{font-size:13px;font-weight:800;color:#142e48}
      .data-card-status{font-size:9px;font-weight:800;border-radius:999px;padding:4px 8px;background:#eef2f6;color:#607183}
      .data-card-status.complete{background:#e8f5ee;color:#23704b}
      .data-card-status.pending{background:#fff1ef;color:#a13d31}
      .data-card-status.editing{background:#fff6dd;color:#8b6416}
      .data-card-status.optional{background:#edf2fb;color:#315b89}
      .data-card-desc{font-size:11px;color:#6b7b8a;line-height:1.45;margin:0 0 7px}
      .data-card-meta{font-size:10px;color:#38536c;font-weight:700}
      .data-card-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
      .data-card-actions button{padding:7px 10px}
      .data-resource-list{padding-bottom:18px}
      .data-editor-panel{display:none!important}
      .data-editor-panel.is-open{display:block!important;animation:dataEditorIn .16s ease-out}
      @keyframes dataEditorIn{from{opacity:.2;transform:translateY(-4px)}to{opacity:1;transform:none}}
      .editor-close-row{display:flex;justify-content:flex-end;margin:-4px 0 10px}
      .editor-close-btn{border:0;background:#eef3f7;color:#26445f;border-radius:8px;padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer}
      .data-import-input{display:none}
      .data-workspace-note{padding:0 24px 20px;color:#788694;font-size:10px;line-height:1.5}
      .data-workspace-flash{margin:0 24px 16px;padding:10px 12px;border-radius:9px;background:#eaf4ff;color:#24537c;font-size:11px;font-weight:700;display:none}
      .data-workspace-flash.show{display:block}
      .data-workspace-flash.error{background:#fff0ef;color:#9b3d32}
      .doc-badges{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
      .doc-generate-wrap{display:flex;align-items:center;margin-left:2px}
      #generateBtn.doc-generate-top{border:0;border-radius:10px;padding:9px 14px;color:#fff;font-size:11px;font-weight:800;line-height:1;min-height:34px;box-shadow:none;transition:background .16s ease,transform .16s ease;white-space:nowrap}
      #generateBtn.doc-generate-top.ready{background:#14532d;cursor:pointer}
      #generateBtn.doc-generate-top.ready:hover{background:#166534;transform:translateY(-1px)}
      #generateBtn.doc-generate-top.pending{background:#8b1f1f;cursor:not-allowed}
      #generateBtn.doc-generate-top:disabled{opacity:1;filter:none}
      .doc-badges #docStateBadge.gate-ready{background:#e8f5ee;color:#166534}
      .doc-badges #docStateBadge.gate-pending{background:#fde8e8;color:#991b1b}
      @media(max-width:900px){
        .data-workspace-head,.data-workspace-summary{flex-direction:column;align-items:stretch}
        .data-workspace-actions{justify-content:flex-start}
        .data-card{grid-template-columns:1fr}
        .data-card-actions{justify-content:flex-start}
      }
    `;
    document.head.appendChild(style);
  }

  function editorPanelForTarget(selector){
    const target=$(selector);
    return target?.closest("section.panel") || null;
  }

  function markEditorPanels(){
    const legacy=$("#requirementsList")?.closest("section.panel");
    if(legacy) legacy.classList.add("legacy-requirements-panel");

    const selectors=[
      "#scheduleBody","#distributionBody","#operationalPlanBody",
      "#logoUpload"
    ];
    selectors.forEach(selector=>{
      const panel=editorPanelForTarget(selector);
      if(panel) panel.classList.add("data-editor-panel");
    });
    ensureCloseButtons();
  }

  function ensureCloseButtons(){
    const panels=new Set($$(".data-editor-panel"));
    panels.forEach(panel=>{
      if($(".editor-close-row",panel)) return;
      const row=document.createElement("div");
      row.className="editor-close-row";
      row.innerHTML='<button type="button" class="editor-close-btn">← Volver a las tablas</button>';
      panel.insertBefore(row,panel.firstChild);
      $(".editor-close-btn",row).addEventListener("click",()=>{
        panel.classList.remove("is-open");
        $("#dataWorkspace")?.scrollIntoView({behavior:"smooth",block:"start"});
      });
    });
  }

  function scheduleRows(){
    return $$("#scheduleBody tr").map(tr=>({
      activity:tr.cells[0]?.textContent?.trim()||"",
      start:$(".schedule-start",tr)?.value||"",
      end:$(".schedule-end",tr)?.value||""
    }));
  }

  function distributionRows(){
    return $$("#distributionBody tr").map(tr=>({
      career:$(".dist-career",tr)?.value?.trim()||"",
      place:$(".dist-place",tr)?.value?.trim()||"",
      count:$(".dist-count",tr)?.value??""
    })).filter(r=>r.career||r.place||r.count!=="");
  }

  function operationalRows(){
    if(window.DocTitComplexivoOperationalData?.collectOperationalRows){
      try{return window.DocTitComplexivoOperationalData.collectOperationalRows();}catch{}
    }
    return [];
  }

  function nucleusRows(){
    if(window.DocTitComplexivoOperationalData?.collectNucleusRows){
      try{return window.DocTitComplexivoOperationalData.collectNucleusRows();}catch{}
    }
    return [];
  }

  function tableState(id){
    if(id==="schedule"){
      const rows=scheduleRows();
      const completed=rows.filter(r=>r.start&&r.end).length;
      const complete=rows.length===9&&completed===9;
      return {complete,status:complete?"Completa":"Pendiente",kind:complete?"complete":"pending",meta:`${completed} de ${rows.length||9} actividades con fechas`};
    }
    if(id==="distribution"){
      const rows=distributionRows();
      const valid=rows.filter(r=>r.career&&r.place&&r.count!==""&&Number(r.count)>=0);
      const total=valid.reduce((sum,r)=>sum+(Number(r.count)||0),0);
      const complete=rows.length>0&&valid.length===rows.length&&total>0;
      return {complete,status:complete?"Completa":"Pendiente",kind:complete?"complete":"pending",meta:`${valid.length} grupos · ${total} estudiantes`};
    }
    if(id==="operational"){
      const rows=operationalRows();
      const touched=rows.filter(r=>r.start||r.deadline||r.person||r.evidence||r.observations||r.status==="Completado"||r.status==="En proceso").length;
      const complete=rows.length>0&&rows.every(r=>r.start&&r.deadline&&r.responsible&&r.product&&r.evidence);
      return {complete,status:complete?"Completa":touched?"En edición":"Complementaria",kind:complete?"complete":touched?"editing":"optional",meta:rows.length?`${touched} de ${rows.length} actividades con información del período`:"Tabla complementaria"};
    }
    if(id==="nuclei"){
      const rows=nucleusRows();
      const touched=rows.filter(r=>r.career||r.teacher||r.classroom||r.evidence).length;
      const complete=rows.length===4&&rows.every(r=>r.date&&r.career&&r.teacher&&r.classroom&&r.evidence);
      return {complete,status:complete?"Completa":touched?"En edición":"Complementaria",kind:complete?"complete":touched?"editing":"optional",meta:`${touched} de ${rows.length||4} núcleos con detalle operativo`};
    }
    return {complete:false,status:"Sin datos",kind:"pending",meta:""};
  }

  function resourceState(id){
    if(id==="logo"){
      const ok=!!$("#logoPreview img");
      return {complete:ok,status:ok?"Completo":"Pendiente",kind:ok?"complete":"pending",meta:ok?"Logo institucional cargado":"Necesario para generar el PDF"};
    }
    if(id==="smart"){
      const text=$("#smartTextInput")?.value?.trim()||"";
      const analyzed=!$("#smartAnalysisResult")?.classList.contains("empty");
      return {complete:true,status:text?(analyzed?"Analizada":"En edición"):"Opcional",kind:text?(analyzed?"complete":"editing"):"optional",meta:text?`${text.length} caracteres registrados`:"No es obligatoria"};
    }
    if(id==="images"){
      const count=$$(".document-image-grid .asset-preview img").length;
      return {complete:true,status:count?"Con recursos":"Opcional",kind:count?"complete":"optional",meta:`${count} imagen(es) cargada(s)`};
    }
    return {complete:true,status:"Opcional",kind:"optional",meta:""};
  }

  function generationGate(){
    const requiredTables=TABLES.filter(t=>t.required);
    const incomplete=requiredTables.filter(t=>!tableState(t.id).complete);
    const logoOk=resourceState("logo").complete;
    const pending=incomplete.length+(logoOk?0:1);
    return {pending,ready:pending===0,incomplete,logoOk};
  }

  function ensureTopGenerateButton(){
    const btn=$("#generateBtn");
    const badges=$(".doc-badges");
    if(!btn||!badges)return null;
    let wrap=$("#docGenerateWrap");
    if(!wrap){
      wrap=document.createElement("div");
      wrap.id="docGenerateWrap";
      wrap.className="doc-generate-wrap";
      badges.appendChild(wrap);
    }
    if(btn.parentElement!==wrap)wrap.appendChild(btn);
    btn.setAttribute("form","documentForm");
    btn.classList.add("doc-generate-top");
    return btn;
  }

  function updateTopGenerateButton(){
    const btn=ensureTopGenerateButton();
    if(!btn)return;
    const gate=generationGate();
    btn.disabled=!gate.ready;
    btn.classList.toggle("ready",gate.ready);
    btn.classList.toggle("pending",!gate.ready);
    btn.textContent=gate.ready?"Generar PDF":`Generar PDF · ${gate.pending} pendiente${gate.pending===1?"":"s"}`;
    btn.title=gate.ready?"Generar el PDF final":"Completa los elementos obligatorios pendientes para generar el PDF";

    const state=$("#docStateBadge");
    if(state){
      state.classList.remove("neutral");
      state.classList.toggle("gate-ready",gate.ready);
      state.classList.toggle("gate-pending",!gate.ready);
      state.textContent=gate.ready?"Listo para generar":`${gate.pending} pendiente${gate.pending===1?"":"s"}`;
    }
  }

  function ensureWorkspace(){
    if($("#dataWorkspace")) return $("#dataWorkspace");
    const column=$(".content-column");
    if(!column) return null;
    const section=document.createElement("section");
    section.id="dataWorkspace";
    section.className="panel data-workspace";
    section.innerHTML=`
      <div class="data-workspace-head">
        <div>
          <span class="eyebrow">Carga de información</span>
          <h3>Tablas del documento</h3>
          <p>Cada documento administra sus propias tablas. Puedes editar una tabla dentro de la app o descargar/subir una plantilla de Excel sin reemplazar las demás.</p>
        </div>
        <span id="dataWorkspaceStatus" class="data-workspace-status">Pendiente</span>
      </div>
      <div class="data-workspace-summary">
        <div><strong id="dataWorkspaceHeadline">Revisando información…</strong><span id="dataWorkspaceDetail"></span></div>
        <div class="data-workspace-actions">
          <button type="button" id="downloadAllTables">Descargar plantilla completa</button>
          <button type="button" id="uploadAllTables" class="primary-action">Subir plantilla completa</button>
        </div>
      </div>
      <div id="dataWorkspaceFlash" class="data-workspace-flash"></div>
      <div class="data-group-title">Tablas estructuradas</div>
      <div id="dataTableCards" class="data-card-list"></div>
      <div class="data-group-title">Otros datos del documento</div>
      <div id="dataResourceCards" class="data-card-list data-resource-list"></div>
      <p class="data-workspace-note">Las tablas obligatorias determinan si el documento está listo para generarse. Las tablas complementarias pueden llenarse cuando exista información operativa confirmada; no se inventan datos pendientes.</p>
      <input id="dataWorkspaceImport" class="data-import-input" type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel">
    `;
    const legacy=$("#requirementsList")?.closest("section.panel");
    if(legacy) column.insertBefore(section,legacy);
    else column.insertBefore(section,column.firstChild);

    $("#downloadAllTables").addEventListener("click",()=>downloadWorkbook("all"));
    $("#uploadAllTables").addEventListener("click",()=>openImport("all"));
    $("#dataWorkspaceImport").addEventListener("change",handleImportFile);
    section.addEventListener("click",handleWorkspaceClick);
    return section;
  }

  function renderTableCards(){
    const host=$("#dataTableCards");
    if(!host) return;
    host.innerHTML=TABLES.map(def=>{
      const state=tableState(def.id);
      return `
        <article class="data-card" data-table-card="${def.id}">
          <div class="data-card-main">
            <div class="data-card-title-row">
              <span class="data-card-title">${escapeHtml(def.title)}</span>
              <span class="data-card-status ${state.kind}">${escapeHtml(state.status)}</span>
              ${def.required?'<span class="data-card-status">Obligatoria</span>':'<span class="data-card-status optional">Complementaria</span>'}
            </div>
            <p class="data-card-desc">${escapeHtml(def.description)}</p>
            <div class="data-card-meta">${escapeHtml(state.meta)}</div>
          </div>
          <div class="data-card-actions">
            <button type="button" data-action="download" data-table="${def.id}">Descargar</button>
            <button type="button" data-action="upload" data-table="${def.id}">Subir</button>
            <button type="button" class="primary-action" data-action="open" data-table="${def.id}">Abrir tabla</button>
          </div>
        </article>`;
    }).join("");
  }

  function renderResourceCards(){
    const host=$("#dataResourceCards");
    if(!host) return;
    host.innerHTML=RESOURCE_BLOCKS.map(def=>{
      const state=resourceState(def.id);
      return `
        <article class="data-card" data-resource-card="${def.id}">
          <div class="data-card-main">
            <div class="data-card-title-row">
              <span class="data-card-title">${escapeHtml(def.title)}</span>
              <span class="data-card-status ${state.kind}">${escapeHtml(state.status)}</span>
              ${def.required?'<span class="data-card-status">Obligatorio</span>':''}
            </div>
            <p class="data-card-desc">${escapeHtml(def.description)}</p>
            <div class="data-card-meta">${escapeHtml(state.meta)}</div>
          </div>
          <div class="data-card-actions">
            <button type="button" class="primary-action" data-action="open-resource" data-resource="${def.id}">Editar</button>
          </div>
        </article>`;
    }).join("");
  }

  function renderSummary(){
    const requiredTables=TABLES.filter(t=>t.required);
    const completeTables=requiredTables.filter(t=>tableState(t.id).complete).length;
    const logoOk=resourceState("logo").complete;
    const pending=(requiredTables.length-completeTables)+(logoOk?0:1);
    const status=$("#dataWorkspaceStatus");
    const headline=$("#dataWorkspaceHeadline");
    const detail=$("#dataWorkspaceDetail");
    if(status){
      status.textContent=pending?"Pendiente":"Listo";
      status.classList.toggle("ready",pending===0);
    }
    if(headline) headline.textContent=pending?`${pending} elemento(s) pendiente(s) para generar el PDF`:"Información obligatoria completa";
    if(detail) detail.textContent=`${completeTables} de ${requiredTables.length} tablas obligatorias completas · ${TABLES.length-requiredTables.length} tablas complementarias · logo ${logoOk?"cargado":"pendiente"}`;
  }

  function refresh(){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>{
      injectStyles();
      ensureWorkspace();
      markEditorPanels();
      renderTableCards();
      renderResourceCards();
      updateTopGenerateButton();
      renderSummary();
    },50);
  }

  function showFlash(message,error=false){
    const box=$("#dataWorkspaceFlash");
    if(!box) return;
    box.textContent=message;
    box.classList.toggle("error",!!error);
    box.classList.add("show");
    clearTimeout(box.__timer);
    box.__timer=setTimeout(()=>box.classList.remove("show"),4500);
  }

  function closeEditors(){
    $$(".data-editor-panel.is-open").forEach(panel=>panel.classList.remove("is-open"));
  }

  function openEditorForSelector(selector){
    markEditorPanels();
    const target=$(selector);
    const panel=target?.closest("section.panel");
    if(!target||!panel){
      showFlash("Esta tabla todavía no está disponible en la vista actual.",true);
      return;
    }
    closeEditors();
    panel.classList.add("is-open");
    setTimeout(()=>{
      const scrollTarget=selector.includes("operationalPlanBody")||selector.includes("nucleusPlanBody") ? target.closest(".operational-table-wrap")||target : panel;
      scrollTarget.scrollIntoView({behavior:"smooth",block:"start"});
    },20);
  }

  function openTable(id){
    const def=TABLES.find(t=>t.id===id);
    if(def) openEditorForSelector(def.target);
  }

  function openResource(id){
    const def=RESOURCE_BLOCKS.find(r=>r.id===id);
    if(def) openEditorForSelector(def.target);
  }

  function handleWorkspaceClick(event){
    const button=event.target.closest("button[data-action]");
    if(!button) return;
    const action=button.dataset.action;
    if(action==="open") openTable(button.dataset.table);
    if(action==="download") downloadWorkbook(button.dataset.table);
    if(action==="upload") openImport(button.dataset.table);
    if(action==="open-resource") openResource(button.dataset.resource);
  }

  function requireXlsx(){
    if(window.XLSX) return true;
    showFlash("No se pudo cargar el módulo de Excel. Recarga la página e inténtalo nuevamente.",true);
    return false;
  }

  function rowsForExport(id){
    if(id==="schedule") return scheduleRows().map(r=>({"Actividad":r.activity,"Fecha inicio":r.start,"Fecha fin":r.end}));
    if(id==="distribution") return distributionRows().map(r=>({"Carrera":r.career,"Lugar":r.place,"Cantidad":Number(r.count)||0}));
    if(id==="operational") return operationalRows().map(r=>({
      "Actividad":r.activity,"Inicio":r.start,"Fecha límite":r.deadline,"Responsable principal":r.responsible,
      "Área de coordinación":r.coordination,"Persona responsable":r.person,"Producto esperado":r.product,
      "Evidencia":r.evidence,"Estado":r.status,"Observaciones":r.observations
    }));
    if(id==="nuclei") return nucleusRows().map(r=>({
      "Núcleo":r.nucleus,"Fecha":r.date,"Carrera":r.career,"Docente responsable":r.teacher,
      "Guía entregada":r.guide,"Material cargado":r.material,"Aula":r.classroom,"Evidencia":r.evidence
    }));
    return [];
  }

  function safeFileBase(){
    const period=$("#periodSelect option:checked")?.textContent?.trim()||"periodo";
    return (`DOC-TIT - ${$("#docTitle")?.textContent?.trim()||"documento"} - ${period}`)
      .replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();
  }

  function downloadWorkbook(mode){
    if(!requireXlsx()) return;
    const workbook=window.XLSX.utils.book_new();
    const defs=mode==="all"?TABLES:TABLES.filter(t=>t.id===mode);
    defs.forEach(def=>{
      const rows=rowsForExport(def.id);
      const sheet=window.XLSX.utils.json_to_sheet(rows.length?rows:[blankRow(def.id)],{skipHeader:false});
      window.XLSX.utils.book_append_sheet(workbook,sheet,def.sheet);
    });
    const suffix=mode==="all"?"Plantilla completa":TABLES.find(t=>t.id===mode)?.title||"Tabla";
    window.XLSX.writeFile(workbook,`${safeFileBase()} - ${suffix}.xlsx`);
  }

  function blankRow(id){
    if(id==="schedule") return {"Actividad":"","Fecha inicio":"","Fecha fin":""};
    if(id==="distribution") return {"Carrera":"","Lugar":"","Cantidad":""};
    if(id==="operational") return {"Actividad":"","Inicio":"","Fecha límite":"","Responsable principal":"","Área de coordinación":"","Persona responsable":"","Producto esperado":"","Evidencia":"","Estado":"","Observaciones":""};
    return {"Núcleo":"","Fecha":"","Carrera":"","Docente responsable":"","Guía entregada":"","Material cargado":"","Aula":"","Evidencia":""};
  }

  function openImport(mode){
    if(!requireXlsx()) return;
    importMode=mode||"all";
    const input=$("#dataWorkspaceImport");
    input.value="";
    input.click();
  }

  function valueByHeaders(row,headers){
    const map=new Map(Object.keys(row||{}).map(k=>[normalize(k),row[k]]));
    for(const h of headers){
      if(map.has(normalize(h))) return map.get(normalize(h));
    }
    return "";
  }

  function isoDate(value){
    if(value==null||value==="") return "";
    if(value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0,10);
    if(typeof value==="number" && window.XLSX?.SSF?.parse_date_code){
      const d=window.XLSX.SSF.parse_date_code(value);
      if(d) return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;
    }
    const s=String(value).trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if(m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
    const d=new Date(s);
    return Number.isNaN(d.getTime())?s:d.toISOString().slice(0,10);
  }

  function sheetRows(workbook,def){
    const exact=workbook.Sheets[def.sheet];
    const fallbackName=workbook.SheetNames.find(name=>normalize(name)===normalize(def.sheet)||normalize(name)===normalize(def.title));
    const sheet=exact||workbook.Sheets[fallbackName];
    if(!sheet) return null;
    return window.XLSX.utils.sheet_to_json(sheet,{defval:"",raw:true});
  }

  function importSchedule(rows){
    if(!Array.isArray(rows)||!rows.length) return 0;
    const byActivity=new Map(rows.map(r=>[normalize(valueByHeaders(r,["Actividad"])),r]));
    let changed=0;
    $$("#scheduleBody tr").forEach((tr,index)=>{
      const activity=tr.cells[0]?.textContent?.trim()||"";
      const source=byActivity.get(normalize(activity))||rows[index];
      if(!source) return;
      const start=$(".schedule-start",tr), end=$(".schedule-end",tr);
      if(start) start.value=isoDate(valueByHeaders(source,["Fecha inicio","Inicio"]));
      if(end) end.value=isoDate(valueByHeaders(source,["Fecha fin","Fin"]));
      changed++;
    });
    $("#scheduleBody")?.dispatchEvent(new Event("input",{bubbles:true}));
    $("#scheduleBody")?.dispatchEvent(new Event("change",{bubbles:true}));
    return changed;
  }

  function importDistribution(rows){
    if(!Array.isArray(rows)) return 0;
    const valid=rows.map(r=>({
      career:String(valueByHeaders(r,["Carrera"])||"").trim(),
      place:String(valueByHeaders(r,["Lugar","Sede"])||"").trim(),
      count:valueByHeaders(r,["Cantidad","Estudiantes","Cant."])
    })).filter(r=>r.career||r.place||r.count!=="");
    if(!valid.length) return 0;
    const tbody=$("#distributionBody");
    tbody.innerHTML=valid.map(r=>`<tr>
      <td><input class="dist-career" type="text" value="${escapeHtml(r.career)}" placeholder="Carrera"></td>
      <td><input class="dist-place" type="text" list="placesList" value="${escapeHtml(r.place)}" placeholder="Lugar"></td>
      <td><input class="dist-count" type="number" min="0" step="1" value="${Number(r.count)||0}" placeholder="0"></td>
      <td><button type="button" class="row-remove" aria-label="Eliminar fila">×</button></td>
    </tr>`).join("");
    tbody.dispatchEvent(new Event("input",{bubbles:true}));
    tbody.dispatchEvent(new Event("change",{bubbles:true}));
    return valid.length;
  }

  function setValue(tr,selector,value){
    const el=$(selector,tr);
    if(!el) return;
    el.value=value==null?"":String(value);
    el.dispatchEvent(new Event("input",{bubbles:true}));
    el.dispatchEvent(new Event("change",{bubbles:true}));
  }

  function importOperational(rows){
    if(!Array.isArray(rows)||!rows.length) return 0;
    const trs=$$("#operationalPlanBody tr");
    const byActivity=new Map(rows.map(r=>[normalize(valueByHeaders(r,["Actividad"])),r]));
    let changed=0;
    trs.forEach((tr,index)=>{
      const activity=$(".op-activity",tr)?.textContent?.trim()||"";
      const r=byActivity.get(normalize(activity))||rows[index];
      if(!r) return;
      setValue(tr,".op-start",isoDate(valueByHeaders(r,["Inicio"])));
      setValue(tr,".op-deadline",isoDate(valueByHeaders(r,["Fecha límite","Fecha limite"])));
      setValue(tr,".op-responsible",valueByHeaders(r,["Responsable principal"]));
      setValue(tr,".op-coordination",valueByHeaders(r,["Área de coordinación","Area de coordinacion"]));
      setValue(tr,".op-person",valueByHeaders(r,["Persona responsable"]));
      setValue(tr,".op-product",valueByHeaders(r,["Producto esperado"]));
      setValue(tr,".op-evidence",valueByHeaders(r,["Evidencia"]));
      setValue(tr,".op-status",valueByHeaders(r,["Estado"])||"Planificado");
      setValue(tr,".op-observations",valueByHeaders(r,["Observaciones"]));
      changed++;
    });
    window.DocTitComplexivoOperationalData?.save?.();
    return changed;
  }

  function importNuclei(rows){
    if(!Array.isArray(rows)||!rows.length) return 0;
    const trs=$$("#nucleusPlanBody tr");
    const byName=new Map(rows.map(r=>[normalize(valueByHeaders(r,["Núcleo","Nucleo"])),r]));
    let changed=0;
    trs.forEach((tr,index)=>{
      const name=tr.cells[0]?.textContent?.trim()||`Núcleo ${index+1}`;
      const r=byName.get(normalize(name))||rows[index];
      if(!r) return;
      setValue(tr,".nuc-date",valueByHeaders(r,["Fecha"]));
      setValue(tr,".nuc-career",valueByHeaders(r,["Carrera"]));
      setValue(tr,".nuc-teacher",valueByHeaders(r,["Docente responsable","Docente"]));
      setValue(tr,".nuc-guide",valueByHeaders(r,["Guía entregada","Guia entregada"]));
      setValue(tr,".nuc-material",valueByHeaders(r,["Material cargado"]));
      setValue(tr,".nuc-classroom",valueByHeaders(r,["Aula","Aula / recurso"]));
      setValue(tr,".nuc-evidence",valueByHeaders(r,["Evidencia"]));
      changed++;
    });
    window.DocTitComplexivoOperationalData?.save?.();
    return changed;
  }

  function importTable(id,rows){
    if(id==="schedule") return importSchedule(rows);
    if(id==="distribution") return importDistribution(rows);
    if(id==="operational") return importOperational(rows);
    if(id==="nuclei") return importNuclei(rows);
    return 0;
  }

  async function handleImportFile(event){
    const file=event.target.files?.[0];
    if(!file||!requireXlsx()) return;
    try{
      const buffer=await file.arrayBuffer();
      const workbook=window.XLSX.read(buffer,{type:"array",cellDates:true});
      const defs=importMode==="all"?TABLES:TABLES.filter(t=>t.id===importMode);
      let changed=0;
      let found=0;
      defs.forEach(def=>{
        const rows=sheetRows(workbook,def);
        if(rows===null) return;
        found++;
        changed+=importTable(def.id,rows);
      });
      if(!found) throw new Error(importMode==="all"?"El archivo no contiene hojas reconocidas para este documento.":"El archivo no contiene la hoja esperada para esta tabla.");
      showFlash(`Plantilla cargada correctamente. ${changed} registro(s) procesado(s).`);
      refresh();
      setTimeout(()=>$("#saveDraftBtn")?.scrollIntoView({behavior:"smooth",block:"nearest"}),80);
    }catch(err){
      console.error(err);
      showFlash(err.message||"No se pudo leer la plantilla de Excel.",true);
    }finally{
      event.target.value="";
    }
  }

  function bindDelegatedRowRemove(){
    const tbody=$("#distributionBody");
    if(!tbody||tbody.dataset.workspaceRemoveBound==="1") return;
    tbody.dataset.workspaceRemoveBound="1";
    tbody.addEventListener("click",event=>{
      const button=event.target.closest(".row-remove");
      if(!button) return;
      if(tbody.rows.length>1) button.closest("tr")?.remove();
      else {
        const tr=tbody.rows[0];
        $$("input",tr).forEach(input=>input.value="");
      }
      tbody.dispatchEvent(new Event("input",{bubbles:true}));
      refresh();
    });
  }

  function initObservers(){
    const form=$("#documentForm");
    if(form){
      form.addEventListener("input",refresh);
      form.addEventListener("change",refresh);
    }
    $("#periodSelect")?.addEventListener("change",()=>setTimeout(refresh,100));
    const title=$("#docTitle");
    if(title){
      new MutationObserver(()=>setTimeout(refresh,80)).observe(title,{childList:true,subtree:true,characterData:true});
    }
    const formObserver=new MutationObserver(()=>{
      markEditorPanels();
      bindDelegatedRowRemove();
      refresh();
    });
    if(form) formObserver.observe(form,{childList:true,subtree:true});
  }

  function init(){
    injectStyles();
    ensureWorkspace();
    markEditorPanels();
    bindDelegatedRowRemove();
    initObservers();
    refresh();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
