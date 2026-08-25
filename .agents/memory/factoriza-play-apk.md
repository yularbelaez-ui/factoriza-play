---
name: APK Android en EAS
description: Reglas duraderas para publicar builds internos Android de FactorIzA-Play
---

Cada actualización del APK Android debe incrementar `versionCode` antes de iniciar el build de EAS; conservar el mismo número puede impedir que Android trate el archivo como una actualización normal.

**Why:** La primera compilación de una actualización funcional conservó el número anterior y tuvo que repetirse para producir un APK instalable como nueva versión. Además, las tareas nativas de Gradle/CMake pueden dejar un build en `IN_PROGRESS` durante más de 20 minutos.

**How to apply:** Verificar el `versionCode` respecto al APK anterior y no duplicar ni cancelar un build solo por permanecer activo mientras los logs muestren tareas Gradle/CMake.