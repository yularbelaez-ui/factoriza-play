export type LearningProfileCode = "A" | "B" | "C";
export type LearningRouteCode = "ruta-1" | "ruta-2" | "ruta-3";

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

export const PROFILE_DETAILS: Record<
  LearningProfileCode,
  { label: string; summary: string; color: string; icon: string }
> = {
  A: {
    label: "Perfil A",
    summary: "Presenta dificultades aritméticas importantes.",
    color: "#dc2626",
    icon: "🧮",
  },
  B: {
    label: "Perfil B",
    summary: "Domina la aritmética, pero necesita fortalecer el pensamiento algebraico.",
    color: "#d97706",
    icon: "✏️",
  },
  C: {
    label: "Perfil C",
    summary: "Manejo adecuado de los conocimientos previos.",
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
    title: "Ruta 3 · Factorización básica",
    subtitle: "Tus conocimientos previos están listos para la secuencia de factorización.",
    color: "#059669",
    icon: "🔍",
    steps: [
      {
        id: "patrones",
        title: "Módulo 1 · Reconocimiento de patrones",
        description: "Detecta semejanzas, términos repetidos y estructuras.",
        icon: "🔎",
        moduleId: "reconocimiento-patrones",
      },
      {
        id: "factor-comun",
        title: "Módulo 2 · Factor común",
        description: "Avanza de factor numérico a literal y mixto.",
        icon: "🔢",
        moduleId: "factor-comun",
      },
    ],
  },
};

export function getRouteForProfile(profile: LearningProfileCode): LearningRoute {
  return LEARNING_ROUTES[
    profile === "A" ? "ruta-1" : profile === "B" ? "ruta-2" : "ruta-3"
  ];
}