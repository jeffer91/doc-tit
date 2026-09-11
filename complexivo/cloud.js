(() => {
  "use strict";

  const SUPABASE_URL = "https://pxlokuzauwrnvnjaahjq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gTZSuLEoeqjnEzZZGj-zmg_zRiIbJpi";
  const BUCKET = "doc-tit";

  if (!window.supabase?.createClient) throw new Error("No se pudo cargar Supabase.");
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"doc-tit-admin-session"}
  });

  let online=navigator.onLine!==false;

  function emitStatus(value,error){
    window.dispatchEvent(new CustomEvent("doc-tit:cloud-status",{detail:{
      online:!!value,
      localMode:!value,
      error:error?String(error?.message||error):null
    }}));
  }

  async function ensureAdminSession(){
    return (await client.auth.getSession()).data.session||null;
  }

  async function requireCloudSession(){
    if(navigator.onLine===false){online=false;throw new Error("Sin conexión de red.");}
    online=true;
    const session=await ensureAdminSession();
    if(!session)throw new Error("Modo local · sin inicio de sesión");
    return session;
  }

  function sanitizeSegment(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 140) || "item";
  }
  const dataUrlToBlob=dataUrl=>fetch(dataUrl).then(r=>r.blob());
  const blobToDataUrl=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(reader.error||new Error("No se pudo leer el archivo."));reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);});

  async function healthCheck() {
    try{
      await requireCloudSession();
      const { error } = await client.from("doc_tit_periods").select("period_key", { count: "exact", head: true });
      if (error) throw error;
      emitStatus(true);
      return true;
    }catch(error){emitStatus(false,error);throw error;}
  }

  async function loadWorkspace() {
    await requireCloudSession();
    const [periodsRes, docsRes, settingsRes] = await Promise.all([
      client.from("doc_tit_periods").select("period_key,name,start_date,end_date,status,updated_at").order("start_date", { ascending: false }),
      client.from("doc_tit_documents").select("period_key,document_key,process_code,title,document_code,schedule,distribution,smart_text,analysis,complete,generated_at,generated_file_name,generated_pages,updated_at"),
      client.from("doc_tit_settings").select("key,value,updated_at")
    ]);
    if (periodsRes.error) throw periodsRes.error;
    if (docsRes.error) throw docsRes.error;
    if (settingsRes.error) throw settingsRes.error;
    emitStatus(true);
    return {periods:periodsRes.data||[],documents:docsRes.data||[],settings:settingsRes.data||[]};
  }

  async function upsertPeriod(period) {
    await requireCloudSession();
    const payload={period_key:period.id,name:period.name,start_date:period.start,end_date:period.end,status:period.status||"Activo",updated_at:new Date().toISOString()};
    const { error } = await client.from("doc_tit_periods").upsert(payload, { onConflict: "period_key" });
    if (error) throw error;emitStatus(true);
  }

  async function upsertSetting(key, value) {
    await requireCloudSession();
    const { error } = await client.from("doc_tit_settings").upsert({key,value,updated_at:new Date().toISOString()}, { onConflict: "key" });
    if (error) throw error;emitStatus(true);
  }

  async function upsertDocument({ period, document, data, code }) {
    await requireCloudSession();
    const payload={
      period_key:period.id,document_key:document.id,process_code:document.process||document.procCode||"",
      title:document.fileTitle||document.name||"",document_code:code,
      schedule:Array.isArray(data.schedule)?data.schedule:[],distribution:Array.isArray(data.distribution)?data.distribution:[],
      smart_text:data.smartText||"",analysis:data.analysis||null,complete:!!data.complete,
      generated_at:data.generatedAt||null,generated_file_name:data.generatedFileName||null,generated_pages:data.generatedPages||null,
      updated_at:new Date().toISOString()
    };
    const { error } = await client.from("doc_tit_documents").upsert(payload, { onConflict: "period_key,document_key" });
    if (error) throw error;emitStatus(true);
  }

  async function uploadAsset({ periodKey, documentKey, assetKey, dataUrl, fileName }) {
    await requireCloudSession();
    const blob=await dataUrlToBlob(dataUrl);
    const ext=blob.type==="image/png"?"png":blob.type==="image/webp"?"webp":blob.type==="application/pdf"?"pdf":"jpg";
    const stamp=new Date().toISOString().replace(/[-:.TZ]/g,"");
    const path=["assets",sanitizeSegment(periodKey),sanitizeSegment(documentKey),sanitizeSegment(assetKey),`${stamp}-${sanitizeSegment(fileName||assetKey)}.${ext}`].join("/");
    const {data:previousRow,error:previousError}=await client.from("doc_tit_assets").select("storage_path").eq("period_key",periodKey).eq("document_key",documentKey).eq("asset_key",assetKey).maybeSingle();
    if(previousError)throw previousError;
    const {error:uploadError}=await client.storage.from(BUCKET).upload(path,blob,{upsert:false,contentType:blob.type||undefined,cacheControl:"3600"});
    if(uploadError)throw uploadError;
    const {error:metaError}=await client.from("doc_tit_assets").upsert({
      period_key:periodKey,document_key:documentKey,asset_key:assetKey,storage_path:path,
      file_name:fileName||`${assetKey}.${ext}`,mime_type:blob.type||null,size_bytes:blob.size,updated_at:new Date().toISOString()
    },{onConflict:"period_key,document_key,asset_key"});
    if(metaError){try{await client.storage.from(BUCKET).remove([path]);}catch(_){}throw metaError;}
    if(previousRow?.storage_path&&previousRow.storage_path!==path){try{await client.storage.from(BUCKET).remove([previousRow.storage_path]);}catch(_){}}
    emitStatus(true);return {path,blob};
  }

  async function loadAssets(periodKey, documentKey) {
    await requireCloudSession();
    const {data:rows,error}=await client.from("doc_tit_assets").select("asset_key,storage_path,mime_type").eq("period_key",periodKey).eq("document_key",documentKey);
    if(error)throw error;
    const assets={};
    for(const row of rows||[]){
      if(row.asset_key==="generated_pdf")continue;
      const {data:blob,error:downloadError}=await client.storage.from(BUCKET).download(row.storage_path);
      if(downloadError)throw downloadError;
      assets[row.asset_key]=await blobToDataUrl(blob);
    }
    emitStatus(true);return assets;
  }

  async function uploadGeneratedPdf({ periodKey, documentKey, fileName, blob }) {
    await requireCloudSession();
    if (!(blob instanceof Blob)) throw new Error("El PDF generado no es válido.");
    const stamp=new Date().toISOString().replace(/[-:.TZ]/g,"");
    const path=["generated",sanitizeSegment(periodKey),sanitizeSegment(documentKey),`${stamp}-${sanitizeSegment(fileName)}`].join("/");
    const {data:previousRow,error:previousError}=await client.from("doc_tit_assets").select("storage_path").eq("period_key",periodKey).eq("document_key",documentKey).eq("asset_key","generated_pdf").maybeSingle();
    if(previousError)throw previousError;
    const {error:uploadError}=await client.storage.from(BUCKET).upload(path,blob,{upsert:false,contentType:"application/pdf",cacheControl:"3600"});
    if(uploadError)throw uploadError;
    const {error:metaError}=await client.from("doc_tit_assets").upsert({
      period_key:periodKey,document_key:documentKey,asset_key:"generated_pdf",storage_path:path,
      file_name:fileName,mime_type:"application/pdf",size_bytes:blob.size,updated_at:new Date().toISOString()
    },{onConflict:"period_key,document_key,asset_key"});
    if(metaError){try{await client.storage.from(BUCKET).remove([path]);}catch(_){}throw metaError;}
    if(previousRow?.storage_path&&previousRow.storage_path!==path){try{await client.storage.from(BUCKET).remove([previousRow.storage_path]);}catch(_){}}
    emitStatus(true);return path;
  }

  window.addEventListener("online",()=>{online=true;healthCheck().catch(()=>{});});
  window.addEventListener("offline",()=>{online=false;emitStatus(false,new Error("Sin conexión de red."));});

  window.DocTitCloud={
    client,healthCheck,loadWorkspace,upsertPeriod,upsertSetting,upsertDocument,uploadAsset,loadAssets,uploadGeneratedPdf,
    isOnline:()=>online,ensureAdminSession,signOut:()=>client.auth.signOut()
  };
})();