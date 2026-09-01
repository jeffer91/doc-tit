(() => {
  const TOTAL_PAGES = 45;
  let templatePromise = null;

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  }

  function lowerPeriod(name){
    const s=String(name||"");
    return s ? s.charAt(0).toLowerCase()+s.slice(1) : s;
  }

  async function decodeTemplatePages(){
    if(templatePromise) return templatePromise;
    templatePromise=(async()=>{
      const chunks=window.DOC_TIT_TEMPLATE_CHUNKS || [];
      if(chunks.length !== 4 || chunks.some(x=>!x)) throw new Error("Plantilla completa no disponible.");
      if(typeof DecompressionStream === "undefined") throw new Error("Usa Chrome o Edge actualizado para generar la planificación completa.");
      const b64=chunks.join("");
      const binary=atob(b64);
      const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      const text=await new Response(stream).text();
      const pages=JSON.parse(text);
      if(!Array.isArray(pages) || pages.length !== TOTAL_PAGES) throw new Error("La plantilla no contiene las 45 páginas esperadas.");
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

  function headerDate(period){
    const d=new Date(period.start+"T12:00:00");
    const month=new Intl.DateTimeFormat("es-EC",{month:"long"}).format(d);
    return `${d.getDate()} - ${month.charAt(0).toUpperCase()+month.slice(1)} - ${d.getFullYear()}`;
  }

  function headerHtml(pageNo, ctx){
    const logo=ctx.assets?.logo;
    return `
      <div class="institutional-header">
        <div class="ih-logo">${logo?`<img src="${logo}" alt="Logo institucional">`:`<span>LOGO<br>INSTITUCIONAL</span>`}</div>
        <div class="ih-unit">UNIDAD TITULACIÓN Y EFICIENCIA<br>TERMINAL</div>
        <div class="ih-code">
          <div><b>Código:</b><br>${esc(ctx.code)}</div>
          <div><b>Versión:</b> 1.0</div>
        </div>
        <div class="ih-date"><b>Fecha de Elaboración:</b><br>${esc(headerDate(ctx.period))}</div>
        <div class="ih-document"><b>Planificación De Examen Complexivo</b><br>${esc(ctx.period.name)}</div>
        <div class="ih-page">Página ${pageNo} de ${TOTAL_PAGES}</div>
      </div>`;
  }

  function classifyLine(line){
    const t=line.trim();
    if(!t || /^Página\s+\d+\s+de\s+45$/i.test(t)) return "";
    if(t==="Índice") return `<div class="source-index-title">Índice</div>`;
    if(/^\d+\.\s+[A-ZÁÉÍÓÚÑ]/.test(t) && t.length<110) return `<div class="source-h1">${esc(t)}</div>`;
    if(/^\d+\.\d+\.\d+\.?\s+/.test(t) && t.length<130) return `<div class="source-h3">${esc(t)}</div>`;
    if(/^\d+\.\d+\.?\s+/.test(t) && t.length<130) return `<div class="source-h2">${esc(t)}</div>`;
    if(/^•/.test(t)) return `<div class="source-bullet">${esc(t)}</div>`;
    if(/^(Descripción|Objetivo|Características|Requisitos|Condiciones|Beneficios|Procedimiento|Importancia|Estructura|Duración|Modalidad online|Consideraciones técnicas|Asignación por carrera|Distribución por sedes|Ponderación y aprobación):?/i.test(t))
      return `<div class="source-emphasis">${esc(t)}</div>`;
    return `<div class="source-line">${esc(t)}</div>`;
  }

  function sourceBodyHtml(text, period, pageNo){
    const lines=replacePeriod(text,period).split(/\r?\n/);
    const html=lines.map(classifyLine).filter(Boolean).join("");
    return `<div class="source-content ${pageNo===2?"source-dense":""}">${html}</div>`;
  }

  function signatureParts(value){
    const parts=String(value||"").split("·").map(x=>x.trim());
    return {name:parts[0]||"", role:parts.slice(1).join(" · ")||""};
  }

  function signatureCell(title, value, image){
    const p=signatureParts(value);
    return `
      <div class="signature-cell">
        <div class="signature-title">${esc(title)}</div>
        <div class="signature-image">${image?`<img src="${image}" alt="${esc(title)}">`:`<span>Firma / QR no cargada</span>`}</div>
        <div class="signature-info"><b>NOMBRE:</b> ${esc(p.name)}</div>
        <div class="signature-info"><b>CARGO:</b><br>${esc(p.role)}</div>
      </div>`;
  }

  function coverHtml(ctx){
    return `
      <div class="cover-title">
        <h1>Planificación De Examen Complexivo</h1>
        <h2>${esc(ctx.period.name)}</h2>
      </div>
      <div class="cover-signatures">
        ${signatureCell("ELABORADO POR:",ctx.institutional.preparedBy,ctx.assets?.preparedSignature)}
        ${signatureCell("REVISADO POR:",ctx.institutional.reviewedBy,ctx.assets?.reviewedSignature)}
        ${signatureCell("APROBADO POR:",ctx.institutional.approvedBy,ctx.assets?.approvedSignature)}
      </div>`;
  }

  function formatShort(v){
    if(!v) return "";
    const d=new Date(v+"T12:00:00");
    return new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
  }

  function scheduleHtml(ctx){
    const rows=ctx.schedule.map(r=>`<tr><td>${esc(r.activity)}</td><td>${formatShort(r.start)}</td><td>${formatShort(r.end)}</td></tr>`).join("");
    return `
      <div class="source-content source-dense">
        <div class="source-h2">3.10. Cronogramas</div>
        <div class="source-line">El presente documento establece la planificación técnica del proceso de titulación mediante examen complexivo. Los cronogramas específicos de ejecución forman parte integral de esta planificación.</div>
        <div class="source-line">El cronograma general contiene las fechas clave de cada fase, incluyendo cierre de clases, requisitos, núcleos, registro de notas, examen complexivo y supletorio.</div>
        <table class="doc-table"><thead><tr><th>Actividad</th><th>Fecha inicio</th><th>Fecha fin</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="source-line">Los cronogramas complementarios detallarán la organización operativa por carrera, lugar, fecha, hora, laboratorio y responsables.</div>
      </div>`;
  }

  function totals(distribution){
    const byPlace={}; let total=0;
    distribution.forEach(r=>{
      const n=Number(r.count)||0;
      byPlace[r.place]=(byPlace[r.place]||0)+n;
      total+=n;
    });
    return {byPlace,total};
  }

  function distributionTable(rows){
    return `<table class="doc-table distribution-doc-table"><thead><tr><th>Carrera</th><th>Lugar</th><th>Cant.</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.career)}</td><td>${esc(r.place)}</td><td>${Number(r.count)||0}</td></tr>`).join("")}</tbody></table>`;
  }

  function distributionPage37(ctx){
    return `
      <div class="source-content source-dense">
        <div class="source-line">La capacitación se organiza de forma integral y estructurada en los núcleos previstos, con utilización de los recursos académicos y tecnológicos necesarios.</div>
        <div class="source-h1">7. DISTRIBUCIÓN DE ESTUDIANTES POR CARRERA Y NIVEL</div>
        <div class="source-line">Para el período ${esc(lowerPeriod(ctx.period.name))}, la distribución se planifica considerando la cantidad de estudiantes por carrera y el lugar asignado.</div>
        <div class="source-emphasis">Distribución por carrera y lugar</div>
        ${distributionTable(ctx.distribution.slice(0,13))}
      </div>`;
  }

  function distributionPage38(ctx){
    const t=totals(ctx.distribution);
    const summary=Object.entries(t.byPlace).map(([p,n])=>`${esc(p)}: <b>${n}</b>`).join(" · ");
    const places=Object.keys(t.byPlace).join(", ");
    return `
      <div class="source-content source-dense">
        ${distributionTable(ctx.distribution.slice(13))}
        <div class="doc-summary"><b>Resumen:</b> ${summary} · <b>Total general: ${t.total}</b></div>
        <div class="source-emphasis">Consideraciones técnicas</div>
        <div class="source-bullet">• La distribución de espacios se realiza con base en la cantidad de estudiantes por grupo y los requerimientos técnicos o de software de cada carrera.</div>
        <div class="source-bullet">• Los nombres de las carreras se conservan exactamente como constan en el registro del período, incluidos los identificados como ONLINE.</div>
        <div class="source-h1">8. ASIGNACIÓN DE LABORATORIOS Y CAPACIDAD</div>
        <div class="source-line">Para la ejecución del período ${esc(lowerPeriod(ctx.period.name))}, se utilizarán los espacios disponibles en ${esc(places)}, según la planificación académica, la cantidad de estudiantes y las necesidades técnicas.</div>
        <div class="source-bullet">• La asignación específica de laboratorio, fecha, hora y responsables se establecerá en el cronograma operativo correspondiente.</div>
      </div>`;
  }

  function summaryPage43(ctx){
    const t=totals(ctx.distribution);
    const places=Object.keys(t.byPlace);
    return `
      <div class="source-content">
        <div class="source-h2">11.2. Fases del Proceso</div>
        <div class="source-bullet">• El examen se precede de núcleos de preparación distribuidos según el cronograma del período.</div>
        <div class="source-bullet">• El proceso contempla requisitos, núcleos, notas, examen complexivo y supletorio.</div>
        <div class="source-h2">11.3. Organización por Sedes</div>
        <div class="source-line">La planificación contempla los siguientes lugares de ejecución: ${esc(places.join(", "))}. La distribución responde a la cantidad registrada de estudiantes por carrera y a los requerimientos operativos.</div>
        <div class="source-line">Total de estudiantes planificados: <b>${t.total}</b>.</div>
        <div class="source-h2">11.4. Evaluación Integral</div>
        <div class="source-bullet">• Componente teórico: 40%.</div>
        <div class="source-bullet">• Componente práctico: 60%.</div>
        <div class="source-h2">11.5. Gestión de Imponderables</div>
        <div class="source-bullet">• Se mantienen rutas de actuación ante fallas técnicas, emergencias personales u otras eventualidades justificadas.</div>
        <div class="source-h2">11.6. Inclusión y Accesibilidad</div>
        <div class="source-bullet">• Se contempla atención a estudiantes con necesidades específicas, garantizando condiciones adecuadas de participación.</div>
        <div class="source-h1">12. BIBLIOGRAFÍA</div>
        <div class="source-line">La bibliografía institucional continúa en las páginas siguientes conforme a la plantilla base.</div>
      </div>`;
  }

  function pageBody(pageNo, sourceText, ctx){
    if(pageNo===1) return coverHtml(ctx);
    if(pageNo===13) return scheduleHtml(ctx);
    if(pageNo===37) return distributionPage37(ctx);
    if(pageNo===38) return distributionPage38(ctx);
    if(pageNo===43) return summaryPage43(ctx);
    return sourceBodyHtml(sourceText,ctx.period,pageNo);
  }

  async function render(ctx){
    const pages=await decodeTemplatePages();
    const out=[];
    for(let pageNo=1;pageNo<=TOTAL_PAGES;pageNo++){
      out.push(`<section class="paper-page" data-page="${pageNo}">${headerHtml(pageNo,ctx)}<div class="page-body">${pageBody(pageNo,pages[pageNo-1],ctx)}</div></section>`);
    }
    return out.join("");
  }

  function resizeImage(file,maxW=1200,maxH=600){
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
          resolve(canvas.toDataURL(type,type==="image/jpeg"?0.88:undefined));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  window.DocTitFullDocument={render,resizeImage,decodeTemplatePages,TOTAL_PAGES};
})();