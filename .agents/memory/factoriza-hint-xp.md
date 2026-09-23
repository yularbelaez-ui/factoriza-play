---
name: Recompensas por pistas de FactorIzA-Play
description: Regla de XP y comportamiento de pistas en ejercicios de casos, práctica y evaluaciones.
---

Una pista puede abrirse antes de responder en todos los flujos de ejercicios. El XP se asigna al registrar la respuesta, no al abrir la pista:

- Primer acierto sin pista: conserva la recompensa normal del ejercicio.
- Primer acierto usando una pista: 8 XP.
- Acierto después de uno o más errores: 5 XP.
- Respuesta incorrecta: 0 XP.

**Why:** Dar XP al abrir la pista permitía acumular recompensas sin completar el ejercicio y la recompensa de una corrección no era consistente entre el cliente y la API.

**How to apply:** Mantén la fórmula sincronizada en `AppContext` y el endpoint de ejercicios del servidor. Registra los eventos de pista para analítica, pero no los uses para sumar XP por separado.