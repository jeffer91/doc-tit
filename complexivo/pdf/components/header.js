(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.components = ns.components || {};
  ns.components.header = {
    render(api) {
      const {doc,ctx,pageW,pageNo,headerDrawn,imageFormat} = api;
      if(headerDrawn.has(pageNo)) return;
      headerDrawn.add(pageNo);
      doc.setPage(pageNo);

      const x=36, top=22, totalW=pageW-72, h=58;
      const logoW=125, codeW=160, centerW=totalW-logoW-codeW;

      doc.setDrawColor(0);
      doc.setLineWidth(0.8);
      doc.rect(x,top,totalW,h);
      doc.line(x+logoW,top,x+logoW,top+h);
      doc.line(x+logoW+centerW,top,x+logoW+centerW,top+h);
      doc.line(x+logoW,top+h/2,x+logoW+centerW,top+h/2);

      if(ctx.assets && ctx.assets.logo){
        try{
          doc.addImage(ctx.assets.logo,imageFormat(ctx.assets.logo),x+6,top+6,logoW-12,h-12,undefined,"FAST");
        }catch(e){}
      }else{
        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("LOGO INSTITUCIONAL",x+logoW/2,top+h/2,{align:"center"});
      }

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.text("UNIDAD DE TITULACIÓN Y EFICIENCIA TERMINAL",x+logoW+centerW/2,top+18,{align:"center"});

      doc.setFont("helvetica","bold");
      doc.setFontSize(9);
      doc.text("Planificación De Examen Complexivo",x+logoW+centerW/2,top+h/2+10,{align:"center"});

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.text(ctx.period.name,x+logoW+centerW/2,top+h/2+22,{align:"center"});

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      doc.text("Código:",x+logoW+centerW+codeW/2,top+17,{align:"center"});

      doc.setFont("helvetica","bold");
      doc.setFontSize(9);
      const codeLines=doc.splitTextToSize(ctx.code,codeW-12);
      doc.text(codeLines,x+logoW+centerW+codeW/2,top+31,{align:"center"});
    }
  };
})();
