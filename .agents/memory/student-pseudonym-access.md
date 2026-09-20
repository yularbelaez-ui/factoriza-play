---
name: Registro de pseudónimos de estudiantes
description: Regla de acceso que vincula la creación de perfiles estudiantes con el panel docente
---

El pseudónimo de estudiante no es un mecanismo de auto-registro. Solo se puede usar para entrar después de que el docente lo haya creado para una clase que le pertenece.

**Why:** Permitir que el login cree perfiles con cualquier texto permitía que una persona con el código de clase inventara perfiles y entrara a la comunidad o al panel como un estudiante no registrado.

**How to apply:** Mantener la validación en el API además de la interfaz. Comparar pseudónimos sin distinguir mayúsculas/minúsculas y devolver un error explícito cuando no exista; el panel docente es la única vía de creación.