(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.legalBasis = {
    render(api) {
      const {ctx,heading,paragraph,lowerPeriod} = api;
                function legalParagraphs(ctx){
                  const p=lowerPeriod(ctx.period.name);
                  return [
                    "La planificación del examen complexivo para el período "+p+" se enmarca en la normativa nacional de educación superior y en la regulación institucional aplicable al proceso de titulación. La base legal permite vincular la planificación operativa con los derechos del estudiante, las finalidades del sistema de educación superior y las obligaciones institucionales relacionadas con evaluación, egreso, titulación y registro de títulos.",
                    "La Constitución de la República del Ecuador constituye el marco superior de referencia para el sistema educativo y para las finalidades de la educación superior. Estos principios orientan la organización de procesos académicos que deben asegurar calidad, pertinencia, igualdad de oportunidades y formación integral.",
                    "La Ley Orgánica de Educación Superior reconoce los derechos de los estudiantes y regula las responsabilidades de las instituciones de educación superior respecto del acceso, permanencia, egreso y titulación. Para el examen complexivo, esto exige condiciones previamente definidas, verificables y aplicadas de manera consistente.",
                    "El Reglamento a la Ley Orgánica de Educación Superior fue expedido por la Presidencia de la República mediante Decreto Ejecutivo No. 494 y publicado en el Suplemento del Registro Oficial No. 110 de 21 de julio de 2022. Su aplicación refuerza la necesidad de mantener trazabilidad sobre información académica, egreso, titulación y registro de títulos.",
                    "En el ámbito institucional, el Reglamento del Área de Titulación establece la finalidad y alcance del proceso y orienta la titulación hacia la validación integral de competencias adquiridas durante la formación profesional y su relación con el perfil de egreso.",
                    "La planificación adopta una evaluación teórico-práctica y articula requisitos, preparación académica, aplicación del examen, registro de resultados, atención de contingencias y cierre documental. Las disposiciones complementarias que se apliquen durante el período deberán observar la normativa vigente al momento de su ejecución."
                  ];
                }
      heading("2. Base Legal",1,true);
      legalParagraphs(ctx).forEach(p=>paragraph(p));
    }
  };
})();
