(() => {
  "use strict";

  const processConfig = Object.freeze({
    id: "PROCESO_TRABAJO_TITULACION_VIGENTE",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,

    conflicts: Object.freeze({
      projectDuration: Object.freeze({
        status: "pending_validation",
        validatedValue: null,
        sourceClaims: Object.freeze({ section3: "dos meses", section5: "cuatro meses" })
      }),
      tutorDefenseParticipation: Object.freeze({
        status: "pending_validation",
        validatedValue: null,
        sourceClaims: Object.freeze({ section3: "no participa", section5: "se notifica la defensa" })
      }),
      readerDefenseParticipation: Object.freeze({
        status: "pending_validation",
        validatedValue: null,
        sourceClaims: Object.freeze({ section3: "no participa", section5_1_2: "observa y evalúa la defensa", section5_4_1: "se notifica la defensa" })
      })
    }),

    assignment: Object.freeze({
      intro: "La asignación de un tutor y un lector es fundamental para asegurar el éxito del proyecto de titulación. El coordinador de titulación es el encargado de designar al tutor del estudiante en función de criterios específicos, asegurando así un acompañamiento adecuado y una evaluación relevante del proyecto.",
      criteriaIntro: "La asignación del tutor y el lector se basa en los siguientes criterios:",
      criteria: Object.freeze([
        Object.freeze({number:1,title:"Especialización en el Área de Investigación",text:"Tanto el tutor como el lector son seleccionados en función de su experiencia y conocimiento en el área específica del tema de titulación del estudiante. Esto garantiza un acompañamiento adecuado y una evaluación relevante del proyecto."}),
        Object.freeze({number:2,title:"Disponibilidad y Carga Académica",text:"Se toma en cuenta la disponibilidad de los docentes, evitando la sobrecarga de tareas para asegurar que puedan brindar el tiempo y la atención necesarios para la supervisión del proyecto de titulación."}),
        Object.freeze({number:3,title:"Experiencia en Dirección de Trabajos de Titulación",text:"Se prioriza a docentes con experiencia previa en la dirección y evaluación de trabajos de titulación, asegurando que comprendan los requisitos del proceso y los estándares académicos de la institución."}),
        Object.freeze({number:4,title:"Asignación Equitativa de Estudiantes",text:"La coordinación se encarga de distribuir equitativamente la cantidad de estudiantes asignados a cada tutor y lector, permitiendo una supervisión y evaluación justas y balanceadas."})
      ]),
      responsibilitiesIntro: "Cada rol en el proceso de titulación tiene funciones específicas que son esenciales para la orientación y evaluación del trabajo del estudiante:",
      tutorResponsibilities: Object.freeze([
        Object.freeze({label:"Guía Académica y Metodológica",text:"Orientar al estudiante en la formulación de la hipótesis, el desarrollo del marco teórico, la metodología y la interpretación de los resultados."}),
        Object.freeze({label:"Revisión de Avances",text:"Revisar y proporcionar retroalimentación constante sobre los avances del trabajo, asegurándose de que se cumplan los estándares académicos y los plazos establecidos."}),
        Object.freeze({label:"Resolución de Dudas",text:"Facilitar la comprensión del proceso de investigación y responder a las consultas del estudiante, ayudándole a superar los desafíos académicos que surjan."}),
        Object.freeze({label:"Supervisión Ética y Académica",text:"Verificar que el trabajo de titulación cumpla con las normas éticas y académicas establecidas, promoviendo la integridad académica."}),
        Object.freeze({label:"Preparación para la Defensa",text:"Preparar al estudiante para la defensa de su proyecto, brindando recomendaciones sobre la presentación y argumentación de su trabajo."})
      ]),
      readerResponsibilities: Object.freeze([
        Object.freeze({label:"Evaluación Crítica",text:"Revisar el trabajo de titulación de forma crítica y objetiva, evaluando el rigor teórico, metodológico y analítico del proyecto."}),
        Object.freeze({label:"Retroalimentación",text:"Proporcionar observaciones y recomendaciones adicionales para mejorar la calidad del trabajo antes de la defensa final."}),
        Object.freeze({label:"Evaluación Independiente",text:"El lector tiene la responsabilidad de ofrecer una perspectiva independiente del trabajo, contribuyendo a una evaluación integral y balanceada."}),
        Object.freeze({label:"Asignación de Calificaciones",text:"Junto con el tutor, el lector asigna una calificación preliminar al trabajo de titulación, la cual se registra y comunica antes de la defensa."}),
        Object.freeze({label:"Desempeño en la Defensa",text:"El lector observa y evalúa la defensa de grado, asegurándose de que el estudiante demuestre dominio sobre el contenido y una capacidad de argumentación sólida en su presentación final.",conflictKey:"readerDefenseParticipation"})
      ])
    }),

    projectDevelopment: Object.freeze({
      intro: "El desarrollo del proyecto de tesis es una etapa central del proceso de titulación, donde el estudiante aplica sus conocimientos y habilidades para abordar un problema o tema relevante en su área de estudio. Esta fase implica la elaboración de un marco investigativo sólido, la formulación de hipótesis y la propuesta de soluciones concretas. Además, el proyecto de tesis está sujeto a plazos específicos y entregas parciales que facilitan el seguimiento y revisión del avance por parte del tutor.",
      structureIntro: "Para cumplir con los estándares académicos del Instituto Superior Tecnológico Quito Metropolitano (ITSQMET), el proyecto de tesis debe incluir los siguientes elementos fundamentales:",
      structure: Object.freeze([
        Object.freeze({number:1,title:"Marco Investigativo",intro:"El marco investigativo proporciona el contexto y justificación del proyecto. Debe incluir:",items:Object.freeze([
          Object.freeze({label:"Revisión de Literatura",text:"Un análisis detallado de estudios previos, teorías y conceptos clave que fundamentan el tema de investigación."}),
          Object.freeze({label:"Contexto y Alcance",text:"Definición de la relevancia del problema, su contexto y cómo se relaciona con el perfil profesional del estudiante."}),
          Object.freeze({label:"Objetivos del Proyecto",text:"Especificación de objetivos claros y medibles, tanto generales como específicos, que guiarán el desarrollo de la investigación."})
        ])}),
        Object.freeze({number:2,title:"Formulación de Hipótesis",intro:"La hipótesis es una proposición que el estudiante debe probar o refutar mediante su investigación. Los requisitos de la hipótesis incluyen:",items:Object.freeze([
          Object.freeze({label:"Claridad y Precisión",text:"La hipótesis debe ser clara, específica y basada en el problema de investigación."}),
          Object.freeze({label:"Fundamentación Teórica",text:"Debe apoyarse en la teoría o en hallazgos previos, para asegurar su validez y relevancia."}),
          Object.freeze({label:"Posibilidad de Comprobación",text:"La hipótesis debe ser comprobable a través de los métodos de investigación aplicados en el proyecto."})
        ])}),
        Object.freeze({number:3,title:"Propuesta de Resolución",intro:"La resolución consiste en plantear soluciones prácticas o alternativas al problema investigado. Debe incluir:",items:Object.freeze([
          Object.freeze({label:"Análisis de Resultados",text:"Interpretación de los datos obtenidos en la investigación y cómo estos contribuyen a resolver el problema."}),
          Object.freeze({label:"Conclusiones y Recomendaciones",text:"Propuestas basadas en los hallazgos que puedan ser aplicables en contextos reales dentro de la profesión."}),
          Object.freeze({label:"Impacto y Sostenibilidad",text:"Evaluación de la aplicabilidad y durabilidad de las soluciones propuestas en el tiempo y en diferentes entornos profesionales."})
        ])})
      ]),
      milestonesIntro: "El desarrollo del proyecto de tesis debe cumplir con un cronograma específico de plazos y entregas parciales para asegurar un avance continuo y una revisión adecuada por parte del tutor. Los plazos y entregas clave incluyen:",
      milestones: Object.freeze([
        Object.freeze({number:1,title:"Entrega del Marco Investigativo",deadline:"Al primer mes de iniciado el proyecto de tesis.",text:"El estudiante debe presentar un primer borrador del marco investigativo, que incluye la revisión de literatura y los objetivos del proyecto. El tutor revisará y proporcionará retroalimentación."}),
        Object.freeze({number:2,title:"Entrega de la Hipótesis y Diseño Metodológico",deadline:"Al segundo mes.",text:"El estudiante debe entregar una formulación clara de la hipótesis y el diseño metodológico que seguirá para comprobarla. Esto incluye la descripción de métodos de recolección de datos y técnicas de análisis."}),
        Object.freeze({number:3,title:"Entrega de Resultados y Análisis Preliminar",deadline:"Al tercer mes.",text:"El estudiante debe presentar los resultados iniciales obtenidos y un análisis preliminar que muestre cómo los datos recolectados sustentan la hipótesis planteada."}),
        Object.freeze({number:4,title:"Entrega del Proyecto Final",deadline:"Final del cuarto mes.",text:"El proyecto de tesis completo, incluyendo conclusiones y recomendaciones, debe ser entregado en su totalidad. El tutor revisará el documento final para su aprobación y preparación para la defensa de grado."})
      ]),
      milestonesClosing: "Estos plazos aseguran que el estudiante avance de manera ordenada y cumpla con los estándares de calidad requeridos. Además, los plazos y entregas parciales permiten que el tutor pueda guiar al estudiante, brindar retroalimentación y asegurar la coherencia y calidad del trabajo a lo largo del proceso."
    }),

    grades: Object.freeze({
      notesPerTutor: 2,
      notesPerReader: 2,
      sendingMedium: "correo institucional",
      sendingDeadline: "no mayor a dos semanas después de la entrega final del proyecto de tesis",
      system: "SISACAD",
      intro: "El proceso de envío y registro de notas es una fase crucial que asegura la transparencia y oficialización de las calificaciones obtenidas en el trabajo de titulación. Tanto el tutor como el lector desempeñan un papel fundamental en la asignación de notas, las cuales deben reflejar objetivamente la calidad y profundidad del trabajo del estudiante. Una vez asignadas, las notas se registran en el sistema institucional para que sean oficiales y accesibles a las autoridades correspondientes.",
      sendingSteps: Object.freeze([
        Object.freeze({number:1,title:"Asignación de Notas",paragraphs:Object.freeze(["Tanto el tutor como el lector realizan una revisión detallada del proyecto de tesis y asignan dos notas cada uno, que reflejan la calidad del trabajo en términos de contenido teórico, metodológico, y análisis de resultados. Estas notas también consideran aspectos como la coherencia y la originalidad del trabajo, así como el cumplimiento de los requisitos establecidos."])}),
        Object.freeze({number:2,title:"Envío de Notas",paragraphs:Object.freeze(["Una vez que el tutor y el lector han completado su evaluación, deben enviar las notas al área de coordinación mediante un correo institucional formal. En este proceso, cada docente envía un resumen detallado de sus observaciones, justificaciones de las calificaciones asignadas y cualquier otra recomendación relevante.","Este procedimiento asegura que la asignación de notas sea transparente y quede documentada en los archivos institucionales, brindando una referencia para posibles consultas posteriores."])}),
        Object.freeze({number:3,title:"Plazo para el Envío de Notas",paragraphs:Object.freeze(["Las notas deben ser enviadas en un plazo no mayor a dos semanas después de la entrega final del proyecto de tesis, para garantizar que el proceso de titulación continúe sin demoras."])})
      ]),
      registrationSteps: Object.freeze([
        Object.freeze({number:1,title:"Registro en el Sistema SISACAD",paragraphs:Object.freeze(["Una vez recibidas, las notas asignadas por el tutor y el lector se registran en el sistema institucional SISACAD, asegurando que las calificaciones sean oficiales y accesibles a las autoridades correspondientes. Este registro es gestionado por la coordinación de titulación, quien verifica que todos los documentos y notas estén completos y en orden antes de realizar el ingreso."])}),
        Object.freeze({number:2,title:"Verificación y Confirmación de las Notas",paragraphs:Object.freeze(["Antes de ser ingresadas oficialmente, la coordinación verifica la consistencia de las calificaciones y las observaciones enviadas por el tutor y el lector. Cualquier discrepancia se comunica de inmediato a los evaluadores para que sea aclarada y ajustada de ser necesario."])}),
        Object.freeze({number:3,title:"Acceso de Notas a las Áreas Administrativas y Académicas",paragraphs:Object.freeze(["Una vez registradas, las notas están disponibles para su consulta por las áreas administrativas y académicas relevantes, facilitando la organización y programación de la defensa de grado y la emisión del acta de titulación."])}),
        Object.freeze({number:4,title:"Generación de Reportes de Notas",paragraphs:Object.freeze(["El sistema SISACAD genera reportes de calificaciones que pueden ser utilizados para el seguimiento del proceso de titulación y para garantizar que los estudiantes cumplan con los requisitos necesarios para la obtención de su título profesional."])})
      ])
    }),

    defense: Object.freeze({
      intro: "La defensa de grado es la etapa final en el proceso de titulación, en la cual el estudiante presenta y sustenta su proyecto de tesis ante un tribunal evaluador. Este procedimiento formal permite a los evaluadores valorar la capacidad del estudiante para articular sus ideas, defender sus resultados y demostrar su dominio sobre el tema investigado. La organización de esta defensa implica la asignación de una fecha específica, la composición de un tribunal evaluador y un protocolo detallado para el desarrollo de la evaluación.",
      dateSteps: Object.freeze([
        Object.freeze({number:1,title:"Coordinación de la Fecha",paragraphs:Object.freeze(["La coordinación de titulación es responsable de definir la fecha de la defensa de grado, en función de la disponibilidad de los miembros del tribunal, del estudiante y de la logística institucional. Esta fecha se establece de acuerdo con el calendario académico y se comunica al estudiante con suficiente antelación."])}),
        Object.freeze({number:2,title:"Confirmación y Notificación",paragraphs:Object.freeze(["Una vez asignada, la fecha de la defensa se notifica oficialmente al estudiante, al tutor, al lector y a los miembros del tribunal evaluador. Este aviso incluye detalles sobre el lugar, la hora y los requisitos previos para la defensa."],conflictKeys:Object.freeze(["tutorDefenseParticipation","readerDefenseParticipation"]))}),
        Object.freeze({number:3,title:"Plazos y Requisitos",paragraphs:Object.freeze(["La defensa de grado debe llevarse a cabo en un plazo específico después de la entrega final del proyecto de tesis y el registro de notas en el sistema. La coordinación asegura que todos los documentos y requisitos estén completos y verificados antes de confirmar la fecha de defensa."])})
      ]),
      tribunal: Object.freeze({
        memberCount: 3,
        roles: Object.freeze([
          Object.freeze({label:"Primer Vocal (Coordinador de Titulación)",text:"El coordinador de titulación asume el papel de primer vocal y supervisa la correcta ejecución de la defensa."}),
          Object.freeze({label:"Segundo Vocal (Docente de la Carrera)",text:"Un profesor del área de especialización del estudiante es designado como segundo vocal, aportando su conocimiento específico en el campo de estudio."}),
          Object.freeze({label:"Tercer Vocal (Docente Adicional o Experto en la Materia)",text:"Un tercer miembro, que puede ser otro profesor o un experto externo, completa la composición del tribunal, proporcionando una visión complementaria y enriquecedora al proceso de evaluación."})
        ]),
        selection: "La elección de los miembros del tribunal se realiza con base en su formación y experiencia en el área temática del proyecto de tesis, garantizando así una evaluación justa y objetiva.",
        responsibilities: "Cada miembro del tribunal tiene la responsabilidad de evaluar el desempeño del estudiante durante la defensa, formular preguntas relevantes y asignar una calificación objetiva en función de los criterios de evaluación establecidos."
      }),
      presentationTime: "generalmente entre 15 y 20 minutos",
      evaluationCriteria: Object.freeze([
        Object.freeze({label:"Claridad y Calidad de la Presentación",text:"Evaluación de la estructura, el lenguaje y la organización de la exposición."}),
        Object.freeze({label:"Dominio del Tema y Capacidad de Argumentación",text:"Capacidad del estudiante para explicar y defender sus resultados."}),
        Object.freeze({label:"Relevancia y Coherencia de la Investigación",text:"Adecuación del trabajo presentado respecto a los objetivos planteados y su relevancia en el campo profesional."})
      ]),
      evaluationSteps: Object.freeze([
        Object.freeze({number:1,title:"Presentación del Proyecto por el Estudiante",paragraphs:Object.freeze(["El estudiante inicia la defensa con una presentación estructurada de su proyecto de tesis, en la que expone el contexto, los objetivos, la metodología, los resultados y las conclusiones de su trabajo. La presentación debe ser clara, coherente y ajustarse a un tiempo establecido, generalmente entre 15 y 20 minutos."])}),
        Object.freeze({number:2,title:"Ronda de Preguntas",paragraphs:Object.freeze(["Tras la presentación, cada miembro del tribunal tiene la oportunidad de formular preguntas y solicitar aclaraciones sobre el proyecto. Esta ronda permite evaluar la capacidad del estudiante para defender sus resultados y su comprensión sobre el tema investigado. Las preguntas abordan tanto aspectos teóricos como prácticos, y el estudiante debe responder con precisión y fundamentación."])}),
        Object.freeze({number:3,title:"Evaluación y Asignación de Calificación",paragraphs:Object.freeze(["Una vez concluida la ronda de preguntas, el tribunal procede a deliberar en privado. Los evaluadores asignan una calificación final basada en criterios como:"],criteria:true,closing:"La calificación asignada integra tanto la evaluación del proyecto escrito como el desempeño durante la defensa oral."}),
        Object.freeze({number:4,title:"Comunicación del Resultado",paragraphs:Object.freeze(["Al finalizar la deliberación, el tribunal informa al estudiante del resultado de la evaluación, dándole a conocer su calificación final y proporcionándole, en su caso, recomendaciones para mejorar su trabajo en futuras aplicaciones profesionales o académicas."])})
      ])
    })
  });

  window.DOC_TIT_TRABAJO_PROCESS = processConfig;
})();
