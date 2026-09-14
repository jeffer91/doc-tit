(() => {
  "use strict";

  const SUPABASE_URL="https://pxlokuzauwrnvnjaahjq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY="sb_publishable_gTZSuLEoeqjnEzZZGj-zmg_zRiIbJpi";
  const CACHE_KEY="doc-tit-cloud-cache-v3";
  const GATEWAY=SUPABASE_URL+"/functions/v1/doc-tit-sync";

  if(!window.supabase?.createClient)throw new Error("No se pudo cargar Supabase.");
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"doc-tit-admin-session"}});

  let online=navigator.onLine!==false;
  let cloudAvailable=false;

  function emptyCache(){return{periods:[],documents:{},pendingPeriods:{},pendingDocuments:{},pendingAssets:{},updatedAt:null};}
  function readCache(){try{const raw=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");return raw&&typeof raw==="object"?{...emptyCache(),...raw}:emptyCache();}catch(_){return emptyCache();}}
  function writeCache(cache){try{cache.updatedAt=new Date().toISOString();localStorage.setItem(CACHE_KEY,JSON.stringify(cache));}catch(_){}}
  function documentCacheKey(periodKey,documentKey){return`${periodKey}::${documentKey}`;}
  function assetCacheKey(periodKey,documentKey,assetKey){return`${periodKey}::${documentKey}::${assetKey}`;}
  function periodRow(period){return{period_key:period.id||period.period_key,name:period.name,start_date:period.start||period.start_date,end_date:period.end||period.end_date,status:period.status||"Activo"};}
  function rememberPeriod(period,pending=false){const row=periodRow(period),cache=readCache(),byId=new Map((cache.periods||[]).map(x=>[x.period_key,x]));byId.set(row.period_key,row);cache.periods=Array.from(byId.values()).sort((a,b)=>String(b.start_date||"").localeCompare(String(a.start_date||"")));if(pending)cache.pendingPeriods[row.period_key]=row;else delete cache.pendingPeriods[row.period_key];writeCache(cache);return row;}
  function rememberDocument(doc,pending=false){const cache=readCache(),key=documentCacheKey(doc.period_key,doc.document_key);cache.documents[key]=doc;if(pending)cache.pendingDocuments[key]=doc;else delete cache.pendingDocuments[key];writeCache(cache);return doc;}
  function rememberAsset(asset,pending=false){const cache=readCache(),key=assetCacheKey(asset.periodKey,asset.documentKey,asset.assetKey);if(pending)cache.pendingAssets[key]=asset;else delete cache.pendingAssets[key];writeCache(cache);}
  function emitStatus(value,error){cloudAvailable=!!value;window.dispatchEvent(new CustomEvent("doc-tit:cloud-status",{detail:{online:cloudAvailable,localMode:!cloudAvailable,error:error?String(error?.message||error):null}}));}

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

  async function flushPending(){
    if(navigator.onLine===false)return false;
    const cache=readCache();
    for(const row of Object.values(cache.pendingPeriods||{})){await gateway("upsertPeriod",{period:row});delete cache.pendingPeriods[row.period_key];writeCache(cache);}
    for(const[key,doc]of Object.entries(cache.pendingDocuments||{})){await gateway("upsertDocument",{doc});delete cache.pendingDocuments[key];writeCache(cache);}
    for(const[key,asset]of Object.entries(cache.pendingAssets||{})){await gateway("uploadAsset",asset);delete cache.pendingAssets[key];writeCache(cache);}
    writeCache(cache);return true;
  }

  async function healthCheck(){try{await gateway("health");emitStatus(true);try{await flushPending();}catch(e){console.warn("DOC-TIT: cola local pendiente.",e);}return true;}catch(error){emitStatus(false,error);return false;}}
  async function loadPeriods(){try{const rows=await gateway("loadPeriods");const cache=readCache(),byId=new Map((cache.periods||[]).map(x=>[x.period_key,x]));(rows||[]).forEach(row=>byId.set(row.period_key,row));cache.periods=Array.from(byId.values()).sort((a,b)=>String(b.start_date||"").localeCompare(String(a.start_date||"")));writeCache(cache);emitStatus(true);return cache.periods;}catch(error){emitStatus(false,error);return readCache().periods||[];}}
  async function upsertPeriod(period){const row=rememberPeriod(period,true);try{await gateway("upsertPeriod",{period:row});rememberPeriod(row,false);emitStatus(true);return{synced:true};}catch(error){rememberPeriod(row,true);emitStatus(false,error);return{synced:false,local:true,error};}}
  async function loadDocument(periodKey,documentKey){const key=documentCacheKey(periodKey,documentKey);try{const data=await gateway("loadDocument",{periodKey,documentKey});if(data)rememberDocument(data,false);emitStatus(true);return data||readCache().documents[key]||null;}catch(error){emitStatus(false,error);return readCache().documents[key]||null;}}
  async function upsertDocument({periodKey,documentKey,processCode,title,documentCode,payload,complete,generatedAt,generatedFileName,generatedPages}){const doc={period_key:periodKey,document_key:documentKey,process_code:processCode,title,document_code:documentCode,payload:payload||{},complete:!!complete,generated_at:generatedAt||null,generated_file_name:generatedFileName||null,generated_pages:generatedPages||null};rememberDocument(doc,true);try{await gateway("upsertDocument",{doc});rememberDocument(doc,false);emitStatus(true);return{synced:true};}catch(error){rememberDocument(doc,true);emitStatus(false,error);return{synced:false,local:true,error};}}
  async function uploadAsset(asset){rememberAsset(asset,true);try{const data=await gateway("uploadAsset",asset);rememberAsset(asset,false);emitStatus(true);return data?.path||null;}catch(error){rememberAsset(asset,true);emitStatus(false,error);return null;}}
  async function loadAssets(periodKey,documentKey){const cache=readCache(),pending=Object.values(cache.pendingAssets||{}).filter(a=>a.periodKey===periodKey&&a.documentKey===documentKey),localPending=Object.fromEntries(pending.map(a=>[a.assetKey,a.dataUrl]));try{const signed=await gateway("loadAssets",{periodKey,documentKey});const remote=await signedAssetsToDataUrls(signed);emitStatus(true);return{...remote,...localPending};}catch(error){emitStatus(false,error);return localPending;}}
  async function uploadGeneratedPdf({periodKey,documentKey,fileName,blob}){try{const dataUrl=await blobToDataUrl(blob);const data=await gateway("uploadGeneratedPdf",{periodKey,documentKey,fileName,dataUrl});emitStatus(true);return data?.path||null;}catch(error){emitStatus(false,error);return null;}}

  window.addEventListener("online",()=>{online=true;healthCheck().catch(()=>{});});
  window.addEventListener("offline",()=>{online=false;emitStatus(false,new Error("Sin conexión de red."));});
  window.DocTitCloud={client,healthCheck,loadPeriods,upsertPeriod,loadDocument,upsertDocument,uploadAsset,loadAssets,uploadGeneratedPdf,isOnline:()=>online&&cloudAvailable,flushPending,ensureAdminSession,signOut:()=>client.auth.signOut()};
})();