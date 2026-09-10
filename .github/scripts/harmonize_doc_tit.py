from pathlib import Path
import re

ROOT=Path('.')

def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s): (ROOT/p).write_text(s,encoding='utf-8')
def once(s,old,new,label):
    if old in s: return s.replace(old,new,1)
    if new in s: return s
    raise SystemExit(f'pattern missing: {label}')

# 1) Complexivo: hide free text and decorative images; keep only inputs that feed required format.
p='complexivo/index.html'; s=read(p)
s=once(s,'<section class="panel smart-panel">','<section class="panel smart-panel" hidden aria-hidden="true">','hide smart panel')
needle='<section class="panel">\n                <div class="panel-head">\n                  <div>\n                    <span class="eyebrow">5. Imágenes del documento</span>'
repl='<section class="panel" hidden aria-hidden="true">\n                <div class="panel-head">\n                  <div>\n                    <span class="eyebrow">5. Imágenes del documento</span>'
s=once(s,needle,repl,'hide complexivo images')
s=re.sub(r'data-workspace\.js\?v=[^"<]+','data-workspace.js?v=20260910-audit-2',s)
s=re.sub(r'\.\./shared/pdf/standards\.js\?v=[^"<]+','../shared/pdf/standards.js?v=20260910-audit-2',s)
write(p,s)

p='complexivo/data-workspace.js'; s=read(p)
old='''  const RESOURCE_BLOCKS = [\n    {id:"smart",title:"Información adicional",description:"Texto libre que la app analiza y distribuye en el PDF.",target:"#smartTextInput",required:false},\n    {id:"logo",title:"Logo institucional",description:"Recurso obligatorio para la cabecera del documento.",target:"#logoUpload",required:true},\n    {id:"images",title:"Imágenes opcionales",description:"Recursos gráficos que pueden acompañar determinadas secciones.",target:"#introImageUpload",required:false}\n  ];'''
new='''  const RESOURCE_BLOCKS = [\n    {id:"logo",title:"Logo institucional",description:"Recurso obligatorio para la cabecera del documento.",target:"#logoUpload",required:true}\n  ];'''
s=once(s,old,new,'complexivo resources')
# Keep hidden legacy DOM compatible but do not mark it as an editor in the workspace.
s=s.replace('"#scheduleBody","#distributionBody","#operationalPlanBody","#smartTextInput",\n      "#logoUpload","#introImageUpload"','"#scheduleBody","#distributionBody","#operationalPlanBody",\n      "#logoUpload"')
write(p,s)

# 2) Article app: new templates and imports do not expose free-text observations; legacy payload remains readable.
p='articulo-academico/app.js'; s=read(p)
s=s.replace('  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Observaciones"],[payload.notes||""]]),"OBSERVACIONES");\n','')
s=s.replace('["5. Solo el CRONOGRAMA y el logo son obligatorios para generar. Las demás hojas complementan el documento cuando contienen datos."]','["5. El CRONOGRAMA y el logo son obligatorios para generar. Las tablas complementarias solo se incluyen cuando alimentan una sección real del formato."]')
write(p,s)

