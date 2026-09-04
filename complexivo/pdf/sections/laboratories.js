(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.laboratories = {
    render(api) {
      const {ctx,heading,paragraph,bullet,tableCaption,tableNote,autoTable,BODY,bodyW,totals,lowerPeriod,joinNatural} = api;
      const t=totals(ctx.distribution);
      const places=Object.keys(t.byPlace);

      heading("8. Laboratorios, Infraestructura y Capacidad",1,true);
      paragraph("La infraestructura se planifica a partir de la distribución real del período "+lowerPeriod(ctx.period.name)+". La planificación contempla "+joinNatural(places)+" como lugares de ejecución y debe convertir la cantidad de estudiantes en requerimientos de espacios, equipos, software, conectividad, soporte y accesibilidad.",{indent:false});

      heading("8.1. Criterios de Asignación y Capacidad",2,true);
      paragraph("La capacidad no se hardcodea en este documento. Cada cronograma operativo debe asignar un espacio cuya capacidad verificada sea suficiente para el número de estudiantes convocados simultáneamente, considerando también puestos de respaldo y condiciones de supervisión.");
      tableCaption("Demanda mínima a considerar por lugar de ejecución");
      autoTable({
        startY:api.getY(),
        margin:{left:BODY.left,right:BODY.right,top:BODY.top,bottom:BODY.bottom},
        head:[["Lugar","Estudiantes planificados","Criterio de capacidad","Validación requerida"]],
        body:Object.entries(t.byPlace).map(([p,n])=>[
          p,String(n),
          "Capacidad de cada jornada ≥ estudiantes convocados simultáneamente",
          "Espacio, equipos, software, conectividad y soporte confirmados antes de publicar el cronograma operativo"
        ]),
        columnStyles:{0:{cellWidth:bodyW*0.16},1:{cellWidth:bodyW*0.18},2:{cellWidth:bodyW*0.30},3:{cellWidth:bodyW*0.36}},
        styles:{font:"times",fontSize:8.4,cellPadding:4,textColor:0},
        headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0}
      });
      tableNote("Los valores de capacidad física deben incorporarse solo cuando exista una fuente institucional verificada.");

      heading("8.2. Equipo, Software y Conectividad",2,true);
      bullet("• Equipo funcional para cada estudiante convocado y unidades de respaldo según disponibilidad.");
      bullet("• Software requerido por la carrera instalado, licenciado y probado antes de la jornada.");
      bullet("• Conectividad suficiente para plataformas, autenticación, entrega y respaldo cuando el instrumento la requiera.");
      bullet("• Restricciones de acceso y recursos configuradas de acuerdo con las condiciones del examen.");
      bullet("• Mecanismo de almacenamiento o recuperación frente a cierres inesperados.");

      heading("8.3. Pruebas Previas y Soporte",2,true);
      paragraph("Antes de cada jornada debe ejecutarse una prueba técnica que reproduzca las condiciones esenciales del examen: acceso, software, conectividad, apertura del instrumento, guardado, entrega y recuperación. Las novedades deben resolverse o quedar registradas con una alternativa disponible.");
      paragraph("Durante la aplicación debe existir un responsable de soporte o un mecanismo institucional de atención. Las intervenciones técnicas deben resolver la incidencia sin alterar el contenido académico ni otorgar ventajas indebidas.");

      heading("8.4. Accesibilidad, Respaldo y Continuidad",2,true);
      paragraph("Las necesidades de accesibilidad deben identificarse con anticipación y traducirse en ajustes de espacio, equipo o apoyo autorizados. La planificación debe procurar que estas medidas permitan la participación sin modificar injustificadamente los criterios académicos.");
      paragraph("Toda jornada debe contar con mecanismos de continuidad frente a fallas previsibles: equipo alterno, recuperación de archivos, registro de tiempo afectado y procedimiento para reprogramación cuando la incidencia impida concluir el examen en condiciones válidas.");
    }
  };
})();
