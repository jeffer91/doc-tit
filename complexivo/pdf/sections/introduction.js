(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.introduction = {
    render(api) {
      const {ctx,heading,paragraph,bullet,insertSectionImage,getAnalysisSentences,totals,lowerPeriod,joinNatural} = api;
      const a=ns.config?.areas||{};
      const t=totals(ctx.distribution);
      const places=Object.keys(t.byPlace);
      const p=lowerPeriod(ctx.period.name);

      heading("1. Introducción",1,true);
      paragraph("El examen complexivo constituye una modalidad de titulación orientada a comprobar de manera integral que el estudiante articula los conocimientos, habilidades y competencias desarrollados durante su trayectoria académica y puede aplicarlos frente a situaciones vinculadas con su perfil de egreso. Su planificación no se limita a definir una fecha de evaluación; requiere coordinar requisitos, preparación, instrumentos, recursos, responsables, evidencias y mecanismos de cierre.",{indent:false});
      insertSectionImage("introImage");

      heading("1.1. Antecedentes y justificación",2,true);
      paragraph("La planificación corresponde al período "+p+" y responde a la necesidad de ejecutar el examen bajo criterios comunes, verificables y documentados para todas las carreras incluidas en el proceso. El documento establece una ruta institucional que permite anticipar actividades, identificar responsables y reducir decisiones improvisadas durante las jornadas de titulación.");
      paragraph("La existencia de grupos con diferentes carreras, modalidades académicas y lugares de ejecución exige una coordinación transversal entre "+(a.titulacion||"Titulación y Eficiencia Terminal")+", "+(a.coordinacionGeneral||"Coordinación General de Carreras")+", "+(a.carreras||"Coordinaciones de Carrera")+", "+(a.secretaria||"Secretaría Académica")+", "+(a.ti||"Coordinación de Tecnología de la Información")+", "+(a.soporteTecnologico||"Infraestructura y Soporte Tecnológico")+" y "+(a.infraestructuraFisica||"Infraestructura Física y Servicios Generales")+". La planificación convierte esa coordinación en actividades, productos y evidencias concretas.");

      heading("1.2. Propósito y objetivo general",2,true);
      paragraph("El propósito del documento es servir como instrumento de gestión académica y operativa para la preparación, aplicación, evaluación y cierre del examen complexivo, con base en los registros institucionales vigentes del período.");
      paragraph("El objetivo general es garantizar que el proceso de titulación mediante examen complexivo se desarrolle de forma ordenada, individual, teórico-práctica, trazable, equitativa y coherente con el perfil de egreso de cada carrera.");

      heading("1.3. Objetivos específicos",2,true);
      bullet("• Establecer una secuencia clara de actividades desde la verificación de requisitos hasta el cierre documental.");
      bullet("• Definir responsables, áreas de coordinación, productos esperados y evidencias para cada fase del proceso.");
      bullet("• Organizar la preparación académica mediante cuatro Núcleos de Titulación y asegurar su seguimiento.");
      bullet("• Coordinar la distribución de "+t.total+" estudiantes entre "+joinNatural(places)+" conservando los nombres registrados institucionalmente.");
      bullet("• Asegurar condiciones técnicas, de accesibilidad, supervisión, respaldo e integridad académica durante la aplicación.");
      bullet("• Aplicar criterios institucionales consistentes de ponderación, nota mínima, modalidad y tratamiento de excepciones.");
      bullet("• Consolidar resultados, evidencias, incidencias y acciones de mejora al finalizar el proceso.");

      heading("1.4. Alcance y población objetivo",2,true);
      paragraph("El alcance comprende a los estudiantes incorporados en la distribución vigente del período, a las carreras que participan en el examen complexivo y a las áreas académicas y administrativas responsables de habilitación, preparación, logística, tecnología, evaluación y registro. La población planificada es de "+t.total+" estudiantes.");
      paragraph("El documento abarca metodología, requisitos, diseño y aplicación del examen, Núcleos de Titulación, distribución de estudiantes, capacidad técnica, imponderables, criterios de evaluación, cierre, trazabilidad y anexos operativos sustentados en información institucional del período.");

      heading("1.5. Principios del proceso",2,true);
      paragraph("La ejecución se orienta por los principios de transparencia, igualdad de oportunidades, pertinencia académica, trazabilidad, confidencialidad de instrumentos, accesibilidad, continuidad operativa y mejora continua. Toda excepción relevante debe contar con justificación, autorización y evidencia.");
      getAnalysisSentences(ctx,"general").forEach(p=>paragraph(p));
    }
  };
})();
