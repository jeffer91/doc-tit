(() => {
  "use strict";

  const config = Object.freeze({
    id: "CRONOGRAMA_TRABAJO_TITULACION_VIGENTE",
    technicalVersion: "A",
    status: "Vigente",
    effectiveFrom: null,
    intro: "Este cronograma de actividades presenta una estructura detallada para cada etapa del proceso de titulación, asignando responsabilidades específicas y asegurando un flujo adecuado.",
    table: Object.freeze({
      title: "Calendario de actividades por proceso",
      columns: Object.freeze(["Actividad", "Fecha / Plazo", "Descripción", "Responsable"]),
      note: "Esta tabla detalla las actividades clave, las fechas y los responsables involucrados en cada etapa del proceso de titulación, desde la asignación de tutores hasta el registro final de calificaciones."
    }),
    activities: Object.freeze([
      Object.freeze({id:"actividad_01",order:1,phaseId:"fase_01",activity:"Asignación de Tutor y Lector",description:"Designación del tutor y lector para guiar y evaluar el proyecto de tesis, con la supervisión del Coordinador General.",responsible:"Coordinador de Titulación, Coordinador General de Carreras",active:true}),
      Object.freeze({id:"actividad_02",order:2,phaseId:"fase_01",activity:"Reunión Inicial con Tutor",description:"Primer encuentro para acordar el plan de trabajo y los objetivos iniciales.",responsible:"Estudiante y Tutor, supervisado por Coordinador General",active:true}),
      Object.freeze({id:"actividad_03",order:3,phaseId:"fase_02",activity:"Entrega del Primer Borrador",description:"Presentación del primer borrador del proyecto de tesis para revisión del tutor.",responsible:"Estudiante",active:true}),
      Object.freeze({id:"actividad_04",order:4,phaseId:"fase_02",activity:"Retroalimentación del Primer Borrador",description:"El tutor revisa y proporciona comentarios sobre el primer borrador.",responsible:"Tutor",active:true}),
      Object.freeze({id:"actividad_05",order:5,phaseId:"fase_03",activity:"Entrega del Segundo Borrador",description:"El estudiante presenta el segundo borrador, integrando las sugerencias del tutor.",responsible:"Estudiante",active:true}),
      Object.freeze({id:"actividad_06",order:6,phaseId:"fase_03",activity:"Retroalimentación del Segundo Borrador",description:"El tutor revisa y ofrece comentarios adicionales sobre el segundo borrador.",responsible:"Tutor",active:true}),
      Object.freeze({id:"actividad_07",order:7,phaseId:"fase_04",activity:"Entrega del Tercer Borrador",description:"Presentación del tercer borrador ajustado según las revisiones anteriores.",responsible:"Estudiante",active:true}),
      Object.freeze({id:"actividad_08",order:8,phaseId:"fase_05",activity:"Aprobación Final del Tercer Borrador por Tutor",description:"Tutor revisa y, de ser adecuado, aprueba el borrador para revisión del lector.",responsible:"Tutor",active:true}),
      Object.freeze({id:"actividad_09",order:9,phaseId:"fase_06",activity:"Revisión del Proyecto por el Lector",description:"Lector evalúa el proyecto aprobado por el tutor y confirma si cumple con los estándares necesarios para la defensa.",responsible:"Lector",active:true}),
      Object.freeze({id:"actividad_10",order:10,phaseId:"fase_06",activity:"Aprobación Final del Proyecto",description:"Con la aprobación del lector, el proyecto queda listo para la defensa.",responsible:"Lector",active:true}),
      Object.freeze({id:"actividad_11",order:11,phaseId:"fase_07",activity:"Confirmación de Fecha de Defensa",description:"Coordinador de Titulación y Coordinador General confirman la fecha de defensa y comunican detalles al tribunal.",responsible:"Coordinador de Titulación, Coordinador General de Carreras",active:true}),
      Object.freeze({id:"actividad_12",order:12,phaseId:"fase_07",activity:"Preparación para la Defensa",description:"El estudiante realiza los ajustes finales y se prepara para la defensa de grado.",responsible:"Estudiante",active:true}),
      Object.freeze({id:"actividad_13",order:13,phaseId:"fase_08",activity:"Defensa de Tesis",description:"Presentación y defensa del proyecto ante el tribunal evaluador, bajo supervisión del Coordinador General.",responsible:"Estudiante, Tribunal Evaluador, Coordinador General de Carreras",active:true}),
      Object.freeze({id:"actividad_14",order:14,phaseId:"fase_09",activity:"Registro Final de Calificaciones",description:"Coordinador de Titulación registra las calificaciones finales en el sistema institucional.",responsible:"Coordinador de Titulación, Coordinador General de Carreras",active:true})
    ]),
    phasesIntro: "A continuación, se detalla el orden secuencial de las fases del trabajo de titulación, aplicable a todas las carreras del Instituto. Cada etapa debe ser desarrollada conforme a la planificación institucional vigente:",
    phases: Object.freeze([
      Object.freeze({id:"fase_01",order:1,title:"Asignación de Tutor y Lector Académico",text:"La Coordinación de Titulación designa oficialmente a los docentes responsables del acompañamiento académico y la revisión técnica del trabajo."}),
      Object.freeze({id:"fase_02",order:2,title:"Entrega del Primer Borrador al Tutor",text:"El estudiante presenta el primer avance estructurado del trabajo de titulación, que incluye la introducción, planteamiento del problema y objetivos iniciales."}),
      Object.freeze({id:"fase_03",order:3,title:"Entrega del Segundo Borrador al Tutor",text:"El estudiante incorpora ajustes y continúa el desarrollo del cuerpo teórico y metodológico del trabajo, según las observaciones del tutor."}),
      Object.freeze({id:"fase_04",order:4,title:"Entrega del Tercer Borrador al Tutor",text:"Se presenta la versión avanzada del trabajo, con resultados y conclusiones, para revisión final por parte del tutor."}),
      Object.freeze({id:"fase_05",order:5,title:"Aprobación Final del Tutor",text:"El tutor emite su validación académica sobre el trabajo completo, habilitando el paso a la revisión por parte del lector."}),
      Object.freeze({id:"fase_06",order:6,title:"Revisión por Parte del Lector Académico",text:"El lector emite observaciones técnicas y formales que el estudiante debe considerar antes de la defensa."}),
      Object.freeze({id:"fase_07",order:7,title:"Confirmación de Fecha y Modalidad de Defensa",text:"La Coordinación de Titulación notifica oficialmente al estudiante la fecha y modalidad (presencial o virtual) de la defensa.",dependencies:Object.freeze(["actividad_11","actividad_13"])}),
      Object.freeze({id:"fase_08",order:8,title:"Defensa del Trabajo de Titulación",text:"El estudiante presenta su trabajo ante un tribunal académico, compuesto por docentes designados, quienes emiten la calificación correspondiente."}),
      Object.freeze({id:"fase_09",order:9,title:"Registro de Calificaciones Finales",text:"El resultado de la defensa es ingresado en el sistema institucional, con lo cual concluye formalmente el proceso."})
    ]),
    phasesNote: "La ejecución de cada una de estas fases está sujeta al cumplimiento de los requisitos académicos y administrativos establecidos por la normativa institucional vigente."
  });

  window.DOC_TIT_TRABAJO_SCHEDULE = config;
})();