# Shared snippets for PDF standardization.
def patch_pdf(path, document_id, unit_fallback, role_fallback, is_article=False):
    s=read(path)
    if is_article:
        s=s.replace('const TITLE="Planificación De Artículo Académico";','const TITLE="Planificación de Artículo Académico";',1)
        # Remove decorative image and free-note insertions from the final document.
        s=re.sub(r',?\{"type":"image","key":"(?:introImage|methodologyImage|closingImage)"\}', '', s)
        s=s.replace(',{"type":"notes"}','').replace('{"type":"notes"},','')
    # Body geometry: same academic standard used by Complexivo (APA-adapted institutional body).
    s=re.sub(r'  const BODY=\{left:72,right:72,top:106,bottom:48,font:12,line:20,indent:34\};',
'''  const pdfStandards=window.DOC_TIT_PDF_STANDARDS||{};\n  const academic=pdfStandards.academic||{};\n  const cmToPt=pdfStandards.cmToPt||((v)=>Number(v||0)*(72/2.54));\n  const BODY={\n    left:cmToPt(academic.marginLeftCm||2.54),\n    right:cmToPt(academic.marginRightCm||2.54),\n    top:108,bottom:62,\n    font:academic.bodyFontPt||12,\n    line:academic.lineHeightPt||24,\n    indent:cmToPt(academic.paragraphIndentCm||1.27)\n  };''',s,count=1)

    # Article did not have institutional resolver; Trabajo already does.
    if is_article and 'function institutional(){' not in s:
        marker='  doc.setProperties({title:TITLE,subject:"Planificación semestral del proceso de titulación",author:"ITSQMET",creator:"DOC-TIT"});\n\n'
        helper=marker+f'''  function institutional(){{\n    const fallback={{preparedBy:"Mgs. Jefferson Villarreal",preparedRole:"{role_fallback}",reviewedBy:"Ing. Martha Tomalá",reviewedRole:"Coordinadora General de Carreras",approvedBy:"Dr. Alex León",approvedRole:"Vicerrector",unit:"{unit_fallback}"}};\n    try{{return {{...fallback,...(window.DOC_TIT_INSTITUTIONAL?.resolve?.("{document_id}")||{{}})}};}}catch(_){{return fallback;}}\n  }}\n  function fitImage(data,x,y,maxW,maxH){{\n    if(!data)return;\n    try{{const props=doc.getImageProperties(data),ratio=props.width/props.height;let w=maxW,h=w/ratio;if(h>maxH){{h=maxH;w=h*ratio;}}doc.addImage(data,imageFormat(data),x+(maxW-w)/2,y+(maxH-h)/2,w,h,undefined,"FAST");}}catch(_){{}}\n  }}\n\n'''
        s=once(s,marker,helper,'article institutional resolver')

    # Standard RGI header for Trabajo/Artículo: 18cm cover, 25/50/25, 9pt unit/title/period/code.
    header_pat=re.compile(r'  function header\(\)\{.*?\n  \}\n\n  function newPage\(\)\{',re.S)
    new_header=f'''  function header(){{\n    const pageNo=doc.getNumberOfPages();if(headerDone.has(pageNo))return;headerDone.add(pageNo);\n    const inst=institutional();const standard=window.DOC_TIT_PDF_STANDARDS?.resolveRgi?.("{document_id}")||{{}};\n    const cm=window.DOC_TIT_PDF_STANDARDS?.cmToPt||((v)=>Number(v||0)*(72/2.54));\n    const isCover=pageNo===1;\n    const totalW=isCover?cm(standard.headerWidthCm||18):W-60;\n    const x=isCover?(W-totalW)/2:30;\n    const top=isCover?cm(standard.headerTopCm||1.5):18;\n    const h=isCover?cm(standard.headerHeightCm||2.8):72;\n    const leftW=totalW*.25,centerW=totalW*.50,rightW=totalW*.25,row1=isCover?cm(.8):22,row2=h-row1;\n    const bx=x+leftW,rx=bx+centerW;\n    doc.setDrawColor(0);doc.setLineWidth(.65);doc.rect(x,top,totalW,h);doc.line(bx,top,bx,top+h);doc.line(rx,top,rx,top+h);doc.line(bx,top+row1,rx,top+row1);\n    fitImage(ctx.assets?.logo,x+6,top+5,leftW-12,h-10);\n    doc.setFont("helvetica","normal");doc.setFontSize(standard.headerUnitPt||9);\n    const unitLines=doc.splitTextToSize(String(inst.unit||"").toUpperCase(),centerW-12);const unitH=9.5;const unitY=top+(row1-unitLines.length*unitH)/2+7.5;doc.text(unitLines,bx+centerW/2,unitY,{{align:"center",lineHeightFactor:1.05}});\n    doc.setFont("helvetica","bold");doc.setFontSize(standard.headerDocumentPt||9);\n    const titleLines=doc.splitTextToSize(TITLE,centerW-16);const titleH=9.8;\n    const periodLines=doc.splitTextToSize(clean(ctx.period?.name),centerW-16);const periodH=9.8;const groupH=titleLines.length*titleH+4+periodLines.length*periodH;let groupY=top+row1+(row2-groupH)/2+7.5;\n    doc.text(titleLines,bx+centerW/2,groupY,{{align:"center",lineHeightFactor:1.02}});groupY+=titleLines.length*titleH+4;doc.text(periodLines,bx+centerW/2,groupY,{{align:"center",lineHeightFactor:1.02}});\n    doc.setFont("helvetica","bold");doc.setFontSize(9);doc.text("Código:",rx+rightW/2,top+h/2-7,{{align:"center"}});doc.setFont("helvetica","normal");const codeLines=doc.splitTextToSize(clean(ctx.code),rightW-10);doc.text(codeLines,rx+rightW/2,top+h/2+6,{{align:"center",lineHeightFactor:1.05}});\n  }}\n\n  function newPage(){{'''
    if header_pat.search(s): s=header_pat.sub(new_header,s,count=1)
    else: raise SystemExit(f'header not found in {path}')

    # Sentence case headings for Article; Trabajo already has it.
    if is_article and 'function sentenceCaseHeading(text)' not in s:
        marker='function clean(v){return String(v??"").replace(/\\s+/g," ").trim();}\n'
        helper=marker+'''function sentenceCaseHeading(text){\n  const source=clean(text),match=source.match(/^((?:\\d+\\.)+\\s*)(.*)$/);const prefix=match?match[1]:"";let label=match?match[2]:source;if(!label)return source;\n  label=label.toLocaleLowerCase("es-EC");const protectedTerms=[[/\\bitsqmet\\b/gi,"ITSQMET"],[/\\butet\\b/gi,"UTET"],[/\\bugpa\\b/gi,"UGPA"],[/\\bpoa\\b/gi,"POA"],[/\\bpedi\\b/gi,"PEDI"],[/\\bloes\\b/gi,"LOES"],[/artículo académico/gi,"Artículo Académico"],[/examen complexivo/gi,"Examen Complexivo"]];protectedTerms.forEach(([p,v])=>label=label.replace(p,v));label=label.charAt(0).toLocaleUpperCase("es-EC")+label.slice(1);return prefix+label;\n}\n'''
        s=once(s,marker,helper,'article sentence case helper')
        old='''    const lines=doc.splitTextToSize(text,bodyW);\n    ensure(lines.length*22+BODY.line*3);\n    if(include)toc.push({title:text,level,page:doc.getNumberOfPages()});\n    doc.text(lines,BODY.left,y);y+=lines.length*22+10;'''
        new='''    const displayText=sentenceCaseHeading(text);\n    const lines=doc.splitTextToSize(displayText,bodyW);\n    ensure(lines.length*22+BODY.line*3);\n    if(include)toc.push({title:displayText,level,page:doc.getNumberOfPages()});\n    doc.text(lines,BODY.left,y);y+=lines.length*22+10;'''
        s=once(s,old,new,'article heading sentence case')

    # Article paragraph -> same justified institutional body treatment.
    if is_article:
        old='''    const lines=doc.splitTextToSize(clean(text),bodyW-indent);\n    lines.forEach((line,i)=>{\n      ensure(BODY.line);\n      doc.setFont("times",style);doc.setFontSize(size);\n      doc.text(line,BODY.left+(i===0?indent:0),y);\n      y+=BODY.line;\n    });'''
        new='''    const maxW=bodyW-indent;const lines=doc.splitTextToSize(clean(text),maxW);\n    lines.forEach((line,i)=>{\n      ensure(BODY.line);doc.setFont("times",style);doc.setFontSize(size);const x=BODY.left+(i===0?indent:0),lineMax=i===0?maxW:bodyW;\n      if(opts.justify===false||i===lines.length-1)doc.text(line,x,y);else doc.text(line,x,y,{align:"justify",maxWidth:lineMax});\n      y+=BODY.line;\n    });'''
        s=once(s,old,new,'article justified paragraph')

    # Table behavior and standard body size.
    s=s.replace('styles:{font:"times",fontSize:8.8,cellPadding:4,textColor:0,overflow:"linebreak",valign:"top"},','styles:{font:"times",fontSize:(window.DOC_TIT_PDF_STANDARDS?.tables?.bodyFontPt||10),cellPadding:4,textColor:0,overflow:"linebreak",valign:"top"},')
    if 'showHead:"everyPage",rowPageBreak:"avoid"' not in s:
        s=s.replace('headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0},','showHead:"everyPage",rowPageBreak:"avoid",\n      headStyles:{font:"times",fontStyle:"bold",fillColor:[255,255,255],textColor:0},',1)

    # Cover uses institutional resolver; Article previously hardcoded.
    if is_article:
        old='''    const top=H-260,x=36,w=W-72,col=w/3,totalH=175;\n    const cells=[\n      ["ELABORADO POR:","Mgs. Jefferson Villarreal",AUTHOR_ROLE],\n      ["REVISADO POR:","Ing. Martha Tomalá","Coordinadora General de Carreras"],\n      ["APROBADO POR:","Dr. Alex León","Vicerrector"]\n    ];'''
        new='''    const top=H-260,x=36,w=W-72,col=w/3,totalH=175;const inst=institutional();\n    const cells=[\n      ["ELABORADO POR:",inst.preparedBy,inst.preparedRole],\n      ["REVISADO POR:",inst.reviewedBy,inst.reviewedRole],\n      ["APROBADO POR:",inst.approvedBy,inst.approvedRole]\n    ];'''
        s=once(s,old,new,'article cover institutional')

    # APA-style hanging references, alphabetical; preserve reference wording.
    if 'function referenceParagraph(text)' not in s:
        marker='  function renderReferences(){REFERENCES.forEach(ref=>paragraph(ref,{indent:false}));}\n' if is_article else '  function renderReferences(){\n    REFERENCES.forEach(ref=>paragraph(ref,{indent:false}));\n  }\n'
        helper='''  function referenceParagraph(text){\n    const raw=clean(text);if(!raw)return;const hanging=(window.DOC_TIT_PDF_STANDARDS?.cmToPt?.(window.DOC_TIT_PDF_STANDARDS?.academic?.referenceHangingCm||1.27))||36;doc.setFont("times","normal");doc.setFontSize(12);\n    const lines=doc.splitTextToSize(raw,bodyW-hanging);ensure(Math.min(lines.length,2)*BODY.line+6);lines.forEach((line,i)=>{ensure(BODY.line);doc.text(line,BODY.left+(i?hanging:0),y);y+=BODY.line;});y+=7;\n  }\n  function renderReferences(){\n    REFERENCES.slice().sort((a,b)=>String(a).localeCompare(String(b),"es",{sensitivity:"base"})).forEach(referenceParagraph);\n  }\n'''
        s=once(s,marker,helper,'reference renderer')

    # No visible page number on cover.
    s=s.replace('for(let p=1;p<=total;p++){','for(let p=2;p<=total;p++){',1)
    write(path,s)

patch_pdf('trabajo-titulacion/full-document.js','trabajo-titulacion','Unidad de Gestión de Procesos Académicos','Gestor de Procesos Académicos',False)
patch_pdf('articulo-academico/full-document.js','articulo-academico','Unidad de Titulación y Eficiencia Terminal','Coordinador de Titulación y Eficiencia Terminal',True)

# 3) Update README for actual shared structure.
p='README.md'; s=read(p)
s=s.replace('- `sidebar.js` / `sidebar.css` — navegación lateral común.','- `sidebar.js` / `sidebar.css` — navegación lateral común.\n- `module-ui.js` / `module-ui.css` — carcasa visual común, estado y acción principal de las planificaciones.')
s=s.replace('- `pdf/standards.js` — constantes maestras RGI, portada, tablas y paginación para nuevos generadores.','- `pdf/standards.js` — constantes maestras RGI y APA institucional para encabezado, portada, cuerpo, tablas, referencias y paginación.')
write(p,s)

print('DOC-TIT harmonized')