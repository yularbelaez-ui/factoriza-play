import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { DiagnosticProfile } from "@/data/diagnostic";
import {
  apiLoginStudent,
  apiLoginTeacher,
  apiRecordExercise,
  apiCompleteTopic,
  apiCompleteModule,
  apiGetTeacherClasses,
  apiGetClassStudents,
  apiDeleteStudent,
  apiSaveDiagnosticProfile,
  apiUploadExerciseEvidence,
} from "@/lib/api";
import { LEARNING_ROUTES, isLearningRouteCompleted } from "@/data/learningRoutes";

export type UserRole = "student" | "teacher";

export interface StudentRecord {
  id: string;
  backendId?: number; // numeric ID from the API server
  pseudonym: string;
  classCode: string;
  avatar: string;
  streak: number;
  totalXP: number;
  completedModules: string[];
  completedTopics: string[];
  completedExercises: string[];
  exerciseResults: ExerciseResult[];
  lastLogin: number;
  diagnosticProfile?: DiagnosticProfile;
}

export interface ExerciseResult {
  exerciseId: string;
  moduleId: string;
  correct: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  errorCategory: string;
  timestamp: number;
  attempts: number;
  hintsUsed?: number;
  durationSeconds?: number;
  questionText?: string;
  topicName?: string;
  evidenceBase64?: string;
  evidenceMimeType?: string;
}

// A submission that failed to reach the server and must be retried so XP,
// the community ranking and the teacher panel never silently lose data.
interface PendingExerciseSync {
  clientId: string;
  backendId: number;
  exerciseId: string;
  moduleId: string;
  correct: boolean;
  errorCategory: string | null;
  attempts: number;
  answer: string | null;
  hintsUsed: number;
  durationSeconds: number | null;
  questionText: string | null;
  topicName: string | null;
  correctAnswer: string | null;
  evidenceBase64?: string;
  evidenceMimeType?: string;
}

function generateClientId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getExerciseXp(result: Pick<ExerciseResult, "moduleId" | "correct" | "attempts">): number {
  if (result.moduleId.startsWith("support:")) {
    if (!result.correct) return 0;
    return result.attempts <= 1 ? 10 : 5;
  }
  return result.correct ? 20 : 3;
}

export interface ClassCode {
  code: string;
  label: string;
  createdAt: number;
}

export interface ModuleProgress {
  moduleId: string;
  theoryRead: boolean;
  completedLevels: number[];
}

export interface UnlockedModule {
  moduleId: string;
}

export interface EvaluationSession {
  moduleId: string;
  code: string;
  unlockedAt: number;
}

export interface ErrorSummary {
  category: string;
  label: string;
  count: number;
  percentage: number;
}

const TEACHER_CODE = "Karyul04";

// Orden de desbloqueo progresivo de los casos activos.
const MODULE_ORDER = [
  "factor-comun",
  "agrupacion-terminos",
  "trinomio-cuadrado-perfecto",
  "diferencia-cuadrados",
  "trinomio-forma-x2-bx-c",
  "cubo-binomio",
  "suma-diferencia-cubos",
];

function computeUnlocked(student: StudentRecord | null): string[] {
  if (!student) return [];
  const profileCode =
    student.diagnosticProfile?.profile ??
    (student.diagnosticProfile?.level === "básico"
      ? "A"
      : student.diagnosticProfile?.level === "intermedio"
        ? "B"
        : "C");
  const routeId =
    student.diagnosticProfile?.route ??
    (profileCode === "A" ? "ruta-1" : profileCode === "B" ? "ruta-2" : "ruta-3");
  const route = student.diagnosticProfile ? LEARNING_ROUTES[routeId] : null;
  const needsRouteBeforeModules =
    route &&
    route.steps.some((step) => step.topicId) &&
    !isLearningRouteCompleted(
      route,
      student.completedTopics ?? [],
      student.completedModules ?? []
    );

  if (needsRouteBeforeModules) return [];

  const completedModules = student.completedModules ?? [];
  const unlocked = [MODULE_ORDER[0]];
  for (let i = 0; i < MODULE_ORDER.length - 1; i++) {
    if (completedModules.includes(MODULE_ORDER[i])) {
      unlocked.push(MODULE_ORDER[i + 1]);
    }
  }
  return unlocked;
}

