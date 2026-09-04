(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.examDescription = {
    render(api) {
      const {heading,paragraph,bullet,insertSectionImage,tableCaption,tableNote,autoTable,BODY,bodyW,policy} = api;
      const ev=policy.evaluation||{};

      heading("5. Descripción del Examen Complexivo",1,true);
      paragraph(
        "El examen complexivo es una evaluación individual que integra un componente teórico y un componente práctico. Este capítulo explica qué es el examen, cómo se estructura, cómo se diseñan y validan sus instrumentos y bajo qué condiciones se aplica; la forma de calificación se desarrolla exclusivamente en el capítulo 10.",
        {indent:false}
      );
      insertSectionImage("examImage");

      heading("5.1. Estructura General",2,true);
      paragraph("La estructura combina valoración conceptual y aplicación profesional. El componente teórico verifica conocimientos esenciales, comprensión y análisis; el componente práctico exige resolver una situación, caso, ejercicio, simulación, configuración, desarrollo o producto equivalente definido para la carrera.");
      paragraph("Ambos componentes deben corresponder al perfil de egreso, aplicarse de manera individual y dejar evidencia suficiente para identificar al estudiante, el instrumento utilizado, la versión aplicada y el resultado entregado.");

      tableCaption("Estructura funcional del examen complexivo");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Componente","Finalidad","Aplicación","Evidencia mínima"]],
        body:[
          ["Teórico","Comprobar conocimientos, comprensión y análisis","Instrumento estructurado individual en equipo informático","Respuestas registradas y versión del instrumento"],
          ["Práctico","Comprobar aplicación de competencias frente a una situación profesional","Caso, ejercicio, simulación, desarrollo o resolución técnica individual","Producto entregado, archivo, resultado o registro equivalente"]
        ],
        columnStyles:{0:{cellWidth:bodyW*0.16},1:{cellWidth:bodyW*0.29},2:{cellWidth:bodyW*0.30},3:{cellWidth:bodyW*0.25}},
        styles:{font:"times",fontSize:8.6,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("La tipología concreta del componente práctico se adapta a la naturaleza de cada carrera sin alterar su carácter individual.");

      heading("5.2. Componente Teórico",2,true);
      paragraph("El componente teórico se desarrolla individualmente mediante un instrumento estructurado. La configuración vigente establece "+ev.theoreticalQuestions+" preguntas y un tiempo máximo de "+ev.theoreticalMinutes+" minutos. Estos valores se obtienen de una sola configuración y no deben repetirse manualmente en distintas secciones.");
      paragraph("Antes de la aplicación deben verificarse banco o instrumento, versión aprobada, plataforma o mecanismo de respuesta, tiempo configurado, identificación del estudiante, disponibilidad de equipo y procedimiento de respaldo.");

      heading("5.3. Componente Práctico",2,true);
      paragraph("El componente práctico debe plantear una tarea coherente con el perfil profesional. Puede adoptar diferentes tipologías según la carrera, pero siempre debe definir objetivo, instrucciones, recursos autorizados, tiempo, producto esperado, forma de entrega y evidencia.");
      paragraph("La defensa oral no constituye una regla general. La configuración institucional mantiene `defensaOral = false` por defecto y solo una excepción expresamente definida para una carrera puede incorporar sustentación adicional.");

      heading("5.4. Diseño y Validación de Instrumentos",2,true);
      paragraph("La elaboración comienza con la selección de competencias y resultados de aprendizaje prioritarios. Posteriormente se construyen preguntas y actividades prácticas, se revisan claridad y pertinencia, se estima el tiempo de resolución, se valida la correspondencia con el perfil de egreso y se aprueba una versión identificable.");
      bullet("• Elaboración por docentes o equipos académicos designados.");
      bullet("• Revisión técnica y académica antes de la aplicación.");
      bullet("• Identificación de versión, fecha o control equivalente.");
      bullet("• Custodia y confidencialidad de instrumentos antes de la jornada.");
      bullet("• Registro de cambios cuando una versión sea sustituida.");

      heading("5.5. Condiciones de Aplicación",2,true);
      paragraph("La jornada debe asegurar identificación, ingreso controlado, asignación de equipo o espacio, disponibilidad de software y conectividad, comunicación del tiempo, supervisión, entrega y respaldo. Los recursos permitidos deben comunicarse antes de iniciar.");
      paragraph("La presencialidad es la regla general. Una aplicación virtual solo puede realizarse cuando exista una excepción autorizada y deben definirse controles equivalentes de identidad, supervisión, conectividad, entrega y evidencias.");

      heading("5.6. Integridad Académica",2,true);
      paragraph("La aplicación debe prevenir copia, suplantación, colaboración no autorizada, uso de recursos prohibidos o manipulación de evidencias. Las reglas deben socializarse previamente y aplicarse de manera uniforme.");
      paragraph("Cuando se detecte un incidente, el responsable de jornada debe registrar hechos observables, conservar la evidencia disponible y aplicar el procedimiento institucional vigente. La planificación no inventa sanciones ni consecuencias que no estén respaldadas por normativa institucional.");
    }
  };
})();
