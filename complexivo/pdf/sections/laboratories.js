(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.laboratories = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function laboratoriesSection(){
          const t=totals(ctx.distribution);
          const places=Object.keys(t.byPlace);
          heading("8. Asignación de Laboratorios y Capacidad",1,true);

          paragraph("La asignación de espacios para el período "+lowerPeriod(ctx.period.name)+" se realizará considerando la cantidad de estudiantes por carrera, los requerimientos técnicos o de software y la disponibilidad institucional. De acuerdo con la distribución registrada, la planificación contempla los siguientes lugares de ejecución: "+places.join(", ")+".");
          paragraph("La asignación de laboratorios no se define con un número fijo dentro de esta planificación general. El detalle de laboratorio, jornada, fecha, hora y responsables debe establecerse en el cronograma operativo correspondiente.");

          bullet("• La distribución de espacios se determina principalmente por la cantidad de estudiantes de cada grupo y por los requerimientos técnicos de la carrera.");
          bullet("• Las asignaciones se establecen desde el inicio del proceso y únicamente se modifican cuando exista una necesidad justificada y validada por la coordinación.");
          bullet("• Cuando existan necesidades específicas de accesibilidad, se deben asignar espacios que permitan la participación del estudiante en condiciones adecuadas.");
          bullet("• La rendición se planifica de forma presencial para las modalidades contempladas por la institución. Los casos excepcionales de rendición virtual requieren solicitud formal, justificación y autorización institucional.");
          bullet("• Antes de cada jornada deben realizarse pruebas técnicas y verificaciones de conectividad, equipos y software.");
          bullet("• Se prevé soporte tecnológico durante las jornadas y mecanismos de respaldo de las evidencias generadas.");
          bullet("• El personal docente supervisa el cumplimiento de tiempos, normas y protocolos y apoya la resolución de incidencias logísticas o técnicas menores.");
        }

      laboratoriesSection();
    }
  };
})();
