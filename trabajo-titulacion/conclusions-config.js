(() => {
  "use strict";

  const config = Object.freeze({
    id: "CONCLUSIONES_PLANIFICACION_VIGENTES",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,
    forbiddenExecutionPhrases: Object.freeze([
      "se alcanzó",
      "se logró",
      "se obtuvo",
      "se evidenció"
    ]),
    conclusions: Object.freeze([
      Object.freeze({
        id: "CONCLUSION_01_PROCESO",
        order: 1,
        textBase: "La Planificación de Trabajo de Titulación establece una estructura organizada para el desarrollo del proceso, integrando los requisitos académicos y administrativos, las responsabilidades de los actores involucrados y las etapas necesarias para el acompañamiento, revisión y culminación del trabajo de titulación.",
        variablesAllowed: Object.freeze([]),
        condition: "always",
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "CONCLUSION_02_SEGUIMIENTO",
        order: 2,
        textBase: "La definición de funciones para estudiantes, tutores, lectores, coordinación y tribunal evaluador permite establecer mecanismos de seguimiento académico y administrativo orientados al cumplimiento de las actividades previstas durante el proceso de titulación.",
        variablesAllowed: Object.freeze([]),
        condition: "always",
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "CONCLUSION_03_CRONOGRAMA",
        order: 3,
        textBase: "El cronograma de actividades organiza secuencialmente los principales hitos del Trabajo de Titulación y establece los plazos correspondientes para su ejecución durante el período académico [PERIODO_ACADEMICO], facilitando el seguimiento oportuno de las actividades planificadas.",
        variablesAllowed: Object.freeze(["PERIODO_ACADEMICO"]),
        condition: "cronograma_aprobado",
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "CONCLUSION_04_MEJORA_CONTINUA",
        order: 4,
        textBase: "La incorporación de indicadores de seguimiento permitirá evaluar, una vez finalizado el período académico, el desempeño del proceso de titulación y generar información para la identificación de oportunidades de mejora y el fortalecimiento continuo de la gestión institucional.",
        variablesAllowed: Object.freeze([]),
        condition: "always",
        active: true,
        version: "A"
      })
    ])
  });

  window.DOC_TIT_TRABAJO_CONCLUSIONS = config;
})();
