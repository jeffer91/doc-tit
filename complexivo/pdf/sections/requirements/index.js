(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.requirements = {
    render(api) {
      const {heading,paragraph,bullet,insertSectionImage,tableCaption,tableNote,autoTable,BODY,bodyW,policy} = api;

      heading("4. Requisitos para Titulación",1,true);
      paragraph(
        "La habilitación para el examen complexivo exige comprobar de manera integral los requisitos académicos, documentales, financieros y complementarios aplicables a cada estudiante. Este capítulo desarrolla el procedimiento de verificación y utiliza la matriz consolidada únicamente como resumen final, no como sustituto del análisis de cada requisito.",
        {indent:false}
      );
      insertSectionImage("requirementsImage");

      heading("4.1. Requisitos Académicos",2,true);
      paragraph("La verificación académica determina si el estudiante ha cumplido las obligaciones previstas en su plan de estudios y si se encuentra en condición de continuar con la modalidad de titulación. La fuente de verificación debe ser el registro académico institucional y no una declaración manual.");
      paragraph("La revisión debe identificar pendientes, excepciones autorizadas y requisitos que forman parte del propio proceso de titulación. Cualquier diferencia entre el registro y la situación reportada por el estudiante debe resolverse antes de la habilitación definitiva.");

      heading("4.1.1. Malla Curricular",3,true);
      paragraph("Se verifica el cumplimiento de las asignaturas, módulos, créditos u otras unidades curriculares exigidas por el plan de estudios aplicable. La app no inventa asignaturas ni completa ejemplos genéricos: el detalle solo debe incorporarse cuando exista información real de la carrera.");
      paragraph("Responsable: Secretaría Académica y Coordinación de Carrera. Evidencia: historial o registro académico institucional. Resultado esperado: estado académico validado para continuar con titulación, considerando únicamente las excepciones institucionalmente autorizadas.");

      heading("4.1.2. Requisitos Transversales",3,true);
      paragraph("Los requisitos transversales se revisan de acuerdo con el diseño curricular vigente de la carrera. La validación debe comprobar que la exigencia corresponde efectivamente al estudiante y que su cumplimiento se encuentra registrado en la fuente institucional.");
      paragraph("Cuando el requisito transversal tenga una evidencia específica, como certificación, módulo aprobado o registro de sistema, dicha evidencia debe quedar vinculada al expediente o al mecanismo institucional de control.");

      heading("4.1.3. Otros Requisitos Académicos",3,true);
      paragraph("Solo se incorporan otros requisitos académicos cuando estén vigentes para la carrera o el período. La planificación no recupera automáticamente reglas de versiones anteriores, requisitos desactualizados ni condiciones que no puedan verificarse.");

      heading("4.2. Documentación Habilitante",2,true);
      paragraph("La documentación habilitante debe revisarse antes del cierre de la Semana de Requisitos. La comprobación comprende integridad, vigencia, correspondencia con el estudiante y consistencia con los registros institucionales.");
      paragraph("Cuando se identifique un documento pendiente o inconsistente, la novedad debe comunicarse al estudiante, registrarse con responsable y fecha, y volver a verificarse dentro de la ventana establecida. La habilitación definitiva debe quedar documentada.");

      tableCaption("Control operativo de documentación habilitante");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Elemento de control","Responsable","Evidencia","Acción ante faltante"]],
        body:[
          ["Identidad y correspondencia de datos","Secretaría Académica","Registro o expediente institucional","Solicitar corrección o documento vigente"],
          ["Integridad del expediente","Secretaría Académica","Checklist o estado documental","Notificar faltantes y fijar plazo de subsanación"],
          ["Consistencia con registro académico","Secretaría Académica / Carrera","Cruce con sistema académico","Resolver inconsistencia antes de habilitar"],
          ["Estado final de habilitación","Secretaría Académica / Titulación","Registro de validación","Reinspeccionar y dejar trazabilidad"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.25},1:{cellWidth:bodyW*0.22},2:{cellWidth:bodyW*0.23},3:{cellWidth:bodyW*0.30}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Los documentos específicos dependen de la normativa y de los registros institucionales vigentes; el generador no debe inventar requisitos documentales.");

      heading("4.3. Requisitos Financieros",2,true);
      paragraph("La validación financiera comprueba que el estudiante se encuentre en el estado requerido por la institución para continuar con el proceso. La fuente debe ser el sistema o registro institucional administrado por la unidad competente.");
      paragraph("La planificación no incorpora cuotas, descuentos, montos ni fechas financieras antiguas. Los valores solo pueden aparecer cuando la app reciba información vigente del período. Ante un pendiente, se registra la novedad, se comunica el procedimiento de regularización y se realiza una nueva verificación antes de la habilitación.");

      heading("4.4. Vinculación con la Sociedad",2,true);
      paragraph("La vinculación se valida cuando forma parte de los requisitos aplicables al plan de estudios. La revisión debe comprobar cumplimiento, evidencia institucional y correspondencia con el estudiante.");
      paragraph("Responsable: unidad competente y Coordinación de Carrera. Evidencia: registro, certificado o constancia institucional. Ante un pendiente, se debe identificar la causa, el mecanismo de subsanación y la fecha máxima permitida para completar la obligación.");

      heading("4.5. Prácticas Preprofesionales",2,true);
      paragraph("Las prácticas preprofesionales se verifican conforme al plan de estudios y a la normativa institucional vigente. La revisión comprende el cumplimiento de la actividad y la existencia de la documentación o registro de culminación exigido por la institución.");
      paragraph("La coordinación debe diferenciar entre una práctica efectivamente pendiente y un problema de actualización documental. La habilitación solo debe emitirse después de resolver la novedad y conservar evidencia de la validación.");

      heading("4.6. Lengua Extranjera",2,true);
      paragraph("La acreditación de lengua extranjera se verifica únicamente con el requisito vigente que corresponda a la carrera y cohorte. La app no asume automáticamente un nivel específico cuando ese nivel no ha sido confirmado por la configuración institucional.");
      paragraph("Responsable: unidad o instancia institucional competente. Evidencia: registro, certificado o resultado reconocido. Condición esperada: cumplimiento validado antes de la habilitación definitiva.");

      heading("4.7. Actualización de Datos",2,true);
      paragraph("La actualización de datos busca asegurar que la información utilizada para comunicaciones, expediente, titulación y registro final sea correcta. Deben comprobarse los campos institucionalmente relevantes y corregirse inconsistencias antes de la emisión de documentos de cierre.");
      bullet("• Verificar nombres y apellidos conforme al registro institucional.");
      bullet("• Verificar identificación, datos de contacto y demás campos exigidos por Secretaría Académica.");
      bullet("• Registrar la actualización y conservar evidencia del cambio cuando corresponda.");
      bullet("• No modificar automáticamente el nombre oficial de una carrera, incluso cuando existan diferencias de tildes o modalidad en la fuente.");

      heading("4.8. Matriz Consolidada de Requisitos",2,true);
      tableCaption("Matriz de requisitos para habilitación al examen complexivo");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Requisito","Responsable de validación","Evidencia","Condición"]],
        body:[
          ["Cumplimiento académico de la malla aplicable","Secretaría Académica / Coordinación de Carrera","Registro académico institucional","Cumplido según plan de estudios y excepciones vigentes"],
          ["Documentación habilitante","Secretaría Académica","Expediente o registro documental","Completo, vigente y consistente"],
          ["Obligaciones financieras aplicables","Unidad de Recaudación y Cartera","Estado financiero institucional","Estado requerido para habilitación"],
          ["Vinculación con la sociedad","Unidad responsable / Coordinación de Carrera","Registro o certificación institucional","Cumplido cuando corresponda"],
          ["Prácticas preprofesionales","Unidad responsable / Coordinación de Carrera","Registro o certificación institucional","Cumplido cuando corresponda"],
          ["Lengua extranjera","Unidad o instancia responsable","Registro institucional","Cumplido según requisito vigente"],
          ["Actualización de datos","Secretaría Académica / sistema institucional","Registro actualizado","Completo"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.24},1:{cellWidth:bodyW*0.25},2:{cellWidth:bodyW*0.23},3:{cellWidth:bodyW*0.28}},
        styles:{font:"times",fontSize:8.4,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La condición específica de cada requisito debe verificarse con la normativa y los registros institucionales vigentes del período.");

      heading("4.9. Gestión de Requisitos Pendientes",2,true);
      paragraph("Cuando un requisito aparezca como pendiente, la app y el procedimiento institucional deben mantener una trazabilidad mínima: identificación del requisito, responsable de validación, fecha de detección, comunicación realizada, plazo de subsanación, nueva revisión y estado final.");
      tableCaption("Flujo de gestión de requisitos pendientes");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Etapa","Acción","Responsable","Evidencia"]],
        body:[
          ["Detección","Registrar el requisito pendiente o inconsistente","Unidad que valida el requisito","Registro de novedad"],
          ["Comunicación","Informar al estudiante el faltante y el plazo","Unidad responsable / Titulación","Correo, sistema o comunicación institucional"],
          ["Subsanación","Recibir o verificar la corrección","Estudiante y unidad competente","Documento o actualización de sistema"],
          ["Reinspección","Comprobar nuevamente el requisito","Unidad responsable","Resultado de segunda revisión"],
          ["Cierre","Actualizar el estado final de habilitación","Unidad responsable / Titulación","Registro definitivo"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.16},1:{cellWidth:bodyW*0.34},2:{cellWidth:bodyW*0.25},3:{cellWidth:bodyW*0.25}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("El flujo evita que un estado pendiente quede sin responsable, plazo o evidencia de resolución.");

      paragraph("La modalidad académica de la carrera no determina por sí sola la modalidad de aplicación del examen. La regla global permanece presencial y la virtualidad requiere una excepción autorizada.",{indent:false,bold:true});
    }
  };
})();
