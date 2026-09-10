(() => {
  "use strict";

  const config = Object.freeze({
    id: "GESTION_ADMINISTRATIVA_TITULACION_VIGENTE",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,

    intro: "La gestión administrativa y logística en el proceso de titulación es fundamental para asegurar que cada estudiante reciba orientación y soporte adecuado de manera personalizada. La interacción directa entre el estudiante, el tutor y el coordinador de titulación permite un seguimiento preciso y adaptado a las necesidades individuales de cada participante en el proceso.",

    assignments: Object.freeze({
      title: "Elementos y Asignaciones para el Proceso de Titulación",
      note: "La tabla especifica los elementos y asignaciones necesarios para el desarrollo del proceso de titulación, adaptado para modalidad completamente virtual.",
      rows: Object.freeze([
        Object.freeze({element:"Tutorías",description:"1 tutoría inicial y 1 tutoría por cada borrador; adicional bajo solicitud.",quantity:"Variable según avance",responsible:"Coordinador de Titulación"}),
        Object.freeze({element:"Lector",description:"Evaluación de proyecto por lector asignado al estudiante.",quantity:"1 lector",responsible:"Coordinador de Titulación"}),
        Object.freeze({element:"Comunicación Virtual",description:"Contacto directo con tutor y lector a través de mensajes, correo, o Teams.",quantity:"Sin límite",responsible:"Coordinador de Titulación"}),
        Object.freeze({element:"Defensa de Tesis",description:"Presentación y defensa única del proyecto de tesis ante el tribunal evaluador.",quantity:"1 defensa",responsible:"Coordinador General de Carreras"}),
        Object.freeze({elementRef:"academicSystem",description:"Plataforma de registro y seguimiento académico; cada estudiante tiene su usuario.",quantity:"1 usuario",responsible:"Departamento de Sistemas"}),
        Object.freeze({element:"Tribunal Evaluador",descriptionRef:"tribunalDescription",quantityRef:"tribunalMemberCount",responsible:"Coordinador General de Carreras"})
      ])
    }),

    resources: Object.freeze({
      title: "Recursos Digitales Asignados para el Proceso de Titulación",
      note: "La tabla describe los recursos digitales proporcionados a los estudiantes y al personal académico para facilitar la gestión y el seguimiento del proceso de titulación, asegurando la accesibilidad y la comunicación fluida.",
      rows: Object.freeze([
        Object.freeze({nameRef:"academicSystem",description:"Plataforma de registro y seguimiento académico",access:"Sí",responsible:"Departamento de Sistemas",active:true,order:1}),
        Object.freeze({name:"Microsoft Teams",description:"Comunicación directa y tutorías virtuales",access:"Sí",responsible:"Coordinador de Titulación",active:true,order:2}),
        Object.freeze({name:"Correo Institucional",description:"Canal para envío de documentos y retroalimentación",access:"Sí",responsible:"Área Académica",active:true,order:3}),
        Object.freeze({name:"Telegram",description:"Grupo por carrera para comunicados",access:"Sí",responsible:"Coordinador de Titulación",active:true,order:4})
      ])
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

  window.DOC_TIT_TRABAJO_ADMIN = config;
})();
