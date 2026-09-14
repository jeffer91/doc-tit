import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const failures=[];
const read=rel=>readFileSync(join(root,rel),"utf8");

function walk(dir){
  const out=[];
  for(const name of readdirSync(dir)){
    if(name===".git"||name==="node_modules")continue;
    const p=join(dir,name),st=statSync(p);
    if(st.isDirectory())out.push(...walk(p));else out.push(p);
  }
  return out;
}

for(const file of walk(root).filter(p=>p.endsWith(".js")||p.endsWith(".mjs"))){
  try{execFileSync(process.execPath,["--check",file],{stdio:"pipe"});}
  catch(e){failures.push(`Sintaxis JS inválida: ${file.replace(root+"/","")}\n${String(e.stderr||e.message)}`);}
}

for(const rel of ["complexivo/index.html","trabajo-titulacion/index.html","articulo-academico/index.html"]){
  const html=read(rel),base=dirname(join(root,rel));
  for(const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)){
    const src=match[1];if(/^https?:\/\//.test(src))continue;
    if(!existsSync(resolve(base,src.split("?")[0])))failures.push(`${rel}: script local inexistente ${src}`);
  }
  for(const match of html.matchAll(/<link[^>]+href="([^"]+)"/g)){
    const href=match[1];if(/^https?:\/\//.test(href)||href.startsWith("data:"))continue;
    if(!existsSync(resolve(base,href.split("?")[0])))failures.push(`${rel}: recurso local inexistente ${href}`);
  }
}

