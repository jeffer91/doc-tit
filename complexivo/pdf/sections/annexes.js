(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.annexes = {
    render(api) {
      const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,totals,joinNatural,policy,formatDateShort} = api;
      const t=totals(ctx.distribution);
      const ev=policy.evaluation||{};
      const schedule=ctx.schedule||[];
      if(!schedule.length && !(ctx.distribution||[]).length) return;

      heading("14. Anexos",1,true);
      paragraph("Los anexos reúnen información disponible del período y formatos de control directamente vinculados con la ejecución del examen complexivo.",{indent:false});

      heading("14.1. Anexo A - Control de Consistencia del Período",2,true);
      const first=schedule.filter(r=>r.start).slice().sort((a,b)=>a.start.localeCompare(b.start))[0];
      const last=schedule.filter(r=>r.end).slice().sort((a,b)=>b.end.localeCompare(a.end))[0];
      tableCaption("Control de consistencia del período");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Validación","Resultado"]],
        body:[
          ["Total de estudiantes",String(t.total)],
          ["Lugares registrados",joinNatural(Object.keys(t.byPlace))],
          ["Número de grupos carrera-modalidad",String((ctx.distribution||[]).length)],
          ["Primera actividad",first?first.activity+" - "+formatDateShort(first.start):"Sin dato"],
          ["Última actividad",last?last.activity+" - "+formatDateShort(last.end):"Sin dato"],
          ["Ponderación",ev.theoreticalWeight+" % + "+ev.practicalWeight+" % = "+(ev.theoreticalWeight+ev.practicalWeight)+" %"],
          ["Nota mínima",ev.minimumGrade+"/"+ev.gradeScale],
          ["Modalidad general","Presencial; virtual solo por excepción autorizada"],
          ["Defensa oral","No aplica como regla general; únicamente cuando exista una condición aprobada para la carrera"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.34},1:{cellWidth:bodyW*0.66}},
        styles:{font:"times",fontSize:9,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Los resultados se sustentan en los datos y criterios vigentes del período.");

      heading("14.2. Anexo B - Lista de Verificación Operativa",2,true);
      tableCaption("Checklist previo a cada jornada de examen");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Control","Estado esperado","Evidencia"]],
        body:[
          ["Listado de estudiantes y responsables","Confirmado","Cronograma o listado de jornada"],
          ["Identidad y habilitación","Verificadas","Registro institucional"],
          ["Espacio y capacidad","Confirmados","Asignación de laboratorio o aula"],
          ["Equipos y software","Probados","Checklist técnico"],
          ["Conectividad y accesos","Probados","Registro de prueba"],
          ["Instrumento y versión","Aprobados","Control de versión"],
          ["Responsables y contingencia","Confirmados","Matriz de responsables y mecanismo de respaldo"],
          ["Entrega y respaldo","Definidos","Ruta o mecanismo de almacenamiento"],
          ["Registro de incidencias","Disponible","Bitácora de jornada"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.35},1:{cellWidth:bodyW*0.25},2:{cellWidth:bodyW*0.40}},
        styles:{font:"times",fontSize:8.8,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Este formato debe completarse con información real de cada jornada y conservarse como evidencia del control previo.");

      heading("14.3. Anexo C - Seguimiento del Plan Operativo",2,true);
      const plan=Array.isArray(ctx.operationalPlan)?ctx.operationalPlan:[];
      if(plan.length){
        tableCaption("Estado de actividades operativas del período");
        autoTable({
          startY:api.getY(),
          margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
          head:[["Actividad","Inicio","Fecha límite","Estado","Persona responsable"]],
          body:plan.map(r=>[r.activity||"",r.start?formatDateShort(r.start):"Por definir",r.deadline?formatDateShort(r.deadline):"Por definir",r.status||"Planificado",r.person||"Por definir"]),
          columnStyles:{0:{cellWidth:bodyW*0.38},1:{cellWidth:bodyW*0.14},2:{cellWidth:bodyW*0.14},3:{cellWidth:bodyW*0.14},4:{cellWidth:bodyW*0.20}},
          styles:{font:"times",fontSize:7.5,cellPadding:3,textColor:0},
          headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
        });
        tableNote("El seguimiento permite verificar qué actividades permanecen planificadas, se encuentran en proceso o han sido completadas.");
      }else{
        paragraph("El seguimiento del plan operativo se incorpora cuando existan actividades registradas para el período.");
      }
    }
  };
})();
