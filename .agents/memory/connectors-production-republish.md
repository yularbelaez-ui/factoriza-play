---
name: Conectores en producción
description: Requisito de republicación cuando una integración cambia después del despliegue.
---

Cuando se añade o modifica un conector de Replit, la aplicación publicada debe volver a publicarse para que producción reciba la conexión actualizada.

**Why:** Desarrollo puede acceder correctamente al conector mientras un despliegue anterior falla antes de ejecutar la primera operación del proveedor.

**How to apply:** Si una integración funciona en desarrollo pero no en producción, verifica cuándo se añadió o cambió y vuelve a publicar antes de cambiar la implementación o pedir nuevas credenciales.

Google Drive puede conservar la conexión como instalada aunque el OAuth esté desconectado (`invalid_grant`); la recuperación correcta es reautorizar la conexión y verificar una llamada autenticada antes de probar nuevas cargas.

**Why:** Las imágenes de evidencia dependen de Drive tanto al subirlas como al incrustarlas en el PDF, por lo que un token revocado se manifiesta como fallos de evidencia y no como un error del generador PDF.

**How to apply:** Ante un 400 de Drive por `invalid_grant`, usar el flujo de reautorización de la conexión existente; después comprobar que el proxy responde 200 y no crear una conexión duplicada.