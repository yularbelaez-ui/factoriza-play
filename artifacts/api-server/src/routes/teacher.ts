import { Router } from "express";
import { db } from "@workspace/db";
import {
  teachers,
  classCodes,
  students,
  exerciseResults,
  evalCodes,
} from "@workspace/db/schema";
import { and, eq, count } from "drizzle-orm";

const router = Router();

// GET /api/teacher/:teacherCode/classes
router.get("/teacher/:teacherCode/classes", async (req, res) => {
  const { teacherCode } = req.params;

  const teacherRow = await db
    .select()
    .from(teachers)
    .where(eq(teachers.teacherCode, teacherCode.trim()))
    .limit(1);

  if (teacherRow.length === 0) {
    res.status(401).json({ error: "Código de docente inválido" });
    return;
  }

  const teacher = teacherRow[0];

  const classes = await db
    .select()
    .from(classCodes)
    .where(eq(classCodes.teacherId, teacher.id));

  // Count students per class
  const result = await Promise.all(
    classes.map(async (c) => {
      const [{ count: studentCount }] = await db
        .select({ count: count() })
        .from(students)
        .where(eq(students.classCode, c.code));
      return {
        code: c.code,
        label: c.label,
        studentCount: Number(studentCount),
      };
    })
  );

  res.json({ classes: result });
});

// POST /api/teacher/:teacherCode/classes/:classCode/eval-code
router.post(
  "/teacher/:teacherCode/classes/:classCode/eval-code",
  async (req, res) => {
    const { teacherCode, classCode } = req.params;
    const { moduleId, code } = req.body as {
      moduleId?: string;
      code?: string;
    };

    if (!moduleId || !code) {
      res.status(400).json({ error: "moduleId and code are required" });
      return;
    }

    const teacherRow = await db
      .select()
      .from(teachers)
      .where(eq(teachers.teacherCode, teacherCode.trim()))
      .limit(1);

    if (teacherRow.length === 0) {
      res.status(401).json({ error: "Código de docente inválido" });
      return;
    }

    await db.insert(evalCodes).values({
      code: code.trim().toUpperCase(),
      moduleId,
      classCode: classCode.toUpperCase(),
    });

    res.json({
      evalCode: {
        moduleId,
        code: code.trim().toUpperCase(),
        classCode: classCode.toUpperCase(),
      },
    });
  }
);

// DELETE /api/teacher/:teacherCode/students/:studentId
router.delete(
  "/teacher/:teacherCode/students/:studentId",
  async (req, res) => {
    const { teacherCode } = req.params;
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      res.status(400).json({ error: "Invalid studentId" });
      return;
    }

    const [teacher] = await db
      .select({ id: teachers.id })
      .from(teachers)
      .where(eq(teachers.teacherCode, teacherCode.trim()))
      .limit(1);
    if (!teacher) {
      res.status(401).json({ error: "Código de docente inválido" });
      return;
    }

    const [student] = await db
      .select({ id: students.id, classCode: students.classCode })
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);
    if (!student) {
      res.status(404).json({ error: "Estudiante no encontrado" });
      return;
    }

    const [teacherClass] = await db
      .select({ code: classCodes.code })
      .from(classCodes)
      .where(
        and(
          eq(classCodes.teacherId, teacher.id),
          eq(classCodes.code, student.classCode)
        )
      )
      .limit(1);
    if (!teacherClass) {
      res.status(403).json({ error: "El estudiante no pertenece a tus clases" });
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(exerciseResults)
        .where(eq(exerciseResults.studentId, studentId));
      await tx.delete(students).where(eq(students.id, studentId));
    });

    res.json({ deleted: true, studentId });
  }
);

export default router;
