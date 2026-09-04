(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.requirements = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function requirementsSection(){
          heading("4. Requisitos para Titulación",1,true);

          paragraph(
            "La habilitación para el examen complexivo se verifica mediante una matriz ejecutiva de requisitos. El estudiante debe cumplir todos los requisitos institucionales aplicables a su carrera, excepto el módulo, asignatura o requisito identificado específicamente como «Titulación», debido a que forma parte del proceso que se encuentra en ejecución.",
            {indent:false,after:10}
          );
          insertSectionImage("requirementsImage");

          ensureSpace(210);
          tableCaption("Matriz de requisitos para habilitación al examen complexivo");
          autoTable({
            startY:api.getY(),
            margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
            head:[["Requisito","Responsable de validación","Evidencia","Condición"]],
            body:[
              ["Cumplimiento académico de la malla aplicable","Secretaría Académica / Coordinación de Carrera","Registro académico institucional","Cumplido, excepto el requisito denominado específicamente «Titulación»"],
              ["Documentación habilitante","Secretaría Académica","Expediente o registro documental","Completo y vigente"],
              ["Obligaciones financieras aplicables","Unidad de Recaudación y Cartera","Estado financiero institucional","Sin pendientes que impidan la habilitación"],
              ["Vinculación con la sociedad","Unidad responsable / Coordinación de Carrera","Registro o certificación institucional","Cumplido según el plan de estudios aplicable"],
              ["Prácticas preprofesionales","Unidad responsable / Coordinación de Carrera","Registro o certificación institucional","Cumplido según el plan de estudios aplicable"],
              ["Lengua extranjera","Unidad o instancia responsable","Registro institucional","Cumplido según el requisito vigente de la carrera"],
              ["Actualización de datos","Secretaría Académica / sistema institucional","Registro actualizado","Completo"]
            ],
            columnStyles:{
              0:{cellWidth:bodyW*0.24},
              1:{cellWidth:bodyW*0.25},
              2:{cellWidth:bodyW*0.23},
              3:{cellWidth:bodyW*0.28}
            },
            styles:{font:"times",fontSize:8.8,cellPadding:4,textColor:0},
            headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
          });
          tableNote("La condición específica de cada requisito debe verificarse con la normativa y los registros institucionales vigentes del período.");

          paragraph("La modalidad académica de la carrera —presencial, en línea u otra autorizada— no determina por sí sola la modalidad de aplicación del examen complexivo. La rendición se planifica presencialmente para todos los estudiantes; cualquier aplicación virtual requiere justificación y autorización institucional expresa.");
        }

      requirementsSection();
    }
  };
})();
