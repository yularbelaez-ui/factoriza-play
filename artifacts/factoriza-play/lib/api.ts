/**
 * Minimal API client for FactorIzA-Play.
 * Works on both web (relative URL) and native (uses EXPO_PUBLIC_API_URL).
 */
import { Platform } from "react-native";
import type { DiagnosticProfile } from "@/data/diagnostic";
import type { AcademicSummary } from "@/lib/academicGrading";

// On native builds, EXPO_PUBLIC_API_URL must be the absolute production URL.
// Example: https://mi-app.replit.app/api-server
// On web it uses a relative path.
const BASE =
  process.env["EXPO_PUBLIC_API_URL"] ??
  (Platform.OS === "web" ? "" : "");

const API = `${BASE}/api`;

export function apiEvidencePreviewUrl(classCode: string, driveFileId: string): string {
  return `${API}/class/${encodeURIComponent(classCode)}/evidence/${encodeURIComponent(driveFileId)}`;
}

// Whether the API base URL is usable (non-empty on native)
export const apiAvailable =
  Platform.OS === "web" || (BASE !== "" && BASE !== "undefined");

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!apiAvailable) {
    throw new Error("SIN_CONEXION");
  }
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("SIN_CONEXION");
  }
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("El servidor respondió de forma inesperada. Intenta de nuevo.");
  }
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? "Error del servidor");
  }
  return json as T;
}

// ── Auth ──────────────────────────────────────────────────────────

export interface ApiStudentData {
  id: number;
  pseudonym: string;
  classCode: string;
  totalXP: number;
  streak: number;
  dailyXP: number;
  dailyXPDate?: string | null;
  streakLastDate?: string | null;
  completedTopics: string[];
  completedModules: string[];
  completedExercises: string[];
  diagnosticProfile?: DiagnosticProfile | null;
  initialProfile?: string | null;
  initialRank?: string | null;
  profileHistory?: Array<Record<string, unknown>>;
  rankHistory?: Array<Record<string, unknown>>;
  rank?: {
    name: string;
    icon: string;
    minXP: number;
    maxXP: number | null;
    nextName: string | null;
    nextIcon: string | null;
    nextXP: number | null;
    progressPercent: number;
  };
  badges?: { id: string; label: string; icon: string }[];
}

export async function apiLoginStudent(
  pseudonym: string,
  classCode: string
): Promise<{ studentId: number; student: ApiStudentData }> {
  return apiFetch("/auth/student", {
    method: "POST",
    body: JSON.stringify({ pseudonym, classCode }),
  });
}

export async function apiLoginTeacher(
  teacherCode: string
): Promise<{ teacherId: number; teacherCode: string }> {
  return apiFetch("/auth/teacher", {
    method: "POST",
    body: JSON.stringify({ teacherCode }),
  });
}

// ── Student actions ───────────────────────────────────────────────

export async function apiRecordExercise(
  studentId: number,
  data: {
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
  }
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/exercise`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiRecordHint(
  studentId: number,
  data: { exerciseId: string; hintId: string; clientId: string },
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/hint`, { method: "POST", body: JSON.stringify(data) });
}

export async function apiRecordFeedbackView(
  studentId: number,
  exerciseClientId: string,
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/feedback-view`, {
    method: "POST",
    body: JSON.stringify({ exerciseClientId }),
  });
}

export async function apiUploadExerciseEvidence(
  studentId: number,
  data: {
    exerciseId: string;
    topicName: string;
    imageBase64: string;
    clientId: string;
    mimeType?: string;
  }
): Promise<{ evidence: { url: string | null; driveFileId: string | null } }> {
  return apiFetch(`/students/${studentId}/evidence`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiSaveModuleReflection(
  studentId: number,
  data: {
    moduleId: string;
    aspectsWorked: string;
    difficulties: string;
    improvementSuggestions: string;
    clientId: string;
  }
): Promise<{ reflection: ApiModuleReflection }> {
  return apiFetch(`/students/${studentId}/reflection`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface ApiSessionReflection {
  id: number;
  sessionId: string;
  understood: string;
  mistakes: string;
  helpful: string;
  remainingQuestions: string;
  createdAt: string;
}

export interface ApiLearningSession {
  id: number;
  activityId: string;
  clientId: string;
  status: string;
  startedAt: string;
  reflectedAt?: string | null;
  completedAt?: string | null;
  durationSeconds?: number | null;
}

export async function apiStartLearningSession(
  studentId: number,
  activityId: string,
  clientId: string,
): Promise<{ session: ApiLearningSession }> {
  return apiFetch(`/students/${studentId}/sessions`, {
    method: "POST",
    body: JSON.stringify({ activityId, clientId }),
  });
}

export async function apiSaveSessionReflection(
  studentId: number,
  data: {
    sessionId: string;
    understood: string;
    mistakes: string;
    helpful: string;
    remainingQuestions: string;
    clientId: string;
  }
): Promise<{ reflection: ApiSessionReflection; student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/session-reflection`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface ApiWeeklyReflection {
  id: number;
  weekStart: string;
  mostImportant: string;
  mainDifficulty: string;
  appHelp: string;
  advice: string;
  createdAt: string;
}

export async function apiSaveWeeklyReflection(
  studentId: number,
  data: {
    weekStart: string;
    mostImportant: string;
    mainDifficulty: string;
    appHelp: string;
    advice: string;
    clientId: string;
  }
): Promise<{ reflection: ApiWeeklyReflection; student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/weekly-reflection`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiCompleteTopic(
  studentId: number,
  topicId: string,
  sessionId: string,
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/topics`, {
    method: "POST",
    body: JSON.stringify({ topicId, sessionId }),
  });
}

