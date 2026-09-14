(() => {
  "use strict";

  const common = [
    { id:"information", label:"Información", title:"Información del documento", kind:"utility" },
    { id:"cover", label:"Portada", title:"Portada", kind:"presentation" },
    { id:"header", label:"Cabecera", title:"Cabecera", kind:"presentation" },
    { id:"resources", label:"Recursos", title:"Recursos del documento", kind:"resource" }
  ];

  window.DOC_TIT_SECTION_MANIFEST = {
    complexivo: {
      sections: [
        ...common,
        { id:"introduccion", label:"Introducción", title:"1. Introducción", kind:"document" },
        { id:"base-legal", label:"Base legal", title:"2. Base Legal", kind:"document" },
        { id:"metodologia", label:"Metodología", title:"3. Metodología", kind:"document", requires:["schedule"] },
        { id:"requisitos", label:"Requisitos", title:"4. Requisitos para Titulación", kind:"document" },
        { id:"descripcion-examen", label:"Descripción", title:"5. Descripción del Examen Complexivo", kind:"document" },
        { id:"seminarios", label:"Seminarios", title:"6. Seminarios de Titulación", kind:"document" },
        { id:"distribucion-estudiantes", label:"Distribución", title:"7. Distribución de Estudiantes por Carrera y Nivel", kind:"document", requires:["distribution"] },
        { id:"laboratorios", label:"Laboratorios", title:"8. Asignación de Laboratorios y Capacidad", kind:"document" },
        { id:"imponderables", label:"Imponderables", title:"9. Imponderables", kind:"document" },
        { id:"criterios-evaluacion", label:"Evaluación", title:"10. Criterios de Evaluación", kind:"document" },
        { id:"resumen-general", label:"Resumen", title:"11. Resumen General", kind:"document" },
        { id:"bibliografia", label:"Bibliografía", title:"12. Bibliografía", kind:"document" }
      ],
      templateSections: {
        cronograma:"metodologia",
        distribucion:"distribucion-estudiantes"
      },
      editorSections: {
        schedule:"metodologia",
        distribution:"distribucion-estudiantes",
        operational:"metodologia",
        nuclei:"seminarios"
      }
    },

    "trabajo-titulacion": {
      sections: [
        ...common,
        { id:"introduccion", label:"Introducción", title:"1. Introducción", kind:"document" },
        { id:"base-legal", label:"Base legal", title:"2. Base Legal", kind:"document" },
        { id:"metodologia", label:"Metodología", title:"3. Metodología", kind:"document" },
        { id:"requisitos", label:"Requisitos", title:"4. Requisitos para la Aprobación de la Titulación", kind:"document" },
        { id:"procesos", label:"Procesos", title:"5. Descripción de los Procesos de Titulación", kind:"document" },
        { id:"gestion-logistica", label:"Gestión", title:"6. Gestión Administrativa y Logística", kind:"document" },
        { id:"induccion", label:"Inducción", title:"7. Inducción de Titulación", kind:"document" },
        { id:"informe-autorizaciones", label:"Informe", title:"8. Informe y Autorizaciones", kind:"document" },
        { id:"cronograma-actividades", label:"Cronograma", title:"9. Cronograma de Actividades", kind:"document", requires:["schedule"] },
        { id:"resultados-mejora", label:"Resultados", title:"10. Análisis de Resultados y Mejora Continua", kind:"document" },
        { id:"conclusiones", label:"Conclusiones", title:"11. Conclusiones", kind:"document" },
        { id:"recomendaciones", label:"Recomendaciones", title:"12. Recomendaciones", kind:"document" },
        { id:"bibliografia", label:"Bibliografía", title:"13. Bibliografía", kind:"document" }
      ],
      templateSections: {
        cronograma:"cronograma-actividades"
      },
      editorSections: {
        schedule:"cronograma-actividades"
      }
    },

    "articulo-academico": {
      sections: [
        ...common,
        { id:"introduccion", label:"Introducción", title:"1. Introducción", kind:"document" },
        { id:"marco-normativo", label:"Marco normativo", title:"2. Marco Normativo y Estratégico", kind:"document" },
        { id:"metodologia-implementacion", label:"Metodología", title:"3. Metodología de Implementación del Proceso", kind:"document", requires:["schedule"] },
        { id:"desarrollo-operativo", label:"Desarrollo", title:"4. Desarrollo Operativo del Proceso de Titulación", kind:"document" },
        { id:"evaluacion-seguimiento", label:"Evaluación", title:"5. Evaluación, Acreditación y Seguimiento", kind:"document" },
        { id:"disposiciones-finales", label:"Disposiciones", title:"6. Disposiciones Finales", kind:"document" },
        { id:"referencias", label:"Referencias", title:"7. Referencias", kind:"document" }
      ],
      templateSections: {
        cronograma:"metodologia-implementacion",
        carreras:"desarrollo-operativo",
        refuerzos:"desarrollo-operativo",
        defensas:"desarrollo-operativo",
        evaluacion:"evaluacion-seguimiento"
      },
      editorSections: {
        schedule:"metodologia-implementacion",
        carreras:"desarrollo-operativo",
        refuerzos:"desarrollo-operativo",
        defensas:"desarrollo-operativo",
        evaluacion:"evaluacion-seguimiento"
      }
    }
  };
})();
