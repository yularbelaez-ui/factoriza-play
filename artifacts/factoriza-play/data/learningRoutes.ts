export type LearningProfileCode =
  | "A"
  | "B"
  | "C"
  | "aprendiz-numerico"
  | "constructor-algebraico"
  | "cazador-patrones"
  | "explorador-factorizacion";
export type LearningRouteCode = "ruta-1" | "ruta-2" | "ruta-3" | "ruta-4";

export interface LearningRouteStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  topicId?: string;
  moduleId?: string;
}

export interface LearningRoute {
  id: LearningRouteCode;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  steps: LearningRouteStep[];
}

export type LearningRouteStepState = "locked" | "available" | "completed";

function isStepCompleted(
  step: LearningRouteStep,
  completedTopics: string[],
  completedModules: string[]
) {
  return Boolean(
    (step.topicId && completedTopics.includes(step.topicId)) ||
      (step.moduleId && completedModules.includes(step.moduleId))
  );
}

export function getRouteStepState(
  route: LearningRoute,
  stepIndex: number,
  completedTopics: string[],
  completedModules: string[]
): LearningRouteStepState {
  const step = route.steps[stepIndex];
  if (!step) return "locked";
  if (isStepCompleted(step, completedTopics, completedModules)) {
    return "completed";
  }
  if (stepIndex === 0) return "available";

  const previousStepsAreCompleted = route.steps
    .slice(0, stepIndex)
    .every((previousStep) =>
      isStepCompleted(previousStep, completedTopics, completedModules)
    );
  return previousStepsAreCompleted ? "available" : "locked";
}

export function isLearningRouteCompleted(
  route: LearningRoute,
  completedTopics: string[],
  completedModules: string[]
) {
  return route.steps.every((step) =>
    isStepCompleted(step, completedTopics, completedModules)
  );
}

export const PROFILE_DETAILS: Record<
  LearningProfileCode,
  { label: string; summary: string; mission: string; color: string; icon: string }
> = {
  A: {
    label: "Perfil A · Aprendiz Numérico",
    summary: "Presenta dificultades aritméticas importantes.",
    mission: "🛠️ Fortaleciendo mis herramientas matemáticas.",
    color: "#dc2626",
    icon: "🌱",
  },
  B: {
    label: "Perfil B · Constructor Algebraico",
    summary: "Domina la aritmética, pero necesita fortalecer el pensamiento algebraico.",
    mission: "🔓 Descifrando el lenguaje del álgebra.",
    color: "#d97706",
    icon: "🔥",
  },
  C: {
    label: "Perfil C · Explorador de la Factorización",
    summary: "Manejo adecuado de los conocimientos previos y listo para factorizar.",
    mission: "🚀 Preparado para conquistar la factorización.",
    color: "#059669",
    icon: "🚀",
  },
  "aprendiz-numerico": {
    label: "Aprendiz Numérico",
    summary: "Fortalece operaciones, signos, fracciones y potencias antes de avanzar.",
    mission: "🛠️ Fortaleciendo mis herramientas matemáticas.",
    color: "#dc2626",
    icon: "🌱",
  },
  "constructor-algebraico": {
    label: "Constructor Algebraico",
    summary: "Descifra variables, expresiones, términos semejantes y equivalencias.",
    mission: "🔓 Descifrando el lenguaje del álgebra.",
    color: "#d97706",
    icon: "🔥",
  },
  "cazador-patrones": {
    label: "Cazador de Patrones",
    summary: "Reconoce estructuras y relaciones entre expresiones para elegir una estrategia.",
    mission: "🧩 Descubriendo patrones ocultos.",
    color: "#2563eb",
    icon: "🔍",
  },
  "explorador-factorizacion": {
    label: "Explorador de la Factorización",
    summary: "Presenta bases sólidas y está preparado para iniciar la factorización.",
    mission: "🚀 Preparado para conquistar la factorización.",
    color: "#059669",
    icon: "🚀",
  },
};

