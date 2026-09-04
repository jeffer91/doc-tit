(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.bibliography = {
    render(api) {
      const {doc,ctx,pageW,pageH,bodyW,BODY,heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,formatDateShort,formatDateLong,lowerPeriod,normalize,totals,insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,getAnalysisSentences} = api;
        function referencesSection(){
          heading("11. Bibliografía",1,true);
          paragraph("Las referencias normativas e institucionales se presentan en formato APA 7 con sangría francesa.",{indent:false});

          [
            "Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador.",
            "Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior.",
            "Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494, Suplemento del Registro Oficial No. 110, 21 de julio de 2022).",
            "Instituto Tecnológico Superior Quito Metropolitano. (2022). Reglamento del Área de Titulación del ITSQMET."
          ].forEach(reference);
        }

        const insertedSectionImages=new Set();

      referencesSection();
    }
  };
})();
