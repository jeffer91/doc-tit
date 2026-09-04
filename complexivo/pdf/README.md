# Arquitectura del PDF de Examen Complexivo

El generador está dividido por responsabilidad para que cada corrección sea localizada.

- `config/`: datos institucionales y reglas de maquetación.
- `components/`: elementos reutilizables como encabezado, firmas y pie de página.
- `sections/`: contenido de cada sección visible del PDF.
- `document-outline.js`: orden de las secciones.
- `../full-document.js`: motor/orquestador; no debe contener contenido específico de una sección.

Rutas principales:

- Portada: `sections/cover.js`
- Índice: `sections/index.js`
- Resumen ejecutivo: `sections/executive-summary.js`
- Introducción: `sections/introduction.js`
- Base legal: `sections/legal-basis.js`
- Metodología: `sections/methodology/`
- Requisitos: `sections/requirements/`
- Descripción del examen: `sections/exam-description.js`
- Seminarios: `sections/seminars.js`
- Distribución: `sections/distribution/`
- Laboratorios: `sections/laboratories.js`
- Imponderables: `sections/imponderables.js`
- Evaluación: `sections/evaluation.js`
- Bibliografía: `sections/bibliography.js`
- Encabezado: `components/header.js`
- Firmas: `components/signature-block.js`
- Pie de página: `components/footer.js`
- Nombres/cargos institucionales: `config/institutional.js`
