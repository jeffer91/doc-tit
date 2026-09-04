(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.closure = {
    render(api) {
      const {heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW} = api;
      const a=ns.config?.areas||{};

      heading("11. Cierre, Registro y Trazabilidad",1,true);
      paragraph("El cierre transforma la ejecución del examen en un expediente verificable. No concluye con la publicación de una nota: requiere consolidar resultados, registrar información en los sistemas institucionales, resolver casos sin estado final, respaldar evidencias, cerrar aulas o plataformas e incorporar las lecciones aprendidas al siguiente período.",{indent:false});

      heading("11.1. Consolidación de Resultados",2,true);
      paragraph((a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.carreras||"Coordinaciones de Carrera")+" y "+(a.secretaria||"Secretaría Académica")+" deben comprobar que todos los estudiantes convocados tengan un estado final identificable: aprobado, no aprobado, supletorio, pendiente justificado u otro estado institucionalmente definido. No deben quedar registros sin resolución o sin responsable.");
      paragraph("La consolidación debe verificar coincidencia entre actas, hojas de evaluación, registros académicos y repositorios institucionales utilizados para evidencias.");

      heading("11.2. Registro de Calificaciones",2,true);
      paragraph("El registro de calificaciones y estados debe realizarse dentro de los plazos definidos. Las Coordinaciones de Carrera ejecutan la carga correspondiente y coordinan con "+(a.secretaria||"Secretaría Académica")+" y "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+" cuando exista una novedad de registro o sistema.");
      paragraph("Toda corrección posterior debe conservar trazabilidad de la modificación, evitando diferencias entre el registro académico y el expediente documental.");

      heading("11.3. Verificación de Estudiantes sin Estado Final",2,true);
      paragraph("Después del examen ordinario y del supletorio debe generarse un control específico de estudiantes que todavía no tengan un estado final. Cada caso debe identificar causa, área responsable, acción requerida, plazo y resultado de la gestión hasta su cierre.");

      heading("11.4. Respaldo y Archivo de Evidencias",2,true);
      paragraph("Las evidencias deben organizarse por período, carrera y estudiante o jornada, según corresponda. El respaldo se coordina entre "+(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.carreras||"Coordinaciones de Carrera")+" y "+(a.ti||"Coordinación de Tecnología de la Información")+" cuando se utilicen repositorios o plataformas institucionales.");
      tableCaption("Matriz mínima de evidencias y trazabilidad");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Fase","Evidencia mínima","Responsable","Uso de la evidencia"]],
        body:[
          ["Requisitos","Estado de validación y novedades",a.secretaria||"Secretaría Académica","Demostrar habilitación del estudiante"],
          ["Núcleos","Guía, docente, recursos y registro de desarrollo","Docente / "+(a.carreras||"Coordinaciones de Carrera"),"Acreditar preparación ejecutada"],
          ["Configuración","Aula, accesos, versión y prueba integral",(a.ti||"Coordinación de Tecnología de la Información")+" / "+(a.titulacion||"Titulación y Eficiencia Terminal"),"Demostrar preparación tecnológica"],
          ["Aplicación","Asistencia, bitácora y entrega",a.titulacion||"Titulación y Eficiencia Terminal","Demostrar ejecución e incidencias"],
          ["Evaluación","Resultados parciales, criterios y nota final","Docentes evaluadores","Sustentar la calificación"],
          ["Registro","Constancia de carga o actualización",(a.carreras||"Coordinaciones de Carrera")+" / "+(a.secretaria||"Secretaría Académica"),"Asegurar consistencia institucional"],
          ["Cierre","Informe, incidencias y acciones de mejora",a.titulacion||"Titulación y Eficiencia Terminal","Retroalimentar el siguiente período"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.18},1:{cellWidth:bodyW*0.31},2:{cellWidth:bodyW*0.23},3:{cellWidth:bodyW*0.28}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La evidencia específica puede variar por carrera, pero debe permitir demostrar el cumplimiento de la fase.");

      heading("11.5. Cierre de Aulas y Plataformas",2,true);
      paragraph("Una vez respaldadas las evidencias y verificados los resultados, "+(a.ti||"Coordinación de Tecnología de la Información")+" y "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+" deben aplicar el cierre de aulas, accesos o espacios digitales conforme a las necesidades institucionales, conservando los respaldos requeridos.");

      heading("11.6. Informe Final y Lecciones Aprendidas",2,true);
      paragraph("El informe final debe resumir población atendida, cumplimiento del cronograma, resultados, incidencias, reprogramaciones, problemas técnicos, observaciones académicas y acciones de mejora. Titulación y Eficiencia Terminal consolida el informe con aportes de Coordinación General de Carreras, Coordinaciones de Carrera y las áreas que participaron en el proceso.");
      paragraph("Las lecciones aprendidas deben convertirse en acciones concretas con responsable y, cuando corresponda, fecha de implementación para el siguiente período.");

      heading("11.7. Secuencia Administrativa de Cierre",2,true);
      paragraph("La secuencia de cierre es: Consolidación de resultados → Registro de calificaciones → Verificación de estudiantes sin estado final → Respaldo de evidencias → Cierre de aulas y plataformas → Informe final del proceso. El examen complexivo se considera administrativamente cerrado cuando esta secuencia ha sido completada y documentada.",{indent:false,bold:true});
    }
  };
})();
