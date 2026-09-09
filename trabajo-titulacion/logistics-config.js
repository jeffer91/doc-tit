(() => {
  "use strict";

  const processConfig = window.DOC_TIT_TRABAJO_PROCESS || {};
  const academicSystem = processConfig.grades?.system || "SISACAD";
  const tribunalMemberCount = Number(processConfig.defense?.tribunal?.memberCount) || 3;

  const logistics = Object.freeze({
    id: "GESTION_ADMINISTRATIVA_LOGISTICA_TITULACION_VIGENTE",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,
    masterDependencies: Object.freeze({
      academicSystem: "DOC_TIT_TRABAJO_PROCESS.grades.system",
      tribunalMemberCount: "DOC_TIT_TRABAJO_PROCESS.defense.tribunal.memberCount"
    }),
    parameters: Object.freeze({
      initialTutorings: 1,
      tutoringsPerDraft: 1,
      additionalTutorings: "bajo solicitud",
      readerCount: 1,
      virtualCommunicationLimit: "Sin límite",
      defenseCount: 1,
      systemUserCount: 1,
      tribunalMemberCount,
      academicSystem
    }),
    intro: "La gestión administrativa y logística en el proceso de titulación es fundamental para asegurar que cada estudiante reciba orientación y soporte adecuado de manera personalizada. La interacción directa entre el estudiante, el tutor y el coordinador de titulación permite un seguimiento preciso y adaptado a las necesidades individuales de cada participante en el proceso.",
    assignmentsTable: Object.freeze({
      title: "Elementos y Asignaciones para el Proceso de Titulación",
      columns: Object.freeze(["Elemento", "Descripción", "Cantidad por estudiante", "Responsable"]),
      rows: Object.freeze([
        Object.freeze({order:1,element:"Tutorías",description:"1 tutoría inicial y 1 tutoría por cada borrador; adicional bajo solicitud.",quantity:"Variable según avance",responsibleRole:"Coordinador de Titulación"}),
        Object.freeze({order:2,element:"Lector",description:"Evaluación de proyecto por lector asignado al estudiante.",quantity:"1 lector",responsibleRole:"Coordinador de Titulación"}),
        Object.freeze({order:3,element:"Comunicación Virtual",description:"Contacto directo con tutor y lector a través de mensajes, correo o Teams.",quantity:"Sin límite",responsibleRole:"Coordinador de Titulación"}),
        Object.freeze({order:4,element:"Defensa de Tesis",description:"Presentación y defensa única del proyecto de tesis ante el tribunal evaluador.",quantity:"1 defensa",responsibleRole:"Coordinador General de Carreras"}),
        Object.freeze({order:5,element:`Sistema ${academicSystem}`,description:"Plataforma de registro y seguimiento académico; cada estudiante tiene su usuario.",quantity:"1 usuario",responsibleRole:"Departamento de Sistemas"}),
        Object.freeze({order:6,element:"Tribunal Evaluador",description:`Comité de ${tribunalMemberCount} miembros (diferentes del tutor y lector) para evaluar la defensa de tesis.`,quantity:`${tribunalMemberCount} miembros`,responsibleRole:"Coordinador General de Carreras"})
      ]),
      note: "La tabla especifica los elementos y asignaciones necesarios para el desarrollo del proceso de titulación, adaptado para modalidad completamente virtual."
    }),
    digitalResourcesTable: Object.freeze({
      title: "Recursos Digitales Asignados para el Proceso de Titulación",
      columns: Object.freeze(["Recurso Digital", "Descripción", "Acceso por Estudiante", "Responsable de Gestión"]),
      resources: Object.freeze([
        Object.freeze({order:1,name:academicSystem,description:"Plataforma de registro y seguimiento académico",studentAccess:"Sí",responsibleRole:"Departamento de Sistemas",active:true}),
        Object.freeze({order:2,name:"Microsoft Teams",description:"Comunicación directa y tutorías virtuales",studentAccess:"Sí",responsibleRole:"Coordinador de Titulación",active:true}),
        Object.freeze({order:3,name:"Correo Institucional",description:"Canal para envío de documentos y retroalimentación",studentAccess:"Sí",responsibleRole:"Área Académica",active:true}),
        Object.freeze({order:4,name:"Telegram",description:"Grupo por carrera para comunicados",studentAccess:"Sí",responsibleRole:"Coordinador de Titulación",active:true})
      ]),
      note: "La tabla describe los recursos digitales proporcionados a los estudiantes y al personal académico para facilitar la gestión y el seguimiento del proceso de titulación, asegurando la accesibilidad y la comunicación fluida."
    }),
    communication: Object.freeze({
      intro: "En lugar de una comunicación generalizada, el proceso de titulación en ITSQMET se basa en la interacción directa entre el estudiante y su tutor asignado, así como con el coordinador de titulación, para garantizar que cada aspecto del trabajo de titulación sea atendido de forma específica y personalizada.",
      tutorFollowUp: Object.freeze([
        Object.freeze({number:1,title:"Asignación y Supervisión del Tutor",paragraphs:Object.freeze([
          "Una vez asignado, el tutor trabaja directamente con el estudiante para proporcionar orientación continua en cada etapa del proyecto de tesis. Esta supervisión abarca desde la definición del tema y la metodología hasta la revisión de avances y ajustes necesarios en el trabajo académico.",
          "El tutor se asegura de que el estudiante cumpla con los plazos de entrega y resuelve las dudas que puedan surgir en el desarrollo del proyecto, manteniendo una comunicación fluida para ofrecer retroalimentación constante."
        ])}),
        Object.freeze({number:2,title:"Soporte en el Desarrollo de Contenido",paragraphs:Object.freeze([
          "El tutor ofrece apoyo académico, guiando al estudiante en la construcción de cada sección del proyecto de tesis, supervisando la calidad del contenido, la coherencia teórica, la metodología aplicada y el análisis de resultados.",
          "Además, el tutor ayuda a reforzar las habilidades investigativas del estudiante y a estructurar adecuadamente el proyecto de acuerdo con los estándares académicos de la institución."
        ])})
      ]),
      coordinatorFollowUp: Object.freeze([
        Object.freeze({number:1,title:"Acompañamiento por el Coordinador de Titulación",paragraphs:Object.freeze([
          "El coordinador de titulación se comunica directamente con cada estudiante para revisar el cumplimiento de los requisitos administrativos, la documentación de respaldo y el cumplimiento de los plazos establecidos en el calendario de titulación.",
          "Este seguimiento permite asegurar que el estudiante esté al tanto de sus responsabilidades y que cualquier problema o duda administrativa se resuelva oportunamente."
        ])}),
        Object.freeze({number:2,title:"Verificación del Proceso de Titulación",paragraphs:Object.freeze([
          "A medida que el estudiante avanza en su proyecto de tesis, el coordinador verifica que los requisitos estén cumplidos en cada fase, confirmando la correcta presentación del proyecto para la defensa y el cumplimiento de los criterios de titulación.",
          "El coordinador también coordina la organización de la defensa de grado y gestiona la logística necesaria para llevar a cabo esta última etapa del proceso."
        ])})
      ]),
      closing: "La comunicación directa entre el tutor, el coordinador de titulación y el estudiante asegura un acompañamiento personalizado, atendiendo las particularidades de cada proyecto y facilitando un proceso de titulación adaptado a las necesidades individuales de cada participante."
    })
  });

  window.DOC_TIT_TRABAJO_LOGISTICS = logistics;
})();
