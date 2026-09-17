(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!documentId)return;

  const TITLES={
    complexivo:"Examen Complexivo",
    "trabajo-titulacion":"Trabajo de Titulación",
    "articulo-academico":"Artículo Académico"
  };

  function ensureXlsx(){
    if(window.XLSX)return Promise.resolve(window.XLSX);
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[src*="xlsx.full.min.js"]');
      if(existing){
        const wait=()=>window.XLSX?resolve(window.XLSX):window.setTimeout(wait,40);
        wait();return;
      }
      const script=document.createElement("script");
      script.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.onload=()=>resolve(window.XLSX);
      script.onerror=()=>reject(new Error("No se pudo cargar el generador de Excel."));
      document.head.appendChild(script);
    });
  }

  function period(){
    const select=document.querySelector("#periodSelect");
    return {
      id:select?.value||"periodo",
      name:select?.selectedOptions?.[0]?.textContent?.trim()||"Período activo"
    };
  }

  function safeName(value){
    return String(value||"")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/[^A-Za-z0-9_-]+/g,"_")
      .replace(/^_+|_+$/g,"");
  }

  async function downloadTemplate(){
    const X=await ensureXlsx();
    const p=period();
    const title=TITLES[documentId]||"DOC-TIT";
    const rows=[
      [title,"", ""],
      [p.name,"", ""],
      ["", "", ""],
      ["Fase 1: Nombre de la fase","", ""],
      ["Actividad","Fecha inicio","Fecha fin"],
      ["Ejemplo: Nombre de la actividad","01/09/2026","01/09/2026"],
      ["", "", ""],
      ["Fase 2: Nombre de la fase","", ""],
      ["Actividad","Fecha inicio","Fecha fin"],
      ["", "", ""],
      ["", "", ""],
      ["Fase 3: Nombre de la fase","", ""],
      ["Actividad","Fecha inicio","Fecha fin"],
      ["", "", ""]
    ];
    const ws=X.utils.aoa_to_sheet(rows);
    ws["!cols"]=[{wch:48},{wch:18},{wch:18}];
    ws["!merges"]=[
      {s:{r:0,c:0},e:{r:0,c:2}},
      {s:{r:1,c:0},e:{r:1,c:2}},
      {s:{r:3,c:0},e:{r:3,c:2}},
      {s:{r:7,c:0},e:{r:7,c:2}},
      {s:{r:11,c:0},e:{r:11,c:2}}
    ];
    const wb=X.utils.book_new();
    X.utils.book_append_sheet(wb,ws,"CRONOGRAMA");
    X.writeFile(wb,`Plantilla_Cronograma_${safeName(title)}_${safeName(p.id)}.xlsx`);
  }

  document.addEventListener("click",event=>{
    const button=event.target?.closest?.("#multiSchedulePanel .ms-template");
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    downloadTemplate().catch(error=>{
      console.error("DOC-TIT plantilla de cronograma",error);
      window.alert(error?.message||"No se pudo descargar la plantilla.");
    });
  },true);
})();
