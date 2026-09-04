(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.parts = ns.parts || {};
  ns.parts.methodology = ns.parts.methodology || {};
  ns.parts.methodology.responsibilities = function(api) {
    const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
    function responsibilitiesTable(){
      heading("3.9. Responsables por Fase del Proceso",2,true);
      paragraph("La correcta ejecución del examen complexivo requiere una asignación clara de responsabilidades para cada fase del proceso. La siguiente tabla organiza la información institucional de la planificación base y evita que los responsables aparezcan como texto corrido.");

      ensureSpace(190);
      tableCaption("Responsables institucionales por fase del proceso");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Fase del proceso","Responsable institucional"]],
        body:[
          ["Diseño metodológico y estructura del examen","Coordinación de Titulación y Coordinaciones de Carrera"],
          ["Validación académica de los componentes del examen","Coordinaciones de Carrera"],
          ["Socialización del proceso con estudiantes","Coordinación de Titulación y Coordinaciones de Carrera"],
          ["Revisión de requisitos académicos y documentales","Secretaría Académica y Coordinación de Titulación"],
          ["Control de pagos y obligaciones financieras","Unidad de Recaudación y Cartera"],
          ["Validación de vinculación y prácticas preprofesionales","Coordinaciones de Carrera y unidades responsables de Vinculación y Prácticas Preprofesionales"],
          ["Inscripción al proceso y uso de plataformas","Unidad de Sistemas (SISACAD)"],
          ["Organización logística y distribución por lugar","Coordinación de Titulación y Coordinaciones de Carrera"],
          ["Asignación de docentes evaluadores y supervisores","Coordinación de Titulación"],
          ["Ejecución de seminarios de titulación","Docentes designados por cada carrera"],
          ["Supervisión de las jornadas del examen","Coordinación de Titulación, Coordinaciones de Carrera y docentes responsables"],
          ["Evaluación y calificación del examen","Colectivo docente"],
          ["Registro de calificaciones y resultados","Coordinaciones de Carrera y Unidad de Sistemas"],
          ["Retroalimentación a estudiantes","Docentes evaluadores y Coordinación de Titulación"],
          ["Revisión post-proceso y mejora continua","Coordinación de Titulación y Coordinación General de Carreras"],
          ["Registro del título en SENESCYT","Coordinación General de Carreras"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.52},1:{cellWidth:bodyW*0.48}},
        styles:{font:"times",fontSize:9.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Organización elaborada a partir de la planificación institucional base.");
    }
    responsibilitiesTable();
  };
})();
