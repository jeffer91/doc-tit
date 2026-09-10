from pathlib import Path
import re

ROOT = Path('.')


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(f'No se encontró patrón para {label}')


# -----------------------------------------------------------------------------
# 1) full-document.js
# -----------------------------------------------------------------------------
path = 'trabajo-titulacion/full-document.js'
text = read(path)

text = replace_once(
    text,
    'const TITLE="Planificación De Trabajo De Titulación";',
    'const TITLE="Planificación de Trabajo de Titulación";',
    'título principal'
)
text = replace_once(
    text,
    'const INDUCTION_CONFIG=window.DOC_TIT_TRABAJO_INDUCTION||{};\n',
    'const INDUCTION_CONFIG=window.DOC_TIT_TRABAJO_INDUCTION||{};\nconst AUTHORIZATIONS_CONFIG=window.DOC_TIT_TRABAJO_AUTHORIZATIONS||{};\n',
    'configuración sección 8'
)

# Sustituir la antigua sección 8 resumida por renderer controlado.
pattern = re.compile(
    r'\{"type":"h","text":"8\. Informe Y Autorizaciones","level":1\}.*?'
    r'\{"type":"h","text":"9\. Cronograma De Actividades","level":1\}',
    re.S
)
replacement = '{"type":"h","text":"8. Informe y Autorizaciones","level":1},{"type":"authorizations"},{"type":"h","text":"9. Cronograma de Actividades","level":1}'
if pattern.search(text):
    text = pattern.sub(replacement, text, count=1)
elif '"type":"authorizations"' not in text:
    raise SystemExit('No se pudo sustituir la Sección 8 antigua')

# Numeración correcta de Sección 4 según documento fuente.
numbering = {
    'heading(documentation.modalityTitle||"4.3. Modalidades Híbrida, Presencial y Online",2,true);':
        'heading("4.2.1. Modalidades Híbrida, Presencial y Online",3,true);',
    'heading("4.4. Requisitos Financieros",2,true);': 'heading("4.3. Requisitos Financieros",2,true);',
    'heading("4.4.1. Requisitos Financieros Generales",3,true);': 'heading("4.3.1. Requisitos Financieros Generales",3,true);',
    'heading("4.5. Vinculación con la Sociedad",2,true);': 'heading("4.4. Vinculación con la Sociedad",2,true);',
    'heading("4.5.1. Importancia de la Vinculación con la Sociedad",3,true);': 'heading("4.4.1. Importancia de la Vinculación con la Sociedad",3,true);',
    'heading("4.5.2. Requisitos para la Vinculación con la Sociedad",3,true);': 'heading("4.4.2. Requisitos para la Vinculación con la Sociedad",3,true);',
    'heading("4.5.3. Ejemplos de Proyectos de Vinculación por Carrera",3,true);': 'heading("4.4.3. Ejemplos de Proyectos de Vinculación por Carrera",3,true);',
    'heading("4.6. Prácticas Preprofesionales",2,true);': 'heading("4.5. Prácticas Preprofesionales",2,true);',
    'heading("4.6.1. Objetivo e Importancia de las Prácticas Preprofesionales",3,true);': 'heading("4.5.1. Objetivo e Importancia de las Prácticas Preprofesionales",3,true);',
    'heading("4.6.2. Requisitos para la Realización de las Prácticas Preprofesionales",3,true);': 'heading("4.5.2. Requisitos para la Realización de las Prácticas Preprofesionales",3,true);',
    'heading("4.6.3. Documentación de Culminación de Prácticas Preprofesionales",3,true);': 'heading("4.5.3. Documentación de Culminación de Prácticas Preprofesionales",3,true);',
    'heading("4.7. Requisito de Lengua Extranjera",2,true);': 'heading("4.6. Requisito de Lengua Extranjera",2,true);',
    'heading("4.7.1. Objetivo del Requisito de Lengua Extranjera",3,true);': 'heading("4.6.1. Objetivo del Requisito de Lengua Extranjera",3,true);',
    'heading("4.7.2. Cumplimiento del Nivel A2 en Lengua Extranjera",3,true);': 'heading("4.6.2. Cumplimiento del Nivel A2 en Lengua Extranjera",3,true);',
    'heading("4.7.3. Procedimiento para la Entrega del Certificado de Nivel A2",3,true);': 'heading("4.6.3. Procedimiento para la Entrega del Certificado de Nivel A2",3,true);',
    'heading("4.8. Actualización de Datos",2,true);': 'heading("4.7. Actualización de Datos",2,true);',
    'heading("4.8.1. Objetivo de la Actualización de Datos",3,true);': 'heading("4.7.1. Objetivo de la Actualización de Datos",3,true);',
    'heading("4.8.2. Procedimiento para la Actualización de Datos",3,true);': 'heading("4.7.2. Procedimiento para la Actualización de Datos",3,true);',
    'heading("4.8.3. Importancia de la Actualización de Datos",3,true);': 'heading("4.7.3. Importancia de la Actualización de Datos",3,true);',
}
for old, new in numbering.items():
    if old in text:
        text = text.replace(old, new, 1)
    elif new not in text:
        raise SystemExit(f'Falta numeración esperada: {old}')

