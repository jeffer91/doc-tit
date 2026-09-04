(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.generalSummary = {
    render(api) {
      const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,totals,joinNatural,policy} = api;
      const t=totals(ctx.distribution);
      const ev=policy.evaluation||{};

      heading("12. Resumen General",1,true);
      paragraph("El resumen general integra los principales criterios operativos de la planificación y funciona como referencia de cierre. No sustituye los capítulos anteriores ni introduce reglas nuevas.",{indent:false});

      tableCaption("Resumen integral del proceso");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Dimensión","Regla o condición vigente"]],
        body:[
          ["Período",ctx.period.name],
          ["Población",t.total+" estudiantes"],
          ["Lugares",joinNatural(Object.keys(t.byPlace))],
          ["Preparación","Cuatro Núcleos de Titulación articulados con Integración Curricular o Titulación"],
          ["Modalidad","Presencial como regla general; virtual únicamente mediante excepción autorizada"],
          ["Evaluación","Teórico "+ev.theoreticalWeight+" % + práctico "+ev.practicalWeight+" % = 100 %"],
          ["Aprobación","Nota mínima "+ev.minimumGrade+"/"+ev.gradeScale+" según configuración institucional"],
          ["Defensa oral","No es regla general; solo por excepción expresa de una carrera"],
          ["Imponderables","Matriz de riesgos, evidencia de incidencias y criterio de reprogramación"],
          ["Inclusión","Accesibilidad y ajustes autorizados sin alterar injustificadamente criterios académicos"],
          ["Cierre","Registro, archivo de evidencias, informe final y acciones de mejora"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.24},1:{cellWidth:bodyW*0.76}},
        styles:{font:"times",fontSize:9,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Todas las cifras y reglas del resumen provienen de las mismas fuentes utilizadas en el resto del documento.");
      paragraph("La planificación debe actualizarse cuando cambien las fechas, la población, las sedes, la ponderación, la nota mínima, la modalidad, los responsables o la normativa aplicable. El uso de una única fuente de verdad evita contradicciones entre capítulos.");
    }
  };
})();
