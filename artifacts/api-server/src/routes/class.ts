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

export default router;
