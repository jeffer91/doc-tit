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
if(/#tbody-(carreras|tutores|defensas|recursos)/.test(workSegment)){
  failures.push("planning-templates.js: Trabajo de Titulación referencia tablas que su app actual no crea.");
}
if(!/deadline/.test(workSegment)){
  failures.push("planning-templates.js: la plantilla del cronograma de Trabajo debe conservar Fecha límite.");
}
if(/setInterval\s*\(/.test(planning)){
  failures.push("planning-templates.js: no debe usar refresco periódico; usa eventos/MutationObserver.");
}

const core=readFileSync(join(root,"shared/document-core.js"),"utf8");
if(!core.includes("doc-tit:template-applied"))failures.push("document-core.js: falta seguimiento de cambios importados.");
if(!core.includes("archivado")||!core.includes("cerrado"))failures.push("document-core.js: faltan guardas de estado de período.");
if(/#generateBtn[^;\n]*dirty=false/.test(core))failures.push("document-core.js: generar PDF no debe marcar el documento como guardado.");

for(const rel of ["trabajo-titulacion/cloud.js","articulo-academico/cloud.js"]){
  const src=readFileSync(join(root,rel),"utf8");
  if(!src.includes("doc-tit-cloud-cache-v2"))failures.push(`${rel}: falta caché de períodos/documentos para modo offline.`);
  if(!src.includes("isOnline"))failures.push(`${rel}: falta indicador de conectividad para el Core.`);
}

if(failures.length){
  console.error("QA estática falló:\n- "+failures.join("\n- "));
  process.exit(1);
}
console.log("QA estática DOC-TIT: OK");