# Bibliografía normativa completa y vigente, conservando las referencias académicas de la introducción.
old_refs = '''"Instituto Superior Tecnológico Quito Metropolitano. (2022). Reglamento del Área de Titulación del ITSQMET.",
"Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador.",
"Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior."'''
new_refs = '''"Secretaría Nacional de Planificación (SENPLADES). (2021). Plan Nacional de Desarrollo 2021-2025.",
"Consejo de Europa. (2001). Marco Común Europeo de Referencia para las Lenguas.",
"Asamblea Constituyente del Ecuador. (2008). Constitución de la República del Ecuador. Registro Oficial 449.",
"Asamblea Nacional del Ecuador. (2010). Ley Orgánica de Educación Superior. Registro Oficial Suplemento 298.",
"Presidencia de la República del Ecuador. (2022). Reglamento a la Ley Orgánica de Educación Superior (Decreto Ejecutivo No. 494). Suplemento del Registro Oficial No. 110.",
"Instituto Superior Tecnológico Quito Metropolitano. (2025). Reglamento de la Unidad de Titulación y Eficiencia Terminal (UTET-REG-25, versión 2.0). Resolución N.° ITSQMET-OCS-2025-03-02/27-MAR-2025, 27 de marzo de 2025."'''
text = replace_once(text, old_refs, new_refs, 'bibliografía normativa')

# Sentence case de encabezados, protegiendo siglas y denominaciones institucionales.
if 'function sentenceCaseHeading(text)' not in text:
    marker = 'function clean(v){return String(v??"").replace(/\\s+/g," ").trim();}\n'
    helper = '''function clean(v){return String(v??"").replace(/\\s+/g," ").trim();}\nfunction sentenceCaseHeading(text){
  const source=clean(text);
  const match=source.match(/^((?:\\d+\\.)+\\s*)(.*)$/);
  const prefix=match?match[1]:"";
  let label=match?match[2]:source;
  if(!label)return source;
  label=label.toLocaleLowerCase("es-EC");
  const protectedTerms=[
    [/\\bitsqmet\\b/gi,"ITSQMET"],[/\\butet\\b/gi,"UTET"],[/\\bugpa\\b/gi,"UGPA"],
    [/\\bocs\\b/gi,"OCS"],[/\\bloes\\b/gi,"LOES"],[/\\bsisacad\\b/gi,"SISACAD"],
    [/\\bmcer\\b/gi,"MCER"],[/\\ba2\\b/gi,"A2"],[/\\bpdf\\b/gi,"PDF"],
    [/instituto superior tecnológico quito metropolitano/gi,"Instituto Superior Tecnológico Quito Metropolitano"],
    [/unidad de gestión de procesos académicos/gi,"Unidad de Gestión de Procesos Académicos"],
    [/unidad de titulación y eficiencia terminal/gi,"Unidad de Titulación y Eficiencia Terminal"],
    [/trabajo de titulación/gi,"Trabajo de Titulación"],
    [/examen complexivo/gi,"Examen Complexivo"]
  ];
  protectedTerms.forEach(([pattern,value])=>{label=label.replace(pattern,value);});
  label=label.charAt(0).toLocaleUpperCase("es-EC")+label.slice(1);
  return prefix+label;
}\n'''
    text = replace_once(text, marker, helper, 'sentence case')

