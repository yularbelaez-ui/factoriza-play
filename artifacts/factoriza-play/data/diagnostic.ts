export type DiagnosticCategory =
  | "operaciones"
  | "ley_signos"
  | "variables"
  | "potenciacion"
  | "radicacion";

export interface DiagnosticQuestion {
  id: string;
  category: DiagnosticCategory;
  question: string;
  expression?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface DiagnosticResult {
  category: DiagnosticCategory;
  correct: number;
  total: number;
  score: number;
}

export interface DiagnosticProfile {
  completedAt: number;
  results: DiagnosticResult[];
  overallScore: number;
  level: "básico" | "intermedio" | "avanzado";
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ── OPERACIONES BÁSICAS ──────────────────────────────────────────
  {
    id: "diag-op-1",
    category: "operaciones",
    question: "¿Cuánto es:",
    expression: "(-3) + (-5)",
    options: ["-8", "8", "-2", "2"],
    correctAnswer: "-8",
    explanation: "Al sumar dos negativos: los valores absolutos se suman y el resultado es negativo. (-3) + (-5) = -8.",
  },
  {
    id: "diag-op-2",
    category: "operaciones",
    question: "¿Cuánto es:",
    expression: "4 × (-6)",
    options: ["-24", "24", "-10", "10"],
    correctAnswer: "-24",
    explanation: "Positivo × Negativo = Negativo. 4 × 6 = 24, por tanto 4 × (-6) = -24.",
  },
  {
    id: "diag-op-3",
    category: "operaciones",
    question: "¿Cuánto es:",
    expression: "(-15) ÷ 3",
    options: ["-5", "5", "-45", "45"],
    correctAnswer: "-5",
    explanation: "Negativo ÷ Positivo = Negativo. 15 ÷ 3 = 5, por tanto (-15) ÷ 3 = -5.",
  },

  // ── LEY DE SIGNOS ────────────────────────────────────────────────
  {
    id: "diag-sg-1",
    category: "ley_signos",
    question: "El resultado de (-a) × (-b) es:",
    options: ["ab", "-ab", "a + b", "-(a + b)"],
    correctAnswer: "ab",
    explanation: "Negativo × Negativo = Positivo. Por ley de signos: (-a)×(-b) = +ab.",
  },
  {
    id: "diag-sg-2",
    category: "ley_signos",
    question: "¿Cuánto es:",
    expression: "(-2) × (-3) × (-1)",
    options: ["-6", "6", "-5", "5"],
    correctAnswer: "-6",
    explanation: "(-2)×(-3) = 6 (neg×neg=pos), luego 6×(-1) = -6 (pos×neg=neg).",
  },
  {
    id: "diag-sg-3",
    category: "ley_signos",
    question: "¿Cuánto es:",
    expression: "−(−8)",
    options: ["8", "-8", "0", "16"],
    correctAnswer: "8",
    explanation: "El opuesto del opuesto es el número original: −(−8) = +8.",
  },

  // ── VARIABLES Y ÁLGEBRA ──────────────────────────────────────────
  {
    id: "diag-var-1",
    category: "variables",
    question: "Si x = 3, ¿cuánto es:",
    expression: "2x − 1",
    options: ["5", "7", "4", "3"],
    correctAnswer: "5",
    explanation: "Sustituyo x=3: 2(3) − 1 = 6 − 1 = 5.",
  },
  {
    id: "diag-var-2",
    category: "variables",
    question: "Simplifica:",
    expression: "3a + 2a",
    options: ["5a", "6a²", "5", "3a² + 2a"],
    correctAnswer: "5a",
    explanation: "Términos semejantes: se suman los coeficientes. 3a + 2a = (3+2)a = 5a.",
  },
  {
    id: "diag-var-3",
    category: "variables",
    question: "¿Cuál expresión significa 'el doble de m más 4'?",
    options: ["2m + 4", "2(m + 4)", "m² + 4", "m + 2 + 4"],
    correctAnswer: "2m + 4",
    explanation: "'El doble de m' es 2·m = 2m. 'Más 4' agrega +4. Resultado: 2m + 4.",
  },

