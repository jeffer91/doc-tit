(() => {
  "use strict";

  const SUPABASE_URL="https://pxlokuzauwrnvnjaahjq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY="sb_publishable_gTZSuLEoeqjnEzZZGj-zmg_zRiIbJpi";
  const GATEWAY=SUPABASE_URL+"/functions/v1/doc-tit-sync";

  if(!window.supabase?.createClient)throw new Error("No se pudo cargar Supabase.");
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"doc-tit-admin-session"}});
  let online=navigator.onLine!==false;

  function emitStatus(value,error){window.dispatchEvent(new CustomEvent("doc-tit:cloud-status",{detail:{online:!!value,localMode:!value,error:error?String(error?.message||error):null}}));}
  async function ensureAdminSession(){return(await client.auth.getSession()).data.session||null;}
  async function gateway(action,input={}){
    if(navigator.onLine===false){online=false;throw new Error("Sin conexión de red.");}
    online=true;
    const res=await fetch(GATEWAY,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify({action,input})});
    let body=null;try{body=await res.json();}catch(_){}
    if(!res.ok||!body?.ok)throw new Error(body?.error||`No se pudo sincronizar (${res.status}).`);
    return body.data;
  }
  const blobToDataUrl=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error||new Error("No se pudo leer el archivo."));reader.readAsDataURL(blob);});
  async function signedAssetsToDataUrls(map){const out={};for(const[key,url]of Object.entries(map||{})){try{const r=await fetch(url);if(r.ok)out[key]=await blobToDataUrl(await r.blob());}catch(_){}}return out;}

  async function healthCheck(){try{await gateway("health");emitStatus(true);return true;}catch(error){emitStatus(false,error);throw error;}}
  async function loadWorkspace(){try{const data=await gateway("loadWorkspace");emitStatus(true);return data;}catch(error){emitStatus(false,error);throw error;}}
  async function upsertPeriod(period){try{await gateway("upsertPeriod",{period:{period_key:period.id,name:period.name,start_date:period.start,end_date:period.end,status:period.status||"Activo"}});emitStatus(true);return{synced:true};}catch(error){emitStatus(false,error);return{synced:false,local:true,error};}}
  async function upsertSetting(key,value){try{await gateway("upsertSetting",{key,value});emitStatus(true);return{synced:true};}catch(error){emitStatus(false,error);return{synced:false,local:true,error};}}
  async function upsertDocument({period,document,data,code}){
    const doc={period_key:period.id,document_key:document.id,process_code:document.process||document.procCode||"",title:document.fileTitle||document.name||"",document_code:code,schedule:Array.isArray(data.schedule)?data.schedule:[],distribution:Array.isArray(data.distribution)?data.distribution:[],smart_text:data.smartText||"",analysis:data.analysis||null,payload:data||{},complete:!!data.complete,generated_at:data.generatedAt||null,generated_file_name:data.generatedFileName||null,generated_pages:data.generatedPages||null};
    try{await gateway("upsertDocument",{doc});emitStatus(true);return{synced:true};}catch(error){emitStatus(false,error);return{synced:false,local:true,error};}
  }
  async function uploadAsset({periodKey,documentKey,assetKey,dataUrl,fileName}){try{const data=await gateway("uploadAsset",{periodKey,documentKey,assetKey,dataUrl,fileName});emitStatus(true);return{path:data?.path||null};}catch(error){emitStatus(false,error);throw error;}}
  async function loadAssets(periodKey,documentKey){try{const signed=await gateway("loadAssets",{periodKey,documentKey});const out=await signedAssetsToDataUrls(signed);emitStatus(true);return out;}catch(error){emitStatus(false,error);throw error;}}
  async function uploadGeneratedPdf({periodKey,documentKey,fileName,blob}){try{const dataUrl=await blobToDataUrl(blob);const data=await gateway("uploadGeneratedPdf",{periodKey,documentKey,fileName,dataUrl});emitStatus(true);return data?.path||null;}catch(error){emitStatus(false,error);throw error;}}

  window.addEventListener("online",()=>{online=true;healthCheck().catch(()=>{});});
  window.addEventListener("offline",()=>{online=false;emitStatus(false,new Error("Sin conexión de red."));});
  window.DocTitCloud={client,healthCheck,loadWorkspace,upsertPeriod,upsertSetting,upsertDocument,uploadAsset,loadAssets,uploadGeneratedPdf,isOnline:()=>online,ensureAdminSession,signOut:()=>client.auth.signOut()};
})();