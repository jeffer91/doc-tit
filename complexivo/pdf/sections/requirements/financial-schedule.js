(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.financialSchedule = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function financialScheduleSection(){
          heading("4.3.1. Cronograma de Pagos del Proceso de Titulación",3,true);
          paragraph("El proceso de titulación contempla pagos escalonados destinados a cubrir los costos administrativos y operativos asociados. La planificación base organiza estas obligaciones por cuotas y momentos de pago, sin establecer en este documento montos específicos.");

          ensureSpace(190);
          tableCaption("Cronograma referencial de pagos del proceso de titulación");
          autoTable({
            startY:api.getY(),
            margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
            head:[["Cuota","Descripción","Momento de pago"]],
            body:[
              ["Primera cuota","Pago inicial para la inscripción en el proceso de titulación","Fecha estipulada en el cronograma"],
              ["Segunda cuota","Cubre costos operativos del segundo mes del proceso","Segundo mes"],
              ["Tercera cuota","Gastos de seguimiento y apoyo académico","Tercer mes"],
              ["Cuarta cuota","Acceso a recursos y servicios institucionales","Cuarto mes"],
              ["Quinta cuota","Pago final para completar las obligaciones financieras","Cierre del proceso de titulación"]
            ],
            columnStyles:{0:{cellWidth:bodyW*0.20},1:{cellWidth:bodyW*0.52},2:{cellWidth:bodyW*0.28}},
            styles:{font:"times",fontSize:9.5,cellPadding:4,textColor:0},
            headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
          });
          tableNote("El cuadro reproduce la estructura del cronograma financiero de la planificación base; los valores y fechas específicas deben sujetarse a la información institucional vigente.");

          paragraph("Cada cuota debe cancelarse dentro de los plazos institucionales aplicables. El cumplimiento financiero forma parte de las verificaciones previas del proceso de titulación.");
        }

      financialScheduleSection();
    }
  };
})();
