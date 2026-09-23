import { Router } from "express";
import { db } from "@workspace/db";
import {
  students,
  exerciseResults,
  moduleReflections,
  sessionReflections,
  weeklyReflections,
  xpEvents,
  learningSessions,
  evalCodes,
} from "@workspace/db/schema";
import { eq, sql, and, desc, gt, like, inArray } from "drizzle-orm";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router = Router();
const connectors = new ReplitConnectors();
const RETIRED_MODULE_IDS = new Set(["trinomio-ax2-bx-c"]);
const ACTIVE_MODULE_IDS = [
  "reconocimiento-patrones",
  "factor-comun", "agrupacion-terminos", "trinomio-cuadrado-perfecto",
  "diferencia-cuadrados", "trinomio-forma-x2-bx-c", "cubo-binomio",
  "suma-diferencia-cubos",
];
const ACTIVE_TOPIC_IDS = [
  "s1-naturales", "s1-decimales", "s1-enteros", "s1-racionales",
  "s1-irracionales", "s1-reales", "s1-potencias", "s1-factores",
  "s2-diferencia", "s2-notacion", "s2-signos", "s2-expresion",
  "s2-grado", "s2-clasificacion", "s2-orden", "s2-semejantes",
  "s3-suma-resta", "s3-agrupacion", "s3-multiplicacion", "s3-division",
  "s3-productos", "s3-cuadrado-diferencia", "s3-suma-diferencia", "s3-cubo",
];
const PERSONALIZED_ROUTE_TOPIC_IDS: Record<string, string[]> = {
  "ruta:aritmetica": [
    "s1-naturales", "s1-decimales", "s1-enteros", "s1-irracionales",
    "s1-reales", "s1-racionales", "s1-potencias", "s1-factores",
  ],
  "ruta:algebra": [
    "s2-notacion", "s2-grado", "s2-expresion", "s2-clasificacion", "s2-semejantes",
  ],
  "ruta:patrones": ["s3-suma-resta", "s3-multiplicacion", "s3-division", "s3-productos"],
};
const isValidActivity = (activityId: string) =>
  activityId === "diagnostico" ||
  ACTIVE_MODULE_IDS.includes(activityId) ||
  ACTIVE_TOPIC_IDS.includes(activityId) ||
  Object.prototype.hasOwnProperty.call(PERSONALIZED_ROUTE_TOPIC_IDS, activityId) ||
  (activityId.startsWith("evaluacion:") && ACTIVE_MODULE_IDS.includes(activityId.slice("evaluacion:".length)));
const isRetiredExercise = (exerciseId: string) =>
  exerciseId.startsWith("ax2-");
const isPrerequisiteExercise = (moduleId: unknown, exerciseId?: string) =>
  (typeof moduleId === "string" && moduleId.startsWith("support:")) ||
  (typeof exerciseId === "string" && /^(s1|s2|s3)-/.test(exerciseId));
const isRetiredTopic = (topicId: string) =>
  topicId.startsWith("ax2-");
const isFactorizationModuleComplete = (moduleId: string, completedModules: string[]) =>
  completedModules.includes(moduleId) ||
  (moduleId === "reconocimiento-patrones" &&
    completedModules.some((completedId) =>
      completedId !== "reconocimiento-patrones" && ACTIVE_MODULE_IDS.includes(completedId),
    ));

const RANKS = [
  { name: "Bronce", icon: "🥉", min: 0, max: 500 },
  { name: "Plata", icon: "🥈", min: 501, max: 1200 },
  { name: "Oro", icon: "🥇", min: 1201, max: 2200 },
  { name: "Diamante", icon: "💎", min: 2201, max: 3500 },
  { name: "Heroico", icon: "🔥", min: 3501, max: 5000 },
  { name: "Gran Maestro", icon: "👑", min: 5001, max: null },
] as const;

const DAILY_STREAK_XP = 200;
const BOGOTA_TIME_ZONE = "America/Bogota";

function rankForXp(totalXP: number) {
  const rank = [...RANKS].reverse().find((candidate) => totalXP >= candidate.min) ?? RANKS[0];
  const next = RANKS[RANKS.indexOf(rank) + 1];
  return {
    name: rank.name,
    icon: rank.icon,
    minXP: rank.min,
    maxXP: rank.max,
    nextName: next?.name ?? null,
    nextIcon: next?.icon ?? null,
    nextXP: next?.min ?? null,
    progressPercent: next
      ? Math.min(100, Math.round(((totalXP - rank.min) / (next.min - rank.min)) * 100))
      : 100,
  };
}

function bogotaDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BOGOTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function previousDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function dailyProgressForXp(
  student: typeof students.$inferSelect,
  awardXp: number,
  now = new Date(),
) {
  const today = bogotaDate(now);
  const sameDay = student.dailyXPDate === today;
  const previousDailyXP = sameDay ? (student.dailyXP ?? 0) : 0;
  const dailyXP = previousDailyXP + awardXp;
  // Profiles created before the daily-goal rule may have a legacy streak
  // based on consecutive correct answers. Only a dated daily qualification
  // is valid for the new streak.
  let streak = student.streakLastDate ? (student.streak ?? 0) : 0;
  let streakLastDate = student.streakLastDate ?? null;

  if (
    dailyXP >= DAILY_STREAK_XP &&
    previousDailyXP < DAILY_STREAK_XP
  ) {
    streak = streakLastDate === previousDate(today) ? streak + 1 : 1;
    streakLastDate = today;
  }

  return {
    streak,
    dailyXP,
    dailyXPDate: today,
    streakLastDate,
  };
}

function nextRankHistory(student: typeof students.$inferSelect, projectedXP: number) {
  const previous = rankForXp(student.totalXP).name;
  const next = rankForXp(projectedXP).name;
  return next === previous
    ? (student.rankHistory ?? [])
    : [
        ...(student.rankHistory ?? []),
        { rank: next, xp: projectedXP, at: new Date().toISOString() },
      ];
}

function bogotaWeekStart(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const local = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12));
  const day = local.getUTCDay();
  local.setUTCDate(local.getUTCDate() - (day === 0 ? 6 : day - 1));
  return local.toISOString().slice(0, 10);
}

