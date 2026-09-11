(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!documentId)return;

  const $=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));

  const titleFor=()=>$("#docTitle")?.textContent?.trim()||$("#screenTitle")?.textContent?.trim()||"Documento institucional";
  const periodFor=()=>$("#periodText")?.textContent?.trim()||$("#periodName")?.textContent?.trim()||"Período académico";
  const codeFor=()=>$("#docCode")?.textContent?.trim()||$("#docCodeBadge")?.textContent?.trim()||"Código automático";
  const logoImg=()=>$("#logoPreview img");
  const institutional=()=>{
    try{return window.DOC_TIT_INSTITUTIONAL?.resolve?.(documentId)||{};}catch(_){return{};}
  };

  function mountTarget(){
    if(["trabajo-titulacion","articulo-academico"].includes(documentId)){
      return $("#docStandardLayout .doc-standard-content")||$("main.main");
    }
    if(documentId==="complexivo"){
      return $("#documentView .content-column")||$("#documentView");
    }
    return null;
  }

  function ensureStyles(){
    if(document.querySelector('link[data-doc-tit-presentation-ui]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.dataset.docTitPresentationUi="1";
    const path=String(window.location.pathname||"");
    const marker="/doc-tit/";
    const idx=path.indexOf(marker);
    const base=idx>=0?path.slice(0,idx)+marker:"/doc-tit/";
    link.href=base+"shared/presentation-ui.css?v=20260911-1";
    document.head.appendChild(link);
  }

  function shell(){
    let panel=$("#docPresentationSections");
    if(panel)return panel;
    panel=document.createElement("section");
    panel.id="docPresentationSections";
    panel.className="doc-presentation-panel";
    panel.innerHTML=`
      <div class="doc-presentation-head">
        <div>
          <span class="doc-presentation-eyebrow">Presentación del documento</span>
          <h3>Portada y cabecera</h3>
          <p>Son componentes independientes del documento. Reutilizan los mismos datos institucionales; no debes volver a escribirlos.</p>
        </div>
      </div>
      <div class="doc-presentation-grid">
        <article class="doc-presentation-card" data-presentation="cover">
          <button type="button" aria-expanded="false"><span class="doc-presentation-card-title"><span class="num">1</span>Portada</span><span class="doc-presentation-chip">Automática</span></button>
          <div class="doc-presentation-detail"><div id="docCoverPreview"></div><p class="doc-presentation-note">La portada usa título, período, código, responsables institucionales y logo desde una única fuente de datos.</p></div>
        </article>
        <article class="doc-presentation-card" data-presentation="header">
          <button type="button" aria-expanded="false"><span class="doc-presentation-card-title"><span class="num">2</span>Cabecera</span><span class="doc-presentation-chip">Automática</span></button>
          <div class="doc-presentation-detail"><div id="docHeaderPreview"></div><p class="doc-presentation-note">La cabecera se reutiliza en las páginas internas y mantiene el mismo logo, código, título y período del documento.</p></div>
        </article>
      </div>`;
    panel.querySelectorAll(".doc-presentation-card>button").forEach(button=>button.addEventListener("click",()=>{
      const card=button.closest(".doc-presentation-card");
      const open=!card.classList.contains("open");
      card.classList.toggle("open",open);
      button.setAttribute("aria-expanded",open?"true":"false");
    }));
    return panel;
  }

  function logoMarkup(cls){
    const img=logoImg();
    return img?.src?`<div class="${cls}"><img src="${esc(img.src)}" alt="Logo institucional"></div>`:`<div class="${cls}">Logo institucional</div>`;
  }

  let lastSignature="";
  function render(){
    const panel=shell();
    const inst=institutional();
    const data={title:titleFor(),period:periodFor(),code:codeFor(),logo:logoImg()?.src||"",unit:inst.unit||"Unidad institucional",preparedBy:inst.preparedBy||"—",preparedRole:inst.preparedRole||"",reviewedBy:inst.reviewedBy||"—",reviewedRole:inst.reviewedRole||"",approvedBy:inst.approvedBy||"—",approvedRole:inst.approvedRole||""};
    const signature=JSON.stringify(data);
    if(signature===lastSignature)return;
    lastSignature=signature;

    const cover=$("#docCoverPreview",panel),header=$("#docHeaderPreview",panel);
    if(cover)cover.innerHTML=`<div class="doc-cover-preview">${logoMarkup("doc-cover-logo")}<div class="doc-cover-unit">${esc(data.unit)}</div><div class="doc-cover-title">${esc(data.title)}</div><div class="doc-cover-period">${esc(data.period)}</div><div class="doc-cover-code">${esc(data.code)}</div><div class="doc-cover-signatures"><div><strong>${esc(data.preparedBy)}</strong>${esc(data.preparedRole)}</div><div><strong>${esc(data.reviewedBy)}</strong>${esc(data.reviewedRole)}</div><div><strong>${esc(data.approvedBy)}</strong>${esc(data.approvedRole)}</div></div></div>`;
    if(header)header.innerHTML=`<div class="doc-header-preview">${logoMarkup("doc-header-logo")}<div class="doc-header-center"><span>${esc(data.unit)}</span><strong>${esc(data.title)}</strong></div><div class="doc-header-right"><span>${esc(data.code)}</span><span>${esc(data.period)}</span></div></div>`;

    const coverChip=$('[data-presentation="cover"] .doc-presentation-chip',panel);
    const headerChip=$('[data-presentation="header"] .doc-presentation-chip',panel);
    const complete=!!data.logo&&!!data.title&&!!data.period&&!!data.code;
    [coverChip,headerChip].forEach(chip=>{if(!chip)return;chip.textContent=complete?"Lista":"Falta logo";chip.classList.toggle("pending",!complete);});
  }

  function place(){
    ensureStyles();
    const target=mountTarget();
    if(!target)return false;
    const panel=shell();
    if(panel.parentElement!==target){
      if(documentId==="complexivo"){
        const firstPanel=$("#documentForm .panel",target)||target.firstElementChild;
        if(firstPanel)target.insertBefore(panel,firstPanel);else target.appendChild(panel);
      }else{
        const progress=$(".doc-standard-workspace",target);
        if(progress)progress.insertAdjacentElement("afterend",panel);else target.prepend(panel);
      }
    }
    render();
    return true;
  }

  function init(){
    let tries=0;
    const retry=()=>{
      tries++;
      if(place()||tries>=20)return;
      setTimeout(retry,120);
    };
    retry();

    const observed=["#docTitle","#screenTitle","#periodText","#periodName","#docCode","#docCodeBadge","#logoPreview"]
      .map(s=>$(s)).filter(Boolean);
    observed.forEach(el=>new MutationObserver(()=>{place();render();}).observe(el,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["src"]}));
    $("#periodSelect")?.addEventListener("change",()=>setTimeout(()=>{place();render();},0));
    document.addEventListener("change",event=>{if(event.target?.id==="logoUpload")setTimeout(render,80);});
    window.addEventListener("doc-tit:data-changed",()=>setTimeout(render,0));
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
