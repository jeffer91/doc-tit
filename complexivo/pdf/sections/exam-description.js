(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.examDescription = {
    render(api) {
      const {heading,paragraph,bullet,insertSectionImage,tableCaption,tableNote,autoTable,BODY,bodyW,policy} = api;
      const a=ns.config?.areas||{};
      const ev=policy.evaluation||{};

      heading("5. Descripción del Examen Complexivo",1,true);
      paragraph("El examen complexivo es una evaluación individual que integra un componente teórico y un componente práctico. Este capítulo explica su estructura, el diseño y validación de los instrumentos y las condiciones de aplicación; la forma de calificación se desarrolla en el capítulo 10.",{indent:false});
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
      paragraph("El componente teórico se desarrolla individualmente mediante un instrumento estructurado de "+ev.theoreticalQuestions+" preguntas y un tiempo máximo de "+ev.theoreticalMinutes+" minutos. Antes de la aplicación deben verificarse el banco o instrumento, la versión aprobada, el mecanismo de respuesta, el tiempo establecido, la identificación del estudiante y el procedimiento de respaldo.");

      heading("5.3. Componente Práctico",2,true);
      paragraph("El componente práctico debe plantear una tarea coherente con el perfil profesional. Puede adoptar diferentes tipologías según la carrera, pero siempre debe definir objetivo, instrucciones, recursos autorizados, tiempo, producto esperado, forma de entrega y evidencia.");
      paragraph("La defensa oral no constituye una condición general del examen complexivo. Únicamente se incorpora cuando exista una condición expresamente aprobada para la carrera correspondiente.");

      heading("5.4. Diseño y Validación de Instrumentos",2,true);
      paragraph("La elaboración comienza con la selección de competencias y resultados de aprendizaje prioritarios. Posteriormente se solicitan y consolidan preguntas, se construyen actividades prácticas, se revisan claridad y pertinencia, se estima el tiempo de resolución, se valida la correspondencia con el perfil de egreso y se aprueba una versión identificable.");
      bullet("• Elaboración por docentes o equipos académicos designados por las Coordinaciones de Carrera.");
      bullet("• Revisión académica con participación de Coordinaciones de Carrera y Gestión Didáctica, Diseño Curricular y Calidad Docente.");
      bullet("• Articulación del proceso y control de versiones por Titulación y Eficiencia Terminal.");
      bullet("• Identificación de versión, fecha o control equivalente.");
      bullet("• Custodia y confidencialidad de instrumentos antes de la jornada.");

      heading("5.5. Condiciones de Aplicación",2,true);
      paragraph("La jornada debe asegurar identificación, ingreso controlado, asignación de equipo o espacio, disponibilidad de software y conectividad, comunicación del tiempo, supervisión, entrega y respaldo. Los recursos permitidos deben comunicarse antes de iniciar.");
      paragraph("La presencialidad es la regla general. Una aplicación virtual solo puede realizarse cuando exista una excepción autorizada y deben definirse controles equivalentes de identidad, supervisión, conectividad, entrega y evidencias.");
      paragraph("La coordinación técnica corresponde a "+(a.ti||"Coordinación de Tecnología de la Información")+" e "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+", en articulación con "+(a.titulacion||"Titulación y Eficiencia Terminal")+" y "+(a.carreras||"Coordinaciones de Carrera")+".");

      heading("5.6. Integridad Académica",2,true);
      paragraph("La aplicación debe prevenir copia, suplantación, colaboración no autorizada, uso de recursos prohibidos o manipulación de evidencias. Las reglas deben socializarse previamente y aplicarse de manera uniforme.");
      paragraph("Cuando se detecte un incidente, el responsable de jornada debe registrar hechos observables, conservar la evidencia disponible y aplicar el procedimiento institucional vigente, sin establecer consecuencias distintas de las previstas institucionalmente.");
    }
  };
})();
