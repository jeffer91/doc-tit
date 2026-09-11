(() => {
  "use strict";

  const CORE_VERSION = "1.0.0";
  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const esc = v => String(v ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
  const norm = v => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const nav = $("[data-doc-tit-navigation]");
  const documentId = nav?.dataset.activeDocument || "complexivo";
  let previousPeriodId = $("#periodSelect")?.value || "";
  let dirty = false;
  let periodSwitchBypass = false;
  let statusUnlocked = false;
  let currentPeriodStatus = "Activo";

  window.DOC_TIT_CORE = Object.freeze({
    version: CORE_VERSION,
    documentId,
    periodId: () => $("#periodSelect")?.value || "",
    periodName: () => currentPeriodName(),
    diagnostics: () => buildDiagnostics()
  });

  function currentPeriodName(){
    const select = $("#periodSelect");
    if(select?.selectedOptions?.[0]) return select.selectedOptions[0].textContent.trim();
    return $("#periodText")?.textContent?.trim() || $("#periodName")?.textContent?.trim() || "—";
  }

  function documentTitle(){
    return $("#docTitle")?.textContent?.trim() || $("#screenTitle")?.textContent?.trim() || document.title || "Documento";
  }

  function documentCode(){
    return $("#docCode")?.textContent?.trim() || $("#docCodeBadge")?.textContent?.trim() || "—";
  }

  function coreToast(message, mode="info"){
    let host = $("#docCoreToast");
    if(!host){
      host = document.createElement("div");
      host.id = "docCoreToast";
      host.className = "doc-core-toast";
      document.body.appendChild(host);
    }
    host.className = `doc-core-toast ${mode}`;
    host.textContent = message;
    host.hidden = false;
    clearTimeout(host._timer);
    host._timer = setTimeout(() => { host.hidden = true; }, 4200);
  }

  function ensureDialogs(){
    if(!$("#docCoreConfirm")){
      const dialog = document.createElement("dialog");
      dialog.id = "docCoreConfirm";
      dialog.className = "doc-core-dialog";
      dialog.innerHTML = `
        <div class="doc-core-dialog-head"><div><span class="eyebrow">Cambios pendientes</span><h3>Cambiar de período</h3></div></div>
        <p>Tienes cambios desde la última acción de guardado. Elige cómo continuar.</p>
        <div class="doc-core-dialog-actions">
          <button type="button" class="secondary" data-core-choice="cancel">Cancelar</button>
          <button type="button" class="secondary" data-core-choice="discard">Descartar y cambiar</button>
          <button type="button" class="primary" data-core-choice="save">Guardar y cambiar</button>
        </div>`;
      document.body.appendChild(dialog);
    }

    if(!$("#docCoreReview")){
      const dialog = document.createElement("dialog");
      dialog.id = "docCoreReview";
      dialog.className = "doc-core-dialog doc-core-review-dialog";
      dialog.innerHTML = `
        <div class="doc-core-dialog-head">
          <div><span class="eyebrow">Core documental v${CORE_VERSION}</span><h3>Diagnóstico y revisión por sección</h3></div>
          <button type="button" class="doc-core-close" aria-label="Cerrar">×</button>
        </div>
        <div id="docCoreReviewBody"></div>`;
      dialog.querySelector(".doc-core-close").onclick = () => dialog.close();
      document.body.appendChild(dialog);
    }

    if(!$("#docCorePreview")){
      const dialog = document.createElement("dialog");
      dialog.id = "docCorePreview";
      dialog.className = "doc-core-dialog doc-core-preview-dialog";
      dialog.innerHTML = `
        <div class="doc-core-dialog-head">
          <div><span class="eyebrow">Vista previa de sección</span><h3 id="docCorePreviewTitle">Sección</h3></div>
          <button type="button" class="doc-core-close" aria-label="Cerrar">×</button>
        </div>
        <div id="docCorePreviewBody" class="doc-core-preview-body"></div>`;
      dialog.querySelector(".doc-core-close").onclick = () => dialog.close();
      document.body.appendChild(dialog);
    }
  }

  function ensureReviewButton(){
    if($("#docCoreReviewBtn")) return;
    const btn = document.createElement("button");
    btn.id = "docCoreReviewBtn";
    btn.type = "button";
    btn.className = "secondary doc-core-review-btn";
    btn.textContent = "Diagnóstico";
    btn.onclick = openDiagnostics;

    const toolbar = $(".toolbar");
    if(toolbar){ toolbar.appendChild(btn); return; }

    const topbar = $(".topbar");
    if(topbar){
      const actions = document.createElement("div");
      actions.className = "doc-core-top-actions";
      actions.appendChild(btn);
      topbar.appendChild(actions);
      return;
    }

    const header = $("header.top");
    if(header) header.appendChild(btn);
  }

  function ensureCoreVersionBadge(){
    if($("#docCoreVersion")) return;
    const footer = $(".sidebar-footer") || $(".sidebar");
    if(!footer) return;
    const badge = document.createElement("small");
    badge.id = "docCoreVersion";
    badge.className = "doc-core-version";
    badge.textContent = `Core documental v${CORE_VERSION}`;
    footer.appendChild(badge);
  }

  function periodIdFromBuilder(){
    const sm = Number($("#startMonth")?.value);
    const em = Number($("#endMonth")?.value);
    const syEl = $("#startYear"), eyEl = $("#endYear");
    const sy = Number(syEl?.value || syEl?.dataset?.value || syEl?.textContent);
    const ey = Number(eyEl?.value || eyEl?.dataset?.value || eyEl?.textContent);
    if(!sm || !em || !sy || !ey) return null;
    const startKey = `${sy}-${String(sm).padStart(2,"0")}`;
    const endKey = `${ey}-${String(em).padStart(2,"0")}`;
    return {
      id: `${startKey}_${endKey}`,
      name: `${MONTHS[sm-1]} ${sy} – ${MONTHS[em-1]} ${ey}`,
      startKey, endKey
    };
  }

  function installDuplicatePeriodGuard(){
    const form = $("#periodForm");
    if(!form || form.dataset.corePeriodGuard === "1") return;
    form.dataset.corePeriodGuard = "1";
    form.addEventListener("submit", event => {
      const built = periodIdFromBuilder();
      if(!built) return;
      if(built.endKey < built.startKey){
        event.preventDefault();
        event.stopImmediatePropagation();
        coreToast("La fecha final no puede ser anterior a la inicial.", "error");
        return;
      }
      const select = $("#periodSelect");
      const exists = $$("option", select).some(opt => opt.value === built.id);
      if(!exists) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      $("#periodDialog")?.close();
      requestPeriodSwitch(built.id, {message:`El período ${built.name} ya existe. Se seleccionará el existente.`});
    }, true);
  }

  function workspaceTarget(target){
    if(!(target instanceof Element)) return false;
    if(target.closest("#periodDialog,#docCoreConfirm,#docCoreReview,#docCorePreview")) return false;
    if(target.closest("#periodSelect,#newPeriodBtn")) return false;
    return !!target.closest("main");
  }

  function installDirtyTracking(){
    document.addEventListener("input", e => { if(workspaceTarget(e.target)) dirty = true; }, true);
    document.addEventListener("change", e => {
      if(e.target?.id === "periodSelect") return;
      if(workspaceTarget(e.target)) dirty = true;
      if(e.target?.id === "importInput" && e.target.files?.[0]){
        const meta = {name:e.target.files[0].name, at:new Date().toISOString(), periodId:$("#periodSelect")?.value || ""};
        localStorage.setItem(`doc-tit-import-source::${documentId}`, JSON.stringify(meta));
      }
    }, true);

    ["#saveBtn","#saveBtnBottom","#saveDraftBtn","#generateBtn","#generateBtnBottom"].forEach(selector => {
      $(selector)?.addEventListener("click", () => { dirty = false; }, false);
    });
  }

  function saveButton(){
    return $("#saveBtn") || $("#saveDraftBtn") || $("#saveBtnBottom");
  }

  function requestPeriodSwitch(nextId, opts={}){
    const select = $("#periodSelect");
    if(!select || !nextId || nextId === previousPeriodId) return;
    if(!dirty || periodSwitchBypass){
      commitPeriodSwitch(nextId, opts.message);
      return;
    }

    ensureDialogs();
    const dialog = $("#docCoreConfirm");
    dialog.showModal();
    dialog.querySelectorAll("[data-core-choice]").forEach(btn => {
      btn.onclick = () => {
        const choice = btn.dataset.coreChoice;
        dialog.close();
        if(choice === "cancel"){
          periodSwitchBypass = true;
          select.value = previousPeriodId;
          setTimeout(() => periodSwitchBypass = false, 0);
          return;
        }
        if(choice === "save") saveButton()?.click();
        dirty = false;
        commitPeriodSwitch(nextId, opts.message);
      };
    });
  }

  function commitPeriodSwitch(nextId, message){
    const select = $("#periodSelect");
    if(!select) return;
    periodSwitchBypass = true;
    select.value = nextId;
    previousPeriodId = nextId;
    select.dispatchEvent(new Event("change", {bubbles:true}));
    setTimeout(() => { periodSwitchBypass = false; refreshPeriodStatus(); }, 0);
    if(message) coreToast(message, "info");
  }

  function installPeriodSwitchGuard(){
    const select = $("#periodSelect");
    if(!select || select.dataset.coreSwitchGuard === "1") return;
    select.dataset.coreSwitchGuard = "1";
    previousPeriodId = select.value;
    select.addEventListener("focus", () => { previousPeriodId = select.value; }, true);
    select.addEventListener("mousedown", () => { previousPeriodId = select.value; }, true);
    select.addEventListener("change", event => {
      if(periodSwitchBypass){ previousPeriodId = select.value; return; }
      const nextId = select.value;
      if(nextId === previousPeriodId) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      select.value = previousPeriodId;
      requestPeriodSwitch(nextId);
    }, true);
  }

  async function fetchPeriodRows(){
    try{
      if(window.DocTitCloud?.loadPeriods) return await window.DocTitCloud.loadPeriods();
      if(window.DocTitCloud?.loadWorkspace) return (await window.DocTitCloud.loadWorkspace()).periods || [];
    }catch(_){ }
    return [];
  }

  function ensureStatusBadge(){
    let badge = $("#corePeriodStatus");
    if(badge) return badge;
    const box = $(".period-box");
    if(!box) return null;
    badge = document.createElement("span");
    badge.id = "corePeriodStatus";
    badge.className = "doc-core-period-status";
    box.appendChild(badge);
    return badge;
  }

  async function refreshPeriodStatus(){
    const id = $("#periodSelect")?.value;
    if(!id) return;
    const rows = await fetchPeriodRows();
    const row = rows.find(r => (r.period_key || r.id) === id);
    const domStatus = $("#periodStatus")?.textContent?.trim();
    currentPeriodStatus = row?.status || domStatus || "Activo";
    statusUnlocked = false;
    const badge = ensureStatusBadge();
    if(badge){
      badge.textContent = currentPeriodStatus;
      badge.dataset.status = norm(currentPeriodStatus);
    }
  }

  function isEditableControl(target){
    return target instanceof Element && !!target.closest("input:not([type=button]):not([type=submit]), textarea, select, button[data-add], .row-remove, #logoUpload");
  }

  function installPeriodStateGuard(){
    const guard = event => {
      if(!workspaceTarget(event.target) || !isEditableControl(event.target)) return;
      const status = norm(currentPeriodStatus);
      if(status === "activo" || statusUnlocked) return;
      if(status === "archivado"){
        event.preventDefault();
        event.stopImmediatePropagation();
        coreToast("Este período está archivado y es de solo consulta.", "error");
        return;
      }
      if(status === "cerrado"){
        const ok = window.confirm("Este período está cerrado. ¿Deseas habilitar edición para esta sesión?");
        if(!ok){
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        statusUnlocked = true;
        coreToast("Edición temporal habilitada para el período cerrado.", "info");
      }
    };
    document.addEventListener("beforeinput", guard, true);
    document.addEventListener("change", guard, true);
    document.addEventListener("click", guard, true);
  }

  function visiblePanels(){
    let panels = $$("#dynamicSections > section.panel").filter(p => !p.hidden && p.getAttribute("aria-hidden") !== "true");
    if(documentId === "complexivo"){
      panels = $$("#documentForm > section.panel").filter(p => !p.hidden && p.getAttribute("aria-hidden") !== "true");
    }
    return panels;
  }

  function panelTitle(panel, index){
    return $("h3", panel)?.textContent?.trim() || $(".eyebrow", panel)?.textContent?.trim() || `Sección ${index+1}`;
  }

  function logoLoaded(panel){
    const preview = $("#logoPreview", panel) || $("#logoPreview");
    return !!preview?.querySelector("img") || (!!preview && !/sin imagen/i.test(preview.textContent || "") && !!preview.textContent.trim());
  }

  function panelDiagnostic(panel, index){
    const title = panelTitle(panel, index);
    const hint = `${$(".eyebrow",panel)?.textContent || ""} ${$(".help",panel)?.textContent || ""} ${$(".section-help",panel)?.textContent || ""}`;
    const optional = /opcional|complementaria/i.test(hint);
    if($("#logoUpload", panel)){
      const complete = logoLoaded(panel);
      return {title, required:true, complete, state:complete?"OK":"Pendiente", detail:complete?"Logo institucional disponible":"Falta el logo institucional"};
    }

    const rows = $$("tbody tr", panel);
    const dateInputs = $$("input[type=\"date\"]", panel).filter(i => !i.disabled);
    if($("#scheduleBody", panel) && dateInputs.length){
      const scheduleRows = rows.filter(row => row.querySelector('input[type="date"]'));
      const completeRows = scheduleRows.filter(row => {
        const dates = $$("input[type=\"date\"]", row).filter(i => !i.disabled);
        if(!dates.length) return false;
        return documentId === "trabajo-titulacion" ? dates.some(i => !!i.value) : dates.every(i => !!i.value);
      }).length;
      const complete = scheduleRows.length > 0 && completeRows === scheduleRows.length;
      return {title, required:true, complete, state:complete?"OK":"Pendiente", detail:`${completeRows} de ${scheduleRows.length} actividades con fechas`};
    }

    const inputs = $$("input,select,textarea", panel).filter(el => !["button","submit","file"].includes(el.type) && !el.disabled);
    const touched = inputs.filter(el => el.type === "checkbox" ? el.checked : String(el.value ?? "").trim() !== "").length;
    const complete = optional || touched > 0 || inputs.length === 0;
    return {title, required:!optional, complete, state:optional?(touched?"Con datos":"Opcional"):(complete?"OK":"Pendiente"), detail:inputs.length?`${touched} de ${inputs.length} campos con información`:"Contenido automático"};
  }

  function importSource(){
    try{
      const meta = JSON.parse(localStorage.getItem(`doc-tit-import-source::${documentId}`) || "null");
      if(!meta || meta.periodId !== ($("#periodSelect")?.value || "")) return null;
      return meta;
    }catch(_){ return null; }
  }

  function buildDiagnostics(){
    const sections = visiblePanels().map(panelDiagnostic);
    const required = sections.filter(s => s.required);
    const pending = required.filter(s => !s.complete);
    return {
      coreVersion:CORE_VERSION,
      documentId,
      documentTitle:documentTitle(),
      documentCode:documentCode(),
      periodId:$("#periodSelect")?.value || "—",
      periodName:currentPeriodName(),
      periodStatus:currentPeriodStatus,
      sections,
      requiredCount:required.length,
      pendingCount:pending.length,
      ready:pending.length === 0,
      source:importSource()
    };
  }

  function renderDiagnostics(){
    const info = buildDiagnostics();
    const host = $("#docCoreReviewBody");
    if(!host) return;
    const sourceText = info.source ? `${esc(info.source.name)} · ${new Date(info.source.at).toLocaleString("es-EC")}` : "Carga manual / datos guardados del período";
    host.innerHTML = `
      <div class="doc-core-summary ${info.ready?"ready":"pending"}">
        <div><strong>${info.ready?"Documento listo para revisión final":"Hay información pendiente"}</strong><span>${info.pendingCount} pendiente(s) de ${info.requiredCount} secciones obligatorias</span></div>
        <span class="doc-core-state">${info.ready?"OK":"REVISAR"}</span>
      </div>
      <div class="doc-core-meta-grid">
        <div><span>Período</span><strong>${esc(info.periodName)}</strong><small>${esc(info.periodId)} · ${esc(info.periodStatus)}</small></div>
        <div><span>Documento</span><strong>${esc(info.documentTitle)}</strong><small>${esc(info.documentCode)}</small></div>
        <div><span>Origen de datos</span><strong>${sourceText}</strong><small>El Excel se usa como entrada; el documento trabaja con el modelo interno.</small></div>
        <div><span>Core</span><strong>v${CORE_VERSION}</strong><small>Períodos · diagnóstico · revisión de secciones</small></div>
      </div>
      <div class="doc-core-section-list" id="docCoreSectionList"></div>`;

    const list = $("#docCoreSectionList", host);
    visiblePanels().forEach((panel,index) => {
      const d = panelDiagnostic(panel,index);
      const item = document.createElement("article");
      item.className = "doc-core-section-item";
      item.innerHTML = `
        <div><div class="doc-core-section-title"><strong>${esc(d.title)}</strong><span class="doc-core-chip ${d.complete?"ok":d.required?"pending":"optional"}">${esc(d.state)}</span><span class="doc-core-chip ${d.required?"required":"optional"}">${d.required?"Obligatoria":"Complementaria"}</span></div><small>${esc(d.detail)}</small></div>
        <div class="doc-core-section-actions"><button type="button" class="secondary" data-preview>Vista previa</button><button type="button" class="secondary" data-pdf>PDF sección</button></div>`;
      $("[data-preview]",item).onclick = () => previewPanel(panel,index);
      $("[data-pdf]",item).onclick = () => downloadPanelPdf(panel,index);
      list.appendChild(item);
    });
  }

  function openDiagnostics(){
    ensureDialogs();
    renderDiagnostics();
    $("#docCoreReview").showModal();
  }

  function controlDisplayValue(el){
    if(el.tagName === "SELECT") return el.selectedOptions?.[0]?.textContent?.trim() || el.value || "—";
    if(el.type === "checkbox") return el.checked ? "Sí" : "No";
    if(el.type === "date" && el.value){
      const d = new Date(el.value + "T12:00:00");
      if(!Number.isNaN(d.getTime())) return new Intl.DateTimeFormat("es-EC").format(d);
    }
    return String(el.value || "—");
  }

  function sanitizedPanelClone(panel){
    const clone = panel.cloneNode(true);
    const originals = $$("input,select,textarea",panel);
    const clones = $$("input,select,textarea",clone);
    clones.forEach((el,i) => {
      const value = controlDisplayValue(originals[i] || el);
      const span = document.createElement("span");
      span.className = "doc-core-value";
      span.textContent = value;
      el.replaceWith(span);
    });
    $$("button,.doc-standard-editor-close",clone).forEach(el => el.remove());
    clone.removeAttribute("hidden");
    clone.setAttribute("aria-hidden","false");
    clone.classList.remove("is-open","doc-standard-editor");
    return clone;
  }

  function previewPanel(panel,index){
    ensureDialogs();
    const title = panelTitle(panel,index);
    $("#docCorePreviewTitle").textContent = title;
    const body = $("#docCorePreviewBody");
    body.innerHTML = "";
    body.appendChild(sanitizedPanelClone(panel));
    $("#docCorePreview").showModal();
  }

  function panelTextBlocks(panel){
    const blocks = [];
    const help = $(".help",panel)?.textContent?.trim() || $(".section-help",panel)?.textContent?.trim();
    if(help) blocks.push(help);
    $$("label", panel).forEach(label => {
      const control = $("input,select,textarea",label);
      if(!control || ["file","button","submit"].includes(control.type)) return;
      const labelText = Array.from(label.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent.trim()).filter(Boolean).join(" ") || control.name || control.id;
      if(labelText) blocks.push(`${labelText}: ${controlDisplayValue(control)}`);
    });
    return blocks;
  }

  function downloadPanelPdf(panel,index){
    if(!window.jspdf?.jsPDF){ coreToast("No se pudo cargar el motor PDF.","error"); return; }
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF({unit:"pt",format:"a4",orientation:"portrait"});
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    let y = 52;
    const title = panelTitle(panel,index);
    const period = currentPeriodName();

    const footer = () => {
      const page = doc.getNumberOfPages();
      doc.setFont("helvetica","normal"); doc.setFontSize(8);
      doc.text(`DOC-TIT · Core documental v${CORE_VERSION}`, margin, pageH-24);
      doc.text(`Página ${page}`, pageW-margin, pageH-24, {align:"right"});
    };
    const newPage = () => { footer(); doc.addPage(); y=52; };
    const ensure = h => { if(y+h > pageH-48) newPage(); };
    const paragraph = text => {
      if(!text) return;
      doc.setFont("helvetica","normal"); doc.setFontSize(10);
      const lines = doc.splitTextToSize(String(text), pageW-margin*2);
      ensure(lines.length*14+10); doc.text(lines,margin,y); y += lines.length*14+10;
    };

    doc.setFont("helvetica","bold"); doc.setFontSize(14); doc.text(documentTitle(),margin,y); y+=20;
    doc.setFontSize(11); doc.text(title,margin,y); y+=18;
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.text(`${period} · ${documentCode()}`,margin,y); y+=22;
    panelTextBlocks(panel).forEach(paragraph);

    $$("table",panel).forEach(table => {
      const headers = $$("thead th",table).map(th => th.textContent.trim()).filter(Boolean);
      const body = $$("tbody tr",table).map(tr => $$("td",tr).map(td => {
        const c = $("input,select,textarea",td);
        return c ? controlDisplayValue(c) : td.textContent.trim();
      }).slice(0, headers.length || undefined));
      if(!headers.length && !body.length) return;
      if(typeof doc.autoTable === "function"){
        doc.autoTable({startY:y,head:headers.length?[headers]:undefined,body,margin:{left:margin,right:margin},styles:{fontSize:8,cellPadding:4},headStyles:{fontStyle:"bold"},didDrawPage:() => {}});
        y = doc.lastAutoTable.finalY + 16;
      }else{
        paragraph(headers.join(" | "));
        body.forEach(row => paragraph(row.join(" | ")));
      }
    });
    footer();
    const safe = `${documentId}-${title}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-|-$/g,"").toLowerCase();
    doc.save(`${safe || "seccion"}.pdf`);
  }

  function init(){
    ensureDialogs();
    ensureReviewButton();
    ensureCoreVersionBadge();
    installDuplicatePeriodGuard();
    installDirtyTracking();
    installPeriodSwitchGuard();
    installPeriodStateGuard();
    refreshPeriodStatus();
    const select = $("#periodSelect");
    if(select) new MutationObserver(() => refreshPeriodStatus()).observe(select,{childList:true,subtree:true});
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(init,120), {once:true});
  else setTimeout(init,120);
})();