# Encabezado vectorial 25/50/25, logo con proporción y unidad UGPA desde configuración compartida.
header_pattern = re.compile(r'  function header\(\)\{.*?\n  \}\n\n  function newPage\(\)\{', re.S)
new_header = '''  function institutional(){
    const fallback={
      preparedBy:"Mgs. Jefferson Villarreal",preparedRole:AUTHOR_ROLE,
      reviewedBy:"Ing. Martha Tomalá",reviewedRole:"Coordinadora General de Carreras",
      approvedBy:"Dr. Alex León",approvedRole:"Vicerrector",
      unit:"Unidad de Gestión de Procesos Académicos"
    };
    try{return {...fallback,...(window.DOC_TIT_INSTITUTIONAL?.resolve?.("trabajo-titulacion")||{})};}
    catch(_){return fallback;}
  }
  function fitImage(data,x,y,maxW,maxH){
    if(!data)return;
    try{
      const props=doc.getImageProperties(data);const ratio=props.width/props.height;
      let w=maxW,h=w/ratio;if(h>maxH){h=maxH;w=h*ratio;}
      doc.addImage(data,imageFormat(data),x+(maxW-w)/2,y+(maxH-h)/2,w,h,undefined,"FAST");
    }catch(_){}
  }
  function header(){
    const p=doc.getNumberOfPages();if(headerDone.has(p))return;headerDone.add(p);
    const inst=institutional();
    const x=30,top=20,totalW=W-60,h=62,leftW=totalW*.25,centerW=totalW*.50,rightW=totalW*.25;
    doc.setDrawColor(0);doc.setLineWidth(.7);doc.rect(x,top,totalW,h);
    doc.line(x+leftW,top,x+leftW,top+h);doc.line(x+leftW+centerW,top,x+leftW+centerW,top+h);
    fitImage(ctx.assets?.logo,x+6,top+5,leftW-12,h-10);

    doc.setFont("helvetica","normal");doc.setFontSize(7.6);
    const unitLines=doc.splitTextToSize(String(inst.unit||"").toUpperCase(),centerW-14).slice(0,2);
    doc.text(unitLines,x+leftW+centerW/2,top+13,{align:"center"});
    doc.setFont("helvetica","bold");doc.setFontSize(8.6);
    const titleLines=doc.splitTextToSize(TITLE,centerW-14).slice(0,2);
    doc.text(titleLines,x+leftW+centerW/2,top+31,{align:"center"});
    doc.setFont("helvetica","normal");doc.setFontSize(7.8);
    const periodLines=doc.splitTextToSize(clean(ctx.period?.name),centerW-14).slice(0,2);
    doc.text(periodLines,x+leftW+centerW/2,top+54,{align:"center"});

    const rx=x+leftW+centerW;
    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text("Código:",rx+rightW/2,top+17,{align:"center"});
    doc.setFont("helvetica","bold");doc.setFontSize(8.1);
    const codeLines=doc.splitTextToSize(clean(ctx.code),rightW-12).slice(0,3);
    doc.text(codeLines,rx+rightW/2,top+34,{align:"center"});
  }

  function newPage(){'''
if header_pattern.search(text):
    text = header_pattern.sub(new_header, text, count=1)
elif 'function institutional()' not in text:
    raise SystemExit('No se encontró header() para modernizar')

# Heading usa sentence case tanto en PDF como en índice.
old_heading_core = '''    const lines=doc.splitTextToSize(text,bodyW);
    ensure(lines.length*22+BODY.line*3);
    if(include)toc.push({title:text,level,page:doc.getNumberOfPages()});
    doc.text(lines,BODY.left,y);y+=lines.length*22+10;'''
new_heading_core = '''    const displayText=sentenceCaseHeading(text);
    const lines=doc.splitTextToSize(displayText,bodyW);
    ensure(lines.length*22+BODY.line*3);
    if(include)toc.push({title:displayText,level,page:doc.getNumberOfPages()});
    doc.text(lines,BODY.left,y);y+=lines.length*22+10;'''
text = replace_once(text, old_heading_core, new_heading_core, 'sentence case headings')

