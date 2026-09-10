from pathlib import Path
import re
ROOT=Path('.')
def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s): (ROOT/p).write_text(s,encoding='utf-8')

# Visible numbering in Complexivo after removing free text/images.
p='complexivo/index.html';s=read(p)
s=s.replace('<span class="eyebrow">4. Identidad institucional</span>','<span class="eyebrow">3. Identidad institucional</span>',1)
write(p,s)

# Article title and no legacy observations in generated content.
p='articulo-academico/app.js';s=read(p)
s=s.replace('"title":"Planificación De Artículo Académico"','"title":"Planificación de Artículo Académico"',1)
write(p,s)


def standardized_cover(s, document_id):
    pat=re.compile(r'  function cover\(\)\{.*?\n  \}\n  function executive\(\)\{',re.S)
    replacement=f'''  function cover(){{
    header();
    const standard=window.DOC_TIT_PDF_STANDARDS?.resolveRgi?.("{document_id}")||{{}};
    const cm=window.DOC_TIT_PDF_STANDARDS?.cmToPt||((v)=>Number(v||0)*(72/2.54));
    const inst=institutional();
    const headerTop=cm(standard.headerTopCm||1.5),headerH=cm(standard.headerHeightCm||2.8),headerBottom=headerTop+headerH;
    const signatureH=cm(4.2),signatureTop=H-cm(1.5)-signatureH;
    const contentTop=headerBottom+cm(2.5),contentBottom=signatureTop-cm(1.5),visualCenter=(contentTop+contentBottom)/2,blockW=cm(18);
    doc.setFont("helvetica","bold");doc.setFontSize(standard.centralTitlePt||23);
    const titleLines=doc.splitTextToSize(TITLE,blockW),titleLineH=27;
    doc.setFontSize(18);const periodLines=doc.splitTextToSize(clean(ctx.period?.name),blockW),periodLineH=21;
    const groupH=titleLines.length*titleLineH+14+periodLines.length*periodLineH;let titleY=visualCenter-groupH/2+17;
    doc.setFont("helvetica","bold");doc.setFontSize(standard.centralTitlePt||23);doc.text(titleLines,W/2,titleY,{{align:"center",lineHeightFactor:1.05}});
    titleY+=titleLines.length*titleLineH+14;doc.setFontSize(18);doc.text(periodLines,W/2,titleY,{{align:"center",lineHeightFactor:1.05}});

    const x=(W-blockW)/2,col=blockW/3;const cells=[
      ["ELABORADO POR:",inst.preparedBy,inst.preparedRole],
      ["REVISADO POR:",inst.reviewedBy,inst.reviewedRole],
      ["APROBADO POR:",inst.approvedBy,inst.approvedRole]
    ];
    const nameY=signatureTop+cm(2.65),roleY=signatureTop+cm(3.35);
    doc.setDrawColor(0);doc.setLineWidth(.65);
    cells.forEach((cell,i)=>{{
      const cx=x+i*col;doc.rect(cx,signatureTop,col,signatureH);if(i)doc.line(cx,signatureTop,cx,signatureTop+signatureH);
      doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.text(cell[0],cx+7,signatureTop+15);
      doc.setFont("helvetica","bold");doc.setFontSize(8.5);doc.text("NOMBRE:",cx+7,nameY);
      doc.setFont("helvetica","normal");doc.text(doc.splitTextToSize(clean(cell[1]),col-62),cx+55,nameY);
      doc.setFont("helvetica","bold");doc.text("CARGO:",cx+7,roleY);
      doc.setFont("helvetica","normal");doc.text(doc.splitTextToSize(clean(cell[2]),col-14),cx+7,roleY+14);
    }});
  }}
  function executive(){{'''
    if not pat.search(s): raise SystemExit(f'cover not found {document_id}')
    return pat.sub(replacement,s,count=1)


def better_refs(s):
    pat=re.compile(r'  function referenceParagraph\(text\)\{.*?\n  \}\n  function renderReferences\(\)\{',re.S)
    replacement='''  function referenceParagraph(text){
    const raw=clean(text);if(!raw)return;
    const hanging=(window.DOC_TIT_PDF_STANDARDS?.cmToPt?.(window.DOC_TIT_PDF_STANDARDS?.academic?.referenceHangingCm||1.27))||36;
    doc.setFont("times","normal");doc.setFontSize(12);
    const words=raw.split(/\\s+/),lines=[];let current="",lineIndex=0;
    for(const word of words){const maxW=lineIndex===0?bodyW:bodyW-hanging;const candidate=current?current+" "+word:word;if(!current||doc.getTextWidth(candidate)<=maxW)current=candidate;else{lines.push(current);lineIndex++;current=word;}}
    if(current)lines.push(current);ensure(Math.min(lines.length,2)*BODY.line+6);
    lines.forEach((line,i)=>{ensure(BODY.line);doc.text(line,BODY.left+(i?hanging:0),y);y+=BODY.line;});y+=7;
  }
  function renderReferences(){'''
    if not pat.search(s): raise SystemExit('referenceParagraph not found')
    return pat.sub(replacement,s,count=1)

for p,docid in [('trabajo-titulacion/full-document.js','trabajo-titulacion'),('articulo-academico/full-document.js','articulo-academico')]:
    s=read(p);s=standardized_cover(s,docid);s=better_refs(s)
    if docid=='articulo-academico':
        s=s.replace('    if(clean(ctx.payload?.notes))bullet("La planificación incorpora observaciones específicas registradas para el período.");\n','')
    write(p,s)

print('DOC-TIT finishing harmonization applied')