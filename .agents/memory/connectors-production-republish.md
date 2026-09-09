---
name: Conectores en producción
description: Requisito de republicación cuando una integración cambia después del despliegue.
---

Cuando se añade o modifica un conector de Replit, la aplicación publicada debe volver a publicarse para que producción reciba la conexión actualizada.

**Why:** Desarrollo puede acceder correctamente al conector mientras un despliegue anterior falla antes de ejecutar la primera operación del proveedor.

**How to apply:** Si una integración funciona en desarrollo pero no en producción, verifica cuándo se añadió o cambió y vuelve a publicar antes de cambiar la implementación o pedir nuevas credenciales.