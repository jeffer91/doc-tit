from pathlib import Path

# --- PDF generator: replace legacy Section 4 with controlled renderer ---
path = Path('trabajo-titulacion/full-document.js')
text = path.read_text(encoding='utf-8')

start = '{"type":"h","text":"4. Requisitos Para La Aprobación De La Titulación","level":1}'
end = '{"type":"h","text":"5. Descripción De Los Procesos De Titulación","level":1}'
a = text.index(start)
b = text.index(end, a)
text = text[:a] + start + ',{"type":"requirements"},' + text[b:]

if 'function renderRequirements()' not in text:
    marker = '  function renderReferenceDocuments(){'
    helper = r'''  function resolveRequirements(){
    const snapshot=ctx.payload?.contentSnapshots?.requirements;
    if(snapshot&&snapshot.academic&&snapshot.documentation)return snapshot;
    const current=window.DOC_TIT_TRABAJO_REQUIREMENTS;
    if(current&&current.academic&&current.documentation)return current;
    return null;
  }
  function listHeading(text){
    const raw=clean(text);if(!raw)return;
    doc.setFont("times","bold");doc.setFontSize(12);
    const lines=doc.splitTextToSize(raw,bodyW-18);
    ensure(lines.length*BODY.line+8);
    doc.text(lines,BODY.left+18,y);y+=lines.length*BODY.line+5;
  }
  function renderRequirementItems(items){
    (items||[]).forEach(item=>{
      if(typeof item==="string")bullet(item);
      else if(item&&clean(item.label))methodologyBullet(item.label,item.text||"");
    });
  }
  function renderRequirementGroups(groups){
    (groups||[]).forEach(group=>{
      listHeading(group.title||"");
      renderRequirementItems(group.items||[]);
    });
  }
  function renderRequirements(){
    const block=resolveRequirements();
    if(!block)throw new Error("No existe una configuración institucional validada de requisitos de titulación.");

    paragraph(block.intro||"");

    const academic=block.academic||{};
    heading("4.1. Requisitos Académicos",2,true);
    paragraph(academic.intro||"");
    heading("4.1.1. Malla Curricular Completa",3,true);
    paragraph(academic.curriculum||"");
    heading("4.1.2. Materias Transversales",3,true);
    paragraph(academic.transversal?.intro||"");
    renderRequirementItems(academic.transversal?.items||[]);
    heading("4.1.3. Materias Autónomas",3,true);
    paragraph(academic.autonomous?.intro||"");
    renderRequirementItems(academic.autonomous?.items||[]);

    const documentation=block.documentation||{};
    heading("4.2. Requisitos de Documentación",2,true);
    paragraph(documentation.intro||"");
    heading(documentation.modalityTitle||"4.3. Modalidades Híbrida, Presencial y Online",2,true);
    paragraph(documentation.modalityIntro||"");
    renderRequirementGroups(documentation.groups||[]);
    // El documento fuente contiene un segundo bloque documental sin encabezado de categoría.
    // Se reproduce sin inventar una modalidad o categoría inexistente.
    renderRequirementGroups(documentation.unidentifiedContinuation||[]);

    const financial=block.financial||{};
    heading("4.4. Requisitos Financieros",2,true);
    paragraph(financial.intro||"");
    heading("4.4.1. Requisitos Financieros Generales",3,true);
    paragraph(financial.generalIntro||"");
    renderRequirementItems(financial.items||[]);

    const engagement=block.communityEngagement||{};
    heading("4.5. Vinculación con la Sociedad",2,true);
    paragraph(engagement.intro||"");
    heading("4.5.1. Importancia de la Vinculación con la Sociedad",3,true);
    paragraph(engagement.importance||"");
    heading("4.5.2. Requisitos para la Vinculación con la Sociedad",3,true);
    paragraph(engagement.requirementsIntro||"");
    renderRequirementItems(engagement.requirements||[]);
    heading("4.5.3. Ejemplos de Proyectos de Vinculación por Carrera",3,true);
    paragraph(engagement.examplesIntro||"");
    (engagement.examples||[]).forEach(item=>methodologyBullet(item.career,item.text||""));

    const internships=block.internships||{};
    heading("4.6. Prácticas Preprofesionales",2,true);
    paragraph(internships.intro||"");
    heading("4.6.1. Objetivo e Importancia de las Prácticas Preprofesionales",3,true);
    paragraph(internships.importance||"");
    heading("4.6.2. Requisitos para la Realización de las Prácticas Preprofesionales",3,true);
    paragraph(internships.requirementsIntro||"");
    renderRequirementItems(internships.requirements||[]);
    heading("4.6.3. Documentación de Culminación de Prácticas Preprofesionales",3,true);
    paragraph(internships.completionIntro||"");
    renderRequirementItems(internships.completionDocuments||[]);

    const language=block.foreignLanguage||{};
    heading("4.7. Requisito de Lengua Extranjera",2,true);
    (language.intro||[]).forEach(item=>paragraph(item));
    heading("4.7.1. Objetivo del Requisito de Lengua Extranjera",3,true);
    paragraph(language.objective||"");
    heading("4.7.2. Cumplimiento del Nivel A2 en Lengua Extranjera",3,true);
    paragraph(language.complianceIntro||"");
    renderRequirementGroups(language.compliance||[]);
    heading("4.7.3. Procedimiento para la Entrega del Certificado de Nivel A2",3,true);
    renderRequirementGroups(language.certificateProcedure||[]);

    const dataUpdate=block.dataUpdate||{};
    heading("4.8. Actualización de Datos",2,true);
    paragraph(dataUpdate.intro||"");
    heading("4.8.1. Objetivo de la Actualización de Datos",3,true);
    paragraph(dataUpdate.objective||"");
    heading("4.8.2. Procedimiento para la Actualización de Datos",3,true);
    paragraph(dataUpdate.procedureIntro||"");
    renderRequirementGroups(dataUpdate.procedure||[]);
    heading("4.8.3. Importancia de la Actualización de Datos",3,true);
    paragraph(dataUpdate.importanceIntro||"");
    renderRequirementItems(dataUpdate.importance||[]);
  }
  function renderReferenceDocuments(){'''
    if marker not in text:
        raise SystemExit('No se encontró renderReferenceDocuments()')
    text = text.replace(marker, helper, 1)