# Portada usa configuración institucional compartida.
old_cover = '''    const top=H-260,x=36,w=W-72,col=w/3,totalH=175;
    const cells=[
      ["ELABORADO POR:","Mgs. Jefferson Villarreal",AUTHOR_ROLE],
      ["REVISADO POR:","Ing. Martha Tomalá","Coordinadora General de Carreras"],
      ["APROBADO POR:","Dr. Alex León","Vicerrector"]
    ];'''
new_cover = '''    const top=H-260,x=36,w=W-72,col=w/3,totalH=175;
    const inst=institutional();
    const cells=[
      ["ELABORADO POR:",inst.preparedBy,inst.preparedRole],
      ["REVISADO POR:",inst.reviewedBy,inst.reviewedRole],
      ["APROBADO POR:",inst.approvedBy,inst.approvedRole]
    ];'''
text = replace_once(text, old_cover, new_cover, 'portada institucional')

# Sección 8 completa y versionada.
if 'function renderAuthorizations()' not in text:
    marker = '  function resolveInduction(){'
    helper = '''  function resolveAuthorizations(){
    const snapshot=ctx.payload?.contentSnapshots?.authorizations;
    if(snapshot&&snapshot.report&&snapshot.financialPermissions)return snapshot;
    const current=AUTHORIZATIONS_CONFIG;
    if(current&&current.report&&current.financialPermissions)return current;
    return null;
  }
  function renderAuthorizations(){
    const block=resolveAuthorizations();
    if(!block)throw new Error("No existe una configuración institucional validada de Informe y Autorizaciones.");
    paragraph(block.intro||"");

    const report=block.report||{};
    heading("8.1. Desarrollo del Informe de Titulación",2,true);
    paragraph(report.intro||"");
    heading("8.1.1. Seguimiento y Evaluación de Gestiones",3,true);
    (report.tracking||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      processText(item.text||"",1,"o");
    });

    const financial=block.financialPermissions||{};
    heading("8.2. Permisos y Autorizaciones Financieras",2,true);
    paragraph(financial.intro||"");
    heading("8.2.1. Gestión de Permisos para Estudiantes con Pagos Pendientes",3,true);
    (financial.temporaryPermission||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      processText(item.text||"",1,"o");
    });
    heading("8.2.2. Aprobación por el Departamento de Facturación",3,true);
    (financial.billingApproval||[]).forEach(item=>{
      processNumberedTitle(item.number,item.title);
      processText(item.text||"",1,"o");
    });
  }
  function resolveInduction(){'''
    text = replace_once(text, marker, helper, 'renderer sección 8')

text = replace_once(
    text,
    '      else if(item.type==="induction")renderInduction();\n',
    '      else if(item.type==="induction")renderInduction();\n      else if(item.type==="authorizations")renderAuthorizations();\n',
    'wiring sección 8'
)

# Conclusiones y recomendaciones: número y párrafo en la misma línea.
if 'function numberedParagraph(number,text)' not in text:
    marker = '  function resolveConclusions(){'
    helper = '''  function numberedParagraph(number,text){
    const raw=clean(text);if(!raw)return;
    const lead=`${number}. `,x=BODY.left,maxW=bodyW,lineH=BODY.line;
    doc.setFont("times","bold");doc.setFontSize(12);const leadW=doc.getTextWidth(lead);
    const words=raw.split(/\\s+/).filter(Boolean);let first=[],rest=[];
    for(const word of words){
      const candidate=[...first,word].join(" ");doc.setFont("times","normal");
      if(!rest.length&&doc.getTextWidth(candidate)<=Math.max(60,maxW-leadW))first.push(word);else rest.push(word);
    }
    ensure(lineH*2);doc.setFont("times","bold");doc.text(lead,x,y);doc.setFont("times","normal");
    if(first.length)doc.text(first.join(" "),x+leadW,y);y+=lineH;
    const remaining=rest.join(" ");
    if(remaining){const lines=doc.splitTextToSize(remaining,maxW);lines.forEach((line,i)=>{ensure(lineH);if(i===lines.length-1)doc.text(line,x,y);else doc.text(line,x,y,{align:"justify",maxWidth:maxW});y+=lineH;});}
    y+=7;
  }
  function resolveConclusions(){'''
    text = replace_once(text, marker, helper, 'párrafo numerado')

