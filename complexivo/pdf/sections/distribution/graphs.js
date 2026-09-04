(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.parts = ns.parts || {};
  ns.parts.distribution = ns.parts.distribution || {};

  ns.parts.distribution.graphs = function(api) {
    const {ctx,drawVerticalBars,drawGroupBars} = api;
    const rows=(ctx.distribution||[]).filter(r=>r.career && r.place && Number(r.count)>=0);
    if(!rows.length) return;

    const byPlace={};
    rows.forEach(r=>{
      const n=Number(r.count)||0;
      byPlace[r.place]=(byPlace[r.place]||0)+n;
    });

    drawVerticalBars(
      Object.entries(byPlace).map(([label,value])=>({label,value})),
      "Demanda de estudiantes por lugar de ejecución"
    );

    const groups=rows
      .slice()
      .sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0))
      .slice(0,12)
      .map(r=>({label:r.career,value:Number(r.count)||0}));
    drawGroupBars(groups,"Grupos con mayor demanda de capacidad operativa");
  };
})();
