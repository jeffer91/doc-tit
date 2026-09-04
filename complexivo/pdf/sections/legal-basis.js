(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.legalBasis = {
    render(api) {
      const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,lowerPeriod,policy} = api;

      heading("2. Base Legal",1,true);
      paragraph("La planificación del examen complexivo para el período "+lowerPeriod(ctx.period.name)+" se sustenta en la normativa nacional de educación superior y en la regulación institucional vigente aplicable a titulación. El marco jurídico debe mantenerse verificable, actualizado y vinculado con las decisiones académicas y operativas del proceso.",{indent:false});

      heading("2.1. Marco normativo aplicable",2,true);
      paragraph("La Constitución de la República del Ecuador constituye el marco superior de referencia para los principios de educación, calidad, igualdad de oportunidades y formación integral. La Ley Orgánica de Educación Superior regula derechos, responsabilidades institucionales, egreso y titulación. El Reglamento a la LOES complementa aspectos de información, registro y gestión académica.");
      paragraph("En el ámbito institucional, el Reglamento del Área de Titulación y las disposiciones internas vigentes determinan la forma en que se verifican requisitos, se ejecuta la modalidad de titulación, se califican resultados, se atienden incidencias y se registra el cierre. Cualquier actualización normativa debe revisarse antes de emitir una nueva planificación.");

      heading("2.2. Matriz de aplicación normativa",2,true);
      tableCaption("Normativa y aplicación dentro de la planificación");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Norma","Artículo / disposición de referencia","Aplicación dentro de esta planificación"]],
        body:(policy.legalReferences||[]).map(r=>[r.norm,r.provision,r.application]),
        columnStyles:{0:{cellWidth:bodyW*0.27},1:{cellWidth:bodyW*0.33},2:{cellWidth:bodyW*0.40}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La matriz identifica el nivel normativo y su función operativa. La numeración de artículos debe incorporarse únicamente cuando exista una revisión jurídica o institucional vigente que la confirme.");

      heading("2.3. Criterio de actualización normativa",2,true);
      paragraph("Antes de reutilizar la planificación en un nuevo período, Titulación y Eficiencia Terminal debe revisar, con las instancias institucionales que correspondan, si existieron reformas legales, reglamentarias o internas que modifiquen requisitos, modalidades, reglas de evaluación, registros o autoridades competentes. La planificación debe conservar la profundidad del marco legal sin reproducir disposiciones obsoletas.");
    }
  };
})();
