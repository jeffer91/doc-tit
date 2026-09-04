(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.parts = ns.parts || {};
  ns.parts.methodology = ns.parts.methodology || {};
  const a=ns.config?.areas||{};

  const rows=[
    {id:"instructions",activity:"Entrega de instrucciones del Examen Complexivo a docentes",responsible:a.titulacion||"Titulación y Eficiencia Terminal",coordination:(a.coordinacionGeneral||"Coordinación General de Carreras")+", "+(a.carreras||"Coordinaciones de Carrera")+", "+(a.gestionDidactica||"Gestión Didáctica, Diseño Curricular y Calidad Docente"),product:"Instructivo aprobado y comunicación de envío",evidence:"Instructivo, comunicación y registro de recepción"},
    {id:"guides",activity:"Entrega de guías de núcleo",responsible:(a.titulacion||"Titulación y Eficiencia Terminal")+" / "+(a.carreras||"Coordinaciones de Carrera"),coordination:"Docentes designados de los cuatro núcleos",product:"Guías de los cuatro núcleos",evidence:"Guías, versión, fecha y constancia de recepción"},
    {id:"teacher1",activity:"Asignación y confirmación del Docente Núcleo 1",responsible:(a.coordinacionGeneral||"Coordinación General de Carreras")+" / "+(a.carreras||"Coordinaciones de Carrera"),coordination:a.titulacion||"Titulación y Eficiencia Terminal",product:"Docente confirmado para Núcleo 1",evidence:"Nombre, carrera, núcleo, fecha y confirmación"},
    {id:"teacher2",activity:"Asignación y confirmación del Docente Núcleo 2",responsible:(a.coordinacionGeneral||"Coordinación General de Carreras")+" / "+(a.carreras||"Coordinaciones de Carrera"),coordination:a.titulacion||"Titulación y Eficiencia Terminal",product:"Docente confirmado para Núcleo 2",evidence:"Nombre, carrera, núcleo, fecha y confirmación"},
    {id:"teacher3",activity:"Asignación y confirmación del Docente Núcleo 3",responsible:(a.coordinacionGeneral||"Coordinación General de Carreras")+" / "+(a.carreras||"Coordinaciones de Carrera"),coordination:a.titulacion||"Titulación y Eficiencia Terminal",product:"Docente confirmado para Núcleo 3",evidence:"Nombre, carrera, núcleo, fecha y confirmación"},
    {id:"teacher4",activity:"Asignación y confirmación del Docente Núcleo 4",responsible:(a.coordinacionGeneral||"Coordinación General de Carreras")+" / "+(a.carreras||"Coordinaciones de Carrera"),coordination:a.titulacion||"Titulación y Eficiencia Terminal",product:"Docente confirmado para Núcleo 4",evidence:"Nombre, carrera, núcleo, fecha y confirmación"},
    {id:"questionsRequest",activity:"Solicitud de preguntas para el Examen Complexivo",responsible:a.titulacion||"Titulación y Eficiencia Terminal",coordination:(a.carreras||"Coordinaciones de Carrera")+", docentes designados, "+(a.gestionDidactica||"Gestión Didáctica, Diseño Curricular y Calidad Docente"),product:"Preguntas recibidas dentro del plazo definido",evidence:"Solicitud, fecha límite, responsable, cantidad requerida y recepción"},
    {id:"questionsReview",activity:"Revisión y consolidación de preguntas",responsible:a.carreras||"Coordinaciones de Carrera",coordination:(a.titulacion||"Titulación y Eficiencia Terminal")+", docentes responsables",product:"Banco consolidado y validado",evidence:"Banco consolidado, validación académica y control de versión"},
    {id:"classrooms",activity:"Creación de aulas",responsible:a.ti||"Coordinación de Tecnología de la Información",coordination:(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+", "+(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.carreras||"Coordinaciones de Carrera"),product:"Aulas creadas y accesos configurados",evidence:"Aula, carrera o grupo asociado y validación de accesos"},
    {id:"staffing",activity:"Definición del número de docentes para la aplicación del Examen Complexivo",responsible:(a.titulacion||"Titulación y Eficiencia Terminal")+" + "+(a.coordinacionGeneral||"Coordinación General de Carreras"),coordination:a.carreras||"Coordinaciones de Carrera",product:"Matriz de docentes requeridos",evidence:"Matriz por jornada, carrera y lugar de ejecución"},
    {id:"materials",activity:"Subida de material para el Examen Complexivo",responsible:"Docentes designados / "+(a.carreras||"Coordinaciones de Carrera"),coordination:(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.ti||"Coordinación de Tecnología de la Información"),product:"Material cargado y validado",evidence:"Material, fecha de carga, responsable y validación"},
    {id:"examConfig",activity:"Creación y configuración del Examen Complexivo",responsible:(a.titulacion||"Titulación y Eficiencia Terminal")+" + "+(a.ti||"Coordinación de Tecnología de la Información"),coordination:(a.carreras||"Coordinaciones de Carrera")+", "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas"),product:"Examen creado y parámetros revisados",evidence:"Instrumento configurado, parámetros y versión aprobada"},
    {id:"test",activity:"Prueba de Complexivo",responsible:(a.titulacion||"Titulación y Eficiencia Terminal")+" + "+(a.ti||"Coordinación de Tecnología de la Información"),coordination:(a.carreras||"Coordinaciones de Carrera")+", docentes designados, "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico"),product:"Prueba integral concluida",evidence:"Informe de acceso, tiempo, preguntas, archivos, guardado, entrega y respaldo"},
    {id:"testFixes",activity:"Corrección de novedades detectadas en la prueba",responsible:"Área institucional competente según la novedad",coordination:(a.titulacion||"Titulación y Eficiencia Terminal")+" y "+(a.ti||"Coordinación de Tecnología de la Información"),product:"Novedades corregidas y segunda validación",evidence:"Registro de problemas, corrección aplicada y verificación"},
    {id:"studentRooms",activity:"Comunicación de aulas a estudiantes",responsible:a.titulacion||"Titulación y Eficiencia Terminal",coordination:(a.carreras||"Coordinaciones de Carrera")+", "+(a.secretaria||"Secretaría Académica")+" cuando corresponda",product:"Convocatoria con aula, fecha, hora, lugar y condiciones",evidence:"Comunicación enviada y registro de destinatarios"},
    {id:"exam",activity:"Examen Complexivo",responsible:a.titulacion||"Titulación y Eficiencia Terminal",coordination:(a.carreras||"Coordinaciones de Carrera")+", "+(a.ti||"Coordinación de Tecnología de la Información")+", "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+", "+(a.secretaria||"Secretaría Académica"),product:"Jornadas ejecutadas y resultados disponibles",evidence:"Asistencia, bitácora, incidencias, evidencias y resultados"},
    {id:"supplementary",activity:"Examen Complexivo Supletorio",responsible:a.titulacion||"Titulación y Eficiencia Terminal",coordination:(a.carreras||"Coordinaciones de Carrera")+", "+(a.ti||"Coordinación de Tecnología de la Información")+", "+(a.secretaria||"Secretaría Académica")+", "+(a.bienestar||"Bienestar y Seguimiento Estudiantil")+" cuando corresponda",product:"Supletorio ejecutado y resultados consolidados",evidence:"Convocatoria, habilitados, asistencia, incidencias, notas y cierre"},
    {id:"results",activity:"Consolidación de resultados",responsible:a.titulacion||"Titulación y Eficiencia Terminal",coordination:(a.carreras||"Coordinaciones de Carrera")+", "+(a.secretaria||"Secretaría Académica"),product:"Matriz consolidada de resultados",evidence:"Matriz revisada y coincidencia con evidencias de evaluación"},
    {id:"grades",activity:"Registro de calificaciones",responsible:a.carreras||"Coordinaciones de Carrera",coordination:(a.secretaria||"Secretaría Académica")+", "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas"),product:"Calificaciones registradas",evidence:"Constancia de carga o registro institucional"},
    {id:"finalStatus",activity:"Verificación de estudiantes sin estado final",responsible:(a.titulacion||"Titulación y Eficiencia Terminal")+" / "+(a.secretaria||"Secretaría Académica"),coordination:a.carreras||"Coordinaciones de Carrera",product:"Listado sin casos pendientes de resolución",evidence:"Control de estados finales y registro de novedades resueltas"},
    {id:"backup",activity:"Respaldo de evidencias",responsible:a.titulacion||"Titulación y Eficiencia Terminal",coordination:(a.carreras||"Coordinaciones de Carrera")+", "+(a.ti||"Coordinación de Tecnología de la Información"),product:"Expediente digital organizado",evidence:"Ruta institucional, estructura de archivo y comprobación de respaldo"},
    {id:"platformClose",activity:"Cierre de aulas y plataformas",responsible:a.ti||"Coordinación de Tecnología de la Información",coordination:(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+", "+(a.titulacion||"Titulación y Eficiencia Terminal"),product:"Aulas cerradas y accesos ajustados",evidence:"Registro de cierre, respaldos y permisos finales"},
    {id:"finalReport",activity:"Informe final del proceso",responsible:a.titulacion||"Titulación y Eficiencia Terminal",coordination:(a.coordinacionGeneral||"Coordinación General de Carreras")+", "+(a.carreras||"Coordinaciones de Carrera"),product:"Informe final con resultados y acciones de mejora",evidence:"Informe aprobado, incidencias consolidadas y plan de mejora"}
  ];

  ns.operationalDefaults = rows.map(r=>({...r,start:"",deadline:"",person:"",status:"Planificado",observations:""}));

  ns.parts.methodology.operationalPlan = function(api) {
    const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,formatDateShort} = api;
    const entered=Array.isArray(ctx.operationalPlan)?ctx.operationalPlan:[];
    const byId=new Map(entered.map(r=>[r.id,r]));
    const plan=ns.operationalDefaults.map(base=>({...base,...(byId.get(base.id)||{})}));
    const date=v=>v?formatDateShort(v):"Por definir";
    const value=v=>String(v||"").trim()||"Por definir";

    heading("3.11. Plan Operativo de Preparación, Configuración y Aplicación del Examen Complexivo",2,true);
    paragraph("El cronograma general establece las grandes ventanas del período; el plan operativo detalla las actividades que deben completarse para que el examen pueda configurarse, probarse, ejecutarse y cerrarse. Las fechas operativas se registran expresamente por el responsable del período y no se completan con fechas supuestas.");

    heading("3.11.1. Programación y coordinación operativa",3,true);
    tableCaption("Plan operativo: programación, responsables y coordinación");
    autoTable({
      startY:api.getY(),
      margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
      head:[["Actividad","Inicio","Fecha límite","Responsable principal","Coordinación necesaria"]],
      body:plan.map(r=>[r.activity,date(r.start),date(r.deadline),value(r.responsible),value(r.coordination)]),
      columnStyles:{0:{cellWidth:bodyW*0.31},1:{cellWidth:bodyW*0.11},2:{cellWidth:bodyW*0.11},3:{cellWidth:bodyW*0.22},4:{cellWidth:bodyW*0.25}},
      styles:{font:"times",fontSize:7.2,cellPadding:3,textColor:0},
      headStyles:{font:"times",fontStyle:"bold",fontSize:7.2,fillColor:[255,255,255],textColor:0}
    });
    tableNote("Las fechas «Por definir» deben completarse cuando exista una programación aprobada para la actividad; no representan fechas estimadas.");

    heading("3.11.2. Productos, evidencias y seguimiento",3,true);
    tableCaption("Plan operativo: productos, evidencias, estado y observaciones");
    autoTable({
      startY:api.getY(),
      margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
      head:[["Actividad","Persona responsable","Producto esperado","Evidencia","Estado","Observaciones"]],
      body:plan.map(r=>[r.activity,value(r.person),value(r.product),value(r.evidence),value(r.status),value(r.observations)]),
      columnStyles:{0:{cellWidth:bodyW*0.27},1:{cellWidth:bodyW*0.14},2:{cellWidth:bodyW*0.20},3:{cellWidth:bodyW*0.20},4:{cellWidth:bodyW*0.09},5:{cellWidth:bodyW*0.10}},
      styles:{font:"times",fontSize:6.9,cellPadding:2.8,textColor:0},
      headStyles:{font:"times",fontStyle:"bold",fontSize:6.8,fillColor:[255,255,255],textColor:0}
    });
    tableNote("El seguimiento debe actualizarse durante el período y conservar evidencia suficiente para verificar el cumplimiento de cada actividad.");

    heading("3.11.3. Secuencia de cierre posterior al supletorio",3,true);
    paragraph("Después del examen supletorio, el proceso continúa con la consolidación de resultados, el registro de calificaciones, la verificación de estudiantes sin estado final, el respaldo de evidencias, el cierre de aulas y plataformas y la elaboración del informe final. El proceso se considera cerrado únicamente cuando estas actividades cuentan con responsable, estado y evidencia.");
  };
})();
