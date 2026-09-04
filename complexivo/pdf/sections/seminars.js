(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.seminars = {
    render(api) {
      const {ctx,heading,paragraph,bullet,insertSectionImage,tableCaption,tableNote,autoTable,BODY,bodyW,formatDateShort} = api;
      const a=ns.config?.areas||{};

      heading("6. Núcleos de Titulación",1,true);
      paragraph("La preparación académica se desarrolla mediante Seminarios de Titulación organizados en cuatro Núcleos de Titulación. Cada núcleo debe contar con docente responsable, guía, material, espacio o recurso institucional y evidencia de ejecución.",{indent:false});
      insertSectionImage("seminarsImage");

      heading("6.1. Objetivo de los Núcleos de Titulación",2,true);
      paragraph("Los núcleos buscan reforzar competencias esenciales, articular conocimientos de diferentes asignaturas y preparar al estudiante para resolver de forma individual situaciones comparables con las que encontrará en el examen. Cada núcleo debe tener un propósito definido, contenidos priorizados, actividad o ejercicio de aplicación, responsable, recursos de apoyo y evidencia de desarrollo.");

      heading("6.2. Organización Académica",2,true);
      const scheduleRows=(ctx.schedule||[])
        .filter(r=>/^Núcleo\s+[1-4]$/i.test(r.activity||""))
        .map(r=>[r.activity,formatDateShort(r.start),formatDateShort(r.end),"Jornada nocturna","Presencial; sesión grabada como recurso de consulta"]);
      if(scheduleRows.length){
        tableCaption("Ventana programada para los cuatro Núcleos de Titulación");
        autoTable({
          startY:api.getY(),
          margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
          head:[["Núcleo","Inicio","Fin","Jornada","Condición general"]],
          body:scheduleRows,
          columnStyles:{0:{cellWidth:bodyW*0.14},1:{cellWidth:bodyW*0.15},2:{cellWidth:bodyW*0.15},3:{cellWidth:bodyW*0.18},4:{cellWidth:bodyW*0.38}},
          styles:{font:"times",fontSize:8.7,cellPadding:4,textColor:0},
          headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
        });
        tableNote("La duración y fechas corresponden al cronograma vigente del período.");
      }
      paragraph("La asignatura de Integración Curricular o Titulación articula los cuatro núcleos y permite ordenar contenidos, docentes, recursos y seguimiento. La designación docente se coordina entre "+(a.coordinacionGeneral||"Coordinación General de Carreras")+", "+(a.carreras||"Coordinaciones de Carrera")+" y "+(a.titulacion||"Titulación y Eficiencia Terminal")+".");

      heading("6.3. Metodología de Desarrollo",2,true);
      bullet("• Activación de conocimientos previos y revisión de conceptos esenciales.");
      bullet("• Resolución guiada de casos, problemas o ejercicios relacionados con el perfil de egreso.");
      bullet("• Práctica individual con tiempos y recursos comparables a los del examen.");
      bullet("• Retroalimentación sobre errores frecuentes y criterios de calidad.");
      bullet("• Disponibilidad de materiales y grabaciones institucionales cuando corresponda.");

      heading("6.4. Asignación y control operativo de los cuatro núcleos",2,true);
      const entered=Array.isArray(ctx.nucleusPlan)?ctx.nucleusPlan:[];
      const byId=new Map(entered.map(r=>[r.id,r]));
      const nucleusRows=[1,2,3,4].map((n,i)=>{
        const row=byId.get(`nucleus${n}`)||{};
        const scheduled=(ctx.schedule||[]).find(s=>String(s.activity||"").toLowerCase()===`núcleo ${n}`.toLowerCase());
        const date=row.date||((scheduled?.start||scheduled?.end)?[formatDateShort(scheduled?.start),formatDateShort(scheduled?.end)].filter(Boolean).join(" – "):"Por definir");
        const val=v=>String(v||"").trim()||"Por definir";
        return [`Núcleo ${n}`,date,val(row.career),val(row.teacher),val(row.guide),val(row.material),val(row.classroom),val(row.evidence)];
      });
      tableCaption("Docentes, recursos y evidencias de los Núcleos de Titulación");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Núcleo","Fecha","Carrera","Docente responsable","Guía entregada","Material cargado","Aula","Evidencia"]],
        body:nucleusRows,
        columnStyles:{0:{cellWidth:bodyW*0.10},1:{cellWidth:bodyW*0.14},2:{cellWidth:bodyW*0.16},3:{cellWidth:bodyW*0.19},4:{cellWidth:bodyW*0.10},5:{cellWidth:bodyW*0.10},6:{cellWidth:bodyW*0.09},7:{cellWidth:bodyW*0.12}},
        styles:{font:"times",fontSize:6.8,cellPadding:2.8,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fontSize:6.6,fillColor:[255,255,255],textColor:0}
      });
      tableNote("Los campos pendientes deben completarse con los datos reales de cada carrera o grupo; no se asignan docentes ni aulas de forma supuesta.");

      heading("6.5. Seguimiento y Evidencias",2,true);
      paragraph("El seguimiento debe permitir comprobar que los cuatro núcleos se desarrollaron dentro de la ventana programada y con los responsables confirmados. Como evidencia pueden utilizarse guía, planificación docente, recursos, registro de participación, grabación, actividad desarrollada, material cargado y reporte de novedades.");
      paragraph("Cualquier criterio de participación o evaluación interna debe aplicarse conforme a la normativa institucional vigente del período y quedar comunicado a los estudiantes antes de su ejecución.");
    }
  };
})();
