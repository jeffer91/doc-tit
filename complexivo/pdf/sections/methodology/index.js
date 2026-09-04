(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.methodology = {
    render(api) {
      const {heading,paragraph,insertSectionImage} = api;
      const a=ns.config?.areas||{};

      function phase(title,objective,activities,responsible,evidence,output){
        heading(title,2,true);
        paragraph("Objetivo: "+objective,{indent:false,bold:true,after:6});
        paragraph("Actividades y procedimiento: "+activities);
        paragraph("Responsable principal: "+responsible);
        paragraph("Evidencia y seguimiento: "+evidence);
        paragraph("Resultado esperado: "+output);
      }

      heading("3. Metodología",1,true);
      paragraph("La metodología organiza el examen complexivo como un proceso secuencial, individual, teórico-práctico y basado en competencias. Cada fase se vincula con un objetivo, actividades, responsables, productos y evidencias, de forma que el desarrollo pueda ser supervisado y auditado.",{indent:false});
      insertSectionImage("methodologyImage");

      heading("3.1. Enfoque Metodológico",2,true);
      paragraph("El enfoque integra verificación de requisitos, preparación académica, diseño de instrumentos, organización logística, configuración tecnológica, aplicación, evaluación y mejora continua. Las entradas principales son los registros académicos, el perfil de egreso, la planificación del período, la distribución de estudiantes y los requerimientos de cada carrera.");

      phase("3.2. Fase de Inducción al Proceso","Asegurar que estudiantes y responsables conozcan oportunamente reglas, fechas, requisitos, modalidad, estructura del examen y canales de atención.","Socializar el cronograma; explicar requisitos de habilitación; presentar la estructura teórica y práctica; comunicar reglas de integridad, identificación y uso de recursos; informar la modalidad presencial como regla general y el procedimiento para excepciones autorizadas; resolver dudas y registrar acuerdos.",(a.titulacion||"Titulación y Eficiencia Terminal")+" con "+(a.coordinacionGeneral||"Coordinación General de Carreras")+" y "+(a.carreras||"Coordinaciones de Carrera")+".","Convocatoria, material de socialización, registro de participación y comunicaciones emitidas.","Participantes informados y criterios operativos comprendidos antes de las fases críticas.");

      phase("3.3. Fase de Diseño del Examen Complexivo","Construir instrumentos alineados con el perfil de egreso y con las competencias prioritarias de cada carrera.","Revisar perfil de egreso y resultados de aprendizaje; seleccionar competencias; solicitar y consolidar preguntas; diseñar casos o actividades prácticas; revisar pertinencia, dificultad y tiempo; validar académicamente; aprobar versión final y mantener control de acceso.",(a.carreras||"Coordinaciones de Carrera")+" y docentes designados, con articulación de "+(a.titulacion||"Titulación y Eficiencia Terminal")+" y "+(a.gestionDidactica||"Gestión Didáctica, Diseño Curricular y Calidad Docente")+".","Matriz de competencias, banco de preguntas, instrumento práctico, revisión académica, aprobación y control de versión.","Instrumentos consistentes, aplicables, identificables por versión y listos para su configuración.");

      phase("3.4. Fase de Organización y Distribución","Asignar estudiantes, espacios, horarios y recursos sin superar la capacidad operativa disponible.","Consolidar estudiantes por carrera y lugar; definir jornadas; revisar requerimientos de equipos, software y conectividad; prever accesibilidad; designar docentes y responsables; confirmar espacios y mecanismos de contingencia.",(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.coordinacionGeneral||"Coordinación General de Carreras")+", "+(a.carreras||"Coordinaciones de Carrera")+", "+(a.infraestructuraFisica||"Infraestructura Física y Servicios Generales")+" e "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+".","Distribución vigente, cronograma operativo, asignación de espacios, checklist técnico y registro de responsables.","Jornadas organizadas con capacidad suficiente y condiciones equivalentes para los participantes.");

      phase("3.5. Fase de Preparación: Núcleos de Titulación","Reforzar competencias esenciales y familiarizar al estudiante con la lógica de resolución que encontrará en el examen.","Desarrollar cuatro núcleos; entregar guías; confirmar docentes; cargar materiales; articular contenidos con Integración Curricular o Titulación; registrar seguimiento, recursos, participación y novedades.",(a.coordinacionGeneral||"Coordinación General de Carreras")+", "+(a.carreras||"Coordinaciones de Carrera")+", docentes designados y "+(a.titulacion||"Titulación y Eficiencia Terminal")+".","Guías, asignaciones docentes, materiales, registros de participación, grabaciones o recursos institucionales y reporte de seguimiento.","Cuatro núcleos ejecutados con responsables identificados y evidencia verificable.");

      phase("3.6. Fase de Aplicación del Examen Complexivo","Ejecutar el examen bajo condiciones controladas, individualizadas y trazables.","Verificar identidad y habilitación; registrar ingreso; asignar equipo y espacio; comprobar funcionamiento; comunicar tiempo y reglas; iniciar componentes; supervisar; atender incidencias; respaldar respuestas o productos; registrar entrega y cierre.",(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.carreras||"Coordinaciones de Carrera")+", docentes responsables, "+(a.ti||"Coordinación de Tecnología de la Información")+" e "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+".","Registro de asistencia, control de identidad, bitácora de jornada, evidencias de entrega, incidencias y respaldos.","Aplicación concluida con evidencia suficiente para sustentar el resultado de cada estudiante.");

      phase("3.7. Fase de Evaluación y Retroalimentación","Calificar, validar, registrar y comunicar resultados conforme a criterios institucionales.","Aplicar criterios de calificación; consolidar teoría y práctica; verificar consistencia; registrar notas; publicar resultados por los canales institucionales; gestionar revisiones y, cuando corresponda, la instancia de supletorio.","Docentes evaluadores, "+(a.carreras||"Coordinaciones de Carrera")+", "+(a.titulacion||"Titulación y Eficiencia Terminal")+" y "+(a.secretaria||"Secretaría Académica")+".","Rúbricas o criterios aplicados, calificaciones, actas o registros, comunicaciones y evidencias de revisión.","Resultados consistentes, verificables y registrados dentro de los plazos establecidos.");

      phase("3.8. Coordinación y Mejora Continua","Convertir incidencias y resultados del período en acciones concretas para mejorar la siguiente ejecución.","Consolidar novedades; analizar cumplimiento del cronograma; revisar problemas de instrumentos, logística, tecnología y comunicación; identificar lecciones aprendidas; definir responsables y plazos de mejora.",(a.titulacion||"Titulación y Eficiencia Terminal")+" y "+(a.coordinacionGeneral||"Coordinación General de Carreras")+".","Informe de cierre, registro de incidencias, lecciones aprendidas y plan de acciones de mejora.","Proceso documentado y con acciones verificables para el siguiente período.");

      ns.parts.methodology.responsibilities(api);
      ns.parts.methodology.schedule(api);
      ns.parts.methodology.operationalPlan(api);
    }
  };
})();
