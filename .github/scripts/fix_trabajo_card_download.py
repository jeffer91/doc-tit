from pathlib import Path

root = Path('.')

# Patch shared card action to call the exact working top-template handler directly.
p = root / 'shared/module-ui.js'
s = p.read_text(encoding='utf-8')
old = "    $('[data-card-action=\"download\"]',card)?.addEventListener(\"click\",()=>$(\"#downloadTemplateBtn\")?.click());"
new = "    $('[data-card-action=\"download\"]',card)?.addEventListener(\"click\",event=>{event.preventDefault();event.stopPropagation();const source=$(\"#downloadTemplateBtn\");if(typeof source?.onclick===\"function\")source.onclick.call(source,event);else source?.click();});"
if old not in s and new not in s:
    raise SystemExit('No se encontró el manejador de descarga esperado en shared/module-ui.js')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

# Remove the temporary extra download layer; the shared UI now owns the action.
p = root / 'trabajo-titulacion/index.html'
s = p.read_text(encoding='utf-8')
s = s.replace('\n<script src="download-card-fix.js?v=20260910-2"></script>', '')
s = s.replace('../shared/module-ui.js?v=20260910-audit-4', '../shared/module-ui.js?v=20260910-audit-5')
p.write_text(s, encoding='utf-8')

# Bust cache for the other module using the same shared UI.
p = root / 'articulo-academico/index.html'
if p.exists():
    s = p.read_text(encoding='utf-8')
    s = s.replace('../shared/module-ui.js?v=20260910-audit-4', '../shared/module-ui.js?v=20260910-audit-5')
    p.write_text(s, encoding='utf-8')

print('Direct card download handler applied')
