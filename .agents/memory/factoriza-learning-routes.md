---
name: Rutas adaptativas de FactorIzA-Play
description: Regla pedagógica para clasificar el diagnóstico y orientar la progresión del curso.
---

La clasificación debe usar un umbral fijo de 75% por módulo diagnóstico:

- **Aritmética / Fortalecimiento algebraico:** naturales, decimales, enteros, irracionales, reales, potencias, fracciones y factores primos.
- **Introducción al álgebra / Pensamiento algebraico:** notación y grado, expresión y término, clasificación, y términos semejantes/valor numérico.
- **Operaciones algebraicas / Reconocimiento de patrones:** suma y resta, multiplicación, división y productos notables.
- **Factorización:** secuencia de casos posterior a los tres módulos diagnósticos.

**Why:** El diagnóstico y la ruta deben hablar de los mismos bloques del curso; una categoría que no tiene un módulo equivalente produce rutas confusas y reportes difíciles de interpretar.

**How to apply:** Conserva los identificadores de categoría nuevos al ajustar preguntas, reportes docentes o recomendaciones. Mantén el umbral fijo de 75% y agrega a la ruta solo los grupos con temas por debajo del umbral; Factorización sigue siendo la etapa posterior.

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

En el inicio, el mapa de conocimientos previos solo debe mostrar temas cuyo resultado diagnóstico esté por debajo del 75%; los temas dominados se ocultan, no se presentan como pendientes.

**Why:** La ruta de refuerzo debe dirigir la atención a dificultades reales y no hacer que el estudiante repase contenidos que ya demostró dominar.

**How to apply:** Usa los resultados diagnósticos actuales o su respaldo histórico, filtra cada tema por su categoría correspondiente y muestra un mensaje de bases sólidas cuando una sección no tenga temas por reforzar.

La pantalla de resultados del diagnóstico también debe recibir la evidencia de ejercicios para mostrar el avance vivo; `step.score` representa el diagnóstico inicial y nunca debe usarse como porcentaje de progreso.

**Why:** Mostrar el puntaje inicial hacía que aritmética, álgebra, patrones y factorización parecieran congelados aunque el estudiante ya hubiera respondido ejercicios.

**How to apply:** Construye la evidencia con ejercicios de temas y casos, calcula el progreso por paso y conserva el puntaje diagnóstico solo como referencia de necesidad de refuerzo.