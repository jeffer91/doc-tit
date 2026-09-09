(() => {
  "use strict";

  const requirements = Object.freeze({
    id: "REQUISITOS_TITULACION_VIGENTES",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,
    regulationKey: "REGLAMENTO_TITULACION_VIGENTE",
    intro: "Los siguientes requisitos están establecidos conforme al Reglamento del Proceso de Titulación del ITSQMET y deben ser cumplidos en su totalidad para acceder al proceso.",

    academic: Object.freeze({
      intro: "Para cumplir con el proceso de titulación, el estudiante debe satisfacer una serie de requisitos académicos, que validan la culminación de su plan de estudios. Estos requisitos incluyen la aprobación de la malla curricular completa, junto con la realización de materias específicas de carácter transversal y autónomo.",
      curriculum: "El estudiante debe haber aprobado todas las asignaturas establecidas en la malla curricular de su carrera. Esto garantiza que ha adquirido tanto los conocimientos teóricos como prácticos necesarios en su especialidad, cubriendo todas las competencias que el programa requiere.",
      transversal: Object.freeze({
        intro: "Las materias transversales son asignaturas diseñadas para aportar una base común de competencias aplicables en diversas áreas profesionales. Las características de estas materias incluyen:",
        items: Object.freeze([
          Object.freeze({label:"Duración y Modalidad",text:"Las materias transversales se imparten durante todo el semestre y cuentan con clases virtuales regulares, generalmente una vez a la semana."}),
          Object.freeze({label:"Docente Asignado",text:"Cada materia transversal cuenta con un docente responsable que dirige las sesiones y proporciona el contenido y recursos necesarios."}),
          Object.freeze({label:"Relevancia Académica",text:"Estas materias, como Metodología de la Investigación, son asignaturas esenciales que complementan el perfil profesional del estudiante y pueden variar en función de la carrera."})
        ])
      }),
      autonomous: Object.freeze({
        intro: "Las materias autónomas son asignaturas con un enfoque independiente y sin clases presenciales o virtuales regulares. Las principales características de estas materias son:",
        items: Object.freeze([
          Object.freeze({label:"Asignación de Docente Evaluador",text:"Aunque no se imparten clases, se asigna un docente responsable de evaluar las tareas y proyectos del estudiante."}),
          Object.freeze({label:"Duración y Modalidad",text:"Al igual que las materias transversales, las materias autónomas se desarrollan durante todo el semestre."}),
          Object.freeze({label:"Evaluación Independiente",text:"Los estudiantes trabajan de manera autónoma, y las tareas y proyectos tienen fechas límite específicas. El docente asignado gestiona las evaluaciones y da seguimiento a las tareas atrasadas."}),
          Object.freeze({label:"Comunicación y Gestión",text:"Para resolver dudas y gestionar la entrega de trabajos, se utiliza un enlace de Telegram en el que se centraliza la comunicación entre estudiantes y docentes."}),
          Object.freeze({label:"Asignatura General para Todas las Carreras",text:"Las materias autónomas suelen ser de carácter general o de relleno y son comunes para todos los estudiantes, aunque la temática puede variar según la carrera."})
        ])
      })
    }),

    documentation: Object.freeze({
      intro: "Para formalizar el proceso de titulación, el estudiante debe presentar un expediente completo que incluye documentos esenciales y registros académicos específicos. Los requisitos varían según la modalidad del programa, agrupándose en dos categorías: Modalidades Híbrida, Presencial y Online",
      modalityTitle: "4.3. Modalidades Híbrida, Presencial y Online",
      modalityIntro: "Para estudiantes de las modalidades Híbrida, Presencial y Online, el expediente de titulación debe incluir los siguientes documentos:",
      groups: Object.freeze([
        Object.freeze({
          title: "1. Documentación Básica",
          items: Object.freeze([
            Object.freeze({label:"Certificado de Consulta de Títulos de Bachiller",text:"Documento emitido por el Ministerio de Educación en copia notarizada."}),
            Object.freeze({label:"Título de Bachiller",text:"También en copia notarizada."}),
            Object.freeze({label:"Acta de Grado",text:"En copia notarizada, que certifica la finalización de los estudios secundarios."}),
            Object.freeze({label:"Cuatro Fotos Tamaño Carnet",text:"Fotografías recientes del estudiante."}),
            Object.freeze({label:"Copia de Cédula y Papeleta de Votación",text:"Dos copias a color, con cédula vigente y papeleta de votación actualizada."})
          ])
        }),
        Object.freeze({
          title: "2. Documentos Generados en SISACAD",
          items: Object.freeze([
            Object.freeze({label:"Solicitud de Titulación",text:"Firmada e impresa desde el sistema SISACAD como constancia de la solicitud formal."}),
            Object.freeze({label:"Seguimiento a Graduados",text:"Completar en línea en la opción \"Graduados\" en SISACAD (sin necesidad de imprimir)."}),
            Object.freeze({label:"Actualización de Datos",text:"Documento actualizado, firmado e impreso desde SISACAD."}),
            Object.freeze({label:"Test de Aptitudes Diferenciales",text:"Impreso desde SISACAD como parte del expediente de titulación."}),
            Object.freeze({label:"Historial de Matrículas",text:"Registro académico generado en SISACAD."}),
            Object.freeze({label:"Culminación del Periodo de Inglés",text:"Certificado que confirma el cumplimiento del requisito de idioma, sin costo adicional."})
          ])
        }),
        Object.freeze({
          title: "3. Presentación del Expediente",
          items: Object.freeze([
            Object.freeze({label:"Presentación física",text:"La documentación debe presentarse en una carpeta plástica de color específico asignado a cada carrera, con vinchas para perforado que aseguren el orden de los documentos."}),
            Object.freeze({label:"Estudiantes de Provincia",text:"Pueden enviar la carpeta mediante un servicio de mensajería a la Secretaría Académica en la sede La Tola, indicando la atención a la persona responsable designada en las instrucciones oficiales."})
          ])
        })
      ]),
      unidentifiedContinuation: Object.freeze([
        Object.freeze({
          title: "1. Documentos Generados en SISACAD",
          items: Object.freeze([
            Object.freeze({label:"Solicitud de Titulación",text:"Completar y firmar la solicitud de titulación en el sistema SISACAD."}),
            Object.freeze({label:"Seguimiento a Graduados",text:"Seleccionar la opción \"Egresado\" y completar el formulario en línea dentro de SISACAD."}),
            Object.freeze({label:"Actualización de Datos",text:"Documento de actualización de información personal, que debe firmarse e imprimirse."}),
            Object.freeze({label:"Test de Aptitudes Diferenciales y Historial de Matrículas",text:"Ambos documentos deben generarse en SISACAD como parte del expediente de titulación."}),
            Object.freeze({label:"Culminación del Periodo de Inglés",text:"Certificado que demuestra el cumplimiento del requisito de idioma (sin costo adicional)."})
          ])
        }),
        Object.freeze({
          title: "2. Presentación del Expediente",
          items: Object.freeze([
            Object.freeze({label:"Presentación física",text:"Los documentos deben ser organizados en una carpeta plástica con tapa transparente y de color específico asignado a cada carrera, entregada en la Secretaría Académica en el horario estipulado para recepción de expedientes."})
          ])
        })
      ])
    }),

    financial: Object.freeze({
      regularizationWorkingDays: 5,
      intro: "La regularización financiera es un requisito indispensable para que el estudiante pueda acceder y completar el proceso de titulación. El ITSQMET establece un cronograma de pagos, políticas de descuento, y obligaciones adicionales para asegurar la continuidad y formalización del proceso. Los estudiantes deben cumplir con cada aspecto de estos requisitos en los plazos definidos.",
      generalIntro: "Para garantizar la formalización y continuidad en el proceso de titulación, el estudiante debe cumplir con los siguientes compromisos financieros:",
      items: Object.freeze([
        Object.freeze({label:"Regularización de pagos institucionales",text:"El estudiante debe haber cancelado la matrícula, colegiaturas y cualquier otro compromiso financiero con la institución previo a la entrega del trabajo de titulación."}),
        Object.freeze({label:"Acceso al aula de titulación",text:"La habilitación del aula de titulación se realizará únicamente para estudiantes que hayan cumplido con los requisitos financieros establecidos."}),
        Object.freeze({label:"Plazo máximo de regularización",text:"El cumplimiento de todos los compromisos financieros debe realizarse hasta cinco (5) días laborables antes de la fecha de entrega del trabajo de titulación."}),
        Object.freeze({label:"Condición de habilitación",text:"Solo los estudiantes que hayan cumplido con estos requisitos serán considerados habilitados para continuar con el proceso de titulación."}),
        Object.freeze({label:"Consecuencias del incumplimiento",text:"El incumplimiento de estos requisitos impedirá la participación en las etapas posteriores del proceso de titulación."})
      ])
    }),

    communityEngagement: Object.freeze({
      hoursMin: 80,
      hoursMax: 120,
      intro: "La Vinculación con la Sociedad es un componente clave en el proceso formativo de los estudiantes. A través de proyectos diseñados para aportar al desarrollo social, los estudiantes aplican sus conocimientos en contextos reales, contribuyendo activamente a su comunidad. Este requisito es obligatorio para obtener la titulación y representa el compromiso de la institución de educación superior de contribuir al bien social.",
      importance: "La vinculación permite que los estudiantes desarrollen una sensibilidad y compromiso con las problemáticas sociales, participando en proyectos que generen beneficios concretos a diferentes sectores de la comunidad, como educación, tecnología, salud y cultura. Estas actividades no solo fortalecen su preparación profesional, sino que también fomentan el desarrollo social, integrando a la institución y sus estudiantes como agentes activos en la mejora de la sociedad.",
      requirementsIntro: "Para cumplir con este componente, el estudiante debe seguir una serie de requisitos:",
      requirements: Object.freeze([
        Object.freeze({label:"Participación en Proyectos de Vinculación",text:"Los estudiantes deben integrarse en proyectos registrados en la institución y alineados con los objetivos de su carrera. Estos proyectos, organizados y supervisados por las coordinaciones de cada carrera, deben estar formalmente documentados en los sistemas institucionales para garantizar su autenticidad y relevancia."}),
        Object.freeze({label:"Duración y Horas de Vinculación",text:"Según la normativa institucional, los estudiantes deben completar entre 80 y 120 horas de vinculación. Estas horas deben repartirse en uno o varios semestres, conforme a la duración y objetivos del proyecto, asegurando un impacto significativo en la comunidad."}),
        Object.freeze({label:"Documentación del Proyecto de Vinculación",text:"Una vez culminado el proyecto, el estudiante debe presentar un informe detallado que incluya la descripción del proyecto, los objetivos logrados, la metodología utilizada, los resultados alcanzados y el impacto generado. Esta documentación es esencial para reflejar el compromiso y responsabilidad del estudiante con el proyecto."}),
        Object.freeze({label:"Evaluación del Proyecto",text:"La evaluación del proyecto de vinculación es realizada por el docente o coordinador asignado, quien revisa que se hayan cumplido los objetivos del proyecto y que el estudiante haya demostrado las competencias necesarias. La evaluación toma en cuenta la calidad del informe, la metodología utilizada y el impacto social del proyecto."})
      ]),
      examplesIntro: "Cada carrera cuenta con proyectos de vinculación específicos que se alinean con el perfil profesional del estudiante. Algunos ejemplos incluyen:",
      examples: Object.freeze([
        Object.freeze({career:"Educación Inicial",text:"Apoyo pedagógico en escuelas comunitarias y programas de formación infantil."}),
        Object.freeze({career:"Desarrollo de Software",text:"Implementación de herramientas tecnológicas en pequeñas empresas o instituciones educativas locales."}),
        Object.freeze({career:"Marketing Digital y Comercio Electrónico",text:"Asesoría a emprendimientos locales para el desarrollo de estrategias de marketing digital efectivas."}),
        Object.freeze({career:"Gestión de Talento Humano",text:"Diseño e implementación de programas de capacitación en organizaciones comunitarias para mejorar habilidades laborales."})
      ])
    }),

    internships: Object.freeze({
      hoursMin: 240,
      hoursMax: 400,
      hoursByCareer: Object.freeze({}),
      intro: "Las Prácticas Preprofesionales son una experiencia esencial en la formación profesional, permitiendo a los estudiantes aplicar sus conocimientos en un ambiente laboral y adquirir las competencias prácticas necesarias para su desempeño futuro. Este componente es obligatorio para acceder a la titulación y refuerza la preparación profesional del egresado al permitirle vivir la experiencia del entorno laboral.",
      importance: "El principal objetivo de las prácticas preprofesionales es que los estudiantes apliquen de manera práctica los conocimientos adquiridos durante su formación académica, enfrentándose a situaciones reales en el ámbito laboral. Esto les permite fortalecer competencias como la resolución de problemas, trabajo en equipo, adaptabilidad y el manejo de herramientas y procedimientos específicos en su especialidad, brindando una base sólida para su futura inserción en el mercado laboral.",
      requirementsIntro: "Para iniciar y completar las prácticas preprofesionales, los estudiantes deben cumplir con los siguientes requisitos:",
      requirements: Object.freeze([
        Object.freeze({label:"Inscripción y Documentación Inicial",text:"Los estudiantes deben registrarse en el sistema académico SISACAD, donde cargarán toda la documentación requerida para iniciar sus prácticas. Esto incluye copia de la cédula de identidad y, si aplica, un certificado laboral para homologación."}),
        Object.freeze({label:"Plan de Aprendizaje",text:"En conjunto con el tutor académico, el estudiante debe definir un plan de aprendizaje que contemple los objetivos, competencias y actividades a desarrollar durante las prácticas. Este plan debe estar alineado con el perfil de la carrera y ser registrado en SISACAD para que el tutor realice un seguimiento continuo."}),
        Object.freeze({label:"Cumplimiento de Horas de Prácticas",text:"Dependiendo de la carrera, se establece un mínimo de 240 a 400 horas de prácticas preprofesionales. Durante este tiempo, el estudiante deberá registrar su asistencia y actividades mediante reportes semanales, con evidencia fotográfica y reportes de actividades subidos en SISACAD."}),
        Object.freeze({label:"Supervisión y Seguimiento del Tutor Académico",text:"El tutor académico hace un seguimiento continuo del rendimiento del estudiante en aspectos como puntualidad, responsabilidad y aplicación de conocimientos, proporcionando retroalimentación y asegurando que el estudiante alcance los objetivos planteados en el plan de aprendizaje."}),
        Object.freeze({label:"Capacitación en Seguridad y Riesgos Laborales",text:"Antes de iniciar las prácticas, los estudiantes deben completar una capacitación en seguridad y riesgos laborales, la cual puede estar disponible en formato MOOC (curso abierto en línea), para prepararlos en temas de prevención de riesgos y seguridad en el lugar de trabajo."})
      ]),
      completionIntro: "Al culminar sus prácticas, el estudiante debe presentar la siguiente documentación:",
      completionDocuments: Object.freeze([
        Object.freeze({label:"Informe Técnico Final",text:"Este documento describe las actividades realizadas, los logros alcanzados y las competencias desarrolladas. Debe ser validado por el tutor académico y reflejar cómo el estudiante aplicó sus conocimientos en el entorno laboral."}),
        Object.freeze({label:"Evaluación de la Entidad Formadora",text:"La empresa o institución donde el estudiante realizó las prácticas emite una evaluación de su desempeño, resaltando aspectos como puntualidad, responsabilidad, adaptación y habilidades técnicas."}),
        Object.freeze({label:"Certificado de Culminación de Prácticas",text:"Luego de que el informe y la evaluación han sido aprobados por la coordinación de prácticas, se emite un certificado que acredita la culminación satisfactoria de las prácticas preprofesionales. Este certificado es obligatorio para proceder con la titulación."})
      ])
    }),

    foreignLanguage: Object.freeze({
      requiredLevel: "A2",
      referenceFramework: "MCER",
      language: "Inglés",
      exemptionAllowed: true,
      intro: Object.freeze([
        "El dominio básico de una lengua extranjera, específicamente hasta el nivel A2 en el Marco Común Europeo de Referencia para las Lenguas (MCER), es un requisito obligatorio para el proceso de titulación en el Instituto Superior Tecnológico Quito Metropolitano (ITSQMET).",
        "Este requisito se orienta a que el estudiante logre una competencia básica de comprensión y comunicación en el idioma, con el objetivo de fortalecer su perfil académico y profesional."
      ]),
      objective: "Desarrollar en el estudiante la habilidad de comprender y expresarse en situaciones cotidianas y temas básicos en una lengua extranjera, con el fin de promover la capacidad de interactuar en contextos internacionales y de acceder a información relevante en su ámbito profesional.",
      complianceIntro: "Para cumplir con este requisito, los estudiantes deben:",
      compliance: Object.freeze([
        Object.freeze({title:"1. Aprobar el Nivel A2 en Inglés",items:Object.freeze([
          "Los estudiantes deben alcanzar y aprobar el nivel A2 en inglés, que comprende competencias básicas de comprensión lectora, expresión oral y escrita, y habilidades de escucha en contextos simples y cotidianos.",
          "Las actividades formativas de este nivel incluyen temas básicos de conversación, comprensión de frases y vocabulario frecuente, especialmente en áreas relevantes para la carrera del estudiante."
        ])}),
        Object.freeze({title:"2. Certificado de Competencia en Inglés (Nivel A2)",items:Object.freeze([
          "Al finalizar los módulos requeridos para alcanzar el nivel A2, el estudiante debe obtener un certificado de competencia en inglés que confirme el cumplimiento de este requisito.",
          "Este certificado, expedido por la institución o una entidad acreditada, se incorpora en el expediente de titulación del estudiante y es un requisito esencial para la titulación."
        ])}),
        Object.freeze({title:"3. Pruebas de Exoneración (opcional)",items:Object.freeze([
          "Para los estudiantes que ya posean el nivel A2 o superior en inglés, se ofrece la opción de rendir una prueba de exoneración. Esta prueba, de aprobarse, exime al estudiante de cursar los módulos de idioma, validando su nivel de competencia.",
          "La prueba evalúa habilidades clave en comprensión lectora y auditiva, así como en expresión básica."
        ])})
      ]),
      certificateProcedure: Object.freeze([
        Object.freeze({title:"1. Obtención del Certificado",items:Object.freeze([
          "Los estudiantes que completen exitosamente el nivel A2 de inglés en la institución recibirán su certificado sin costo adicional, siempre que hayan aprobado todas las evaluaciones y tareas del curso."
        ])}),
        Object.freeze({title:"2. Registro del Certificado en el Expediente Académico",items:Object.freeze([
          "El certificado de nivel A2 debe ser registrado en el sistema académico SISACAD y presentarse en la Secretaría Académica como parte del expediente de titulación, garantizando así la verificación del cumplimiento de este requisito lingüístico."
        ])})
      ])
    }),

    dataUpdate: Object.freeze({
      academicSystem: "SISACAD",
      intro: "La actualización de datos personales y académicos es un requisito obligatorio dentro del proceso de titulación en el Instituto Superior Tecnológico Quito Metropolitano (ITSQMET). Este proceso asegura que la información del estudiante esté correcta y actualizada en los registros institucionales, facilitando la comunicación, gestión académica y emisión de documentación oficial durante el proceso de titulación.",
      objective: "Mantener la información personal y académica del estudiante actualizada y precisa en el sistema institucional, lo cual es fundamental para la gestión administrativa, la emisión de certificados, y el contacto oportuno durante las etapas finales del proceso de titulación.",
      procedureIntro: "Para cumplir con este requisito, los estudiantes deben seguir los pasos establecidos por la institución:",
      procedure: Object.freeze([
        Object.freeze({title:"1. Ingreso al Sistema SISACAD",items:Object.freeze([
          "El estudiante debe ingresar a la plataforma SISACAD y acceder a la sección de \"Actualización de Datos\", donde encontrará el formulario correspondiente."
        ])}),
        Object.freeze({title:"2. Verificación y Modificación de Información Personal",items:Object.freeze([
          Object.freeze({label:"Datos Personales",text:"Verificar y, si es necesario, actualizar información básica, incluyendo nombre completo, número de cédula, dirección, correo electrónico y número de contacto."}),
          Object.freeze({label:"Información Académica",text:"Confirmar que la información académica, como la carrera, modalidad y fecha de ingreso, esté correctamente registrada."})
        ])}),
        Object.freeze({title:"3. Confirmación de Datos de Contacto",items:Object.freeze([
          "Es fundamental que los datos de contacto estén actualizados, especialmente el número de teléfono y correo electrónico, ya que estos medios son utilizados para notificaciones importantes sobre el proceso de titulación y otras gestiones administrativas."
        ])}),
        Object.freeze({title:"4. Firma y Presentación de Actualización de Datos",items:Object.freeze([
          "Una vez revisada y actualizada toda la información, el estudiante debe imprimir el formulario de actualización de datos, firmarlo y presentarlo en la Secretaría Académica como parte de su expediente de titulación."
        ])})
      ]),
      importanceIntro: "La actualización de datos es esencial para:",
      importance: Object.freeze([
        Object.freeze({label:"Garantizar la Precisión en la Emisión de Documentación Oficial",text:"Toda la documentación, incluyendo certificados y el título, se emite con base en la información registrada en el sistema, por lo que cualquier error puede generar inconvenientes."}),
        Object.freeze({label:"Asegurar una Comunicación Eficiente",text:"La institución se comunica con los estudiantes a través de los medios proporcionados en el sistema, especialmente para informar sobre fechas, requisitos y otros aspectos críticos del proceso de titulación."}),
        Object.freeze({label:"Facilitar la Gestión Administrativa",text:"Un expediente actualizado permite a las áreas administrativas procesar de manera ágil las solicitudes y la documentación de cada estudiante en su camino hacia la titulación."})
      ])
    })
  });

  window.DOC_TIT_TRABAJO_REQUIREMENTS = requirements;
})();