const ERROR_CATEGORIES: Record<string, string> = {
  operaciones: "Conocimientos previos · operaciones básicas",
  ley_signos: "Conocimientos previos · ley de signos",
  variables: "Pensamiento algebraico · uso de variables",
  equality: "Pensamiento algebraico · signo igual",
  potenciacion: "Conocimientos previos · potenciación",
  radicacion: "Conocimientos previos · radicación",
  arithmetic: "Conocimientos previos · operaciones aritméticas",
  powers: "Conocimientos previos · potencias",
  operations: "Conocimientos previos · operaciones numéricas",
  terminos_semejantes: "Pensamiento algebraico · términos semejantes",
  estructura_no_reconocida: "Pensamiento algebraico · reconocimiento de estructuras",
  estrategia_incorrecta: "Factorización · estrategia no corresponde",
  factor_comun_no_identificado: "Factorización · no identifica factor común",
  extraccion_factor_incorrecta: "Factorización · extracción incorrecta",
  caso_incorrecto: "Factorización · caso aplicado incorrectamente",
  sin_verificacion: "Factorización · no verifica el resultado",
  error_repetido: "Autorregulación · repite el mismo error",
  feedback_ignorado: "Autorregulación · no usa la retroalimentación",
};

const AVATARS = ["🎓", "🧑‍🎓", "👩‍🎓", "👨‍🎓", "🌟", "🚀", "💡", "🔢"];

const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

