(() => {
  "use strict";

  const cloud=window.DocTitCloud;
  if(!cloud||cloud.__docTitGuarded)return;
  Object.defineProperty(cloud,"__docTitGuarded",{value:true,enumerable:false});

  const localOnlyError=(action)=>{
    const error=new Error(`${action} quedó guardado únicamente en este navegador; Supabase no está disponible.`);
    error.code="DOC_TIT_LOCAL_ONLY";
    error.localOnly=true;
    return error;
  };

  if(typeof cloud.healthCheck==="function"){
    const original=cloud.healthCheck.bind(cloud);
    cloud.healthCheck=async(...args)=>{
      const ok=await original(...args);
      if(ok!==true)throw localOnlyError("La sesión");
      return true;
    };
  }

  for(const name of ["upsertPeriod","upsertDocument"]){
    if(typeof cloud[name]!=="function")continue;
    const original=cloud[name].bind(cloud);
    cloud[name]=async(...args)=>{
      const result=await original(...args);
      if(result?.synced===false)throw localOnlyError(name==="upsertPeriod"?"El período":"El documento");
      return result;
    };
  }

  for(const name of ["uploadAsset","uploadGeneratedPdf"]){
    if(typeof cloud[name]!=="function")continue;
    const original=cloud[name].bind(cloud);
    cloud[name]=async(...args)=>{
      const result=await original(...args);
      if(result==null)throw localOnlyError(name==="uploadAsset"?"La imagen":"El PDF");
      return result;
    };
  }
})();
