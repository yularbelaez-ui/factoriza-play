---
name: PDFKit en el API
description: Restricción de empaquetado para generar informes PDF con PDFKit en el servidor
---

PDFKit debe externalizarse en el build de esbuild del API. Su versión actual resuelve las fuentes estándar mediante el alias interno `#standard-fonts/*`; al incluirlo dentro del bundle, el endpoint puede fallar en runtime con `Cannot find module '#standard-fonts/Helvetica'`.

**Why:** El bundle compilaba correctamente, pero la descarga del informe devolvía HTTP 500 justo al instanciar la fuente Helvetica.

**How to apply:** Mantener `pdfkit` en `external` y probar tanto la construcción del API como la generación de un PDF real después de modificar el empaquetado.