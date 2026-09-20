---
name: Desbloqueo de evaluaciones
description: Regla para conservar el acceso a un examen después de validar su código.
---

Una evaluación validada debe considerarse desbloqueada desde la sesión de evaluación persistida, no solo desde el estado local temporal de la pantalla anterior.

**Why:** El estudiante puede validar el código en la pestaña de evaluaciones y luego navegar a otra pantalla; si la pantalla del examen reinicia su estado local, vuelve a pedir un código ya aceptado.

**How to apply:** Al montar una pantalla de examen, deriva el desbloqueo desde el código validado para su `moduleId`; conserva la solicitud de código únicamente cuando no exista esa sesión.

La validación de código y la presentación de la evaluación son estados distintos: el código puede desbloquear el examen, pero al enviar la evaluación se debe guardar una marca persistente por estudiante y módulo para impedir un segundo intento.

**Why:** Conservar solo el código validado permitía volver a abrir el examen después de terminarlo, especialmente al regresar a la pestaña o iniciar sesión de nuevo.

**How to apply:** Bloquea la interfaz con la marca persistente y valida también en el servidor; si no hay conexión, marca localmente y encola la sincronización para no perder la restricción.