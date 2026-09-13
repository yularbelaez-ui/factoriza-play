---
name: FactorIzA-Play racha diaria
description: Regla de negocio y zona horaria usadas para validar días de racha mediante XP
---

La racha de estudiante cuenta días cumplidos, no respuestas correctas consecutivas: un día solo se acredita cuando el estudiante acumula al menos 200 XP. La fecha diaria se interpreta en la zona horaria `America/Bogota`; los XP adicionales del mismo día no incrementan otra vez la racha.

**Why:** la racha anterior se incrementaba por cada respuesta correcta y podía mostrar progreso aunque el estudiante no hubiera alcanzado una meta diaria verificable.

**How to apply:** toda nueva fuente de XP debe actualizar el acumulado diario y pasar por la misma validación de 200 XP; las sincronizaciones reintentadas deben conservar idempotencia y no duplicar días.