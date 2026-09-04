(() => {
  "use strict";

  const SOURCE_PAGE_COUNT = 45;
  let templatePromise = null;

  const PDF_MODULES = window.DOC_TIT_COMPLEXIVO_PDF || {};
const BODY = PDF_MODULES.config?.layout?.body || {
  left: 72,
  right: 72,
  top: 108,
  bottom: 62,
  fontSize: 12,
  lineHeight: 24,
  paragraphIndent: 36
};

  function clean(v){ return String(v == null ? "" : v).replace(/\s+/g," ").trim(); }

  function collapseSpacedCharacters(v){
    return String(v||"").replace(/(?:\b[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]\b\s+){3,}\b[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]\b/g,m=>m.replace(/\s+/g,""));
  }

  function cleanLegacyText(v){
    return collapseSpacedCharacters(clean(v)
      .replace(/%ª/g,"•")
      .replace(/\bo\s+A los estudiantes\b/gi,"A los estudiantes")
      .replace(/\bo\s+Criterios de evaluación:/gi,"Criterios de evaluación:")
      .replace(/\bo\s+La cantidad de estudiantes por grupo\b/gi,"• La cantidad de estudiantes por grupo")
      .replace(/\bo\s+Los requerimientos técnicos o de software\b/gi,"• Los requerimientos técnicos o de software")
      .replace(/\bo\s+Pruebas técnicas previas\b/gi,"• Pruebas técnicas previas")
      .replace(/\bo\s+Presencia de personal de soporte\b/gi,"• Presencia de personal de soporte")
      .replace(/\bo\s+Coordinación con la unidad de infraestructura tecnológica institucional\b/gi,"• Coordinación con la unidad de infraestructura tecnológica institucional")
      .replace(/\s+%\s*/g," ")
      .replace(/\s+•\s+/g," • "));
  }

  function sourceProse(v){
    const text=cleanLegacyText(v);
    if(!text) return "";
    const parts=text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text];
    const kept=parts.filter(s=>{
      const citation=/\(\d{4}\)/.test(s);
      const citationCue=/(según|de acuerdo con|quien(?:es)?|afirma|señala|menciona|destaca|en palabras de)/i.test(s);
      return !(citation&&citationCue);
    });
    return clean(kept.join(" "));
  }

  function normalize(v){
    return clean(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  }
  function lowerPeriod(name){
    const s=String(name||"");
    return s ? s.charAt(0).toLowerCase()+s.slice(1) : s;
  }
  function joinNatural(items){
    const values=(items||[]).map(v=>String(v||"").trim()).filter(Boolean);
    if(values.length<=1) return values[0]||"";
    if(values.length===2) return values[0]+" y "+values[1];
    return values.slice(0,-1).join(", ")+" y "+values[values.length-1];
  }
  function formatDateShort(v){
    if(!v) return "";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
  }
  function formatDateLong(v){
    if(!v) return "";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"long",year:"numeric"}).format(d);
  }

  async function decodeTemplatePages(){
    if(templatePromise) return templatePromise;
    templatePromise=(async()=>{
      const chunks=window.DOC_TIT_TEMPLATE_CHUNKS || [];
      if(chunks.length !== 4 || chunks.some(x=>!x)) throw new Error("No se encontró la plantilla completa.");
      if(typeof DecompressionStream === "undefined") throw new Error("Usa una versión actualizada de Chrome o Edge.");
      const binary=atob(chunks.join(""));
      const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      const text=await new Response(stream).text();
      const pages=JSON.parse(text);
      if(!Array.isArray(pages) || pages.length !== SOURCE_PAGE_COUNT) throw new Error("La plantilla base no contiene las 45 páginas esperadas.");
      return pages;
    })();
    return templatePromise;
  }

  function replacePeriod(text, period){
    const current=String(period.name||"");
    const lower=lowerPeriod(current);
    return String(text||"")
      .replace(/Octubre\s+2025\s+A\s+Marzo\s+2026/gi,current)
      .replace(/octubre\s+2025\s*[–-]\s*marzo\s+2026/gi,lower)
      .replace(/octubre\s+2025\s+a\s+marzo\s+2026/gi,lower);
  }

  function stripTemplateHeaders(text, period){
    return replacePeriod(text,period).split(/\r?\n/).map(x=>x.trim()).filter(t=>{
      if(!t) return false;
      if(/^Página\s+\d+\s+de\s+45$/i.test(t)) return false;
      if(/^UNIDAD TITULACIÓN Y EFICIENCIA/i.test(t)) return false;
      if(/^TERMINAL$/i.test(t)) return false;
      if(/^Código:/i.test(t)) return false;
      if(/^UTET-RGI/i.test(t)) return false;
      if(/^Versión:/i.test(t)) return false;
      if(/^Fecha de Elaboración:/i.test(t)) return false;
      if(/^\d{1,2}\s*-\s*[A-Za-zÁÉÍÓÚáéíóúÑñ]+\s*-\s*\d{4}$/i.test(t)) return false;
      if(/^Planificación De Examen Complexivo/i.test(t)) return false;
      if(normalize(t)===normalize(period.name)) return false;
      return true;
    });
  }

  function lineType(t){
    if(/^[1-4]\.\s+(Reforzar los conocimientos teóricos|Desarrollar habilidades prácticas|Evaluación a través de talleres|Orientación y asesoría):/i.test(t)) return "label";
    if(/^\d+\.\d+\.\d+\.\s+/.test(t)) return "h3";
    if(/^\d+\.\d+\.\s+/.test(t)) return "h2";
    if(/^\d+\.\s+/.test(t)) return "h1";
    if(/^[•]/.test(t)) return "bullet";
    if(/^(Descripción|Objetivo|Características|Requisitos|Condiciones|Beneficios|Procedimiento|Importancia|Estructura|Duración|Modalidad online|Consideraciones técnicas|Asignación por carrera|Distribución por sedes|Ponderación y aprobación):?/i.test(t)) return "label";
    return "p";
  }

  function parseSourceBlocks(pages,period){
    const lines=[];
    for(let p=6;p<=45;p++){
      const stripped=stripTemplateHeaders(pages[p-1],period);
      stripped.forEach(x=>lines.push(x));
    }

    const blocks=[];
    let paragraph=[];

    const flush=()=>{
      if(!paragraph.length) return;
      const t=cleanLegacyText(paragraph.join(" "));
      if(t) blocks.push({type:"p",text:t});
      paragraph=[];
    };

    lines.forEach(t=>{
      const type=lineType(t);
      if(type==="p"){
        paragraph.push(t);
      }else{
        flush();
        blocks.push({type,text:cleanLegacyText(t)});
      }
    });
    flush();
    return blocks;
  }

  function imageFormat(dataUrl){
    if(/^data:image\/png/i.test(dataUrl||"")) return "PNG";
    if(/^data:image\/webp/i.test(dataUrl||"")) return "WEBP";
    return "JPEG";
  }

  function smartSectionKey(heading){
    const h=normalize(heading);
    if(h.includes("metodologia") || h.includes("induccion") || h.includes("diseno del examen")) return "metodologia";
    if(h.includes("requisitos para titulacion") || h.includes("requisitos academicos") || h.includes("requisitos de documentacion") || h.includes("requisitos financieros")) return "requisitos";
    if(h.includes("organizacion y distribucion") || h.includes("asignacion de laboratorios") || h.includes("distribucion de estudiantes")) return "logistica";
    if(h.includes("evaluacion") || h.includes("componente teorico") || h.includes("componente practico")) return "evaluacion";
    if(h.includes("cronogramas")) return "cronograma";
    return null;
  }

  function getAnalysisSentences(ctx,key){
    const sections=ctx.analysis && ctx.analysis.sections ? ctx.analysis.sections : {};
    return Array.isArray(sections[key]) ? sections[key] : [];
  }

  function totals(distribution){
    const byPlace={};
    let total=0;
    (distribution||[]).forEach(r=>{
      const n=Number(r.count)||0;
      const p=r.place||"Sin lugar";
      byPlace[p]=(byPlace[p]||0)+n;
      total+=n;
    });
    return {byPlace,total};
  }

  function resizeImage(file,maxW=1200,maxH=500){
    return new Promise((resolve,reject)=>{
      if(!file){resolve(null);return;}
      if(!/^image\//.test(file.type)){reject(new Error("Selecciona un archivo de imagen."));return;}
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error("No se pudo leer la imagen."));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error("La imagen no es válida."));
        img.onload=()=>{
          const scale=Math.min(1,maxW/img.width,maxH/img.height);
          const w=Math.max(1,Math.round(img.width*scale));
          const h=Math.max(1,Math.round(img.height*scale));
          const canvas=document.createElement("canvas");
          canvas.width=w; canvas.height=h;
          canvas.getContext("2d").drawImage(img,0,0,w,h);
          const type=file.type==="image/png"?"image/png":"image/jpeg";
          resolve(canvas.toDataURL(type,type==="image/jpeg"?0.9:undefined));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function generateAndDownload(ctx,filename){
    if(!window.jspdf || !window.jspdf.jsPDF) throw new Error("No se pudo cargar el generador PDF.");
    const { jsPDF }=window.jspdf;
    const doc=new jsPDF({unit:"pt",format:"a4",compress:true,putOnlyUsedFonts:true});
    const policy=window.DOC_TIT_COMPLEXIVO_PDF?.config?.policy || {};
    const elaborationDate=ctx.meta?.elaborationDate || new Date().toISOString().slice(0,10);
    const elaborationDateDisplay=(()=>{
      const d=new Date(elaborationDate+"T12:00:00");
      return Number.isNaN(d.getTime())?String(elaborationDate):new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
    })();
    ctx.meta={...(ctx.meta||{}),version:ctx.meta?.version||ctx.doc?.version||policy.version||"1.0",elaborationDate,elaborationDateDisplay};
    ctx.policy=policy;
    doc.setProperties({
      title:policy.documentTitle||"Planificación del Examen Complexivo",
      subject:ctx.period.name,
      author:"Unidad de Titulación y Eficiencia Terminal",
      keywords:"titulación, examen complexivo, planificación, DOC-TIT v15"
    });

    const pageW=doc.internal.pageSize.getWidth();
    const pageH=doc.internal.pageSize.getHeight();
    const bodyW=pageW-BODY.left-BODY.right;
    let y=BODY.top;
    const toc=[];
    const headerDrawn=new Set();
    const analysisInjected=new Set();
    const insertedSectionImages=new Set();
    let tableCounter=0;
    let figureCounter=0;

    function drawHeader(pageNo){
    const component=window.DOC_TIT_COMPLEXIVO_PDF?.components?.header;
    if(!component?.render) throw new Error("No se cargó el componente de encabezado del PDF.");
    component.render({doc,ctx,pageW,pageH,BODY,pageNo,headerDrawn,imageFormat});
  }

    function newPage(){
      doc.addPage();
      y=BODY.top;
      drawHeader(doc.getNumberOfPages());

      // La cabecera usa Helvetica; el cuerpo académico siempre vuelve a Times 12.
      doc.setFont("times","normal");
      doc.setFontSize(BODY.fontSize);
    }

    drawHeader(1);

    function ensureSpace(height){
      if(y+height>pageH-BODY.bottom) newPage();
    }

    function wrapWords(text,firstWidth,otherWidth){
      const words=clean(text).split(" ");
      const lines=[];
      let line="";
      let available=firstWidth;
      words.forEach(word=>{
        const candidate=line?line+" "+word:word;
        if(doc.getTextWidth(candidate)<=available){
          line=candidate;
        }else{
          if(line) lines.push(line);
          line=word;
          available=otherWidth;
        }
      });
      if(line) lines.push(line);
      return lines;
    }

    function paragraph(text,opts={}){
      const size=opts.fontSize||BODY.fontSize;
      const indent=opts.indent===false?0:BODY.paragraphIndent;
      const hanging=opts.hanging||0;
      const lineHeight=opts.lineHeight||BODY.lineHeight;
      const style=opts.bold?"bold":opts.italic?"italic":"normal";
      doc.setFont("times",style);
      doc.setFontSize(size);
      const lines=wrapWords(text,bodyW-indent,bodyW-hanging);
      let index=0;
      while(index<lines.length){
        let available=Math.floor((pageH-BODY.bottom-y)/lineHeight);
        if(available<2 && lines.length-index>1){
          newPage();
          available=Math.floor((pageH-BODY.bottom-y)/lineHeight);
        }
        let take=Math.min(Math.max(available,1),lines.length-index);
        const remaining=lines.length-index-take;
        if(remaining===1 && take>2) take-=1;
        if(take<=0){newPage();continue;}
        doc.setFont("times",style);
        doc.setFontSize(size);
        for(let offset=0;offset<take;offset++){
          const absolute=index+offset;
          doc.text(lines[absolute],BODY.left+(absolute===0?indent:hanging),y);
          y+=lineHeight;
        }
        index+=take;
        if(index<lines.length)newPage();
      }
      y+=opts.after==null?8:opts.after;
    }

    function bullet(text){
      const raw=clean(text).replace(/^•\s*/,"");
      const indent=24, bulletX=BODY.left+8, textX=BODY.left+indent;

      doc.setFont("times","normal");
      doc.setFontSize(12);
      const lines=wrapWords(raw,bodyW-indent,bodyW-indent);

      lines.forEach((line,i)=>{
        ensureSpace(BODY.lineHeight);

        doc.setFont("times","normal");
        doc.setFontSize(12);

        if(i===0) doc.text("•",bulletX,y);
        doc.text(line,textX,y);
        y+=BODY.lineHeight;
      });
      y+=6;
    }

    function heading(text,level=1,includeToc=true){
      const style=level===3?"bolditalic":"bold";
      const size=level===1?14:level===2?13:12.5;
      const cleaned=clean(text);

      // Los títulos fluyen con el contenido; ensureSpace evita títulos huérfanos.
      doc.setFont("times",style);
      doc.setFontSize(size);

      const lines=doc.splitTextToSize(cleaned,bodyW);
      const titleHeight=lines.length*22+10;

      // Nunca dejar un título huérfano: reservar el título + al menos dos líneas de contenido.
      ensureSpace(titleHeight+(BODY.lineHeight*2)+12);

      if(includeToc) toc.push({title:cleaned,level,page:doc.getNumberOfPages()});

      doc.setFont("times",style);
      doc.setFontSize(size);
      doc.text(lines,BODY.left,y,{align:"left"});
      y+=lines.length*22+10;

      const key=smartSectionKey(text);
      if(key && !analysisInjected.has(key)){
        analysisInjected.add(key);
        getAnalysisSentences(ctx,key).forEach(s=>paragraph(s));
      }
    }

    function label(text){
      ensureSpace(32+(BODY.lineHeight*2));
      doc.setFont("times","bold"); doc.setFontSize(12);
      doc.text(clean(text),BODY.left,y);
      y+=BODY.lineHeight;
    }

    function reference(text){
      const hanging=36;

      doc.setFont("times","normal");
      doc.setFontSize(12);
      const lines=wrapWords(text,bodyW,bodyW-hanging);

      lines.forEach((line,i)=>{
        ensureSpace(BODY.lineHeight);

        doc.setFont("times","normal");
        doc.setFontSize(12);

        doc.text(line,BODY.left+(i===0?0:hanging),y);
        y+=BODY.lineHeight;
      });
      y+=4;
    }

    function tableCaption(title){
      ensureSpace(54);
      tableCounter+=1;
      doc.setFont("times","bold");
      doc.setFontSize(11);
      doc.text("Tabla "+tableCounter,BODY.left,y);
      y+=17;
      doc.setFont("times","italic");
      doc.setFontSize(11);
      doc.text(doc.splitTextToSize(title,bodyW),BODY.left,y);
      y+=24;
      return tableCounter;
    }

    function tableNote(note){
      ensureSpace(34);
      doc.setFont("times","italic");
      doc.setFontSize(10);
      const lines=doc.splitTextToSize("Nota. "+note,bodyW);
      doc.text(lines,BODY.left,y);
      y+=lines.length*15+18;
    }

    function autoTable(options){
      if(typeof doc.autoTable!=="function") throw new Error("No se pudo cargar el módulo de tablas del PDF.");

      const userDidDrawPage=options.didDrawPage;
      const userDidDrawCell=options.didDrawCell;

      options.theme="plain";
      options.styles={font:"times",fontSize:10,cellPadding:{top:5,right:6,bottom:5,left:6},textColor:0,lineWidth:0,overflow:"linebreak",valign:"top",...((options.styles)||{})};
      options.headStyles={font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0,lineWidth:0,halign:"left",...((options.headStyles)||{})};
      options.showHead="everyPage";

      options.didDrawPage=(data)=>{
        drawHeader(doc.getNumberOfPages());
        if(userDidDrawPage) userDidDrawPage(data);
      };

      options.didDrawCell=(data)=>{
        const left=data.table.settings.margin.left;
        const right=pageW-data.table.settings.margin.right;

        // APA 7: only top rule, header-bottom rule and final bottom rule.
        if(data.section==="head" && data.column.index===0){
          doc.setDrawColor(0);
          doc.setLineWidth(0.8);
          doc.line(left,data.cell.y,right,data.cell.y);
          doc.setLineWidth(0.45);
          doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);
        }

        if(data.section==="body" && data.row.index===data.table.body.length-1 && data.column.index===0){
          doc.setDrawColor(0);
          doc.setLineWidth(0.8);
          doc.line(left,data.cell.y+data.cell.height,right,data.cell.y+data.cell.height);
        }

        if(userDidDrawCell) userDidDrawCell(data);
      };

      doc.autoTable(options);
      y=doc.lastAutoTable.finalY+12;
    }

    function reserveIndexPages(){
    // Reserva páginas 2–4 para un índice continuo calculado al final.
    newPage();
    newPage();
    newPage();
    newPage();
  }

    function insertSectionImage(assetKey){
      if(insertedSectionImages.has(assetKey)) return;
      const dataUrl=ctx.assets && ctx.assets[assetKey];
      if(!dataUrl) return;
      insertedSectionImages.add(assetKey);

      let props;
      try{
        props=doc.getImageProperties(dataUrl);
      }catch(e){
        return;
      }

      const maxW=bodyW*0.92;
      const maxH=175;
      const ratio=(props.width&&props.height)?props.width/props.height:1.7;
      let imgW=maxW;
      let imgH=imgW/ratio;

      if(imgH>maxH){
        imgH=maxH;
        imgW=imgH*ratio;
      }

      // La imagen debe acompañar texto: se reserva espacio para al menos
      // cuatro líneas posteriores. Si no cabe, pasa con el texto a la página siguiente.
      const minTextAfter=BODY.lineHeight*4;
      if(y+imgH+minTextAfter>pageH-BODY.bottom) newPage();

      const x=BODY.left+(bodyW-imgW)/2;
      try{
        doc.addImage(dataUrl,imageFormat(dataUrl),x,y,imgW,imgH,undefined,"FAST");
      }catch(e){
        return;
      }

      y+=imgH+18;
      doc.setFont("times","normal");
      doc.setFontSize(BODY.fontSize);
    }

    function maybeInsertSectionImageBeforeHeading(){}

    function figureCaption(number,title){
      ensureSpace(48);
      doc.setFont("times","bold");
      doc.setFontSize(11);
      doc.text("Figura "+number,BODY.left,y);
      y+=17;
      doc.setFont("times","italic");
      doc.setFontSize(11);
      const lines=doc.splitTextToSize(title,bodyW);
      doc.text(lines,BODY.left,y);
      y+=lines.length*16+8;
    }

    function nextFigure(title){
      figureCounter+=1;
      figureCaption(figureCounter,title);
      return figureCounter;
    }

    function drawVerticalBars(data,title,opts={}){
      if(!data.length) return;
      const chartH=190;
      const chartW=bodyW;
      ensureSpace(chartH+86);
      nextFigure(title);

      const top=y;
      const left=BODY.left+34;
      const bottom=top+chartH-34;
      const right=BODY.left+chartW-10;
      const max=Math.max(...data.map(d=>Number(d.value)||0),1);
      const slot=(right-left)/data.length;
      const barW=Math.max(8,slot*0.55);
      const suffix=opts.suffix||"";

      doc.setDrawColor(90);
      doc.setLineWidth(0.4);
      doc.line(left,bottom,right,bottom);
      doc.line(left,top,left,bottom);

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);

      data.forEach((d,i)=>{
        const value=Number(d.value)||0;
        const h=(value/max)*(chartH-58);
        const x=left+i*slot+(slot-barW)/2;
        doc.setFillColor(76,104,133);
        doc.rect(x,bottom-h,barW,h,"F");
        doc.setTextColor(0);
        doc.text((opts.decimals?value.toFixed(opts.decimals):String(Math.round(value)))+suffix,x+barW/2,bottom-h-4,{align:"center"});
        const label=doc.splitTextToSize(String(d.label),Math.max(slot-2,34)).slice(0,2);
        doc.text(label,x+barW/2,bottom+12,{align:"center"});
      });

      y=top+chartH+18;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      doc.text("Nota. Elaboración propia con base en los datos del período.",BODY.left,y);
      y+=24;
    }

    function drawHorizontalBars(data,title,opts={}){
      if(!data.length) return;
      const rowH=18;
      const chartH=Math.max(190,data.length*rowH+46);
      ensureSpace(chartH+96);
      nextFigure(title);

      const top=y;
      const labelW=190;
      const left=BODY.left+labelW;
      const right=pageW-BODY.right;
      const max=Math.max(...data.map(d=>Number(d.value)||0),1);
      const suffix=opts.suffix||"";

      doc.setFont("helvetica","normal");
      doc.setFontSize(9);

      data.forEach((d,i)=>{
        const value=Number(d.value)||0;
        const yy=top+i*rowH+5;
        const label=doc.splitTextToSize(String(d.label),labelW-12).slice(0,1)[0]||String(d.label);
        doc.text(label,BODY.left,yy+7);
        const bw=((right-left-34)*value)/max;
        doc.setFillColor(76,104,133);
        doc.rect(left,yy,bw,9,"F");
        doc.setTextColor(0);
        const valueLabel=(opts.decimals?value.toFixed(opts.decimals):String(Math.round(value)))+suffix;
        doc.text(valueLabel,Math.min(left+bw+4,right-22),yy+8);
      });

      y=top+chartH-10;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      doc.text("Nota. Elaboración propia con base en los datos del período.",BODY.left,y);
      y+=24;
    }

    function drawTimeline(schedule,title){
      const valid=(schedule||[]).filter(r=>r.start&&r.end);
      if(!valid.length) return;
      const chartH=valid.length*22+56;
      ensureSpace(chartH+82);
      nextFigure(title);

      const dates=valid.flatMap(r=>[new Date(r.start+"T12:00:00"),new Date(r.end+"T12:00:00")]);
      const min=Math.min(...dates.map(d=>d.getTime()));
      const max=Math.max(...dates.map(d=>d.getTime()));
      const span=Math.max(max-min,86400000);

      const top=y;
      const labelW=145;
      const x0=BODY.left+labelW;
      const x1=pageW-BODY.right;

      doc.setDrawColor(130);
      doc.setLineWidth(0.35);
      doc.line(x0,top-8,x1,top-8);

      doc.setFont("helvetica","normal");
      doc.setFontSize(8);
      doc.text(formatDateShort(valid[0].start),x0,top-14,{align:"left"});
      doc.text(formatDateShort(valid[valid.length-1].end),x1,top-14,{align:"right"});
      doc.setFontSize(9);

      valid.forEach((r,i)=>{
        const yy=top+i*22;
        doc.text(r.activity,BODY.left,yy+8);
        const s=new Date(r.start+"T12:00:00").getTime();
        const e=new Date(r.end+"T12:00:00").getTime();
        const bx=x0+((s-min)/span)*(x1-x0);
        const ex=x0+((e-min)/span)*(x1-x0);
        const bw=Math.max(5,ex-bx);
        doc.setFillColor(76,104,133);
        doc.rect(bx,yy,bw,10,"F");
      });

      y=top+chartH-12;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      doc.text("Nota. Las barras representan la duración planificada de cada actividad.",BODY.left,y);
      y+=24;
    }

    function drawPareto(data,title){
      const sorted=data.slice().sort((a,b)=>b.value-a.value);
      if(!sorted.length) return;

      const display=sorted.slice(0,15);
      const rowH=22;
      const chartH=display.length*rowH+56;
      ensureSpace(chartH+88);
      nextFigure(title);

      const top=y;
      const labelW=205;
      const valueW=34;
      const pctW=54;
      const barLeft=BODY.left+labelW;
      const barRight=pageW-BODY.right-valueW-pctW;
      const max=Math.max(...display.map(d=>Number(d.value)||0),1);
      const grandTotal=Math.max(sorted.reduce((s,d)=>s+(Number(d.value)||0),0),1);
      let cumulative=0;

      doc.setFont("helvetica","bold");
      doc.setFontSize(8.5);
      doc.text("Carrera",BODY.left,top);
      doc.text("Est.",barRight+8,top);
      doc.text("% acum.",pageW-BODY.right,top,{align:"right"});
      doc.setDrawColor(110);
      doc.setLineWidth(0.4);
      doc.line(BODY.left,top+5,pageW-BODY.right,top+5);

      doc.setFont("helvetica","normal");
      doc.setFontSize(8.5);

      display.forEach((d,i)=>{
        const value=Number(d.value)||0;
        cumulative+=value;
        const pct=(cumulative/grandTotal)*100;
        const yy=top+18+(i*rowH);
        const label=doc.splitTextToSize(String(d.label),labelW-12).slice(0,1)[0]||String(d.label);
        doc.text(label,BODY.left,yy+7);

        const bw=((barRight-barLeft-8)*value)/max;
        doc.setFillColor(76,104,133);
        doc.rect(barLeft,yy,bw,9,"F");

        doc.setTextColor(0);
        doc.text(String(value),barRight+8,yy+8);
        doc.text(pct.toFixed(1)+"%",pageW-BODY.right,yy+8,{align:"right"});
      });

      y=top+chartH-6;
      doc.setFont("times","italic");
      doc.setFontSize(9);
      const note=doc.splitTextToSize("Nota. Se muestran las 15 carreras con mayor número de estudiantes; el porcentaje acumulado se calcula respecto del total del período.",bodyW);
      doc.text(note,BODY.left,y);
      y+=note.length*14+22;
    }


    function drawGroupBars(data,title){
      if(!data.length) return;
      const chunks=[];
      for(let i=0;i<data.length;i+=12) chunks.push(data.slice(i,i+12));

      chunks.forEach((chunk,index)=>{
        const rowH=30;
        const chartH=chunk.length*rowH+54;
        ensureSpace(chartH+90);

        const part=chunks.length>1?" (parte "+(index+1)+" de "+chunks.length+")":"";
        nextFigure(title+part);

        const top=y;
        const labelW=250;
        const barLeft=BODY.left+labelW;
        const barRight=pageW-BODY.right-34;
        const max=Math.max(...chunk.map(d=>Number(d.value)||0),1);

        doc.setFont("helvetica","normal");
        doc.setFontSize(8.5);

        chunk.forEach((d,i)=>{
          const value=Number(d.value)||0;
          const yy=top+i*rowH;
          const lines=doc.splitTextToSize(String(d.label),labelW-12).slice(0,2);
          doc.text(lines,BODY.left,yy+8);

          const bw=((barRight-barLeft)*value)/max;
          doc.setFillColor(76,104,133);
          doc.rect(barLeft,yy+3,bw,10,"F");
          doc.setTextColor(0);
          doc.text(String(value),barRight+6,yy+12);
        });

        y=top+chartH-6;
        doc.setFont("times","italic");
        doc.setFontSize(9);
        const note=doc.splitTextToSize("Nota. Cada fila representa un grupo carrera-modalidad tal como consta en el registro institucional.",bodyW);
        doc.text(note,BODY.left,y);
        y+=note.length*14+22;
      });
    }

    function tocEntryHeight(entry){
      doc.setFont("times",entry.level===1?"bold":"normal");
      doc.setFontSize(10.5);
      const indent=entry.level===1?0:entry.level===2?18:36;
      const maxLabelW=bodyW-indent-44;
      const lines=doc.splitTextToSize(entry.title,maxLabelW);
      return Math.max(17,lines.length*17);
    }

    function drawTOCPage(pageNo,title,entries){
      doc.setPage(pageNo);
      y=BODY.top;

      if(title){
        doc.setFont("times","bold");
        doc.setFontSize(14);
        doc.text(title,pageW/2,y,{align:"center"});
        y+=34;
      }

      entries.forEach(e=>{
        const indent=e.level===1?0:e.level===2?18:36;
        const fontStyle=e.level===1?"bold":"normal";

        doc.setFont("times",fontStyle);
        doc.setFontSize(10.5);

        const maxLabelW=bodyW-indent-44;
        const labelLines=doc.splitTextToSize(e.title,maxLabelW);
        const rowH=Math.max(17,labelLines.length*17);
        const baseY=y;

        doc.text(labelLines,BODY.left+indent,baseY);

        const lastLine=labelLines[labelLines.length-1]||"";
        const lastY=baseY+(labelLines.length-1)*17;
        const startX=BODY.left+indent+doc.getTextWidth(lastLine)+5;
        const endX=BODY.left+bodyW-28;

        doc.setLineDashPattern([1,2],0);
        if(startX<endX) doc.line(startX,lastY-2,endX,lastY-2);
        doc.setLineDashPattern([],0);

        doc.text(String(e.page),BODY.left+bodyW,lastY,{align:"right"});
        y+=rowH;
      });
    }


    function sectionApi(){
    const modules=window.DOC_TIT_COMPLEXIVO_PDF || {};
    return {
      doc,ctx,pageW,pageH,bodyW,BODY,toc,
      getY:()=>y,
      setY:(value)=>{ y=value; },
      heading,paragraph,bullet,ensureSpace,tableCaption,tableNote,autoTable,
      formatDateShort,formatDateLong,lowerPeriod,normalize,totals,joinNatural,policy,
      insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,
      getAnalysisSentences,imageFormat,drawTOCPage,tocEntryHeight,
      signatureBlock:(fixedTop=null)=>{
        const component=modules.components?.signatureBlock;
        if(!component?.render) throw new Error("No se cargó el bloque de firmas del PDF.");
        return component.render({doc,ctx,pageW,pageH,BODY,ensureSpace,getY:()=>y,setY:(value)=>{y=value;}},fixedTop);
      }
    };
  }

  function renderSection(id){
    const section=window.DOC_TIT_COMPLEXIVO_PDF?.sections?.[id];
    if(!section?.render) throw new Error("No se cargó la sección del PDF: "+id);
    section.render(sectionApi());
  }

  renderSection("cover");
  reserveIndexPages();

  const outline=window.DOC_TIT_COMPLEXIVO_PDF?.outline || [
    "executiveSummary","introduction","legalBasis","methodology","requirements",
    "examDescription","seminars","distribution","laboratories","imponderables",
    "evaluation","bibliography"
  ];
  outline.forEach(renderSection);

  renderSection("index");
  const footer=window.DOC_TIT_COMPLEXIVO_PDF?.components?.footer;
  if(!footer?.render) throw new Error("No se cargó el pie de página del PDF.");
  const totalPages=footer.render({doc,pageW,pageH});

    const safeName=(filename||"documento.pdf").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();
    const finalName=safeName.endsWith(".pdf")?safeName:safeName+".pdf";
    const blob=doc.output("blob");
    doc.save(finalName);
    return {pages:totalPages,filename:finalName,blob};
  }

  window.DocTitFullDocument={
    resizeImage,
    decodeTemplatePages,
    generateAndDownload
  };
})();