interface AppContextValue {
  // Auth
  isAuthenticated: boolean;
  role: UserRole;
  currentStudent: StudentRecord | null;
  login: (role: UserRole, pseudonym: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;

  // Teacher data
  classCodes: ClassCode[];
  addClassCode: (code: string, label: string) => void;
  removeClassCode: (code: string) => void;
  allStudents: StudentRecord[];
  unlockedModules: string[];
  evaluationCodes: EvaluationSession[];
  addEvaluationCode: (moduleId: string, code: string) => void;

  // Student actions
  recordExerciseResult: (
    result: Omit<ExerciseResult, "timestamp">,
    extra?: { hintsUsed?: number; durationSeconds?: number }
  ) => void;
  markTheoryRead: (moduleId: string) => void;
  completeLevel: (moduleId: string, level: number) => void;
  completeModule: (moduleId: string) => void;
  completeTopicPractice: (topicId: string) => void;
  moduleProgress: ModuleProgress[];
  saveDiagnosticProfile: (profile: DiagnosticProfile) => Promise<void>;

  // Teacher sync
  refreshTeacherData: () => Promise<void>;
  isRefreshingTeacher: boolean;
  refreshStudentRanking: (
    student?: Pick<StudentRecord, "backendId" | "classCode"> | null
  ) => Promise<void>;
  isRefreshingRanking: boolean;
  deleteStudent: (student: StudentRecord) => Promise<{ ok: boolean; error?: string }>;

  // Analytics
  getErrorSummary: (classCode?: string) => ErrorSummary[];
  getDiagnosticSummary: (classCode?: string) => { category: string; avgScore: number; count: number }[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>("student");
  const [currentStudent, setCurrentStudentState] = useState<StudentRecord | null>(null);
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([]);
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  // unlockedModules is derived from currentStudent.completedModules (no separate state needed)
  const [evaluationCodes, setEvaluationCodes] = useState<EvaluationSession[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [isRefreshingTeacher, setIsRefreshingTeacher] = useState(false);
  const [isRefreshingRanking, setIsRefreshingRanking] = useState(false);
  const [activeTeacherCode, setActiveTeacherCode] = useState<string | null>(null);

  // Ref so refreshTeacherData doesn't depend on allStudents (avoids infinite loop)
  const allStudentsRef = useRef<StudentRecord[]>([]);
  useEffect(() => { allStudentsRef.current = allStudents; }, [allStudents]);
  const currentStudentRef = useRef<StudentRecord | null>(null);
  useEffect(() => { currentStudentRef.current = currentStudent; }, [currentStudent]);
  const rankingRequestRef = useRef(0);
  const sessionChangedDuringLoadRef = useRef(false);

  // Exercise syncs that failed to reach the server (offline, cold start, etc.)
  // are queued here and retried on an interval and whenever the app comes
  // back to the foreground, so XP is never silently lost.
  const pendingSyncsRef = useRef<PendingExerciseSync[]>([]);
  const isRetryingSyncsRef = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem("factoriza_v2");
      if (sessionChangedDuringLoadRef.current) return;
      if (raw) {
        const data = JSON.parse(raw);
        if (data.allStudents) setAllStudents(data.allStudents);
        if (data.classCodes) setClassCodes(data.classCodes);
        if (data.evaluationCodes) setEvaluationCodes(data.evaluationCodes);
        if (Array.isArray(data.pendingExerciseSyncs)) {
          pendingSyncsRef.current = data.pendingExerciseSyncs;
        }
        // Restore session
        if (data.session) {
          const { role: r, studentId } = data.session;
          setRole(r);
          if (r === "teacher") {
            setActiveTeacherCode(data.session.teacherCode ?? TEACHER_CODE);
            setIsAuthenticated(true);
          } else if (studentId && data.allStudents) {
            const st = data.allStudents.find((s: StudentRecord) => s.id === studentId);
            if (st) {
              currentStudentRef.current = st;
              setCurrentStudentState(st);
              setModuleProgress(data.moduleProgress || []);
              setIsAuthenticated(true);
            }
          }
        }
      }
    } catch {}
  };

  const persist = useCallback(
    async (patch: Record<string, unknown>) => {
      try {
        const raw = await AsyncStorage.getItem("factoriza_v2");
        const existing = raw ? JSON.parse(raw) : {};
        await AsyncStorage.setItem("factoriza_v2", JSON.stringify({ ...existing, ...patch }));
      } catch {}
    },
    []
  );

  const login = async (
    loginRole: UserRole,
    pseudonym: string,
    code: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (loginRole === "teacher") {
      const trimCode = code.trim();
      // Try backend verification first
      let backendOk = false;
      try {
        await apiLoginTeacher(trimCode);
        backendOk = true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "SIN_CONEXION") {
          // API unreachable — validate against built-in code
          if (trimCode !== TEACHER_CODE) {
            return { ok: false, error: "Código de docente incorrecto." };
          }
          // Accepted offline
        } else {
          // Backend rejected the code
          return { ok: false, error: "Código de docente incorrecto." };
        }
      }
      // If backend responded OK, also load classes
      if (backendOk) {
        try {
          const { classes } = await apiGetTeacherClasses(trimCode);
          const backendCodes: ClassCode[] = classes.map((c) => ({
            code: c.code,
            label: c.label,
            createdAt: Date.now(),
          }));
          setClassCodes(backendCodes);
          await persist({ classCodes: backendCodes });
        } catch {}
      }
      setRole("teacher");
      setActiveTeacherCode(trimCode);
      sessionChangedDuringLoadRef.current = true;
      setIsAuthenticated(true);
      await persist({ session: { role: "teacher", teacherCode: trimCode } });
      return { ok: true };
    }

    // Student login
    const trimPseudo = pseudonym.trim();
    const trimCode = code.trim().toUpperCase();
    if (!trimPseudo) return { ok: false, error: "El seudónimo no puede estar vacío." };

    // Register or fetch student from backend (backend validates class code)
    let backendId: number;
    let backendStudent: {
      id: number; pseudonym: string; classCode: string;
      totalXP: number; streak: number;
      completedTopics: string[]; completedModules: string[]; completedExercises: string[];
      diagnosticProfile?: DiagnosticProfile | null;
    };
    try {
      const res = await apiLoginStudent(trimPseudo, trimCode);
      backendId = res.studentId;
      backendStudent = res.student;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de conexión";
      if (msg === "SIN_CONEXION") {
        return { ok: false, error: "Sin conexión al servidor. Verifica que tengas internet y que el servidor esté activo." };
      }
      return { ok: false, error: msg };
    }

    // Merge with local record (keep exerciseResults, avatar, diagnosticProfile locally)
    const existing = allStudents.find((s) => s.backendId === backendId);
    const student: StudentRecord = {
      id: existing?.id ?? `${trimCode}-${trimPseudo}-${Date.now()}`,
      backendId,
      pseudonym: backendStudent.pseudonym,
      classCode: backendStudent.classCode,
      avatar: existing?.avatar ?? getRandomAvatar(),
      streak: backendStudent.streak,
      totalXP: backendStudent.totalXP,
      completedModules: backendStudent.completedModules,
      completedTopics: backendStudent.completedTopics,
      completedExercises: backendStudent.completedExercises,
      exerciseResults: existing?.exerciseResults ?? [],
      lastLogin: Date.now(),
      diagnosticProfile: backendStudent.diagnosticProfile ?? existing?.diagnosticProfile,
    };

    const updatedStudents = existing
      ? allStudents.map((s) => (s.backendId === backendId ? student : s))
      : [...allStudents, student];

    setAllStudents(updatedStudents);
    setRole("student");
    sessionChangedDuringLoadRef.current = true;
    currentStudentRef.current = student;
    setCurrentStudentState(student);
    setIsAuthenticated(true);
    await persist({ allStudents: updatedStudents, session: { role: "student", studentId: student.id } });
    return { ok: true };
  };

