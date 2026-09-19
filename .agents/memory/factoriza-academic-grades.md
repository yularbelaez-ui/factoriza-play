---
name: Calificaciones académicas de FactorIzA-Play
description: Reglas pedagógicas durables para calcular notas sin mezclarlas con la gamificación.
---

Las calificaciones académicas de 1.0 a 5.0 deben permanecer separadas de XP, rangos, insignias y rutas. La nota inicial es un punto de partida y pesa 20%; la rúbrica evolutiva usa 40% corrección/retroalimentación, 30% transferencia posterior y 10% reflexión.

**Why:** La nota debe valorar el aprendizaje a partir del error y poder subir cuando el estudiante estudia, usa la retroalimentación y corrige, sin dejar que un diagnóstico inicial bajo domine la calificación. Reconocimiento de patrones fue retirado y el usuario confirmó que debe omitirse también de estas calificaciones.

**How to apply:** Usar únicamente evidencia observable. La corrección parte de un error real y valora identificación, uso de retroalimentación y respuesta posterior correcta. La transferencia solo cuenta en una evaluación posterior a una corrección. Los componentes sin evidencia quedan pendientes y los informes muestran su cobertura; nunca se imputan como fallos.

Los perfiles diagnósticos antiguos pueden conservar `moduleResults` sin `results`; al calcular la nota académica, reconstruir la evidencia diagnóstica desde los temas de esos resultados para no perder pensamiento algebraico.

**Why:** La nota final debe seguir incluyendo las competencias de perfiles creados antes de que se persistiera el desglose detallado del diagnóstico.

**How to apply:** Preferir `diagnosticProfile.results` cuando exista; usar `moduleResults[].topics` como respaldo tanto en la vista del estudiante como en los reportes docentes.

Los temas de repaso que ya superaron el umbral diagnóstico no deben aparecer como “Pendiente” en el listado académico; deben excluirse del listado visible usando la correspondencia tema → categoría diagnóstica.

**Why:** Algunos temas, como Números Irracionales, pueden no tener evidencia de práctica porque ya fueron aprobados en el diagnóstico; mostrarlos como pendientes contradice el resultado inicial y confunde al estudiante.

**How to apply:** Al construir el resumen académico, filtrar los temas con resultado diagnóstico igual o superior al 75%; conservar los resultados diagnósticos en los agregados generales.

Cuando el estudiante tiene conexión, su nota visible debe usar el `academicSummary` consolidado por el servidor, que es también la fuente del panel docente y del PDF; el cálculo local queda solo como respaldo offline.

**Why:** La copia local y la del API habían evolucionado por separado y podían producir notas diferentes con los mismos datos aparentes; además, sincronizar XP o volver a cargar el perfil podía recalcular una nota local distinta.

**How to apply:** Cargar el resumen académico del estudiante desde el endpoint de analítica al entrar a Inicio y usar el cálculo local únicamente si la consulta falla o el estudiante no tiene backend.