function derivedBadges(student: typeof students.$inferSelect) {
  const badges: { id: string; label: string; icon: string }[] = [];
  if ((student.completedExercises ?? []).length >= 10) {
    badges.push({ id: "persistente", label: "Persistente", icon: "⚡" });
  }
  if (ACTIVE_MODULE_IDS.every((moduleId) => (student.completedModules ?? []).includes(moduleId))) {
    badges.push({ id: "maestro-factorizacion", label: "Maestro de Factorización", icon: "🏆" });
  }
  const patternCompetency = (student.diagnosticProfile?.competencyResults as Array<{ competency?: string; meetsThreshold?: boolean }> | undefined)
    ?.find((result) => result.competency === "patrones");
  if (patternCompetency?.meetsThreshold === true) {
    badges.push({ id: "observador-patrones", label: "Observador de Patrones", icon: "🔍" });
  }
  return badges;
}

type DriveFile = { id: string; name: string; webViewLink?: string };

function safeDriveFilePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "estudiante";
}

function evidenceFileName(pseudonym: string, exerciseId: string, mimeType: string): string {
  const exerciseNumber = exerciseId.match(/(\d+)(?!.*\d)/)?.[1] ?? safeDriveFilePart(exerciseId);
  const extension = mimeType === "image/png" ? "png" : "jpg";
  return `${safeDriveFilePart(pseudonym)}-ejercicio-${exerciseNumber}.${extension}`;
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function driveJson(path: string, init?: RequestInit): Promise<any> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await connectors.proxy("google-drive", path, init);
    const responseText = await response.text();

    if (response.ok) {
      try {
        return JSON.parse(responseText);
      } catch {
        throw new Error("Google Drive devolvió una respuesta inválida");
      }
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < maxAttempts) {
      await wait(300 * 2 ** (attempt - 1));
      continue;
    }

    let providerMessage = responseText.slice(0, 500);
    try {
      const parsed = JSON.parse(responseText) as {
        error?: { message?: string } | string;
        message?: string;
      };
      providerMessage =
        typeof parsed.error === "string"
          ? parsed.error
          : parsed.error?.message ?? parsed.message ?? providerMessage;
    } catch {
      // Use the bounded text response when the provider did not return JSON.
    }

    throw new Error(
      `Google Drive API error (${response.status})${providerMessage ? `: ${providerMessage}` : ""}`
    );
  }

  throw new Error("Google Drive upload failed after retries");
}

