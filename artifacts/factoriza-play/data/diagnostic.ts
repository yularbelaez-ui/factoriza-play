export type DiagnosticCategory =
  | "naturales"
  | "decimales"
  | "enteros"
  | "irracionales"
  | "reales"
  | "potencias"
  | "fracciones"
  | "factorizacion"
  | "propiedades"
  | "terminos"
  | "variables"
  | "igualdad"
  | "patrones";

export type DiagnosticCompetency =
  | "aritmetica"
  | "propiedades"
  | "terminos"
  | "variables"
  | "igualdad"
  | "patrones";

/**
 * A/B/C are retained because profiles created by previous versions are stored
 * in this format. New diagnostics use descriptive, stable identifiers so that
 * a teacher can understand a profile without consulting a lookup table.
 */
export type LearningProfileCode =
  | "A"
  | "B"
  | "C"
  | "aprendiz-numerico"
  | "constructor-algebraico"
  | "cazador-patrones"
  | "explorador-factorizacion";
export type LearningRouteCode = "ruta-1" | "ruta-2" | "ruta-3" | "ruta-4";

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

export interface CompetencyResult {
  competency: DiagnosticCompetency;
  score: number;
  meetsThreshold: boolean;
}

export interface DiagnosticProfile {
  completedAt: number;
  results: DiagnosticResult[];
  competencyResults: CompetencyResult[];
  overallScore: number;
  level: "básico" | "intermedio" | "avanzado";
  profile: LearningProfileCode;
  route: LearningRouteCode;
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

  // ── ÁLGEBRA BÁSICA (S2) ──────────────────────────────────────────
  {
    id: "alg-1",
    category: "variables",
    question: "Evalúa la expresión para x = 3:",
    expression: "2x² − 5x + 1",
    options: ["4", "7", "10", "−2"],
    correctAnswer: "4",
    explanation: "2(3)² − 5(3) + 1 = 2·9 − 15 + 1 = 18 − 15 + 1 = 4.",
  },
  {
    id: "alg-2",
    category: "terminos",
    question: "¿Cuál es el resultado de simplificar los términos semejantes?",
    expression: "3x² + 5x − 2x² + x",
    options: ["x² + 6x", "5x² + 6x", "x² + 4x", "5x + x²"],
    correctAnswer: "x² + 6x",
    explanation: "Agrupa términos semejantes: (3x²−2x²) + (5x+x) = x² + 6x.",
  },
  {
    id: "alg-3",
    category: "terminos",
    question: "¿Cuál es el grado del polinomio?",
    expression: "4x³ − 7x + 2",
    options: ["3", "4", "2", "1"],
    correctAnswer: "3",
    explanation: "El grado de un polinomio es el mayor exponente de sus términos. Aquí el mayor exponente es 3.",
  },

