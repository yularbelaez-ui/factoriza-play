import { Router } from "express";
import { db } from "@workspace/db";
import {
  teachers,
  classCodes,
  students,
  exerciseResults,
  evalCodes,
  moduleReflections,
  sessionReflections,
  learningSessions,
  weeklyReflections,
  xpEvents,
} from "@workspace/db/schema";
import { and, eq, count, inArray } from "drizzle-orm";

const router = Router();
const isRetiredExercise = (exerciseId: string) =>
  exerciseId.startsWith("reconocimiento-patrones-") || exerciseId.startsWith("ax2-");
const RETIRED_MODULE_IDS = new Set(["reconocimiento-patrones", "trinomio-ax2-bx-c"]);

function csvCell(value: unknown): string {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function rankName(totalXP: number): string {
  if (totalXP > 5000) return "Gran Maestro";
  if (totalXP > 3500) return "Heroico";
  if (totalXP > 2200) return "Diamante";
  if (totalXP > 1200) return "Oro";
  if (totalXP > 500) return "Plata";
  return "Bronce";
}

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

// Research export. It is scoped to a class owned by the requesting teacher
// and intentionally emits one row per student so CSV imports remain simple.
router.get("/teacher/:teacherCode/classes/:classCode/export", async (req, res) => {
  const { teacherCode, classCode } = req.params;
  const [teacher] = await db.select({ id: teachers.id }).from(teachers)
    .where(eq(teachers.teacherCode, teacherCode.trim())).limit(1);
  if (!teacher) { res.status(401).json({ error: "Código de docente inválido" }); return; }
  const [teacherClass] = await db.select({ code: classCodes.code }).from(classCodes).where(and(
    eq(classCodes.teacherId, teacher.id), eq(classCodes.code, classCode.toUpperCase()),
  )).limit(1);
  if (!teacherClass) { res.status(403).json({ error: "La clase no pertenece a este docente" }); return; }
  const classStudents = await db.select().from(students)
    .where(eq(students.classCode, classCode.toUpperCase()));
  const ids = classStudents.map((student) => student.id);
  const results = ids.length ? await db.select().from(exerciseResults).where(inArray(exerciseResults.studentId, ids)) : [];
  const modules = ids.length ? await db.select().from(moduleReflections).where(inArray(moduleReflections.studentId, ids)) : [];
  const sessions = ids.length ? await db.select().from(sessionReflections).where(inArray(sessionReflections.studentId, ids)) : [];
  const learningSessionRows = ids.length ? await db.select().from(learningSessions).where(inArray(learningSessions.studentId, ids)) : [];
  const weekly = ids.length ? await db.select().from(weeklyReflections).where(inArray(weeklyReflections.studentId, ids)) : [];
  const events = ids.length ? await db.select().from(xpEvents).where(inArray(xpEvents.studentId, ids)) : [];
  const header = [
    "student_id", "pseudonym", "class_code", "initial_profile", "final_profile",
    "initial_rank", "final_rank", "profile_history", "rank_history", "xp_total", "completed_topics", "completed_modules",
    "use_time_seconds", "attempts", "errors", "frequent_errors", "hints_used",
    "feedback_views", "module_reflections", "session_reflections", "session_duration_seconds", "weekly_reflections",
    "activity_dates", "xp_event_types", "award_dates",
    "module_reflection_content", "session_reflection_content", "weekly_reflection_content",
  ];
  const rows = classStudents.map((student) => {
    const studentResults = results.filter((result) =>
      result.studentId === student.id &&
      !isRetiredExercise(result.exerciseId) &&
      !(result.moduleId && RETIRED_MODULE_IDS.has(result.moduleId)),
    );
    const errors: Record<string, number> = {};
    for (const result of studentResults) {
      if (result.errorCategory) errors[result.errorCategory] = (errors[result.errorCategory] ?? 0) + 1;
    }
    const profile = student.diagnosticProfile as { profile?: string } | null;
    const studentModules = (student.completedModules ?? []).filter((id) => !RETIRED_MODULE_IDS.has(id));
    const studentModulesReflections = modules.filter((reflection) =>
      reflection.studentId === student.id && !RETIRED_MODULE_IDS.has(reflection.moduleId));
    const studentSessions = sessions.filter((reflection) => reflection.studentId === student.id);
    const studentLearningSessions = learningSessionRows.filter((session) =>
      session.studentId === student.id &&
      !RETIRED_MODULE_IDS.has(session.activityId) &&
      !session.activityId.includes("reconocimiento-patrones") &&
      !session.activityId.includes("ax2-bx-c"));
    const studentWeekly = weekly.filter((reflection) => reflection.studentId === student.id);
    const studentEvents = events.filter((event) => event.studentId === student.id);
    const dates = [
      ...studentResults.map((result) => result.createdAt),
      ...studentModulesReflections.map((reflection) => reflection.createdAt),
      ...studentSessions.map((reflection) => reflection.createdAt),
      ...studentLearningSessions.map((session) => session.startedAt),
      ...studentWeekly.map((reflection) => reflection.createdAt),
    ].sort((a, b) => a.getTime() - b.getTime()).map((date) => date.toISOString()).join("|");
    return [
      student.id, student.pseudonym, student.classCode,
      student.initialProfile ?? "", profile?.profile ?? "",
      student.initialRank ?? "", rankName(student.totalXP),
      student.profileHistory ?? [], student.rankHistory ?? [],
      student.totalXP,
      (student.completedTopics ?? []).filter((id) => !id.startsWith("reconocimiento-patrones") && !id.startsWith("ax2-")).join("|"),
      studentModules.join("|"),
      studentResults.reduce((sum, result) => sum + (result.durationSeconds ?? 0), 0),
      studentResults.reduce((sum, result) => sum + (result.attempts ?? 1), 0),
      studentResults.filter((result) => !result.correct).length,
      Object.entries(errors).sort(([, a], [, b]) => b - a).map(([key, value]) => `${key}:${value}`).join("|"),
      studentResults.reduce((sum, result) => sum + (result.hintsUsed ?? 0), 0),
      studentResults.reduce((sum, result) => sum + (result.feedbackViews ?? 0), 0),
      studentModulesReflections.length,
      studentSessions.length,
      studentLearningSessions.reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0),
      studentWeekly.length,
      dates,
      studentEvents.map((event) => `${event.eventType}:${event.xp}`).join("|"),
      studentEvents.map((event) => `${event.eventType}:${event.createdAt.toISOString()}`).join("|"),
      studentModulesReflections.map((reflection) => `${reflection.createdAt.toISOString()}|${reflection.moduleId}|${reflection.aspectsWorked ?? ""}|${reflection.difficulties ?? ""}|${reflection.improvementSuggestions ?? ""}`).join(" || "),
      studentSessions.map((reflection) => `${reflection.createdAt.toISOString()}|${reflection.sessionId}|${reflection.understood}|${reflection.mistakes}|${reflection.helpful}|${reflection.remainingQuestions}`).join(" || "),
      studentWeekly.map((reflection) => `${reflection.createdAt.toISOString()}|${reflection.weekStart}|${reflection.mostImportant}|${reflection.mainDifficulty}|${reflection.appHelp}|${reflection.advice}`).join(" || "),
    ].map(csvCell).join(",");
  });
  const csv = [header.map(csvCell).join(","), ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="factoriza-${classCode.toUpperCase()}-investigacion.csv"`);
  res.send(`\uFEFF${csv}`);
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
