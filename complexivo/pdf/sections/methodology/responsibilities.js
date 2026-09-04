(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.parts = ns.parts || {};
  ns.parts.methodology = ns.parts.methodology || {};
  ns.parts.methodology.responsibilities = function(api) {
    const {heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW} = api;
    const a=ns.config?.areas||{};

    heading("3.9. Matriz de Coordinación Interáreas",2,true);
    paragraph("La ejecución del examen complexivo exige coordinación entre áreas académicas, administrativas y tecnológicas. La siguiente matriz identifica el área principal de cada necesidad y las instancias con las que debe articularse, de modo que las responsabilidades no queden expresadas de forma genérica.");

    tableCaption("Matriz de coordinación interáreas del proceso de examen complexivo");
    autoTable({
      startY:api.getY(),
      margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
      head:[["Fase / necesidad","Área principal","Áreas con las que debe coordinar"]],
      body:[
        ["Dirección del proceso complexivo",a.titulacion||"Titulación y Eficiencia Terminal",(a.coordinacionAcademica||"Coordinación Académica")+", "+(a.coordinacionGeneral||"Coordinación General de Carreras")],
        ["Coordinación de docentes y carreras",a.coordinacionGeneral||"Coordinación General de Carreras",(a.carreras||"Coordinaciones de Carrera")+", "+(a.titulacion||"Titulación y Eficiencia Terminal")],
        ["Verificación académica y documental",a.secretaria||"Secretaría Académica",(a.carreras||"Coordinaciones de Carrera")+", "+(a.titulacion||"Titulación y Eficiencia Terminal")],
        ["Diseño académico de instrumentos",a.carreras||"Coordinaciones de Carrera","Docentes designados, "+(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.gestionDidactica||"Gestión Didáctica, Diseño Curricular y Calidad Docente")],
        ["Validación financiera",a.recaudacion||"Recaudación y Cartera",(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.secretaria||"Secretaría Académica")+" cuando corresponda"],
        ["Vinculación",a.vinculacion||"Vinculación con la Sociedad",(a.carreras||"Coordinaciones de Carrera")+", "+(a.titulacion||"Titulación y Eficiencia Terminal")],
        ["Prácticas",a.practicas||"Prácticas Preprofesionales",(a.carreras||"Coordinaciones de Carrera")+", "+(a.titulacion||"Titulación y Eficiencia Terminal")],
        ["Lengua extranjera",a.idiomas||"Coordinación Idiomas",(a.secretaria||"Secretaría Académica")+", "+(a.carreras||"Coordinaciones de Carrera")],
        ["Casos estudiantiles justificados",a.bienestar||"Bienestar y Seguimiento Estudiantil",(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.carreras||"Coordinaciones de Carrera")],
        ["Plataformas y aulas virtuales",a.ti||"Coordinación de Tecnología de la Información",(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+", "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+", "+(a.titulacion||"Titulación y Eficiencia Terminal")],
        ["Laboratorios y soporte tecnológico",a.soporteTecnologico||"Infraestructura y Soporte Tecnológico",(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.carreras||"Coordinaciones de Carrera")],
        ["Espacios físicos",a.infraestructuraFisica||"Infraestructura Física y Servicios Generales",(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.coordinacionGeneral||"Coordinación General de Carreras")],
        ["Registro y cierre",(a.titulacion||"Titulación y Eficiencia Terminal")+" / "+(a.secretaria||"Secretaría Académica"),(a.carreras||"Coordinaciones de Carrera")+", "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+" y áreas responsables"]
      ],
      columnStyles:{0:{cellWidth:bodyW*0.29},1:{cellWidth:bodyW*0.30},2:{cellWidth:bodyW*0.41}},
      styles:{font:"times",fontSize:8.2,cellPadding:4,textColor:0},
      headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
    });
    tableNote("La matriz debe actualizarse cuando exista un cambio formal en la estructura institucional o en la asignación de competencias.");
  };
})();
