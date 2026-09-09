from pathlib import Path


def replace_once(path, old, new, label):
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Target not found for {label} in {path}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")


# 1) Global PDF editorial behavior.
path = Path("complexivo/full-document.js")
text = path.read_text(encoding="utf-8")

old = '''        let available=Math.floor((pageH-BODY.bottom-y)/lineHeight);
        if(available<2 && lines.length-index>1){
          newPage();
          available=Math.floor((pageH-BODY.bottom-y)/lineHeight);
        }
        let take=Math.min(Math.max(available,1),lines.length-index);
        const remaining=lines.length-index-take;
        if(remaining===1 && take>2) take-=1;
        if(take<=0){newPage();continue;}'''
new = '''        let available=Math.floor((pageH-BODY.bottom-y)/lineHeight);
        if(available<2 && lines.length-index>1){
          newPage();
          available=Math.floor((pageH-BODY.bottom-y)/lineHeight);
        }
        let take=Math.min(Math.max(available,1),lines.length-index);
        const remaining=lines.length-index-take;
        if(remaining===1 && take>2){
          take-=1;
        }else if(remaining===1 && take<=2 && lines.length-index>1){
          newPage();
          continue;
        }
        if(take===1 && lines.length-index>1){
          newPage();
          continue;
        }
        if(take<=0){newPage();continue;}'''
if old not in text:
    raise SystemExit("Paragraph pagination target not found")
text = text.replace(old, new, 1)

old = '''    function heading(text,level=1,includeToc=true){
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
    }'''
new = '''    function sentenceCaseHeading(text){
      const source=clean(text);
      const match=source.match(/^((?:\\d+\\.)+\\s*)(.*)$/);
      const prefix=match?match[1]:"";
      let label=match?match[2]:source;
      if(!label) return source;

      label=label.toLocaleLowerCase("es-EC");
      const protectedTerms=[
        [/\\bitsqmet\\b/gi,"ITSQMET"],
        [/\\butet\\b/gi,"UTET"],
        [/\\bocs\\b/gi,"OCS"],
        [/\\bloes\\b/gi,"LOES"],
        [/\\bapa\\b/gi,"APA"],
        [/\\bpdf\\b/gi,"PDF"],
        [/instituto superior tecnológico quito metropolitano/gi,"Instituto Superior Tecnológico Quito Metropolitano"],
        [/unidad de titulación y eficiencia terminal/gi,"Unidad de Titulación y Eficiencia Terminal"],
        [/titulación y eficiencia terminal/gi,"Titulación y Eficiencia Terminal"],
        [/núcleos de titulación/gi,"Núcleos de Titulación"],
        [/examen complexivo/gi,"Examen Complexivo"],
        [/cronograma operativo/gi,"Cronograma Operativo"]
      ];
      protectedTerms.forEach(([pattern,value])=>{ label=label.replace(pattern,value); });
      label=label.replace(/\\banexo\\s+([a-d])\\b/gi,(_,letter)=>`Anexo ${letter.toUpperCase()}`);
      label=label.charAt(0).toLocaleUpperCase("es-EC")+label.slice(1);
      return prefix+label;
    }

    function heading(text,level=1,includeToc=true){
      const style=level>=3?"bolditalic":"bold";
      const size=level===1?14:level===2?13:level===3?12.5:12;
      const cleaned=sentenceCaseHeading(text);

      // Cada capítulo de primer nivel comienza en página nueva, sin crear hojas vacías.
      if(level===1 && y>BODY.top+1) newPage();

      doc.setFont("times",style);
      doc.setFontSize(size);

      const lines=doc.splitTextToSize(cleaned,bodyW);
      const before=level===1?0:level===2?10:6;
      const after=level===1?18:level===2?12:8;
      const titleHeight=before+(lines.length*22)+after;
      const minFollowing=level===1?BODY.lineHeight*3:level===2?BODY.lineHeight*3:BODY.lineHeight*2;

      // Mantener títulos y subtítulos con una porción útil del bloque que los desarrolla.
      ensureSpace(titleHeight+minFollowing+12);
      y+=before;

      if(includeToc) toc.push({title:cleaned,level,page:doc.getNumberOfPages()});

      doc.setFont("times",style);
      doc.setFontSize(size);
      doc.text(lines,BODY.left,y,{align:"left"});
      y+=lines.length*22+after;

      const key=smartSectionKey(text);
      if(key && !analysisInjected.has(key)){
        analysisInjected.add(key);
        getAnalysisSentences(ctx,key).forEach(s=>paragraph(s));
      }
    }'''
