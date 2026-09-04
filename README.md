# DOC-TIT

Gestión documental del proceso de titulación.

## Arquitectura

DOC-TIT funciona como una plataforma con navegación común y aplicaciones independientes por documento.

- `/complexivo/` — Planificación del Examen Complexivo · `UTET-RGI1-01-PRO-56`
- `/trabajo-titulacion/` — Planificación de Trabajo de Titulación · `UGPA-RGI2-01-PRO-56`
- `/articulo-academico/` — Planificación de Artículo Académico · `UTET-RGI3-01-PRO-56`

La raíz del sitio funciona únicamente como menú general. El panel lateral de cada aplicación permite cambiar directamente entre las tres planificaciones sin volver al menú general.

## Componentes compartidos

`/shared/` concentra solamente estándares y navegación reutilizables:

- `documents.js` — manifiesto maestro de documentos y rutas.
- `sidebar.js` / `sidebar.css` — navegación lateral común.
- `institutional-config.js` — responsables institucionales comunes.
- `pdf/standards.js` — constantes maestras RGI, portada, tablas y paginación para nuevos generadores.
- `favicon.svg` — identidad visual común.

El contenido, cronograma, diccionario de actividades, validaciones y generador de cada planificación permanecen dentro de su propia carpeta.

## Datos

Las aplicaciones comparten los períodos institucionales en Supabase, pero cada documento guarda su información con un `document_key` independiente.

Trabajo de Titulación y Artículo Académico incluyen descarga de plantilla Excel, importación inteligente, validación, guardado y generación del PDF.

GitHub Pages publica el repositorio completo mediante `.github/workflows/pages.yml`.
