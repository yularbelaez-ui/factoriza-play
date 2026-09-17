---
name: Cierre y avance de actividades
description: Regla de navegación para reflexiones de temas y casos de factorización
---

La reflexión de sesión debe ser el último paso de una actividad. Al responderla completa, se marca el tema o caso y la navegación reemplaza la pantalla por el siguiente elemento disponible; no se debe permitir cambiar a una reflexión semanal durante ese cierre.

**Why:** Volver atrás después de guardar dejaba el flujo sin avance claro y permitía cerrar una actividad sin pasar por las cuatro preguntas obligatorias.

**How to apply:** Las rutas que terminan una práctica deben abrir la pantalla de reflexión con `activityId` y `sessionId`; esa pantalla decide el siguiente tema o caso y ejecuta la finalización antes de navegar.