(() => {
  "use strict";

  const config = Object.freeze({
    id: "RECOMENDACIONES_PLANIFICACION_VIGENTES",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,
    forbiddenResultPhrases: Object.freeze([
      "se alcanzó",
      "se logró",
      "se obtuvo",
      "se evidenció",
      "bajo porcentaje de aprobación",
      "retrasos detectados",
      "insatisfacción estudiantil"
    ]),
    recommendations: Object.freeze([
      Object.freeze({
        id: "REC_01_CRONOGRAMA",
        order: 1,
        textBase: "Mantener un seguimiento permanente del cronograma establecido para el período académico [PERIODO_ACADEMICO], verificando el cumplimiento oportuno de las actividades, entregas, revisiones y demás hitos definidos para el desarrollo del Trabajo de Titulación.",
        variablesAllowed: Object.freeze(["PERIODO_ACADEMICO"]),
        condition: "cronograma_aprobado",
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "REC_02_ACOMPANAMIENTO",
        order: 2,
        textBase: "Fortalecer la comunicación y el acompañamiento permanente entre estudiantes, tutores, lectores y la Coordinación de Titulación, procurando que las observaciones, revisiones y requerimientos sean atendidos dentro de los plazos establecidos.",
        variablesAllowed: Object.freeze([]),
        condition: "always",
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "REC_03_REQUISITOS",
        order: 3,
        textBase: "Verificar de manera progresiva el cumplimiento de los requisitos académicos, documentales, administrativos y financieros establecidos para la titulación, con el fin de identificar oportunamente situaciones que puedan afectar la continuidad del estudiante en las diferentes etapas del proceso.",
        variablesAllowed: Object.freeze([]),
        condition: "always",
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "REC_04_INDICADORES",
        order: 4,
        textBase: "Aplicar al finalizar el período académico los indicadores definidos para el seguimiento del proceso de titulación, utilizando información proveniente de fuentes institucionales verificables, de manera que los resultados obtenidos permitan sustentar la identificación de oportunidades de mejora y la toma de decisiones institucionales.",
        variablesAllowed: Object.freeze([]),
        condition: "always",
        active: true,
        version: "A"
      })
    ])
  });

  window.DOC_TIT_TRABAJO_RECOMMENDATIONS = config;
})();
