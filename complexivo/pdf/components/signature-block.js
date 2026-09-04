(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.components = ns.components || {};

  function fromContext(ctx){
    const source = ctx?.institutional || {};
    const fallback = ns.config?.institutional || {};
    return {
      prepared: {
        label: "ELABORADO POR:",
        name: source.preparedBy || fallback.prepared?.name || "Mgs. Jefferson Villarreal",
        role: source.preparedRole || fallback.prepared?.role || "Coordinador de Titulación y Eficiencia Terminal"
      },
      reviewed: {
        label: "REVISADO POR:",
        name: source.reviewedBy || fallback.reviewed?.name || "Ing. Martha Tomalá",
        role: source.reviewedRole || fallback.reviewed?.role || "Coordinadora General de Carreras"
      },
      approved: {
        label: "APROBADO POR:",
        name: source.approvedBy || fallback.approved?.name || "Dr. Alex León",
        role: source.approvedRole || fallback.approved?.role || "Vicerrector"
      }
    };
  }

  ns.components.signatureBlock = {
    render(api, fixedTop=null) {
      const {doc,pageW,ensureSpace,getY,setY,ctx} = api;
      const institutional = fromContext(ctx);

      const x=36;
      const w=pageW-72;
      const col=w/3;
      const titleAndSignH=112;
      const nameH=34;
      const roleH=48;
      const totalH=titleAndSignH+nameH+roleH;

      let y=getY();
      if(fixedTop==null){
        ensureSpace(totalH+24);
        y=getY()+8;
        setY(y);
      }
      const top=fixedTop==null?y:fixedTop;

      doc.setDrawColor(0);
      doc.setLineWidth(0.7);

      for(let i=0;i<3;i++){
        const cx=x+i*col;
        doc.rect(cx,top,col,totalH);
        doc.line(cx,top+titleAndSignH,cx+col,top+titleAndSignH);
        doc.line(cx,top+titleAndSignH+nameH,cx+col,top+titleAndSignH+nameH);
      }

      const cells=[institutional.prepared,institutional.reviewed,institutional.approved];
      cells.forEach((cell,i)=>{
        const cx=x+i*col;
        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        doc.text(cell.label,cx+7,top+17);

        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("NOMBRE:",cx+7,top+titleAndSignH+20);

        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        const nameX=cx+55;
        const nameLines=doc.splitTextToSize(cell.name,col-62);
        doc.text(nameLines,nameX,top+titleAndSignH+20);

        doc.setFont("helvetica","bold");
        doc.setFontSize(9);
        doc.text("CARGO:",cx+7,top+titleAndSignH+nameH+18);

        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        const roleLines=doc.splitTextToSize(cell.role,col-14);
        doc.text(roleLines,cx+7,top+titleAndSignH+nameH+33);
      });

      if(fixedTop==null) setY(top+totalH+12);
      return totalH;
    }
  };
})();
