from pathlib import Path

path=Path('trabajo-titulacion/process-config.js')
text=path.read_text(encoding='utf-8')
replacements=[
    ('"],conflictKeys:Object.freeze(["tutorDefenseParticipation","readerDefenseParticipation"]))','"]),conflictKeys:Object.freeze(["tutorDefenseParticipation","readerDefenseParticipation"])'),
    ('"],criteria:true,closing:','"]),criteria:true,closing:')
]
for old,new in replacements:
    if old not in text:
        raise SystemExit(f'No se encontró la expresión a corregir: {old[:40]}')
    text=text.replace(old,new,1)
path.write_text(text,encoding='utf-8')
