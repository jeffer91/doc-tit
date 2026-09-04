(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.imponderables = {
    render(api) {
      const {heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW} = api;
      const a=ns.config?.areas||{};

      heading("9. Imponderables y Contingencias",1,true);
      paragraph("La gestión de imponderables identifica riesgos previsibles, define medidas preventivas y establece respuestas mínimas que permitan mantener continuidad, equidad y trazabilidad. La reprogramación requiere que la incidencia impida ejecutar o concluir válidamente la actividad.",{indent:false});

      tableCaption("Matriz de riesgos e imponderables del proceso");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Riesgo","Causa","Prob.","Impacto","Prevención","Acción inmediata","Responsable","Evidencia","Criterio de reprogramación"]],
        body:[
          ["Falla de equipo","Daño o bloqueo del computador","Media","Alta","Prueba previa y equipo de respaldo","Cambiar de equipo y recuperar evidencia",a.soporteTecnologico||"Infraestructura y Soporte Tecnológico","Bitácora técnica","Reprogramar solo si no existe continuidad válida"],
          ["Falla de conectividad","Interrupción de red o servicio","Media","Alta","Prueba de red y alternativa de conexión","Activar respaldo y documentar tiempo afectado",a.soporteTecnologico||"Infraestructura y Soporte Tecnológico","Registro de incidencia","Si la plataforma o entrega no puede restablecerse"],
          ["Falla de plataforma o software","Error de acceso, licencia o aplicación","Media","Alta","Validación de versión, cuentas y licencias","Aplicar alternativa aprobada o restaurar servicio",(a.ti||"Coordinación de Tecnología de la Información")+" / "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas"),"Captura, bitácora o registro de servicio","Si el instrumento no puede ejecutarse íntegramente"],
          ["Interrupción eléctrica o de infraestructura","Corte de energía o indisponibilidad del espacio","Baja","Alta","Revisión de infraestructura y contingencia","Proteger evidencias y trasladar o suspender controladamente",a.infraestructuraFisica||"Infraestructura Física y Servicios Generales","Reporte institucional","Cuando no sea posible restablecer condiciones seguras"],
          ["Inasistencia justificada del estudiante","Situación personal debidamente respaldada","Media","Media","Comunicar reglas y plazos","Recibir justificación y aplicar procedimiento vigente",(a.titulacion||"Titulación y Eficiencia Terminal")+" / "+(a.bienestar||"Bienestar y Seguimiento Estudiantil"),"Solicitud y respaldo","Según autorización institucional"],
          ["Ausencia de responsable","Imprevisto del docente o personal asignado","Baja","Media","Designar suplencia o reemplazo","Activar responsable alterno",a.coordinacionGeneral||"Coordinación General de Carreras","Registro de sustitución","Si no existe reemplazo que garantice la jornada"],
          ["Necesidad de accesibilidad no prevista","Requerimiento de apoyo o adecuación","Baja","Alta","Identificación anticipada","Aplicar ajuste autorizado y documentado",(a.bienestar||"Bienestar y Seguimiento Estudiantil")+" / "+(a.titulacion||"Titulación y Eficiencia Terminal"),"Registro de ajuste","Si no puede garantizarse participación en condiciones válidas"],
          ["Incidente de integridad académica","Copia, suplantación o uso no autorizado","Baja","Alta","Socialización, identificación y supervisión","Preservar evidencia y activar procedimiento institucional","Responsable de jornada / "+(a.carreras||"Coordinaciones de Carrera"),"Informe de incidente","Solo conforme a decisión institucional aplicable"],
          ["Emergencia o seguridad","Evento que compromete integridad de participantes","Baja","Alta","Protocolos institucionales y rutas de atención","Priorizar seguridad y suspender controladamente",a.infraestructuraFisica||"Infraestructura Física y Servicios Generales","Reporte de emergencia","Cuando la continuidad ponga en riesgo a los participantes"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.11},1:{cellWidth:bodyW*0.10},2:{cellWidth:bodyW*0.06},3:{cellWidth:bodyW*0.06},4:{cellWidth:bodyW*0.13},5:{cellWidth:bodyW*0.15},6:{cellWidth:bodyW*0.11},7:{cellWidth:bodyW*0.11},8:{cellWidth:bodyW*0.17}},
        styles:{font:"times",fontSize:6.2,cellPadding:2.5,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fontSize:6.1,fillColor:[255,255,255],textColor:0}
      });
      tableNote("La probabilidad e impacto son criterios de planificación general y deben ajustarse cuando exista evidencia específica del período.");

      heading("9.1. Registro y Escalamiento de Incidencias",2,true);
      paragraph("Toda incidencia relevante debe registrar fecha, jornada, estudiante o grupo afectado, descripción objetiva, responsable que atendió, acción aplicada, tiempo de interrupción y decisión final. Esta información alimenta el informe de cierre y la mejora continua.");
      paragraph("Cuando la incidencia supere la capacidad del responsable de jornada, debe escalarse a Titulación y Eficiencia Terminal y al área institucional competente según su naturaleza, sin improvisar reglas académicas, financieras o disciplinarias.");
    }
  };
})();
