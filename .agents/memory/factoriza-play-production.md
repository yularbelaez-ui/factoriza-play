---
name: FactorIzA-Play producción
description: URL de producción del backend, configuración de EAS, y fallback offline del docente
---

## URL de producción
`https://algebra-tutor--yularbelaez.replit.app`

API base: `https://algebra-tutor--yularbelaez.replit.app/api`

Verificado: responde `{"teacherId":1,"teacherCode":"Karyul04"}` en POST `/api/auth/teacher`.

## EXPO_PUBLIC_API_URL
Configurado en `artifacts/factoriza-play/eas.json` bajo el perfil `preview`.
Se bake-in en el APK en build time — si cambia la URL, rebuild el APK.

**Why:** las apps nativas no resuelven URLs relativas (`/api/...`); necesitan URL absoluta en tiempo de build.

## Pruebas de XP y ranking — la app SIEMPRE habla con producción, nunca con el servidor de este workspace
`EXPO_PUBLIC_API_URL` está fijado a la URL de producción a nivel de `.replit` (`userenv.shared`),
y Expo la incrusta en el bundle en tiempo de build — esto aplica también a la vista previa web en
modo dev, no solo al APK. Como resultado, la vista previa de Expo en este workspace llama SIEMPRE
a `https://algebra-tutor--yularbelaez.replit.app`, nunca al `artifacts/api-server` local, aunque
ambos corran en el mismo repl.

**Why:** cualquier endpoint, columna de esquema o corrección de bug agregada solo en este entorno
de desarrollo es invisible para la app real (vista previa y APK) hasta publicar `api-server` a
producción — y aplicar cualquier migración de esquema nueva a la base de datos de producción.
Confirmado con un test E2E real: nuevos endpoints (`topic-stats`, `student-analytics`) que
funcionaban por curl contra `localhost:8080` devolvían 404 en la vista previa porque el dominio
de producción aún no los tenía desplegados.

**How to apply:** para validar un flujo de extremo a extremo en la app real (no solo por curl/DB),
resuelve ejercicios en la app y confirma en Comunidad/Panel Docente. Para que un cambio de backend
(nuevo endpoint, columna, lógica) llegue a estudiantes/docentes reales, hay que publicar
`api-server` — un curl o consulta SQL contra el entorno de desarrollo NO es evidencia de que el
cambio esté vivo para los usuarios.

## Fallback offline del docente
En `AppContext.tsx`, si la API lanza error `"SIN_CONEXION"`, se acepta el código `TEACHER_CODE` local.
Si la API responde y rechaza el código, no se acepta localmente.

**Why:** el APK puede usarse sin internet para el docente; estudiantes siempre requieren backend.

## Cuenta EAS
- Cuenta: `yul.arbelaez`
- Project ID: `985e3e8b-c265-4a23-b0c7-0f7e8e38c348`
- Package: `com.factorizaplay.app`
- Profile de build para APK: `preview` (buildType: apk, distribution: internal)