text = text.replace('      listHeading(`${index+1}.`);\n      paragraph(raw,{indent:false});', '      numberedParagraph(index+1,raw);')

# La portada no lleva número de página.
text = replace_once(text, '  for(let p=1;p<=total;p++){', '  for(let p=2;p<=total;p++){', 'numeración desde página 2')

write(path, text)


# -----------------------------------------------------------------------------
# 2) app.js: snapshots de Sección 8, bloqueo explícito por aprobación y UX real
# -----------------------------------------------------------------------------
path = 'trabajo-titulacion/app.js'
text = read(path)
text = text.replace('"title":"Planificación De Trabajo De Titulación"', '"title":"Planificación de Trabajo de Titulación"', 1)

if 'function currentAuthorizationsSnapshot()' not in text:
    marker = 'function currentInductionSnapshot(){'
    helper = '''function currentAuthorizationsSnapshot(){
  const block=window.DOC_TIT_TRABAJO_AUTHORIZATIONS;
  if(!block||!block.report||!block.financialPermissions)return null;
  return JSON.parse(JSON.stringify(block));
}
function currentInductionSnapshot(){'''
    text = replace_once(text, marker, helper, 'snapshot Sección 8')

text = replace_once(
    text,
    'administrativeLogistics:currentLogisticsSnapshot(),induction:currentInductionSnapshot(),scheduleStructure:',
    'administrativeLogistics:currentLogisticsSnapshot(),induction:currentInductionSnapshot(),authorizations:currentAuthorizationsSnapshot(),scheduleStructure:',
    'snapshot Sección 8 en blankPayload'
)

# Migrar únicamente configuraciones A con contradicciones conocidas: son correcciones, no cambios de política.
old_norm = '''  if(!contentSnapshots.methodology)contentSnapshots.methodology=currentMethodologySnapshot();
  if(!contentSnapshots.requirements)contentSnapshots.requirements=currentRequirementsSnapshot();
  if(!contentSnapshots.processDescription)contentSnapshots.processDescription=currentProcessSnapshot();
  if(!contentSnapshots.administrativeLogistics)contentSnapshots.administrativeLogistics=currentLogisticsSnapshot();
  if(!contentSnapshots.induction)contentSnapshots.induction=currentInductionSnapshot();'''
new_norm = '''  if(!contentSnapshots.methodology||contentSnapshots.methodology?.technicalVersion==="A")contentSnapshots.methodology=currentMethodologySnapshot();
  if(!contentSnapshots.requirements)contentSnapshots.requirements=currentRequirementsSnapshot();
  if(!contentSnapshots.processDescription||contentSnapshots.processDescription?.technicalVersion==="A")contentSnapshots.processDescription=currentProcessSnapshot();
  if(!contentSnapshots.administrativeLogistics)contentSnapshots.administrativeLogistics=currentLogisticsSnapshot();
  if(!contentSnapshots.induction)contentSnapshots.induction=currentInductionSnapshot();
  if(!contentSnapshots.authorizations)contentSnapshots.authorizations=currentAuthorizationsSnapshot();'''
text = replace_once(text, old_norm, new_norm, 'normalización snapshots')

# Solo se muestran entradas que realmente consumirá el documento final: cronograma. Las tablas antiguas quedan compatibles para importaciones históricas, pero no se solicitan.
render_loop = re.compile(r'  let n=2;\n  Object\.entries\(CONFIG\.tables\)\.forEach\(\(\[key,t\]\)=>\{.*?\n  \}\);\n  host\.innerHTML=html;', re.S)
if render_loop.search(text):
    text = render_loop.sub('  host.innerHTML=html;', text, count=1)
elif 'let n=2;' in text:
    raise SystemExit('No se pudo retirar tablas visibles no consumidas')
text = text.replace('  Object.keys(CONFIG.tables).forEach(renderTable);\n', '', 1)
text = replace_once(text, '  const body=$("#tbody-"+key);\n  body.innerHTML=', '  const body=$("#tbody-"+key);if(!body)return;\n  body.innerHTML=', 'guard renderTable')

