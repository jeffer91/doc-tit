(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.annexes = {
    render(api) {
      const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,totals,joinNatural,policy,formatDateShort} = api;
      const t=totals(ctx.distribution);
      const ev=policy.evaluation||{};
      const schedule=(ctx.schedule||[]).filter(r=>r && (r.activity||r.start||r.end));
      const distribution=(ctx.distribution||[]).filter(r=>r && (r.career||r.place||Number(r.count)>0));
      if(!schedule.length && !distribution.length) return;

      heading("14. Anexos",1,true);
      paragraph("Los anexos se presentan como instrumentos operativos de control. Solo incorporan información disponible del período y evitan campos ficticios o valores pendientes de definición.",{indent:false});

      const first=schedule.filter(r=>r.start).slice().sort((a,b)=>a.start.localeCompare(b.start))[0];
      const last=schedule.filter(r=>r.end).slice().sort((a,b)=>b.end.localeCompare(a.end))[0];
      const consistencyRows=[
        t.total>0 ? ["Total de estudiantes",String(t.total),"[ ] Verificado",""] : null,
        Object.keys(t.byPlace).length ? ["Lugares registrados",joinNatural(Object.keys(t.byPlace)),"[ ] Verificado",""] : null,
        distribution.length ? ["Grupos carrera-modalidad",String(distribution.length),"[ ] Verificado",""] : null,
        first ? ["Primera actividad",first.activity+" - "+formatDateShort(first.start),"[ ] Verificado",""] : null,
        last ? ["Última actividad",last.activity+" - "+formatDateShort(last.end),"[ ] Verificado",""] : null,
        Number.isFinite(Number(ev.theoreticalWeight)) && Number.isFinite(Number(ev.practicalWeight)) ? ["Ponderación",ev.theoreticalWeight+" % + "+ev.practicalWeight+" % = "+(Number(ev.theoreticalWeight)+Number(ev.practicalWeight))+" %","[ ] Verificado",""] : null,
        ev.minimumGrade!=null && ev.gradeScale!=null ? ["Nota mínima",ev.minimumGrade+"/"+ev.gradeScale,"[ ] Verificado",""] : null,
        ["Modalidad general","Presencial; virtual solo mediante excepción autorizada","[ ] Verificado",""]
      ].filter(Boolean);

      if(consistencyRows.length){
        heading("14.1. Anexo A - Control de Consistencia del Período",2,true);
        tableCaption("Ficha de control de consistencia del período");
        autoTable({
          institutionalGrid:true,
          rowPageBreak:"avoid",
          tableWidth:bodyW,
          startY:api.getY(),
          margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
          head:[["Campo de control","Valor registrado","Validación","Observaciones"]],
          body:consistencyRows,
          columnStyles:{0:{cellWidth:bodyW*0.25},1:{cellWidth:bodyW*0.38},2:{cellWidth:bodyW*0.17},3:{cellWidth:bodyW*0.20}},
          styles:{font:"times",fontSize:8.4,cellPadding:4,textColor:0,valign:"middle"},
          headStyles:{font:"times",fontStyle:"bold",fontSize:8.4,fillColor:[242,242,242],textColor:0}
        });
        tableNote("La ficha debe validarse antes de emitir la planificación definitiva.");
      }

      heading("14.2. Anexo B - Lista de Verificación Operativa",2,true);
      tableCaption("Lista de verificación previa a cada jornada de examen");
      const checklist=[
        ["Listado de estudiantes y responsables","[ ] Sí   [ ] No   [ ] Observado","","Cronograma o listado de jornada",""] ,
        ["Identidad y habilitación","[ ] Sí   [ ] No   [ ] Observado","","Registro institucional",""] ,
        ["Espacio y capacidad","[ ] Sí   [ ] No   [ ] Observado","","Asignación de laboratorio o aula",""] ,
        ["Equipos y software","[ ] Sí   [ ] No   [ ] Observado","","Checklist técnico",""] ,
        ["Conectividad y accesos","[ ] Sí   [ ] No   [ ] Observado","","Registro de prueba",""] ,
        ["Instrumento y versión","[ ] Sí   [ ] No   [ ] Observado","","Control de versión",""] ,
        ["Responsables y contingencia","[ ] Sí   [ ] No   [ ] Observado","","Matriz de responsables",""] ,
        ["Entrega y respaldo","[ ] Sí   [ ] No   [ ] Observado","","Ruta o mecanismo de almacenamiento",""] ,
        ["Registro de incidencias","[ ] Sí   [ ] No   [ ] Observado","","Bitácora de jornada",""]
      ];
      autoTable({
        institutionalGrid:true,
        rowPageBreak:"avoid",
        tableWidth:bodyW,
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Control","Cumplimiento","Responsable","Evidencia","Observaciones"]],
        body:checklist,
        columnStyles:{0:{cellWidth:bodyW*0.25},1:{cellWidth:bodyW*0.20},2:{cellWidth:bodyW*0.16},3:{cellWidth:bodyW*0.23},4:{cellWidth:bodyW*0.16}},
        styles:{font:"times",fontSize:7.8,cellPadding:3.5,textColor:0,valign:"middle"},
        headStyles:{font:"times",fontStyle:"bold",fontSize:7.8,fillColor:[242,242,242],textColor:0}
      });
      tableNote("Este instrumento se completa con datos reales de la jornada y se conserva como evidencia de control.");

      const plan=(Array.isArray(ctx.operationalPlan)?ctx.operationalPlan:[]).filter(r=>{
        if(!r) return false;
        return [r.start,r.deadline,r.actualDate,r.person,r.status,r.observations,r.evidence].some(v=>String(v||"").trim());
      });
      if(plan.length){
        heading("14.3. Anexo C - Seguimiento del Plan Operativo",2,true);
        tableCaption("Formato de seguimiento de actividades operativas");
        autoTable({
          institutionalGrid:true,
          rowPageBreak:"avoid",
          tableWidth:bodyW,
          startY:api.getY(),
          margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
          head:[["Actividad","Fecha prevista","Fecha ejecutada","Responsable / Estado","Evidencia / Observaciones"]],
          body:plan.map(r=>[
            r.activity||"",
            r.deadline?formatDateShort(r.deadline):(r.start?formatDateShort(r.start):""),
            r.actualDate?formatDateShort(r.actualDate):"",
            [r.person,r.status].filter(Boolean).join("\n"),
            [r.evidence,r.observations].filter(Boolean).join("\n")
          ]),
          columnStyles:{0:{cellWidth:bodyW*0.28},1:{cellWidth:bodyW*0.14},2:{cellWidth:bodyW*0.14},3:{cellWidth:bodyW*0.20},4:{cellWidth:bodyW*0.24}},
          styles:{font:"times",fontSize:7.8,cellPadding:3.5,textColor:0,valign:"top"},
          headStyles:{font:"times",fontStyle:"bold",fontSize:7.8,fillColor:[242,242,242],textColor:0}
        });
        tableNote("No se imprimen actividades sin información real de seguimiento.");
      }
    }
  };
})();
