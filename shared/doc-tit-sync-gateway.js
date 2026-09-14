(() => {
  "use strict";

  const SUPABASE_URL="https://pxlokuzauwrnvnjaahjq.supabase.co";
  const ENDPOINT=SUPABASE_URL+"/functions/v1/doc-tit-sync";
  const API_KEY="sb_publishable_gTZSuLEoeqjnEzZZGj-zmg_zRiIbJpi";

  async function call(action,input={}){
    const res=await fetch(ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":API_KEY},
      body:JSON.stringify({action,input})
    });
    let data=null;
    try{data=await res.json();}catch(_){data=null;}
    if(!res.ok||!data?.ok)throw new Error(data?.error||`Error de sincronización (${res.status})`);
    return data.data;
  }

  const blobToDataUrl=blob=>new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=()=>reject(r.error||new Error("No se pudo leer el archivo."));
    r.readAsDataURL(blob);
  });

  async function resolveSignedAssets(map){
    const out={};
    for(const [key,url] of Object.entries(map||{})){
      try{
        const res=await fetch(url);
        if(!res.ok)continue;
        out[key]=await blobToDataUrl(await res.blob());
      }catch(_){}
    }
    return out;
  }

  window.DocTitSyncGateway={call,blobToDataUrl,resolveSignedAssets};
})();