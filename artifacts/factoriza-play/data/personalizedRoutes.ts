export const PERSONALIZED_ROUTE_THRESHOLD = 75;

export type PersonalizedModuleId =
  | "aritmetica"
  | "algebra"
  | "patrones"
  | "factorizacion";

export interface DiagnosticModuleTopicResult {
  category: string;
  label: string;
  score: number;
  meetsThreshold: boolean;
}

export interface DiagnosticModuleResult {
  id: PersonalizedModuleId;
  title: string;
  score: number;
  threshold: number;
  meetsThreshold: boolean;
  needsStrengthening: boolean;
  topics: DiagnosticModuleTopicResult[];
}

export interface PersonalizedRouteModule {
  id: PersonalizedModuleId;
  title: string;
  description: string;
  icon: string;
  color: string;
  topicIds: string[];
  topicLabels: string[];
  score: number;
  needsStrengthening: boolean;
}

export interface PersonalizedRouteStep {
  id: string;
  moduleId: PersonalizedModuleId;
  title: string;
  description: string;
  icon: string;
  color: string;
  topicIds: string[];
  topicLabels: string[];
  factorizationModuleIds?: string[];
  score: number;
  needsStrengthening: boolean;
}

export interface PersonalizedRoute {
  id: "personalizada";
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  threshold: number;
  moduleIds: PersonalizedModuleId[];
  modules: PersonalizedRouteModule[];
  steps: PersonalizedRouteStep[];
}

const MODULE_DEFINITIONS: Record<
  PersonalizedModuleId,
  Omit<PersonalizedRouteModule, "score" | "needsStrengthening">
> = {
  aritmetica: {
    id: "aritmetica",
    title: "Fortalecimiento aritmético",
    description: "Naturales, decimales, enteros, fracciones y potencias.",
    icon: "🧮",
    color: "#7c3aed",
    topicIds: [
      "s1-naturales",
      "s1-decimales",
      "s1-enteros",
      "s1-racionales",
      "s1-potencias",
    ],
    topicLabels: ["Naturales", "Decimales", "Enteros", "Fracciones", "Potencias"],
  },
  algebra: {
    id: "algebra",
    title: "Pensamiento algebraico",
    description: "Variables, expresiones, términos semejantes y signo igual.",
    icon: "✏️",
    color: "#2563eb",
    topicIds: ["s2-notacion", "s2-expresion", "s2-semejantes", "s2-diferencia"],
    topicLabels: ["Variables", "Expresiones algebraicas", "Términos semejantes", "Signo igual"],
  },
  patrones: {
    id: "patrones",
    title: "Reconocimiento de patrones",
    description: "Estructuras algebraicas y patrones necesarios para factorizar.",
    icon: "🔍",
    color: "#0891b2",
    topicIds: ["s3-productos", "s3-cuadrado-diferencia", "s3-suma-diferencia"],
    topicLabels: ["Estructuras algebraicas", "Productos notables", "Patrones de factorización"],
  },
  factorizacion: {
    id: "factorizacion",
    title: "Factorización",
    description: "Casos de factorización en una secuencia progresiva.",
    icon: "🚀",
    color: "#d97706",
    topicIds: [],
    topicLabels: [],
  },
};

const FACTORIZATION_MODULE_IDS = [
  "factor-comun",
  "agrupacion-terminos",
  "trinomio-cuadrado-perfecto",
  "diferencia-cuadrados",
  "trinomio-forma-x2-bx-c",
  "cubo-binomio",
  "suma-diferencia-cubos",
];

const PREREQUISITE_MODULE_IDS: PersonalizedModuleId[] = [
  "aritmetica",
  "algebra",
  "patrones",
];

export function getPersonalizedModuleDefinition(id: PersonalizedModuleId) {
  return MODULE_DEFINITIONS[id];
}

export function isPersonalizedPrerequisiteTopic(topicId: string) {
  return PREREQUISITE_MODULE_IDS.some((moduleId) =>
    MODULE_DEFINITIONS[moduleId].topicIds.includes(topicId),
  );
}

