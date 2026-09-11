import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const failures=[];

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
  const html=readFileSync(join(root,rel),"utf8"),base=dirname(join(root,rel));
  for(const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)){
    const src=match[1];
    if(/^https?:\/\//.test(src))continue;
    const local=src.split("?")[0];
    if(!existsSync(resolve(base,local)))failures.push(`${rel}: script local inexistente ${src}`);
  }
  for(const match of html.matchAll(/<link[^>]+href="([^"]+)"/g)){
    const href=match[1];
    if(/^https?:\/\//.test(href)||href.startsWith("data:"))continue;
    const local=href.split("?")[0];
    if(!existsSync(resolve(base,local)))failures.push(`${rel}: recurso local inexistente ${href}`);
  }
}

const planning=readFileSync(join(root,"shared/planning-templates.js"),"utf8");
const workSegment=planning.split('"trabajo-titulacion":')[1]?.split('"articulo-academico":')[0]||"";
if(/#tbody-(carreras|tutores|defensas|recursos)/.test(workSegment))failures.push("planning-templates.js: Trabajo de Titulación referencia tablas que su app actual no crea.");
if(!/deadline/.test(workSegment))failures.push("planning-templates.js: la plantilla del cronograma de Trabajo debe conservar Fecha límite.");
if(/setInterval\s*\(/.test(planning))failures.push("planning-templates.js: no debe usar refresco periódico; usa eventos/MutationObserver.");

const core=readFileSync(join(root,"shared/document-core.js"),"utf8");
if(!core.includes("doc-tit:template-applied"))failures.push("document-core.js: falta seguimiento de cambios importados.");
if(!core.includes("archivado")||!core.includes("cerrado"))failures.push("document-core.js: faltan guardas de estado de período.");
if(/#generateBtn[^;\n]*dirty=false/.test(core))failures.push("document-core.js: generar PDF no debe marcar el documento como guardado.");

for(const rel of ["trabajo-titulacion/cloud.js","articulo-academico/cloud.js"]){
  const src=readFileSync(join(root,rel),"utf8");
  if(!src.includes("doc-tit-cloud-cache-v3"))failures.push(`${rel}: falta caché v3 para modo offline.`);
  if(!src.includes("pendingAssets"))failures.push(`${rel}: falta cola offline de imágenes.`);
  if(!src.includes("ensureAdminSession"))failures.push(`${rel}: falta gestión de sesión existente.`);
  if(!src.includes("persistSession:true"))failures.push(`${rel}: una sesión existente debe poder persistir.`);
  if(!src.includes('window.addEventListener("online"'))failures.push(`${rel}: falta resincronización al reconectar.`);
  if(/window\.prompt\s*\(/.test(src))failures.push(`${rel}: DOC-TIT no debe solicitar cédula o PIN mediante ventanas emergentes.`);
}

const complexCloud=readFileSync(join(root,"complexivo/cloud.js"),"utf8");
if(!complexCloud.includes("ensureAdminSession")||!complexCloud.includes("persistSession:true"))failures.push("complexivo/cloud.js: falta gestión persistente de una sesión existente.");
if(/window\.prompt\s*\(/.test(complexCloud))failures.push("complexivo/cloud.js: DOC-TIT no debe solicitar cédula o PIN mediante ventanas emergentes.");

const sidebar=readFileSync(join(root,"shared/sidebar.js"),"utf8");
if(!sidebar.includes("runtime-fixes.js"))failures.push("sidebar.js: debe cargar runtime-fixes.js.");
if(!existsSync(join(root,"shared/runtime-fixes.js")))failures.push("Falta shared/runtime-fixes.js.");
if(!sidebar.includes("presentation-ui.js"))failures.push("sidebar.js: debe cargar presentation-ui.js para Portada y Cabecera.");
if(!existsSync(join(root,"shared/presentation-ui.js")))failures.push("Falta shared/presentation-ui.js.");
if(!existsSync(join(root,"shared/presentation-ui.css")))failures.push("Falta shared/presentation-ui.css.");

const presentation=readFileSync(join(root,"shared/presentation-ui.js"),"utf8");
if(!presentation.includes('data-presentation="cover"')||!presentation.includes('data-presentation="header"'))failures.push("presentation-ui.js: Portada y Cabecera deben existir como apartados independientes.");
if(!presentation.includes("DOC_TIT_INSTITUTIONAL"))failures.push("presentation-ui.js: Portada y Cabecera deben reutilizar la fuente institucional única.");

if(!sidebar.includes("svd-shell.js"))failures.push("sidebar.js: debe cargar el shell visual SVD 2.0.");
for(const rel of ["shared/svd-shell.js","shared/svd-shell.css"]){
  if(!existsSync(join(root,rel)))failures.push(`Falta ${rel}.`);
}
if(existsSync(join(root,"shared/svd-shell.js"))){
  const svd=readFileSync(join(root,"shared/svd-shell.js"),"utf8");
  for(const label of ["Información","Cronograma","Recursos","Portada","Cabecera"]){
    if(!svd.includes(label))failures.push(`svd-shell.js: falta la sección ${label}.`);
  }
  if(!svd.includes("svd-period-slot")||!svd.includes("svd-documents-slot")||!svd.includes("svd-section-tabs"))failures.push("svd-shell.js: debe mantener Período → Documentos → Secciones como estructura principal.");
}
if(existsSync(join(root,"shared/svd-shell.css"))){
  const css=readFileSync(join(root,"shared/svd-shell.css"),"utf8");
  if(!css.includes(".svd2 .sidebar{display:none!important}"))failures.push("svd-shell.css: SVD 2.0 no debe depender del menú lateral permanente.");
  if(!css.includes("flex-direction:row!important"))failures.push("svd-shell.css: los documentos deben navegarse horizontalmente.");
  if(!css.includes("--svd-pending-soft:#fff6dd"))failures.push("svd-shell.css: Pendiente debe usar amarillo suave.");
  if(!css.includes(".doc-standard-generate.pending{background:#e7ebef"))failures.push("svd-shell.css: Generar PDF bloqueado debe verse neutro, no rojo.");
}

if(failures.length){
  console.error("QA estática falló:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("QA estática DOC-TIT: OK");
