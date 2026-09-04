(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.executiveSummary = {
    render(api) {
      const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,totals,joinNatural,policy,formatDateShort,normalize} = api;
      const a=ns.config?.areas||{};
      const t=totals(ctx.distribution);
      const ev=policy.evaluation||{};
      const schedule=ctx.schedule||[];
      const findActivity=text=>schedule.find(r=>normalize(r.activity).includes(normalize(text)));
      const exam=findActivity("examen complexivo");
      const supplementary=findActivity("supletorio");
      const places=joinNatural(Object.keys(t.byPlace));

      heading("12. Resumen Ejecutivo",1,true);
      paragraph("La planificación del examen complexivo integra el conjunto de actividades académicas, administrativas, logísticas y tecnológicas necesarias para preparar, configurar, probar, aplicar, evaluar y cerrar el proceso de titulación del período "+ctx.period.name+". La síntesis se presenta al final para recoger las decisiones y controles desarrollados en los capítulos anteriores, sin sustituir su detalle.",{indent:false});

      heading("12.1. Alcance del período",2,true);
      paragraph("La población planificada corresponde a "+t.total+" estudiantes distribuidos en "+places+". La organización por carrera y lugar de ejecución determina la demanda de espacios, equipos, conectividad, docentes responsables y mecanismos de soporte. La presencialidad constituye la regla general de aplicación; cualquier modalidad virtual requiere justificación y autorización institucional expresa.");
      paragraph("La preparación académica se estructura mediante cuatro Núcleos de Titulación, cada uno con docente responsable, guía, material, aula o recurso institucional y evidencia de desarrollo. La ejecución de los núcleos se articula con Integración Curricular o Titulación y con las Coordinaciones de Carrera.");

      tableCaption("Síntesis de condiciones principales del proceso");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Dimensión","Condición planificada"]],
        body:[
          ["Período",ctx.period.name],
          ["Población",t.total+" estudiantes"],
          ["Lugares de ejecución",places],
          ["Preparación académica","Cuatro Núcleos de Titulación con docente, guía, material y evidencia"],
          ["Modalidad","Presencial como regla general; virtual únicamente mediante excepción autorizada"],
          ["Componente teórico",ev.theoreticalWeight+" % de la nota final; "+ev.theoreticalQuestions+" preguntas; "+ev.theoreticalMinutes+" minutos"],
          ["Componente práctico",ev.practicalWeight+" % de la nota final; actividad individual definida por carrera"],
          ["Nota mínima",ev.minimumGrade+"/"+ev.gradeScale],
          ["Defensa oral","No aplica como regla general; únicamente cuando exista una condición aprobada para la carrera"],
          ["Examen ordinario",exam?(formatDateShort(exam.start)+" a "+formatDateShort(exam.end)):"Según cronograma vigente"],
          ["Supletorio",supplementary?(formatDateShort(supplementary.start)+" a "+formatDateShort(supplementary.end)):"Según cronograma vigente"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.28},1:{cellWidth:bodyW*0.72}},
        styles:{font:"times",fontSize:8.8,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Las cifras y condiciones corresponden a los registros institucionales vigentes utilizados en la planificación del período.");

      heading("12.2. Coordinación institucional",2,true);
      paragraph("La dirección del proceso corresponde a "+(a.titulacion||"Titulación y Eficiencia Terminal")+". La coordinación académica de docentes y carreras se articula con "+(a.coordinacionGeneral||"Coordinación General de Carreras")+" y "+(a.carreras||"Coordinaciones de Carrera")+". La habilitación académica y documental involucra a "+(a.secretaria||"Secretaría Académica")+"; los requisitos complementarios se verifican con "+(a.vinculacion||"Vinculación con la Sociedad")+", "+(a.practicas||"Prácticas Preprofesionales")+", "+(a.idiomas||"Coordinación Idiomas")+" y "+(a.recaudacion||"Recaudación y Cartera")+" según corresponda.");
      paragraph("La preparación de aulas, accesos, plataforma, conectividad y pruebas se coordina con "+(a.ti||"Coordinación de Tecnología de la Información")+", "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+" e "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+". Los espacios físicos se articulan con "+(a.infraestructuraFisica||"Infraestructura Física y Servicios Generales")+" y los casos estudiantiles justificados con "+(a.bienestar||"Bienestar y Seguimiento Estudiantil")+" cuando corresponda.");

      heading("12.3. Preparación, prueba y aplicación",2,true);
      paragraph("Antes de la jornada deben completarse la entrega de instrucciones a docentes, entrega de guías de núcleo, asignación y confirmación de docentes, solicitud y consolidación de preguntas, creación de aulas, determinación de docentes requeridos, carga de materiales, creación y configuración del instrumento y prueba integral. Las novedades identificadas en la prueba deben corregirse y someterse a una segunda validación antes de la habilitación final.");
      paragraph("La aplicación requiere verificar identidad y habilitación, controlar accesos y tiempos, disponer de equipos y software, supervisar la jornada, registrar incidencias y conservar evidencia de entrega. El supletorio se gestiona con convocatoria, estudiantes habilitados, asistencia, incidencias, resultados y cierre documentado.");

      heading("12.4. Riesgos, resultados esperados y cierre",2,true);
      paragraph("Los riesgos principales comprenden fallas de equipo, conectividad, plataforma o software, interrupciones de infraestructura, inasistencias justificadas, ausencia de responsables, necesidades de accesibilidad, incidentes de integridad académica y emergencias. Cada riesgo debe contar con prevención, acción inmediata, responsable, evidencia y criterio de reprogramación.");
      paragraph("Los resultados esperados son estudiantes correctamente habilitados, cuatro núcleos ejecutados con evidencia, instrumentos académicamente validados, aulas y plataforma probadas, jornadas desarrolladas en condiciones controladas, calificaciones consistentes y registros institucionales completos.");
      paragraph("Después del supletorio, el cierre continúa con la consolidación de resultados, el registro de calificaciones, la verificación de estudiantes sin estado final, el respaldo de evidencias, el cierre de aulas y plataformas y la elaboración del informe final del proceso. Las incidencias y lecciones aprendidas deben convertirse en acciones de mejora para el siguiente período.");
    }
  };
})();
