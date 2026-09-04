(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.closure = {
    render(api) {
      const {heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW} = api;

      heading("11. Cierre, Registro y Trazabilidad",1,true);
      paragraph("El cierre transforma la ejecución del examen en un expediente verificable. No concluye con la publicación de una nota: requiere consolidar resultados, registrar información en los sistemas institucionales, archivar evidencias, resolver pendientes e incorporar las lecciones aprendidas al siguiente período.",{indent:false});

      heading("11.1. Consolidación de Resultados",2,true);
      paragraph("Las Coordinaciones de Carrera y las unidades responsables deben comprobar que todos los estudiantes convocados tengan un estado final identificable: aprobado, no aprobado, supletorio, pendiente justificado u otro estado institucionalmente definido. No deben quedar registros sin resolución o sin responsable.");
      paragraph("La consolidación debe verificar coincidencia entre actas, hojas de evaluación, sistema académico y cualquier repositorio utilizado para evidencias.");

      heading("11.2. Registro en Sistemas Institucionales",2,true);
      paragraph("El registro de calificaciones y estados debe realizarse dentro de los plazos definidos. Toda corrección posterior debe conservar trazabilidad de la modificación, evitando que el sistema y el expediente documental mantengan valores diferentes.");

      heading("11.3. Archivo de Evidencias",2,true);
      paragraph("Las evidencias deben organizarse por período, carrera y estudiante o jornada, según corresponda. El archivo debe facilitar recuperación posterior sin almacenar información innecesaria o duplicada.");
      tableCaption("Matriz mínima de evidencias y trazabilidad");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Fase","Evidencia mínima","Responsable","Uso de la evidencia"]],
        body:[
          ["Requisitos","Estado de validación y novedades","Unidad que valida","Demostrar habilitación del estudiante"],
          ["Núcleos","Plan, recursos y registro de desarrollo","Docente / Carrera","Acreditar preparación ejecutada"],
          ["Aplicación","Asistencia, bitácora y entrega","Responsable de jornada","Demostrar ejecución e incidencias"],
          ["Evaluación","Resultados parciales, criterios y nota final","Docentes evaluadores","Sustentar la calificación"],
          ["Registro","Constancia de carga o actualización","Carrera / Sistema","Asegurar consistencia institucional"],
          ["Cierre","Informe, incidencias y acciones de mejora","Titulación","Retroalimentar el siguiente período"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.18},1:{cellWidth:bodyW*0.31},2:{cellWidth:bodyW*0.23},3:{cellWidth:bodyW*0.28}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La evidencia específica puede variar por carrera, pero debe permitir demostrar el cumplimiento de la fase.");

      heading("11.4. Informe Final y Lecciones Aprendidas",2,true);
      paragraph("El informe final debe resumir población atendida, cumplimiento del cronograma, resultados, incidencias, reprogramaciones, problemas técnicos, observaciones académicas y acciones de mejora. Las lecciones aprendidas deben asignarse a un responsable y, cuando corresponda, a una fecha de implementación.");
    }
  };
})();