if old not in text:
    raise SystemExit("Heading function target not found")
text = text.replace(old, new, 1)

old = '''    function tableCaption(title){
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
    }'''
new = '''    function tableCaption(title){
      doc.setFont("times","italic");
      doc.setFontSize(11);
      const lines=doc.splitTextToSize(title,bodyW);
      const captionHeight=17+(lines.length*15)+12;

      // Mantener "Tabla X + título" junto con el encabezado y el inicio de la tabla.
      ensureSpace(captionHeight+84);
      tableCounter+=1;
      doc.setFont("times","bold");
      doc.setFontSize(11);
      doc.text("Tabla "+tableCounter,BODY.left,y);
      y+=17;
      doc.setFont("times","italic");
      doc.setFontSize(11);
      doc.text(lines,BODY.left,y);
      y+=lines.length*15+12;
      return tableCounter;
    }'''
if old not in text:
    raise SystemExit("Table caption target not found")
text = text.replace(old, new, 1)

old = '''    function figureCaption(number,title){
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
    }'''
new = '''    function figureCaption(number,title){
      doc.setFont("times","italic");
      doc.setFontSize(11);
      const lines=doc.splitTextToSize(title,bodyW);
      const captionHeight=17+(lines.length*16)+8;

      // Mantener identificación y título junto con el inicio de la figura.
      ensureSpace(captionHeight+72);
      doc.setFont("times","bold");
      doc.setFontSize(11);
      doc.text("Figura "+number,BODY.left,y);
      y+=17;
      doc.setFont("times","italic");
      doc.setFontSize(11);
      doc.text(lines,BODY.left,y);
      y+=lines.length*16+8;
    }'''
if old not in text:
    raise SystemExit("Figure caption target not found")
text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")


# 2) Annexes: keep heading with first visual block and rename Annex D.
path = Path("complexivo/pdf/sections/annexes.js")
text = path.read_text(encoding="utf-8")

old = '''      if(distribution.length){
        heading("14.1. Anexo A - Resumen de población y lugar de ejecución",2,true);
        const cardH=246;
        ensureSpace(cardH+12);'''
new = '''      if(distribution.length){
        const cardH=246;
        ensureSpace(cardH+82);
        heading("14.1. Anexo A - Resumen de población y lugar de ejecución",2,true);'''
if old not in text:
    raise SystemExit("Annex A target not found")
text = text.replace(old, new, 1)

old = '''      if(distribution.length){
        heading("14.2. Anexo B - Distribución por carrera y modalidad",2,true);
        const ranked=distribution.slice().sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0));
        const chunks=[];
        for(let i=0;i<ranked.length;i+=12) chunks.push(ranked.slice(i,i+12));
        chunks.forEach((chunk,index)=>{'''
new = '''      if(distribution.length){
        const ranked=distribution.slice().sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0));
        const chunks=[];
        for(let i=0;i<ranked.length;i+=12) chunks.push(ranked.slice(i,i+12));
        ensureSpace(414);
        heading("14.2. Anexo B - Distribución por carrera y modalidad",2,true);
        chunks.forEach((chunk,index)=>{'''
if old not in text:
    raise SystemExit("Annex B target not found")
text = text.replace(old, new, 1)

old = '''      if(schedule.length){
        heading("14.3. Anexo C - Cronograma general del proceso",2,true);
        const rows=schedule.filter(r=>r.start||r.end);
        const cardH=Math.min(410,92+rows.length*30);
        ensureSpace(cardH+14);'''
new = '''      if(schedule.length){
        const rows=schedule.filter(r=>r.start||r.end);
        const cardH=Math.min(410,92+rows.length*30);
        ensureSpace(cardH+84);
        heading("14.3. Anexo C - Cronograma general del proceso",2,true);'''
