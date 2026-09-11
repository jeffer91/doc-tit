(() => {
  "use strict";

  const SUPABASE_URL = "https://pxlokuzauwrnvnjaahjq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gTZSuLEoeqjnEzZZGj-zmg_zRiIbJpi";
  const BUCKET = "doc-tit";
  const CACHE_KEY = "doc-tit-cloud-cache-v2";

  if (!window.supabase?.createClient) throw new Error("No se pudo cargar Supabase.");
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });

  let online = true;

  const clean=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,140)||"item";

  function emptyCache(){return {periods:[],documents:{},pendingPeriods:{},pendingDocuments:{},updatedAt:null};}
  function readCache(){
    try{
      const raw=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
      return raw&&typeof raw==="object"?{...emptyCache(),...raw}:emptyCache();
    }catch(_){return emptyCache();}
  }
  function writeCache(cache){
    try{
      cache.updatedAt=new Date().toISOString();
      localStorage.setItem(CACHE_KEY,JSON.stringify(cache));
    }catch(_){}
  }
  function periodRow(period){
    return {
      period_key:period.id||period.period_key,
      name:period.name,
      start_date:period.start||period.start_date,
      end_date:period.end||period.end_date,
      status:period.status||"Activo"
    };
  }
  function documentCacheKey(periodKey,documentKey){return `${periodKey}::${documentKey}`;}
  function rememberPeriod(period,pending=false){
    const row=periodRow(period),cache=readCache();
    const byId=new Map((cache.periods||[]).map(x=>[x.period_key,x]));
    byId.set(row.period_key,row);
    cache.periods=Array.from(byId.values()).sort((a,b)=>String(b.start_date||"").localeCompare(String(a.start_date||"")));
    if(pending)cache.pendingPeriods[row.period_key]=row;else delete cache.pendingPeriods[row.period_key];
    writeCache(cache);
    return row;
  }
  function rememberDocument(doc,pending=false){
    const cache=readCache(),key=documentCacheKey(doc.period_key,doc.document_key);
    cache.documents[key]=doc;
    if(pending)cache.pendingDocuments[key]=doc;else delete cache.pendingDocuments[key];
    writeCache(cache);
    return doc;
  }

  async function directUpsertPeriod(row){
    const {error}=await client.from("doc_tit_periods").upsert({
      period_key:row.period_key,name:row.name,start_date:row.start_date,end_date:row.end_date,
      status:row.status||"Activo",updated_at:new Date().toISOString()
    },{onConflict:"period_key"});
    if(error)throw error;
  }

  async function directUpsertDocument(doc){
    const {error}=await client.from("doc_tit_documents").upsert({
      period_key:doc.period_key,document_key:doc.document_key,process_code:doc.process_code,title:doc.title,
      document_code:doc.document_code,
      schedule:Array.isArray(doc.payload?.schedule)?doc.payload.schedule:[],
      distribution:Array.isArray(doc.payload?.tables?.carreras)?doc.payload.tables.carreras:[],
      payload:doc.payload||{},complete:!!doc.complete,
      generated_at:doc.generated_at||null,generated_file_name:doc.generated_file_name||null,
      generated_pages:doc.generated_pages||null,updated_at:new Date().toISOString()
    },{onConflict:"period_key,document_key"});
    if(error)throw error;
  }

  async function flushPending(){
    const cache=readCache();
    for(const row of Object.values(cache.pendingPeriods||{})){
      await directUpsertPeriod(row);
      delete cache.pendingPeriods[row.period_key];
    }
    for(const [key,doc] of Object.entries(cache.pendingDocuments||{})){
      await directUpsertDocument(doc);
      delete cache.pendingDocuments[key];
    }
    writeCache(cache);
  }

  async function healthCheck(){
    try{
      const {error}=await client.from("doc_tit_periods").select("period_key",{head:true,count:"exact"});
      if(error)throw error;
      online=true;
      try{await flushPending();}catch(e){console.warn("DOC-TIT: no se pudo vaciar la cola offline.",e);}
      window.dispatchEvent(new CustomEvent("doc-tit:cloud-status",{detail:{online:true}}));
      return true;
    }catch(error){
      online=false;
      window.dispatchEvent(new CustomEvent("doc-tit:cloud-status",{detail:{online:false,error:String(error?.message||error)}}));
      return false;
    }
  }

  async function loadPeriods(){
    if(!online){
      return readCache().periods||[];
    }
    try{
      const {data,error}=await client.from("doc_tit_periods")
        .select("period_key,name,start_date,end_date,status").order("start_date",{ascending:false});
      if(error)throw error;
      const rows=data||[],cache=readCache();
      const byId=new Map((cache.periods||[]).map(x=>[x.period_key,x]));
      rows.forEach(row=>byId.set(row.period_key,row));
      cache.periods=Array.from(byId.values()).sort((a,b)=>String(b.start_date||"").localeCompare(String(a.start_date||"")));
      writeCache(cache);
      return cache.periods;
    }catch(error){
      online=false;
      window.dispatchEvent(new CustomEvent("doc-tit:cloud-status",{detail:{online:false,error:String(error?.message||error)}}));
      return readCache().periods||[];
    }
  }

  async function upsertPeriod(period){
    const row=rememberPeriod(period,true);
    if(!online)throw new Error("Sin conexión; período guardado en cola local.");
    try{
      await directUpsertPeriod(row);
      rememberPeriod(row,false);
    }catch(error){
      online=false;
      rememberPeriod(row,true);
      throw error;
    }
  }

  async function loadDocument(periodKey,documentKey){
    const key=documentCacheKey(periodKey,documentKey);
    if(!online)return readCache().documents[key]||null;
    try{
      const {data,error}=await client.from("doc_tit_documents")
        .select("period_key,document_key,process_code,title,document_code,payload,complete,generated_at,generated_file_name,generated_pages")
        .eq("period_key",periodKey).eq("document_key",documentKey).maybeSingle();
      if(error)throw error;
      if(data)rememberDocument(data,false);
      return data||readCache().documents[key]||null;
    }catch(error){
      online=false;
      return readCache().documents[key]||null;
    }
  }

  async function upsertDocument({periodKey,documentKey,processCode,title,documentCode,payload,complete,generatedAt,generatedFileName,generatedPages}){
    const doc={
      period_key:periodKey,document_key:documentKey,process_code:processCode,title,
      document_code:documentCode,payload:payload||{},complete:!!complete,
      generated_at:generatedAt||null,generated_file_name:generatedFileName||null,generated_pages:generatedPages||null
    };
    rememberDocument(doc,true);
    if(!online)throw new Error("Sin conexión; documento guardado en cola local.");
    try{
      await directUpsertDocument(doc);
      rememberDocument(doc,false);
    }catch(error){
      online=false;
      rememberDocument(doc,true);
      throw error;
    }
  }

  async function uploadAsset({periodKey,documentKey,assetKey,dataUrl,fileName}){
    if(!online)throw new Error("Sin conexión; el recurso permanece en caché local.");
    const blob=await fetch(dataUrl).then(r=>r.blob());
    const ext=blob.type==="image/png"?"png":blob.type==="image/webp"?"webp":"jpg";
    const stamp=new Date().toISOString().replace(/[-:.TZ]/g,"");
    const path=["assets",clean(periodKey),clean(documentKey),clean(assetKey),stamp+"-"+clean(fileName||assetKey)+"."+ext].join("/");

    const {data:prev}=await client.from("doc_tit_assets").select("storage_path")
      .eq("period_key",periodKey).eq("document_key",documentKey).eq("asset_key",assetKey).maybeSingle();

    const {error:upErr}=await client.storage.from(BUCKET).upload(path,blob,{upsert:false,contentType:blob.type,cacheControl:"3600"});
    if(upErr)throw upErr;

    const {error:metaErr}=await client.from("doc_tit_assets").upsert({
      period_key:periodKey,document_key:documentKey,asset_key:assetKey,storage_path:path,
      file_name:fileName||assetKey,mime_type:blob.type,size_bytes:blob.size,updated_at:new Date().toISOString()
    },{onConflict:"period_key,document_key,asset_key"});
    if(metaErr)throw metaErr;

    if(prev?.storage_path&&prev.storage_path!==path){
      try{await client.storage.from(BUCKET).remove([prev.storage_path]);}catch(_){}
    }
    return path;
  }

  async function loadAssets(periodKey,documentKey){
    if(!online)return {};
    try{
      const {data,error}=await client.from("doc_tit_assets").select("asset_key,storage_path")
        .eq("period_key",periodKey).eq("document_key",documentKey);
      if(error)throw error;
      const out={};
      for(const row of data||[]){
        if(row.asset_key==="generated_pdf")continue;
        const {data:blob,error:e}=await client.storage.from(BUCKET).download(row.storage_path);
        if(e)continue;
        out[row.asset_key]=await new Promise((resolve,reject)=>{
          const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);
        });
      }
      return out;
    }catch(error){
      online=false;
      return {};
    }
  }

  async function uploadGeneratedPdf({periodKey,documentKey,fileName,blob}){
    if(!online)throw new Error("Sin conexión; no se pudo respaldar el PDF.");
    const path=["generated",clean(periodKey),clean(documentKey),Date.now()+"-"+clean(fileName||"documento.pdf")].join("/");
    const {error:upErr}=await client.storage.from(BUCKET).upload(path,blob,{upsert:false,contentType:"application/pdf",cacheControl:"3600"});
    if(upErr)throw upErr;
    const {error:metaErr}=await client.from("doc_tit_assets").upsert({
      period_key:periodKey,document_key:documentKey,asset_key:"generated_pdf",storage_path:path,
      file_name:fileName||"documento.pdf",mime_type:"application/pdf",size_bytes:blob.size,updated_at:new Date().toISOString()
    },{onConflict:"period_key,document_key,asset_key"});
    if(metaErr)throw metaErr;
    return path;
  }

  window.DocTitCloud={
    client,healthCheck,loadPeriods,upsertPeriod,loadDocument,upsertDocument,
    uploadAsset,loadAssets,uploadGeneratedPdf,isOnline:()=>online,flushPending
  };
})();