from pathlib import Path

# --- PDF generator ---
path = Path('trabajo-titulacion/full-document.js')
text = path.read_text(encoding='utf-8')

section3_start = '{"type":"h","text":"3. Metodología","level":1}'
section4_start = '{"type":"h","text":"4. Requisitos Para La Aprobación De La Titulación","level":1}'
a = text.index(section3_start)
b = text.index(section4_start, a)
text = text[:a] + section3_start + ',{"type":"methodology"},' + text[b:]

if 'function methodologyBullet(label,text)' not in text:
    marker = '  function heading(text,level=1,include=true){'
    helper = '''  function methodologyBullet(label,text){
    const bulletX=BODY.left+7,textX=BODY.left+27,maxW=bodyW-27,lineH=BODY.line;
    const lead=clean(label)+":";
    const body=clean(text);
    doc.setFont("times","bold");doc.setFontSize(12);
    const leadW=doc.getTextWidth(lead+" ");
    const words=body.split(/\\s+/);let first=[],rest=[];
    for(const word of words){
      const candidate=[...first,word].join(" ");
      doc.setFont("times","normal");
      if(!rest.length&&doc.getTextWidth(candidate)<=Math.max(60,maxW-leadW))first.push(word);else rest.push(word);
    }
    ensure(lineH*2);
    doc.setFont("times","normal");doc.text("•",bulletX,y);
    doc.setFont("times","bold");doc.text(lead,textX,y);
    doc.setFont("times","normal");
    if(first.length)doc.text(first.join(" "),textX+leadW,y);
    y+=lineH;
    const remaining=rest.join(" ");
    if(remaining){
      const lines=doc.splitTextToSize(remaining,maxW);
      lines.forEach(line=>{ensure(lineH);doc.setFont("times","normal");doc.text(line,textX,y);y+=lineH;});
    }
    y+=4;
  }
  function heading(text,level=1,include=true){'''
    if marker not in text:
        raise SystemExit('No se encontró heading()')
    text = text.replace(marker, helper, 1)

if 'function renderMethodology()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = '''  function resolveMethodology(){
    const snapshot=ctx.payload?.contentSnapshots?.methodology;
    if(snapshot&&snapshot.process&&Array.isArray(snapshot.phases)&&snapshot.phases.length)return snapshot;
    const current=CONTENT_CONFIG.methodology;
    if(current&&current.process&&Array.isArray(current.phases)&&current.phases.length)return current;
    return null;
  }
  function renderMethodology(){
    const block=resolveMethodology();
    if(!block)throw new Error("No existe una metodología validada para Trabajo de Titulación.");
    const process=block.process||{};
    heading(`3.1. Proceso De Trabajo De Titulación (${clean(process.code)})`,2,true);
    (block.processParagraphs||[]).forEach(item=>paragraph(item));
    heading("3.2. Fases Del Trabajo De Titulación",2,true);
    paragraph(block.phasesIntro||"");
    (block.phases||[]).forEach(phase=>{
      heading(`${phase.number} ${phase.title}`,3,true);
      (phase.paragraphs||[]).forEach(item=>paragraph(item));
      (phase.bullets||[]).forEach(item=>{
        const raw=clean(item);const pos=raw.indexOf(":");
        if(pos>0)methodologyBullet(raw.slice(0,pos),raw.slice(pos+1));
        else bullet(raw);
      });
      if(clean(phase.closingParagraph))paragraph(phase.closingParagraph);
    });
  }
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old = '      else if(item.type==="legalBase")renderLegalBase();\n      else if(item.type==="image")inlineImage(item.key);'
new = '      else if(item.type==="legalBase")renderLegalBase();\n      else if(item.type==="methodology")renderMethodology();\n      else if(item.type==="image")inlineImage(item.key);'
if old in text:
    text = text.replace(old, new, 1)
elif 'else if(item.type==="methodology")renderMethodology();' not in text:
    raise SystemExit('No se encontró renderItems() para methodology')

path.write_text(text, encoding='utf-8')

# --- Period snapshot: methodology is versioned just like the legal base ---
app = Path('trabajo-titulacion/app.js')
text = app.read_text(encoding='utf-8')

if 'function currentMethodologySnapshot()' not in text:
    marker = '''function currentLegalBaseSnapshot(){
  const block=window.DOC_TIT_TRABAJO_CONTENT?.legalBase;
  if(!block||!Array.isArray(block.paragraphs)||!block.paragraphs.length)return null;
  return JSON.parse(JSON.stringify(block));
}
'''
    helper = marker + '''function currentMethodologySnapshot(){
  const block=window.DOC_TIT_TRABAJO_CONTENT?.methodology;
  if(!block||!block.process||!Array.isArray(block.phases)||!block.phases.length)return null;
  return JSON.parse(JSON.stringify(block));
}
'''
    if marker not in text:
        raise SystemExit('No se encontró currentLegalBaseSnapshot()')
    text = text.replace(marker, helper, 1)

old = 'contentSnapshots:{legalBase:currentLegalBaseSnapshot()}'
new = 'contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot()}'
if old in text:
    text = text.replace(old, new, 1)
elif 'methodology:currentMethodologySnapshot()' not in text:
    raise SystemExit('No se encontró contentSnapshots de blankPayload()')

old = '  if(!contentSnapshots.legalBase)contentSnapshots.legalBase=currentLegalBaseSnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
new = '  if(!contentSnapshots.legalBase)contentSnapshots.legalBase=currentLegalBaseSnapshot();\n  if(!contentSnapshots.methodology)contentSnapshots.methodology=currentMethodologySnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
if old in text:
    text = text.replace(old, new, 1)
elif 'if(!contentSnapshots.methodology)contentSnapshots.methodology=currentMethodologySnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData()')

app.write_text(text, encoding='utf-8')

# --- Cache bust ---
idx = Path('trabajo-titulacion/index.html')
text = idx.read_text(encoding='utf-8')
text = text.replace('content-config.js?v=20260909-section2-1', 'content-config.js?v=20260909-section3-1')
text = text.replace('full-document.js?v=20260909-section2-1', 'full-document.js?v=20260909-section3-1')
text = text.replace('app.js?v=20260909-section2-1', 'app.js?v=20260909-section3-1')
idx.write_text(text, encoding='utf-8')