async function findOrCreateDriveFolder(name: string, parentId?: string): Promise<string> {
  const escaped = name.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const parent = parentId ? `'${parentId}' in parents and ` : "";
  const query = encodeURIComponent(`${parent}name='${escaped}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const found = await driveJson(`/drive/v3/files?q=${query}&fields=files(id,name)`);
  if (found.files?.[0]?.id) return found.files[0].id;
  const created = await driveJson("/drive/v3/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name, mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  return created.id;
}

async function uploadDriveEvidence(
  bytes: Buffer, name: string, mimeType: string, folderPath: string[]
): Promise<DriveFile> {
  let parentId: string | undefined;
  for (const folder of folderPath) parentId = await findOrCreateDriveFolder(folder, parentId);
  const boundary = `factoriza_${Date.now()}`;
  const metadata = JSON.stringify({ name, mimeType, parents: [parentId] });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    bytes,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  return driveJson("/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
}

function toStudentData(s: typeof students.$inferSelect) {
  const storedProfile = s.diagnosticProfile as Record<string, unknown> | null | undefined;
  const diagnosticProfile = storedProfile?.profile === "C" && storedProfile.route === "ruta-3"
    ? { ...storedProfile, route: "ruta-4" }
    : storedProfile;
  return {
    id: s.id,
    pseudonym: s.pseudonym,
    classCode: s.classCode,
    totalXP: s.totalXP,
    streak: s.streakLastDate ? s.streak : 0,
    dailyXP: s.dailyXP ?? 0,
    dailyXPDate: s.dailyXPDate,
    streakLastDate: s.streakLastDate,
    rank: rankForXp(s.totalXP),
    badges: derivedBadges(s),
    completedTopics: (s.completedTopics ?? []).filter((id) => !isRetiredTopic(id)),
    completedModules: (s.completedModules ?? []).filter((id) => !RETIRED_MODULE_IDS.has(id)),
    completedExercises: (s.completedExercises ?? []).filter((id) => !isRetiredExercise(id)),
    completedEvaluations: s.completedEvaluations ?? [],
    diagnosticProfile: diagnosticProfile ?? null,
    initialProfile: s.initialProfile,
    initialRank: s.initialRank,
    profileHistory: s.profileHistory ?? [],
    rankHistory: s.rankHistory ?? [],
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

// A code is only activated after the student enters it. The server scopes the
// lookup to the student's class so a code from another group cannot unlock it.
router.post("/students/:studentId/evaluation-code", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const code = typeof req.body?.code === "string" ? req.body.code.trim().toUpperCase() : "";
  if (!Number.isInteger(studentId) || !code) {
    res.status(400).json({ error: "studentId y code son obligatorios" });
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

  const [evaluation] = await db
    .select({
      moduleId: evalCodes.moduleId,
      code: evalCodes.code,
    })
    .from(evalCodes)
    .where(and(
      eq(evalCodes.classCode, student.classCode),
      eq(evalCodes.code, code),
    ))
    .limit(1);
  if (!evaluation) {
    res.status(404).json({ error: "Código de evaluación incorrecto o no activo" });
    return;
  }

  res.json({ evaluation });
});

// A student can submit each module evaluation only once.
router.post("/students/:studentId/evaluation-complete", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const moduleId = typeof req.body?.moduleId === "string" ? req.body.moduleId.trim() : "";
  if (!Number.isInteger(studentId) || !moduleId) {
    res.status(400).json({ error: "studentId y moduleId son obligatorios" });
    return;
  }
  if (!ACTIVE_MODULE_IDS.includes(moduleId)) {
    res.status(400).json({ error: "Caso de evaluación no válido" });
    return;
  }

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!student) {
    res.status(404).json({ error: "Estudiante no encontrado" });
    return;
  }

  const completedEvaluations = student.completedEvaluations ?? [];
  if (completedEvaluations.includes(moduleId)) {
    res.json({ student: toStudentData(student), alreadyCompleted: true });
    return;
  }

  const [updated] = await db
    .update(students)
    .set({ completedEvaluations: [...completedEvaluations, moduleId] })
    .where(eq(students.id, studentId))
    .returning();
  res.json({ student: toStudentData(updated), alreadyCompleted: false });
});

// Opens one server-owned lifecycle session. A stable clientId makes retries
// return the same session instead of creating timestamp-farmed XP opportunities.
router.post("/students/:studentId/sessions", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const { activityId, clientId } = req.body as { activityId?: string; clientId?: string };
  if (!Number.isInteger(studentId) || !activityId?.trim() || !clientId?.trim()) {
    res.status(400).json({ error: "activityId y clientId son obligatorios" });
    return;
  }
  if (!isValidActivity(activityId.trim()) || RETIRED_MODULE_IDS.has(activityId.trim())) {
    res.status(410).json({ error: "Esta actividad no está disponible" });
    return;
  }
  const [student] = await db.select({ id: students.id }).from(students)
    .where(eq(students.id, studentId)).limit(1);
  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  const open = await db.select().from(learningSessions).where(and(
    eq(learningSessions.studentId, studentId),
    eq(learningSessions.activityId, activityId.trim()),
    eq(learningSessions.status, "open"),
  )).orderBy(desc(learningSessions.startedAt)).limit(1);
  if (open[0]) { res.json({ session: open[0] }); return; }
  const inserted = await db.insert(learningSessions).values({
    studentId, activityId: activityId.trim(), clientId: clientId.trim(),
  }).onConflictDoNothing().returning();
  const session = inserted[0] ?? (await db.select().from(learningSessions).where(and(
    eq(learningSessions.studentId, studentId), eq(learningSessions.clientId, clientId.trim()),
  )).limit(1))[0];
  res.status(inserted[0] ? 201 : 200).json({ session });
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
    feedbackViewed,
    durationSeconds,
    clientId,
    questionText,
    topicName,
    correctAnswer,
  } = req.body as {
    exerciseId: string;
    moduleId?: string | null;
    correct: boolean;
    errorCategory?: string | null;
    attempts?: number;
    answer?: string | null;
    hintsUsed?: number;
    feedbackViewed?: boolean;
    durationSeconds?: number | null;
    clientId?: string | null;
    questionText?: string | null;
    topicName?: string | null;
    correctAnswer?: string | null;
  };
  if (!exerciseId || !clientId?.trim() || typeof correct !== "boolean") {
    res.status(400).json({ error: "exerciseId, correct and clientId are required" });
    return;
  }
  if (isRetiredExercise(exerciseId) || (moduleId && RETIRED_MODULE_IDS.has(moduleId))) {
    res.status(410).json({ error: "Este ejercicio fue retirado" });
    return;
  }

  try {
    const updated = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM students WHERE id = ${studentId} FOR UPDATE`);
      const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
      if (!student) throw new Error("STUDENT_NOT_FOUND");
      const existing = await tx.select().from(exerciseResults).where(and(
        eq(exerciseResults.studentId, studentId),
        eq(exerciseResults.clientId, clientId.trim()),
      )).limit(1);
      if (existing[0]) return student;
      const safeAttempts = Number.isFinite(attempts)
        ? Math.max(1, Math.min(100, Math.floor(attempts as number))) : 1;
      const safeHints = Number.isFinite(hintsUsed)
        ? Math.max(0, Math.min(100, Math.floor(hintsUsed as number))) : 0;
      await tx.insert(exerciseResults).values({
        studentId, exerciseId, moduleId: moduleId ?? null, correct,
        errorCategory: errorCategory ?? null, attempts: safeAttempts,
        answer: answer ?? null, hintsUsed: safeHints,
        feedbackViews: feedbackViewed ? 1 : 0,
        durationSeconds: durationSeconds ?? null, clientId: clientId.trim(),
        questionText: questionText ?? null, topicName: topicName ?? null,
        correctAnswer: correctAnswer ?? null,
      });
      const prerequisiteExercise = isPrerequisiteExercise(moduleId, exerciseId);
      const exerciseBase = prerequisiteExercise
        ? (correct ? (safeAttempts <= 1 ? 10 : 5) : 0)
        : correct
          ? safeAttempts <= 1 ? 25 : safeAttempts === 2 ? 20 : safeAttempts === 3 ? 15 : 10
          : 5;
      const correctionBonus = !prerequisiteExercise && correct && safeAttempts > 1 ? 15 : 0;
      const hintEvents = correct
        ? await tx.select({ id: xpEvents.id }).from(xpEvents).where(and(
            eq(xpEvents.studentId, studentId),
            eq(xpEvents.eventType, "hint"),
            like(xpEvents.sourceId, `${exerciseId}:%`),
          ))
        : [];
      const hintBonus = !prerequisiteExercise && correct && hintEvents.length > 0 ? 10 : 0;
      const xpGain = exerciseBase + correctionBonus + hintBonus;
      const alreadyCompleted = (student.completedExercises ?? []).includes(exerciseId);
      const newCompletedExercises = correct && !alreadyCompleted
        ? [...(student.completedExercises ?? []), exerciseId]
        : (student.completedExercises ?? []);
      const priorErrors = correct
        ? (await tx.select({ id: exerciseResults.id }).from(exerciseResults).where(and(
            eq(exerciseResults.studentId, studentId),
            eq(exerciseResults.exerciseId, exerciseId),
            eq(exerciseResults.correct, false),
          ))).length
        : 0;
      const persistenceAchievement = priorErrors >= 2
        ? { sourceId: `persistence:${clientId.trim()}`, xp: 20 } : null;
      const priorCorrections = correct && safeAttempts > 1
        ? (await tx.select({ id: exerciseResults.id }).from(exerciseResults).where(and(
            eq(exerciseResults.studentId, studentId),
            eq(exerciseResults.correct, true),
            gt(exerciseResults.attempts, 1),
          ))).length
        : 0;
      const correctionAchievement = priorCorrections + 1 === 10
        ? { sourceId: "corrections-10", xp: 50 } : null;
      const baseAwardXp = xpGain + (correctionAchievement?.xp ?? 0) + (persistenceAchievement?.xp ?? 0);
      const streakPreview = dailyProgressForXp(student, baseAwardXp);
      const streakAchievement = correct && streakPreview.streak === 5
        ? { sourceId: "streak-5", xp: 30 }
        : correct && streakPreview.streak === 10 ? { sourceId: "streak-10", xp: 50 } : null;
      const [achievementEvent] = streakAchievement
        ? await tx.insert(xpEvents).values({
            studentId, eventType: "achievement", sourceId: streakAchievement.sourceId, xp: streakAchievement.xp,
          }).onConflictDoNothing().returning()
        : [undefined];
      const feedbackEvent = undefined;
      const [correctionEvent] = correctionAchievement
        ? await tx.insert(xpEvents).values({
            studentId, eventType: "achievement", sourceId: correctionAchievement.sourceId,
            xp: correctionAchievement.xp,
          }).onConflictDoNothing().returning()
        : [undefined];
      const [persistenceEvent] = persistenceAchievement
        ? await tx.insert(xpEvents).values({
            studentId, eventType: "achievement", sourceId: persistenceAchievement.sourceId,
            xp: persistenceAchievement.xp,
          }).onConflictDoNothing().returning()
        : [undefined];
      const [event] = await tx.insert(xpEvents).values({
        studentId, eventType: "exercise", sourceId: clientId.trim(), xp: xpGain,
      }).onConflictDoNothing().returning();
      const totalAwardXp = (event?.xp ?? 0) + (achievementEvent?.xp ?? 0) +
        (correctionEvent?.xp ?? 0) + (persistenceEvent?.xp ?? 0);
      const dailyProgress = dailyProgressForXp(student, totalAwardXp);
      const [next] = await tx.update(students).set({
        ...(event ? {
          totalXP: sql`${students.totalXP} + ${totalAwardXp}`,
          rankHistory: nextRankHistory(
            student,
            student.totalXP + totalAwardXp,
          ),
          ...dailyProgress,
        } : {}),
        completedExercises: newCompletedExercises,
      }).where(eq(students.id, studentId)).returning();
      return next;
    });
    res.json({ student: toStudentData(updated) });
  } catch (error) {
    if (error instanceof Error && error.message === "STUDENT_NOT_FOUND") {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.status(409).json({ error: "No se pudo registrar el ejercicio de forma idempotente." });
  }
});

