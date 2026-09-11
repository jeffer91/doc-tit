(() => {
  "use strict";

  function stabilizeProgressLabel(){
    const label=document.querySelector("#progressLabel");
    if(!label||label.dataset.runtimeStableText==="1")return;
    const descriptor=Object.getOwnPropertyDescriptor(Node.prototype,"textContent");
    if(!descriptor?.get||!descriptor?.set)return;
    try{
      Object.defineProperty(label,"textContent",{
        configurable:true,
        get(){return descriptor.get.call(this);},
        set(value){
          const next=String(value??"");
          if(descriptor.get.call(this)===next)return;
          descriptor.set.call(this,next);
        }
      });
      label.dataset.runtimeStableText="1";
    }catch(_){}
  }

  function installGenerationLock(){
    const buttons=[...document.querySelectorAll("#generateBtn,#generateBtnBottom")];
    if(!buttons.length)return;
    let locked=false,unlockTimer=null;
    const statuses=[document.querySelector("#status"),document.querySelector("#generationStatus")].filter(Boolean);

    const setLocked=value=>{
      locked=!!value;
      document.documentElement.dataset.docTitGenerating=locked?"1":"0";
      buttons.forEach(btn=>{
        btn.dataset.runtimeGenerating=locked?"1":"0";
        if(locked)btn.disabled=true;
      });
      clearTimeout(unlockTimer);
      if(locked)unlockTimer=setTimeout(()=>setLocked(false),120000);
    };

    buttons.forEach(btn=>{
      btn.addEventListener("click",event=>{
        if(locked){event.preventDefault();event.stopImmediatePropagation();return;}
        locked=true;
        document.documentElement.dataset.docTitGenerating="1";
        btn.dataset.runtimeGenerating="1";
        queueMicrotask(()=>buttons.forEach(b=>b.disabled=true));
        clearTimeout(unlockTimer);
        unlockTimer=setTimeout(()=>setLocked(false),120000);
      },true);
      new MutationObserver(()=>{if(locked&&!btn.disabled)btn.disabled=true;}).observe(btn,{attributes:true,attributeFilter:["disabled"]});
    });

    statuses.forEach(status=>new MutationObserver(()=>{
      const text=String(status.textContent||"").trim();
      if(/PDF generado|Error|No se pudo|guardado/i.test(text)&&!/Generando/i.test(text))setLocked(false);
    }).observe(status,{childList:true,subtree:true,characterData:true}));
  }

  function init(){
    stabilizeProgressLabel();
    installGenerationLock();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0),{once:true});
  else setTimeout(init,0);
})();
