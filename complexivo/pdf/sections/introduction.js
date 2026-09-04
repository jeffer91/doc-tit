(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.introduction = {
    render(api) {
      const {ctx,heading,paragraph,insertSectionImage,getAnalysisSentences,totals,lowerPeriod} = api;
                function introParagraphs(ctx){
                  const t=totals(ctx.distribution);
                  const places=Object.keys(t.byPlace).join(", ");
                  const p=lowerPeriod(ctx.period.name);
                  return [
                    "El examen complexivo constituye una modalidad de evaluación integral orientada a verificar que el estudiante articule los conocimientos, habilidades y competencias desarrollados durante su trayectoria académica y pueda aplicarlos de manera pertinente en situaciones vinculadas con su perfil de egreso. Su planificación requiere coordinar componentes académicos, administrativos, tecnológicos y logísticos, de modo que la evaluación se ejecute bajo criterios comunes, con trazabilidad documental y con condiciones equivalentes para los participantes.",
                    "La presente planificación corresponde al período "+p+" y organiza el proceso desde el cierre de las actividades académicas y la verificación de requisitos hasta el desarrollo de los núcleos de preparación, la aplicación del examen complexivo, el registro de resultados y la eventual instancia de supletorio. El documento funciona como marco general de actuación y se complementa con cronogramas operativos específicos para cada fase.",
                    "La planificación se sustenta en un enfoque teórico-práctico. El componente teórico permite valorar conocimientos esenciales y capacidad de análisis, mientras que el componente práctico busca evidenciar la aplicación de saberes frente a problemas, casos o situaciones propias del campo profesional. Esta integración permite que la evaluación no se limite a la reproducción de contenidos, sino que observe la capacidad del estudiante para argumentar, resolver y tomar decisiones de manera fundamentada.",
                    "La organización del período considera además la distribución real de estudiantes. Para esta planificación se registran "+t.total+" estudiantes, distribuidos entre "+places+". Esta información permite dimensionar la demanda operativa, prever espacios, organizar jornadas y articular la participación de las carreras sin alterar los nombres oficiales registrados para cada grupo.",
                    "El alcance del documento comprende la metodología del proceso, las responsabilidades institucionales, los requisitos de titulación, la preparación mediante seminarios o núcleos, la descripción de los componentes del examen, la distribución de estudiantes, los criterios para la asignación de recursos, la gestión de imponderables, los criterios de evaluación y el cierre del proceso. Cada apartado se relaciona con los demás para asegurar una ejecución ordenada y verificable.",
                    "La coordinación entre la Unidad de Titulación y Eficiencia Terminal, las coordinaciones de carrera, Secretaría Académica, las unidades de apoyo y los docentes evaluadores es indispensable para mantener la continuidad del proceso. La planificación establece responsabilidades diferenciadas y evita que las decisiones operativas se adopten de manera aislada, particularmente en aspectos como la validación de requisitos, el uso de plataformas, la logística de espacios, la evaluación y el registro de calificaciones.",
                    "Asimismo, se consideran criterios de inclusión, accesibilidad y contingencia. La institución debe prever mecanismos de atención frente a situaciones justificadas que puedan afectar la participación del estudiante o la ejecución de una jornada, procurando que cualquier ajuste conserve los principios académicos del proceso y quede debidamente documentado.",
                    "En consecuencia, esta planificación se concibe como un instrumento de gestión académica y de control del proceso de titulación. Su finalidad no es únicamente establecer fechas, sino integrar las condiciones, responsables, recursos y criterios necesarios para que el examen complexivo se desarrolle de forma coherente, transparente y alineada con el perfil profesional de cada carrera."
                  ];
                }
      heading("1. Introducción",1,true);
      const intro=introParagraphs(ctx);
      intro.slice(0,3).forEach(p=>paragraph(p));
      insertSectionImage("introImage");
      intro.slice(3).forEach(p=>paragraph(p));
      getAnalysisSentences(ctx,"general").forEach(p=>paragraph(p));
    }
  };
})();