  // ── POTENCIACIÓN ─────────────────────────────────────────────────
  {
    id: "diag-pot-1",
    category: "potenciacion",
    question: "¿Cuánto es:",
    expression: "2³",
    options: ["8", "6", "9", "12"],
    correctAnswer: "8",
    explanation: "2³ = 2 × 2 × 2 = 8.",
  },
  {
    id: "diag-pot-2",
    category: "potenciacion",
    question: "Multiplica:",
    expression: "x² · x³",
    options: ["x⁵", "x⁶", "2x⁵", "x"],
    correctAnswer: "x⁵",
    explanation: "Al multiplicar bases iguales se suman los exponentes: x²·x³ = x^(2+3) = x⁵.",
  },
  {
    id: "diag-pot-3",
    category: "potenciacion",
    question: "¿Cuánto es:",
    expression: "(-3)²",
    options: ["9", "-9", "6", "-6"],
    correctAnswer: "9",
    explanation: "(-3)² = (-3)×(-3) = 9. Negativo × Negativo = Positivo.",
  },

  // ── RADICACIÓN ───────────────────────────────────────────────────
  {
    id: "diag-rad-1",
    category: "radicacion",
    question: "¿Cuánto es:",
    expression: "√25",
    options: ["5", "-5", "12,5", "625"],
    correctAnswer: "5",
    explanation: "√25 = 5, porque 5² = 25.",
  },
  {
    id: "diag-rad-2",
    category: "radicacion",
    question: "Simplifica:",
    expression: "√(x⁶)",
    options: ["x³", "x²", "x⁴", "x"],
    correctAnswer: "x³",
    explanation: "√(x⁶) = x^(6÷2) = x³. La raíz cuadrada divide el exponente entre 2.",
  },
  {
    id: "diag-rad-3",
    category: "radicacion",
    question: "Si a² = 49, entonces a es:",
    options: ["±7", "7", "-7", "24,5"],
    correctAnswer: "±7",
    explanation: "a² = 49 → a = √49 = ±7, porque tanto 7² como (-7)² = 49.",
  },
];

export const DIAGNOSTIC_CATEGORY_INFO: Record<
  DiagnosticCategory,
  { label: string; icon: string; color: string; description: string }
> = {
  operaciones: {
    label: "Operaciones Básicas",
    icon: "➕",
    color: "#7c3aed",
    description: "Sumas, restas, multiplicaciones y divisiones con enteros",
  },
  ley_signos: {
    label: "Ley de Signos",
    icon: "±",
    color: "#dc2626",
    description: "Reglas del signo en operaciones con negativos",
  },
  variables: {
    label: "Variables y Álgebra",
    icon: "🔤",
    color: "#2563eb",
    description: "Interpretación y simplificación de expresiones algebraicas",
  },
  potenciacion: {
    label: "Potenciación",
    icon: "⬆️",
    color: "#d97706",
    description: "Propiedades y cálculo de potencias",
  },
  radicacion: {
    label: "Radicación",
    icon: "√",
    color: "#059669",
    description: "Cálculo e interpretación de raíces cuadradas",
  },
};

export function buildDiagnosticProfile(
  answers: Record<string, string>
): DiagnosticProfile {
  const categories: DiagnosticCategory[] = [
    "operaciones",
    "ley_signos",
    "variables",
    "potenciacion",
    "radicacion",
  ];

  const results: DiagnosticResult[] = categories.map((cat) => {
    const qs = DIAGNOSTIC_QUESTIONS.filter((q) => q.category === cat);
    const correct = qs.filter((q) => answers[q.id] === q.correctAnswer).length;
    return {
      category: cat,
      correct,
      total: qs.length,
      score: qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0,
    };
  });

  const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
  const totalQ = DIAGNOSTIC_QUESTIONS.length;
  const overallScore = Math.round((totalCorrect / totalQ) * 100);

  const level: DiagnosticProfile["level"] =
    overallScore >= 75 ? "avanzado" : overallScore >= 45 ? "intermedio" : "básico";

  return { completedAt: Date.now(), results, overallScore, level };
}
