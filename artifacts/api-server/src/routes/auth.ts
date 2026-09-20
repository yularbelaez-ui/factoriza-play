import { Router } from "express";
import { db } from "@workspace/db";
import { teachers, classCodes, students, exerciseResults, xpEvents } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";

const router = Router();
const BOGOTA_TIME_ZONE = "America/Bogota";

function bogotaDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BOGOTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isPrerequisiteExercise(moduleId?: string | null): boolean {
  return moduleId?.startsWith("support:") ?? false;
}

function prerequisiteExerciseXp(result: {
  moduleId?: string | null;
  correct: boolean;
  attempts: number;
}): number {
  if (!isPrerequisiteExercise(result.moduleId)) return 0;
  return result.correct ? (result.attempts <= 1 ? 10 : 5) : 0;
}

async function reconcileLegacyPrerequisiteXp(studentId: number) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM students WHERE id = ${studentId} FOR UPDATE`);
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) return null;

    const results = await tx.select({
      clientId: exerciseResults.clientId,
      moduleId: exerciseResults.moduleId,
      correct: exerciseResults.correct,
      attempts: exerciseResults.attempts,
      exerciseId: exerciseResults.exerciseId,
    }).from(exerciseResults).where(eq(exerciseResults.studentId, studentId));
    const events = await tx.select().from(xpEvents).where(eq(xpEvents.studentId, studentId));
    const resultByClientId = new Map(
      results.filter((result) => result.clientId).map((result) => [result.clientId!, result]),
    );
    const prerequisiteExerciseIds = new Set(
      results.filter((result) => isPrerequisiteExercise(result.moduleId)).map((result) => result.exerciseId),
    );
    const today = bogotaDate(new Date());
    let totalXP = 0;
    let dailyXP = 0;

    for (const event of events) {
      const exercise = event.eventType === "exercise"
        ? resultByClientId.get(event.sourceId)
        : undefined;
      const isPrerequisiteHint =
        event.eventType === "hint" &&
        [...prerequisiteExerciseIds].some((exerciseId) => event.sourceId.startsWith(`${exerciseId}:`));
      const correctedXp = exercise
        ? prerequisiteExerciseXp(exercise)
        : isPrerequisiteHint ? 0 : event.xp;

      if (correctedXp !== event.xp) {
        await tx.update(xpEvents).set({ xp: correctedXp }).where(eq(xpEvents.id, event.id));
      }
      totalXP += correctedXp;
      if (bogotaDate(event.createdAt) === today) dailyXP += correctedXp;
    }

    const [updated] = await tx.update(students).set({
      totalXP,
      dailyXP,
      dailyXPDate: today,
    }).where(eq(students.id, studentId)).returning();
    return updated;
  });
}

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
  const normalizedPseudonym = pseudonym.trim().replace(/\s+/g, " ");

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

  // Only a teacher can register a student profile. Student login must never
  // create a new record from an arbitrary pseudonym.
  const studentRow = await db
    .select()
    .from(students)
    .where(
      and(
        sql`lower(${students.pseudonym}) = lower(${normalizedPseudonym})`,
        eq(students.classCode, normalizedCode),
      )
    )
    .limit(1);

  if (studentRow.length === 0) {
    res.status(404).json({
      error: "Ese pseudónimo no está registrado por tu docente.",
    });
    return;
  }

  const reconciled = await reconcileLegacyPrerequisiteXp(studentRow[0].id);
  const s = reconciled ?? studentRow[0];
  res.json({
    studentId: s.id,
    student: {
      id: s.id,
      pseudonym: s.pseudonym,
      classCode: s.classCode,
      totalXP: s.totalXP,
      streak: s.streakLastDate ? s.streak : 0,
      dailyXP: s.dailyXP ?? 0,
      dailyXPDate: s.dailyXPDate,
      streakLastDate: s.streakLastDate,
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
