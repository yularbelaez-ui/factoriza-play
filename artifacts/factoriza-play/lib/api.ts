/**
 * Minimal API client for FactorIzA-Play.
 * Works on both web (relative URL) and native (uses EXPO_PUBLIC_API_URL).
 */
import { Platform } from "react-native";
import type { DiagnosticProfile } from "@/data/diagnostic";

// On native builds, EXPO_PUBLIC_API_URL must be the absolute production URL.
// Example: https://mi-app.replit.app/api-server
// On web it uses a relative path.
const BASE =
  process.env["EXPO_PUBLIC_API_URL"] ??
  (Platform.OS === "web" ? "" : "");

const API = `${BASE}/api`;

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
  completedTopics: string[];
  completedModules: string[];
  completedExercises: string[];
  diagnosticProfile?: DiagnosticProfile | null;
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
    durationSeconds?: number | null;
    clientId?: string | null;
  }
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/exercise`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiCompleteTopic(
  studentId: number,
  topicId: string
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/topics`, {
    method: "POST",
    body: JSON.stringify({ topicId }),
  });
}

export async function apiCompleteModule(
  studentId: number,
  moduleId: string
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/modules`, {
    method: "POST",
    body: JSON.stringify({ moduleId }),
  });
}

export async function apiSaveDiagnosticProfile(
  studentId: number,
  diagnosticProfile: DiagnosticProfile
): Promise<{ student: ApiStudentData }> {
  return apiFetch(`/students/${studentId}/diagnostic`, {
    method: "POST",
    body: JSON.stringify({ diagnosticProfile }),
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

export async function apiDeleteStudent(
  teacherCode: string,
  studentId: number
): Promise<{ deleted: boolean; studentId: number }> {
  return apiFetch(
    `/teacher/${encodeURIComponent(teacherCode)}/students/${studentId}`,
    { method: "DELETE" }
  );
}
