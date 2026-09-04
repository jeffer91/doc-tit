(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};
  ns.sections.index = {
    render(api) {
      const {toc,normalize,drawTOCPage,tocEntryHeight,BODY,pageH} = api;
      const dedup=[];
      const seen=new Set();
      toc.forEach(e=>{
        const key=normalize(e.title);
        if(!key || seen.has(key)) return;
        seen.add(key);
        dedup.push(e);
      });

      const pages=[[],[],[]];
      const available=pageH-BODY.top-BODY.bottom-42;
      let pageIndex=0;
      let used=0;

      dedup.forEach(entry=>{
        const h=tocEntryHeight(entry);
        if(used+h>available && pageIndex<pages.length-1){
          pageIndex+=1;
          used=0;
        }
        pages[pageIndex].push(entry);
        used+=h;
      });

      drawTOCPage(2,"Índice",pages[0]);
      if(pages[1].length) drawTOCPage(3,"Índice - continuación",pages[1]);
      if(pages[2].length) drawTOCPage(4,"Índice - continuación",pages[2]);
    }
  };
})();