// POST /api/students/:studentId/reflection
router.post("/students/:studentId/reflection", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const { moduleId, aspectsWorked, difficulties, improvementSuggestions, clientId } =
    req.body as Record<string, unknown>;
  if (!Number.isInteger(studentId) || typeof moduleId !== "string" ||
      !moduleId.trim() || typeof clientId !== "string" || !clientId.trim()) {
    res.status(400).json({ error: "studentId, moduleId and clientId are required" });
    return;
  }
  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  const existing = await db.select().from(moduleReflections).where(and(
    eq(moduleReflections.studentId, studentId), eq(moduleReflections.moduleId, moduleId),
    eq(moduleReflections.clientId, clientId.trim()),
  )).limit(1);
  if (existing[0]) { res.json({ reflection: existing[0] }); return; }
  const [reflection] = await db.insert(moduleReflections).values({
    studentId, moduleId: moduleId.trim(), clientId: clientId.trim(),
    aspectsWorked: typeof aspectsWorked === "string" ? aspectsWorked : null,
    difficulties: typeof difficulties === "string" ? difficulties : null,
    improvementSuggestions: typeof improvementSuggestions === "string" ? improvementSuggestions : null,
  }).returning();
  res.status(201).json({ reflection });
});

function requiredText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// Required reflection at the end of every working session.
router.post("/students/:studentId/session-reflection", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const { sessionId, understood, mistakes, helpful, remainingQuestions, clientId } =
    req.body as Record<string, unknown>;
  const numericSessionId = Number.parseInt(typeof sessionId === "string" ? sessionId : "", 10);
  if (!Number.isInteger(studentId) || !Number.isInteger(numericSessionId) ||
      !requiredText(understood) || !requiredText(mistakes) ||
      !requiredText(helpful) || !requiredText(remainingQuestions) ||
      !requiredText(clientId)) {
    res.status(400).json({ error: "La reflexión de sesión requiere completar todos los campos." });
    return;
  }
  try {
    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT id FROM students WHERE id = ${studentId} FOR UPDATE`);
      const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
      if (!student) throw new Error("STUDENT_NOT_FOUND");
      const [session] = await tx.select().from(learningSessions).where(and(
        eq(learningSessions.id, numericSessionId),
        eq(learningSessions.studentId, studentId),
      )).limit(1);
      if (!session) throw new Error("SESSION_NOT_FOUND");
      if (session.status !== "open") {
        const [existing] = await tx.select().from(sessionReflections).where(and(
          eq(sessionReflections.studentId, studentId),
          eq(sessionReflections.sessionId, String(numericSessionId)),
        )).limit(1);
        if (existing) return { reflection: existing, student, duplicate: true };
        throw new Error("SESSION_ALREADY_CLOSED");
      }
      const routeTopicIds = PERSONALIZED_ROUTE_TOPIC_IDS[session.activityId];
      const workRows = session.activityId === "diagnostico"
        ? (student.diagnosticProfile ? [{ id: 1 }] : [])
        : routeTopicIds
          ? await tx.select({ id: exerciseResults.id }).from(exerciseResults).where(and(
              eq(exerciseResults.studentId, studentId),
              inArray(exerciseResults.moduleId, routeTopicIds.map((topicId) => `support:${topicId}`)),
            )).limit(1)
          : await tx.select({ id: exerciseResults.id }).from(exerciseResults).where(and(
              eq(exerciseResults.studentId, studentId),
              eq(exerciseResults.moduleId,
                session.activityId.startsWith("evaluacion:")
                  ? session.activityId.slice("evaluacion:".length)
                  : session.activityId.startsWith("s") ? `support:${session.activityId}` : session.activityId),
            )).limit(1);
      if (workRows.length === 0) throw new Error("SESSION_WORK_REQUIRED");
      let reflection: typeof sessionReflections.$inferSelect;
      try {
        [reflection] = await tx.insert(sessionReflections).values({
          studentId, sessionId: String(numericSessionId), understood: understood.trim(),
          mistakes: mistakes.trim(), helpful: helpful.trim(),
          remainingQuestions: remainingQuestions.trim(), clientId: clientId.trim(),
        }).returning();
      } catch (error) {
        if (!(error instanceof Error && error.message.includes("unique"))) throw error;
        const [prior] = await tx.select().from(sessionReflections).where(and(
          eq(sessionReflections.studentId, studentId),
          eq(sessionReflections.sessionId, String(numericSessionId)),
        )).limit(1);
        if (!prior) throw error;
        return { reflection: prior, student, duplicate: true };
      }
      const now = new Date();
      const [sessionXpEvent] = await tx.insert(xpEvents).values({
        studentId, eventType: "session-reflection", sourceId: String(numericSessionId), xp: 30,
      }).onConflictDoNothing().returning();
      let awardXp = sessionXpEvent?.xp ?? 0;
      if (session.activityId === "diagnostico" && student.diagnosticProfile) {
        const profile = student.diagnosticProfile as { results?: Array<{ category?: string; total?: number }> };
        const categories = new Set((profile.results ?? []).filter((result) => (result.total ?? 0) > 0).map((result) => result.category));
        const sections = [
          ["aritmetica", ["naturales", "decimales", "enteros", "irracionales", "reales", "potencias", "fracciones", "factores_primos"]],
          ["algebra", ["notacion_grado", "expresion_termino", "clasificacion_expresiones", "terminos_semejantes"]],
          ["patrones", ["suma_resta", "multiplicacion", "division", "productos_notables"]],
        ] as const;
        for (const [section, sectionCategories] of sections) {
          if (!sectionCategories.some((category) => categories.has(category))) continue;
          const [sectionEvent] = await tx.insert(xpEvents).values({
            studentId, eventType: "diagnostic-section", sourceId: `diagnostic-section:${section}`, xp: 10,
          }).onConflictDoNothing().returning();
          awardXp += sectionEvent?.xp ?? 0;
        }
        const [diagnosticEvent] = await tx.insert(xpEvents).values({
          studentId, eventType: "diagnostic-completion", sourceId: "diagnostic", xp: 50,
        }).onConflictDoNothing().returning();
        awardXp += diagnosticEvent?.xp ?? 0;
      }
      const durationSeconds = Math.max(0, Math.floor((now.getTime() - session.startedAt.getTime()) / 1000));
      const dailyProgress = dailyProgressForXp(student, awardXp, now);
      const [updated] = awardXp > 0
        ? await tx.update(students)
          .set({
            totalXP: sql`${students.totalXP} + ${awardXp}`,
            rankHistory: nextRankHistory(student, student.totalXP + awardXp),
            ...dailyProgress,
          })
          .where(eq(students.id, studentId)).returning()
        : [student];
      await tx.update(learningSessions).set({
        status: "reflected",
        reflectedAt: now,
        completedAt: now,
        durationSeconds,
      }).where(and(eq(learningSessions.id, numericSessionId), eq(learningSessions.status, "open")));
      return { reflection, student: updated, duplicate: false };
    });
    res.status(result.duplicate ? 200 : 201).json({ reflection: result.reflection, student: toStudentData(result.student) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "STUDENT_NOT_FOUND") { res.status(404).json({ error: "Student not found" }); return; }
    if (code === "SESSION_NOT_FOUND") { res.status(409).json({ error: "La sesión no existe para este estudiante." }); return; }
    if (code === "SESSION_WORK_REQUIRED") { res.status(409).json({ error: "La sesión necesita una actividad válida antes de reflexionar." }); return; }
    if (code === "SESSION_ALREADY_CLOSED") { res.status(409).json({ error: "La sesión ya fue cerrada." }); return; }
    res.status(409).json({ error: "No se pudo registrar la reflexión de forma idempotente." });
  }
});

// One required reflection per calendar week.
router.post("/students/:studentId/weekly-reflection", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const { weekStart, mostImportant, mainDifficulty, appHelp, advice, clientId } =
    req.body as Record<string, unknown>;
  const canonicalWeekStart = bogotaWeekStart();
  if (!Number.isInteger(studentId) ||
      (weekStart !== undefined && (!requiredText(weekStart) || weekStart !== canonicalWeekStart)) ||
      !requiredText(mostImportant) || !requiredText(mainDifficulty) ||
      !requiredText(appHelp) || !requiredText(advice) || !requiredText(clientId)) {
    res.status(400).json({ error: "La reflexión semanal requiere completar todos los campos." });
    return;
  }
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM students WHERE id = ${studentId} FOR UPDATE`);
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) return null;
    const [existing] = await tx.select().from(weeklyReflections).where(and(
      eq(weeklyReflections.studentId, studentId),
      eq(weeklyReflections.weekStart, canonicalWeekStart),
    )).limit(1);
    if (existing) return { reflection: existing, student, duplicate: true };
    const [reflection] = await tx.insert(weeklyReflections).values({
      studentId, weekStart: canonicalWeekStart, mostImportant: mostImportant.trim(),
      mainDifficulty: mainDifficulty.trim(), appHelp: appHelp.trim(),
      advice: advice.trim(), clientId: clientId.trim(),
    }).returning();
    const [weeklyXpEvent] = await tx.insert(xpEvents).values({
      studentId, eventType: "weekly-reflection", sourceId: canonicalWeekStart, xp: 50,
    }).onConflictDoNothing().returning();
    const dailyProgress = dailyProgressForXp(student, weeklyXpEvent?.xp ?? 0);
    const [updated] = weeklyXpEvent
      ? await tx.update(students).set({
          totalXP: sql`${students.totalXP} + 50`,
          rankHistory: nextRankHistory(student, student.totalXP + 50),
          ...dailyProgress,
        })
        .where(eq(students.id, studentId)).returning()
      : [student];
    return { reflection, student: updated, duplicate: false };
  });
  if (!result) { res.status(404).json({ error: "Student not found" }); return; }
  res.status(result.duplicate ? 200 : 201).json({ reflection: result.reflection, student: toStudentData(result.student) });
});

