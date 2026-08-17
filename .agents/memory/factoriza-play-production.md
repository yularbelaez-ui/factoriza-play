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

## Fallback offline del docente
En `AppContext.tsx`, si la API lanza error `"SIN_CONEXION"`, se acepta el código `TEACHER_CODE` local.
Si la API responde y rechaza el código, no se acepta localmente.

**Why:** el APK puede usarse sin internet para el docente; estudiantes siempre requieren backend.

## Cuenta EAS
- Cuenta: `yul.arbelaez`
- Project ID: `985e3e8b-c265-4a23-b0c7-0f7e8e38c348`
- Package: `com.factorizaplay.app`
- Profile de build para APK: `preview` (buildType: apk, distribution: internal)
