(() => {
  "use strict";

  const config = Object.freeze({
    id: "INDICADORES_TITULACION_VIGENTES",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,
    intro: "Al finalizar cada período académico, la Coordinación de Titulación realiza un análisis técnico del proceso mediante indicadores clave que permiten evaluar el desempeño global del proceso de titulación. Este análisis se plasma en un informe independiente que se convierte en insumo para la toma de decisiones y el rediseño institucional.",
    lead: "Los indicadores utilizados incluyen:",
    indicators: Object.freeze([
      Object.freeze({
        id: "INDICADOR_01",
        order: 1,
        name: "Eficiencia Terminal",
        description: "Mide el porcentaje de estudiantes que culminan el proceso en tiempo y forma.",
        type: "Porcentaje",
        formulaText: "(Número de estudiantes que terminan en tiempo y forma / Número total de estudiantes en el proceso) × 100",
        numerator: "Estudiantes que terminan en tiempo y forma",
        denominator: "Total de estudiantes en el proceso",
        multiplier: 100,
        unit: null,
        sourceData: null,
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "INDICADOR_02",
        order: 2,
        name: "Tasa de Aprobación en la Defensa",
        description: "Evalúa el porcentaje de estudiantes que aprueban su defensa en el primer intento.",
        type: "Porcentaje",
        formulaText: "(Número de estudiantes que aprueban la defensa / Número total de estudiantes en el proceso) × 100",
        numerator: "Estudiantes que aprueban la defensa",
        denominator: "Total de estudiantes en el proceso",
        multiplier: 100,
        unit: null,
        sourceData: null,
        active: true,
        version: "A",
        validationNote: "La descripción menciona el primer intento, mientras que la fórmula institucional vigente no lo especifica en el numerador. No modificar sin validación institucional."
      }),
      Object.freeze({
        id: "INDICADOR_03",
        order: 3,
        name: "Índice de Revisión de Borradores a Tiempo",
        description: "Mide el cumplimiento de los plazos para revisión y entrega de borradores.",
        type: "Porcentaje",
        formulaText: "(Número de borradores revisados a tiempo / Total de borradores) × 100",
        numerator: "Borradores revisados a tiempo",
        denominator: "Total de borradores",
        multiplier: 100,
        unit: null,
        sourceData: null,
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "INDICADOR_04",
        order: 4,
        name: "Tiempo Promedio de Culminación de Proyectos",
        description: "Calcula el tiempo medio que tarda un estudiante desde la asignación de tutor hasta la defensa.",
        type: "Promedio",
        formulaText: "Suma de los tiempos individuales / Número total de estudiantes en el proceso",
        numerator: "Suma de los tiempos individuales",
        denominator: "Número total de estudiantes en el proceso",
        multiplier: null,
        unit: null,
        measurementStart: "Asignación de tutor",
        measurementEnd: "Defensa",
        sourceData: null,
        active: true,
        version: "A"
      }),
      Object.freeze({
        id: "INDICADOR_05",
        order: 5,
        name: "Índice de Satisfacción de Estudiantes y Docentes",
        description: "Se obtiene a través de encuestas institucionales aplicadas al finalizar el proceso.",
        type: "Índice",
        formulaText: "Suma del puntaje de satisfacción / Puntaje máximo posible",
        numerator: "Suma del puntaje de satisfacción",
        denominator: "Puntaje máximo posible",
        multiplier: null,
        unit: null,
        sourceData: "Encuesta institucional",
        measurementMoment: "Finalización del proceso",
        active: true,
        version: "A"
      })
    ]),
    informationSources: Object.freeze([
      "Plataformas académicas",
      "Reportes docentes",
      "Formularios internos",
      "Seguimiento institucional"
    ]),
    sourcesText: "La información se recopila desde fuentes oficiales como plataformas académicas, reportes docentes, formularios internos y seguimiento institucional.",
    improvementText: "Las observaciones obtenidas permiten identificar oportunidades de mejora como el ajuste de cronogramas, fortalecimiento del acompañamiento docente y optimización de recursos. Todo este análisis refuerza el compromiso institucional con la mejora continua y el aseguramiento de la calidad educativa."
  });

  window.DOC_TIT_TRABAJO_INDICATORS = config;
})();
