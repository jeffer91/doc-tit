(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.legalBasis = {
    render(api) {
      const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,lowerPeriod,policy} = api;

      heading("2. Base Legal",1,true);
      paragraph("La planificación del examen complexivo para el período "+lowerPeriod(ctx.period.name)+" se sustenta en la normativa nacional de educación superior y en la regulación institucional vigente aplicable a titulación. Estas disposiciones orientan la verificación de requisitos, la organización académica y operativa, la evaluación, el registro de resultados y el cierre del proceso.",{indent:false});

      heading("2.1. Marco normativo aplicable",2,true);
      paragraph("La Constitución de la República del Ecuador constituye el marco superior de referencia para los principios de educación, calidad, igualdad de oportunidades y formación integral. La Ley Orgánica de Educación Superior regula derechos, responsabilidades institucionales, egreso y titulación. El Reglamento a la LOES complementa aspectos vinculados con información, registro y gestión académica.");
      paragraph("En el ámbito institucional, el Reglamento de la Unidad de Titulación y Eficiencia Terminal (UTET-REG-25, versión 2.0), aprobado por el OCS el 27 de marzo de 2025 mediante Resolución N.° ITSQMET-OCS-2025-03-02/27-MAR-2025, determina la forma de verificar requisitos, ejecutar las modalidades de titulación, aplicar criterios de evaluación, atender incidencias y registrar el cierre del proceso.");

      heading("2.2. Matriz de aplicación normativa",2,true);
      tableCaption("Normativa y aplicación dentro de la planificación");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Norma","Disposición de referencia","Aplicación dentro de esta planificación"]],
        body:(policy.legalReferences||[]).map(r=>[r.norm,r.provision,r.application]),
        columnStyles:{0:{cellWidth:bodyW*0.27},1:{cellWidth:bodyW*0.33},2:{cellWidth:bodyW*0.40}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Las normas se aplican en su versión vigente para el período académico objeto de esta planificación.");

      heading("2.3. Aplicación Institucional del Marco Normativo",2,true);
      paragraph("Las áreas que intervienen en el proceso deben aplicar de forma coordinada las disposiciones vigentes relacionadas con requisitos, modalidad, evaluación, registro, custodia de evidencias y cierre. Cuando una disposición interna complemente el marco general, su aplicación debe conservar trazabilidad documental y coherencia con la normativa de educación superior.");
      paragraph("La presente planificación no reproduce extensamente el articulado normativo; identifica el marco que sustenta las decisiones académicas y operativas del período y remite a los instrumentos institucionales vigentes para su ejecución.");
    }
  };
})();
