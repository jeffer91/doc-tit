(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.imponderables = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function imponderablesSection(){
          heading("9. Imponderables",1,true);

          paragraph(
            "La planificación contempla mecanismos de respuesta frente a incidencias que puedan afectar la aplicación del examen complexivo, procurando continuidad, equidad y trazabilidad documental.",
            {indent:false,after:10}
          );

          bullet("• Fallas de equipo, conectividad o software: activar soporte tecnológico, reemplazo de equipo o mecanismo de respaldo según disponibilidad.");
          bullet("• Interrupciones institucionales o de infraestructura: documentar la incidencia y reprogramar cuando corresponda.");
          bullet("• Inasistencia justificada del estudiante: aplicar el procedimiento institucional vigente y conservar el respaldo de la justificación.");
          bullet("• Ausencia de personal responsable: activar la sustitución o contingencia definida por la coordinación.");
          bullet("• Toda incidencia relevante debe quedar registrada para efectos de seguimiento y mejora continua.");
        }

      imponderablesSection();
    }
  };
})();
