(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.components = ns.components || {};

  const CM = 72 / 2.54;

  ns.components.signatureBlock = {
    render(api, fixedTop=null) {
      const {doc,pageW,ensureSpace,getY,setY} = api;
      const institutional = ns.config?.institutional;
      if(!institutional) throw new Error("No se cargó la configuración institucional del PDF.");

      // Estándar común RGI/INF: 18 cm, 3 columnas de 6 cm y 4,20 cm de alto.
      const w = 18 * CM;
      const x = (pageW - w) / 2;
      const col = 6 * CM;
      const signH = 2.40 * CM;
      const nameH = 0.75 * CM;
      const roleH = 1.05 * CM;
      const totalH = signH + nameH + roleH;

      let y=getY();
      if(fixedTop==null){
        ensureSpace(totalH+24);
        y=getY()+8;
        setY(y);
      }
      const top=fixedTop==null?y:fixedTop;

      doc.setDrawColor(0);
      doc.setLineWidth(0.6);
      doc.setFillColor(255,255,255);

      for(let i=0;i<3;i++){
        const cx=x+i*col;
        doc.rect(cx,top,col,totalH,"FD");
        doc.line(cx,top+signH,cx+col,top+signH);
        doc.line(cx,top+signH+nameH,cx+col,top+signH+nameH);
      }

      const cells=[institutional.prepared,institutional.reviewed,institutional.approved];
      cells.forEach((cell,i)=>{
        const cx=x+i*col;

        // Fila 1: función y espacio reservado para firma/QR.
        doc.setFont("helvetica","normal");
        doc.setFontSize(8.5);
        doc.text(cell.label,cx+col/2,top+15,{align:"center"});
        doc.setFont("helvetica","bold");
        doc.setFontSize(8.2);
        doc.text("ÁREA DE FIRMA / QR DIGITAL",cx+col/2,top+31,{align:"center"});

        // Fila 2: nombre visible institucional.
        doc.setFont("helvetica","bold");
        doc.setFontSize(8);
        doc.text("NOMBRE:",cx+5,top+signH+13);
        doc.setFont("helvetica","normal");
        doc.setFontSize(8);
        const nameLines=doc.splitTextToSize(cell.name,col-50).slice(0,1);
        doc.text(nameLines,cx+44,top+signH+13);

        // Fila 3: cargo, permitiendo hasta dos líneas sin reducir de 8 pt.
        doc.setFont("helvetica","bold");
        doc.setFontSize(8);
        doc.text("CARGO:",cx+5,top+signH+nameH+10);
        doc.setFont("helvetica","normal");
        doc.setFontSize(8);
        const roleLines=doc.splitTextToSize(cell.role,col-10).slice(0,2);
        doc.text(roleLines,cx+5,top+signH+nameH+20,{lineHeightFactor:0.95});
      });

      if(fixedTop==null) setY(top+totalH+12);
      return totalH;
    }
  };
})();