old = '      else if(item.type==="methodology")renderMethodology();\n      else if(item.type==="image")inlineImage(item.key);'
new = '      else if(item.type==="methodology")renderMethodology();\n      else if(item.type==="requirements")renderRequirements();\n      else if(item.type==="image")inlineImage(item.key);'
if old in text:
    text = text.replace(old, new, 1)
elif 'else if(item.type==="requirements")renderRequirements();' not in text:
    raise SystemExit('No se encontró renderItems() para requirements')

path.write_text(text, encoding='utf-8')

# --- Period snapshot for institutional requirements ---
app = Path('trabajo-titulacion/app.js')
text = app.read_text(encoding='utf-8')
if 'function currentRequirementsSnapshot()' not in text:
    marker = 'function blankPayload(){'
    helper = '''function currentRequirementsSnapshot(){
  const block=window.DOC_TIT_TRABAJO_REQUIREMENTS;
  if(!block||!block.academic||!block.documentation)return null;
  return JSON.parse(JSON.stringify(block));
}
function blankPayload(){'''
    if marker not in text:
        raise SystemExit('No se encontró blankPayload()')
    text = text.replace(marker, helper, 1)

old = 'contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot()}'
new = 'contentSnapshots:{legalBase:currentLegalBaseSnapshot(),methodology:currentMethodologySnapshot(),requirements:currentRequirementsSnapshot()}'
if old in text:
    text = text.replace(old, new, 1)
elif 'requirements:currentRequirementsSnapshot()' not in text:
    raise SystemExit('No se encontró contentSnapshots de blankPayload()')

old = '  if(!contentSnapshots.methodology)contentSnapshots.methodology=currentMethodologySnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
new = '  if(!contentSnapshots.methodology)contentSnapshots.methodology=currentMethodologySnapshot();\n  if(!contentSnapshots.requirements)contentSnapshots.requirements=currentRequirementsSnapshot();\n  return {...base,...data,schedule:base.schedule,tables,notes:data.notes||"",contentSnapshots};'
if old in text:
    text = text.replace(old, new, 1)
elif 'if(!contentSnapshots.requirements)contentSnapshots.requirements=currentRequirementsSnapshot();' not in text:
    raise SystemExit('No se encontró normalizePayloadData()')

app.write_text(text, encoding='utf-8')

# --- Load controlled requirements and bust caches ---
idx = Path('trabajo-titulacion/index.html')
text = idx.read_text(encoding='utf-8')
text = text.replace('content-config.js?v=20260909-section3-1', 'content-config.js?v=20260909-section4-1')
if 'requirements-config.js' not in text:
    text = text.replace('<script src="content-config.js?v=20260909-section4-1"></script>', '<script src="content-config.js?v=20260909-section4-1"></script>\n<script src="requirements-config.js?v=20260909-section4-1"></script>')
text = text.replace('full-document.js?v=20260909-section3-1', 'full-document.js?v=20260909-section4-1')
text = text.replace('app.js?v=20260909-section3-1', 'app.js?v=20260909-section4-1')
idx.write_text(text, encoding='utf-8')
