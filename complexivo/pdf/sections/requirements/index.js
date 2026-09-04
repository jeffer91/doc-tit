(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.requirements = {
    render(api) {
      const {heading,paragraph,bullet,insertSectionImage,tableCaption,tableNote,autoTable,BODY,bodyW} = api;
      const a=ns.config?.areas||{};

      heading("4. Requisitos para Titulación",1,true);
      paragraph("La habilitación para el examen complexivo exige comprobar de manera integral los requisitos académicos, documentales, financieros y complementarios aplicables a cada estudiante. La revisión debe identificar responsables, evidencias, novedades y estado final de habilitación.",{indent:false});
      insertSectionImage("requirementsImage");

      heading("4.1. Requisitos Académicos",2,true);
      paragraph("La verificación académica determina si el estudiante ha cumplido las obligaciones previstas en su plan de estudios y si se encuentra en condición de continuar con la modalidad de titulación. La fuente de verificación es el registro académico institucional administrado por "+(a.secretaria||"Secretaría Académica")+", con apoyo de "+(a.carreras||"Coordinaciones de Carrera")+".");
      paragraph("La revisión debe identificar pendientes, excepciones autorizadas y requisitos que forman parte del propio proceso de titulación. Cualquier diferencia entre el registro institucional y la situación reportada por el estudiante debe resolverse antes de la habilitación definitiva.");

      heading("4.1.1. Malla Curricular",3,true);
      paragraph("Se verifica el cumplimiento de las asignaturas, módulos, créditos u otras unidades curriculares exigidas por el plan de estudios aplicable. El detalle debe corresponder exclusivamente a la información académica vigente de cada carrera.");
      paragraph("Responsable: "+(a.secretaria||"Secretaría Académica")+" y "+(a.carreras||"Coordinaciones de Carrera")+". Evidencia: historial o registro académico institucional. Resultado esperado: estado académico validado para continuar con titulación, considerando únicamente las excepciones institucionalmente autorizadas.");

      heading("4.1.2. Requisitos Transversales",3,true);
      paragraph("Los requisitos transversales se revisan de acuerdo con el diseño curricular vigente de la carrera. Cuando exista una evidencia específica, como certificación, módulo aprobado o registro institucional, dicha evidencia debe quedar vinculada al expediente o al mecanismo institucional de control.");

      heading("4.1.3. Otros Requisitos Académicos",3,true);
      paragraph("Solo se incorporan otros requisitos académicos cuando estén vigentes para la carrera o el período y puedan verificarse mediante registros institucionales. Las condiciones de períodos anteriores no se trasladan automáticamente a la planificación actual.");

      heading("4.2. Documentación Habilitante",2,true);
      paragraph("La documentación habilitante debe revisarse antes del cierre de la Semana de Requisitos. La comprobación comprende integridad, vigencia, correspondencia con el estudiante y consistencia con los registros institucionales.");
      paragraph("Cuando se identifique un documento pendiente o inconsistente, "+(a.secretaria||"Secretaría Académica")+" debe registrar la novedad, comunicarla al estudiante, establecer el mecanismo de subsanación y volver a verificar el requisito dentro de la ventana definida.");

      tableCaption("Control operativo de documentación habilitante");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Elemento de control","Responsable","Evidencia","Acción ante faltante"]],
        body:[
          ["Identidad y correspondencia de datos",a.secretaria||"Secretaría Académica","Registro o expediente institucional","Solicitar corrección o documento vigente"],
          ["Integridad del expediente",a.secretaria||"Secretaría Académica","Checklist o estado documental","Notificar faltantes y fijar plazo de subsanación"],
          ["Consistencia con registro académico",(a.secretaria||"Secretaría Académica")+" / "+(a.carreras||"Coordinaciones de Carrera"),"Cruce con registro académico","Resolver inconsistencia antes de habilitar"],
          ["Estado final de habilitación",(a.secretaria||"Secretaría Académica")+" / "+(a.titulacion||"Titulación y Eficiencia Terminal"),"Registro de validación","Reinspeccionar y dejar trazabilidad"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.25},1:{cellWidth:bodyW*0.22},2:{cellWidth:bodyW*0.23},3:{cellWidth:bodyW*0.30}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Los documentos específicos dependen de la normativa y de los registros institucionales vigentes del período.");

      heading("4.3. Requisitos Financieros",2,true);
      paragraph("La validación financiera comprueba que el estudiante se encuentre en el estado requerido por la institución para continuar con el proceso. La verificación corresponde a "+(a.recaudacion||"Recaudación y Cartera")+" y debe sustentarse en el registro financiero institucional vigente.");
      paragraph("Los montos, cuotas, descuentos o fechas de pago solo deben incorporarse cuando exista información oficial vigente para el período. Ante un pendiente, se registra la novedad, se comunica el procedimiento de regularización y se realiza una nueva verificación antes de la habilitación.");

      heading("4.4. Vinculación con la Sociedad",2,true);
      paragraph("La validación corresponde a "+(a.vinculacion||"Vinculación con la Sociedad")+", en coordinación con "+(a.carreras||"Coordinaciones de Carrera")+" y "+(a.titulacion||"Titulación y Eficiencia Terminal")+". La evidencia debe demostrar el cumplimiento cuando este requisito sea aplicable al plan de estudios.");

      heading("4.5. Prácticas Preprofesionales",2,true);
      paragraph("La verificación corresponde a "+(a.practicas||"Prácticas Preprofesionales")+", en coordinación con "+(a.carreras||"Coordinaciones de Carrera")+". Debe diferenciarse entre una práctica efectivamente pendiente y una novedad de actualización documental antes de emitir el estado final de habilitación.");

      heading("4.6. Lengua Extranjera",2,true);
      paragraph("La acreditación de lengua extranjera se verifica mediante "+(a.idiomas||"Coordinación Idiomas")+", con articulación de "+(a.secretaria||"Secretaría Académica")+" y "+(a.carreras||"Coordinaciones de Carrera")+". Se aplica únicamente el requisito vigente que corresponda a la carrera y cohorte.");

      heading("4.7. Actualización de Datos",2,true);
      paragraph("La actualización de datos busca asegurar que la información utilizada para comunicaciones, expediente, titulación y registro final sea correcta. "+(a.secretaria||"Secretaría Académica")+" debe verificar los campos institucionalmente relevantes y resolver inconsistencias antes de la emisión de documentos de cierre.");
      bullet("• Verificar nombres y apellidos conforme al registro institucional.");
      bullet("• Verificar identificación, datos de contacto y demás campos exigidos institucionalmente.");
      bullet("• Registrar la actualización y conservar evidencia del cambio cuando corresponda.");
      bullet("• Mantener la denominación oficial de la carrera conforme a los registros vigentes.");

      heading("4.8. Matriz Consolidada de Requisitos",2,true);
      tableCaption("Matriz de requisitos para habilitación al examen complexivo");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Requisito","Responsable de validación","Evidencia","Condición"]],
        body:[
          ["Cumplimiento académico de la malla aplicable",(a.secretaria||"Secretaría Académica")+" / "+(a.carreras||"Coordinaciones de Carrera"),"Registro académico institucional","Cumplido según plan de estudios y excepciones vigentes"],
          ["Documentación habilitante",a.secretaria||"Secretaría Académica","Expediente o registro documental","Completo, vigente y consistente"],
          ["Obligaciones financieras aplicables",a.recaudacion||"Recaudación y Cartera","Estado financiero institucional","Estado requerido para habilitación"],
          ["Vinculación con la sociedad",a.vinculacion||"Vinculación con la Sociedad","Registro o certificación institucional","Cumplido cuando corresponda"],
          ["Prácticas preprofesionales",a.practicas||"Prácticas Preprofesionales","Registro o certificación institucional","Cumplido cuando corresponda"],
          ["Lengua extranjera",a.idiomas||"Coordinación Idiomas","Registro institucional","Cumplido según requisito vigente"],
          ["Actualización de datos",a.secretaria||"Secretaría Académica","Registro actualizado","Completo"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.24},1:{cellWidth:bodyW*0.25},2:{cellWidth:bodyW*0.23},3:{cellWidth:bodyW*0.28}},
        styles:{font:"times",fontSize:8.4,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La condición específica de cada requisito debe verificarse con la normativa y los registros institucionales vigentes del período.");

      heading("4.9. Gestión de Requisitos Pendientes",2,true);
      paragraph("Cuando un requisito aparezca como pendiente, el procedimiento debe mantener una trazabilidad mínima: identificación del requisito, responsable de validación, fecha de detección, comunicación realizada, plazo de subsanación, nueva revisión y estado final.");
      tableCaption("Flujo de gestión de requisitos pendientes");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Etapa","Acción","Responsable","Evidencia"]],
        body:[
          ["Detección","Registrar el requisito pendiente o inconsistente","Área institucional que valida el requisito","Registro de novedad"],
          ["Comunicación","Informar al estudiante el faltante y el plazo","Área responsable / "+(a.titulacion||"Titulación y Eficiencia Terminal"),"Correo, sistema o comunicación institucional"],
          ["Subsanación","Recibir o verificar la corrección","Estudiante y área responsable","Documento o actualización de registro"],
          ["Reinspección","Comprobar nuevamente el requisito","Área responsable","Resultado de segunda revisión"],
          ["Cierre","Actualizar el estado final de habilitación",(a.secretaria||"Secretaría Académica")+" / "+(a.titulacion||"Titulación y Eficiencia Terminal"),"Registro definitivo"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.16},1:{cellWidth:bodyW*0.34},2:{cellWidth:bodyW*0.25},3:{cellWidth:bodyW*0.25}},
        styles:{font:"times",fontSize:8.5,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("El flujo evita que un estado pendiente quede sin responsable, plazo o evidencia de resolución.");

      paragraph("La modalidad académica de la carrera no determina por sí sola la modalidad de aplicación del examen. La presencialidad constituye la regla general y la virtualidad requiere una excepción institucionalmente autorizada.",{indent:false,bold:true});
    }
  };
})();
