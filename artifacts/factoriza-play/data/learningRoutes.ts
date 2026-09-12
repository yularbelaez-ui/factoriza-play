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
    title: "Ruta 1 · Fortalecimiento aritmético",
    subtitle: "Construye las bases numéricas antes de avanzar a la factorización.",
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
    ],
  },
  "ruta-2": {
    id: "ruta-2",
    title: "Ruta 2 · Transición al pensamiento algebraico",
    subtitle: "Convierte las bases numéricas en comprensión de expresiones algebraicas.",
    color: "#2563eb",
    icon: "✏️",
    steps: [
      {
        id: "propiedades",
        title: "Propiedades y expresiones algebraicas",
        description: "Reconoce cómo se transforman expresiones equivalentes.",
        icon: "⚖️",
        topicId: "s2-expresion",
      },
      {
        id: "terminos",
        title: "Identificación de términos semejantes",
        description: "Clasifica y agrupa términos con la misma parte literal.",
        icon: "🧩",
        topicId: "s2-semejantes",
      },
      {
        id: "variables",
        title: "Uso de variables",
        description: "Interpreta letras como cantidades que pueden variar.",
        icon: "🔤",
        topicId: "s2-notacion",
      },
      {
        id: "igualdad",
        title: "El signo igual como equivalencia",
        description: "Comprende que ambos lados representan la misma cantidad.",
        icon: "⚖️",
        topicId: "s2-diferencia",
      },
    ],
  },
  "ruta-3": {
    id: "ruta-3",
    title: "Ruta 3 · Descubrimiento de patrones",
    subtitle: "Aprende a identificar estructuras antes de escoger un caso de factorización.",
    color: "#2563eb",
    icon: "🔍",
    steps: [
      {
        id: "patrones-expresiones",
        title: "Estructuras y expresiones equivalentes",
        description: "Relaciona términos, signos y productos notables para reconocer patrones.",
        icon: "🧩",
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