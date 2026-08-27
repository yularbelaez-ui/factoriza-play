---
name: FactorIzA-Play sincronización de XP y ranking
description: Por qué el XP se perdía silenciosamente y el patrón de idempotencia/cola de reintentos usado para corregirlo
---

## Causa raíz del bug de XP desactualizado
El envío de resultados de ejercicio al backend era "fire-and-forget" (`.catch(() => {})`
sin reintento). Si esa petición fallaba (app en segundo plano, red inestable, arranque en
frío), el XP se aplicaba solo de forma optimista en el estado local y nunca llegaba al
servidor — el ranking de comunidad y el panel docente seguían mostrando el XP viejo
indefinidamente, sin ningún error visible.

Un segundo factor: la pantalla de comunidad tenía su propio fetch de ranking duplicado,
sin protección contra respuestas fuera de orden (race condition), en vez de reusar la
función ya protegida del contexto.

**Why:** cualquier sync de progreso de usuario que no se reintenta ante fallo termina
divergiendo silenciosamente entre cliente y servidor — no hay señal de error que dispare
una corrección.

## Patrón adoptado: cola de reintentos + idempotencia por clientId
- Cada envío de ejercicio genera un `clientId` (string barata tipo `Date.now()+random`,
  no hace falta UUID).
- Si el POST falla, se encola en una cola persistida (AsyncStorage) y se reintenta por
  intervalo y al volver la app a primer plano (`AppState`).
- El servidor deduplica por `(studentId, clientId)` antes de aplicar XP — un reintento
  tras perder la respuesta nunca duplica XP.
- Tras cualquier sync exitoso (inmediato o reintentado) se dispara un refresh del
  ranking, en vez de depender solo de un intervalo fijo.

**How to apply:** para cualquier futura mutación que otorgue puntos/XP/logros desde el
cliente, seguir este mismo patrón (clientId + cola persistida + dedupe server-side) en
vez de fire-and-forget. Reusar la función de refresh ya protegida contra carreras del
contexto en cualquier pantalla nueva que muestre ranking, en vez de duplicar el fetch.
