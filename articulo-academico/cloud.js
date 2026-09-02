(() => {
  "use strict";
  const SUPABASE_URL = "https://pxlokuzauwrnvnjaahjq.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gTZSuLEoeqjnEzZZGj-zmg_zRiIbJpi";
  const BUCKET = "doc-tit";

  if (!window.supabase?.createClient) throw new Error("No se pudo cargar Supabase.");
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });

  const clean=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,140)||"item";

  async function healthCheck(){
    const {error}=await client.from("doc_tit_periods").select("period_key",{head:true,count:"exact"});
    if(error) throw error;
    return true;
  }

  async function loadPeriods(){
    const {data,error}=await client.from("doc_tit_periods")
      .select("period_key,name,start_date,end_date,status").order("start_date",{ascending:false});
    if(error) throw error;
    return data||[];
  }

  async function upsertPeriod(period){
    const {error}=await client.from("doc_tit_periods").upsert({
      period_key:period.id,name:period.name,start_date:period.start,end_date:period.end,
      status:period.status||"Activo",updated_at:new Date().toISOString()
    },{onConflict:"period_key"});
    if(error) throw error;
  }

  async function loadDocument(periodKey,documentKey){
    const {data,error}=await client.from("doc_tit_documents")
      .select("period_key,document_key,process_code,title,document_code,payload,complete,generated_at,generated_file_name,generated_pages")
      .eq("period_key",periodKey).eq("document_key",documentKey).maybeSingle();
    if(error) throw error;
    return data||null;
  }

  async function upsertDocument({periodKey,documentKey,processCode,title,documentCode,payload,complete,generatedAt,generatedFileName,generatedPages}){
    const {error}=await client.from("doc_tit_documents").upsert({
      period_key:periodKey,document_key:documentKey,process_code:processCode,title,
      document_code:documentCode,payload:payload||{},complete:!!complete,
      generated_at:generatedAt||null,generated_file_name:generatedFileName||null,
      generated_pages:generatedPages||null,updated_at:new Date().toISOString()
    },{onConflict:"period_key,document_key"});
    if(error) throw error;
  }

  async function uploadAsset({periodKey,documentKey,assetKey,dataUrl,fileName}){
    const blob=await fetch(dataUrl).then(r=>r.blob());
    const ext=blob.type==="image/png"?"png":blob.type==="image/webp"?"webp":"jpg";
    const stamp=new Date().toISOString().replace(/[-:.TZ]/g,"");
    const path=["assets",clean(periodKey),clean(documentKey),clean(assetKey),stamp+"-"+clean(fileName||assetKey)+"."+ext].join("/");

    const {data:prev}=await client.from("doc_tit_assets").select("storage_path")
      .eq("period_key",periodKey).eq("document_key",documentKey).eq("asset_key",assetKey).maybeSingle();

    const {error:upErr}=await client.storage.from(BUCKET).upload(path,blob,{upsert:false,contentType:blob.type,cacheControl:"3600"});
    if(upErr) throw upErr;

    const {error:metaErr}=await client.from("doc_tit_assets").upsert({
      period_key:periodKey,document_key:documentKey,asset_key:assetKey,storage_path:path,
      file_name:fileName||assetKey,mime_type:blob.type,size_bytes:blob.size,updated_at:new Date().toISOString()
    },{onConflict:"period_key,document_key,asset_key"});
    if(metaErr) throw metaErr;

    if(prev?.storage_path && prev.storage_path!==path){
      try{await client.storage.from(BUCKET).remove([prev.storage_path]);}catch(_){}
    }
    return path;
  }

  async function loadAssets(periodKey,documentKey){
    const {data,error}=await client.from("doc_tit_assets").select("asset_key,storage_path")
      .eq("period_key",periodKey).eq("document_key",documentKey);
    if(error) throw error;
    const out={};
    for(const row of data||[]){
      if(row.asset_key==="generated_pdf") continue;
      const {data:blob,error:e}=await client.storage.from(BUCKET).download(row.storage_path);
      if(e) continue;
      out[row.asset_key]=await new Promise((resolve,reject)=>{
        const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(blob);
      });
    }
    return out;
  }

  async function uploadGeneratedPdf({periodKey,documentKey,fileName,blob}){
    const stamp=new Date().toISOString().replace(/[-:.TZ]/g,"");
    const path=["generated",clean(periodKey),clean(documentKey),stamp+"-"+clean(fileName)].join("/");
    const {data:prev}=await client.from("doc_tit_assets").select("storage_path")
      .eq("period_key",periodKey).eq("document_key",documentKey).eq("asset_key","generated_pdf").maybeSingle();
    const {error:upErr}=await client.storage.from(BUCKET).upload(path,blob,{upsert:false,contentType:"application/pdf"});
    if(upErr) throw upErr;
    const {error:metaErr}=await client.from("doc_tit_assets").upsert({
      period_key:periodKey,document_key:documentKey,asset_key:"generated_pdf",storage_path:path,
      file_name:fileName,mime_type:"application/pdf",size_bytes:blob.size,updated_at:new Date().toISOString()
    },{onConflict:"period_key,document_key,asset_key"});
    if(metaErr) throw metaErr;
    if(prev?.storage_path && prev.storage_path!==path){
      try{await client.storage.from(BUCKET).remove([prev.storage_path]);}catch(_){}
    }
    return path;
  }

  window.DocTitCloud={healthCheck,loadPeriods,upsertPeriod,loadDocument,upsertDocument,uploadAsset,loadAssets,uploadGeneratedPdf};
})();