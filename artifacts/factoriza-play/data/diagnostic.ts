import {
  buildPersonalizedRoute,
  PERSONALIZED_ROUTE_THRESHOLD,
  type DiagnosticModuleResult,
  type PersonalizedModuleId,
} from "./personalizedRoutes";

export type { DiagnosticModuleResult } from "./personalizedRoutes";

export type DiagnosticCategory =
  | "naturales"
  | "decimales"
  | "enteros"
  | "irracionales"
  | "reales"
  | "potencias"
  | "fracciones"
  | "factores_primos"
  | "notacion_grado"
  | "expresion_termino"
  | "clasificacion_expresiones"
  | "terminos_semejantes"
  | "suma_resta"
  | "multiplicacion"
  | "division"
  | "productos_notables"
  // Legacy categories remain readable for profiles created before this structure.
  | "factorizacion"
  | "propiedades"
  | "terminos"
  | "variables"
  | "igualdad"
  | "patrones";

export type DiagnosticCompetency =
  | "aritmetica"
  | "algebra"
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
  moduleResults: DiagnosticModuleResult[];
  personalizedRoute: import("./personalizedRoutes").PersonalizedRoute;
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

  // ── FACTORES PRIMOS ───────────────────────────────────────────────
  {
    id: "fac-1",
    category: "factores_primos",
    question: "¿Cuál es la descomposición en factores primos de 12?",
    options: ["2² × 3", "4 × 3", "2 × 6", "3²"],
    correctAnswer: "2² × 3",
    explanation: "12 ÷ 2 = 6, 6 ÷ 2 = 3 y 3 ÷ 3 = 1. Entonces 12 = 2² × 3.",
  },
  {
    id: "fac-2",
    category: "factores_primos",
    question: "¿Cuál es la descomposición en factores primos de 18?",
    options: ["2 × 3²", "2² × 3", "3 × 6", "9 × 2"],
    correctAnswer: "2 × 3²",
    explanation: "18 = 2 × 3 × 3 = 2 × 3².",
  },
  {
    id: "fac-3",
    category: "factores_primos",
    question: "¿Cuántos factores primos distintos tiene 30?",
    options: ["3", "2", "4", "5"],
    correctAnswer: "3",
    explanation: "30 = 2 × 3 × 5. Tiene tres factores primos distintos.",
  },
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

  // ── INTRODUCCIÓN AL ÁLGEBRA ──────────────────────────────────────
  {
    id: "not-1",
    category: "notacion_grado",
    question: "¿Qué representa la expresión 3x?",
    options: ["Tres veces x", "x más 3", "El tercer valor de x", "x dividido entre 3"],
    correctAnswer: "Tres veces x",
    explanation: "Un número junto a una variable indica multiplicación: 3x = 3 × x.",
  },
  {
    id: "not-2",
    category: "notacion_grado",
    question: "¿Cuál es el grado del término 7a³b²?",
    options: ["5", "3", "2", "7"],
    correctAnswer: "5",
    explanation: "El grado de un término es la suma de sus exponentes: 3 + 2 = 5.",
  },
  {
    id: "not-3",
    category: "notacion_grado",
    question: "En el término −4mn², ¿cuál es su parte literal?",
    options: ["mn²", "−4", "−4mn²", "n²"],
    correctAnswer: "mn²",
    explanation: "La parte literal está formada por las variables y sus exponentes.",
  },
  {
    id: "expr-1",
    category: "expresion_termino",
    question: "¿Cuál de las siguientes es un término algebraico?",
    options: ["−5x²y", "x + 3", "2a − b", "m ÷ n"],
    correctAnswer: "−5x²y",
    explanation: "Un término algebraico no contiene sumas ni restas separando sus partes.",
  },
  {
    id: "expr-2",
    category: "expresion_termino",
    question: "¿Cuál expresión representa el doble de n más 5?",
    options: ["2n + 5", "2(n + 5)", "n + 10", "n² + 5"],
    correctAnswer: "2n + 5",
    explanation: "El doble de n es 2n y luego se suma 5.",
  },
  {
    id: "expr-3",
    category: "expresion_termino",
    question: "¿Qué significa la expresión 4ab?",
    options: ["4 × a × b", "4 + a + b", "4 ÷ (a × b)", "aᵇ ÷ 4"],
    correctAnswer: "4 × a × b",
    explanation: "Los números y letras juntos representan multiplicación: 4ab = 4 × a × b.",
  },
  {
    id: "clas-1",
    category: "clasificacion_expresiones",
    question: "¿Cómo se clasifica la expresión 7x² − 3x + 1?",
    options: ["Trinomio", "Monomio", "Binomio", "Término semejante"],
    correctAnswer: "Trinomio",
    explanation: "Tiene tres términos separados por signos: 7x², −3x y 1.",
  },
  {
    id: "clas-2",
    category: "clasificacion_expresiones",
    question: "¿Cómo se clasifica la expresión 5a − 2?",
    options: ["Binomio", "Monomio", "Trinomio", "Polinomio de cuatro términos"],
    correctAnswer: "Binomio",
    explanation: "Tiene dos términos: 5a y −2.",
  },
  {
    id: "clas-3",
    category: "clasificacion_expresiones",
    question: "¿Cómo se clasifica la expresión 9m³?",
    options: ["Monomio", "Binomio", "Trinomio", "Ecuación"],
    correctAnswer: "Monomio",
    explanation: "Tiene un solo término algebraico.",
  },
  {
    id: "sem-1",
    category: "terminos_semejantes",
    question: "¿Cuál grupo contiene solo términos semejantes?",
    options: ["3x², −5x², x²", "2x, 2y, 2", "4a, 4a², a", "x, xy, y"],
    correctAnswer: "3x², −5x², x²",
    explanation: "Los términos semejantes tienen la misma parte literal y los mismos exponentes.",
  },
  {
    id: "sem-2",
    category: "terminos_semejantes",
    question: "Simplifica:",
    expression: "3x² + 5x − 2x² + x",
    options: ["x² + 6x", "5x² + 6x", "x² + 4x", "5x + x²"],
    correctAnswer: "x² + 6x",
    explanation: "Agrupa términos semejantes: (3x²−2x²) + (5x+x) = x² + 6x.",
  },
  {
    id: "sem-3",
    category: "terminos_semejantes",
    question: "Si a = 4, ¿cuál es el valor numérico de 2a + 3?",
    options: ["11", "8", "10", "14"],
    correctAnswer: "11",
    explanation: "Sustituye a por 4: 2(4) + 3 = 8 + 3 = 11.",
  },

  // ── OPERACIONES ALGEBRAICAS ──────────────────────────────────────
  {
    id: "sum-1",
    category: "suma_resta",
    question: "Suma y simplifica:",
    expression: "(3x + 2) + (5x − 7)",
    options: ["8x − 5", "8x + 9", "2x − 5", "15x − 5"],
    correctAnswer: "8x − 5",
    explanation: "Suma términos semejantes: 3x + 5x = 8x y 2 − 7 = −5.",
  },
  {
    id: "sum-2",
    category: "suma_resta",
    question: "Resta y simplifica:",
    expression: "(7a − 3b) − (2a + b)",
    options: ["5a − 4b", "5a − 2b", "9a − 4b", "5a + 4b"],
    correctAnswer: "5a − 4b",
    explanation: "Cambia los signos del segundo paréntesis: 7a − 3b − 2a − b = 5a − 4b.",
  },
  {
    id: "sum-3",
    category: "suma_resta",
    question: "Simplifica:",
    expression: "4m − 3m + 2",
    options: ["m + 2", "7m + 2", "m − 2", "4m − 1"],
    correctAnswer: "m + 2",
    explanation: "4m − 3m = m; el resultado es m + 2.",
  },
  {
    id: "mul-1",
    category: "multiplicacion",
    question: "Multiplica y simplifica:",
    expression: "3x(2x + 5)",
    options: ["6x² + 15x", "6x + 15", "5x² + 8x", "6x² + 5"],
    correctAnswer: "6x² + 15x",
    explanation: "Distribuye: 3x·2x = 6x² y 3x·5 = 15x.",
  },
  {
    id: "mul-2",
    category: "multiplicacion",
    question: "Multiplica:",
    expression: "(2a)(−3a²b)",
    options: ["−6a³b", "6a²b", "−a³b", "−6a²b²"],
    correctAnswer: "−6a³b",
    explanation: "Multiplica coeficientes y suma exponentes de a: 2(−3) = −6 y a·a² = a³.",
  },
  {
    id: "mul-3",
    category: "multiplicacion",
    question: "Desarrolla:",
    expression: "(x + 2)(x + 3)",
    options: ["x² + 5x + 6", "x² + 6", "x² + 5x + 5", "x² + x + 6"],
    correctAnswer: "x² + 5x + 6",
    explanation: "Multiplica cada término: x² + 3x + 2x + 6 = x² + 5x + 6.",
  },
  {
    id: "div-1",
    category: "division",
    question: "Divide y simplifica:",
    expression: "12x³y² ÷ 4xy",
    options: ["3x²y", "3x⁴y³", "8x²y", "3xy"],
    correctAnswer: "3x²y",
    explanation: "12 ÷ 4 = 3, x³ ÷ x = x² y y² ÷ y = y.",
  },
  {
    id: "div-2",
    category: "division",
    question: "Divide y simplifica:",
    expression: "18a²b ÷ (−6ab)",
    options: ["−3a", "3a", "−3ab", "−12a"],
    correctAnswer: "−3a",
    explanation: "18 ÷ (−6) = −3, a² ÷ a = a y b ÷ b = 1.",
  },
  {
    id: "div-3",
    category: "division",
    question: "Divide:",
    expression: "(6x² + 9x) ÷ 3x",
    options: ["2x + 3", "2x² + 3x", "3x + 3", "2x + 9"],
    correctAnswer: "2x + 3",
    explanation: "Divide cada término entre 3x: 6x² ÷ 3x = 2x y 9x ÷ 3x = 3.",
  },
  {
    id: "prod-1",
    category: "productos_notables",
    question: "Aplica el producto notable (cuadrado de la suma):",
    expression: "(x + 4)²",
    options: ["x² + 8x + 16", "x² + 4", "x² + 16", "x² + 4x + 16"],
    correctAnswer: "x² + 8x + 16",
    explanation: "(a+b)² = a² + 2ab + b². Entonces (x+4)² = x² + 8x + 16.",
  },
  {
    id: "prod-2",
    category: "productos_notables",
    question: "Aplica el producto notable (diferencia de cuadrados):",
    expression: "(x + 3)(x − 3)",
    options: ["x² − 9", "x² + 9", "x² − 6x + 9", "x² + 6x − 9"],
    correctAnswer: "x² − 9",
    explanation: "(a+b)(a−b) = a² − b². Aquí x² − 3² = x² − 9.",
  },
  {
    id: "prod-3",
    category: "productos_notables",
    question: "Desarrolla el cuadrado de la diferencia:",
    expression: "(2a − b)²",
    options: ["4a² − 4ab + b²", "4a² − b²", "2a² − 2ab + b²", "4a² + 4ab + b²"],
    correctAnswer: "4a² − 4ab + b²",
    explanation: "(a−b)² = a² − 2ab + b². Con 2a y b resulta 4a² − 4ab + b².",
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
  factores_primos: {
    label: "Factores primos",
    icon: "🔑",
    color: "#7c3aed",
    description: "Descomposición de números en factores primos",
  },
  notacion_grado: {
    label: "Notación algebraica y grado de un término",
    icon: "🔤",
    color: "#2563eb",
    description: "Lectura de variables, coeficientes, exponentes y grado",
  },
  expresion_termino: {
    label: "Expresión y término algebraico",
    icon: "✏️",
    color: "#0891b2",
    description: "Interpretación y escritura de expresiones y términos algebraicos",
  },
  clasificacion_expresiones: {
    label: "Clasificación de expresiones algebraicas",
    icon: "🧩",
    color: "#7c3aed",
    description: "Monomios, binomios, trinomios y polinomios",
  },
  terminos_semejantes: {
    label: "Términos semejantes y valor numérico",
    icon: "🔢",
    color: "#2563eb",
    description: "Identificación, simplificación y evaluación de términos semejantes",
  },
  suma_resta: {
    label: "Suma y resta algebraica",
    icon: "➕",
    color: "#059669",
    description: "Operaciones de suma y resta con expresiones algebraicas",
  },
  multiplicacion: {
    label: "Multiplicación algebraica",
    icon: "✖️",
    color: "#0891b2",
    description: "Multiplicación de monomios y polinomios",
  },
  division: {
    label: "División algebraica",
    icon: "➗",
    color: "#d97706",
    description: "División y simplificación de expresiones algebraicas",
  },
  productos_notables: {
    label: "Productos notables",
    icon: "⚙️",
    color: "#2563eb",
    description: "Cuadrados de binomios y diferencia de cuadrados",
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
  const moduleCategoryMap: Record<PersonalizedModuleId, DiagnosticCategory[]> = {
    aritmetica: [
      "naturales",
      "decimales",
      "enteros",
      "irracionales",
      "reales",
      "potencias",
      "fracciones",
      "factores_primos",
    ],
    algebra: [
      "notacion_grado",
      "expresion_termino",
      "clasificacion_expresiones",
      "terminos_semejantes",
    ],
    patrones: ["suma_resta", "multiplicacion", "division", "productos_notables"],
    factorizacion: [],
  };
  const moduleResults: DiagnosticModuleResult[] = (Object.entries(moduleCategoryMap) as [
    PersonalizedModuleId,
    DiagnosticCategory[],
  ][]).map(([id, categories]) => {
    const topics = categories.map((category) => {
      const score = scoreFor(category);
      return {
        category,
        label: DIAGNOSTIC_CATEGORY_INFO[category].label,
        score,
        meetsThreshold: score >= PERSONALIZED_ROUTE_THRESHOLD,
      };
    });
    const score = topics.length
      ? Math.round(topics.reduce((sum, topic) => sum + topic.score, 0) / topics.length)
      : 0;
    const meetsThreshold = topics.every((topic) => topic.meetsThreshold);
    return {
      id,
      title: id === "aritmetica"
        ? "Fortalecimiento algebraico"
        : id === "algebra"
          ? "Pensamiento algebraico"
          : id === "patrones"
            ? "Reconocimiento de patrones"
            : "Factorización",
      score,
      threshold: PERSONALIZED_ROUTE_THRESHOLD,
      meetsThreshold,
      needsStrengthening: !meetsThreshold,
      topics,
    };
  });
  const arithmeticScore = moduleResults.find((module) => module.id === "aritmetica")?.score ?? 0;
  const algebraScore = moduleResults.find((module) => module.id === "algebra")?.score ?? 0;
  const patternScore = moduleResults.find((module) => module.id === "patrones")?.score ?? 0;
  const competencyResults: CompetencyResult[] = [
    {
      competency: "aritmetica",
      score: arithmeticScore,
      meetsThreshold: moduleResults.find((module) => module.id === "aritmetica")?.meetsThreshold ?? false,
    },
    {
      competency: "algebra",
      score: algebraScore,
      meetsThreshold: moduleResults.find((module) => module.id === "algebra")?.meetsThreshold ?? false,
    },
    {
      competency: "patrones",
      score: patternScore,
      meetsThreshold: moduleResults.find((module) => module.id === "patrones")?.meetsThreshold ?? false,
    },
  ];

  const arithmeticReady = competencyResults[0].meetsThreshold;
  const algebraReady = competencyResults.find((result) => result.competency === "algebra")?.meetsThreshold ?? false;
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
    moduleResults,
    personalizedRoute: buildPersonalizedRoute(moduleResults),
    overallScore,
    level,
    profile,
    route,
  };
}
