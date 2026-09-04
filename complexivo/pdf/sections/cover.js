(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  const CM = 72 / 2.54;

  ns.sections.cover = {
    render(api) {
      const {doc,ctx,pageW,pageH,signatureBlock} = api;
      const policy=ns.config?.policy||{};
      const title=policy.documentTitle||"Planificación del Examen Complexivo";

      // Geometría según la guía maestra RGI.
      const headerTop = 1.5 * CM;
      const headerH = 2.8 * CM;
      const headerBottom = headerTop + headerH;
      const signatureTotalH = 4.2 * CM;
      const signatureTop = pageH - (1.5 * CM) - signatureTotalH;
      const contentTop = headerBottom + (2.5 * CM);
      const contentBottom = signatureTop - (1.5 * CM);
      const visualCenter = (contentTop + contentBottom) / 2;
      const blockW = 18 * CM;

      doc.setFont("helvetica","bold");
      doc.setFontSize(18);
      const titleLines=doc.splitTextToSize(title,blockW);
      const titleLineH=22;

      doc.setFontSize(16);
      const periodLines=doc.splitTextToSize(String(ctx.period?.name||""),blockW);
      const periodLineH=19;

      const groupH=titleLines.length*titleLineH + 14 + periodLines.length*periodLineH;
      let y=visualCenter-groupH/2+14;

      doc.setFont("helvetica","bold");
      doc.setFontSize(18);
      doc.text(titleLines,pageW/2,y,{align:"center",lineHeightFactor:1.05});
      y+=titleLines.length*titleLineH+14;

      doc.setFont("helvetica","bold");
      doc.setFontSize(16);
      doc.text(periodLines,pageW/2,y,{align:"center",lineHeightFactor:1.05});

      signatureBlock(signatureTop);
    }
  };
})();