  const logout = async () => {
    sessionChangedDuringLoadRef.current = true;
    setIsAuthenticated(false);
    currentStudentRef.current = null;
    setActiveTeacherCode(null);
    setCurrentStudentState(null);
    setRole("student");
    setModuleProgress([]);
    await persist({ session: null });
  };

  const addClassCode = (code: string, label: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || classCodes.find((c) => c.code === trimmed)) return;
    const entry: ClassCode = { code: trimmed, label, createdAt: Date.now() };
    setClassCodes((prev) => {
      const updated = [...prev, entry];
      persist({ classCodes: updated });
      return updated;
    });
  };

  const removeClassCode = (code: string) => {
    setClassCodes((prev) => {
      const updated = prev.filter((c) => c.code !== code);
      persist({ classCodes: updated });
      return updated;
    });
  };

  const deleteStudent = async (student: StudentRecord) => {
    if (!student.backendId) {
      return { ok: false, error: "Este perfil no está sincronizado con el servidor." };
    }
    const teacherCode = activeTeacherCode ?? TEACHER_CODE;
    try {
      await apiDeleteStudent(teacherCode, student.backendId);
      setAllStudents((previous) => {
        const updated = previous.filter(
          (candidate) => candidate.backendId !== student.backendId
        );
        persist({ allStudents: updated });
        return updated;
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "No se pudo eliminar el perfil.",
      };
    }
  };

  const completeModule = (moduleId: string) => {
    if (!currentStudent) return;
    if (currentStudent.completedModules.includes(moduleId)) return;
    const updated: StudentRecord = {
      ...currentStudent,
      completedModules: [...currentStudent.completedModules, moduleId],
    };
    currentStudentRef.current = updated;
    setCurrentStudentState(updated);
    setAllStudents((sts) => {
      const up = sts.map((s) => (s.id === updated.id ? updated : s));
      persist({ allStudents: up });
      return up;
    });
    if (currentStudent.backendId) {
      apiCompleteModule(currentStudent.backendId, moduleId).catch(() => {});
    }
  };

  const completeTopicPractice = (topicId: string) => {
    if (!currentStudent) return;
    const already = (currentStudent.completedTopics ?? []).includes(topicId);
    if (already) return;
    const updated: StudentRecord = {
      ...currentStudent,
      completedTopics: [...(currentStudent.completedTopics ?? []), topicId],
    };
    currentStudentRef.current = updated;
    setCurrentStudentState(updated);
    setAllStudents((sts) => {
      const up = sts.map((s) => (s.id === updated.id ? updated : s));
      persist({ allStudents: up });
      return up;
    });
    // Sync to backend silently
    if (currentStudent.backendId) {
      apiCompleteTopic(currentStudent.backendId, topicId).catch(() => {});
    }
  };

  const addEvaluationCode = (moduleId: string, code: string) => {
    setEvaluationCodes((prev) => {
      const updated = [
        ...prev.filter((e) => e.moduleId !== moduleId),
        { moduleId, code, unlockedAt: Date.now() },
      ];
      persist({ evaluationCodes: updated });
      return updated;
    });
  };

  const persistPendingSyncs = useCallback(() => {
    persist({ pendingExerciseSyncs: pendingSyncsRef.current });
  }, [persist]);

  // Attempts a single exercise sync against the server. Returns whether it
  // succeeded — callers decide whether to queue it for retry on failure.
  const attemptExerciseSync = useCallback(
    async (sync: PendingExerciseSync): Promise<boolean> => {
      try {
        await apiRecordExercise(sync.backendId, {
          exerciseId: sync.exerciseId,
          moduleId: sync.moduleId || null,
          correct: sync.correct,
          errorCategory: sync.errorCategory,
          attempts: sync.attempts,
          answer: sync.answer,
          hintsUsed: sync.hintsUsed,
          durationSeconds: sync.durationSeconds,
          clientId: sync.clientId,
          questionText: sync.questionText,
          topicName: sync.topicName,
          correctAnswer: sync.correctAnswer,
        });
        if (sync.evidenceBase64) {
          await apiUploadExerciseEvidence(sync.backendId, {
            exerciseId: sync.exerciseId,
            topicName: sync.topicName || sync.moduleId,
            imageBase64: sync.evidenceBase64,
            clientId: sync.clientId,
            mimeType: sync.evidenceMimeType,
          });
        }
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  // Retries every queued sync (e.g. after regaining connectivity or coming
  // back to the foreground). On success, refreshes the ranking so the
  // community tab and teacher panel pick up the now-confirmed XP.
  const retryPendingSyncs = useCallback(async () => {
    if (isRetryingSyncsRef.current || pendingSyncsRef.current.length === 0) return;
    isRetryingSyncsRef.current = true;
    try {
      let anySucceeded = false;
      const remaining: PendingExerciseSync[] = [];
      for (const sync of pendingSyncsRef.current) {
        const ok = await attemptExerciseSync(sync);
        if (ok) {
          anySucceeded = true;
        } else {
          remaining.push(sync);
        }
      }
      pendingSyncsRef.current = remaining;
      persistPendingSyncs();
      if (anySucceeded) {
        await refreshStudentRanking();
      }
    } finally {
      isRetryingSyncsRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptExerciseSync, persistPendingSyncs]);

  // Retry on an interval and whenever the app returns to the foreground.
  useEffect(() => {
    const interval = setInterval(() => { void retryPendingSyncs(); }, 15_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void retryPendingSyncs();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [retryPendingSyncs]);

  const recordExerciseResult = (
    result: Omit<ExerciseResult, "timestamp">,
    extra?: { hintsUsed?: number; durationSeconds?: number }
  ) => {
    if (!currentStudent) return;
    const hintsUsed = extra?.hintsUsed ?? 0;
    const durationSeconds = extra?.durationSeconds;
    const full: ExerciseResult = { ...result, timestamp: Date.now(), hintsUsed, durationSeconds };
    // Sync to backend, retrying later if it fails so XP is never lost.
    if (currentStudent.backendId) {
      const sync: PendingExerciseSync = {
        clientId: generateClientId(),
        backendId: currentStudent.backendId,
        exerciseId: result.exerciseId,
        moduleId: result.moduleId,
        correct: result.correct,
        errorCategory: result.errorCategory || null,
        attempts: result.attempts,
        answer: result.selectedAnswer || null,
        hintsUsed,
        durationSeconds: durationSeconds ?? null,
        questionText: result.questionText ?? null,
        topicName: result.topicName ?? null,
        correctAnswer: result.correctAnswer || null,
        evidenceBase64: result.evidenceBase64,
        evidenceMimeType: result.evidenceMimeType,
      };
      attemptExerciseSync(sync).then((ok) => {
        if (ok) {
          void refreshStudentRanking();
        } else {
          pendingSyncsRef.current = [...pendingSyncsRef.current, sync];
          persistPendingSyncs();
        }
      });
    }
    setCurrentStudentState((prev) => {
      if (!prev) return prev;
      const xpGained = getExerciseXp(result);
      const updated: StudentRecord = {
        ...prev,
        totalXP: prev.totalXP + xpGained,
        exerciseResults: [...prev.exerciseResults, full],
        completedExercises: result.correct
          ? [...new Set([...prev.completedExercises, result.exerciseId])]
          : prev.completedExercises,
        streak: result.correct ? prev.streak + 1 : prev.streak,
      };
      currentStudentRef.current = updated;
      setAllStudents((sts) => {
        const up = sts.map((s) => (s.id === updated.id ? updated : s));
        persist({ allStudents: up });
        return up;
      });
      persist({ session: { role: "student", studentId: updated.id } });
      return updated;
    });
  };

  const markTheoryRead = (moduleId: string) => {
    setModuleProgress((prev) => {
      const existing = prev.find((p) => p.moduleId === moduleId);
      const updated = existing
        ? prev.map((p) => (p.moduleId === moduleId ? { ...p, theoryRead: true } : p))
        : [...prev, { moduleId, theoryRead: true, completedLevels: [] }];
      persist({ moduleProgress: updated });
      return updated;
    });
  };

  const completeLevel = (moduleId: string, level: number) => {
    setModuleProgress((prev) => {
      const existing = prev.find((p) => p.moduleId === moduleId);
      const updated = existing
        ? prev.map((p) =>
            p.moduleId === moduleId
              ? { ...p, completedLevels: [...new Set([...p.completedLevels, level])] }
              : p
          )
        : [...prev, { moduleId, theoryRead: false, completedLevels: [level] }];
      persist({ moduleProgress: updated });
      return updated;
    });
  };

  const saveDiagnosticProfile = async (profile: DiagnosticProfile) => {
    if (!currentStudent) return;
    const updated: StudentRecord = { ...currentStudent, diagnosticProfile: profile };
    currentStudentRef.current = updated;
    setCurrentStudentState(updated);
    setAllStudents((sts) => {
      const up = sts.map((s) => (s.id === updated.id ? updated : s));
      persist({ allStudents: up });
      return up;
    });
    if (currentStudent.backendId) {
      try {
        await apiSaveDiagnosticProfile(currentStudent.backendId, profile);
      } catch {
        // The local profile remains available and will be retried on the next save.
      }
    }
  };

  const getErrorSummary = (classCode?: string): ErrorSummary[] => {
    const students = classCode
      ? allStudents.filter((s) => s.classCode === classCode)
      : allStudents;
    const wrongResults = students.flatMap((s) => s.exerciseResults).filter((r) => !r.correct);
    const total = wrongResults.length || 1;
    const counts: Record<string, number> = {};
    wrongResults.forEach((r) => {
      counts[r.errorCategory] = (counts[r.errorCategory] || 0) + 1;
    });
    return Object.entries(ERROR_CATEGORIES).map(([key, label]) => ({
      category: key,
      label,
      count: counts[key] || 0,
      percentage: Math.round(((counts[key] || 0) / total) * 100),
    }));
  };

  // The API is the source of truth for the XP used by the student ranking.
  const refreshStudentRanking = useCallback(async (
    requestedStudent?: Pick<StudentRecord, "backendId" | "classCode"> | null
  ) => {
    const studentSnapshot = requestedStudent ?? currentStudentRef.current;
    if (!studentSnapshot?.classCode) return;
    const backendId = studentSnapshot.backendId;
    const requestId = rankingRequestRef.current + 1;
    rankingRequestRef.current = requestId;

    setIsRefreshingRanking(true);
    try {
      const { students: backendStudents } = await apiGetClassStudents(
        studentSnapshot.classCode
      );
      const fetched: StudentRecord[] = backendStudents.map((bs) => {
        const existing =
          allStudentsRef.current.find((s) => s.backendId === bs.id) ??
          (bs.id === backendId &&
          currentStudentRef.current?.backendId === backendId
            ? currentStudentRef.current
            : undefined);
        return {
          id: existing?.id ?? `${bs.classCode}-${bs.pseudonym}-${bs.id}`,
          backendId: bs.id,
          pseudonym: bs.pseudonym,
          classCode: bs.classCode,
          avatar: existing?.avatar ?? getRandomAvatar(),
          streak: bs.streak,
          totalXP: bs.totalXP,
          completedModules: bs.completedModules,
          completedTopics: bs.completedTopics,
          completedExercises: bs.completedExercises,
          exerciseResults: existing?.exerciseResults ?? [],
          lastLogin: existing?.lastLogin ?? Date.now(),
          diagnosticProfile: bs.diagnosticProfile ?? existing?.diagnosticProfile,
        };
      });
      const otherClasses = allStudentsRef.current.filter(
        (student) => student.classCode !== studentSnapshot.classCode
      );
      const updatedStudents = [...otherClasses, ...fetched];
      if (rankingRequestRef.current !== requestId) {
        return;
      }
      setAllStudents(updatedStudents);
      await persist({ allStudents: updatedStudents });
    } catch {
      // Keep the last known ranking visible when the network is unavailable.
    } finally {
      if (rankingRequestRef.current === requestId) {
        setIsRefreshingRanking(false);
      }
    }
  }, [currentStudent?.backendId, currentStudent?.classCode, persist]);

  // Fetch all students for all class codes from the backend (teacher panel sync)
  const refreshTeacherData = useCallback(async () => {
    if (classCodes.length === 0) return;
    setIsRefreshingTeacher(true);
    try {
      const fetched: StudentRecord[] = [];
      for (const cc of classCodes) {
        try {
          const { students: backendStudents } = await apiGetClassStudents(cc.code);
          for (const bs of backendStudents) {
            const existing = allStudentsRef.current.find((s) => s.backendId === bs.id);
            fetched.push({
              id: existing?.id ?? `${bs.classCode}-${bs.pseudonym}-${bs.id}`,
              backendId: bs.id,
              pseudonym: bs.pseudonym,
              classCode: bs.classCode,
              avatar: existing?.avatar ?? getRandomAvatar(),
              streak: bs.streak,
              totalXP: bs.totalXP,
              completedModules: bs.completedModules,
              completedTopics: bs.completedTopics,
              completedExercises: bs.completedExercises,
              exerciseResults: existing?.exerciseResults ?? [],
              lastLogin: existing?.lastLogin ?? Date.now(),
              diagnosticProfile: bs.diagnosticProfile ?? existing?.diagnosticProfile,
            });
          }
        } catch {
          // keep going for other classes if one fails
        }
      }
      if (fetched.length > 0) {
        setAllStudents(fetched);
        await persist({ allStudents: fetched });
      }
    } finally {
      setIsRefreshingTeacher(false);
    }
  }, [classCodes, persist]);

  const getDiagnosticSummary = (classCode?: string) => {
    const students = (classCode
      ? allStudents.filter((s) => s.classCode === classCode)
      : allStudents
    ).filter((s) => s.diagnosticProfile);

    const categories = ["aritmetica", "propiedades", "terminos", "variables", "igualdad"];
    return categories.map((cat) => {
      const scores = students
        .map((s) => {
          if (cat === "aritmetica") {
            return s.diagnosticProfile!.competencyResults?.find((r) => r.competency === cat)?.score ?? null;
          }
          return s.diagnosticProfile!.competencyResults?.find((r) => r.competency === cat)?.score ??
            s.diagnosticProfile!.results.find((r) => r.category === cat)?.score ?? null;
        })
        .filter((s): s is number => s !== null);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { category: cat, avgScore: avg, count: scores.length };
    });
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        role,
        currentStudent,
        login,
        logout,
        classCodes,
        addClassCode,
        removeClassCode,
        allStudents,
        unlockedModules: computeUnlocked(currentStudent),
        evaluationCodes,
        addEvaluationCode,
        recordExerciseResult,
        markTheoryRead,
        completeLevel,
        completeModule,
        completeTopicPractice,
        moduleProgress,
        saveDiagnosticProfile,
        refreshTeacherData,
        isRefreshingTeacher,
        refreshStudentRanking,
        isRefreshingRanking,
        deleteStudent,
        getErrorSummary,
        getDiagnosticSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
