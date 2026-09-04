---
name: Expo Go iOS con SDK 57
description: Restricciones de compatibilidad y autenticación para abrir FactorIzA-Play en Expo Go 57 sobre un iPhone físico
---

Expo Go en un iPhone físico solo acepta proyectos del SDK vigente; no se puede instalar una
versión anterior de Expo Go desde App Store. FactorIzA-Play debe permanecer alineado con SDK 57
mientras esa sea la versión exigida por el cliente iOS.

**Why:** Expo Go 57 rechazó el proyecto cuando aún usaba SDK 54. Además, el servidor de desarrollo
físico requiere una sesión administrada por Replit. Un `EXPO_TOKEN` existente puede impedir que
la herramienta de inicio de sesión use esa sesión si no se excluye solo durante el comando de
login.

**How to apply:** al actualizar Expo, alinear dependencias con `expo install --fix`, mantener una
sola versión de React compatible en el catálogo del monorepo, comprobar Expo Doctor y exportar
iOS/Android. El arranque debe autenticar con la sesión administrada de Replit sin exponerla y luego
iniciar Metro conservando todas las variables del workflow.

Para la vista publicada, no basta con que el dominio de Replit sea público. El manifiesto estático
de Expo Go tampoco debe incluir el propietario de la cuenta de compilación en `expoClient` ni el
usuario de Expo CLI en `expoGo`; esos metadatos hacen que Expo Go exija iniciar sesión como el
propietario aunque el `scopeKey` sea anónimo.

**Why:** el QR público del despliegue seguía mostrando “sign in to Expo Go as yul.arbelaez” porque
el empaquetador conservaba esos campos del manifiesto obtenido durante la compilación.

**How to apply:** retirar únicamente los metadatos de identidad de la copia estática destinada a
Expo Go público. Mantener la vinculación EAS en la configuración fuente para no romper futuras
compilaciones de APK ni la administración del proyecto.