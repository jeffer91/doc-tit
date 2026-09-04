(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.methodology = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
                function methodologySection(){
                  heading("3. Metodología",1,true);

                  paragraph(
                    "La metodología del examen complexivo organiza el proceso de manera secuencial y verificable, desde la habilitación del estudiante hasta el registro final de resultados. La aplicación es individual y se desarrolla principalmente mediante recursos informáticos, de acuerdo con los instrumentos definidos para cada carrera.",
                    {indent:false,after:10}
                  );
                  insertSectionImage("methodologyImage");

                  heading("3.1. Enfoque Metodológico",2,true);
                  paragraph("El proceso integra planificación, preparación académica, aplicación, evaluación y mejora continua. Cada fase se vincula con responsables, evidencias y fechas del período para asegurar trazabilidad.");

                  heading("3.2. Fase de Inducción al Proceso",2,true);
                  paragraph("La inducción comunica a los estudiantes el alcance del examen complexivo, los requisitos de habilitación, la estructura de los componentes teórico y práctico, el cronograma y las condiciones de aplicación.");

                  heading("3.3. Fase de Diseño del Examen Complexivo",2,true);
                  paragraph("Los instrumentos se diseñan con base en el perfil de egreso y en los contenidos priorizados por cada carrera. El componente práctico debe resolverse individualmente en equipo informático mediante caso, ejercicio, simulación, desarrollo o resolución técnica, según corresponda.");

                  heading("3.4. Fase de Organización y Distribución",2,true);
                  paragraph("La organización considera cantidad de estudiantes, lugar de ejecución, disponibilidad de equipos, conectividad, software requerido y soporte tecnológico.");

                  heading("3.5. Fase de Preparación: Núcleos de Titulación",2,true);
                  paragraph("La preparación se desarrolla mediante cuatro núcleos temáticos articulados por la asignatura de Integración Curricular o Titulación. Las sesiones se realizan en jornada nocturna, de forma presencial, y quedan grabadas como recurso de consulta.");

                  heading("3.6. Fase de Aplicación del Examen Complexivo",2,true);
                  paragraph("La aplicación se realiza de forma individual. Cada estudiante utiliza un equipo informático y desarrolla los instrumentos definidos para el componente teórico y práctico bajo condiciones de control, identificación y registro.");

                  heading("3.7. Fase de Evaluación y Retroalimentación",2,true);
                  paragraph("Los resultados se valoran mediante criterios previamente establecidos y se registran en los sistemas institucionales. Cuando corresponda, se habilita la instancia de supletorio conforme al cronograma.");

                  heading("3.8. Coordinación y Mejora Continua",2,true);
                  paragraph("Las incidencias, resultados y observaciones del período se utilizan como insumo para mejorar instrumentos, logística y coordinación de períodos posteriores.");

                  ns.parts.methodology.responsibilities(api);
                  ns.parts.methodology.schedule(api);
                }
      methodologySection();
    }
  };
})();
