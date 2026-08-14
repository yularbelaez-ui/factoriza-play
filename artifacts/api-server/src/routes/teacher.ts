import { Router } from "express";
import { db } from "@workspace/db";
import { teachers, classCodes, students, evalCodes } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

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

export default router;
