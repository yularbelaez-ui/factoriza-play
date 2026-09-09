---
name: Evidencias y reflexiones de FactorIzA-Play
description: Convención durable para guardar procedimientos fotográficos y reflexiones finales sin duplicar registros.
---

Cada foto de procedimiento debe vincularse al mismo `clientId` del resultado del ejercicio. La sincronización registra primero el resultado y luego sube la evidencia, conservando ambas operaciones en la cola si falla la red.

**Why:** La aplicación puede perder conectividad o repetir solicitudes. Un identificador distinto o una subida independiente puede dejar fotos huérfanas, duplicar XP o separar la evidencia de la respuesta que el docente revisa.

**How to apply:** Mantén la estructura de Drive `FactorIzA-Play / pseudónimo / tema / ejercicio`, evita nombres de carpeta alternativos y conserva en el panel docente el enlace asociado al intento exacto. Las reflexiones finales pertenecen al módulo y deben mostrar los tres campos pedagógicos completos.