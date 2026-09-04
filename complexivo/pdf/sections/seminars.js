(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.seminars = {
    render(api) {
      const {ctx,heading,paragraph,bullet,insertSectionImage,tableCaption,tableNote,autoTable,BODY,bodyW,formatDateShort,policy} = api;

      heading("6. Núcleos de Titulación",1,true);
      paragraph(
        "La preparación se desarrolla mediante Seminarios de Titulación organizados en cuatro núcleos. A partir de esta definición inicial, el documento utiliza el término maestro «Núcleos de Titulación» para evitar alternancias terminológicas.",
        {indent:false}
      );
      insertSectionImage("seminarsImage");

      heading("6.1. Objetivo de los Núcleos de Titulación",2,true);
      paragraph("Los núcleos buscan reforzar competencias esenciales, articular conocimientos de diferentes asignaturas y preparar al estudiante para resolver de forma individual situaciones comparables con las que encontrará en el examen. No sustituyen la formación de la carrera ni deben convertirse en entrenamiento memorístico de respuestas.");
      paragraph("Cada núcleo debe tener un propósito definido, contenidos priorizados, actividad o ejercicio de aplicación, responsable, recursos de apoyo y evidencia de desarrollo.");

      heading("6.2. Organización Académica",2,true);
      const nucleusRows=(ctx.schedule||[])
        .filter(r=>/^Núcleo\s+[1-4]$/i.test(r.activity||""))
        .map(r=>[r.activity,formatDateShort(r.start),formatDateShort(r.end),"Jornada nocturna","Presencial; sesión grabada como recurso de consulta"]);
      if(nucleusRows.length){
        tableCaption("Ventana programada para los cuatro Núcleos de Titulación");
        autoTable({
          startY:api.getY(),
          margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
          head:[["Núcleo","Inicio","Fin","Jornada","Condición general"]],
          body:nucleusRows,
          columnStyles:{0:{cellWidth:bodyW*0.14},1:{cellWidth:bodyW*0.15},2:{cellWidth:bodyW*0.15},3:{cellWidth:bodyW*0.18},4:{cellWidth:bodyW*0.38}},
          styles:{font:"times",fontSize:8.7,cellPadding:4,textColor:0},
          headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
        });
        tableNote("La duración y fechas se obtienen exclusivamente del cronograma vigente del período.");
      }
      paragraph("La asignatura de Integración Curricular o Titulación articula los cuatro núcleos y permite ordenar contenidos, docentes, recursos y seguimiento. Cuando una carrera requiera una adaptación, esta debe conservar el objetivo del núcleo y quedar documentada.");

      heading("6.3. Metodología de Desarrollo",2,true);
      bullet("• Activación de conocimientos previos y revisión de conceptos esenciales.");
      bullet("• Resolución guiada de casos, problemas o ejercicios relacionados con el perfil de egreso.");
      bullet("• Práctica individual con tiempos y recursos comparables a los del examen.");
      bullet("• Retroalimentación sobre errores frecuentes y criterios de calidad.");
      bullet("• Disponibilidad de materiales y grabaciones institucionales cuando corresponda.");

      heading("6.4. Seguimiento y Evidencias",2,true);
      paragraph("El seguimiento debe permitir comprobar que los cuatro núcleos se desarrollaron dentro de la ventana programada. Como evidencia pueden utilizarse planificación docente, recursos, registro de participación, grabación, actividad desarrollada y reporte de novedades.");
      paragraph("La participación en los núcleos y cualquier forma de evaluación interna deben manejarse conforme a la regla institucional vigente. El generador no recupera automáticamente condiciones antiguas de aprobación por componente o requisitos que no estén configurados para el período.");
    }
  };
})();
