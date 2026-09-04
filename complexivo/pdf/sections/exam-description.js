(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.examDescription = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function examDescriptionSection(){
          heading("5. Descripción del Examen Complexivo",1,true);

          paragraph(
            "El examen complexivo es una evaluación individual realizada en equipo informático. Integra un componente teórico y un componente práctico diseñados para comprobar conocimientos, análisis y aplicación técnica de acuerdo con el perfil de egreso de cada carrera.",
            {indent:false,after:10}
          );
          insertSectionImage("examImage");

          heading("5.1. Componente Teórico",2,true);
          paragraph("El componente teórico representa el 40% de la nota final. Se desarrolla individualmente en computador mediante un instrumento estructurado de preguntas. La planificación contempla 40 preguntas y un tiempo máximo de 1 hora y 30 minutos.");

          heading("5.2. Componente Práctico",2,true);
          paragraph("El componente práctico representa el 60% de la nota final y se resuelve individualmente en equipo informático. Según la carrera, puede consistir en un caso, ejercicio, simulación, desarrollo, configuración, análisis o resolución técnica.");
          paragraph("Como regla general, el componente práctico no contempla defensa oral ante tribunal. Si una carrera requiere una actividad adicional de exposición o sustentación, esta deberá constar expresamente en el instrumento específico aprobado para esa carrera y no se asumirá como condición general del examen complexivo.");

          heading("5.3. Condiciones de Aplicación",2,true);
          paragraph("La aplicación debe asegurar identificación del estudiante, disponibilidad del equipo y software requerido, control del tiempo, respaldo de evidencias y trazabilidad del resultado.");
        }

      examDescriptionSection();
    }
  };
})();
