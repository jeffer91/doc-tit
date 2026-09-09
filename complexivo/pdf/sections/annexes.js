(() => {
  "use strict";
  const ns = window.DOC_TIT_COMPLEXIVO_PDF = window.DOC_TIT_COMPLEXIVO_PDF || {};
  ns.sections = ns.sections || {};

  const FORMS = {
    blue: "#5B74F2",
    magenta: "#E50087",
    teal: "#2BA3A3",
    violet: "#7157D9",
    amber: "#D89B22",
    ink: "#202124",
    muted: "#5F6368",
    card: "#F7F8FC",
    border: "#E4E7EF",
    success: "#1E8E3E",
    softBlue: "#EEF1FF"
  };

  function hexToRgb(hex){
    const clean=String(hex||"").replace("#","");
    const value=parseInt(clean.length===3?clean.split("").map(c=>c+c).join(""):clean,16);
    return [(value>>16)&255,(value>>8)&255,value&255];
  }

  function setFill(doc,hex){ const [r,g,b]=hexToRgb(hex); doc.setFillColor(r,g,b); }
  function setDraw(doc,hex){ const [r,g,b]=hexToRgb(hex); doc.setDrawColor(r,g,b); }
  function setText(doc,hex){ const [r,g,b]=hexToRgb(hex); doc.setTextColor(r,g,b); }

  function roundedCard(doc,x,y,w,h){
    setFill(doc,FORMS.card);
    setDraw(doc,FORMS.border);
    doc.setLineWidth(0.6);
    if(typeof doc.roundedRect === "function") doc.roundedRect(x,y,w,h,10,10,"FD");
    else doc.rect(x,y,w,h,"FD");
  }

  function canvasBase(width,height){
    if(typeof document === "undefined") return null;
    const canvas=document.createElement("canvas");
    canvas.width=width;
    canvas.height=height;
    return canvas;
  }

  function donutDataUrl(parts){
    const canvas=canvasBase(520,520);
    if(!canvas) return null;
    const c=canvas.getContext("2d");
    c.clearRect(0,0,canvas.width,canvas.height);
    const total=parts.reduce((s,p)=>s+Math.max(0,Number(p.value)||0),0)||1;
    const colors=[FORMS.blue,FORMS.magenta,FORMS.teal,FORMS.violet,FORMS.amber];
    let angle=-Math.PI/2;
    parts.forEach((p,i)=>{
      const value=Math.max(0,Number(p.value)||0);
      if(value<=0) return;
      const next=angle+(value/total)*Math.PI*2;
      c.beginPath();
      c.strokeStyle=colors[i%colors.length];
      c.lineWidth=58;
      c.lineCap="butt";
      c.arc(260,260,155,angle,next);
      c.stroke();
      angle=next;
    });
    c.beginPath();
    c.fillStyle="#FFFFFF";
    c.arc(260,260,112,0,Math.PI*2);
    c.fill();
    c.fillStyle=FORMS.ink;
    c.textAlign="center";
    c.font="600 48px Arial";
    c.fillText(String(parts.reduce((s,p)=>s+(Number(p.value)||0),0)),260,250);
    c.fillStyle=FORMS.muted;
    c.font="26px Arial";
    c.fillText("estudiantes",260,292);
    return canvas.toDataURL("image/png");
  }

  function progressRingDataUrl(done,total){
    const canvas=canvasBase(420,420);
    if(!canvas) return null;
    const c=canvas.getContext("2d");
    const safeTotal=Math.max(1,total);
    const ratio=Math.max(0,Math.min(1,done/safeTotal));
    c.clearRect(0,0,canvas.width,canvas.height);
    c.beginPath();
    c.strokeStyle="#E6E9F1";
    c.lineWidth=44;
    c.arc(210,210,130,0,Math.PI*2);
    c.stroke();
    c.beginPath();
    c.strokeStyle=ratio===1?FORMS.blue:FORMS.magenta;
    c.lineWidth=44;
    c.lineCap="round";
    c.arc(210,210,130,-Math.PI/2,-Math.PI/2+ratio*Math.PI*2);
    c.stroke();
    c.fillStyle=FORMS.ink;
    c.textAlign="center";
    c.font="700 54px Arial";
    c.fillText(`${done}/${total}`,210,205);
    c.fillStyle=FORMS.muted;
    c.font="24px Arial";
    c.fillText("controles",210,247);
    return canvas.toDataURL("image/png");
  }

  function barsDataUrl(rows){
    const canvas=canvasBase(1180,720);
    if(!canvas) return null;
    const c=canvas.getContext("2d");
    c.clearRect(0,0,canvas.width,canvas.height);
    const max=Math.max(1,...rows.map(r=>Number(r.value)||0));
    const labelX=20;
    const barX=430;
    const barMax=620;
    const top=25;
    const rowH=Math.max(46,Math.floor((canvas.height-50)/Math.max(1,rows.length)));
    c.textBaseline="middle";
    rows.forEach((r,i)=>{
      const y=top+i*rowH+rowH/2;
      const raw=String(r.label||"");
      const label=raw.length>41?raw.slice(0,39)+"…":raw;
      c.fillStyle=FORMS.ink;
      c.font="22px Arial";
      c.textAlign="left";
      c.fillText(label,labelX,y);
      c.fillStyle="#E8EBF3";
      c.fillRect(barX,y-11,barMax,22);
      c.fillStyle=[FORMS.blue,FORMS.magenta,FORMS.teal,FORMS.violet][i%4];
      c.fillRect(barX,y-11,Math.max(3,(Number(r.value)||0)/max*barMax),22);
      c.fillStyle=FORMS.ink;
      c.font="600 21px Arial";
      c.textAlign="right";
      c.fillText(String(Number(r.value)||0),1160,y);
    });
    return canvas.toDataURL("image/png");
  }

  function scheduleRange(row,formatDateShort){
    if(!row) return "";
    const start=row.start?formatDateShort(row.start):"";
    const end=row.end?formatDateShort(row.end):"";
    if(start&&end&&start!==end) return `${start} – ${end}`;
    return start||end;
  }

  ns.sections.annexes = {
    render(api) {
      const {
        doc,ctx,heading,paragraph,BODY,bodyW,ensureSpace,getY,setY,
        totals,formatDateShort,policy
      } = api;
      const distribution=(ctx.distribution||[]).filter(r=>r&&r.career&&r.place&&Number(r.count)>=0);
      const schedule=(ctx.schedule||[]).filter(r=>r&&(r.activity||r.start||r.end));
      if(!distribution.length && !schedule.length) return;

      const t=totals(distribution);
      const places=Object.entries(t.byPlace).map(([label,value])=>({label,value:Number(value)||0}));
      const placeTotal=places.reduce((s,p)=>s+p.value,0);
      const colors=[FORMS.blue,FORMS.magenta,FORMS.teal,FORMS.violet,FORMS.amber];

      heading("14. Anexos Gráficos y Evidencias de Planificación",1,true);
      paragraph("Los anexos presentan la información consolidada del período mediante indicadores y gráficos generados automáticamente a partir de los mismos datos utilizados en la planificación. No se imprimen casillas vacías, valores ficticios ni expresiones pendientes de definición.",{indent:false});

      if(distribution.length){
        const cardH=246;
        ensureSpace(cardH+82);
        heading("14.1. Anexo A - Resumen de población y lugar de ejecución",2,true);
        const x=BODY.left,y=getY(),w=bodyW;
        roundedCard(doc,x,y,w,cardH);

        setText(doc,FORMS.ink);
        doc.setFont("helvetica","normal");
        doc.setFontSize(9.5);
        doc.text("Población consolidada del período",x+16,y+24);
        doc.setFont("helvetica","bold");
        doc.setFontSize(30);
        doc.text(String(t.total),x+44,y+78);
        doc.setFont("helvetica","normal");
        doc.setFontSize(10);
        setText(doc,FORMS.muted);
        doc.text("Estudiantes",x+44,y+96);

        let legendY=y+130;
        places.forEach((p,i)=>{
          const [r,g,b]=hexToRgb(colors[i%colors.length]);
          doc.setFillColor(r,g,b);
          doc.circle(x+18,legendY-3,3.1,"F");
          setText(doc,FORMS.ink);
          doc.setFont("helvetica","normal");
          doc.setFontSize(8.8);
          const pct=placeTotal?((p.value/placeTotal)*100).toFixed(1).replace(".0",""):"0";
          doc.text(`${p.label}: ${p.value} (${pct} %)`,x+29,legendY);
          legendY+=19;
        });

        const donut=donutDataUrl(places);
        if(donut) doc.addImage(donut,"PNG",x+w-198,y+30,160,160,undefined,"FAST");
        setText(doc,FORMS.muted);
        doc.setFont("helvetica","normal");
        doc.setFontSize(8.2);
        doc.text(`${distribution.length} grupos carrera-modalidad registrados`,x+w-198,y+211);
        setY(y+cardH+18);
      }

      if(distribution.length){
        const ranked=distribution.slice().sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0));
        const chunks=[];
        for(let i=0;i<ranked.length;i+=12) chunks.push(ranked.slice(i,i+12));
        ensureSpace(414);
        heading("14.2. Anexo B - Distribución por carrera y modalidad",2,true);
        chunks.forEach((chunk,index)=>{
          const cardH=330;
          ensureSpace(cardH+16);
          const x=BODY.left,y=getY(),w=bodyW;
          roundedCard(doc,x,y,w,cardH);
          setText(doc,FORMS.ink);
          doc.setFont("helvetica","normal");
          doc.setFontSize(9.5);
          doc.text(index===0?"Carreras y modalidades con estudiantes registrados":"Continuación de carreras y modalidades",x+16,y+24);
          doc.setFont("helvetica","bold");
          doc.setFontSize(22);
          doc.text(String(ranked.length),x+16,y+58);
          doc.setFont("helvetica","normal");
          doc.setFontSize(9);
          setText(doc,FORMS.muted);
          doc.text("grupos carrera-modalidad",x+16,y+74);
          const bars=barsDataUrl(chunk.map(r=>({label:r.career,value:Number(r.count)||0})));
          if(bars) doc.addImage(bars,"PNG",x+14,y+88,w-28,222,undefined,"FAST");
          setY(y+cardH+18);
        });
      }

      if(schedule.length){
        const rows=schedule.filter(r=>r.start||r.end);
        const cardH=Math.min(410,92+rows.length*30);
        ensureSpace(cardH+84);
        heading("14.3. Anexo C - Cronograma general del proceso",2,true);
        const x=BODY.left,y=getY(),w=bodyW;
        roundedCard(doc,x,y,w,cardH);
        setText(doc,FORMS.ink);
        doc.setFont("helvetica","normal");
        doc.setFontSize(9.5);
        doc.text("Actividades programadas",x+16,y+24);
        doc.setFont("helvetica","bold");
        doc.setFontSize(27);
        doc.text(String(rows.length),x+20,y+63);
        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        setText(doc,FORMS.muted);
        doc.text("actividades con fecha",x+20,y+80);

        let ry=y+105;
        rows.forEach((r,i)=>{
          const [cr,cg,cb]=hexToRgb(colors[i%colors.length]);
          doc.setFillColor(cr,cg,cb);
          if(typeof doc.roundedRect === "function") doc.roundedRect(x+18,ry-10,6,19,3,3,"F");
          else doc.rect(x+18,ry-10,6,19,"F");
          setText(doc,FORMS.ink);
          doc.setFont("helvetica","bold");
          doc.setFontSize(8.8);
          doc.text(String(r.activity||"Actividad"),x+34,ry);
          doc.setFont("helvetica","normal");
          doc.setFontSize(8.4);
          setText(doc,FORMS.muted);
          doc.text(scheduleRange(r,formatDateShort),x+w-16,ry,{align:"right"});
          ry+=28;
        });
        setY(y+cardH+18);
      }

      ensureSpace(370);
      heading("14.4. Anexo D – Control de consistencia de la planificación",2,true);
      const ev=policy.evaluation||{};
      const scheduleComplete=schedule.length===9 && schedule.every(r=>r.start&&r.end);
      const rangesValid=schedule.every(r=>!r.start||!r.end||r.start<=r.end);
      const dated=schedule.filter(r=>r.start);
      const chronological=dated.every((r,i)=>i===0||r.start>=dated[i-1].start);
      const distributionComplete=distribution.length>0&&distribution.every(r=>r.career&&r.place&&Number.isFinite(Number(r.count))&&Number(r.count)>=0);
      const totalsMatch=t.total===placeTotal;
      const weightsOk=Number(ev.theoreticalWeight)+Number(ev.practicalWeight)===100;
      const gradeOk=Number(ev.minimumGrade)>=0&&Number(ev.minimumGrade)<=Number(ev.gradeScale);
      const modalityOk=String(policy.modality?.generalRule||"").toLowerCase()==="presencial";
      const checks=[
        {label:"Distribución completa",value:`${distribution.length} grupos`,ok:distributionComplete},
        {label:"Total por lugares",value:`${placeTotal} / ${t.total}`,ok:totalsMatch},
        {label:"Cronograma completo",value:`${schedule.filter(r=>r.start&&r.end).length} / 9`,ok:scheduleComplete},
        {label:"Rangos de fechas",value:rangesValid?"Sin inconsistencias":"Revisar",ok:rangesValid},
        {label:"Orden cronológico",value:chronological?"Consistente":"Revisar",ok:chronological},
        {label:"Ponderación",value:`${Number(ev.theoreticalWeight)||0} % + ${Number(ev.practicalWeight)||0} %`,ok:weightsOk},
        {label:"Nota mínima",value:`${ev.minimumGrade}/${ev.gradeScale}`,ok:gradeOk},
        {label:"Modalidad general",value:policy.modality?.generalRule||"",ok:modalityOk}
      ];
      const okCount=checks.filter(c=>c.ok).length;
      const cardH=285;
      ensureSpace(cardH+14);
      const x=BODY.left,y=getY(),w=bodyW;
      roundedCard(doc,x,y,w,cardH);
      setText(doc,FORMS.ink);
      doc.setFont("helvetica","normal");
      doc.setFontSize(9.5);
      doc.text("Controles automáticos del documento",x+16,y+24);
      doc.setFont("helvetica","bold");
      doc.setFontSize(25);
      doc.text(`${okCount} de ${checks.length}`,x+20,y+63);
      doc.setFont("helvetica","normal");
      doc.setFontSize(9);
      setText(doc,FORMS.muted);
      doc.text("controles consistentes",x+20,y+80);

      const ring=progressRingDataUrl(okCount,checks.length);
      if(ring) doc.addImage(ring,"PNG",x+w-151,y+17,126,126,undefined,"FAST");

      let cy=y+116;
      checks.forEach((c,i)=>{
        const col=i<4?0:1;
        const row=i%4;
        const cx=x+18+col*(w/2);
        const yy=cy+row*36;
        setFill(doc,c.ok?FORMS.softBlue:"#FDECF5");
        if(typeof doc.roundedRect === "function") doc.roundedRect(cx,yy-12,w/2-30,28,6,6,"F");
        else doc.rect(cx,yy-12,w/2-30,28,"F");
        setText(doc,c.ok?FORMS.blue:FORMS.magenta);
        doc.setFont("helvetica","bold");
        doc.setFontSize(9.2);
        doc.text(c.ok?"✓":"!",cx+10,yy+5);
        setText(doc,FORMS.ink);
        doc.setFont("helvetica","bold");
        doc.setFontSize(7.9);
        doc.text(c.label,cx+24,yy-1);
        doc.setFont("helvetica","normal");
        doc.setFontSize(7.5);
        setText(doc,FORMS.muted);
        doc.text(String(c.value),cx+24,yy+9);
      });
      setY(y+cardH+18);

      doc.setFont("times","normal");
      doc.setFontSize(BODY.fontSize||12);
      doc.setTextColor(0,0,0);
      doc.setDrawColor(0,0,0);
    }
  };
})();
