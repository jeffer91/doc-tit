(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.methodology = {
    render(api) {
      const {ctx,heading,paragraph,bullet,insertSectionImage,policy} = api;

      function phase(title,objective,activities,responsible,evidence,output){
        heading(title,2,true);
        paragraph("Objetivo: "+objective,{indent:false,bold:true,after:6});
        paragraph("Actividades y procedimiento: "+activities);
        paragraph("Responsable principal: "+responsible);
        paragraph("Evidencia y seguimiento: "+evidence);
        paragraph("Resultado esperado: "+output);
      }

      heading("3. Metodología",1,true);
      paragraph(
        "La metodología organiza el examen complexivo como un proceso secuencial, individual, teórico-práctico y basado en competencias. Cada fase se vincula con un objetivo, actividades, responsables, entradas, productos y evidencias, de forma que el desarrollo pueda ser supervisado y auditado.",
        {indent:false}
      );
      insertSectionImage("methodologyImage");

      heading("3.1. Enfoque Metodológico",2,true);
      paragraph("El enfoque integra verificación de requisitos, preparación académica, diseño de instrumentos, organización logística, aplicación, evaluación y mejora continua. La evaluación es individual y debe evidenciar tanto dominio conceptual como capacidad de aplicación.");
      paragraph("Las entradas principales son los registros académicos del estudiante, el perfil de egreso, la planificación del período, la distribución de estudiantes y los requerimientos de cada carrera. Los productos son instrumentos aprobados, estudiantes habilitados, evidencias de aplicación, calificaciones registradas e informe de cierre.");

      phase(
        "3.2. Fase de Inducción al Proceso",
        "Asegurar que estudiantes y responsables conozcan oportunamente reglas, fechas, requisitos, modalidad, estructura del examen y canales de atención.",
        "Socializar el cronograma; explicar requisitos de habilitación; presentar la estructura teórica y práctica; comunicar reglas de integridad, identificación y uso de recursos; informar la modalidad presencial como regla general y el procedimiento para excepciones autorizadas; resolver dudas y registrar acuerdos.",
        "Coordinación de Titulación y Coordinaciones de Carrera.",
        "Convocatoria, material de socialización, registro de asistencia o participación, preguntas frecuentes y comunicaciones emitidas.",
        "Participantes informados y criterios operativos comprendidos antes del inicio de las fases críticas."
      );

      phase(
        "3.3. Fase de Diseño del Examen Complexivo",
        "Construir instrumentos alineados con el perfil de egreso y con las competencias prioritarias de cada carrera.",
        "Revisar perfil de egreso y resultados de aprendizaje; seleccionar competencias; elaborar banco o conjunto de preguntas; diseñar casos, ejercicios, simulaciones o productos prácticos; revisar pertinencia, dificultad y tiempo; validar académicamente; aprobar versión final; controlar acceso y confidencialidad.",
        "Coordinaciones de Carrera y docentes designados, con articulación de Titulación.",
        "Matriz de competencias, instrumento teórico, instrumento práctico, revisión académica, aprobación y control de versión.",
        "Instrumentos consistentes, aplicables, identificables por versión y listos para su ejecución."
      );

      phase(
        "3.4. Fase de Organización y Distribución",
        "Asignar estudiantes, espacios, horarios y recursos sin superar la capacidad operativa disponible.",
        "Consolidar estudiantes por carrera y lugar; revisar requerimientos de equipos, software y conectividad; definir jornadas; prever accesibilidad; designar responsables y soporte; preparar respaldos de equipos y evidencias.",
        "Coordinación de Titulación, Coordinaciones de Carrera y unidades de apoyo.",
        "Distribución vigente, cronograma operativo, asignación de espacios, checklist técnico y registro de responsables.",
        "Jornadas organizadas con capacidad suficiente y condiciones equivalentes para los participantes."
      );

      phase(
        "3.5. Fase de Preparación: Núcleos de Titulación",
        "Reforzar competencias esenciales y familiarizar al estudiante con la lógica de resolución que encontrará en el examen.",
        "Desarrollar cuatro núcleos; articular contenidos con Integración Curricular o Titulación; utilizar actividades teórico-prácticas; mantener recursos de apoyo y grabaciones cuando corresponda; registrar seguimiento y novedades.",
        "Docentes designados y Coordinaciones de Carrera.",
        "Plan de cada núcleo, recursos, registros de participación, grabaciones disponibles y reporte de seguimiento.",
        "Estudiantes con preparación estructurada y evidencias de acompañamiento previo al examen."
      );

      phase(
        "3.6. Fase de Aplicación del Examen Complexivo",
        "Ejecutar el examen bajo condiciones controladas, individualizadas y trazables.",
        "Verificar identidad; registrar ingreso; asignar equipo y espacio; comprobar funcionamiento; comunicar tiempo y reglas; iniciar componentes; supervisar; atender incidencias; respaldar respuestas o productos; registrar entrega y cierre.",
        "Coordinación de Titulación, Coordinaciones de Carrera, docentes responsables y soporte.",
        "Registro de asistencia, control de identidad, bitácora de jornada, evidencias de entrega, incidencias y respaldos.",
        "Aplicación concluida con evidencia suficiente para sustentar el resultado de cada estudiante."
      );

      phase(
        "3.7. Fase de Evaluación y Retroalimentación",
        "Calificar, validar, registrar y comunicar resultados conforme a una sola regla institucional.",
        "Aplicar criterios de calificación; consolidar teoría y práctica; verificar consistencia; registrar notas; publicar resultados por los canales institucionales; gestionar revisiones y, cuando corresponda, la instancia de supletorio.",
        "Docentes evaluadores, Coordinaciones de Carrera y unidades responsables de registro.",
        "Rúbricas o criterios aplicados, calificaciones, actas o registros, comunicaciones y evidencias de revisión.",
        "Resultados consistentes, verificables y registrados dentro de los plazos establecidos."
      );

      phase(
        "3.8. Coordinación y Mejora Continua",
        "Convertir incidencias y resultados del período en acciones concretas para mejorar la siguiente ejecución.",
        "Consolidar novedades; analizar cumplimiento del cronograma; revisar problemas de instrumentos, logística, soporte y comunicación; identificar lecciones aprendidas; definir responsables y plazos de mejora.",
        "Coordinación de Titulación y Coordinación General de Carreras.",
        "Informe de cierre, registro de incidencias, lecciones aprendidas y plan de acciones de mejora.",
        "Proceso documentado y con acciones verificables para el siguiente período."
      );

      ns.parts.methodology.responsibilities(api);
      ns.parts.methodology.schedule(api);
    }
  };
})();
