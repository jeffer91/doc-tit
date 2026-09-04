(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.components = ns.components || {};
  ns.components.footer = {
    render(api) {
      const {doc,pageW,pageH} = api;
      const total=doc.getNumberOfPages();
      // La portada RGI no muestra paginación. Las páginas interiores conservan numeración automática.
      for(let p=2;p<=total;p++){
        doc.setPage(p);
        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        doc.text("Página "+p+" de "+total,pageW-36,pageH-22,{align:"right"});
      }
      return total;
    }
  };
})();