// Accepts Expo's data:image/*;base64,... payload. The connector implementation
// is loaded only when used so installations without Drive remain compatible.
router.post("/students/:studentId/evidence", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const { exerciseId, topicName, imageBase64, clientId, mimeType, append, evidenceId } =
    req.body as Record<string, unknown>;
  if (!Number.isInteger(studentId) || typeof exerciseId !== "string" ||
      typeof topicName !== "string" || typeof imageBase64 !== "string" ||
      typeof clientId !== "string" || !clientId.trim()) {
    res.status(400).json({ error: "exerciseId, topicName, imageBase64 and clientId are required" });
    return;
  }
  if (isRetiredExercise(exerciseId)) {
    res.status(410).json({ error: "Este ejercicio fue retirado" });
    return;
  }
  const existing = await db.select().from(exerciseResults).where(and(
    eq(exerciseResults.studentId, studentId), eq(exerciseResults.clientId, clientId.trim()),
  )).limit(1);
  if (!existing[0]) {
    res.status(409).json({ error: "Exercise result required before uploading evidence" });
    return;
  }
  const appendEvidence = append === true;
  const requestedEvidenceId = typeof evidenceId === "string" && evidenceId.trim()
    ? evidenceId.trim()
    : null;
  const previousMetadata = existing[0].evidenceMetadata;
  const previousFiles = previousMetadata &&
    Array.isArray(previousMetadata.files)
    ? previousMetadata.files.filter((file): file is Record<string, unknown> =>
      Boolean(file && typeof file === "object"))
    : [];
  if (requestedEvidenceId && previousFiles.some((file) => file.evidenceId === requestedEvidenceId)) {
    res.json({ evidence: { url: existing[0].evidenceUrl, driveFileId: existing[0].evidenceDriveFileId } });
    return;
  }
  if (!appendEvidence && (existing[0].evidenceDriveFileId || existing[0].evidenceUrl)) {
    res.json({ evidence: { url: existing[0].evidenceUrl, driveFileId: existing[0].evidenceDriveFileId } });
    return;
  }
  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  const raw = imageBase64.replace(/^data:[^;]+;base64,/, "");
  if (raw.length > 15_000_000) { res.status(413).json({ error: "Image too large" }); return; }
  try {
    const resolvedMimeType = typeof mimeType === "string" ? mimeType : "image/jpeg";
    const name = evidenceFileName(student.pseudonym, exerciseId, resolvedMimeType);
    const uploaded = await uploadDriveEvidence(
      Buffer.from(raw, "base64"), name,
      resolvedMimeType,
      ["FactorIzA-Play", student.pseudonym, topicName, exerciseId],
    );
    const driveFileId = uploaded.id;
    const url = uploaded.webViewLink ?? null;
    const legacyFile = previousFiles.length === 0 &&
      (existing[0].evidenceDriveFileId || existing[0].evidenceUrl)
      ? [{
          url: existing[0].evidenceUrl,
          driveFileId: existing[0].evidenceDriveFileId,
          fileName: previousMetadata?.fileName ?? null,
          mimeType: previousMetadata?.mimeType ?? null,
          size: previousMetadata?.size ?? null,
        }]
      : [];
    const file = {
      url,
      driveFileId,
      fileName: name,
      mimeType: resolvedMimeType,
      size: Buffer.byteLength(raw, "base64"),
      evidenceId: requestedEvidenceId,
    };
    const files = [...(appendEvidence ? [...previousFiles, ...legacyFile] : []), file];
    const firstFile = files[0];
    const firstUrl = typeof firstFile?.url === "string" ? firstFile.url : url;
    const firstDriveFileId = typeof firstFile?.driveFileId === "string"
      ? firstFile.driveFileId
      : driveFileId;
    const [updated] = await db.update(exerciseResults).set({
          evidenceUrl: firstUrl,
          evidenceDriveFileId: firstDriveFileId,
          evidenceMetadata: {
            folder: ["FactorIzA-Play", student.pseudonym, topicName, exerciseId].join("/"),
            fileName: name,
            mimeType: resolvedMimeType,
            size: Buffer.byteLength(raw, "base64"),
            files,
          },
        }).where(eq(exerciseResults.id, existing[0].id)).returning();
    res.status(201).json({ evidence: { url, driveFileId, resultId: updated?.id ?? null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Drive upload failed";
    console.error("Google Drive evidence upload failed", {
      studentId,
      exerciseId,
      clientId: clientId.trim(),
      imageBytes: Buffer.byteLength(raw, "base64"),
      message,
    });
    res.status(502).json({ error: message });
  }
});

// POST /api/students/:studentId/topics
router.post("/students/:studentId/topics", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  if (isNaN(studentId)) {
    res.status(400).json({ error: "Invalid studentId" });
    return;
  }

  const { topicId, sessionId } = req.body as { topicId?: string; sessionId?: string };
  const numericSessionId = Number.parseInt(sessionId ?? "", 10);
  if (!topicId || !ACTIVE_TOPIC_IDS.includes(topicId) || !Number.isInteger(numericSessionId)) {
    res.status(400).json({ error: "topicId activo y sessionId son obligatorios" });
    return;
  }
  const updated = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM students WHERE id = ${studentId} FOR UPDATE`);
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) return null;
    const [session] = await tx.select().from(learningSessions).where(and(
      eq(learningSessions.id, numericSessionId), eq(learningSessions.studentId, studentId),
      eq(learningSessions.activityId, topicId),
      inArray(learningSessions.status, ["open", "reflected"]),
    )).limit(1);
    if (!session) throw new Error("SESSION_REQUIRED");
    if ((student.completedTopics ?? []).includes(topicId)) return student;
    const [next] = await tx.update(students).set({
      completedTopics: [...(student.completedTopics ?? []), topicId],
    }).where(eq(students.id, studentId)).returning();
    return next;
  }).catch((error) => error instanceof Error && error.message === "SESSION_REQUIRED"
    ? "SESSION_REQUIRED" as const : (() => { throw error; })());
  if (updated === null) { res.status(404).json({ error: "Student not found" }); return; }
  if (updated === "SESSION_REQUIRED") {
    res.status(409).json({ error: "Completa la reflexión de sesión antes de cerrar el tema." });
    return;
  }
  res.json({ student: toStudentData(updated) });
});

// Explicit user actions are separate mutations: an answer payload cannot
// claim that feedback or a hint was read.
router.post("/students/:studentId/hint", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const { exerciseId, hintId, clientId, moduleId } = req.body as Record<string, unknown>;
  if (!Number.isInteger(studentId) || !requiredText(exerciseId) || !requiredText(hintId) || !requiredText(clientId)) {
    res.status(400).json({ error: "exerciseId, hintId y clientId son obligatorios" });
    return;
  }
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM students WHERE id = ${studentId} FOR UPDATE`);
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) return null;
    const hintXp = isPrerequisiteExercise(moduleId, exerciseId) ? 0 : 3;
    const [event] = await tx.insert(xpEvents).values({
      studentId, eventType: "hint", sourceId: `${exerciseId}:${hintId}:${clientId}`, xp: hintXp,
    }).onConflictDoNothing().returning();
    if (!event) return { student, duplicate: true };
    if (event.xp === 0) return { student, duplicate: false };
    const dailyProgress = dailyProgressForXp(student, event.xp);
    const [updated] = await tx.update(students).set({
      totalXP: sql`${students.totalXP} + 3`,
      rankHistory: nextRankHistory(student, student.totalXP + 3),
      ...dailyProgress,
    }).where(eq(students.id, studentId)).returning();
    return { student: updated, duplicate: false };
  });
  if (!result) { res.status(404).json({ error: "Student not found" }); return; }
  res.status(result.duplicate ? 200 : 201).json({ student: toStudentData(result.student) });
});

