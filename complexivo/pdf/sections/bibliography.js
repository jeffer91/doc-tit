(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.bibliography = {
    render(api) {
      const {heading,paragraph,reference} = api;
      heading("13. Bibliografía y Referencias Normativas",1,true);
      paragraph("Las referencias se presentan con un criterio uniforme adaptado a APA 7 para normativa: autor corporativo, año, título, identificación normativa y fuente o resolución cuando corresponde.",{indent:false});

      [
        "Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador. Registro Oficial 449.",
        "Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior. Registro Oficial Suplemento 298.",
        "Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494). Suplemento del Registro Oficial No. 110.",
        "Instituto Superior Tecnológico Quito Metropolitano. (2025). Reglamento de la Unidad de Titulación y Eficiencia Terminal (UTET-REG-25, versión 2.0). Resolución N.° ITSQMET-OCS-2025-03-02/27-MAR-2025, 27 de marzo de 2025."
      ].forEach(reference);
    }
  };
})();
