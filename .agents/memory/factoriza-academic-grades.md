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