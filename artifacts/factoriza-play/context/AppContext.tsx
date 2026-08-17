import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DiagnosticProfile } from "@/data/diagnostic";
import {
  apiLoginStudent,
  apiLoginTeacher,
  apiRecordExercise,
  apiCompleteTopic,
  apiGetTeacherClasses,
} from "@/lib/api";

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

// Orden de desbloqueo progresivo de los 8 casos de factorización
const MODULE_ORDER = [
  "factor-comun",           // Caso 1
  "agrupacion-terminos",    // Caso 2
  "trinomio-cuadrado-perfecto", // Caso 3
  "diferencia-cuadrados",   // Caso 4
  "trinomio-forma-x2-bx-c", // Caso 5
  "trinomio-ax2-bx-c",      // Caso 6
  "cubo-binomio",           // Caso 7
  "suma-diferencia-cubos",  // Caso 8
];

function computeUnlocked(completedModules: string[]): string[] {
  const unlocked = [MODULE_ORDER[0]];
  for (let i = 0; i < MODULE_ORDER.length - 1; i++) {
    if (completedModules.includes(MODULE_ORDER[i])) {
      unlocked.push(MODULE_ORDER[i + 1]);
    }
  }
  return unlocked;
}

const ERROR_CATEGORIES: Record<string, string> = {
  operaciones: "Operaciones aritméticas básicas",
  ley_signos: "Ley de signos",
  variables: "Variables y polinomios",
  equality: "El signo igual como equivalencia",
  potenciacion: "Propiedades de potenciación",
  radicacion: "Propiedades de radicación",
  arithmetic: "Operaciones aritméticas",
  powers: "Potenciación y radicación",
  operations: "Operaciones numéricas",
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
  recordExerciseResult: (result: Omit<ExerciseResult, "timestamp">) => void;
  markTheoryRead: (moduleId: string) => void;
  completeLevel: (moduleId: string, level: number) => void;
  completeModule: (moduleId: string) => void;
  completeTopicPractice: (topicId: string) => void;
  moduleProgress: ModuleProgress[];
  saveDiagnosticProfile: (profile: DiagnosticProfile) => Promise<void>;

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem("factoriza_v2");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.allStudents) setAllStudents(data.allStudents);
        if (data.classCodes) setClassCodes(data.classCodes);
        if (data.evaluationCodes) setEvaluationCodes(data.evaluationCodes);
        // Restore session
        if (data.session) {
          const { role: r, studentId } = data.session;
          setRole(r);
          if (r === "teacher") {
            setIsAuthenticated(true);
          } else if (studentId && data.allStudents) {
            const st = data.allStudents.find((s: StudentRecord) => s.id === studentId);
            if (st) {
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
      diagnosticProfile: existing?.diagnosticProfile,
    };

    const updatedStudents = existing
      ? allStudents.map((s) => (s.backendId === backendId ? student : s))
      : [...allStudents, student];

    setAllStudents(updatedStudents);
    setRole("student");
    setCurrentStudentState(student);
    setIsAuthenticated(true);
    await persist({ allStudents: updatedStudents, session: { role: "student", studentId: student.id } });
    return { ok: true };
  };

  const logout = async () => {
    setIsAuthenticated(false);
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

  const completeModule = (moduleId: string) => {
    if (!currentStudent) return;
    if (currentStudent.completedModules.includes(moduleId)) return;
    const updated: StudentRecord = {
      ...currentStudent,
      completedModules: [...currentStudent.completedModules, moduleId],
    };
    setCurrentStudentState(updated);
    setAllStudents((sts) => {
      const up = sts.map((s) => (s.id === updated.id ? updated : s));
      persist({ allStudents: up });
      return up;
    });
  };

  const completeTopicPractice = (topicId: string) => {
    if (!currentStudent) return;
    const already = (currentStudent.completedTopics ?? []).includes(topicId);
    if (already) return;
    const updated: StudentRecord = {
      ...currentStudent,
      completedTopics: [...(currentStudent.completedTopics ?? []), topicId],
    };
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

  const recordExerciseResult = (result: Omit<ExerciseResult, "timestamp">) => {
    if (!currentStudent) return;
    const full: ExerciseResult = { ...result, timestamp: Date.now() };
    // Sync to backend silently (fire-and-forget)
    if (currentStudent.backendId) {
      apiRecordExercise(currentStudent.backendId, {
        exerciseId: result.exerciseId,
        correct: result.correct,
        errorCategory: result.errorCategory || null,
        attempts: result.attempts,
        answer: result.selectedAnswer || null,
      }).catch(() => {});
    }
    setCurrentStudentState((prev) => {
      if (!prev) return prev;
      const xpGained = result.correct ? 20 : 3;
      const updated: StudentRecord = {
        ...prev,
        totalXP: prev.totalXP + xpGained,
        exerciseResults: [...prev.exerciseResults, full],
        completedExercises: result.correct
          ? [...new Set([...prev.completedExercises, result.exerciseId])]
          : prev.completedExercises,
        streak: result.correct ? prev.streak + 1 : prev.streak,
      };
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
    setCurrentStudentState(updated);
    setAllStudents((sts) => {
      const up = sts.map((s) => (s.id === updated.id ? updated : s));
      persist({ allStudents: up });
      return up;
    });
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

  const getDiagnosticSummary = (classCode?: string) => {
    const students = (classCode
      ? allStudents.filter((s) => s.classCode === classCode)
      : allStudents
    ).filter((s) => s.diagnosticProfile);

    const categories = ["naturales", "decimales", "enteros", "irracionales", "reales", "potencias", "factorizacion"];
    return categories.map((cat) => {
      const scores = students
        .map((s) => s.diagnosticProfile!.results.find((r) => r.category === cat)?.score ?? null)
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
        unlockedModules: computeUnlocked(currentStudent?.completedModules ?? []),
        evaluationCodes,
        addEvaluationCode,
        recordExerciseResult,
        markTheoryRead,
        completeLevel,
        completeModule,
        completeTopicPractice,
        moduleProgress,
        saveDiagnosticProfile,
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
