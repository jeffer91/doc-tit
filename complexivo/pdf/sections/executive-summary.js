(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.executiveSummary = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function summarySection(){
          const t=totals(ctx.distribution);
          const places=Object.entries(t.byPlace);
          const schedule=ctx.schedule||[];
          const exam=schedule.find(r=>normalize(r.activity).includes("examen complexivo"));
          const supplementary=schedule.find(r=>normalize(r.activity).includes("supletorio"));

          heading("Resumen Ejecutivo",1,true);

          paragraph(
            "La planificación organiza la preparación y aplicación individual del examen complexivo del período "+lowerPeriod(ctx.period.name)+", con ejecución en equipo informático y articulación de requisitos, núcleos de preparación, logística, evaluación y registro de resultados.",
            {indent:false,after:10}
          );

          bullet("• Estudiantes planificados: "+t.total+".");
          bullet("• Lugares de ejecución: "+places.map(([p,n])=>p+" ("+n+")").join(", ")+".");
          if(exam) bullet("• Examen complexivo: "+formatDateShort(exam.start)+(exam.end&&exam.end!==exam.start?" al "+formatDateShort(exam.end):"")+".");
          if(supplementary) bullet("• Supletorio: "+formatDateShort(supplementary.start)+(supplementary.end&&supplementary.end!==supplementary.start?" al "+formatDateShort(supplementary.end):"")+".");
          bullet("• Preparación: cuatro núcleos articulados por Integración Curricular o Titulación, en jornada nocturna; las sesiones presenciales quedan grabadas.");
          bullet("• Evaluación: componente teórico 40% y componente práctico 60%, ambos de carácter individual.");
          bullet("• Modalidad de aplicación: presencial como regla general; la virtualidad requiere autorización institucional excepcional.");
        }

      summarySection();
    }
  };
})();
