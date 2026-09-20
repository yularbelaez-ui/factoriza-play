---
name: Desbloqueo de evaluaciones
description: Regla para conservar el acceso a un examen después de validar su código.
---

Una evaluación validada debe considerarse desbloqueada desde la sesión de evaluación persistida, no solo desde el estado local temporal de la pantalla anterior.

**Why:** El estudiante puede validar el código en la pestaña de evaluaciones y luego navegar a otra pantalla; si la pantalla del examen reinicia su estado local, vuelve a pedir un código ya aceptado.

**How to apply:** Al montar una pantalla de examen, deriva el desbloqueo desde el código validado para su `moduleId`; conserva la solicitud de código únicamente cuando no exista esa sesión.