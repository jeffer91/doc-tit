(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.evaluation = {
    render(api) {
      const {heading,paragraph,insertSectionImage,tableCaption,tableNote,autoTable,BODY,bodyW,policy} = api;
      const a=ns.config?.areas||{};
      const ev=policy.evaluation||{};

      heading("10. Criterios de Evaluación",1,true);
      paragraph("Este capítulo regula cómo se valora, calcula, valida y registra el resultado del examen complexivo. La descripción de la estructura y condiciones de aplicación se desarrolla en el capítulo 5 para evitar duplicaciones.",{indent:false});
      insertSectionImage("evaluationImage");

      heading("10.1. Principios de Calificación",2,true);
      paragraph("La calificación debe aplicar criterios previamente definidos, consistentes con el instrumento utilizado y suficientemente claros para justificar el resultado. Los criterios deben permitir distinguir calidad técnica, precisión, aplicación de conocimientos, análisis y cumplimiento de requerimientos.");
      paragraph("La evidencia de evaluación debe conservar relación con el estudiante, el instrumento o versión aplicada y el resultado registrado institucionalmente.");

      heading("10.2. Componente Teórico",2,true);
      paragraph("El componente teórico representa el "+ev.theoreticalWeight+" % de la nota final. Su resultado se obtiene de las respuestas registradas individualmente y se transforma a la escala institucional correspondiente antes de aplicar la ponderación.");

      heading("10.3. Componente Práctico",2,true);
      paragraph("El componente práctico representa el "+ev.practicalWeight+" % de la nota final. La valoración utiliza criterios apropiados a la actividad de cada carrera, manteniendo como ejes comunes la aplicación pertinente de conocimientos, la calidad o exactitud técnica, la resolución del problema y el cumplimiento del producto solicitado.");
      paragraph("La defensa oral no constituye una condición general del examen complexivo. Únicamente se incorpora cuando exista una condición aprobada para la carrera correspondiente.");

      tableCaption("Matriz general de evaluación");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Componente","Ponderación","Base de valoración","Evidencia"]],
        body:[
          ["Teórico",ev.theoreticalWeight+" %","Respuestas del instrumento teórico","Registro de respuestas y calificación"],
          ["Práctico",ev.practicalWeight+" %","Criterios o rúbrica del producto práctico","Producto, archivo, resultado o evidencia equivalente"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.18},1:{cellWidth:bodyW*0.16},2:{cellWidth:bodyW*0.34},3:{cellWidth:bodyW*0.32}},
        styles:{font:"times",fontSize:8.7,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La ponderación institucional del examen complexivo corresponde a "+ev.theoreticalWeight+" % para el componente teórico y "+ev.practicalWeight+" % para el componente práctico, con un total de 100 %.");

      heading("10.4. Nota Final y Aprobación",2,true);
      paragraph("La nota final se calcula mediante la fórmula: Nota final = (Nota teórica × "+(ev.theoreticalWeight/100).toFixed(2)+") + (Nota práctica × "+(ev.practicalWeight/100).toFixed(2)+"). La calificación mínima de aprobación es "+ev.minimumGrade+"/"+ev.gradeScale+".");
      paragraph("La aplicación de criterios adicionales solo procede cuando exista una disposición institucional vigente y expresamente comunicada para el período o la carrera correspondiente.");

      heading("10.5. Validación, Registro, Revisión y Supletorio",2,true);
      paragraph("Antes de publicar resultados debe verificarse la consistencia entre calificaciones parciales, ponderaciones y nota final. Posteriormente, las Coordinaciones de Carrera registran el resultado con articulación de "+(a.secretaria||"Secretaría Académica")+" y "+(a.titulacion||"Titulación y Eficiencia Terminal")+", conservando la evidencia correspondiente.");
      paragraph("Las solicitudes de revisión y la instancia de supletorio se atienden conforme al cronograma y al procedimiento vigente. Cualquier cambio de nota debe conservar trazabilidad suficiente para identificar motivo, responsable y fecha de actualización.");
    }
  };
})();
