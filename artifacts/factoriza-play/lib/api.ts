/**
 * Minimal API client for FactorIzA-Play.
 * Works on both web (relative URL) and native (uses EXPO_PUBLIC_API_URL).
 */
import { Platform } from "react-native";

// On native builds, set EXPO_PUBLIC_API_URL to your Replit dev/prod domain.
// On web it falls back to relative path.
const BASE =
  process.env["EXPO_PUBLIC_API_URL"] ??
  (Platform.OS === "web" ? "" : "");

const API = `${BASE}/api`;

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? "API error");
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
    correct: boolean;
    errorCategory?: string | null;
    attempts?: number;
    answer?: string | null;
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

// ── Teacher / Class ───────────────────────────────────────────────

export async function apiGetClassStudents(
  classCode: string
): Promise<{ students: ApiStudentData[] }> {
  return apiFetch(`/class/${classCode}/students`);
}

export async function apiGetClassErrors(
  classCode: string
): Promise<{ errors: { category: string; count: number; percentage: string }[] }> {
  return apiFetch(`/class/${classCode}/errors`);
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