if old not in text:
    raise SystemExit("Annex C target not found")
text = text.replace(old, new, 1)

old = '      heading("14.4. Anexo D - Validación automática de consistencia",2,true);'
new = '      ensureSpace(370);\n      heading("14.4. Anexo D – Control de consistencia de la planificación",2,true);'
if old not in text:
    raise SystemExit("Annex D title target not found")
text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")


# 3) Bibliography: exact institutional regulation and no draft wording.
path = Path("complexivo/pdf/sections/bibliography.js")
text = path.read_text(encoding="utf-8")
old = '''      paragraph("Las referencias se presentan con un criterio uniforme de autor corporativo, año, título y fuente normativa. No se incorporan referencias institucionales genéricas cuando no se dispone de una identificación formal verificable.",{indent:false});

      [
        "Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador. Registro Oficial 449.",
        "Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior. Registro Oficial Suplemento 298.",
        "Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494). Suplemento del Registro Oficial No. 110."
      ].forEach(reference);

      paragraph("Antes de emitir la planificación definitiva, las referencias institucionales adicionales deben incorporarse únicamente cuando se disponga del nombre formal, versión o fecha del documento vigente.",{indent:false,italic:true});'''
new = '''      paragraph("Las referencias se presentan con un criterio uniforme adaptado a APA 7 para normativa: autor corporativo, año, título, identificación normativa y fuente o resolución cuando corresponde.",{indent:false});

      [
        "Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador. Registro Oficial 449.",
        "Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior. Registro Oficial Suplemento 298.",
        "Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494). Suplemento del Registro Oficial No. 110.",
        "Instituto Superior Tecnológico Quito Metropolitano. (2025). Reglamento de la Unidad de Titulación y Eficiencia Terminal (UTET-REG-25, versión 2.0). Resolución N.° ITSQMET-OCS-2025-03-02/27-MAR-2025, 27 de marzo de 2025."
      ].forEach(reference);'''
if old not in text:
    raise SystemExit("Bibliography target not found")
path.write_text(text.replace(old, new, 1), encoding="utf-8")


# 4) Formal institutional regulation in policy.
path = Path("complexivo/pdf/config/policy.js")
text = path.read_text(encoding="utf-8")
old = '''      {
        norm: "Reglamento institucional del Área de Titulación",
        provision: "Disposiciones institucionales vigentes para modalidades, requisitos, evaluación y cierre del proceso",
        application: "Define el marco operativo interno que debe aplicarse al período generado."
      }'''
new = '''      {
        norm: "Reglamento de la Unidad de Titulación y Eficiencia Terminal",
        provision: "UTET-REG-25, versión 2.0; aprobado por el OCS el 27 de marzo de 2025 mediante Resolución N.° ITSQMET-OCS-2025-03-02/27-MAR-2025",
        application: "Define modalidades, requisitos, responsabilidades, evaluación y lineamientos institucionales aplicables al proceso de titulación."
      }'''
if old not in text:
    raise SystemExit("Policy regulation target not found")
path.write_text(text.replace(old, new, 1), encoding="utf-8")


# 5) Formal institutional regulation in legal basis.
path = Path("complexivo/pdf/sections/legal-basis.js")
text = path.read_text(encoding="utf-8")
old = '      paragraph("En el ámbito institucional, el Reglamento institucional del Área de Titulación y las disposiciones internas vigentes para el período determinan la forma de verificar requisitos, ejecutar la modalidad de titulación, aplicar criterios de evaluación, atender incidencias y registrar el cierre del proceso.");'
new = '      paragraph("En el ámbito institucional, el Reglamento de la Unidad de Titulación y Eficiencia Terminal (UTET-REG-25, versión 2.0), aprobado por el OCS el 27 de marzo de 2025 mediante Resolución N.° ITSQMET-OCS-2025-03-02/27-MAR-2025, determina la forma de verificar requisitos, ejecutar las modalidades de titulación, aplicar criterios de evaluación, atender incidencias y registrar el cierre del proceso.");'
if old not in text:
    raise SystemExit("Legal basis regulation target not found")
path.write_text(text.replace(old, new, 1), encoding="utf-8")

print("Final polish applied")
