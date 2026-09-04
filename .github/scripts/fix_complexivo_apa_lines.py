from pathlib import Path

full = Path('complexivo/full-document.js')
text = full.read_text(encoding='utf-8')
old_head = 'if(data.section==="head" && data.column.index===0){'
new_head = 'if(data.section==="head" && data.column.index===data.table.columns.length-1){'
old_body = 'if(data.section==="body" && data.row.index===data.table.body.length-1 && data.column.index===0){'
new_body = 'if(data.section==="body" && data.row.index===data.table.body.length-1 && data.column.index===data.table.columns.length-1){'

if text.count(old_head) != 1:
    raise SystemExit(f'Expected exactly 1 header condition, found {text.count(old_head)}')
if text.count(old_body) != 1:
    raise SystemExit(f'Expected exactly 1 body condition, found {text.count(old_body)}')

text = text.replace(old_head, new_head).replace(old_body, new_body)
full.write_text(text, encoding='utf-8')

index = Path('complexivo/index.html')
html = index.read_text(encoding='utf-8')
old_version = 'full-document.js?v=20260904-tables-1'
new_version = 'full-document.js?v=20260904-tables-2'
if old_version not in html:
    raise SystemExit('Expected full-document cache version not found')
html = html.replace(old_version, new_version, 1)
index.write_text(html, encoding='utf-8')

print('Complexivo APA table rules fixed and cache version bumped.')
