(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.bibliography = {
    render(api) {
      const {heading,paragraph,reference} = api;
      heading("13. Bibliografía y Referencias Normativas",1,true);
      paragraph("Se incluyen únicamente referencias normativas o institucionales identificables. La app no genera autores, años, páginas ni citas académicas cuando no existe una fuente real y verificable.",{indent:false});

      [
        "Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador.",
        "Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior.",
        "Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494, Suplemento del Registro Oficial No. 110, 21 de julio de 2022).",
        "Instituto Tecnológico Superior Quito Metropolitano. Reglamento institucional del Área de Titulación. Versión institucional vigente aplicable al período."
      ].forEach(reference);

      paragraph("Las referencias institucionales deben revisarse antes de cada nuevo período para confirmar denominación, versión y vigencia.",{indent:false,italic:true});
    }
  };
})();
