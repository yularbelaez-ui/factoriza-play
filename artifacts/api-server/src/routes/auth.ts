import { Router } from "express";
import { db } from "@workspace/db";
import { teachers, classCodes, students } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// POST /api/auth/student
router.post("/auth/student", async (req, res) => {
  const { pseudonym, classCode } = req.body as {
    pseudonym?: string;
    classCode?: string;
  };

  if (!pseudonym || !classCode) {
    res.status(400).json({ error: "pseudonym and classCode are required" });
    return;
  }

  const normalizedCode = classCode.trim().toUpperCase();
  const normalizedPseudonym = pseudonym.trim();

  // Verify class code exists
  const classRow = await db
    .select()
    .from(classCodes)
    .where(eq(classCodes.code, normalizedCode))
    .limit(1);

  if (classRow.length === 0) {
    res.status(400).json({ error: "Código de clase inválido" });
    return;
  }

  // Find or create student
  let studentRow = await db
    .select()
    .from(students)
    .where(
      and(
        eq(students.pseudonym, normalizedPseudonym),
        eq(students.classCode, normalizedCode)
      )
    )
    .limit(1);

  if (studentRow.length === 0) {
    const [newStudent] = await db
      .insert(students)
      .values({
        pseudonym: normalizedPseudonym,
        classCode: normalizedCode,
        totalXP: 0,
        streak: 0,
        completedTopics: [],
        completedModules: [],
        completedExercises: [],
      })
      .returning();
    studentRow = [newStudent];
  }

  const s = studentRow[0];
  res.json({
    studentId: s.id,
    student: {
      id: s.id,
      pseudonym: s.pseudonym,
      classCode: s.classCode,
      totalXP: s.totalXP,
      streak: s.streak,
      completedTopics: s.completedTopics ?? [],
      completedModules: s.completedModules ?? [],
      completedExercises: s.completedExercises ?? [],
      diagnosticProfile: s.diagnosticProfile ?? null,
    },
  });
});

// POST /api/auth/teacher
router.post("/auth/teacher", async (req, res) => {
  const { teacherCode } = req.body as { teacherCode?: string };

  if (!teacherCode) {
    res.status(401).json({ error: "teacherCode is required" });
    return;
  }

  const normalized = teacherCode.trim();
  const teacherRow = await db
    .select()
    .from(teachers)
    .where(eq(teachers.teacherCode, normalized))
    .limit(1);

  if (teacherRow.length === 0) {
    res.status(401).json({ error: "Código de docente inválido" });
    return;
  }

  const t = teacherRow[0];
  res.json({ teacherId: t.id, teacherCode: t.teacherCode });
});

export default router;