# Nueva plantilla solo contiene información que la app realmente usa.
text = text.replace(
    '["5. Cada actividad activa del CRONOGRAMA debe tener al menos una fecha o plazo. El logo también es obligatorio. Las demás hojas complementan el documento cuando contienen datos."]',
    '["5. Cada actividad activa del CRONOGRAMA debe tener al menos una fecha o plazo. El cronograma debe aprobarse en la app y el logo institucional es obligatorio. Las demás secciones se generan desde configuración institucional controlada."]',
    1
)
# Eliminar creación de hojas no visibles en nuevas plantillas, manteniendo importación retrocompatible.
loop_pattern = re.compile(r'  Object\.entries\(CONFIG\.tables\)\.forEach\(\(\[key,t\]\)=>\{const rows=.*?XLSX\.utils\.book_append_sheet\(wb,ws,t\.sheet\);\}\);\n', re.S)
if loop_pattern.search(text):
    text = loop_pattern.sub('', text, count=1)
# No exportar observaciones que no forman parte del PDF.
text = text.replace('  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([["Observaciones"],[payload.notes||""]]),"OBSERVACIONES");\n', '', 1)

# Bloqueo claro antes de invocar el generador.
old_gen = '  const scheduleErrors=scheduleValidation();if(scheduleErrors.length){alert("Corrige el cronograma antes de generar el PDF:\\n\\n"+scheduleErrors.join("\\n"));return;}\n  if(CONFIG.requiredTable'
new_gen = '  const scheduleErrors=scheduleValidation();if(scheduleErrors.length){alert("Corrige el cronograma antes de generar el PDF:\\n\\n"+scheduleErrors.join("\\n"));return;}\n  if(payload.scheduleMeta?.status!=="Aprobado"){alert("Aprueba el cronograma antes de generar el PDF definitivo.");return;}\n  if(CONFIG.requiredTable'
text = replace_once(text, old_gen, new_gen, 'validación cronograma aprobado')

write(path, text)


# -----------------------------------------------------------------------------
# 3) content-config.js: resolver contradicción 2/4 meses y presencia en defensa
# -----------------------------------------------------------------------------
path = 'trabajo-titulacion/content-config.js'
text = read(path)
text = replace_once(
    text,
    'id: "METODOLOGIA_TRABAJO_TITULACION_VIGENTE",\n    technicalVersion: "A",',
    'id: "METODOLOGIA_TRABAJO_TITULACION_VIGENTE",\n    technicalVersion: "B",',
    'versión metodología'
)
text = replace_once(
    text,
    'projectDuration: "dos meses"',
    'projectDuration: "dentro del período académico vigente conforme al cronograma institucional aprobado"',
    'duración metodología'
)
text = text.replace(
    'Se establece un plazo de dos meses para la culminación del proyecto bajo la guía del tutor.',
    'La culminación del proyecto deberá realizarse dentro del período académico vigente, conforme al cronograma institucional aprobado para la modalidad.',
    1
)
text = text.replace(
    'Estas notas son enviadas por correo y registradas en el sistema institucional, garantizando transparencia en el proceso de calificación. Ni el tutor ni el lector estarán presentes en la defensa de grado del estudiante, lo cual permite que el tribunal evaluador pueda realizar una revisión imparcial del trabajo presentado.',
    'Estas notas son enviadas por correo y registradas en el sistema institucional, garantizando transparencia en el proceso de calificación. La defensa de grado se desarrolla ante el tribunal evaluador designado institucionalmente; la participación de otros actores académicos dependerá de su designación formal y del cronograma vigente.',
    1
)

