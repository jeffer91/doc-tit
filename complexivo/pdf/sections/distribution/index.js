(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.distribution = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
                function distributionTables(){
                  heading("7. Distribución de estudiantes por carrera y lugar de ejecución",1,true);
                  paragraph("La distribución del período se determina a partir de la cantidad de estudiantes registrada por carrera y del lugar previsto para la ejecución del proceso. Los nombres de las carreras se conservan exactamente como constan en el registro institucional.");

                  ensureSpace(190);
                  tableCaption("Distribución de estudiantes por carrera y lugar de ejecución");

                  autoTable({
                    startY:api.getY(),
                    margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
                    head:[["Carrera","Lugar","Cantidad"]],
                    body:(ctx.distribution||[]).map(r=>[r.career,r.place,String(Number(r.count)||0)]),
                    columnStyles:{0:{cellWidth:bodyW*0.68},1:{cellWidth:bodyW*0.20},2:{cellWidth:bodyW*0.12,halign:"right"}},
                    styles:{font:"times",fontSize:10,cellPadding:4,textColor:0},
                    headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
                  });

                  tableNote("Elaboración propia con base en la distribución registrada para el período.");

                  const t=totals(ctx.distribution);
                  const summary=Object.entries(t.byPlace).map(([p,n])=>p+": "+n).join(" · ");
                  paragraph("Resumen de distribución: "+summary+". Total general: "+t.total+" estudiantes.",{indent:false,bold:true,lineHeight:20});
                }
      distributionTables();
      ns.parts.distribution.graphs(api);
    }
  };
})();
