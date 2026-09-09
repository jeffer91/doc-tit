from pathlib import Path

path=Path('trabajo-titulacion/requirements-config.js')
text=path.read_text(encoding='utf-8')
text=text.replace('Object.freeze({label:"Presentación física",text:"La documentación debe presentarse en una carpeta plástica de color específico asignado a cada carrera, con vinchas para perforado que aseguren el orden de los documentos."}),','"La documentación debe presentarse en una carpeta plástica de color específico asignado a cada carrera, con vinchas para perforado que aseguren el orden de los documentos.",')
text=text.replace('Object.freeze({label:"Presentación física",text:"Los documentos deben ser organizados en una carpeta plástica con tapa transparente y de color específico asignado a cada carrera, entregada en la Secretaría Académica en el horario estipulado para recepción de expedientes."})','"Los documentos deben ser organizados en una carpeta plástica con tapa transparente y de color específico asignado a cada carrera, entregada en la Secretaría Académica en el horario estipulado para recepción de expedientes."')
path.write_text(text,encoding='utf-8')
