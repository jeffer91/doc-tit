(() => {
  "use strict";

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));

  function safeFilePart(value){
    return String(value || "Periodo")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function currentScheduleRows(){
    return $$("#scheduleBody tr").map((tr, index) => {
      const value = field => $(`[data-f="${field}"]`, tr)?.value || "";
      const activeInput = $('[data-f="active"]', tr);
      return {
        order: index + 1,
        activity: value("activity"),
        start: value("start"),
        end: value("end"),
        deadline: value("deadline"),
        description: value("description"),
        responsible: value("responsible"),
        observation: value("observation"),
        active: activeInput ? activeInput.checked : true
      };
    });
  }

  function downloadScheduleTemplate(){
    if (!window.XLSX?.utils) {
      alert("No se pudo cargar el módulo de Excel. Recarga la página e inténtalo nuevamente.");
      return;
    }

    const wb = XLSX.utils.book_new();
    const period = $("#periodText")?.textContent?.trim() || "";
    const code = $("#docCode")?.textContent?.trim() || "";

    const instructions = [
      ["PLANTILLA DE DATOS · Planificación de Trabajo de Titulación"],
      ["Instrucciones"],
      ["1. Completa únicamente las celdas necesarias del cronograma."],
      ["2. No cambies el nombre de las hojas."],
      ["3. Cada actividad activa debe tener al menos una fecha de inicio, fecha fin o fecha límite."],
      ["4. Puedes editar la plantilla y volver a subirla desde la misma tarjeta del cronograma."],
      ["5. El cronograma debe aprobarse en la app antes de generar el PDF definitivo."]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(instructions), "INSTRUCCIONES");

    const periodRows = [
      ["Campo", "Valor"],
      ["Periodo", period],
      ["Codigo", code],
      ["Documento", "Planificación de Trabajo de Titulación"],
      ["Clave documento", "plan-trabajo-titulacion"]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(periodRows), "PERIODO");

    const scheduleRows = [[
      "Orden", "Actividad", "Fecha inicio", "Fecha fin", "Fecha límite",
      "Descripción", "Responsable", "Observación", "Activo"
    ]];
    currentScheduleRows().forEach(row => {
      scheduleRows.push([
        row.order,
        row.activity,
        row.start,
        row.end,
        row.deadline,
        row.description,
        row.responsible,
        row.observation,
        row.active ? "Sí" : "No"
      ]);
    });
    const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleRows);
    scheduleSheet["!cols"] = [
      {wch:9},{wch:45},{wch:16},{wch:16},{wch:16},{wch:55},{wch:42},{wch:35},{wch:10}
    ];
    XLSX.utils.book_append_sheet(wb, scheduleSheet, "CRONOGRAMA");

    const filename = `Plantilla_Trabajo_Titulacion_${safeFilePart(period)}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  document.addEventListener("click", event => {
    const button = event.target.closest?.('[data-card-action="download"]');
    if (!button) return;

    const card = button.closest(".doc-standard-card");
    const title = card?.querySelector(".doc-standard-card-title")?.textContent?.trim() || "";
    if (title !== "Cronograma general") return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    downloadScheduleTemplate();
  }, true);

  window.DocTitTrabajoDownload = Object.freeze({ downloadScheduleTemplate });
})();
