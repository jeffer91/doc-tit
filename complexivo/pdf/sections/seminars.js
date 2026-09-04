(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.seminars = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function seminarsSection(){
          heading("6. Seminarios de Titulación",1,true);

          paragraph(
            "La preparación académica se organiza en cuatro núcleos temáticos. La asignatura de Integración Curricular o Titulación aglutina directamente estos núcleos y articula su desarrollo, seguimiento y evaluación. Los núcleos se desarrollan en jornada nocturna; las sesiones presenciales quedan grabadas para consulta de los estudiantes.",
            {indent:false,after:10}
          );
          insertSectionImage("seminarsImage");

          const nucleusRows=(ctx.schedule||[])
            .filter(r=>/^Núcleo\s+[1-4]$/i.test(r.activity||""))
            .map(r=>{
              const start=new Date(r.start+"T12:00:00");
              const end=new Date(r.end+"T12:00:00");
              const days=(r.start&&r.end)?Math.max(1,Math.round((end-start)/86400000)+1):"";
              return [r.activity,formatDateShort(r.start),formatDateShort(r.end),String(days),"Nocturna · presencial · grabada"];
            });

          if(nucleusRows.length){
            ensureSpace(180);
            tableCaption("Ventana programada para los cuatro núcleos");
            autoTable({
              startY:api.getY(),
              margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
              head:[["Núcleo","Inicio","Fin","Días calendario","Condición"]],
              body:nucleusRows,
              columnStyles:{
                0:{cellWidth:bodyW*0.14},
                1:{cellWidth:bodyW*0.16},
                2:{cellWidth:bodyW*0.16},
                3:{cellWidth:bodyW*0.16,halign:"center"},
                4:{cellWidth:bodyW*0.38}
              },
              styles:{font:"times",fontSize:9,cellPadding:4,textColor:0},
              headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
            });
            tableNote("La duración operativa de cada núcleo se rige exclusivamente por la ventana definida en el cronograma del período.");
          }

          heading("6.1. Organización Académica",2,true);
          paragraph("Los contenidos de cada núcleo se definen de acuerdo con las competencias y áreas prioritarias de las carreras. La preparación busca reforzar conocimientos y familiarizar al estudiante con la lógica de resolución individual que se utilizará en el examen.");
        }

      seminarsSection();
    }
  };
})();
