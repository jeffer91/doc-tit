(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.parts = ns.parts || {};
  ns.parts.methodology = ns.parts.methodology || {};
  ns.parts.methodology.schedule = function(api) {
    const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
    function scheduleTable(){
      heading("3.10. Cronogramas",2,true);
      paragraph("El cronograma general organiza las fechas de las principales fases del examen complexivo y constituye la referencia temporal para los documentos operativos complementarios.");

      ensureSpace(190);
      tableCaption("Cronograma general del proceso de examen complexivo");

      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Actividad","Fecha inicio","Fecha fin"]],
        body:(ctx.schedule||[]).map(r=>[r.activity,formatDateShort(r.start),formatDateShort(r.end)]),
        styles:{font:"times",fontSize:10,cellPadding:5,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });

      tableNote("Elaboración propia con base en la planificación académica del período.");
      paragraph("Los cronogramas complementarios de desarrollo de núcleos y de rendición del examen detallarán, cuando corresponda, la distribución por carrera, lugar, fecha, hora, laboratorio y responsables, sin sustituir la planificación general del período.");
    }
    scheduleTable();
  };
})();
