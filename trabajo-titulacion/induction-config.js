(() => {
  "use strict";

  const config = Object.freeze({
    id: "INDUCCION_TITULACION_VIGENTE",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,

    intro: "La inducción de titulación es un proceso orientado a proporcionar a los estudiantes una comprensión clara de las modalidades de titulación disponibles y de los requerimientos específicos para cada opción. Durante la inducción, se abordan los procedimientos, plazos y aspectos esenciales que cada estudiante debe cumplir para completar su proceso de titulación con éxito.",

    modalities: Object.freeze([
      "Examen Complexivo",
      "Tesis"
    ]),

    orientation: Object.freeze([
      Object.freeze({
        number: 1,
        title: "Explicación de las Modalidades de Titulación",
        paragraphs: Object.freeze([
          "En esta fase, se presentan las modalidades de titulación disponibles: examen complexivo y tesis. Cada modalidad se detalla para ayudar a los estudiantes a entender sus características, objetivos y los tipos de evaluación involucrados.",
          "Los estudiantes reciben información sobre los requisitos académicos y administrativos de cada modalidad, de modo que puedan hacer una elección informada basada en sus necesidades y preferencias."
        ])
      }),
      Object.freeze({
        number: 2,
        title: "Requisitos y Proceso de Selección",
        paragraphs: Object.freeze([
          "Se proporcionan lineamientos claros para que los estudiantes elijan su modalidad de titulación dentro de los plazos establecidos. Esto incluye los documentos necesarios para oficializar su elección y los trámites asociados.",
          "Además, se brindan recomendaciones sobre cómo preparar los materiales y planificar el tiempo de estudio o desarrollo del proyecto según la modalidad elegida."
        ])
      })
    ]),

    communication: Object.freeze([
      Object.freeze({
        number: 1,
        title: "Calendario de Fechas Clave",
        paragraphs: Object.freeze([
          "Durante la inducción, se presenta un calendario que incluye las fechas y plazos más importantes del proceso de titulación, como las fechas límite para la entrega de documentación, el plazo para la defensa de grado, y los períodos de entrega del proyecto de tesis o preparación para el examen complexivo.",
          "Este calendario facilita que los estudiantes organicen su tiempo y planifiquen sus actividades en función de los hitos necesarios para avanzar en el proceso de titulación."
        ]),
        dependency: "CALENDARIO_TITULACION_PERIODO"
      }),
      Object.freeze({
        number: 2,
        title: "Instrucciones sobre Procedimientos Administrativos",
        paragraphs: Object.freeze([
          "Se explican los pasos administrativos asociados al proceso de titulación, incluyendo los trámites para el envío de documentación, la asignación de tutores y lectores, el proceso de defensa y la evaluación final.",
          "También se proporciona información sobre los canales de comunicación y los contactos del personal de apoyo a los que los estudiantes pueden recurrir en caso de dudas o si requieren asistencia en cualquier etapa del proceso."
        ]),
        dependencies: Object.freeze([
          "PROCESO_TITULACION_VIGENTE",
          "CANALES_COMUNICACION_TITULACION"
        ])
      })
    ])
  });

  window.DOC_TIT_TRABAJO_INDUCTION = config;
})();
