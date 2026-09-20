---
name: Calificaciones académicas de FactorIzA-Play
description: Reglas pedagógicas durables para calcular notas sin mezclarlas con la gamificación.
---

Las calificaciones académicas de 1.0 a 5.0 deben permanecer separadas de XP, rangos, insignias y rutas. La nota inicial es un punto de partida y pesa 20%; la rúbrica evolutiva usa 40% corrección/retroalimentación, 30% evaluación del caso y 10% reflexión.

**Why:** La nota debe valorar el aprendizaje a partir del error y poder subir cuando el estudiante estudia, usa la retroalimentación y corrige, sin dejar que un diagnóstico inicial bajo domine la calificación. Reconocimiento de patrones es una introducción activa del curso, pero se mantiene fuera de estas calificaciones para no mezclar la inducción con la evidencia de dominio de los casos.

**How to apply:** Usar únicamente evidencia observable. La corrección parte de un error real y valora identificación, uso de retroalimentación y respuesta posterior correcta. La evaluación del caso cuenta las respuestas registradas del examen, aunque no haya una corrección previa. Los componentes sin evidencia quedan pendientes y los informes muestran su cobertura; nunca se imputan como fallos.

Los perfiles diagnósticos antiguos pueden conservar `moduleResults` sin `results`; al calcular la nota académica, reconstruir la evidencia diagnóstica desde los temas de esos resultados para no perder pensamiento algebraico.

**Why:** La nota final debe seguir incluyendo las competencias de perfiles creados antes de que se persistiera el desglose detallado del diagnóstico.

**How to apply:** Preferir `diagnosticProfile.results` cuando exista; usar `moduleResults[].topics` como respaldo tanto en la vista del estudiante como en los reportes docentes.

Los temas de repaso que ya superaron el umbral diagnóstico no deben aparecer como “Pendiente” en el listado académico; deben excluirse del listado visible usando la correspondencia tema → categoría diagnóstica.

**Why:** Algunos temas, como Números Irracionales, pueden no tener evidencia de práctica porque ya fueron aprobados en el diagnóstico; mostrarlos como pendientes contradice el resultado inicial y confunde al estudiante.

**How to apply:** Al construir el resumen académico, filtrar los temas con resultado diagnóstico igual o superior al 75%; conservar los resultados diagnósticos en los agregados generales.

Cuando el estudiante tiene conexión, su nota visible debe usar el `academicSummary` consolidado por el servidor, que es también la fuente del panel docente y del PDF; el cálculo local queda solo como respaldo offline.

**Why:** La copia local y la del API habían evolucionado por separado y podían producir notas diferentes con los mismos datos aparentes; además, sincronizar XP o volver a cargar el perfil podía recalcular una nota local distinta.

**How to apply:** Cargar el resumen académico del estudiante desde el endpoint de analítica al entrar a Inicio y usar el cálculo local únicamente si la consulta falla o el estudiante no tiene backend.

El resumen académico remoto debe invalidarse y volver a consultarse cuando cambien las evidencias o reflexiones locales; el cálculo offline no debe otorgar crédito por leer teoría si el servidor no registra esa evidencia.

**Why:** Una respuesta nueva podía dejar al estudiante viendo una nota remota anterior, mientras el docente veía la nota actual; además, una señal local no persistida producía componentes distintos con los mismos ejercicios.

**How to apply:** Usa respuestas de analítica sin caché, refresca tras cambios de progreso y mantén la rúbrica basada en evidencia compartida por el servidor.

En estudiantes conectados, la invalidación de la nota debe ocurrir después de que el resultado de ejercicio confirme su guardado en el servidor, no solo después del cambio optimista local.

**Why:** La consulta iniciada por el cambio local podía llegar antes del `INSERT` y dejar visible la nota anterior sin otra actualización posterior.

**How to apply:** Incrementa una señal de versión académica al completar la sincronización del ejercicio y úsala como dependencia de la consulta del resumen académico.