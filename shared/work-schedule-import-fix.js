(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  if(nav?.dataset.activeDocument!=="trabajo-titulacion")return;

  let applying=false;

  function finalizeImportedSchedule(event){
    const detail=event?.detail||{};
    if(detail.documentId!=="trabajo-titulacion"||detail.block!=="cronograma"||applying)return;
    applying=true;

    window.setTimeout(()=>{
      const approve=document.querySelector("#approveScheduleBtn");
      if(approve&&!approve.disabled)approve.click();

      window.setTimeout(()=>{
        document.querySelector("#saveBtn")?.click();
        document.dispatchEvent(new Event("change",{bubbles:true}));
        applying=false;
      },140);
    },140);
  }

  document.addEventListener("doc-tit:template-applied",finalizeImportedSchedule);
})();