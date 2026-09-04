from pathlib import Path
import re

# full-document.js
p=Path('complexivo/full-document.js')
s=p.read_text(encoding='utf-8')

anchor='''  function lowerPeriod(name){
    const s=String(name||"");
    return s ? s.charAt(0).toLowerCase()+s.slice(1) : s;
  }'''
assert anchor in s
if 'function joinNatural(' not in s:
    s=s.replace(anchor,anchor+'''
  function joinNatural(items){
    const values=(items||[]).map(v=>String(v||"").trim()).filter(Boolean);
    if(values.length<=1) return values[0]||"";
    if(values.length===2) return values[0]+" y "+values[1];
    return values.slice(0,-1).join(", ")+" y "+values[values.length-1];
  }''',1)

needle='''    const doc=new jsPDF({unit:"pt",format:"a4",compress:true,putOnlyUsedFonts:true});
    doc.setProperties({
      title:"Planificación De Examen Complexivo",'''
assert needle in s
s=s.replace(needle,'''    const doc=new jsPDF({unit:"pt",format:"a4",compress:true,putOnlyUsedFonts:true});
    const policy=window.DOC_TIT_COMPLEXIVO_PDF?.config?.policy || {};
    const elaborationDate=ctx.meta?.elaborationDate || new Date().toISOString().slice(0,10);
    const elaborationDateDisplay=(()=>{
      const d=new Date(elaborationDate+"T12:00:00");
      return Number.isNaN(d.getTime())?String(elaborationDate):new Intl.DateTimeFormat("es-EC",{day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
    })();
    ctx.meta={...(ctx.meta||{}),version:ctx.meta?.version||ctx.doc?.version||policy.version||"1.0",elaborationDate,elaborationDateDisplay};
    ctx.policy=policy;
    doc.setProperties({
      title:policy.documentTitle||"Planificación del Examen Complexivo",''',1)

pat=re.compile(r'    function paragraph\(text,opts=\{\}\)\{.*?\n    \}\n\n    function bullet',re.S)
assert pat.search(s)
s=pat.sub('''    function paragraph(text,opts={}){
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

    function bullet''',s,count=1)

forced='''      // Regla editorial: todo título de primer nivel inicia una página nueva.
      if(level===1 && y>BODY.top+2) newPage();

'''
assert forced in s
s=s.replace(forced,'      // Los títulos fluyen con el contenido; ensureSpace evita títulos huérfanos.\n',1)

rpat=re.compile(r'    function reserveIndexPages\(\)\{.*?\n  \}',re.S)
assert rpat.search(s)
s=rpat.sub('''    function reserveIndexPages(){
    // Reserva páginas 2–4 para un índice continuo calculado al final.
    newPage();
    newPage();
    newPage();
    newPage();
  }''',s,count=1)

old='''      formatDateShort,formatDateLong,lowerPeriod,normalize,totals,
      insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,
      getAnalysisSentences,imageFormat,drawTOCPage,'''
assert old in s
s=s.replace(old,'''      formatDateShort,formatDateLong,lowerPeriod,normalize,totals,joinNatural,policy,
      insertSectionImage,reference,drawVerticalBars,drawGroupBars,drawTimeline,
      getAnalysisSentences,imageFormat,drawTOCPage,tocEntryHeight,''',1)

sig='return component.render({doc,pageW,pageH,BODY,ensureSpace,getY:()=>y,setY:(value)=>{y=value;}},fixedTop);'
assert sig in s
s=s.replace(sig,'return component.render({doc,ctx,pageW,pageH,BODY,ensureSpace,getY:()=>y,setY:(value)=>{y=value;}},fixedTop);',1)
p.write_text(s,encoding='utf-8')

