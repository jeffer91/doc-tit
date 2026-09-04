(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.components = ns.components || {};

  function formatMetaDate(value){
    if(!value) return "";
    const d = new Date(String(value).slice(0,10) + "T12:00:00");
    if(Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
  }

  ns.components.header = {
    render(api) {
      const {doc,ctx,pageW,pageNo,headerDrawn,imageFormat} = api;
      if(headerDrawn.has(pageNo)) return;
      headerDrawn.add(pageNo);
      doc.setPage(pageNo);

      const policy = ns.config?.policy || {};
      const title = policy.documentTitle || "Planificación del Examen Complexivo";
      const version = ctx.meta?.version || ctx.doc?.version || policy.version || "1.0";
      const elaborationDate = formatMetaDate(ctx.meta?.elaborationDate);
      const x=30, top=18, totalW=pageW-60, h=72;
      const logoW=112, metaW=150, centerW=totalW-logoW-metaW;
      const metaX=x+logoW+centerW;

      doc.setDrawColor(0);
      doc.setLineWidth(0.75);
      doc.rect(x,top,totalW,h);
      doc.line(x+logoW,top,x+logoW,top+h);
      doc.line(metaX,top,metaX,top+h);

      if(ctx.assets && ctx.assets.logo){
        try{
          doc.addImage(ctx.assets.logo,imageFormat(ctx.assets.logo),x+6,top+7,logoW-12,h-14,undefined,"FAST");
        }catch(e){}
      }else{
        doc.setFont("helvetica","bold");
        doc.setFontSize(8.5);
        doc.text("LOGO INSTITUCIONAL",x+logoW/2,top+h/2,{align:"center"});
      }

      doc.setFont("helvetica","normal");
      doc.setFontSize(8.3);
      doc.text("UNIDAD DE TITULACIÓN Y EFICIENCIA TERMINAL",x+logoW+centerW/2,top+16,{align:"center"});

      doc.setFont("helvetica","bold");
      doc.setFontSize(9);
      const titleLines=doc.splitTextToSize(title,centerW-14);
      doc.text(titleLines,x+logoW+centerW/2,top+32,{align:"center"});

      doc.setFont("helvetica","normal");
      doc.setFontSize(8.5);
      doc.text(ctx.period.name,x+logoW+centerW/2,top+61,{align:"center"});

      const rows=[
        ["Código",ctx.code||""],
        ["Versión",version],
        ["Fecha de Elaboración",elaborationDate]
      ];
      const rowH=h/3;
      rows.forEach((row,i)=>{
        if(i>0) doc.line(metaX,top+i*rowH,x+totalW,top+i*rowH);
        const cy=top+i*rowH;
        doc.setFont("helvetica","bold");
        doc.setFontSize(7.2);
        doc.text(row[0]+":",metaX+5,cy+9);
        doc.setFont("helvetica","normal");
        doc.setFontSize(7.5);
        const lines=doc.splitTextToSize(String(row[1]||""),metaW-10).slice(0,2);
        doc.text(lines,metaX+5,cy+18);
      });
    }
  };
})();