export async function apiCompleteModule(
  studentId: number,
  moduleId: string,
  sessionId: string
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/modules`, {
    method: "POST",
    body: JSON.stringify({ moduleId, sessionId }),
  });
}

export async function apiSaveDiagnosticProfile(
  studentId: number,
  diagnosticProfile: DiagnosticProfile,
  sessionId: string,
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/diagnostic`, {
    method: "POST",
    body: JSON.stringify({ diagnosticProfile, sessionId }),
  });
}

// ── Teacher / Class ───────────────────────────────────────────────

export async function apiGetClassStudents(
  classCode: string
): Promise<{ students: ApiStudentData[] }> {
  return apiFetch(`/class/${classCode}/students`, { cache: "no-store" });
}

export async function apiGetClassErrors(
  classCode: string
): Promise<{ errors: { category: string; count: number; percentage: string }[] }> {
  return apiFetch(`/class/${classCode}/errors`);
}

export interface ApiTopicStat {
  moduleId: string;
  studentsInvolved: number;
  exerciseCount: number;
  errorCount: number;
  hintsUsed: number;
  avgDurationSeconds: number | null;
  totalDurationSeconds: number;
}

export async function apiGetClassTopicStats(
  classCode: string
): Promise<{ topics: ApiTopicStat[] }> {
  return apiFetch(`/class/${classCode}/topic-stats`);
}

export interface ApiExerciseAnalytics {
  exerciseId: string;
  correctCount: number;
  incorrectCount: number;
  attemptsTotal: number;
  hintsUsed: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number | null;
  attempts: ApiExerciseAttempt[];
}

export interface ApiExerciseAttempt {
  correct: boolean;
  attempts: number;
  errorCategory?: string | null;
  feedbackViews?: number;
  answer: string | null;
  questionText: string | null;
  topicName: string | null;
  correctAnswer: string | null;
  evidenceUrl: string | null;
  evidenceDriveFileId: string | null;
  createdAt: string;
}

export interface ApiModuleReflection {
  id: number;
  moduleId: string;
  aspectsWorked: string | null;
  difficulties: string | null;
  improvementSuggestions: string | null;
  createdAt: string;
}

export interface ApiModuleAnalytics {
  moduleId: string;
  correctCount: number;
  incorrectCount: number;
  attemptsTotal: number;
  hintsUsed: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number | null;
  repeatedExercises: number;
  exercises: ApiExerciseAnalytics[];
  reflections: ApiModuleReflection[];
}

export interface ApiStudentAnalytics {
  studentId: number;
  pseudonym: string | null;
  diagnosticProfile?: DiagnosticProfile | null;
  completedTopics: string[];
  completedModules: string[];
  reinforcedTopics: string[];
  additionalActivities: string[];
  sessionReflections: ApiSessionReflection[];
  weeklyReflections: ApiWeeklyReflection[];
  modules: ApiModuleAnalytics[];
  academicSummary?: AcademicSummary;
}

export async function apiGetClassStudentAnalytics(
  classCode: string
): Promise<{ students: ApiStudentAnalytics[] }> {
  return apiFetch(`/class/${classCode}/student-analytics`);
}

export async function apiGetTeacherClasses(
  teacherCode: string
): Promise<{ classes: { code: string; label: string; studentCount: number }[] }> {
  return apiFetch(`/teacher/${teacherCode}/classes`);
}

export async function apiCreateEvalCode(
  teacherCode: string,
  classCode: string,
  moduleId: string,
  code: string
): Promise<{ evalCode: { moduleId: string; code: string; classCode: string } }> {
  return apiFetch(`/teacher/${teacherCode}/classes/${classCode}/eval-code`, {
    method: "POST",
    body: JSON.stringify({ moduleId, code }),
  });
}

export async function apiValidateEvaluationCode(
  studentId: number,
  code: string,
): Promise<{ evaluation: { moduleId: string; code: string } }> {
  return apiFetch(`/students/${studentId}/evaluation-code`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function apiDeleteStudent(
  teacherCode: string,
  studentId: number
): Promise<{ deleted: boolean; studentId: number }> {
  return apiFetch(
    `/teacher/${encodeURIComponent(teacherCode)}/students/${studentId}`,
    { method: "DELETE" }
  );
}

export function apiResearchExportUrl(teacherCode: string, classCode: string): string {
  return `${API}/teacher/${encodeURIComponent(teacherCode)}/classes/${encodeURIComponent(classCode)}/export`;
}

export async function apiStudentPdfUrl(
  teacherCode: string,
  classCode: string,
  studentId: number,
): Promise<string> {
  const response = await apiFetch<{ url: string }>("/teacher/student-report-token", {
    method: "POST",
    body: JSON.stringify({ teacherCode, classCode, studentId }),
  });
  if (!response.url) throw new Error("El servidor no devolvió un enlace de informe.");
  if (/^https?:\/\//i.test(response.url)) return response.url;
  const base = BASE.replace(/\/+$/, "");
  return response.url.startsWith("/")
    ? `${base}${response.url}`
    : `${API}/${response.url}`;
}
