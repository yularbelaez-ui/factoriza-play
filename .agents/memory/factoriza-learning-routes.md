---
name: Rutas adaptativas de FactorIzA-Play
description: Regla pedagógica para clasificar el diagnóstico y orientar la progresión del curso.
---

La clasificación debe usar un umbral fijo de 75% por competencia:

- **Perfil A / Ruta 1:** si algún prerrequisito aritmético no alcanza el 75%.
- **Perfil B / Ruta 2:** cuando la aritmética sí alcanza el 75%, pero una competencia de pensamiento algebraico no.
- **Perfil C / Ruta 3:** únicamente cuando todas las competencias alcanzan el 75%.

**Why:** La ruta debe atender primero las brechas que impedirían comprender la factorización, en lugar de basarse solo en un promedio global.

**How to apply:** Conserva esta regla al ajustar preguntas, reportes docentes o recomendaciones. La Ruta 3 debe comenzar con reconocimiento de patrones y continuar con factor común antes de los demás casos.

La progresión dentro de cada ruta es secuencial: solo el primer paso pendiente está disponible; los siguientes permanecen bloqueados. Un paso completado sigue abierto para repasar y debe identificarse como “Completada”.

**Why:** Así se evita saltar prerrequisitos sin impedir que el estudiante practique contenidos ya logrados.

**How to apply:** Mantén esta regla cuando se agreguen pasos o nuevas formas de completar contenido, y conserva los avances al sincronizarlos entre dispositivos.

El porcentaje visible de cada paso personalizado debe calcularse con los ejercicios respondidos dentro de sus temas o casos, no con el puntaje fijo del diagnóstico inicial; el cierre/reflexión sigue controlando el estado “Completada” y el desbloqueo.

**Why:** El puntaje diagnóstico describe la necesidad de refuerzo, y los arreglos de `completedTopics`/`completedModules` solo cambian al cerrar una reflexión; usar cualquiera de esos valores como avance durante la práctica hacía que las tarjetas parecieran congeladas.

**How to apply:** Usa la evidencia de respuestas para el porcentaje visible; usa `completedTopics` para el estado de temas y `completedModules` para el estado de factorización; conserva el puntaje diagnóstico solo como contexto separado.

Para los casos de factorización, el porcentaje visible debe combinar `exerciseResults` con `completedExercises`, porque la lista sincronizada con el servidor puede estar disponible aunque el historial detallado local no lo esté.

**Why:** La tarjeta de la ruta se quedaba sin avance cuando el servidor había guardado ejercicios completados, pero el dispositivo no conservaba el detalle local de cada respuesta.

**How to apply:** Construye la evidencia de la ruta con ambas fuentes y cuenta cada ID de ejercicio una sola vez; mantén separada la regla de cierre formal del caso.

Los IDs de los ejercicios no necesariamente comparten el prefijo del ID del caso; el porcentaje debe contar la intersección entre los ejercicios definidos por el módulo y los IDs completados.

**Why:** Por ejemplo, `factor-comun` tiene ejercicios con IDs `fc-ex-*`; filtrar con `startsWith(moduleId)` dejaba el porcentaje en cero aunque el ejercicio estuviera resuelto.

**How to apply:** Obtén la lista de ejercicios del módulo y comprueba cada ID contra el conjunto combinado de `completedExercises` y resultados correctos locales.