# Referencias académicas completas tal como constan en el documento fuente.
bib_replacements = {
    'Montes, P. (2019). Fundamentos de la educación superior: Teoría y práctica en el siglo XXI.': 'Montes, P. (2019). Fundamentos de la educación superior: Teoría y práctica en el siglo XXI. Quito: Editorial Educación Contemporánea.',
    'Calderón, M. & Díaz, P. (2017). El proceso de titulación en la educación superior y su impacto en la formación profesional.': 'Calderón, M. & Díaz, P. (2017). El proceso de titulación en la educación superior y su impacto en la formación profesional. Lima: Revista de Educación y Sociedad.',
    'Castillo, R. & Gómez, M. (2018). Educación superior en Ecuador: Retos y perspectivas.': 'Castillo, R. & Gómez, M. (2018). Educación superior en Ecuador: Retos y perspectivas. Quito: Editorial Universitaria Ecuatoriana.',
    'Torres, A. (2020). Eficiencia y calidad en la educación superior: Desafíos para las instituciones en Latinoamérica.': 'Torres, A. (2020). Eficiencia y calidad en la educación superior: Desafíos para las instituciones en Latinoamérica. Buenos Aires: Editorial Académica del Sur.',
    'Escobar, C. & Vásquez, J. (2016). Eficiencia terminal en la educación superior: Un análisis de su impacto en la sostenibilidad institucional.': 'Escobar, C. & Vásquez, J. (2016). Eficiencia terminal en la educación superior: Un análisis de su impacto en la sostenibilidad institucional. Bogotá: Revista Latinoamericana de Educación Superior.',
    'González, J. (2019). Calidad educativa y titulación en instituciones técnicas y tecnológicas.': 'González, J. (2019). Calidad educativa y titulación en instituciones técnicas y tecnológicas. Santiago: Fondo Editorial Tecnológico.'
}
for old,new in bib_replacements.items():
    # Solo dentro del archivo; una aparición por referencia.
    text = text.replace(old, new)

text = text.replace(
    '"Reglamento de Titulación del ITSQMET.",',
    '"Reglamento de la Unidad de Titulación y Eficiencia Terminal (UTET-REG-25, versión 2.0).",',
    1
)
write(path, text)


# -----------------------------------------------------------------------------
# 4) process-config.js: armonización con UTET-REG-25 v2.0
# -----------------------------------------------------------------------------
path = 'trabajo-titulacion/process-config.js'
text = read(path)
text = replace_once(
    text,
    'technicalVersion: "A",',
    'technicalVersion: "B",',
    'versión proceso'
)

conflict_pattern = re.compile(r'    conflicts: Object\.freeze\(\{.*?\n    \}\),\n\n    assignment:', re.S)
new_conflicts = '''    conflicts: Object.freeze({
      projectDuration: Object.freeze({
        status: "resolved_by_current_regulation",
        validatedValue: "dentro del período académico vigente conforme al cronograma institucional aprobado",
        sourceClaims: Object.freeze({ historicalSection3: "dos meses", historicalSection5: "cuatro meses", currentRegulation: "período académico vigente conforme al cronograma institucional" })
      }),
      tutorDefenseParticipation: Object.freeze({
        status: "resolved_by_current_regulation",
        validatedValue: "acompañamiento y validación previa; la defensa corresponde al tribunal evaluador designado",
        sourceClaims: Object.freeze({ historicalSection3: "no participa", historicalSection5: "se notifica la defensa", currentRegulation: "el tutor valida la entrega final antes de la defensa" })
      }),
      readerDefenseParticipation: Object.freeze({
        status: "resolved_by_current_regulation",
        validatedValue: "sin función automática en la defensa; solo participa si existe designación formal aplicable",
        sourceClaims: Object.freeze({ historicalSection3: "no participa", historicalSection5: "observa y evalúa la defensa", currentRegulation: "la defensa se realiza ante el tribunal evaluador designado" })
      })
    }),

    assignment:'''
if conflict_pattern.search(text):
    text = conflict_pattern.sub(new_conflicts, text, count=1)
elif 'resolved_by_current_regulation' not in text:
    raise SystemExit('No se encontró bloque conflicts')

# El lector conserva revisión previa, pero no se le atribuye automáticamente rol en la defensa.
reader_defense = re.compile(r'\s*Object\.freeze\(\{label:"Desempeño en la Defensa",text:"El lector observa y evalúa la defensa de grado,.*?conflictKey:"readerDefenseParticipation"\}\),?', re.S)
text = reader_defense.sub('', text, count=1)

# Los hitos se programan desde Sección 9 y no por meses fijos contradictorios.
for deadline in ['Al primer mes de iniciado el proyecto de tesis.', 'Al segundo mes.', 'Al tercer mes.', 'Final del cuarto mes.']:
    text = text.replace(f'deadline:"{deadline}"', 'deadline:"Según el cronograma institucional aprobado para el período."', 1)

