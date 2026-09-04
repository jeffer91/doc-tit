(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.executiveSummary = {
    render(api) {
      const {ctx,heading,paragraph,bullet,formatDateShort,lowerPeriod,normalize,totals,joinNatural,policy} = api;
      const t=totals(ctx.distribution);
      const places=Object.entries(t.byPlace);
      const schedule=ctx.schedule||[];
      const exam=schedule.find(r=>normalize(r.activity).includes("examen complexivo"));
      const supplementary=schedule.find(r=>normalize(r.activity).includes("supletorio"));
      const postPeriod=schedule.filter(r=>r.end && ctx.period?.end && r.end>ctx.period.end);
      const ev=policy.evaluation||{};

      heading("Resumen Ejecutivo",1,true);
      paragraph(
        "La presente planificación organiza integralmente el proceso de titulación mediante examen complexivo para el período "+lowerPeriod(ctx.period.name)+". Su propósito es articular en un solo instrumento la habilitación de estudiantes, la preparación académica, la construcción y aplicación de los instrumentos de evaluación, la logística institucional, la calificación, el tratamiento de incidencias y el cierre documental.",
        {indent:false}
      );
      paragraph(
        "La población planificada corresponde a "+t.total+" estudiantes registrados en la distribución vigente. La ejecución se organiza en "+joinNatural(places.map(([p,n])=>p+" ("+n+" estudiantes)"))+". Estos valores se obtienen de una única fuente de datos y alimentan de forma consistente el resumen, las tablas, los gráficos y las decisiones logísticas del documento."
      );
      paragraph(
        "La modalidad general de aplicación es presencial. La virtualidad no se considera una modalidad ordinaria del examen y únicamente puede utilizarse como excepción cuando exista una situación justificada y una autorización institucional expresa. Del mismo modo, la defensa oral no constituye una condición general del componente práctico; solo se incorpora cuando una carrera la haya definido y aprobado expresamente."
      );
      paragraph(
        "La preparación académica se desarrolla mediante "+(policy.terminology?.introductoryPreparation||"Seminarios de Titulación organizados en cuatro núcleos")+". Los cuatro núcleos se articulan con Integración Curricular o Titulación y deben dejar evidencia de planificación, desarrollo, asistencia o participación, recursos utilizados y seguimiento."
      );
      paragraph(
        "El examen integra un componente teórico con una ponderación de "+ev.theoreticalWeight+" % y un componente práctico con una ponderación de "+ev.practicalWeight+" %. La nota final se calcula a partir de una sola regla institucional y la calificación mínima configurada para aprobación es "+ev.minimumGrade+"/"+ev.gradeScale+"."
      );

      bullet("• Examen complexivo: "+(exam?formatDateShort(exam.start)+(exam.end&&exam.end!==exam.start?" al "+formatDateShort(exam.end):""):"según cronograma vigente")+".");
      bullet("• Supletorio: "+(supplementary?formatDateShort(supplementary.start)+(supplementary.end&&supplementary.end!==supplementary.start?" al "+formatDateShort(supplementary.end):""):"según cronograma vigente")+".");
      bullet("• Riesgos prioritarios: fallas técnicas, conectividad, infraestructura, ausencias justificadas, indisponibilidad de responsables, accesibilidad e incidentes de integridad académica.");
      bullet("• Resultados esperados: estudiantes correctamente habilitados, instrumentos validados, aplicación trazable, calificaciones registradas, evidencias archivadas e informe de cierre con acciones de mejora.");

      if(postPeriod.length){
        paragraph(
          "El período académico nominal finaliza el "+formatDateShort(ctx.period.end)+", pero el cronograma contiene actividades de cierre o titulación posteriores a esa fecha. Esta diferencia no modifica el período académico: corresponde a la ejecución operativa posterior prevista para completar requisitos, núcleos, examen, supletorio, registro y cierre del proceso.",
          {indent:false,bold:true}
        );
      }
    }
  };
})();
