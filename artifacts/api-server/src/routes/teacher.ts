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
import { and, eq, count, inArray, sql } from "drizzle-orm";
import { ReplitConnectors } from "@replit/connectors-sdk";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  calculateAcademicSummary,
  type AcademicSummary,
} from "../lib/academicGrading.js";
import { csvCell } from "../lib/csv.js";

const router = Router();
const connectors = new ReplitConnectors();
const isRetiredExercise = (exerciseId: string) =>
  exerciseId.startsWith("ax2-");
const RETIRED_MODULE_IDS = new Set(["trinomio-ax2-bx-c"]);
const ACADEMIC_MODULE_TITLES: Record<string, string> = {
  "factor-comun": "Factor común",
  "agrupacion-terminos": "Agrupación de términos",
  "trinomio-cuadrado-perfecto": "Trinomio cuadrado perfecto",
  "diferencia-cuadrados": "Diferencia de cuadrados",
  "trinomio-forma-x2-bx-c": "Trinomio x² + bx + c",
  "cubo-binomio": "Cubo de un binomio",
  "suma-diferencia-cubos": "Suma / diferencia de cubos",
};
const RESEARCH_CASES = [
  { id: "reconocimiento-patrones", label: "Reconocimiento de patrones" },
  { id: "factor-comun", label: "Factor común" },
  { id: "agrupacion-terminos", label: "Factor común por agrupación" },
  { id: "trinomio-cuadrado-perfecto", label: "Trinomio cuadrado perfecto" },
  { id: "diferencia-cuadrados", label: "Diferencia de cuadrados" },
  { id: "trinomio-forma-x2-bx-c", label: "Trinomio de la forma x² + bx + c" },
  { id: "cubo-binomio", label: "Cubo de un binomio" },
  { id: "suma-diferencia-cubos", label: "Suma y diferencia de cubos" },
] as const;
const DIAGNOSTIC_LABELS: Record<string, string> = {
  naturales: "Naturales y operaciones",
  decimales: "Decimales",
  enteros: "Enteros y ley de signos",
  fracciones: "Fracciones y racionales",
  irracionales: "Irracionales",
  reales: "Números reales",
  potencias: "Potencias",
  propiedades: "Propiedades",
  terminos: "Términos semejantes",
  variables: "Variables",
  igualdad: "Signo igual como equivalencia",
  factorizacion: "Factorización",
  patrones: "Reconocimiento de patrones",
};
const PROFILE_LABELS: Record<string, string> = {
  aritmetica: "Pensamiento numérico",
  propiedades: "Propiedades",
  terminos: "Términos semejantes",
  variables: "Variables",
  igualdad: "Signo igual como equivalencia",
  patrones: "Reconocimiento de patrones",
};
const isRetiredTopic = (topicId: string) =>
  topicId.toLowerCase().includes("ax2-bx-c");

function isRetiredCase(...parts: Array<string | null | undefined>): boolean {
  return parts.some((part) =>
    Boolean(part) &&
    (isRetiredExercise(part!) ||
      RETIRED_MODULE_IDS.has(part!) ||
      isRetiredTopic(part!)),
  );
}

function reportScore(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)}%` : "Sin evidencia";
}

function reportGrade(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "Sin evidencia";
}

function reportDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 min";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes} min ${remaining} s`;
}

function reportMastery(correct: number, total: number): string {
  if (total <= 0) return "Sin evidencia";
  const proportion = correct / total;
  if (proportion < 0.25) return "Nivel 1: Necesita apoyo";
  if (proportion < 0.5) return "Nivel 2: Comprensión inicial";
  if (proportion < 0.75) return "Nivel 3: Comprensión adecuada";
  return "Nivel 4: Dominio";
}

function isTransferExercise(exerciseId: string): boolean {
  return /(?:^|-)eval(?:-|$)/i.test(exerciseId);
}

function pdfText(value: unknown): string {
  const text = value == null
    ? "—"
    : typeof value === "string"
      ? value
      : JSON.stringify(value);
  // PDFKit's built-in fonts use WinAnsi. Keep Spanish characters readable and
  // replace unsupported symbols (for example emoji in diagnostic JSON).
  return text.replace(/[^\u0000-\u00ff]/g, "?");
}

function pdfJson(value: unknown): string {
  if (value == null) return "—";
  try {
    return pdfText(JSON.stringify(value, null, 2));
  } catch {
    return pdfText(value);
  }
}

function reportSafeData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reportSafeData);
  if (!value || typeof value !== "object") return value;
  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (/^(id|clientId|sourceId|driveFileId|evidenceUrl|url|metadata)$/i.test(key)) {
      continue;
    }
    result[key] = reportSafeData(nested);
  }
  return result;
}

function bogotaDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

function safeFilename(value: string): string {
  return value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "estudiante";
}

const MAX_EVIDENCE_BYTES = 12 * 1024 * 1024;
const EVIDENCE_TIMEOUT_MS = 12_000;
const REPORT_TOKEN_TTL_SECONDS = 5 * 60;

type StudentReportClaims = {
  studentId: number;
  classCode: string;
  exp: number;
};

function reportSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no está configurado");
  return secret;
}

function signReportToken(claims: StudentReportClaims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", reportSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyReportToken(token: string): StudentReportClaims | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  try {
    const expected = createHmac("sha256", reportSecret()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as StudentReportClaims;
    if (!Number.isInteger(claims.studentId) || typeof claims.classCode !== "string" ||
        !Number.isInteger(claims.exp) || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return { studentId: claims.studentId, classCode: claims.classCode, exp: claims.exp };
  } catch {
    return null;
  }
}

function controlledEvidenceFileId(
  value: string | null | undefined,
  classCode: string,
  requestHost?: string,
): string | null {
  if (!value) return null;
  const expectedPath = `/api/class/${encodeURIComponent(classCode)}/evidence/`;
  try {
    const parsed = new URL(value, "https://factoriza-play.local");
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;
    const relativeUrl = value.startsWith("/");
    const sameAppHost = relativeUrl || (requestHost && parsed.host === requestHost);
    if (sameAppHost && path.startsWith(expectedPath)) {
      return decodeURIComponent(path.slice(expectedPath.length)).split("/")[0] || null;
    }
    const controlledGoogleHost =
      host === "drive.google.com" ||
      host === "docs.google.com" ||
      host === "drive.usercontent.google.com" ||
      host.endsWith(".googleusercontent.com");
    if (!controlledGoogleHost) return null;
    const drivePath = path.match(/\/d\/([^/]+)/)?.[1];
    return drivePath ?? parsed.searchParams.get("id");
  } catch {
    return null;
  }
}

async function readLimitedResponse(response: Response, maxBytes: number): Promise<Buffer> {
  const declaredLength = Number(response.headers.get("content-length") ?? "");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error("La evidencia supera el límite de 12 MB");
  }
  if (!response.body) {
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > maxBytes) throw new Error("La evidencia supera el límite de 12 MB");
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      const chunk = Buffer.from(next.value);
      total += chunk.length;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("La evidencia supera el límite de 12 MB");
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}

