(() => {
  "use strict";

  const nav=document.querySelector("[data-doc-tit-navigation]");
  const documentId=nav?.dataset.activeDocument||"";
  if(!["trabajo-titulacion","articulo-academico"].includes(documentId))return;

  const $=(s,r=document)=>r.querySelector(s);
  const pct=()=>{
    const raw=$("#progressLabel")?.textContent||"0";
    const m=raw.match(/(\d{1,3})/);
    return m?Math.max(0,Math.min(100,Number(m[1]))):0;
  };

  function institutional(){
    try{return window.DOC_TIT_INSTITUTIONAL?.resolve?.(documentId)||{};}catch(_){return{};}
  }

  function ensureHeading(){
    const top=$("header.top");
    if(!top)return;
    if(top.dataset.docStandardized==="1")return;
    top.dataset.docStandardized="1";
    top.classList.add("doc-standard-heading");

    const left=document.createElement("div");
    left.className="doc-standard-heading-main";
    const eyebrow=$(".eyebrow",top),title=$("h1",top),period=$("#periodText",top);
    [eyebrow,title,period].forEach(el=>{if(el)left.appendChild(el);});

    const badges=document.createElement("div");
    badges.className="doc-standard-badges";
    const code=$("#docCode",top);
    if(code){code.className="doc-standard-badge";badges.appendChild(code);}
    const state=document.createElement("span");
    state.id="docStandardState";
    state.className="doc-standard-badge state-pending";
    state.textContent="Pendiente";
    badges.appendChild(state);
    const generate=$("#generateBtn");
    if(generate){generate.classList.add("doc-standard-generate","pending");badges.appendChild(generate);}

    top.replaceChildren(left,badges);
  }

  function ensureLayout(){
    const main=$("main.main"),top=$("header.top");
    if(!main||!top||$("#docStandardLayout"))return;

    const layout=document.createElement("div");
    layout.id="docStandardLayout";
    layout.className="doc-standard-layout";
    const content=document.createElement("div");
    content.className="doc-standard-content";
    const side=document.createElement("aside");
    side.className="doc-standard-side";
    side.innerHTML=`<section class="panel"><span class="eyebrow">Automático</span><h3>La app ya completa</h3><div id="docStandardAuto" class="doc-standard-auto"></div></section>`;
    layout.append(content,side);
    top.insertAdjacentElement("afterend",layout);

    const toolbar=$(".toolbar"),progressPanel=$("#progressLabel")?.closest("section.panel"),dynamic=$("#dynamicSections"),logoPanel=$("#logoUpload")?.closest("section.panel"),actions=$(".actions");
    if(toolbar)content.appendChild(toolbar);
    if(progressPanel){
      progressPanel.classList.add("doc-standard-workspace");
      const eyebrow=$(".panel-head .eyebrow",progressPanel),h3=$(".panel-head h3",progressPanel);
      if(eyebrow)eyebrow.textContent="Carga de información";
      if(h3)h3.textContent="Datos del documento";
      if(!$(".doc-standard-workspace-note",progressPanel)){
        const note=document.createElement("p");note.className="doc-standard-workspace-note";
        note.textContent="Completa únicamente la información que alimenta el formato final. El período, el código y los datos institucionales se generan automáticamente.";
        $(".panel-head>div",progressPanel)?.appendChild(note);
      }
      content.appendChild(progressPanel);
    }
    if(dynamic)content.appendChild(dynamic);
    if(logoPanel)content.appendChild(logoPanel);
    if(actions)content.appendChild(actions);
    const bottom=$("#generateBtnBottom");if(bottom)bottom.hidden=true;
  }

  function updateAuto(){
    const host=$("#docStandardAuto");if(!host)return;
    const inst=institutional();
    const period=$("#periodText")?.textContent?.trim()||"—";
    const code=$("#docCode")?.textContent?.trim()||"—";
    host.innerHTML=`
      <div class="doc-standard-auto-row"><span>Período</span><strong>${period}</strong></div>
      <div class="doc-standard-auto-row"><span>Código</span><strong>${code}</strong></div>
      <div class="doc-standard-auto-row"><span>Unidad</span><strong>${inst.unit||"—"}</strong></div>
      <div class="doc-standard-auto-row"><span>Elaborado por</span><strong>${inst.preparedBy||"—"}${inst.preparedRole?` · ${inst.preparedRole}`:""}</strong></div>
      <div class="doc-standard-auto-row"><span>Revisado por</span><strong>${inst.reviewedBy||"—"}</strong></div>
      <div class="doc-standard-auto-row"><span>Aprobado por</span><strong>${inst.approvedBy||"—"}</strong></div>`;
  }

  function updateGate(){
    const value=pct();
    const ready=value>=100;
    const btn=$("#generateBtn"),state=$("#docStandardState");
    if(btn){
      btn.classList.toggle("ready",ready);btn.classList.toggle("pending",!ready);
      btn.disabled=!ready;
      btn.textContent=ready?"Generar PDF":`Generar PDF · ${Math.max(1,Math.ceil((100-value)/25))} pendiente${value<=50?"s":""}`;
    }
    if(state){
      state.classList.toggle("state-ready",ready);state.classList.toggle("state-pending",!ready);
      state.textContent=ready?"Listo para generar":"Pendiente";
    }
    updateAuto();
  }

  function init(){
    ensureHeading();ensureLayout();updateGate();
    const label=$("#progressLabel");
    if(label)new MutationObserver(updateGate).observe(label,{childList:true,subtree:true,characterData:true});
    const period=$("#periodText"),code=$("#docCode");
    [period,code].filter(Boolean).forEach(el=>new MutationObserver(updateAuto).observe(el,{childList:true,subtree:true,characterData:true}));
    window.addEventListener("resize",updateGate,{passive:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0),{once:true});
  else setTimeout(init,0);
})();
