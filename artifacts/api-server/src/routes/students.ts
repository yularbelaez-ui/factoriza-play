import { Router } from "express";
import { db } from "@workspace/db";
import { students, exerciseResults, moduleReflections } from "@workspace/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router = Router();
const connectors = new ReplitConnectors();

type DriveFile = { id: string; name: string; webViewLink?: string };

async function driveJson(path: string, init?: RequestInit): Promise<any> {
  const response = await connectors.proxy("google-drive", path, init);
  if (!response.ok) throw new Error(`Google Drive API error (${response.status})`);
  return response.json();
}

async function findOrCreateDriveFolder(name: string, parentId?: string): Promise<string> {
  const escaped = name.replace(/'/g, "\\'");
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
    clientId: clientId.trim(),
    questionText: questionText ?? null,
    topicName: topicName ?? null,
    correctAnswer: correctAnswer ?? null,
  });

  // Update student XP, streak, completedExercises
  const isSupportExercise = moduleId?.startsWith("support:") ?? false;
  const xpGain = isSupportExercise
    ? correct
      ? (attempts ?? 1) <= 1
        ? 10
        : 5
      : 0
    : correct
      ? 20
      : 3;
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

// Accepts Expo's data:image/*;base64,... payload. The connector implementation
// is loaded only when used so installations without Drive remain compatible.
router.post("/students/:studentId/evidence", async (req, res) => {
  const studentId = Number.parseInt(req.params.studentId, 10);
  const { exerciseId, topicName, imageBase64, clientId, mimeType } =
    req.body as Record<string, unknown>;
  if (!Number.isInteger(studentId) || typeof exerciseId !== "string" ||
      typeof topicName !== "string" || typeof imageBase64 !== "string" ||
      typeof clientId !== "string" || !clientId.trim()) {
    res.status(400).json({ error: "exerciseId, topicName, imageBase64 and clientId are required" });
    return;
  }
  const existing = await db.select().from(exerciseResults).where(and(
    eq(exerciseResults.studentId, studentId), eq(exerciseResults.clientId, clientId.trim()),
  )).limit(1);
  if (!existing[0]) {
    res.status(409).json({ error: "Exercise result required before uploading evidence" });
    return;
  }
  if (existing[0]?.evidenceDriveFileId || existing[0]?.evidenceUrl) {
    res.json({ evidence: { url: existing[0].evidenceUrl, driveFileId: existing[0].evidenceDriveFileId } });
    return;
  }
  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  const raw = imageBase64.replace(/^data:[^;]+;base64,/, "");
  if (raw.length > 15_000_000) { res.status(413).json({ error: "Image too large" }); return; }
  try {
    const name = `${exerciseId}-${clientId.trim()}.jpg`;
    const uploaded = await uploadDriveEvidence(
      Buffer.from(raw, "base64"), name,
      typeof mimeType === "string" ? mimeType : "image/jpeg",
      ["FactorIzA-Play", student.pseudonym, topicName, exerciseId],
    );
    const driveFileId = uploaded.id;
    const url = uploaded.webViewLink ?? null;
    const [updated] = await db.update(exerciseResults).set({
          evidenceUrl: url, evidenceDriveFileId: driveFileId,
          evidenceMetadata: { folder: ["FactorIzA-Play", student.pseudonym, topicName, exerciseId].join("/"), mimeType, size: Buffer.byteLength(raw, "base64") },
        }).where(eq(exerciseResults.id, existing[0].id)).returning();
    res.status(201).json({ evidence: { url, driveFileId, resultId: updated?.id ?? null } });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Google Drive upload failed" });
  }
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
