(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.evaluation = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function evaluationCriteriaSection(){
          heading("10. Criterios de Evaluación",1,true);

          paragraph(
            "La evaluación del examen complexivo integra dos componentes individuales: teórico y práctico. Ambos se aplican mediante equipo informático y se valoran con criterios previamente definidos para obtener la nota final.",
            {indent:false,after:10}
          );
          insertSectionImage("evaluationImage");

          heading("10.1. Componente Teórico",2,true);
          paragraph("El componente teórico representa el 40% de la nota final. Evalúa conocimientos fundamentales, comprensión y capacidad de análisis mediante un instrumento estructurado de 40 preguntas, con un tiempo máximo de 1 hora y 30 minutos.");
          paragraph("La calificación se obtiene a partir de las respuestas registradas individualmente y debe conservar trazabilidad con el instrumento aplicado.");

          heading("10.2. Componente Práctico",2,true);
          paragraph("El componente práctico representa el 60% de la nota final. Se desarrolla individualmente en computador mediante un caso, ejercicio, simulación, desarrollo, configuración, análisis o resolución técnica, de acuerdo con la naturaleza de la carrera.");
          paragraph("Los criterios de valoración consideran exactitud o calidad técnica, aplicación pertinente de conocimientos, capacidad de análisis, resolución del problema, uso adecuado de herramientas y cumplimiento de los requerimientos establecidos en el instrumento.");
          paragraph("No se contempla una defensa oral ante tribunal como regla general del examen complexivo. Cualquier excepción deberá estar expresamente definida y aprobada para la carrera correspondiente.");

          heading("10.3. Nota Final del Examen Complexivo",2,true);
          paragraph("La nota final se calcula con una ponderación de 40% para el componente teórico y 60% para el componente práctico. La planificación base establece 7/10 como calificación mínima de aprobación.");
          paragraph("El resultado final debe registrarse en los sistemas institucionales y vincularse con las evidencias de aplicación y evaluación.");
        }

      evaluationCriteriaSection();
    }
  };
})();
