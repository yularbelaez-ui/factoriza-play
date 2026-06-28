export type DiagnosticCategory =
  | "naturales"
  | "decimales"
  | "enteros"
  | "irracionales"
  | "reales"
  | "potencias"
  | "factorizacion";

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

  // ── NÚMEROS NATURALES Y SUS OPERACIONES ─────────────────────────
  {
    id: "nat-1",
    category: "naturales",
    question: "Resuelve aplicando el orden de operaciones:",
    expression: "24 ÷ 6 + 3 × 2",
    options: ["10", "9", "14", "4"],
    correctAnswer: "10",
    explanation: "Primero multiplición y división: 24÷6 = 4, 3×2 = 6. Luego suma: 4 + 6 = 10.",
  },
  {
    id: "nat-2",
    category: "naturales",
    question: "¿Cuál es el Mínimo Común Múltiplo (MCM) de 4 y 6?",
    options: ["12", "24", "6", "2"],
    correctAnswer: "12",
    explanation: "Múltiplos de 4: 4, 8, 12… Múltiplos de 6: 6, 12… El menor común es 12.",
  },
  {
    id: "nat-3",
    category: "naturales",
    question: "¿Cuál es el Máximo Común Divisor (MCD) de 12 y 18?",
    options: ["6", "3", "9", "36"],
    correctAnswer: "6",
    explanation: "Divisores de 12: 1,2,3,4,6,12. Divisores de 18: 1,2,3,6,9,18. El mayor común es 6.",
  },

  // ── NÚMEROS DECIMALES Y SUS OPERACIONES ─────────────────────────
  {
    id: "dec-1",
    category: "decimales",
    question: "¿Cuánto es:",
    expression: "3,5 + 1,25",
    options: ["4,75", "4,25", "5,75", "4,50"],
    correctAnswer: "4,75",
    explanation: "Alineando decimales: 3,50 + 1,25 = 4,75.",
  },
  {
    id: "dec-2",
    category: "decimales",
    question: "¿Cuánto es:",
    expression: "0,4 × 0,5",
    options: ["0,2", "2", "0,02", "0,45"],
    correctAnswer: "0,2",
    explanation: "4 × 5 = 20. Con 2 decimales en total: 0,4 × 0,5 = 0,20 = 0,2.",
  },
  {
    id: "dec-3",
    category: "decimales",
    question: "¿Cuánto es:",
    expression: "1,8 ÷ 0,6",
    options: ["3", "0,3", "12", "30"],
    correctAnswer: "3",
    explanation: "Multiplico ambos por 10: 18 ÷ 6 = 3.",
  },

  // ── NÚMEROS ENTEROS Y OPERACIONES CON NEGATIVOS ─────────────────
  {
    id: "ent-1",
    category: "enteros",
    question: "¿Cuánto es:",
    expression: "(-4) + 7",
    options: ["3", "-3", "11", "-11"],
    correctAnswer: "3",
    explanation: "Signos distintos: resto los valores absolutos y tomo el signo del mayor. 7 - 4 = 3, y 7 > 4, entonces +3.",
  },
  {
    id: "ent-2",
    category: "enteros",
    question: "¿Cuánto es:",
    expression: "(-3) × (-5)",
    options: ["15", "-15", "8", "-8"],
    correctAnswer: "15",
    explanation: "Negativo × Negativo = Positivo. 3 × 5 = 15, por tanto (-3)×(-5) = +15.",
  },
  {
    id: "ent-3",
    category: "enteros",
    question: "¿Cuánto es:",
    expression: "12 ÷ (-4)",
    options: ["-3", "3", "-48", "8"],
    correctAnswer: "-3",
    explanation: "Positivo ÷ Negativo = Negativo. 12 ÷ 4 = 3, por tanto 12÷(-4) = -3.",
  },

  // ── NÚMEROS IRRACIONALES Y SUS OPERACIONES ──────────────────────
  {
    id: "irr-1",
    category: "irracionales",
    question: "√2 es un número:",
    options: ["Irracional", "Natural", "Entero", "Racional"],
    correctAnswer: "Irracional",
    explanation: "√2 ≈ 1,4142… no tiene representación decimal exacta ni periódica, por lo que es irracional.",
  },
  {
    id: "irr-2",
    category: "irracionales",
    question: "¿Cuánto es:",
    expression: "(√5)²",
    options: ["5", "25", "√10", "2√5"],
    correctAnswer: "5",
    explanation: "La raíz cuadrada y el cuadrado se anulan: (√5)² = 5.",
  },
  {
    id: "irr-3",
    category: "irracionales",
    question: "¿Cuál de los siguientes es un número irracional?",
    options: ["π", "½", "0,75", "−3"],
    correctAnswer: "π",
    explanation: "π = 3,14159… es irracional (no periódico, no fracción exacta). Los demás son racionales.",
  },

  // ── NÚMEROS REALES Y SUS OPERACIONES ────────────────────────────
  {
    id: "real-1",
    category: "reales",
    question: "¿A cuál subconjunto de los reales pertenece 0,333…?",
    options: ["Racional", "Irracional", "Natural", "Entero negativo"],
    correctAnswer: "Racional",
    explanation: "0,333… = 1/3. Los decimales periódicos son racionales porque se expresan como fracción.",
  },
  {
    id: "real-2",
    category: "reales",
    question: "¿Cuánto es:",
    expression: "√9 + √16",
    options: ["7", "5", "√25", "√13"],
    correctAnswer: "7",
    explanation: "√9 = 3 y √16 = 4. La suma es 3 + 4 = 7.",
  },
  {
    id: "real-3",
    category: "reales",
    question: "¿Cuál es el orden correcto de menor a mayor?",
    expression: "−2,  √2,  1/2,  −π",
    options: ["−π < −2 < ½ < √2", "−2 < −π < ½ < √2", "−π < ½ < −2 < √2", "−2 < ½ < −π < √2"],
    correctAnswer: "−π < −2 < ½ < √2",
    explanation: "π ≈ 3,14, entonces −π ≈ −3,14. Ordenados: −3,14 < −2 < 0,5 < 1,41.",
  },

  // ── POTENCIAS ───────────────────────────────────────────────────
  {
    id: "pot-1",
    category: "potencias",
    question: "¿Cuánto es:",
    expression: "3⁴",
    options: ["81", "12", "64", "27"],
    correctAnswer: "81",
    explanation: "3⁴ = 3×3×3×3 = 9×9 = 81.",
  },
  {
    id: "pot-2",
    category: "potencias",
    question: "Simplifica:",
    expression: "2⁵ ÷ 2²",
    options: ["2³", "2⁷", "1⁳", "4²"],
    correctAnswer: "2³",
    explanation: "Al dividir potencias de igual base se restan los exponentes: 2⁵ ÷ 2² = 2^(5−2) = 2³.",
  },
  {
    id: "pot-3",
    category: "potencias",
    question: "¿Cuánto es:",
    expression: "(2³)²",
    options: ["64", "12", "32", "16"],
    correctAnswer: "64",
    explanation: "Potencia de potencia: se multiplican los exponentes. (2³)² = 2^(3×2) = 2⁶ = 64.",
  },

  // ── DESCOMPOSICIÓN EN FACTORES ───────────────────────────────────
  {
    id: "fac-1",
    category: "factorizacion",
    question: "¿Cuál es la descomposición en factores primos de 12?",
    options: ["2² × 3", "4 × 3", "2 × 6", "3²"],
    correctAnswer: "2² × 3",
    explanation: "12 ÷ 2 = 6, 6 ÷ 2 = 3, 3 ÷ 3 = 1. Factores primos: 2 × 2 × 3 = 2² × 3.",
  },
  {
    id: "fac-2",
    category: "factorizacion",
    question: "¿Cuál es la descomposición en factores primos de 18?",
    options: ["2 × 3²", "2² × 3", "3 × 6", "9 × 2"],
    correctAnswer: "2 × 3²",
    explanation: "18 ÷ 2 = 9, 9 ÷ 3 = 3, 3 ÷ 3 = 1. Factores primos: 2 × 3 × 3 = 2 × 3².",
  },
  {
    id: "fac-3",
    category: "factorizacion",
    question: "¿Cuántos factores primos distintos tiene 30?",
    options: ["3", "2", "4", "5"],
    correctAnswer: "3",
    explanation: "30 = 2 × 3 × 5. Tiene tres factores primos distintos: 2, 3 y 5.",
  },
];