router.post("/students/:studentId/feedback-view", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const { exerciseClientId } = req.body as Record<string, unknown>;
  if (!Number.isInteger(studentId) || !requiredText(exerciseClientId)) {
    res.status(400).json({ error: "exerciseClientId es obligatorio" });
    return;
  }
  const result = await db.transaction(async (tx) => {
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) return null;
    const [exercise] = await tx.select({ id: exerciseResults.id }).from(exerciseResults).where(and(
      eq(exerciseResults.studentId, studentId), eq(exerciseResults.clientId, exerciseClientId),
    )).limit(1);
    if (!exercise) throw new Error("EXERCISE_REQUIRED");
    const [event] = await tx.insert(xpEvents).values({
      studentId, eventType: "feedback-read", sourceId: exerciseClientId, xp: 5,
    }).onConflictDoNothing().returning();
    if (!event) return { student, duplicate: true };
    await tx.update(exerciseResults).set({
      feedbackViews: sql`${exerciseResults.feedbackViews} + 1`,
    }).where(eq(exerciseResults.id, exercise.id));
    const [updated] = await tx.update(students).set({
      totalXP: sql`${students.totalXP} + 5`,
      rankHistory: nextRankHistory(student, student.totalXP + 5),
      ...dailyProgressForXp(student, event.xp),
    }).where(eq(students.id, studentId)).returning();
    return { student: updated, duplicate: false };
  }).catch((error) => {
    if (error instanceof Error && error.message === "EXERCISE_REQUIRED") return "EXERCISE_REQUIRED" as const;
    throw error;
  });
  if (result === "EXERCISE_REQUIRED") { res.status(409).json({ error: "La respuesta debe existir antes de leer feedback." }); return; }
  if (!result) { res.status(404).json({ error: "Student not found" }); return; }
  res.status(result.duplicate ? 200 : 201).json({ student: toStudentData(result.student) });
});

