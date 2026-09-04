(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.parts = ns.parts || {};
  ns.parts.methodology = ns.parts.methodology || {};
  ns.parts.methodology.schedule = function(api) {
    const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,formatDateShort,drawTimeline} = api;

    heading("3.10. Cronogramas",2,true);
    paragraph("La planificación distingue tres niveles: cronograma general del proceso, cronograma operativo de los cuatro Núcleos de Titulación y cronograma específico de aplicación del examen. El primero fija ventanas institucionales; los dos restantes desarrollan horarios, grupos, espacios, responsables y recursos sin sustituir la planificación general.");

    tableCaption("Cronograma general del proceso de examen complexivo");
    autoTable({
      startY:api.getY(),
      margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
      head:[["Actividad","Fecha inicio","Fecha fin"]],
      body:(ctx.schedule||[]).map(r=>[r.activity,formatDateShort(r.start),formatDateShort(r.end)]),
      styles:{font:"times",fontSize:9.5,cellPadding:5,textColor:0},
      headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
    });
    tableNote("Elaboración propia con base en las fechas vigentes registradas para el período.");

    const post=(ctx.schedule||[]).filter(r=>r.end&&ctx.period?.end&&r.end>ctx.period.end);
    if(post.length){
      paragraph("Aclaración temporal: el período académico finaliza el "+formatDateShort(ctx.period.end)+", mientras que determinadas actividades de cierre y titulación se ejecutan posteriormente según el cronograma. Estas fechas posteriores corresponden a la culminación operativa del proceso y no modifican la denominación del período académico.",{indent:false,bold:true});
    }

    paragraph("El cronograma de Núcleos de Titulación debe precisar, como mínimo, núcleo, carrera o grupo, docente, fecha, horario, modalidad autorizada, recurso o enlace institucional cuando corresponda y evidencia de desarrollo. El cronograma de examen debe precisar carrera, grupo, lugar, laboratorio o espacio, fecha, hora, responsable de jornada y soporte.");
    drawTimeline(ctx.schedule||[],"Secuencia temporal del proceso de titulación");
  };
})();
