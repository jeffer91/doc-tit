# DOC-TIT

Aplicación web estática para la gestión documental de la Unidad de Titulación y Eficiencia Terminal (UTET), organizada por **períodos académicos → procesos → documentos**.

## Primera versión implementada

- Selector y creación de períodos académicos.
- Menú de procesos con submenú de documentos.
- Primer documento operativo: **PRO-56 · Planificación de Examen Complexivo**.
- Código automático por período: `UTET-RGI1-01-PRO-56-AÑO-MES`.
- Separación entre datos automáticos, datos manuales y documentos relacionados.
- Guardado local de borradores por período.
- Vista previa imprimible / guardable como PDF desde el navegador.
- Exportación y restauración de respaldo JSON.
- Despliegue preparado para GitHub Pages mediante GitHub Actions.

## Uso

La aplicación no requiere backend ni instalación. Los datos se guardan en el navegador del equipo mediante almacenamiento local. No deben subirse datos reales de estudiantes al repositorio público.

## Publicación

El workflow `.github/workflows/pages.yml` está preparado para GitHub Pages con source **GitHub Actions**.
