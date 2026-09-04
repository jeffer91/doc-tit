(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.distribution = {
    render(api) {
      const {ctx,heading,paragraph,tableCaption,tableNote,autoTable,BODY,bodyW,totals,joinNatural} = api;
      const rows=(ctx.distribution||[]).filter(r=>r.career&&r.place&&Number(r.count)>=0);
      const t=totals(rows);

      heading("7. Distribución de Estudiantes por Carrera y Lugar de Ejecución",1,true);
      paragraph("La distribución se obtiene directamente del registro vigente del período. Los nombres de las carreras se conservan exactamente como constan en la fuente institucional, incluida la modalidad cuando forma parte del nombre registrado.",{indent:false});

      tableCaption("Distribución de estudiantes por carrera y lugar de ejecución");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Carrera","Lugar","Cantidad"]],
        body:rows.map(r=>[r.career,r.place,String(Number(r.count)||0)]),
        columnStyles:{0:{cellWidth:bodyW*0.68},1:{cellWidth:bodyW*0.20},2:{cellWidth:bodyW*0.12,halign:"right"}},
        styles:{font:"times",fontSize:9.3,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Elaboración propia con base en la distribución registrada para el período.");

      heading("7.1. Lectura Analítica y Gráfica de la Distribución",2,true);
      paragraph("El período registra "+t.total+" estudiantes distribuidos en "+joinNatural(Object.entries(t.byPlace).map(([p,n])=>p+" ("+n+")"))+". La lectura por lugar permite dimensionar la demanda de espacios, equipos, soporte y número de jornadas sin introducir capacidades que no hayan sido verificadas.");
      const top=rows.slice().sort((a,b)=>Number(b.count)-Number(a.count)).slice(0,5);
      if(top.length){
        paragraph("Los grupos con mayor concentración son "+joinNatural(top.map(r=>r.career+" ("+Number(r.count)+" estudiantes)"))+". Esta concentración debe considerarse al distribuir horarios y recursos, evitando que el tamaño del grupo exceda la capacidad operativa asignada.");
      }

      heading("7.2. Criterios de Demanda Logística",2,true);
      paragraph("La demanda logística se analiza utilizando exactamente el mismo dataset que alimenta la tabla y los gráficos. Toda sede o lugar presente en la distribución debe aparecer también en la planificación de espacios y soporte.");
      paragraph("Cuando un grupo combine una carrera con una modalidad académica específica, la denominación se conserva sin intentar unificarla automáticamente. La modalidad académica tampoco cambia por sí sola la regla presencial de aplicación del examen.");

      ns.parts.distribution.graphs(api);
    }
  };
})();