// POST /api/students/:studentId/modules
router.post("/students/:studentId/modules", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const { moduleId, sessionId } = req.body as { moduleId?: string; sessionId?: string };
  if (isNaN(studentId) || !moduleId?.trim() || !sessionId?.trim()) {
    res.status(400).json({ error: "studentId, moduleId y sessionId son obligatorios" });
    return;
  }
  if (!ACTIVE_MODULE_IDS.includes(moduleId.trim()) || RETIRED_MODULE_IDS.has(moduleId.trim())) {
    res.status(410).json({ error: "Este módulo no está disponible" });
    return;
  }

  const updated = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM students WHERE id = ${studentId} FOR UPDATE`);
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) return null;
    const [session] = await tx.select().from(learningSessions).where(and(
      eq(learningSessions.id, Number.parseInt(sessionId, 10)),
      eq(learningSessions.studentId, studentId),
      eq(learningSessions.status, "reflected"),
    )).limit(1);
    if (!session || session.activityId !== moduleId) throw new Error("SESSION_REQUIRED");
    const completedModules = student.completedModules ?? [];
    if (completedModules.includes(moduleId)) {
      if (ACTIVE_MODULE_IDS.every((id) => isFactorizationModuleComplete(id, completedModules))) {
        const [routeEvent] = await tx.insert(xpEvents).values({
          studentId, eventType: "route-completion", sourceId: "ruta-factorizacion", xp: 150,
        }).onConflictDoNothing().returning();
        if (routeEvent) {
          const [next] = await tx.update(students)
            .set({
              totalXP: sql`${students.totalXP} + ${routeEvent.xp}`,
              rankHistory: nextRankHistory(student, student.totalXP + routeEvent.xp),
               ...dailyProgressForXp(student, routeEvent.xp),
            })
            .where(eq(students.id, studentId)).returning();
          return next;
        }
      }
      return student;
    }
    const [moduleXpEvent] = await tx.insert(xpEvents).values({
      studentId, eventType: "module-completion", sourceId: moduleId, xp: 50,
    }).onConflictDoNothing().returning();
    const nextModules = [...completedModules, moduleId];
    const routeComplete = ACTIVE_MODULE_IDS.every((id) =>
      isFactorizationModuleComplete(id, nextModules),
    );
    const [routeEvent] = routeComplete
      ? await tx.insert(xpEvents).values({
          studentId, eventType: "route-completion", sourceId: "ruta-factorizacion", xp: 150,
        }).onConflictDoNothing().returning()
      : [undefined];
    const totalAwardXp = (moduleXpEvent?.xp ?? 0) + (routeEvent?.xp ?? 0);
    const [next] = await tx.update(students).set({
      completedModules: nextModules,
      ...((moduleXpEvent || routeEvent) ? {
        totalXP: sql`${students.totalXP} + ${totalAwardXp}`,
        rankHistory: nextRankHistory(
          student,
          student.totalXP + totalAwardXp,
        ),
        ...dailyProgressForXp(student, totalAwardXp),
      } : {}),
    }).where(eq(students.id, studentId)).returning();
    return next;
  }).catch((error) => {
    if (error instanceof Error && error.message === "SESSION_REQUIRED") return "SESSION_REQUIRED" as const;
    throw error;
  });
  if (updated === null) { res.status(404).json({ error: "Student not found" }); return; }
  if (updated === "SESSION_REQUIRED") {
    res.status(409).json({ error: "Completa la reflexión de sesión antes de cerrar el módulo." });
    return;
  }
  res.json({ student: toStudentData(updated) });
});

// POST /api/students/:studentId/diagnostic
router.post("/students/:studentId/diagnostic", async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const { diagnosticProfile, sessionId } = req.body as { diagnosticProfile?: Record<string, unknown>; sessionId?: string };
  const numericSessionId = Number.parseInt(sessionId ?? "", 10);
  if (isNaN(studentId) || !Number.isInteger(numericSessionId) || !diagnosticProfile || typeof diagnosticProfile !== "object") {
    res.status(400).json({ error: "Valid studentId, sessionId and diagnosticProfile are required" });
    return;
  }

  const updated = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM students WHERE id = ${studentId} FOR UPDATE`);
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student) return null;
    const [session] = await tx.select().from(learningSessions).where(and(
      eq(learningSessions.id, numericSessionId),
      eq(learningSessions.studentId, studentId),
      eq(learningSessions.activityId, "diagnostico"),
      eq(learningSessions.status, "open"),
    )).limit(1);
    if (!session) throw new Error("DIAGNOSTIC_SESSION_REQUIRED");
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const profileHistory = [
      ...(student.profileHistory ?? []),
      {
        profile: diagnosticProfile.profile ?? null,
        route: diagnosticProfile.route ?? null,
        moduleResults: diagnosticProfile.moduleResults ?? null,
        personalizedRoute: diagnosticProfile.personalizedRoute ?? null,
        at: now,
      },
    ];
    let awardXp = 0;
    const profileResults = diagnosticProfile.results as
      | Array<{ category?: string; total?: number }>
      | undefined;
    const categories = new Set(
      (profileResults ?? [])
        .filter((result) => (result.total ?? 0) > 0)
        .map((result) => result.category),
    );
    const sections = [
      ["aritmetica", ["naturales", "decimales", "enteros", "irracionales", "reales", "potencias", "fracciones", "factores_primos"]],
      ["algebra", ["notacion_grado", "expresion_termino", "clasificacion_expresiones", "terminos_semejantes"]],
      ["patrones", ["suma_resta", "multiplicacion", "division", "productos_notables"]],
    ] as const;
    for (const [section, sectionCategories] of sections) {
      if (!sectionCategories.some((category) => categories.has(category))) continue;
      const [sectionEvent] = await tx.insert(xpEvents).values({
        studentId,
        eventType: "diagnostic-section",
        sourceId: `diagnostic-section:${section}`,
        xp: 10,
      }).onConflictDoNothing().returning();
      awardXp += sectionEvent?.xp ?? 0;
    }
    const [diagnosticEvent] = await tx.insert(xpEvents).values({
      studentId,
      eventType: "diagnostic-completion",
      sourceId: "diagnostic",
      xp: 50,
    }).onConflictDoNothing().returning();
    awardXp += diagnosticEvent?.xp ?? 0;
    const dailyProgress = dailyProgressForXp(student, awardXp, nowDate);
    const [next] = await tx.update(students).set({
      diagnosticProfile,
      ...(student.initialProfile ? {} : { initialProfile: String(diagnosticProfile.profile ?? "") }),
      ...(student.initialRank ? {} : { initialRank: rankForXp(student.totalXP).name }),
      profileHistory,
      ...(awardXp > 0 ? {
        totalXP: sql`${students.totalXP} + ${awardXp}`,
        rankHistory: nextRankHistory(student, student.totalXP + awardXp),
        ...dailyProgress,
      } : {}),
    }).where(eq(students.id, studentId)).returning();
    const durationSeconds = Math.max(
      0,
      Math.floor((nowDate.getTime() - session.startedAt.getTime()) / 1000),
    );
    await tx.update(learningSessions).set({
      status: "completed",
      qualifyingWorkAt: nowDate,
      completedAt: nowDate,
      durationSeconds,
    }).where(and(eq(learningSessions.id, numericSessionId), eq(learningSessions.status, "open")));
    return next;
  }).catch((error) => {
    if (error instanceof Error && error.message === "DIAGNOSTIC_SESSION_REQUIRED") {
      return "DIAGNOSTIC_SESSION_REQUIRED" as const;
    }
    throw error;
  });

  if (updated === "DIAGNOSTIC_SESSION_REQUIRED") {
    res.status(409).json({ error: "Completa la sesión diagnóstica antes de guardar el diagnóstico." });
    return;
  }
  if (!updated) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json({ student: toStudentData(updated) });
});

export default router;
