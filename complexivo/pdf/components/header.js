(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.components = ns.components || {};

  const CM = 72 / 2.54;

  function fitImage(doc, dataUrl, maxW, maxH) {
    try {
      const props = doc.getImageProperties(dataUrl);
      const ratio = props.width / props.height;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      return { w, h };
    } catch (e) {
      return { w: maxW, h: maxH };
    }
  }

  ns.components.header = {
    render(api) {
      const {doc,ctx,pageW,pageNo,headerDrawn,imageFormat} = api;
      if(headerDrawn.has(pageNo)) return;
      headerDrawn.add(pageNo);
      doc.setPage(pageNo);

      const policy = ns.config?.policy || {};
      const title = policy.documentTitle || "Planificación del Examen Complexivo";
      const isCover = pageNo === 1;

      // Portada RGI: 18 cm de ancho, columnas 4,50 / 9,00 / 4,50 cm.
      const totalW = isCover ? 18 * CM : pageW - 60;
      const x = isCover ? (pageW - totalW) / 2 : 30;
      const top = isCover ? 1.5 * CM : 18;
      const h = isCover ? 3.4 * CM : 72;
      const colA = totalW * 0.25;
      const colB = totalW * 0.50;
      const colC = totalW * 0.25;
      const row1 = isCover ? 0.8 * CM : 22;
      const row2 = h - row1;
      const bx = x + colA;
      const cx = bx + colB;

      doc.setDrawColor(0);
      doc.setLineWidth(0.65);
      doc.setFillColor(255,255,255);
      doc.rect(x,top,totalW,h,"FD");
      doc.line(bx,top,bx,top+h);
      doc.line(cx,top,cx,top+h);
      doc.line(bx,top+row1,cx,top+row1);

      if(ctx.assets && ctx.assets.logo){
        try{
          const maxW = Math.min(colA - 10, 3.8 * CM);
          const maxH = Math.min(h - 10, 2.2 * CM);
          const fitted = fitImage(doc, ctx.assets.logo, maxW, maxH);
          const lx = x + (colA - fitted.w) / 2;
          const ly = top + (h - fitted.h) / 2;
          doc.addImage(ctx.assets.logo,imageFormat(ctx.assets.logo),lx,ly,fitted.w,fitted.h,undefined,"FAST");
        }catch(e){}
      }else{
        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("LOGO INSTITUCIONAL",x+colA/2,top+h/2,{align:"center"});
      }

      // Encabezado institucional: Arial 9 equivalente en jsPDF = Helvetica 9.
      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      const unit = "UNIDAD DE TITULACIÓN Y EFICIENCIA TERMINAL";
      const unitLines = doc.splitTextToSize(unit,colB-12);
      const unitLineH = 9.5;
      const unitY = top + (row1 - unitLines.length*unitLineH)/2 + 7.5;
      doc.text(unitLines,bx+colB/2,unitY,{align:"center",lineHeightFactor:1.05});

      // ÚNICAMENTE el título formal va a 23 pt.
      const titleSize = isCover ? 23 : 9;
      const titleLineH = isCover ? 23.5 : 10;
      doc.setFont("helvetica","bold");
      doc.setFontSize(titleSize);
      const titleLines = doc.splitTextToSize(title,colB-16);

      // El período permanece a 9 pt; no forma parte del título a 23 pt.
      const period = String(ctx.period?.name || "");
      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      const periodLines = period ? doc.splitTextToSize(period,colB-16) : [];
      const periodLineH = 10;

      const groupH = titleLines.length*titleLineH + (periodLines.length ? 8 + periodLines.length*periodLineH : 0);
      let groupY = top + row1 + (row2-groupH)/2 + (isCover ? 17 : 8);

      doc.setFont("helvetica","bold");
      doc.setFontSize(titleSize);
      doc.text(titleLines,bx+colB/2,groupY,{align:"center",lineHeightFactor:1.02});

      if(periodLines.length){
        groupY += titleLines.length*titleLineH + 8;
        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        doc.text(periodLines,bx+colB/2,groupY,{align:"center",lineHeightFactor:1.05});
      }

      // Control documental: Arial 9 equivalente = Helvetica 9.
      const code = String(ctx.code || "");
      doc.setFont("helvetica","bold");
      doc.setFontSize(9);
      doc.text("Código:",cx+colC/2,top+h/2-7,{align:"center"});
      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      const codeLines = doc.splitTextToSize(code,colC-10);
      doc.text(codeLines,cx+colC/2,top+h/2+6,{align:"center",lineHeightFactor:1.05});
    }
  };
})();
