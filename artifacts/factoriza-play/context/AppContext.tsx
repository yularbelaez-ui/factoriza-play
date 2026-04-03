import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "student" | "teacher";

export interface Student {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  totalXP: number;
  completedModules: string[];
  completedExercises: string[];
  exerciseResults: ExerciseResult[];
}

export interface ExerciseResult {
  exerciseId: string;
  moduleId: string;
  correct: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  errorCategory: string;
  timestamp: number;
}

export interface ModuleProgress {
  moduleId: string;
  theoryRead: boolean;
  exercisesCompleted: number;
  totalExercises: number;
  score: number;
}

export interface UnlockedModule {
  moduleId: string;
  unlockedAt: number;
}

export interface EvaluationSession {
  moduleId: string;
  code: string;
  unlockedAt: number;
}

interface AppContextValue {
  role: UserRole;
  setRole: (r: UserRole) => void;
  currentStudent: Student;
  setCurrentStudent: (s: Student) => void;
  allStudents: Student[];
  unlockedModules: string[];
  unlockModule: (moduleId: string) => void;
  evaluationCodes: EvaluationSession[];
  addEvaluationCode: (moduleId: string, code: string) => void;
  recordExerciseResult: (result: ExerciseResult) => void;
  markTheoryRead: (moduleId: string) => void;
  moduleProgress: ModuleProgress[];
  getErrorSummary: () => ErrorSummary[];
  xpForExercise: number;
}

export interface ErrorSummary {
  category: string;
  label: string;
  count: number;
  percentage: number;
}

const ERROR_CATEGORIES: Record<string, string> = {
  arithmetic: "Operaciones aritméticas y ley de signos",
  variables: "Interpretación de variables y polinomios",
  equality: "Comprensión del signo igual",
  operations: "Operaciones con conjuntos numéricos",
  powers: "Propiedades de potenciación y radicación",
};

const DEFAULT_STUDENT: Student = {
  id: "student-1",
  name: "Estudiante",
  avatar: "🎓",
  streak: 0,
  totalXP: 0,
  completedModules: [],
  completedExercises: [],
  exerciseResults: [],
};

const DEMO_STUDENTS: Student[] = [
  {
    id: "student-1",
    name: "Ana García",
    avatar: "👩‍🎓",
    streak: 5,
    totalXP: 420,
    completedModules: ["factor-comun", "diferencia-cuadrados"],
    completedExercises: [],
    exerciseResults: [],
  },
  {
    id: "student-2",
    name: "Carlos López",
    avatar: "👨‍🎓",
    streak: 3,
    totalXP: 310,
    completedModules: ["factor-comun"],
    completedExercises: [],
    exerciseResults: [],
  },
  {
    id: "student-3",
    name: "María Rodríguez",
    avatar: "👩‍🏫",
    streak: 7,
    totalXP: 580,
    completedModules: ["factor-comun", "diferencia-cuadrados", "suma-diferencia-cubos"],
    completedExercises: [],
    exerciseResults: [],
  },
  {
    id: "student-4",
    name: "José Martínez",
    avatar: "🧑‍🎓",
    streak: 1,
    totalXP: 120,
    completedModules: [],
    completedExercises: [],
    exerciseResults: [],
  },
  {
    id: "student-5",
    name: "Laura Torres",
    avatar: "👩‍💻",
    streak: 4,
    totalXP: 390,
    completedModules: ["factor-comun", "diferencia-cuadrados"],
    completedExercises: [],
    exerciseResults: [],
  },
];

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("student");
  const [currentStudent, setCurrentStudentState] = useState<Student>(DEFAULT_STUDENT);
  const [allStudents, setAllStudents] = useState<Student[]>(DEMO_STUDENTS);
  const [unlockedModules, setUnlockedModules] = useState<string[]>(["factor-comun"]);
  const [evaluationCodes, setEvaluationCodes] = useState<EvaluationSession[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem("factoriza_app_data");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.currentStudent) setCurrentStudentState(data.currentStudent);
        if (data.unlockedModules) setUnlockedModules(data.unlockedModules);
        if (data.evaluationCodes) setEvaluationCodes(data.evaluationCodes);
        if (data.moduleProgress) setModuleProgress(data.moduleProgress);
        if (data.allStudents) setAllStudents(data.allStudents);
      }
    } catch {}
  };

  const saveData = useCallback(
    async (updates: Partial<{
      currentStudent: Student;
      unlockedModules: string[];
      evaluationCodes: EvaluationSession[];
      moduleProgress: ModuleProgress[];
      allStudents: Student[];
    }>) => {
      try {
        const existing = await AsyncStorage.getItem("factoriza_app_data");
        const current = existing ? JSON.parse(existing) : {};
        await AsyncStorage.setItem(
          "factoriza_app_data",
          JSON.stringify({ ...current, ...updates })
        );
      } catch {}
    },
    []
  );

  const setRole = (r: UserRole) => setRoleState(r);

  const setCurrentStudent = (s: Student) => {
    setCurrentStudentState(s);
    saveData({ currentStudent: s });
    setAllStudents((prev) => {
      const updated = prev.map((st) => (st.id === s.id ? s : st));
      saveData({ allStudents: updated });
      return updated;
    });
  };

  const unlockModule = (moduleId: string) => {
    setUnlockedModules((prev) => {
      if (prev.includes(moduleId)) return prev;
      const updated = [...prev, moduleId];
      saveData({ unlockedModules: updated });
      return updated;
    });
  };

  const addEvaluationCode = (moduleId: string, code: string) => {
    setEvaluationCodes((prev) => {
      const updated = [
        ...prev.filter((e) => e.moduleId !== moduleId),
        { moduleId, code, unlockedAt: Date.now() },
      ];
      saveData({ evaluationCodes: updated });
      return updated;
    });
  };

  const recordExerciseResult = (result: ExerciseResult) => {
    setCurrentStudentState((prev) => {
      const xpGained = result.correct ? 20 : 5;
      const updated: Student = {
        ...prev,
        totalXP: prev.totalXP + xpGained,
        exerciseResults: [...prev.exerciseResults, result],
        completedExercises: result.correct
          ? [...new Set([...prev.completedExercises, result.exerciseId])]
          : prev.completedExercises,
        streak: result.correct ? prev.streak + 1 : prev.streak,
      };
      saveData({ currentStudent: updated });
      setAllStudents((sts) => {
        const up = sts.map((s) => (s.id === updated.id ? updated : s));
        saveData({ allStudents: up });
        return up;
      });
      return updated;
    });
  };

  const markTheoryRead = (moduleId: string) => {
    setModuleProgress((prev) => {
      const existing = prev.find((p) => p.moduleId === moduleId);
      const updated = existing
        ? prev.map((p) =>
            p.moduleId === moduleId ? { ...p, theoryRead: true } : p
          )
        : [
            ...prev,
            {
              moduleId,
              theoryRead: true,
              exercisesCompleted: 0,
              totalExercises: 5,
              score: 0,
            },
          ];
      saveData({ moduleProgress: updated });
      return updated;
    });
  };

  const getErrorSummary = (): ErrorSummary[] => {
    const allResults = allStudents.flatMap((s) => s.exerciseResults);
    const wrongResults = allResults.filter((r) => !r.correct);
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

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentStudent,
        setCurrentStudent,
        allStudents,
        unlockedModules,
        unlockModule,
        evaluationCodes,
        addEvaluationCode,
        recordExerciseResult,
        markTheoryRead,
        moduleProgress,
        getErrorSummary,
        xpForExercise: 20,
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
