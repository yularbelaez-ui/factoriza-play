import { Router } from "express";
import { db } from "@workspace/db";
import { students, exerciseResults } from "@workspace/db/schema";
import { eq, inArray, and } from "drizzle-orm";

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

// GET /api/class/:classCode/students
router.get("/class/:classCode/students", async (req, res) => {
  const { classCode } = req.params;

  const rows = await db
    .select()
    .from(students)
    .where(eq(students.classCode, classCode.toUpperCase()));

  res.json({ students: rows.map(toStudentData) });
});

// GET /api/class/:classCode/errors
router.get("/class/:classCode/errors", async (req, res) => {
  const { classCode } = req.params;

  // Get all students in class
  const classStudents = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.classCode, classCode.toUpperCase()));

  if (classStudents.length === 0) {
    res.json({ errors: [] });
    return;
  }

  const studentIds = classStudents.map((s) => s.id);

  // Get all wrong exercise results for those students
  const results = await db
    .select({ errorCategory: exerciseResults.errorCategory })
    .from(exerciseResults)
    .where(
      and(
        inArray(exerciseResults.studentId, studentIds),
        eq(exerciseResults.correct, false)
      )
    );

  const filtered = results.filter((r) => r.errorCategory);

  // Count by category
  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of filtered) {
    if (r.errorCategory) {
      counts[r.errorCategory] = (counts[r.errorCategory] ?? 0) + 1;
      total++;
    }
  }

  const errors = Object.entries(counts).map(([category, count]) => ({
    category,
    count,
    percentage: total > 0 ? ((count / total) * 100).toFixed(0) + "%" : "0%",
  }));

  errors.sort((a, b) => b.count - a.count);

  res.json({ errors });
});

// GET /api/class/:classCode/topic-stats
// Aggregates, per module/topic, the time spent, hints used and errors made
// by every student in the class — used by the teacher panel.
router.get("/class/:classCode/topic-stats", async (req, res) => {
  const { classCode } = req.params;

  const classStudents = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.classCode, classCode.toUpperCase()));

  if (classStudents.length === 0) {
    res.json({ topics: [] });
    return;
  }

  const studentIds = classStudents.map((s) => s.id);

  const results = await db
    .select({
      moduleId: exerciseResults.moduleId,
      correct: exerciseResults.correct,
      hintsUsed: exerciseResults.hintsUsed,
      durationSeconds: exerciseResults.durationSeconds,
      studentId: exerciseResults.studentId,
    })
    .from(exerciseResults)
    .where(inArray(exerciseResults.studentId, studentIds));

  type Agg = {
    moduleId: string;
    exerciseCount: number;
    errorCount: number;
    hintsUsed: number;
    totalDurationSeconds: number;
    durationSamples: number;
    studentIds: Set<number>;
  };
  const byModule = new Map<string, Agg>();

  for (const r of results) {
    if (!r.moduleId) continue;
    let agg = byModule.get(r.moduleId);
    if (!agg) {
      agg = {
        moduleId: r.moduleId,
        exerciseCount: 0,
        errorCount: 0,
        hintsUsed: 0,
        totalDurationSeconds: 0,
        durationSamples: 0,
        studentIds: new Set(),
      };
      byModule.set(r.moduleId, agg);
    }
    agg.exerciseCount += 1;
    if (!r.correct) agg.errorCount += 1;
    agg.hintsUsed += r.hintsUsed ?? 0;
    agg.studentIds.add(r.studentId);
    if (typeof r.durationSeconds === "number" && r.durationSeconds > 0) {
      agg.totalDurationSeconds += r.durationSeconds;
      agg.durationSamples += 1;
    }
  }

  const topics = Array.from(byModule.values())
    .map((agg) => ({
      moduleId: agg.moduleId,
      studentsInvolved: agg.studentIds.size,
      exerciseCount: agg.exerciseCount,
      errorCount: agg.errorCount,
      hintsUsed: agg.hintsUsed,
      avgDurationSeconds:
        agg.durationSamples > 0
          ? Math.round(agg.totalDurationSeconds / agg.durationSamples)
          : null,
      totalDurationSeconds: agg.totalDurationSeconds,
    }))
    .sort((a, b) => b.exerciseCount - a.exerciseCount);

  res.json({ topics });
});

export default router;