async function normalizeEvidencePhoto(bytes: Buffer): Promise<Buffer> {
  const normalized = await sharp(bytes, {
    limitInputPixels: 40_000_000,
    failOn: "error",
  })
    .rotate()
    .resize({
      width: 2200,
      height: 2200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  if (normalized.length > MAX_EVIDENCE_BYTES) {
    throw new Error("La evidencia normalizada supera el límite de 12 MB");
  }
  return normalized;
}

function rankName(totalXP: number): string {
  if (totalXP > 5000) return "Gran Maestro";
  if (totalXP > 3500) return "Heroico";
  if (totalXP > 2200) return "Diamante";
  if (totalXP > 1200) return "Oro";
  if (totalXP > 500) return "Plata";
  return "Bronce";
}

type AcademicResultRow = {
  studentId: number;
  exerciseId: string;
  moduleId: string | null;
  correct: boolean;
  attempts: number | null;
  createdAt: Date;
  errorCategory?: string | null;
  feedbackViews?: number | null;
  feedbackViewed?: boolean;
};

type AcademicModuleReflectionRow = {
  studentId: number;
  moduleId: string;
};

type AcademicSessionReflectionRow = {
  studentId: number;
  sessionId: string;
};

type AcademicLearningSessionRow = {
  id: number;
  studentId: number;
  activityId: string;
};

function academicSummaryForStudent(
  studentId: number,
  results: AcademicResultRow[],
  moduleReflectionRows: AcademicModuleReflectionRow[],
  sessionReflectionRows: AcademicSessionReflectionRow[],
  learningSessionRows: AcademicLearningSessionRow[],
  diagnosticProfile: unknown,
): AcademicSummary {
  const sessionsById = new Map(
    learningSessionRows
      .filter((session) => session.studentId === studentId)
      .map((session) => [String(session.id), session.activityId]),
  );
  const profile = diagnosticProfile as {
    results?: Array<{ category?: string; score?: number | null }>;
    moduleResults?: Array<{
      topics?: Array<{ category?: string; score?: number | null }>;
    }>;
  } | null;
  const diagnosticResults = profile?.results?.length
    ? profile.results
    : profile?.moduleResults?.flatMap((module) => module.topics ?? []) ?? [];
  return calculateAcademicSummary({
    records: results
      .filter((result) => result.studentId === studentId)
      .map((result) => ({
        exerciseId: result.exerciseId,
        moduleId: result.moduleId,
        correct: result.correct,
        attempts: result.attempts,
        errorCategory: result.errorCategory,
        feedbackViews: result.feedbackViews,
        feedbackViewed: result.feedbackViews != null && result.feedbackViews > 0,
        timestamp: result.createdAt,
      })),
    reflections: [
      ...moduleReflectionRows
        .filter((reflection) => reflection.studentId === studentId)
        .map((reflection) => ({ moduleId: reflection.moduleId, completed: true })),
      ...sessionReflectionRows
        .filter((reflection) => reflection.studentId === studentId)
        .map((reflection) => ({
          activityId: sessionsById.get(String(reflection.sessionId)) ?? null,
          completed: true,
        })),
    ],
    diagnosticResults: diagnosticResults.filter(
      (result): result is { category: string; score?: number | null } =>
        typeof result.category === "string",
    ),
    moduleTitles: ACADEMIC_MODULE_TITLES,
  });
}

function academicTopicCsv(summary: AcademicSummary): string {
  return summary.topics
    .map((topic) => `${topic.title ?? topic.moduleId}:${topic.grade == null ? "pendiente" : topic.grade.toFixed(1)} (${Math.round(topic.coverage * 100)}%)`)
    .join("|");
}

function academicComponentsCsv(summary: AcademicSummary): string {
  return summary.topics
    .map((topic) => `${topic.title ?? topic.moduleId}[${topic.components.map((component) =>
      `${component.key}=${component.covered ? `${component.successCount}/${component.opportunityCount}` : "pendiente"}`,
    ).join(";")}]`)
    .join("|");
}

function academicMissingComponentsCsv(summary: AcademicSummary): string {
  return summary.topics
    .map((topic) => `${topic.title ?? topic.moduleId}:${topic.missingComponents.length > 0 ? topic.missingComponents.join(";") : "ninguno"}`)
    .join("|");
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

// POST /api/teacher/:teacherCode/classes/:classCode/students
// A student profile is created only from the teacher panel. Student login is
// intentionally read-only and can only find an existing profile.
router.post(
  "/teacher/:teacherCode/classes/:classCode/students",
  async (req, res) => {
    const { teacherCode, classCode } = req.params;
    const requestedPseudonym = (req.body as { pseudonym?: string }).pseudonym;
    const pseudonym = typeof requestedPseudonym === "string"
      ? requestedPseudonym.trim().replace(/\s+/g, " ")
      : "";
    const normalizedClassCode = classCode.trim().toUpperCase();

    if (!pseudonym) {
      res.status(400).json({ error: "El pseudónimo no puede estar vacío." });
      return;
    }
    if (pseudonym.length > 80) {
      res.status(400).json({ error: "El pseudónimo no puede superar 80 caracteres." });
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

    const [teacherClass] = await db
      .select({ code: classCodes.code })
      .from(classCodes)
      .where(and(
        eq(classCodes.teacherId, teacher.id),
        eq(classCodes.code, normalizedClassCode),
      ))
      .limit(1);
    if (!teacherClass) {
      res.status(403).json({ error: "La clase no pertenece a este docente." });
      return;
    }

    const [existing] = await db
      .select({ id: students.id })
      .from(students)
      .where(and(
        eq(students.classCode, normalizedClassCode),
        sql`lower(${students.pseudonym}) = lower(${pseudonym})`,
      ))
      .limit(1);
    if (existing) {
      res.status(409).json({ error: "Ese pseudónimo ya está registrado en esta clase." });
      return;
    }

    const [student] = await db
      .insert(students)
      .values({
        pseudonym,
        classCode: normalizedClassCode,
        totalXP: 0,
        streak: 0,
        completedTopics: [],
        completedModules: [],
        completedExercises: [],
      })
      .returning({
        id: students.id,
        pseudonym: students.pseudonym,
        classCode: students.classCode,
      });

    res.status(201).json({ student });
  },
);

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
    "academic_general_grade", "academic_general_coverage", "academic_numeric_grade",
    "academic_algebraic_grade", "academic_topic_grades", "academic_topic_components",
    "academic_topic_missing_components", "academic_missing_components", "academic_diagnostic_grades",
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
      !session.activityId.includes("ax2-bx-c"));
    const studentWeekly = weekly.filter((reflection) => reflection.studentId === student.id);
    const studentEvents = events.filter((event) => event.studentId === student.id);
    const academic = academicSummaryForStudent(
      student.id,
      results,
      modules,
      sessions,
      learningSessionRows,
      student.diagnosticProfile,
    );
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
      (student.completedTopics ?? []).filter((id) => !id.startsWith("ax2-")).join("|"),
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
      academic.general.grade,
      academic.general.coverage,
      academic.pensamientoNumerico.grade,
      academic.pensamientoAlgebraico.grade,
      academicTopicCsv(academic),
      academicComponentsCsv(academic),
      academicMissingComponentsCsv(academic),
      academic.general.missingComponents.join("|"),
      Object.entries(academic.diagnosticGrades).map(([category, value]) => `${category}:${value.toFixed(1)}`).join("|"),
    ].map(csvCell).join(",");
  });
  const csv = [header.map(csvCell).join(","), ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="factoriza-${classCode.toUpperCase()}-investigacion.csv"`);
  res.send(`\uFEFF${csv}`);
});

// Issue a short-lived, scoped report URL. The teacher credential is accepted
// only in this JSON request and never appears in the resulting URL.
router.post("/teacher/student-report-token", async (req, res) => {
  const { teacherCode, classCode } = req.body as {
    teacherCode?: unknown;
    classCode?: unknown;
    studentId?: unknown;
  };
  const rawStudentId = req.body?.studentId;
  const studentId = typeof rawStudentId === "number"
    ? rawStudentId
    : typeof rawStudentId === "string" && /^\d+$/.test(rawStudentId)
      ? Number(rawStudentId)
      : Number.NaN;
  if (typeof teacherCode !== "string" || typeof classCode !== "string" ||
      !Number.isInteger(studentId)) {
    res.status(400).json({ error: "teacherCode, classCode y studentId son obligatorios" });
    return;
  }
  const [teacher] = await db.select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.teacherCode, teacherCode.trim()))
    .limit(1);
  if (!teacher) {
    res.status(401).json({ error: "Código de docente inválido" });
    return;
  }
  const normalizedClassCode = classCode.trim().toUpperCase();
  const [teacherClass] = await db.select({ code: classCodes.code })
    .from(classCodes)
    .where(and(
      eq(classCodes.teacherId, teacher.id),
      eq(classCodes.code, normalizedClassCode),
    ))
    .limit(1);
  if (!teacherClass) {
    res.status(403).json({ error: "La clase no pertenece a este docente" });
    return;
  }
  const [student] = await db.select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, studentId), eq(students.classCode, normalizedClassCode)))
    .limit(1);
  if (!student) {
    res.status(404).json({ error: "El estudiante no pertenece a esta clase" });
    return;
  }
  try {
    const token = signReportToken({
      studentId,
      classCode: normalizedClassCode,
      exp: Math.floor(Date.now() / 1000) + REPORT_TOKEN_TTL_SECONDS,
    });
    res.json({
      url: `${req.baseUrl || "/api"}/teacher/student-report/${token}.pdf`,
      expiresInSeconds: REPORT_TOKEN_TTL_SECONDS,
    });
  } catch {
    res.status(503).json({ error: "El servicio de informes no está configurado" });
  }
});

// A complete, human-readable report for a scoped student token. Ownership
// was established at issuance; membership is checked again before rendering.
router.get(
  "/teacher/student-report/:token.pdf",
  async (req, res) => {
    const claims = verifyReportToken(req.params.token);
    if (!claims) {
      res.status(401).json({ error: "El enlace del informe es inválido o expiró" });
      return;
    }
    const [student] = await db.select().from(students).where(and(
      eq(students.id, claims.studentId),
      eq(students.classCode, claims.classCode),
    )).limit(1);
    if (!student) {
      res.status(404).json({ error: "El estudiante no pertenece a esta clase" });
      return;
    }
    const studentId = claims.studentId;
    const normalizedClassCode = claims.classCode;

    const [allResults, allModules, allSessions, allLearningSessions, allWeekly, allEvents] =
      await Promise.all([
        db.select().from(exerciseResults).where(eq(exerciseResults.studentId, studentId)),
        db.select().from(moduleReflections).where(eq(moduleReflections.studentId, studentId)),
        db.select().from(sessionReflections).where(eq(sessionReflections.studentId, studentId)),
        db.select().from(learningSessions).where(eq(learningSessions.studentId, studentId)),
        db.select().from(weeklyReflections).where(eq(weeklyReflections.studentId, studentId)),
        db.select().from(xpEvents).where(eq(xpEvents.studentId, studentId)),
      ]);
    // This is an archival report: unlike live progress endpoints, it keeps
    // retired rows and labels them rather than silently losing history.
    const results = allResults;
    const modules = allModules;
    const learning = allLearningSessions;
    const sessions = allSessions;
    const completedTopics = student.completedTopics ?? [];
    const completedModules = student.completedModules ?? [];
    const completedExercises = student.completedExercises ?? [];
    const storedProfile = student.diagnosticProfile as Record<string, unknown> | null;
    const academic = academicSummaryForStudent(
      studentId,
      allResults,
      allModules,
      allSessions,
      allLearningSessions,
      student.diagnosticProfile,
    );
    if (req.aborted || res.destroyed) return;

    type Evidence = { bytes?: Buffer; mime?: string; error?: string };
    const reportAbortController = new AbortController();
    let clientGone = false;
    const evidenceFor = async (fileId: string): Promise<Evidence> => {
      if (clientGone) return { error: "El cliente canceló la descarga del informe" };
      const controller = new AbortController();
      const abortWithReport = () => controller.abort();
      reportAbortController.signal.addEventListener("abort", abortWithReport, { once: true });
      const timeout = setTimeout(() => controller.abort(), EVIDENCE_TIMEOUT_MS);
      let evidence: Evidence;
      try {
        const response = await connectors.proxy(
          "google-drive",
          `/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          evidence = { error: `Drive respondió con estado ${response.status}` };
        } else {
          const headerMime = (response.headers.get("content-type") ?? "")
            .split(";")[0].toLowerCase();
          if (headerMime === "image/heic" || headerMime === "image/heif" ||
              headerMime === "image/webp") {
            const bytes = await readLimitedResponse(response, MAX_EVIDENCE_BYTES);
            evidence = {
              bytes: await normalizeEvidencePhoto(bytes),
              mime: "image/jpeg",
            };
          } else {
            const bytes = await readLimitedResponse(response, MAX_EVIDENCE_BYTES);
            evidence = { bytes: await normalizeEvidencePhoto(bytes), mime: "image/jpeg" };
          }
        }
      } catch (error) {
        evidence = {
          error: error instanceof Error && error.name === "AbortError"
            ? "Tiempo de espera agotado al cargar la evidencia"
            : error instanceof Error
              ? `No se pudo procesar la evidencia: ${error.message}`
              : "No se pudo procesar la evidencia",
        };
      } finally {
        clearTimeout(timeout);
        reportAbortController.signal.removeEventListener("abort", abortWithReport);
      }
      return evidence;
    };

    const rank = rankName(student.totalXP);
    const generatedAt = new Date();
    const profileData = storedProfile ?? {};
    const competencyResults = Array.isArray(profileData.competencyResults)
      ? profileData.competencyResults as Array<Record<string, unknown>>
      : [];
    const moduleResults = Array.isArray(profileData.moduleResults)
      ? profileData.moduleResults as Array<Record<string, unknown>>
      : [];
    const topicGradeByModule = new Map(academic.topics.map((topic) => [topic.moduleId, topic.grade]));
    const researchRows = results.filter((row) =>
      RESEARCH_CASES.some((item) => item.id === row.moduleId),
    );
    const rowsByCase = new Map<string, typeof researchRows>();
    for (const row of researchRows) {
      const caseId = row.moduleId!;
      const existing = rowsByCase.get(caseId) ?? [];
      existing.push(row);
      rowsByCase.set(caseId, existing);
    }
    const correctedErrorCount = (rows: typeof researchRows): number => {
      const byExercise = new Map<string, typeof rows>();
      for (const row of rows) {
        const list = byExercise.get(row.exerciseId) ?? [];
        list.push(row);
        byExercise.set(row.exerciseId, list);
      }
      return rows.filter((row) => !row.correct).filter((row) => {
        const timestamp = new Date(row.createdAt).getTime();
        return (byExercise.get(row.exerciseId) ?? []).some((later) =>
          later.correct && new Date(later.createdAt).getTime() > timestamp,
        );
      }).length;
    };
    const caseSummaries = RESEARCH_CASES.map((item) => {
      const rows = rowsByCase.get(item.id) ?? [];
      const errors = rows.filter((row) => !row.correct).length;
      const corrected = correctedErrorCount(rows);
      const correct = rows.filter((row) => row.correct).length;
      const transfer = rows.filter((row) => isTransferExercise(row.exerciseId));
      const transferCorrect = transfer.filter((row) => row.correct).length;
      const fallbackGrade = rows.length > 0 ? 1 + (correct / rows.length) * 4 : null;
      return {
        ...item,
        rows,
        grade: topicGradeByModule.get(item.id) ?? fallbackGrade,
        attempts: rows.reduce((sum, row) => sum + (row.attempts ?? 1), 0),
        errors,
        corrected,
        persistent: Math.max(0, errors - corrected),
        correctionRate: errors > 0 ? corrected / errors : null,
        transferCount: transfer.length,
        transferCorrect,
        transferIncorrect: transfer.length - transferCorrect,
        mastery: reportMastery(transferCorrect, transfer.length || rows.length),
      };
    });
    const totalDetectedErrors = caseSummaries.reduce((sum, item) => sum + item.errors, 0);
    const totalCorrectedErrors = caseSummaries.reduce((sum, item) => sum + item.corrected, 0);
    const totalPersistentErrors = caseSummaries.reduce((sum, item) => sum + item.persistent, 0);
    const transferRows = results.filter((row) =>
      isTransferExercise(row.exerciseId) && RESEARCH_CASES.some((item) => item.id === row.moduleId),
    );
    const transferCorrect = transferRows.filter((row) => row.correct).length;
    const totalLearningSeconds = learning.reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0);
    const totalExerciseSeconds = results.reduce((sum, row) => sum + (row.durationSeconds ?? 0), 0);
    const totalUseSeconds = totalLearningSeconds > 0 ? totalLearningSeconds : totalExerciseSeconds;
    const hintsUsed = results.reduce((sum, row) => sum + (row.hintsUsed ?? 0), 0);
    const feedbackViews = results.reduce((sum, row) => sum + (row.feedbackViews ?? 0), 0);
    const earnedXp = allEvents.reduce((sum, event) => sum + event.xp, 0);
    const badges = [
      ...(completedExercises.length >= 10 ? ["Persistente"] : []),
      ...(RESEARCH_CASES.filter((item) => completedModules.includes(item.id)).length === RESEARCH_CASES.length
        ? ["Maestro de factorización"] : []),
      ...(Boolean((profileData.competencyResults as Array<Record<string, unknown>> | undefined)
        ?.some((item) => item.competency === "patrones" && item.meetsThreshold === true))
        ? ["Observador de patrones"] : []),
    ];
    const latestSessionReflection = [...sessions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
    const strengths = [
      ...caseSummaries.filter((item) => item.rows.length > 0 && item.mastery === "Nivel 4: Dominio")
        .map((item) => `Dominio en ${item.label.toLowerCase()}.`),
      ...(totalDetectedErrors > 0 && totalCorrectedErrors / totalDetectedErrors >= 0.75
        ? ["Alta corrección de errores detectados."] : []),
      ...(feedbackViews > 0 ? ["Consulta de retroalimentación durante el aprendizaje."] : []),
    ];
    const difficulties = [
      ...caseSummaries.filter((item) => item.persistent > 0)
        .map((item) => `Persisten errores en ${item.label.toLowerCase()}.`),
      ...caseSummaries.filter((item) => item.transferCount > 0 && item.transferCorrect / item.transferCount < 0.5)
        .map((item) => `Bajo desempeño en transferencia para ${item.label.toLowerCase()}.`),
    ];
    const document = new PDFDocument({
      autoFirstPage: false,
      bufferPages: true,
      margins: { top: 46, bottom: 70, left: 46, right: 46 },
      size: "A4",
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="factoriza-${safeFilename(student.classCode)}-${safeFilename(student.pseudonym)}-reporte.pdf"`,
    );
    document.pipe(res);
    document.on("error", (error) => {
      if (!res.destroyed && !res.writableEnded) {
        res.destroy(error instanceof Error ? error : new Error(String(error)));
      }
    });
    const abortReport = () => {
      if (clientGone) return;
      clientGone = true;
      reportAbortController.abort();
      if (!document.destroyed) document.destroy();
    };
    req.once("aborted", abortReport);
    const onResponseClose = () => {
      if (!res.writableEnded) abortReport();
    };
    res.once("close", onResponseClose);

    try {
    document.addPage();
    const addPageIfNeeded = (minimum = 70) => {
      if (document.y > 748 - minimum) document.addPage();
    };
    const heading = (title: string, level: 1 | 2 = 1) => {
      addPageIfNeeded(level === 1 ? 44 : 30);
      document.moveDown(level === 1 ? 0.8 : 0.35);
      document.font(level === 1 ? "Helvetica-Bold" : "Helvetica-Bold")
        .fontSize(level === 1 ? 15 : 11)
        .fillColor(level === 1 ? "#17324d" : "#235a78")
        .text(pdfText(title));
      document.moveDown(0.2);
      document.fillColor("#111827").font("Helvetica").fontSize(9);
    };
    const field = (label: string, value: unknown) => {
      addPageIfNeeded(32);
      document.font("Helvetica-Bold").fontSize(9).fillColor("#374151").text(`${pdfText(label)}: `, {
        continued: true,
      });
      document.font("Helvetica").fillColor("#111827").text(pdfText(value), { width: 503 });
    };
    const block = (label: string, value: unknown) => {
      addPageIfNeeded(48);
      document.font("Helvetica-Bold").fontSize(9).fillColor("#374151").text(pdfText(label));
      document.font("Helvetica").fontSize(8).fillColor("#111827").text(pdfJson(value), {
        width: 503,
      });
      document.moveDown(0.2);
    };
    const humanList = (label: string, values: string[]) => {
      block(label, values.length > 0 ? values.join("\n") : "Sin evidencia registrada");
    };
    const divider = () => {
      addPageIfNeeded(14);
      document.moveDown(0.15).strokeColor("#d1d5db").lineWidth(0.5)
        .moveTo(46, document.y).lineTo(549, document.y).stroke().moveDown(0.25);
    };

    document.font("Helvetica-Bold").fontSize(22).fillColor("#17324d")
      .text("Informe individual de aprendizaje");
    document.moveDown(0.3);
    document.font("Helvetica").fontSize(10).fillColor("#4b5563")
      .text("FactorIzA-Play · reporte descargable para docentes");
    document.moveDown(0.8);
    field("Nombre del estudiante", student.pseudonym);
    field("Código de estudiante / clase", student.classCode);
    field("Fecha de generación", bogotaDate(generatedAt));

    heading("Perfil y progreso");
    field("Perfil inicial", student.initialProfile);
    field("Perfil actual", storedProfile?.profile);
    field("Rango inicial", student.initialRank);
    field("Rango actual", rank);
    field("XP total", student.totalXP);
    field("Insignias conseguidas", badges.join(", ") || "Ninguna registrada");

    heading("Diagnóstico inicial");
    if (storedProfile) {
      field("Resultado general", reportScore(storedProfile.overallScore));
      field("Nivel inicial", storedProfile.level);
      humanList(
        "Resultados por categoría",
        moduleResults.flatMap((module) => {
          const moduleTitle = typeof module.title === "string" ? module.title : "Competencia";
          const topics = Array.isArray(module.topics) ? module.topics as Array<Record<string, unknown>> : [];
          return topics.map((topic) =>
            `${moduleTitle} · ${typeof topic.label === "string"
              ? topic.label
              : DIAGNOSTIC_LABELS[String(topic.category)] ?? String(topic.category ?? "Categoría")} · ${reportScore(topic.score)}`,
          );
        }),
      );
      humanList(
        "Competencias generales",
        competencyResults.map((item) =>
          `${PROFILE_LABELS[String(item.competency)] ?? String(item.competency ?? "Competencia")} · ${reportScore(item.score)}`,
        ),
      );
      humanList(
        "Módulos que necesitó fortalecer",
        moduleResults
          .filter((module) => module.needsStrengthening === true)
          .map((module) => String(module.title ?? module.id)),
      );
      const route = profileData.personalizedRoute as Record<string, unknown> | undefined;
      field("Ruta generada automáticamente", route?.title ?? profileData.route);
      humanList(
        "Secuencia de la ruta",
        Array.isArray(route?.steps)
          ? (route.steps as Array<Record<string, unknown>>).map((step) => String(step.title ?? step.id))
          : [],
      );
    } else {
      field("Estado", "No hay diagnóstico registrado");
    }

    heading("Calificación académica");
    field("Calificación general", academic.general.grade == null ? "Pendiente" : academic.general.grade.toFixed(1));
    field("Cobertura general", `${Math.round(academic.general.coverage * 100)}%`);
    field(
      "Pensamiento Numérico",
      academic.pensamientoNumerico.grade == null ? "Pendiente" : academic.pensamientoNumerico.grade.toFixed(1),
    );
    field(
      "Pensamiento Algebraico",
      academic.pensamientoAlgebraico.grade == null ? "Pendiente" : academic.pensamientoAlgebraico.grade.toFixed(1),
    );
    field(
      "Componentes ausentes",
      academic.general.missingComponents.length > 0
        ? academic.general.missingComponents.join(", ")
        : "Ninguno",
    );
    humanList(
      "Calificaciones por tema",
      academic.topics.map((topic) =>
        `${topic.title ?? topic.moduleId} · nota ${reportGrade(topic.grade)} · cobertura ${Math.round(topic.coverage * 100)}%`,
      ),
    );
    humanList(
      "Resultados de diagnóstico por categoría",
      Object.entries(academic.diagnosticGrades).map(([category, grade]) =>
        `${DIAGNOSTIC_LABELS[category] ?? category} · nota ${reportGrade(grade)}`,
      ),
    );

    heading("Aprendizaje de la factorización");
    for (const item of caseSummaries) {
      field(
        item.label,
        `Nota: ${reportGrade(item.grade)} · Intentos: ${item.attempts} · Errores detectados: ${item.errors} · Errores corregidos: ${item.corrected} · Errores persistentes: ${item.persistent}`,
      );
    }

    heading("Indicadores de aprendizaje");
    field("Total de errores detectados", totalDetectedErrors);
    field("Total de errores corregidos", totalCorrectedErrors);
    field("Total de errores persistentes", totalPersistentErrors);
    field(
      "Porcentaje de corrección de errores",
      totalDetectedErrors > 0
        ? `${Math.round((totalCorrectedErrors / totalDetectedErrors) * 100)}%`
        : "Sin errores detectados",
    );

    heading("Ejercicios de transferencia");
    field("Número total", transferRows.length);
    field("Correctos", transferCorrect);
    field("Incorrectos", transferRows.length - transferCorrect);
    humanList(
      "Nivel de dominio por tema",
      caseSummaries.map((item) => `${item.label} · ${item.mastery}`),
    );

    heading("Interacción con el sistema de tutoría");
    field("Tiempo total de uso", reportDuration(totalUseSeconds));
    field("Número de sesiones realizadas", learning.length);
    field("Cantidad de pistas utilizadas", hintsUsed);
    field("Cantidad de retroalimentaciones consultadas", feedbackViews);
    field("XP obtenida", earnedXp > 0 ? earnedXp : student.totalXP);
    field("Insignias conseguidas", badges.join(", ") || "Ninguna registrada");

    heading("Resumen para investigación");
    humanList("Fortalezas identificadas", strengths);
    humanList("Dificultades identificadas", difficulties);
    humanList("Progreso observado", [
      `Perfil inicial: ${student.initialProfile ?? "Sin evidencia"} → perfil final: ${storedProfile?.profile ?? "Sin evidencia"}`,
      `Rango inicial: ${student.initialRank ?? "Sin evidencia"} → rango final: ${rank}`,
      `Diagnóstico inicial: ${reportScore(storedProfile?.overallScore)} → desempeño académico final: ${reportGrade(academic.general.grade)}`,
    ]);

    heading("Evidencias y ejercicios trabajados");
    if (results.length === 0) field("Estado", "No hay intentos registrados");
    field(
      "Imágenes de factorización incluidas",
      researchRows.filter((row) => Boolean(row.evidenceDriveFileId || row.evidenceUrl)).length,
    );
    // Fetch, normalize, embed, and release each source image before moving on
    // to the next attempt. PDFKit retains page objects for footer numbering,
    // but no source evidence buffers are retained in the report.
    for (const row of results) {
      if (clientGone || document.destroyed) return;
      const controlledId = row.evidenceDriveFileId ??
        controlledEvidenceFileId(row.evidenceUrl, normalizedClassCode, req.get("host"));
      let evidence: Evidence | null = null;
      if (controlledId) {
        evidence = await evidenceFor(controlledId);
      } else if (row.evidenceUrl) {
        evidence = {
          error: "Enlace registrado, pero no se descargó por no ser un destino controlado",
        };
      }
      if (clientGone || document.destroyed) return;
      addPageIfNeeded(100);
      document.roundedRect(46, document.y, 503, 18).fill("#eaf2f7");
      document.fillColor("#17324d").font("Helvetica-Bold").fontSize(9)
        .text(
          `Ejercicio: ${pdfText(row.exerciseId)}${
            isRetiredCase(row.exerciseId, row.moduleId, row.topicName)
              ? " (Caso retirado)" : ""
          }`,
          53,
          document.y + 5,
        );
      document.y += 23;
      field("Módulo / tema", `${row.moduleId ?? "—"} / ${row.topicName ?? "—"}`);
      field("Pregunta", row.questionText);
      field("Respuesta", row.answer);
      field("Respuesta correcta", row.correctAnswer);
      field("Correcto", row.correct ? "Sí" : "No");
      field("Categoría del error", row.errorCategory);
      field("Número de intentos", row.attempts);
      field("Pistas utilizadas", row.hintsUsed);
      field("Vistas de retroalimentación", row.feedbackViews);
      field("Duración (segundos)", row.durationSeconds);
      field("Fecha y hora", bogotaDate(row.createdAt));
      const evidenceMetadata = row.evidenceMetadata as Record<string, unknown> | null;
      block("Metadatos pedagógicos de evidencia", {
        fileName: evidenceMetadata?.fileName ?? evidenceMetadata?.name,
        topic: row.topicName,
        exercise: row.exerciseId,
        format: evidenceMetadata?.mimeType,
        sizeBytes: evidenceMetadata?.size,
        date: row.createdAt,
      });
      if (row.evidenceDriveFileId || row.evidenceUrl) {
        if (evidence?.bytes && evidence.mime) {
          try {
            addPageIfNeeded(290);
            document.font("Helvetica-Bold").fontSize(9).fillColor("#374151")
              .text("Foto de evidencia");
            document.image(evidence.bytes, {
              fit: [470, 250],
              align: "center",
              valign: "center",
            });
            document.moveDown(0.3);
          } catch {
            field("Foto de evidencia", "Evidencia no disponible: no se pudo insertar la imagen");
          }
          // Do not let the local reference keep the source bytes alive for
          // subsequent attempts.
          evidence = null;
        } else {
          field("Foto de evidencia", `Evidencia no disponible: ${evidence?.error ?? "sin archivo"}`);
        }
      }
      divider();
    }

    heading("Sesiones y reflexiones metacognitivas");
    humanList(
      "Sesiones realizadas",
      learning.map((session) =>
        `${session.activityId} · ${reportDuration(session.durationSeconds ?? 0)}`,
      ),
    );
    if (latestSessionReflection) {
      field("Hoy comprendí...", latestSessionReflection.understood);
      field("Hoy me equivoqué en...", latestSessionReflection.mistakes);
      field("Lo que más me ayudó fue...", latestSessionReflection.helpful);
      field("Lo que todavía no entiendo es...", latestSessionReflection.remainingQuestions);
    } else {
      field("Reflexiones de sesión", "Sin evidencia registrada");
    }
    humanList(
      "Reflexiones de módulo",
      modules.map((reflection) =>
        `${reflection.moduleId}: ${reflection.aspectsWorked ?? "Sin respuesta"}`
          + ` · Dificultades: ${reflection.difficulties ?? "Sin respuesta"}`,
      ),
    );
    const latestWeekly = [...allWeekly].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
    if (latestWeekly) {
      field("Reflexión semanal más reciente", latestWeekly.mostImportant);
      field("Dificultad semanal principal", latestWeekly.mainDifficulty);
      field("Ayuda recibida del sistema", latestWeekly.appHelp);
    }
    if (clientGone || document.destroyed) return;

    // Pages are buffered specifically so this post-pass cannot create pages
    // or change the content cursor. Never use pageAdded for footer drawing:
    // pageAdded also fires for automatic text pagination.
    const pages = document.bufferedPageRange();
    const contentCursor = { x: document.x, y: document.y };
    for (let index = pages.start; index < pages.start + pages.count; index += 1) {
      document.switchToPage(index);
      document.save()
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#6b7280");
      const footerText = `FactorIzA-Play · Informe individual · Página ${index + 1}`;
      const footerWidth = document.widthOfString(footerText);
      document.text(footerText, (document.page.width - footerWidth) / 2, 805, {
        lineBreak: false,
      })
        .restore();
    }
    document.switchToPage(pages.start + pages.count - 1);
    document.x = contentCursor.x;
    document.y = contentCursor.y;
    document.flushPages();
    document.end();
    } catch (error) {
      // Headers are already committed. Never attempt a JSON error response;
      // terminate the PDF stream instead.
      if (!clientGone && !document.destroyed) {
        document.destroy(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      req.off("aborted", abortReport);
      res.off("close", onResponseClose);
    }
  },
);

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