export function buildPersonalizedRoute(
  moduleResults: DiagnosticModuleResult[],
  threshold = PERSONALIZED_ROUTE_THRESHOLD,
): PersonalizedRoute {
  const resultMap = new Map(moduleResults.map((result) => [result.id, result]));
  const selectedIds = [
    ...PREREQUISITE_MODULE_IDS.filter((id) => resultMap.get(id)?.needsStrengthening),
    "factorizacion" as const,
  ];
  const modules = selectedIds.map((id) => {
    const definition = MODULE_DEFINITIONS[id];
    const result = resultMap.get(id);
    return {
      ...definition,
      score: result?.score ?? 0,
      needsStrengthening: result?.needsStrengthening ?? false,
    };
  });
  const steps = modules.map((module) => ({
    id: `ruta-${module.id}`,
    moduleId: module.id,
    title: module.title,
    description: module.description,
    icon: module.icon,
    color: module.color,
    topicIds: module.topicIds,
    topicLabels: module.topicLabels,
    ...(module.id === "factorizacion"
      ? { factorizationModuleIds: FACTORIZATION_MODULE_IDS }
      : {}),
    score: module.score,
    needsStrengthening: module.needsStrengthening,
  }));

  return {
    id: "personalizada",
    title: "Tu ruta personalizada",
    subtitle: "Una secuencia construida con tus resultados del diagnóstico.",
    color: "#7c3aed",
    icon: "🗺️",
    threshold,
    moduleIds: selectedIds,
    modules,
    steps,
  };
}

function isStepCompleted(
  step: PersonalizedRouteStep,
  completedTopics: string[],
  completedModules: string[],
) {
  const topicsCompleted =
    step.topicIds.length === 0 ||
    step.topicIds.every((topicId) => completedTopics.includes(topicId));
  const modulesCompleted =
    !step.factorizationModuleIds ||
    step.factorizationModuleIds.every((moduleId) => completedModules.includes(moduleId));
  return topicsCompleted && modulesCompleted;
}

export function getPersonalizedStepState(
  route: PersonalizedRoute,
  stepIndex: number,
  completedTopics: string[],
  completedModules: string[],
): "locked" | "available" | "completed" {
  const step = route.steps[stepIndex];
  if (!step) return "locked";
  if (isStepCompleted(step, completedTopics, completedModules)) return "completed";
  const previousStepsAreCompleted = route.steps
    .slice(0, stepIndex)
    .every((previousStep) => isStepCompleted(previousStep, completedTopics, completedModules));
  return previousStepsAreCompleted ? "available" : "locked";
}

export function getPersonalizedStepTarget(
  route: PersonalizedRoute,
  stepIndex: number,
  completedTopics: string[],
) {
  const step = route.steps[stepIndex];
  if (!step) return null;
  const nextTopic = step.topicIds.find((topicId) => !completedTopics.includes(topicId));
  return nextTopic ? { kind: "topic" as const, id: nextTopic } : { kind: "factorization" as const };
}

export function isPersonalizedRoutePrerequisitesCompleted(
  route: PersonalizedRoute,
  completedTopics: string[],
  completedModules: string[],
) {
  return route.steps
    .slice(0, -1)
    .every((step) => isStepCompleted(step, completedTopics, completedModules));
}

export function isPersonalizedRouteCompleted(
  route: PersonalizedRoute,
  completedTopics: string[],
  completedModules: string[],
) {
  return route.steps.every((step) => isStepCompleted(step, completedTopics, completedModules));
}

export function getPersonalizedRouteProgress(
  route: PersonalizedRoute,
  completedTopics: string[],
  completedModules: string[],
) {
  const totalUnits = route.steps.reduce(
    (total, step) => total + (step.topicIds.length || step.factorizationModuleIds?.length || 1),
    0,
  );
  const completedUnits = route.steps.reduce((total, step) => {
    const topics = step.topicIds.filter((topicId) => completedTopics.includes(topicId)).length;
    const modules = step.factorizationModuleIds?.filter((moduleId) => completedModules.includes(moduleId)).length ?? 0;
    return total + (step.topicIds.length ? topics : modules);
  }, 0);
  return totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
}