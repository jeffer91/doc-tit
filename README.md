# DOC-TIT

Gestión documental del proceso de titulación.

## Arquitectura

Cada planificación funciona como una aplicación independiente dentro de su propia carpeta:

- `/complexivo/` — Planificación de Examen Complexivo · `UTET-RGI1-01-PRO-56`
- `/trabajo-titulacion/` — Planificación de Trabajo de Titulación · `UGPA-RGI2-01-PRO-56`
- `/articulo-academico/` — Planificación de Artículo Académico · `UTET-RGI3-01-PRO-56`

La raíz del sitio funciona únicamente como menú general.

## Datos

Las aplicaciones comparten los períodos institucionales en Supabase, pero cada documento guarda su información con un `document_key` independiente.

Trabajo de Titulación y Artículo Académico incluyen:

1. Descarga de plantilla Excel con los datos actuales.
2. Importación inteligente de la plantilla.
3. Validación de campos y fechas detectadas.
4. Aplicación de los datos al formulario.
5. Guardado automático en Supabase.
6. Generación y almacenamiento del PDF.

GitHub Pages publica el repositorio completo mediante `.github/workflows/pages.yml`.
