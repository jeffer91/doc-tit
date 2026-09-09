(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.seminars = {
    render(api) {
      const {ctx,heading,paragraph,bullet,insertSectionImage,tableCaption,tableNote,autoTable,BODY,bodyW,formatDateShort} = api;
      const a=ns.config?.areas||{};

      heading("6. Núcleos de Titulación",1,true);
      paragraph("La preparación académica se desarrolla mediante Seminarios de Titulación organizados en cuatro Núcleos de Titulación. El presente documento establece su planificación general; la asignación específica por carrera, docente, aula, recurso y evidencia se formaliza mediante el instrumento operativo correspondiente cuando los datos han sido confirmados.",{indent:false});
      insertSectionImage("seminarsImage");

      heading("6.1. Objetivo de los Núcleos de Titulación",2,true);
      paragraph("Los núcleos buscan reforzar competencias esenciales, articular conocimientos de diferentes asignaturas y preparar al estudiante para resolver de forma individual situaciones comparables con las que encontrará en el examen. Cada núcleo debe contar con propósito definido, contenidos priorizados, actividad o ejercicio de aplicación, recursos de apoyo y evidencia de desarrollo.");

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
        tableNote("Las fechas corresponden al cronograma general vigente del período.");
      }
      paragraph("La asignatura de Integración Curricular o Titulación articula los cuatro núcleos y permite ordenar contenidos, docentes, recursos y seguimiento. La designación docente se coordina entre "+(a.coordinacionGeneral||"Coordinación General de Carreras")+", "+(a.carreras||"Coordinaciones de Carrera")+" y "+(a.titulacion||"Titulación y Eficiencia Terminal")+".");

      heading("6.3. Metodología de Desarrollo",2,true);
      bullet("• Activación de conocimientos previos y revisión de conceptos esenciales.");
      bullet("• Resolución guiada de casos, problemas o ejercicios relacionados con el perfil de egreso.");
      bullet("• Práctica individual con tiempos y recursos comparables a los del examen.");
      bullet("• Retroalimentación sobre errores frecuentes y criterios de calidad.");
      bullet("• Disponibilidad de materiales y grabaciones institucionales cuando corresponda.");

      heading("6.4. Formalización Operativa de los Núcleos",2,true);
      paragraph("La planificación específica de cada carrera o grupo se consolida fuera del cuerpo principal de esta planificación. El instrumento operativo debe identificar, según corresponda, carrera o grupo, núcleo, docente responsable, fecha y hora, aula o recurso, guía, material y evidencia de ejecución.");
      paragraph("La cantidad de registros operativos depende de la distribución real del período. Por esta razón, no se resume la asignación de todos los grupos en cuatro filas genéricas ni se imprimen campos sin información confirmada.");
      paragraph("Una vez formalizada por las áreas responsables, esta información puede conservarse como anexo o cronograma operativo complementario del período, sin alterar las fechas generales establecidas en este documento.");

      heading("6.5. Seguimiento y Evidencias",2,true);
      paragraph("El seguimiento debe permitir comprobar que los cuatro núcleos se desarrollaron dentro de la ventana programada y con los responsables confirmados. Como evidencia pueden utilizarse guía, planificación docente, recursos, registro de participación, grabación, actividad desarrollada, material cargado y reporte de novedades.");
      paragraph("Cualquier criterio de participación o evaluación interna debe aplicarse conforme a la normativa institucional vigente del período y quedar comunicado a los estudiantes antes de su ejecución.");
    }
  };
})();
