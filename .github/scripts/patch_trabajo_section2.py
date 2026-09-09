from pathlib import Path

# PDF generator
path = Path('trabajo-titulacion/full-document.js')
text = path.read_text(encoding='utf-8')

legal_start = '{"type":"h","text":"2. Base Legal","level":1}'
next_section = '{"type":"h","text":"3. Metodología","level":1}'
a = text.index(legal_start)
b = text.index(next_section, a)
text = text[:a] + legal_start + ',{"type":"legalBase"},' + text[b:]

if 'function legalParagraph(text)' not in text:
    marker = '  function heading(text,level=1,include=true){'
    helper = '''  function legalParagraph(text){
    const raw=clean(text);if(!raw)return;
    const hanging=26,lineH=BODY.line;
    doc.setFont("times","normal");doc.setFontSize(12);
    const words=raw.split(/\\s+/),lines=[];
    let current="",lineIndex=0;
    for(const word of words){
      const maxW=lineIndex===0?bodyW:bodyW-hanging;
      const candidate=current?current+" "+word:word;
      if(!current||doc.getTextWidth(candidate)<=maxW){
        current=candidate;
      }else{
        lines.push(current);lineIndex++;current=word;
      }
    }
    if(current)lines.push(current);
    ensure(Math.min(lines.length,2)*lineH+10);
    lines.forEach((line,i)=>{
      ensure(lineH);
      doc.setFont("times","normal");doc.setFontSize(12);
      const x=BODY.left+(i===0?0:hanging);
      const maxW=i===0?bodyW:bodyW-hanging;
      if(i===lines.length-1)doc.text(line,x,y);
      else doc.text(line,x,y,{align:"justify",maxWidth:maxW});
      y+=lineH;
    });
    y+=9;
  }
  function heading(text,level=1,include=true){'''
    if marker not in text:
        raise SystemExit('No se encontró heading()')
    text = text.replace(marker, helper, 1)

if 'function renderLegalBase()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = '''  function resolveLegalBase(){
    const snapshot=ctx.payload?.contentSnapshots?.legalBase;
    if(snapshot&&Array.isArray(snapshot.paragraphs)&&snapshot.paragraphs.length)return snapshot;
    const current=CONTENT_CONFIG.legalBase;
    if(current&&Array.isArray(current.paragraphs)&&current.paragraphs.length)return current;
    return null;
  }
  function renderLegalBase(){
    const block=resolveLegalBase();
    if(!block)throw new Error("No existe una Base Legal validada para Trabajo de Titulación.");
    block.paragraphs.forEach(item=>legalParagraph(item));
  }
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old = '      else if(item.type==="referenceDocs")renderReferenceDocuments();\n      else if(item.type==="image")inlineImage(item.key);'
new = '      else if(item.type==="referenceDocs")renderReferenceDocuments();\n      else if(item.type==="legalBase")renderLegalBase();\n      else if(item.type==="image")inlineImage(item.key);'
if old in text:
    text = text.replace(old, new, 1)
elif 'else if(item.type==="legalBase")renderLegalBase();' not in text:
    raise SystemExit('No se encontró renderItems() para legalBase')

path.write_text(text, encoding='utf-8')

# Period snapshot: an already-used period keeps the legal version bound to it.
app = Path('trabajo-titulacion/app.js')
text = app.read_text(encoding='utf-8')
if 'function currentLegalBaseSnapshot()' not in text:
    marker = 'function blankPayload(){'
    helper = '''function currentLegalBaseSnapshot(){
  const block=window.DOC_TIT_TRABAJO_CONTENT?.legalBase;
  if(!block||!Array.isArray(block.paragraphs)||!block.paragraphs.length)return null;
  return JSON.parse(JSON.stringify(block));
}
function blankPayload(){'''
    if marker not in text:
        raise SystemExit('No se encontró blankPayload()')
    text = text.replace(marker, helper, 1)

old = '}),tables,notes:""};'
new = '}),tables,notes:"",contentSnapshots:{legalBase:currentLegalBaseSnapshot()}};'
if old in text:
    text = text.replace(old, new, 1)
elif 'contentSnapshots:{legalBase:currentLegalBaseSnapshot()}' not in text:
    raise SystemExit('No se encontró el retorno de blankPayload()')

old = '  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||""};'
new = '''  const contentSnapshots={...(base.contentSnapshots||{}),...(data.contentSnapshots||{})};
  if(!contentSnapshots.legalBase)contentSnapshots.legalBase=currentLegalBaseSnapshot();
  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'''
if old in text:
    text = text.replace(old, new, 1)
elif 'if(!contentSnapshots.legalBase)contentSnapshots.legalBase=currentLegalBaseSnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData()')

app.write_text(text, encoding='utf-8')

# Cache bust
idx = Path('trabajo-titulacion/index.html')
text = idx.read_text(encoding='utf-8')
text = text.replace('content-config.js?v=20260909-section1-1', 'content-config.js?v=20260909-section2-1')
text = text.replace('full-document.js?v=20260909-section1-1', 'full-document.js?v=20260909-section2-1')
text = text.replace('app.js?v=20260902-7', 'app.js?v=20260909-section2-1')
idx.write_text(text, encoding='utf-8')