export const LEARNING_ROUTES: Record<LearningRouteCode, LearningRoute> = {
  "ruta-1": {
    id: "ruta-1",
    title: "Ruta 1 · Fortalecimiento algebraico",
    subtitle: "Construye las bases numéricas y algebraicas antes de avanzar.",
    color: "#dc2626",
    icon: "🧮",
    steps: [
      {
        id: "signos-enteros",
        title: "Ley de signos y números enteros",
        description: "Practica operaciones con positivos y negativos.",
        icon: "➖",
        topicId: "s1-enteros",
      },
      {
        id: "operaciones",
        title: "Operaciones y divisibilidad",
        description: "Refuerza cálculo, MCD y factores comunes numéricos.",
        icon: "🔢",
        topicId: "s1-naturales",
      },
      {
        id: "decimales",
        title: "Números decimales",
        description: "Practica las operaciones con números decimales.",
        icon: "🔸",
        topicId: "s1-decimales",
      },
      {
        id: "irracionales",
        title: "Números irracionales",
        description: "Identifica y opera con números irracionales.",
        icon: "√",
        topicId: "s1-irracionales",
      },
      {
        id: "reales",
        title: "Números reales",
        description: "Reconoce subconjuntos y operaciones en los reales.",
        icon: "♾️",
        topicId: "s1-reales",
      },
      {
        id: "potencias",
        title: "Potencias y propiedades",
        description: "Aplica exponentes sin confundir sus propiedades.",
        icon: "⚡",
        topicId: "s1-potencias",
      },
      {
        id: "fracciones",
        title: "Fracciones y números racionales",
        description: "Fortalece equivalencias y operaciones con fracciones.",
        icon: "½",
        topicId: "s1-racionales",
      },
      {
        id: "factores-primos",
        title: "Factores primos",
        description: "Descompón números en factores primos.",
        icon: "🔑",
        topicId: "s1-factores",
      },
    ],
  },
  "ruta-2": {
    id: "ruta-2",
    title: "Ruta 2 · Pensamiento algebraico",
    subtitle: "Comprende la notación, los términos y las expresiones algebraicas.",
    color: "#2563eb",
    icon: "✏️",
    steps: [
      {
        id: "notacion-grado",
        title: "Notación algebraica y grado de un término",
        description: "Lee variables, coeficientes, exponentes y grados.",
        icon: "🔤",
        topicId: "s2-notacion",
      },
      {
        id: "expresion-termino",
        title: "Expresión y término algebraico",
        description: "Distingue términos y expresiones algebraicas.",
        icon: "✏️",
        topicId: "s2-expresion",
      },
      {
        id: "clasificacion-expresiones",
        title: "Clasificación de expresiones algebraicas",
        description: "Reconoce monomios, binomios, trinomios y polinomios.",
        icon: "🧩",
        topicId: "s2-clasificacion",
      },
      {
        id: "terminos-semejantes",
        title: "Términos semejantes y valor numérico",
        description: "Simplifica términos semejantes y evalúa expresiones.",
        icon: "🔢",
        topicId: "s2-semejantes",
      },
    ],
  },
  "ruta-3": {
    id: "ruta-3",
    title: "Ruta 3 · Reconocimiento de patrones",
    subtitle: "Practica operaciones algebraicas y productos notables antes de factorizar.",
    color: "#2563eb",
    icon: "🔍",
    steps: [
      {
        id: "suma-resta",
        title: "Suma y resta algebraica",
        description: "Suma y resta términos y expresiones algebraicas.",
        icon: "➕",
        topicId: "s3-suma-resta",
      },
      {
        id: "multiplicacion",
        title: "Multiplicación algebraica",
        description: "Multiplica monomios y polinomios.",
        icon: "✖️",
        topicId: "s3-multiplicacion",
      },
      {
        id: "division",
        title: "División algebraica",
        description: "Divide y simplifica expresiones algebraicas.",
        icon: "➗",
        topicId: "s3-division",
      },
      {
        id: "productos-notables",
        title: "Productos notables",
        description: "Aplica los productos notables más frecuentes.",
        icon: "⚙️",
        topicId: "s3-productos",
      },
    ],
  },
  "ruta-4": {
    id: "ruta-4",
    title: "Ruta 4 · Exploración de la factorización",
    subtitle: "Tus conocimientos previos están listos para la secuencia de casos activos.",
    color: "#059669",
    icon: "🚀",
    steps: [],
  },
};

export function getRouteForProfile(profile: LearningProfileCode): LearningRoute {
  const routeId =
    profile === "A" || profile === "aprendiz-numerico"
      ? "ruta-1"
      : profile === "B" || profile === "constructor-algebraico"
        ? "ruta-2"
        : profile === "cazador-patrones"
          ? "ruta-3"
          : "ruta-4";
  return LEARNING_ROUTES[
    routeId
  ];
}

/** Normalizes legacy A/B/C records for display and route decisions. */
export function normalizeProfileCode(
  profile: LearningProfileCode | undefined,
  level?: "básico" | "intermedio" | "avanzado"
): LearningProfileCode {
  if (profile === "A") return "aprendiz-numerico";
  if (profile === "B") return "constructor-algebraico";
  if (profile === "C") return "explorador-factorizacion";
  if (profile) return profile;
  return level === "básico"
    ? "aprendiz-numerico"
    : level === "intermedio"
      ? "constructor-algebraico"
      : "explorador-factorizacion";
}