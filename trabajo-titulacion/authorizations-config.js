(() => {
  "use strict";

  const config = Object.freeze({
    id: "INFORME_AUTORIZACIONES_TRABAJO_TITULACION_VIGENTE",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,
    intro: "La elaboración del informe de titulación y la gestión de autorizaciones financieras son componentes fundamentales en el proceso de titulación. El informe permite documentar los avances y resultados de las gestiones realizadas, mientras que las autorizaciones financieras aseguran que los estudiantes cumplan con las obligaciones económicas para acceder a las etapas finales de titulación.",
    report: Object.freeze({
      intro: "El informe de titulación es un documento que resume el progreso, las gestiones y los resultados obtenidos en cada fase del proceso de titulación. Este informe es vital para la transparencia y trazabilidad del proceso, garantizando que cada paso se complete conforme a los requisitos institucionales.",
      tracking: Object.freeze([
        Object.freeze({
          number: 1,
          title: "Documentación del Progreso",
          text: "El informe de titulación registra el avance de los estudiantes a lo largo del proceso, desde la selección de la modalidad hasta la defensa final. Se incluyen detalles de las asignaciones de tutor y lector, la revisión de notas, y las fases de desarrollo del proyecto."
        }),
        Object.freeze({
          number: 2,
          title: "Evaluación de Resultados",
          text: "Cada fase de titulación se evalúa para verificar que los estudiantes cumplan con los requisitos y objetivos específicos. La evaluación incluye comentarios del tutor y lector sobre el trabajo realizado, así como una revisión de los logros y las áreas de mejora detectadas durante el proceso."
        }),
        Object.freeze({
          number: 3,
          title: "Análisis de Desempeño Institucional",
          text: "Además del progreso individual, el informe contribuye a la evaluación institucional, permitiendo identificar fortalezas y oportunidades de mejora en el proceso de titulación. Este análisis es utilizado para ajustar procedimientos y mejorar la eficiencia terminal."
        })
      ])
    }),
    financialPermissions: Object.freeze({
      intro: "Para completar el proceso de titulación, los estudiantes deben estar al día con sus pagos. Sin embargo, en algunos casos, se pueden gestionar permisos temporales para aquellos con obligaciones financieras pendientes, bajo ciertas condiciones establecidas por la institución.",
      temporaryPermission: Object.freeze([
        Object.freeze({
          number: 1,
          title: "Solicitud de Permisos Temporales",
          text: "Los estudiantes con pagos pendientes pueden solicitar un permiso temporal que les permita continuar en el proceso de titulación. Este permiso es gestionado en colaboración con el departamento financiero y debe cumplir con los criterios de elegibilidad."
        }),
        Object.freeze({
          number: 2,
          title: "Condiciones del Permiso",
          text: "Los permisos se otorgan de forma condicional, sujetos a la regularización de los pagos dentro de un plazo específico. En caso de incumplimiento, el acceso a plataformas académicas y los permisos para la defensa de grado pueden ser suspendidos."
        })
      ]),
      billingApproval: Object.freeze([
        Object.freeze({
          number: 1,
          title: "Revisión y Aprobación de Permisos",
          text: "El departamento de facturación es responsable de revisar cada solicitud de permiso financiero, evaluando el historial de pagos y estableciendo las condiciones necesarias para su aprobación. Los permisos se otorgan en base a políticas de la institución que buscan apoyar a los estudiantes mientras se mantienen las obligaciones financieras."
        }),
        Object.freeze({
          number: 2,
          title: "Seguimiento y Regularización de Pagos",
          text: "Una vez otorgado el permiso, el departamento de facturación realiza un seguimiento continuo para asegurar que el estudiante cumpla con el plan de pagos acordado. La regularización completa es un requisito indispensable para la obtención del título al final del proceso."
        })
      ])
    })
  });

  window.DOC_TIT_TRABAJO_AUTHORIZATIONS = config;
})();
