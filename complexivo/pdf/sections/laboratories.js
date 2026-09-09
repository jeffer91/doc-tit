(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.laboratories = {
    render(api) {
      const {ctx,heading,paragraph,bullet,tableCaption,tableNote,autoTable,BODY,bodyW,totals,lowerPeriod,joinNatural} = api;
      const a=ns.config?.areas||{};
      const t=totals(ctx.distribution);
      const places=Object.keys(t.byPlace);
      const total=t.total||1;

      heading("8. Tecnología, Infraestructura y Capacidad",1,true);
      paragraph("La infraestructura se planifica a partir de la demanda registrada para el período "+lowerPeriod(ctx.period.name)+". La distribución contempla "+joinNatural(places)+" como lugares de ejecución y permite dimensionar necesidades de espacios, equipos, software, conectividad, accesibilidad y acompañamiento tecnológico, sin asumir capacidades que todavía no hayan sido verificadas.",{indent:false});

      heading("8.1. Demanda por Lugar de Ejecución",2,true);
      paragraph("La siguiente distribución representa la demanda académica prevista. No constituye, por sí sola, una certificación de capacidad instalada. La cantidad de jornadas, espacios, equipos y responsables se formaliza en el cronograma operativo una vez confirmada la disponibilidad institucional.");
      tableCaption("Demanda de estudiantes por lugar de ejecución");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Lugar","Estudiantes planificados","Participación del total","Uso para la planificación"]],
        body:Object.entries(t.byPlace).map(([p,n])=>[
          p,
          String(n),
          ((Number(n)/total)*100).toFixed(1).replace(".0","")+" %",
          "Dimensionamiento de jornadas, espacios, equipos y soporte"
        ]),
        columnStyles:{0:{cellWidth:bodyW*0.18},1:{cellWidth:bodyW*0.19},2:{cellWidth:bodyW*0.19},3:{cellWidth:bodyW*0.44}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La capacidad física y tecnológica se acredita mediante los instrumentos operativos y evidencias de cada jornada, no mediante una estimación automática en esta planificación general.");

      heading("8.2. Equipos, Software y Conectividad",2,true);
      bullet("• Equipo funcional para cada estudiante convocado simultáneamente y unidades de respaldo según disponibilidad institucional.");
      bullet("• Software requerido por la carrera instalado, licenciado y probado antes de la jornada.");
      bullet("• Conectividad suficiente para plataformas, autenticación, entrega y respaldo cuando el instrumento la requiera.");
      bullet("• Restricciones de acceso y recursos configuradas de acuerdo con las condiciones del examen.");
      bullet("• Mecanismo de almacenamiento o recuperación frente a cierres inesperados.");
      paragraph("La verificación técnica se coordina entre "+(a.ti||"Coordinación de Tecnología de la Información")+", "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+", "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+" y "+(a.titulacion||"Titulación y Eficiencia Terminal")+".");

      heading("8.3. Espacios Físicos, Accesibilidad y Continuidad",2,true);
      paragraph("La asignación de espacios físicos corresponde a "+(a.infraestructuraFisica||"Infraestructura Física y Servicios Generales")+" en coordinación con "+(a.titulacion||"Titulación y Eficiencia Terminal")+" y "+(a.coordinacionGeneral||"Coordinación General de Carreras")+". Las necesidades de accesibilidad deben identificarse con anticipación y articularse con "+(a.bienestar||"Bienestar y Seguimiento Estudiantil")+" cuando corresponda.");
      paragraph("Toda jornada debe contar con mecanismos de continuidad frente a fallas previsibles: equipo alterno, recuperación de archivos, registro del tiempo afectado y procedimiento de reprogramación cuando la incidencia impida concluir el examen en condiciones válidas.");

      heading("8.4. Coordinación Tecnológica para la Aplicación",2,true);
      paragraph("La preparación tecnológica debe definir responsables por aula o jornada, canal de atención, escalamiento de incidencias, mecanismo de respaldo y relación con el responsable académico. Estos datos forman parte del cronograma o checklist operativo de la jornada y se confirman antes de su comunicación a los estudiantes.");

      heading("8.5. Preparación de Aulas y Plataforma",2,true);
      paragraph("La preparación digital sigue la secuencia: creación del aula o espacio institucional, asociación de carrera o grupo, configuración de usuarios y permisos, validación de accesos, carga de recursos autorizados y revisión de disponibilidad. La responsabilidad principal corresponde a "+(a.ti||"Coordinación de Tecnología de la Información")+", con participación de "+(a.desarrolloSistemas||"Unidad de Desarrollo de Sistemas")+", "+(a.titulacion||"Titulación y Eficiencia Terminal")+" y "+(a.carreras||"Coordinaciones de Carrera")+".");
      tableCaption("Controles para preparación de aulas y plataforma");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Control","Responsable principal","Evidencia esperada"]],
        body:[
          ["Creación de aula y asociación de grupo",a.ti||"Coordinación de Tecnología de la Información","Aula creada, carrera o grupo asociado"],
          ["Configuración de usuarios y permisos",a.ti||"Coordinación de Tecnología de la Información","Listado de accesos y prueba de ingreso"],
          ["Carga de materiales autorizados",(a.carreras||"Coordinaciones de Carrera")+" / docentes designados","Material cargado, fecha y responsable"],
          ["Revisión de disponibilidad",(a.titulacion||"Titulación y Eficiencia Terminal")+" / "+(a.ti||"Coordinación de Tecnología de la Información"),"Checklist de validación"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.34},1:{cellWidth:bodyW*0.31},2:{cellWidth:bodyW*0.35}},
        styles:{font:"times",fontSize:8.2,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Los controles se documentan con información real de la jornada y constituyen evidencia complementaria de la planificación.");

      heading("8.6. Configuración del Examen Complexivo",2,true);
      paragraph("La configuración comprende la incorporación del banco de preguntas aprobado, la estructura del componente teórico, la configuración del tiempo, la preparación del componente práctico, los permisos, el mecanismo de entrega y los criterios de respaldo. Titulación y Eficiencia Terminal coordina esta actividad con "+(a.ti||"Coordinación de Tecnología de la Información")+" y "+(a.carreras||"Coordinaciones de Carrera")+".");
      bullet("• Confirmar versión del instrumento y banco de preguntas aprobado.");
      bullet("• Configurar tiempo, disponibilidad, intentos y condiciones de acceso según el instrumento institucional.");
      bullet("• Incorporar archivos o instrucciones del componente práctico y comprobar su descarga o apertura.");
      bullet("• Verificar mecanismo de guardado, entrega, cierre y respaldo de evidencias.");

      heading("8.7. Prueba Integral Previa a la Aplicación",2,true);
      paragraph("La prueba integral debe reproducir las condiciones esenciales de la jornada: acceso, identificación, apertura del instrumento, tiempo, visualización de preguntas, descarga o carga de archivos, guardado, entrega, cierre y respaldo. Participan "+(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.ti||"Coordinación de Tecnología de la Información")+", "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+", "+(a.carreras||"Coordinaciones de Carrera")+" y los docentes designados cuando corresponda.");
      paragraph("Toda novedad detectada debe registrarse, asignarse al área correspondiente, corregirse y someterse a una segunda validación antes de habilitar el examen.");

      heading("8.8. Validación y Habilitación Final",2,true);
      paragraph("La habilitación final de cada jornada se realiza después de confirmar aula, usuarios, instrumentos, tiempos, materiales, espacios, equipos, conectividad, responsables y mecanismos de contingencia. La presente planificación general identifica la demanda y el procedimiento; la evidencia de viabilidad queda documentada en el cronograma operativo, checklist técnico y registros de validación emitidos para la ejecución.");
    }
  };
})();