export const DIAGNOSTIC_CATEGORY_INFO: Record<
  DiagnosticCategory,
  { label: string; icon: string; color: string; description: string }
> = {
  naturales: {
    label: "Números Naturales",
    icon: "🔢",
    color: "#7c3aed",
    description: "Operaciones, MCM y MCD con números naturales",
  },
  decimales: {
    label: "Números Decimales",
    icon: "🔸",
    color: "#2563eb",
    description: "Suma, resta, multiplicación y división de decimales",
  },
  enteros: {
    label: "Números Enteros",
    icon: "➕",
    color: "#dc2626",
    description: "Operaciones con números negativos y enteros",
  },
  irracionales: {
    label: "Números Irracionales",
    icon: "√",
    color: "#059669",
    description: "Identificación y operaciones con irracionales",
  },
  reales: {
    label: "Números Reales",
    icon: "♾️",
    color: "#0891b2",
    description: "Subconjuntos y operaciones en los reales",
  },
  potencias: {
    label: "Potencias",
    icon: "⬆️",
    color: "#d97706",
    description: "Propiedades y cálculo de potencias",
  },
  factorizacion: {
    label: "Factores Primos",
    icon: "🔍",
    color: "#7c3aed",
    description: "Descomposición de números en factores primos",
  },
};

export function buildDiagnosticProfile(
  answers: Record<string, string>
): DiagnosticProfile {
  const categories: DiagnosticCategory[] = [
    "naturales",
    "decimales",
    "enteros",
    "irracionales",
    "reales",
    "potencias",
    "factorizacion",
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
