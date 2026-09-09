(() => {
  "use strict";

  const legalParagraphs = Object.freeze([
    "Que el artículo 26 de la Constitución de la República del Ecuador establece que la educación es un derecho de las personas y un deber del Estado, con énfasis en garantizar igualdad, inclusión y calidad en todos los niveles de formación.",
    "Que el artículo 344 de la Constitución de la República del Ecuador establece que “El Estado garantizará la educación como un derecho fundamental, promoviendo el perfeccionamiento continuo en todos los niveles y modalidades educativas, con el fin de asegurar una educación de calidad y fomentar el desarrollo humano integral”.",
    "Que el artículo 350 de la Constitución de la República del Ecuador establece que el sistema de educación superior tiene como finalidad la formación académica y profesional con visión científica y humanista; la investigación científica y tecnológica; la innovación, promoción, desarrollo y difusión de los saberes y las culturas; y la construcción de soluciones para los problemas del país en relación con los objetivos del régimen de desarrollo.",
    "Que el artículo 5 de la Ley Orgánica de Educación Superior (LOES) establece como derechos de los estudiantes “acceder, movilizarse, permanecer, egresar y titularse sin discriminación conforme a sus méritos académicos”.",
    "Que el artículo 118 de la LOES clasifica los niveles de formación académica, incluyendo los títulos técnicos y tecnológicos superiores que otorgan los institutos de educación superior.",
    "Que el artículo 130 de la LOES establece que el Consejo de Educación Superior armonizará la nomenclatura de títulos profesionales y grados académicos para facilitar la movilidad y articulación en la educación superior.",
    "Que el artículo 1 del Reglamento General a la LOES establece la estructura administrativa para la gestión educativa en educación superior, incluyendo la rectoría y coordinación de programas y procesos académicos.",
    "Que el artículo 5 del Reglamento General a la LOES define el seguimiento de estudiantes de educación superior y su reporte a la SENESCYT como parte del Sistema Nacional de Información.",
    "Que el artículo 279 de la Constitución de la República del Ecuador establece la planificación como un deber del Estado, el cual debe priorizar la educación superior en el desarrollo social, territorial y económico del país.",
    "Que el artículo 1 del Reglamento de Armonización de Nomenclatura de Títulos Profesionales y Grados Académicos establece las normas para armonizar la nomenclatura de los títulos profesionales y grados académicos, promoviendo la movilidad académica y profesional.",
    "Que el artículo 5 del Reglamento de Armonización de Nomenclatura de Títulos Profesionales y Grados Académicos define las categorías de formación técnica y tecnológica superior en los institutos de educación superior.",
    "Que el artículo 3 del Reglamento del Área de Titulación del ITSQMET especifica que el proceso de titulación tiene como finalidad la validación de competencias adquiridas en la formación profesional, basadas en el perfil de egreso de cada carrera, para la resolución de problemas en contextos laborales o el desarrollo de emprendimientos de innovación.",
    "Que el artículo 4 del Reglamento del Área de Titulación del ITSQMET define las alternativas de titulación que ofrece la Unidad de Titulación para validar los conocimientos y habilidades adquiridos en cada carrera.",
    "Que el Plan Nacional de Desarrollo 2021-2025 promueve una educación de calidad, el acceso universal y la equidad en el sistema educativo, orientado a generar oportunidades de desarrollo profesional para los estudiantes y contribuir al progreso del país."
  ]);

  const methodology = Object.freeze({
    id: "METODOLOGIA_TRABAJO_TITULACION_VIGENTE",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,
    process: Object.freeze({
      name: "Trabajo de Titulación",
      code: "UTET-PRO-96",
      projectDuration: "dos meses"
    }),
    processParagraphs: Object.freeze([
      "El proceso de trabajo de titulación, establecido en el documento UTET-PRO-96, está diseñado para guiar a los estudiantes en la culminación de sus estudios de manera estructurada y eficiente. Este proceso involucra una serie de actividades coordinadas que aseguran que el trabajo de titulación cumpla con los estándares académicos de calidad, alineados con el perfil de egreso y las competencias requeridas de cada carrera.",
      "Las etapas del proceso están orientadas a proporcionar un acompañamiento constante al estudiante, desde la elección de su tema de investigación hasta la defensa de su proyecto de tesis. La Unidad de Titulación y Eficiencia Terminal (UTET) supervisa y gestiona este proceso, garantizando que cada paso se realice conforme a las políticas institucionales y que se mantenga la rigurosidad académica en el trabajo final presentado."
    ]),
    phasesIntro: "El trabajo de titulación se desarrolla en fases estructuradas que aseguran un flujo continuo y una evaluación progresiva del avance del estudiante. A continuación, se detallan las fases clave:",
    phases: Object.freeze([
      Object.freeze({
        number: "3.2.1.",
        title: "Asignación de Tutor y Lector",
        paragraphs: Object.freeze([
          "Una vez que el estudiante ha cumplido con los prerrequisitos para iniciar el trabajo de titulación, el coordinador de titulación asigna un tutor y un lector para el proyecto de tesis. La función del tutor es guiar al estudiante en la construcción de su proyecto, supervisando cada avance y asegurándose de que el trabajo cumpla con los estándares académicos. El lector, por su parte, actúa como un segundo evaluador, revisando el trabajo desde una perspectiva complementaria para garantizar la calidad y profundidad del análisis.",
          "La asignación del tutor y el lector considera la especialización y experiencia de los docentes, alineándolos con el tema y los objetivos de la investigación del estudiante. Se establece un plazo de dos meses para la culminación del proyecto bajo la guía del tutor."
        ])
      }),
      Object.freeze({
        number: "3.2.2.",
        title: "Desarrollo del Proyecto de Tesis",
        paragraphs: Object.freeze([
          "En esta fase, el estudiante se enfoca en la elaboración del proyecto de tesis, trabajando en conjunto con su tutor. El proyecto debe incluir un marco investigativo sólido, formulación de hipótesis y desarrollo de la metodología correspondiente para resolver el problema planteado.",
          "El desarrollo del proyecto se estructura en varios componentes:"
        ]),
        bullets: Object.freeze([
          "Marco Teórico: Revisión de la literatura relevante y contextualización del problema.",
          "Formulación de Hipótesis: Establecimiento de proposiciones a probar mediante la investigación.",
          "Metodología: Definición de métodos y técnicas de investigación aplicables.",
          "Análisis y Resultados: Evaluación de los datos recopilados y su interpretación en relación con la hipótesis planteada."
        ]),
        closingParagraph: "El estudiante deberá presentar avances regulares al tutor para recibir retroalimentación oportuna y asegurar la coherencia del trabajo."
      }),
      Object.freeze({
        number: "3.2.3.",
        title: "Revisión y Envío de Notas",
        paragraphs: Object.freeze([
          "Una vez el proyecto de tesis ha sido completado, tanto el tutor como el lector realizan una revisión exhaustiva del documento, evaluando la calidad del trabajo en cuanto a su contenido teórico, metodológico y analítico. Cada uno asigna dos notas que reflejan la comprensión y la capacidad del estudiante para resolver problemas en su campo de estudio.",
          "Estas notas son enviadas por correo y registradas en el sistema institucional, garantizando transparencia en el proceso de calificación. Ni el tutor ni el lector estarán presentes en la defensa de grado del estudiante, lo cual permite que el tribunal evaluador pueda realizar una revisión imparcial del trabajo presentado."
        ])
      }),
      Object.freeze({
        number: "3.2.4.",
        title: "Evaluación Final",
        paragraphs: Object.freeze([
          "La evaluación final se basa tanto en el trabajo de tesis como en la presentación oral realizada en la defensa de grado. El tribunal califica el trabajo en función de su calidad académica, coherencia, originalidad, y aplicación de los conocimientos adquiridos durante la carrera.",
          "Una vez finalizada la defensa, el tribunal asigna una calificación definitiva que integra tanto las notas del tutor y lector como el desempeño en la defensa. Esta nota final es registrada en el sistema institucional y determina la culminación exitosa del proceso de titulación del estudiante, permitiéndole obtener su título profesional."
        ])
      })
    ])
  });

  window.DOC_TIT_TRABAJO_CONTENT = Object.freeze({
    introduction: Object.freeze({
      referenceDocuments: Object.freeze([
        "Reglamento de Titulación del ITSQMET.",
        "Instructivo para el Proceso de Titulación.",
        "Formatos oficiales de evaluación y seguimiento.",
        "Cronograma institucional aprobado para el período académico vigente."
      ]),
      bibliography: Object.freeze([
        "Montes, P. (2019). Fundamentos de la educación superior: Teoría y práctica en el siglo XXI.",
        "Calderón, M. & Díaz, P. (2017). El proceso de titulación en la educación superior y su impacto en la formación profesional.",
        "Castillo, R. & Gómez, M. (2018). Educación superior en Ecuador: Retos y perspectivas.",
        "Torres, A. (2020). Eficiencia y calidad en la educación superior: Desafíos para las instituciones en Latinoamérica.",
        "Escobar, C. & Vásquez, J. (2016). Eficiencia terminal en la educación superior: Un análisis de su impacto en la sostenibilidad institucional.",
        "González, J. (2019). Calidad educativa y titulación en instituciones técnicas y tecnológicas."
      ])
    }),
    legalBase: Object.freeze({
      id: "BASE_LEGAL_TRABAJO_TITULACION_VIGENTE",
      technicalVersion: "A",
      status: "Vigente",
      effectiveFrom: null,
      paragraphs: legalParagraphs
    }),
    methodology
  });
})();
