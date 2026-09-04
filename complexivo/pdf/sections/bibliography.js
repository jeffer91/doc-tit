(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  ns.sections.bibliography = {
    render(api) {
      const {heading,paragraph,reference} = api;
      heading("13. Bibliografía y Referencias Normativas",1,true);
      paragraph("Las referencias se presentan con un criterio uniforme de autor corporativo, año, título y fuente normativa. No se incorporan referencias institucionales genéricas cuando no se dispone de una identificación formal verificable.",{indent:false});

      [
        "Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador. Registro Oficial 449.",
        "Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior. Registro Oficial Suplemento 298.",
        "Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494). Suplemento del Registro Oficial No. 110."
      ].forEach(reference);

      paragraph("Antes de emitir la planificación definitiva, las referencias institucionales adicionales deben incorporarse únicamente cuando se disponga del nombre formal, versión o fecha del documento vigente.",{indent:false,italic:true});
    }
  };
})();