  // ── OPERACIONES ALGEBRAICAS (S3) ─────────────────────────────────
  {
    id: "op-1",
    category: "propiedades",
    question: "Multiplica y simplifica:",
    expression: "3x(2x + 5)",
    options: ["6x² + 15x", "6x + 15", "5x² + 8x", "6x² + 5"],
    correctAnswer: "6x² + 15x",
    explanation: "Distribuye: 3x·2x = 6x² y 3x·5 = 15x. Resultado: 6x² + 15x.",
  },
  {
    id: "op-2",
    category: "propiedades",
    question: "Aplica el producto notable (cuadrado de la suma):",
    expression: "(x + 4)²",
    options: ["x² + 8x + 16", "x² + 4", "x² + 16", "x² + 4x + 16"],
    correctAnswer: "x² + 8x + 16",
    explanation: "(a+b)² = a²+2ab+b². Aquí a=x, b=4: x²+2·x·4+16 = x²+8x+16.",
  },
  {
    id: "op-3",
    category: "igualdad",
    question: "Multiplica usando la diferencia de cuadrados:",
    expression: "(x + 3)(x − 3)",
    options: ["x² − 9", "x² + 9", "x² − 6x + 9", "x² + 6x − 9"],
    correctAnswer: "x² − 9",
    explanation: "(a+b)(a−b) = a²−b². Aquí: x²−3² = x²−9.",
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
  // ── FRACCIONES Y RACIONALES ──────────────────────────────────────
  {
    id: "frac-1",
    category: "fracciones",
    question: "¿Cuál fracción es equivalente a 3/4?",
    options: ["6/8", "4/6", "9/16", "3/8"],
    correctAnswer: "6/8",
    explanation: "Multiplicar numerador y denominador por el mismo número mantiene el valor: 3/4 × 2/2 = 6/8.",
  },
  {
    id: "frac-2",
    category: "fracciones",
    question: "¿Cuánto es 2/3 + 1/6?",
    options: ["5/6", "3/9", "1/2", "3/6"],
    correctAnswer: "5/6",
    explanation: "Convierte 2/3 a sextos: 2/3 = 4/6. Luego 4/6 + 1/6 = 5/6.",
  },
  {
    id: "frac-3",
    category: "fracciones",
    question: "¿Cuánto es 3/5 ÷ 1/2?",
    options: ["6/5", "3/10", "3/7", "2/5"],
    correctAnswer: "6/5",
    explanation: "Dividir entre una fracción equivale a multiplicar por su inversa: 3/5 × 2/1 = 6/5.",
  },
  // ── COMPETENCIAS ALGEBRAICAS ─────────────────────────────────────
  {
    id: "prop-3",
    category: "propiedades",
    question: "¿Cuál expresión es equivalente a 4(x + 3)?",
    expression: "4(x + 3)",
    options: ["4x + 12", "4x + 3", "7x", "4x × 3"],
    correctAnswer: "4x + 12",
    explanation: "Por la propiedad distributiva, 4 multiplica a cada término: 4·x + 4·3 = 4x + 12.",
  },
  {
    id: "term-3",
    category: "terminos",
    question: "¿Cuál grupo contiene solo términos semejantes?",
    options: ["3x², −5x², x²", "2x, 2y, 2", "4a, 4a², a", "x, xy, y"],
    correctAnswer: "3x², −5x², x²",
    explanation: "Los términos semejantes tienen exactamente la misma parte literal: aquí todos contienen x².",
  },
  {
    id: "var-2",
    category: "variables",
    question: "En la expresión 5n + 2, ¿qué representa n?",
    options: ["Una cantidad que puede cambiar", "Siempre el número 5", "Un signo de suma", "Un objeto fijo"],
    correctAnswer: "Una cantidad que puede cambiar",
    explanation: "Una variable representa una cantidad cuyo valor puede cambiar según la situación.",
  },
  {
    id: "var-3",
    category: "variables",
    question: "Si x representa el número de cuadernos, ¿qué significa 3x?",
    options: ["Tres veces el número de cuadernos", "x + 3 cuadernos", "El tercer cuaderno", "Un valor fijo igual a 3"],
    correctAnswer: "Tres veces el número de cuadernos",
    explanation: "3x indica una multiplicación: tres grupos de x cuadernos.",
  },
  {
    id: "igual-2",
    category: "igualdad",
    question: "Completa para que ambos lados sean equivalentes:",
    expression: "2(x + 4) = 2x + ___",
    options: ["8", "4", "6x", "x + 8"],
    correctAnswer: "8",
    explanation: "Distribuye el 2: 2·x + 2·4 = 2x + 8. Los dos lados tienen el mismo valor.",
  },
  {
    id: "igual-3",
    category: "igualdad",
    question: "¿Qué afirma correctamente el signo igual en 3x + 6 = 3(x + 2)?",
    options: [
      "Las dos expresiones tienen el mismo valor para cualquier x",
      "Se debe calcular primero el lado izquierdo",
      "La expresión de la derecha es mayor",
      "x siempre vale 2",
    ],
    correctAnswer: "Las dos expresiones tienen el mismo valor para cualquier x",
    explanation: "El signo igual expresa equivalencia: ambas formas representan la misma cantidad.",
  },
  // ── LECTURA DE ESTRUCTURAS Y PATRONES (independent gate) ──────────
  {
    id: "pat-1",
    category: "patrones",
    question: "Sin desarrollar, ¿qué estructura tiene 6x + 6y?",
    expression: "6x + 6y",
    options: ["Factor común", "Diferencia de cuadrados", "Trinomio cuadrado perfecto", "Suma de cubos"],
    correctAnswer: "Factor común",
    explanation: "Los dos términos comparten el factor 6; la estructura sugiere extraerlo.",
  },
  {
    id: "pat-2",
    category: "patrones",
    question: "¿Qué estructura reconoces en x² − 49?",
    expression: "x² − 49",
    options: ["Diferencia de cuadrados", "Factor común", "Agrupación de términos", "Cubo de un binomio"],
    correctAnswer: "Diferencia de cuadrados",
    explanation: "x² y 49 = 7² son cuadrados perfectos separados por una resta.",
  },
  {
    id: "pat-3",
    category: "patrones",
    question: "¿Qué debes observar primero para elegir un caso de factorización?",
    options: ["La cantidad de términos y sus elementos repetidos", "Aplicar siempre la misma fórmula", "Sumar todos los exponentes", "Eliminar los signos"],
    correctAnswer: "La cantidad de términos y sus elementos repetidos",
    explanation: "Leer la estructura permite seleccionar una estrategia adecuada.",
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
  fracciones: {
    label: "Fracciones",
    icon: "½",
    color: "#0f766e",
    description: "Equivalencias y operaciones con fracciones",
  },
  factorizacion: {
    label: "Factores Primos",
    icon: "🔍",
    color: "#7c3aed",
    description: "Descomposición de números en factores primos",
  },
  propiedades: {
    label: "Propiedades algebraicas",
    icon: "⚙️",
    color: "#0891b2",
    description: "Equivalencias, distributiva y transformación de expresiones",
  },
  terminos: {
    label: "Identificación de términos",
    icon: "🧩",
    color: "#7c3aed",
    description: "Términos, grados y términos semejantes",
  },
  variables: {
    label: "Uso de variables",
    icon: "🔤",
    color: "#2563eb",
    description: "Significado y uso de cantidades que pueden variar",
  },
  igualdad: {
    label: "Interpretación del signo igual",
    icon: "⚖️",
    color: "#059669",
    description: "El signo igual como equivalencia entre expresiones",
  },
  patrones: {
    label: "Lectura de patrones",
    icon: "🔍",
    color: "#2563eb",
    description: "Reconocimiento independiente de estructuras y estrategias",
  },
};

export function buildDiagnosticProfile(
  answers: Record<string, string>
): DiagnosticProfile {
  const categories = Array.from(
    new Set(DIAGNOSTIC_QUESTIONS.map((question) => question.category))
  );

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

  const scoreFor = (category: DiagnosticCategory) =>
    results.find((result) => result.category === category)?.score ?? 0;
  const arithmeticCategories: DiagnosticCategory[] = [
    "naturales",
    "enteros",
    "potencias",
    "fracciones",
  ];
  const arithmeticScore = Math.round(
    arithmeticCategories.reduce((sum, category) => sum + scoreFor(category), 0) /
      arithmeticCategories.length
  );
  const algebraCompetencies = ["propiedades", "terminos", "variables", "igualdad"] as const;
  const algebraScore = Math.round(
    algebraCompetencies.reduce((sum, competency) => sum + scoreFor(competency), 0) /
      algebraCompetencies.length
  );
  // Pattern-readiness is intentionally a separate gate. It measures whether
  // the student can connect an expression's structure to a strategy, rather
  // than merely calculating correctly. Existing diagnostic categories provide
  // the evidence without bringing back the retired pattern module.
  const patternScore = scoreFor("patrones");
  const competencyResults: CompetencyResult[] = [
    {
      competency: "aritmetica",
      score: arithmeticScore,
      meetsThreshold: arithmeticCategories.every((category) => scoreFor(category) >= 75),
    },
    ...algebraCompetencies.map(
      (competency) => ({
        competency,
        score: scoreFor(competency),
        meetsThreshold: scoreFor(competency) >= 75,
      })
    ),
    {
      competency: "patrones",
      score: patternScore,
      meetsThreshold: patternScore >= 75,
    },
  ];

  const arithmeticReady = competencyResults[0].meetsThreshold;
  const algebraReady = algebraCompetencies.every((competency) =>
    competencyResults.find((result) => result.competency === competency)?.meetsThreshold
  );
  const patternReady = competencyResults.find((result) => result.competency === "patrones")?.meetsThreshold ?? false;
  const profile: LearningProfileCode = !arithmeticReady
    ? "aprendiz-numerico"
    : !algebraReady
      ? "constructor-algebraico"
      : !patternReady
        ? "cazador-patrones"
        : "explorador-factorizacion";
  const route: LearningRouteCode =
    profile === "aprendiz-numerico"
      ? "ruta-1"
      : profile === "constructor-algebraico"
        ? "ruta-2"
        : profile === "cazador-patrones"
          ? "ruta-3"
          : "ruta-4";
  const level: DiagnosticProfile["level"] =
    profile === "aprendiz-numerico"
      ? "básico"
      : profile === "constructor-algebraico"
        ? "intermedio"
        : "avanzado";

  return {
    completedAt: Date.now(),
    results,
    competencyResults,
    overallScore,
    level,
    profile,
    route,
  };
}