text = text.replace(
    'Una vez asignada, la fecha de la defensa se notifica oficialmente al estudiante, al tutor, al lector y a los miembros del tribunal evaluador. Este aviso incluye detalles sobre el lugar, la hora y los requisitos previos para la defensa.',
    'Una vez asignada, la fecha de la defensa se notifica oficialmente al estudiante y a los miembros del tribunal evaluador. La comunicación incluye el lugar, la hora y los requisitos previos para la defensa; otros actores académicos serán notificados únicamente cuando corresponda conforme a su designación formal.',
    1
)
text = text.replace('presentationTime: "generalmente entre 15 y 20 minutos"', 'presentationTime: "hasta 20 minutos"', 1)
text = text.replace('ajustarse a un tiempo establecido, generalmente entre 15 y 20 minutos.', 'ajustarse a un tiempo máximo de 20 minutos.', 1)
text = text.replace(
    'Esta ronda permite evaluar la capacidad del estudiante para defender sus resultados y su comprensión sobre el tema investigado. Las preguntas abordan tanto aspectos teóricos como prácticos, y el estudiante debe responder con precisión y fundamentación.',
    'Esta ronda, con una duración máxima de 10 minutos, permite evaluar la capacidad del estudiante para defender sus resultados y su comprensión sobre el tema investigado. Las preguntas abordan tanto aspectos teóricos como prácticos, y el estudiante debe responder con precisión y fundamentación.',
    1
)
write(path, text)


# -----------------------------------------------------------------------------
# 5) shared institutional config: unidad coherente con UGPA
# -----------------------------------------------------------------------------
path = 'shared/institutional-config.js'
text = read(path)
text = replace_once(
    text,
    '"trabajo-titulacion": Object.freeze({\n        preparedRole: "Gestor de Procesos Académicos"\n      })',
    '"trabajo-titulacion": Object.freeze({\n        unit: "Unidad de Gestión de Procesos Académicos",\n        preparedRole: "Gestor de Procesos Académicos"\n      })',
    'unidad UGPA'
)
write(path, text)


# -----------------------------------------------------------------------------
# 6) index.html: cargar Sección 8 y ocultar entradas que no llegan al documento
# -----------------------------------------------------------------------------
path = 'trabajo-titulacion/index.html'
text = read(path)

# Ocultar observaciones no consumidas por la plantilla final.
text = text.replace(
    '<section class="panel">\n      <div class="panel-head"><div><span class="eyebrow">Información adicional</span><h3>Observaciones del período</h3>',
    '<section class="panel" hidden aria-hidden="true">\n      <div class="panel-head"><div><span class="eyebrow">Información adicional</span><h3>Observaciones del período</h3>',
    1
)
# Dejar visible únicamente el logo, que sí se consume.
text = text.replace(
    '<div class="panel-head"><div><span class="eyebrow">Identidad institucional</span><h3>Logo e imágenes opcionales</h3><p class="help">El logo se usa en la cabecera. Las demás imágenes se integran dentro del texto sin citas.</p></div></div>',
    '<div class="panel-head"><div><span class="eyebrow">Identidad institucional</span><h3>Logo institucional</h3><p class="help">El logo institucional se utiliza en la cabecera y es el único recurso gráfico requerido por esta planificación.</p></div></div>',
    1
)
for label in ['Imagen de introducción','Imagen de metodología','Imagen de cierre/evaluación']:
    text = text.replace(f'<label class="asset"><strong>{label}</strong>', f'<label class="asset" hidden aria-hidden="true"><strong>{label}</strong>', 1)

# Cargar configuración de Sección 8 y renovar caché de todos los módulos relacionados.
for name in ['content-config.js','requirements-config.js','process-config.js','logistics-config.js','induction-config.js','schedule-config.js','indicators-config.js','conclusions-config.js','recommendations-config.js','full-document.js','app.js']:
    text = re.sub(rf'{re.escape(name)}\?v=[^"<]+', f'{name}?v=20260910-finalfix-1', text)
if 'authorizations-config.js' not in text:
    needle = '<script src="induction-config.js?v=20260910-finalfix-1"></script>'
    text = replace_once(text, needle, needle+'\n<script src="authorizations-config.js?v=20260910-finalfix-1"></script>', 'script sección 8')
# Shared config también cambia.
text = re.sub(r'institutional-config\.js\?v=[^"<]+', 'institutional-config.js?v=20260910-finalfix-1', text)
write(path, text)

print('Trabajo de Titulación: corrección integral aplicada')