const planning=read("shared/planning-templates.js");
const workSegment=planning.split('"trabajo-titulacion":')[1]?.split('"articulo-academico":')[0]||"";
if(/#tbody-(carreras|tutores|defensas|recursos)/.test(workSegment))failures.push("planning-templates.js: Trabajo de Titulación referencia tablas que su app actual no crea.");
if(!/deadline/.test(workSegment))failures.push("planning-templates.js: la plantilla del cronograma de Trabajo debe conservar Fecha límite.");
if(/setInterval\s*\(/.test(planning))failures.push("planning-templates.js: no debe usar refresco periódico.");

const core=read("shared/document-core.js");
if(!core.includes("doc-tit:template-applied"))failures.push("document-core.js: falta seguimiento de cambios importados.");
if(!core.includes("archivado")||!core.includes("cerrado"))failures.push("document-core.js: faltan guardas de estado de período.");

for(const rel of ["trabajo-titulacion/cloud.js","articulo-academico/cloud.js"]){
  const src=read(rel);
  for(const token of ["doc-tit-cloud-cache-v3","pendingAssets","ensureAdminSession","persistSession:true"]){
    if(!src.includes(token))failures.push(`${rel}: falta ${token}.`);
  }
  if(!src.includes('window.addEventListener("online"'))failures.push(`${rel}: falta resincronización al reconectar.`);
  if(/window\.prompt\s*\(/.test(src))failures.push(`${rel}: no debe solicitar cédula o PIN con prompt.`);
}
const complexCloud=read("complexivo/cloud.js");
if(!complexCloud.includes("ensureAdminSession")||!complexCloud.includes("persistSession:true"))failures.push("complexivo/cloud.js: falta gestión persistente de sesión existente.");
if(/window\.prompt\s*\(/.test(complexCloud))failures.push("complexivo/cloud.js: no debe solicitar cédula o PIN con prompt.");

for(const rel of ["shared/cloud-guard.js","shared/runtime-fixes.js","shared/presentation-ui.js","shared/presentation-ui.css","shared/svd-shell.js","shared/svd-shell.css","shared/reference-ui.js","shared/reference-ui.css","shared/document-sections.js"]){
  if(!existsSync(join(root,rel)))failures.push(`Falta ${rel}.`);
}

const sidebar=read("shared/sidebar.js");
for(const token of ["runtime-fixes.js","presentation-ui.js","document-sections.js","svd-shell.js","reference-ui.js","reference-ui.css"]){
  if(!sidebar.includes(token))failures.push(`sidebar.js: falta cargar ${token}.`);
}
const manifestAt=sidebar.indexOf("loadSectionManifest()");
const shellAt=sidebar.indexOf("loadSvdShell()");
if(manifestAt<0||shellAt<0||manifestAt>shellAt)failures.push("sidebar.js: el manifiesto de secciones debe cargarse antes del shell visual.");

const presentation=read("shared/presentation-ui.js");
if(!presentation.includes('data-presentation="cover"')||!presentation.includes('data-presentation="header"'))failures.push("presentation-ui.js: Portada y Cabecera deben existir como apartados independientes.");
if(!presentation.includes("DOC_TIT_INSTITUTIONAL"))failures.push("presentation-ui.js: Portada y Cabecera deben reutilizar la fuente institucional única.");

const sections=read("shared/document-sections.js");
for(const doc of ["complexivo","trabajo-titulacion","articulo-academico"]){
  if(!sections.includes(doc))failures.push(`document-sections.js: falta ${doc}.`);
}
for(const common of ["Información","Portada","Cabecera","Recursos"]){
  if(!sections.includes(`label:\"${common}\"`))failures.push(`document-sections.js: falta la sección común ${common}.`);
}
const requiredByDocument={
  complexivo:["1. Introducción","2. Base Legal","3. Metodología","4. Requisitos para Titulación","5. Descripción del Examen Complexivo","6. Seminarios de Titulación","7. Distribución de Estudiantes por Carrera y Nivel","8. Asignación de Laboratorios y Capacidad","9. Imponderables","10. Criterios de Evaluación","11. Resumen General","12. Bibliografía"],
  trabajo:["1. Introducción","2. Base Legal","3. Metodología","4. Requisitos para la Aprobación de la Titulación","5. Descripción de los Procesos de Titulación","6. Gestión Administrativa y Logística","7. Inducción de Titulación","8. Informe y Autorizaciones","9. Cronograma de Actividades","10. Análisis de Resultados y Mejora Continua","11. Conclusiones","12. Recomendaciones","13. Bibliografía"],
  articulo:["1. Introducción","2. Marco Normativo y Estratégico","3. Metodología de Implementación del Proceso","4. Desarrollo Operativo del Proceso de Titulación","5. Evaluación, Acreditación y Seguimiento","6. Disposiciones Finales","7. Referencias"]
};
for(const [doc,titles] of Object.entries(requiredByDocument))for(const title of titles){
  if(!sections.includes(title))failures.push(`document-sections.js: ${doc} no contiene «${title}».`);
}
for(const token of ["cronograma:\"metodologia\"","cronograma:\"cronograma-actividades\"","cronograma:\"metodologia-implementacion\"","distribucion:\"distribucion-estudiantes\""]){
  if(!sections.includes(token))failures.push(`document-sections.js: falta mapeo ${token}.`);
}

const svd=read("shared/svd-shell.js");
if(!svd.includes("DOC_TIT_SECTION_MANIFEST"))failures.push("svd-shell.js: las pestañas deben salir del manifiesto documental.");
if(!svd.includes("svd-period-slot")||!svd.includes("svd-documents-slot")||!svd.includes("svd-section-tabs"))failures.push("svd-shell.js: debe mantener Período → Documentos → Secciones.");
if(!svd.includes("DOC_TIT_CORE?.diagnostics"))failures.push("svd-shell.js: los estados deben reutilizar el diagnóstico real del Core.");
if(!svd.includes("doc-tit-global-active-period"))failures.push("svd-shell.js: el período debe conservarse al cambiar de documento.");
if(!svd.includes("generated_at")||!svd.includes("generatedAt"))failures.push("svd-shell.js: debe reconocer documentos finalizados.");

const reference=read("shared/reference-ui.js");
for(const token of ["referenceInfoCard","referenceDocumentCard","referenceSectionPanel","referenceResourcePanel","DOC_TIT_SECTION_MANIFEST"]){
  if(!reference.includes(token))failures.push(`reference-ui.js: falta ${token}.`);
}
if(!reference.includes('documentId===\"complexivo\"'))failures.push("reference-ui.js: Complexivo debe usar el mismo formato de referencia.");
if(!reference.includes("manifest.templateSections"))failures.push("reference-ui.js: las plantillas deben ubicarse según la sección real del documento.");

const referenceCss=read("shared/reference-ui.css");
for(const token of [".reference-info-card",".reference-document-card",".reference-section-panel",".reference-resource-card",".reference-doc-heading"]){
  if(!referenceCss.includes(token))failures.push(`reference-ui.css: falta estilo común ${token}.`);
}
if(!referenceCss.includes("#documentView>.doc-heading"))failures.push("reference-ui.css: debe ocultarse la cabecera heredada de Complexivo para evitar duplicados.");
if(!referenceCss.includes("overflow-x:auto"))failures.push("reference-ui.css: las secciones deben conservar navegación horizontal en pantallas estrechas.");

const cloudGuard=read("shared/cloud-guard.js");
if(!cloudGuard.includes("DOC_TIT_LOCAL_ONLY")||!cloudGuard.includes("result?.synced===false"))failures.push("cloud-guard.js: debe distinguir guardado local de sincronización real.");

if(failures.length){
  console.error("QA estática falló:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("QA estática DOC-TIT: OK");
