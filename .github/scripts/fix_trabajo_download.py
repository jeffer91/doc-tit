from pathlib import Path

ROOT = Path('.')

# 1) Expose the real Trabajo template actions from app.js so the shared card
# can invoke them directly instead of triggering a second synthetic click.
p = ROOT / 'trabajo-titulacion/app.js'
s = p.read_text(encoding='utf-8')
marker = 'localLoad();renderPeriods();renderSections();renderAssets();progress();bind();initPeriodDialog();initCloud();\n})();'
replacement = '''window.DocTitTrabajoActions = Object.freeze({
  downloadTemplate,
  openImport(){ $("#importInput")?.click(); }
});
localLoad();renderPeriods();renderSections();renderAssets();progress();bind();initPeriodDialog();initCloud();
})();'''
if marker in s:
    s = s.replace(marker, replacement, 1)
elif 'window.DocTitTrabajoActions' not in s:
    raise SystemExit('Could not expose Trabajo actions')
p.write_text(s, encoding='utf-8')

# 2) The standardized card calls the real action directly. This preserves the
# browser user gesture for XLSX.writeFile and avoids the no-op synthetic chain.
p = ROOT / 'shared/module-ui.js'
s = p.read_text(encoding='utf-8')
old = '''    $('[data-card-action="download"]',card)?.addEventListener("click",()=>$("#downloadTemplateBtn")?.click());
    $('[data-card-action="upload"]',card)?.addEventListener("click",()=>$("#importInput")?.click());'''
new = '''    $('[data-card-action="download"]',card)?.addEventListener("click",()=>{
      const action=window.DocTitTrabajoActions?.downloadTemplate;
      if(typeof action==="function")action();
      else $("#downloadTemplateBtn")?.click();
    });
    $('[data-card-action="upload"]',card)?.addEventListener("click",()=>{
      const action=window.DocTitTrabajoActions?.openImport;
      if(typeof action==="function")action();
      else $("#importInput")?.click();
    });'''
if old in s:
    s = s.replace(old, new, 1)
elif 'window.DocTitTrabajoActions?.downloadTemplate' not in s:
    raise SystemExit('Could not wire standardized card actions')
p.write_text(s, encoding='utf-8')

# 3) Bust cache for both changed scripts.
p = ROOT / 'trabajo-titulacion/index.html'
s = p.read_text(encoding='utf-8')
s = s.replace('app.js?v=20260910-inputs-2', 'app.js?v=20260910-downloadfix-1')
s = s.replace('../shared/module-ui.js?v=20260910-audit-4', '../shared/module-ui.js?v=20260910-downloadfix-1')
p.write_text(s, encoding='utf-8')

# Article also consumes the shared UI, so bust that cache too without changing its content logic.
p = ROOT / 'articulo-academico/index.html'
s = p.read_text(encoding='utf-8')
s = s.replace('../shared/module-ui.js?v=20260910-audit-4', '../shared/module-ui.js?v=20260910-downloadfix-1')
p.write_text(s, encoding='utf-8')

print('Trabajo card download/upload actions fixed')
