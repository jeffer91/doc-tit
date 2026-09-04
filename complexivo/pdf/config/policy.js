(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.config = ns.config || {};
  ns.config.policy = {
    documentTitle: "Planificación del Examen Complexivo",
    version: "1.0",
    terminology: {
      preparation: "Núcleos de Titulación",
      introductoryPreparation: "Seminarios de Titulación organizados en cuatro núcleos"
    },
    evaluation: {
      theoreticalWeight: 40,
      practicalWeight: 60,
      minimumGrade: 7,
      gradeScale: 10,
      theoreticalQuestions: 40,
      theoreticalMinutes: 90
    },
    modality: {
      generalRule: "presencial",
      virtualOnlyByException: true,
      oralDefenseDefault: false
    },
    targetPages: {
      minimum: 45,
      idealMinimum: 48,
      idealMaximum: 52,
      acceptableMaximum: 55
    },
    legalReferences: [
      {
        norm: "Constitución de la República del Ecuador",
        provision: "Principios y disposiciones vigentes aplicables a educación superior, calidad, igualdad de oportunidades y formación integral",
        application: "Orienta la organización del proceso bajo criterios de calidad, equidad, pertinencia y respeto de derechos."
      },
      {
        norm: "Ley Orgánica de Educación Superior (LOES)",
        provision: "Disposiciones vigentes relacionadas con derechos estudiantiles, egreso, evaluación y titulación",
        application: "Sustenta la obligación institucional de establecer condiciones claras, verificables y consistentes para la titulación."
      },
      {
        norm: "Reglamento a la Ley Orgánica de Educación Superior",
        provision: "Disposiciones vigentes relacionadas con información académica, egreso, titulación y registro",
        application: "Exige trazabilidad de la información y articulación de los registros que respaldan el proceso."
      },
      {
        norm: "Reglamento institucional del Área de Titulación",
        provision: "Disposiciones institucionales vigentes para modalidades, requisitos, evaluación y cierre del proceso",
        application: "Define el marco operativo interno que debe aplicarse al período generado."
      }
    ]
  };
})();
