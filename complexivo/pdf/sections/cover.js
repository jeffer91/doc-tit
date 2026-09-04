(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.cover = {
    render(api) {
      const {doc,ctx,pageW,pageH,signatureBlock} = api;
      const signatureTotalH=112+34+48;
      const signatureTop=pageH-52-signatureTotalH;
      const contentTop=112;
      const contentBottom=signatureTop-42;
      const visualCenter=(contentTop+contentBottom)/2;

      doc.setFont("helvetica","bold");
      doc.setFontSize(23);
      const titleLines=doc.splitTextToSize("Planificación De Examen Complexivo",pageW-120);
      const titleY=visualCenter-(titleLines.length*28)/2-18;
      doc.text(titleLines,pageW/2,titleY,{align:"center"});

      doc.setFont("helvetica","bold");
      doc.setFontSize(17);
      doc.text(ctx.period.name,pageW/2,titleY+titleLines.length*28+32,{align:"center"});

      signatureBlock(signatureTop);
    }
  };
})();
