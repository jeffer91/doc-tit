from pathlib import Path

path=Path('trabajo-titulacion/process-config.js')
text=path.read_text(encoding='utf-8')
old='"],conflictKeys:Object.freeze(["tutorDefenseParticipation","readerDefenseParticipation"]))'
new='"]),conflictKeys:Object.freeze(["tutorDefenseParticipation","readerDefenseParticipation"])'
if old not in text:
    raise SystemExit('No se encontró la expresión conflictKeys a corregir')
text=text.replace(old,new,1)
path.write_text(text,encoding='utf-8')
