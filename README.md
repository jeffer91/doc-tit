# DOC-TIT

Gestión documental del proceso de titulación.

## Arquitectura

DOC-TIT funciona como una plataforma con navegación común y aplicaciones independientes por documento.

- `/complexivo/` — Planificación del Examen Complexivo · `UTET-RGI1-01-PRO-56`
- `/trabajo-titulacion/` — Planificación de Trabajo de Titulación · `UGPA-RGI2-01-PRO-56`
- `/articulo-academico/` — Planificación de Artículo Académico · `UTET-RGI3-01-PRO-56`

La raíz del sitio funciona únicamente como menú general. El panel lateral de cada aplicación permite cambiar directamente entre las tres planificaciones sin volver al menú general.

## Principio de funcionamiento

El período activo es el contexto global del sistema. Los documentos se identifican por la combinación `periodId + document_key`, por lo que la información de un período no debe mezclarse con otro.

Flujo común:

`Período activo → datos del período → documento → secciones → diagnóstico / vista previa → PDF de sección o PDF completo`

## Core documental compartido

`/shared/` concentra capacidades reutilizables y estándares comunes:

- `documents.js` — manifiesto maestro de documentos y rutas.
- `sidebar.js` / `sidebar.css` — navegación lateral común y carga del Core.
- `module-ui.js` / `module-ui.css` — carcasa visual común, estado y acción principal de las planificaciones.
- `document-core.js` / `document-core.css` — Core documental compartido: protección de cambio de período, validación de períodos duplicados, estados Activo/Cerrado/Archivado, trazabilidad básica de importación, diagnóstico, vista previa por sección y PDF de sección.
- `institutional-config.js` — responsables institucionales comunes.
- `pdf/standards.js` — constantes maestras RGI y APA institucional para encabezado, portada, cuerpo, tablas, referencias y paginación.
- `favicon.svg` — identidad visual común.

El contenido y las reglas propias de cada planificación permanecen dentro de su carpeta. El Core no debe contener textos institucionales específicos de Complexivo, Trabajo de Titulación o Artículo Académico.

## Períodos

Los períodos se comparten mediante Supabase y utilizan el formato `YYYY-MM_YYYY-MM`, por ejemplo `2026-04_2026-09`.

Reglas comunes del Core:

- la fecha final no puede ser anterior a la inicial;
- no se crea un período duplicado: se selecciona el existente;
- al cambiar de período con cambios pendientes se puede cancelar, descartar o guardar y cambiar;
- `Activo` permite edición normal;
- `Cerrado` permite consulta y PDF, y solicita confirmación antes de editar;
- `Archivado` funciona como solo consulta.

## Datos e importación

Trabajo de Titulación y Artículo Académico incluyen descarga de plantilla Excel, importación, validación, normalización, guardado y generación del PDF. El Excel se considera una fuente de entrada; después de importar, la aplicación trabaja con su modelo interno.

El Core registra el nombre y la fecha de la última plantilla importada para mostrar su origen en el diagnóstico del período.

## Revisión y diagnóstico

Cada módulo dispone de una acción `Diagnóstico` que muestra:

- período, `periodId` y estado;
- documento y código;
- origen de los datos;
- secciones obligatorias y complementarias;
- pendientes detectados;
- vista previa de cada sección de trabajo;
- descarga de PDF individual de cada sección de trabajo.

La generación del documento completo continúa siendo responsabilidad del generador específico de cada planificación mientras la migración del motor PDF común avanza de forma incremental.

## PDF

Los estándares visuales comunes viven en `shared/pdf/standards.js`. Complexivo ya mantiene una arquitectura PDF más modular (`config`, `components`, `sections` y `document-outline.js`). Trabajo de Titulación y Artículo Académico deben continuar migrándose progresivamente hacia el mismo principio: contenido y reglas por sección, y motor de render compartido sin texto institucional embebido.

GitHub Pages publica el repositorio completo mediante `.github/workflows/pages.yml`.
