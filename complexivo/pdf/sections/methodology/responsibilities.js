(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.parts = ns.parts || {};
  ns.parts.methodology = ns.parts.methodology || {};
  ns.parts.methodology.responsibilities = function(api) {
    const {heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW} = api;

    heading("3.9. Responsables por Fase del Proceso",2,true);
    paragraph("La ejecución requiere responsabilidades explícitas y productos verificables. La matriz vincula cada fase con la unidad responsable y con la evidencia mínima que permite comprobar su cumplimiento.");

    tableCaption("Responsables, productos y evidencias por fase del proceso");
    autoTable({
      startY:api.getY(),
      margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
      head:[["Fase del proceso","Responsable institucional","Producto / evidencia"]],
      body:[
        ["Diseño metodológico y estructura del examen","Coordinación de Titulación y Coordinaciones de Carrera","Plan metodológico, lineamientos y versión aprobada del proceso"],
        ["Validación académica de instrumentos","Coordinaciones de Carrera y docentes designados","Instrumentos revisados, criterios de evaluación y control de versión"],
        ["Inducción y socialización","Coordinación de Titulación y Coordinaciones de Carrera","Convocatoria, material, registro de participación y comunicaciones"],
        ["Requisitos académicos y documentales","Secretaría Académica y Coordinaciones de Carrera","Registro de habilitación y estado de requisitos"],
        ["Obligaciones financieras","Unidad de Recaudación y Cartera","Estado institucional de cumplimiento, sin valores históricos hardcodeados"],
        ["Vinculación y prácticas preprofesionales","Unidades responsables y Coordinaciones de Carrera","Registro o certificación de cumplimiento"],
        ["Organización logística","Coordinación de Titulación y unidades de apoyo","Distribución, espacios, horarios, checklist técnico y responsables"],
        ["Núcleos de Titulación","Docentes designados y Coordinaciones de Carrera","Plan, recursos, registros y seguimiento de los cuatro núcleos"],
        ["Aplicación del examen","Coordinación de Titulación, docentes responsables y soporte","Asistencia, bitácora, evidencias de entrega e incidencias"],
        ["Evaluación y calificación","Docentes evaluadores","Criterios aplicados, resultados y evidencias de evaluación"],
        ["Registro de resultados","Coordinaciones de Carrera y unidades de sistema","Registro institucional, actas o constancias de carga"],
        ["Cierre y mejora continua","Coordinación de Titulación y Coordinación General de Carreras","Informe final, archivo de evidencias y plan de mejora"]
      ],
      columnStyles:{0:{cellWidth:bodyW*0.31},1:{cellWidth:bodyW*0.31},2:{cellWidth:bodyW*0.38}},
      styles:{font:"times",fontSize:8.6,cellPadding:4,textColor:0},
      headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
    });
    tableNote("La matriz debe actualizarse cuando cambie la estructura institucional o la asignación de responsabilidades del período.");
  };
})();
