import { Router } from "express";
import { db } from "@workspace/db";
import { students, exerciseResults } from "@workspace/db/schema";
import { eq, sql, and } from "drizzle-orm";

const router = Router();

function toStudentData(s: typeof students.$inferSelect) {
  return {
    id: s.id,
    pseudonym: s.pseudonym,
    classCode: s.classCode,
    totalXP: s.totalXP,
    streak: s.streak,
    completedTopics: s.completedTopics ?? [],
    completedModules: s.completedModules ?? [],
    completedExercises: s.completedExercises ?? [],
    diagnosticProfile: s.diagnosticProfile ?? null,
  };
}

// GET /api/students/:studentId
router.get("/students/:studentId", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  if (isNaN(studentId)) {
    res.status(400).json({ error: "Invalid studentId" });
    return;
  }

  const rows = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json({ student: toStudentData(rows[0]) });
});

// POST /api/students/:studentId/exercise
router.post("/students/:studentId/exercise", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  if (isNaN(studentId)) {
    res.status(400).json({ error: "Invalid studentId" });
    return;
  }

  const {
    exerciseId,
    moduleId,
    correct,
    errorCategory,
    attempts,
    answer,
    hintsUsed,
    durationSeconds,
    clientId,
  } = req.body as {
    exerciseId: string;
    moduleId?: string | null;
    correct: boolean;
    errorCategory?: string | null;
    attempts?: number;
    answer?: string | null;
    hintsUsed?: number;
    durationSeconds?: number | null;
    clientId?: string | null;
  };

  const rows = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const student = rows[0];

  // Idempotency guard: if this exact client submission was already recorded
  // (e.g. a retried sync whose earlier response was lost), skip re-applying XP.
  if (clientId) {
    const existing = await db
      .select({ id: exerciseResults.id })
      .from(exerciseResults)
      .where(
        and(
          eq(exerciseResults.studentId, studentId),
          eq(exerciseResults.clientId, clientId)
        )
      )
      .limit(1);
    if (existing.length > 0) {
      res.json({ student: toStudentData(student) });
      return;
    }
  }

  // Record exercise result
  await db.insert(exerciseResults).values({
    studentId,
    exerciseId,
    moduleId: moduleId ?? null,
    correct,
    errorCategory: errorCategory ?? null,
    attempts: attempts ?? 1,
    answer: answer ?? null,
    hintsUsed: hintsUsed ?? 0,
    durationSeconds: durationSeconds ?? null,
    clientId: clientId ?? null,
  });

  // Update student XP, streak, completedExercises
  const xpGain = correct ? 20 : 3;
  const alreadyCompleted = (student.completedExercises ?? []).includes(
    exerciseId
  );
  const newCompletedExercises =
    correct && !alreadyCompleted
      ? [...(student.completedExercises ?? []), exerciseId]
      : (student.completedExercises ?? []);

  const newStreak = correct ? student.streak + 1 : 0;

  const [updated] = await db
    .update(students)
    .set({
      totalXP: sql`${students.totalXP} + ${xpGain}`,
      streak: newStreak,
      completedExercises: newCompletedExercises,
    })
    .where(eq(students.id, studentId))
    .returning();

  res.json({ student: toStudentData(updated) });
});

// POST /api/students/:studentId/topics
router.post("/students/:studentId/topics", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  if (isNaN(studentId)) {
    res.status(400).json({ error: "Invalid studentId" });
    return;
  }

  const { topicId } = req.body as { topicId: string };

  const rows = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const student = rows[0];
  const alreadyDone = (student.completedTopics ?? []).includes(topicId);
  if (alreadyDone) {
    res.json({ student: toStudentData(student) });
    return;
  }

  const [updated] = await db
    .update(students)
    .set({
      completedTopics: [...(student.completedTopics ?? []), topicId],
    })
    .where(eq(students.id, studentId))
    .returning();

  res.json({ student: toStudentData(updated) });
});

// POST /api/students/:studentId/modules
router.post("/students/:studentId/modules", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const { moduleId } = req.body as { moduleId?: string };
  if (isNaN(studentId) || !moduleId?.trim()) {
    res.status(400).json({ error: "studentId and moduleId are required" });
    return;
  }

  const rows = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const student = rows[0];
  const completedModules = student.completedModules ?? [];
  if (completedModules.includes(moduleId)) {
    res.json({ student: toStudentData(student) });
    return;
  }

  const [updated] = await db
    .update(students)
    .set({ completedModules: [...completedModules, moduleId] })
    .where(eq(students.id, studentId))
    .returning();
  res.json({ student: toStudentData(updated) });
});

// POST /api/students/:studentId/diagnostic
router.post("/students/:studentId/diagnostic", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const { diagnosticProfile } = req.body as { diagnosticProfile?: Record<string, unknown> };
  if (isNaN(studentId) || !diagnosticProfile || typeof diagnosticProfile !== "object") {
    res.status(400).json({ error: "Valid studentId and diagnosticProfile are required" });
    return;
  }

  const [updated] = await db
    .update(students)
    .set({ diagnosticProfile })
    .where(eq(students.id, studentId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json({ student: toStudentData(updated) });
});

export default router;
