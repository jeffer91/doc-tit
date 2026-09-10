from pathlib import Path

ROOT = Path('.')

p = ROOT / 'complexivo/data-workspace.js'
text = p.read_text(encoding='utf-8')

css_old = '''      .data-workspace-flash.error{background:#fff0ef;color:#9b3d32}\n      @media(max-width:900px){'''
css_new = '''      .data-workspace-flash.error{background:#fff0ef;color:#9b3d32}\n      .doc-badges{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}\n      .doc-generate-wrap{display:flex;align-items:center;margin-left:2px}\n      #generateBtn.doc-generate-top{border:0;border-radius:10px;padding:9px 14px;color:#fff;font-size:11px;font-weight:800;line-height:1;min-height:34px;box-shadow:none;transition:background .16s ease,transform .16s ease;white-space:nowrap}\n      #generateBtn.doc-generate-top.ready{background:#14532d;cursor:pointer}\n      #generateBtn.doc-generate-top.ready:hover{background:#166534;transform:translateY(-1px)}\n      #generateBtn.doc-generate-top.pending{background:#8b1f1f;cursor:not-allowed}\n      #generateBtn.doc-generate-top:disabled{opacity:1;filter:none}\n      .doc-badges #docStateBadge.gate-ready{background:#e8f5ee;color:#166534}\n      .doc-badges #docStateBadge.gate-pending{background:#fde8e8;color:#991b1b}\n      @media(max-width:900px){'''
if css_old not in text:
    raise SystemExit('No se encontró punto CSS para insertar estilos del botón superior')
text = text.replace(css_old, css_new, 1)

marker = '''  function ensureWorkspace(){'''
helper = '''  function generationGate(){
    const requiredTables=TABLES.filter(t=>t.required);
    const incomplete=requiredTables.filter(t=>!tableState(t.id).complete);
    const logoOk=resourceState("logo").complete;
    const pending=incomplete.length+(logoOk?0:1);
    return {pending,ready:pending===0,incomplete,logoOk};
  }

  function ensureTopGenerateButton(){
    const btn=$("#generateBtn");
    const badges=$(".doc-badges");
    if(!btn||!badges)return null;
    let wrap=$("#docGenerateWrap");
    if(!wrap){
      wrap=document.createElement("div");
      wrap.id="docGenerateWrap";
      wrap.className="doc-generate-wrap";
      badges.appendChild(wrap);
    }
    if(btn.parentElement!==wrap)wrap.appendChild(btn);
    btn.setAttribute("form","documentForm");
    btn.classList.add("doc-generate-top");
    return btn;
  }

  function updateTopGenerateButton(){
    const btn=ensureTopGenerateButton();
    if(!btn)return;
    const gate=generationGate();
    btn.disabled=!gate.ready;
    btn.classList.toggle("ready",gate.ready);
    btn.classList.toggle("pending",!gate.ready);
    btn.textContent=gate.ready?"Generar PDF":`Generar PDF · ${gate.pending} pendiente${gate.pending===1?"":"s"}`;
    btn.title=gate.ready?"Generar el PDF final":"Completa los elementos obligatorios pendientes para generar el PDF";

    const state=$("#docStateBadge");
    if(state){
      state.classList.remove("neutral");
      state.classList.toggle("gate-ready",gate.ready);
      state.classList.toggle("gate-pending",!gate.ready);
      state.textContent=gate.ready?"Listo para generar":`${gate.pending} pendiente${gate.pending===1?"":"s"}`;
    }
  }

  function ensureWorkspace(){'''
if marker not in text:
    raise SystemExit('No se encontró ensureWorkspace')
text = text.replace(marker, helper, 1)

refresh_old = '''      renderTableCards();
      renderResourceCards();'''
refresh_new = '''      renderTableCards();
      renderResourceCards();
      updateTopGenerateButton();'''
if refresh_old not in text:
    raise SystemExit('No se encontró refresh para sincronizar botón')
text = text.replace(refresh_old, refresh_new, 1)

p.write_text(text, encoding='utf-8')

p = ROOT / 'complexivo/index.html'
text = p.read_text(encoding='utf-8')
old = 'data-workspace.js?v=20260909-workspace-1'
new = 'data-workspace.js?v=20260910-generate-top-1'
if old not in text and new not in text:
    raise SystemExit('No se encontró versión de data-workspace.js')
text = text.replace(old, new, 1)
p.write_text(text, encoding='utf-8')

print('Botón Generar PDF movido al encabezado y sincronizado con pendientes.')
