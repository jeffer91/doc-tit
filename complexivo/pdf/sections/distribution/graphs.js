(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.parts = ns.parts || {};
  ns.parts.distribution = ns.parts.distribution || {};
  ns.parts.distribution.graphs = function(api) {
    const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
    function graphsSection(){
      const rows=(ctx.distribution||[]).filter(r=>r.career && r.place && Number(r.count)>=0);
      if(!rows.length) return;

      heading("7.1. Lectura gráfica de la distribución",2,true);

      const byPlace={};
      rows.forEach(r=>{
        const n=Number(r.count)||0;
        byPlace[r.place]=(byPlace[r.place]||0)+n;
      });

      drawVerticalBars(
        Object.entries(byPlace).map(([label,value])=>({label,value})),
        "Estudiantes por lugar de ejecución"
      );

      const groups=rows
        .slice()
        .sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0))
        .map(r=>({label:r.career,value:Number(r.count)||0}));
      drawGroupBars(groups,"Estudiantes por grupo carrera-modalidad");

      drawTimeline(ctx.schedule||[],"Cronograma general del proceso de examen complexivo");
    }
    graphsSection();
  };
})();