# app.js
p=Path('complexivo/app.js')
s=p.read_text(encoding='utf-8')
s=s.replace('Semana Requisitos','Semana de Requisitos')
s=s.replace('Planificación De Examen Complexivo','Planificación del Examen Complexivo')
s=s.replace('Planificación de Examen Complexivo','Planificación del Examen Complexivo')
start='''  async function generatePdf(){
    const data=collectDocumentData();
    if(!scheduleComplete(data.schedule)){
      alert("Completa las fechas de las 9 actividades del cronograma.");
      return;
    }
    if(!distributionComplete(data.distribution)){
      alert("Completa Carrera, Lugar y Cantidad en todas las filas utilizadas.");
      return;
    }
    if(!data.assets.logo){
      alert("Sube el logo institucional. Se utilizará en la cabecera de todas las páginas.");
      return;
    }
'''
assert start in s
s=s.replace(start,'''  function validateGenerationData(data){
    const errors=[];
    const warnings=[];
    if(!scheduleComplete(data.schedule)) errors.push("Completa las fechas de las 9 actividades del cronograma.");
    if(!distributionComplete(data.distribution)) errors.push("Completa Carrera, Lugar y Cantidad en todas las filas utilizadas.");
    if(!data.assets.logo) errors.push("Sube el logo institucional.");
    (data.schedule||[]).forEach(r=>{if(r.start&&r.end&&r.start>r.end)errors.push("La fecha de inicio no puede ser posterior a la fecha fin en: "+r.activity+".");});
    const scheduled=(data.schedule||[]).filter(r=>r.start);
    for(let i=1;i<scheduled.length;i++){
      if(scheduled[i].start<scheduled[i-1].start){errors.push("El cronograma debe mantener las actividades en orden cronológico.");break;}
    }
    const total=(data.distribution||[]).reduce((sum,r)=>sum+(Number(r.count)||0),0);
    if(total<=0)errors.push("El total de estudiantes debe ser mayor que cero.");
    const ev=window.DOC_TIT_COMPLEXIVO_PDF?.config?.policy?.evaluation||{};
    if(Number(ev.theoreticalWeight)+Number(ev.practicalWeight)!==100)errors.push("La ponderación teórica y práctica debe sumar 100 %.");
    const period=activePeriod();
    if((data.schedule||[]).some(r=>r.end&&period?.end&&r.end>period.end))warnings.push("Existen actividades posteriores al fin nominal del período; el PDF incluirá la aclaración correspondiente.");
    return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
  }

  async function generatePdf(){
    const data=collectDocumentData();
    const validation=validateGenerationData(data);
    if(validation.errors.length){alert("No se puede generar el PDF:\\n\\n- "+validation.errors.join("\\n- "));return;}
    if(validation.warnings.length)console.warn("Validaciones DOC-TIT:",validation.warnings);
''',1)
ctx='''        analysis:data.analysis,
        institutional:state.institutional,
        code'''
assert ctx in s
s=s.replace(ctx,'''        analysis:data.analysis,
        institutional:state.institutional,
        meta:{version:doc.version||window.DOC_TIT_COMPLEXIVO_PDF?.config?.policy?.version||"1.0",elaborationDate:new Date().toISOString().slice(0,10)},
        code''',1)
p.write_text(s,encoding='utf-8')

# index.html
p=Path('complexivo/index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('20260904-modular-1','20260904-complete-1').replace('20260904-modular-2','20260904-complete-1')
layout='<script src="pdf/config/layout.js?v=20260904-complete-1"></script>'
assert layout in s
if 'pdf/config/policy.js' not in s:s=s.replace(layout,layout+'\n  <script src="pdf/config/policy.js?v=20260904-complete-1"></script>',1)
evaluation='<script src="pdf/sections/evaluation.js?v=20260904-complete-1"></script>'
assert evaluation in s
if 'pdf/sections/closure.js' not in s:s=s.replace(evaluation,evaluation+'\n  <script src="pdf/sections/closure.js?v=20260904-complete-1"></script>\n  <script src="pdf/sections/general-summary.js?v=20260904-complete-1"></script>',1)
bib='<script src="pdf/sections/bibliography.js?v=20260904-complete-1"></script>'
assert bib in s
if 'pdf/sections/annexes.js' not in s:s=s.replace(bib,bib+'\n  <script src="pdf/sections/annexes.js?v=20260904-complete-1"></script>',1)
s=re.sub(r'full-document\.js\?v=[^"]+','full-document.js?v=20260904-complete-1',s)
s=re.sub(r'app\.js\?v=[^"]+','app.js?v=20260904-complete-1',s)
p.write_text(s,encoding='utf-8')
