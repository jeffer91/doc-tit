(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.index = {
    render(api) {
      const {toc,normalize,drawTOCPage} = api;
      const dedup=[];
      const seen=new Set();
      toc.forEach(e=>{
        const key=normalize(e.title);
        if(!key || seen.has(key)) return;
        seen.add(key);
        dedup.push(e);
      });
      drawTOCPage(2,"Índice",dedup);
    }
  };
})();
