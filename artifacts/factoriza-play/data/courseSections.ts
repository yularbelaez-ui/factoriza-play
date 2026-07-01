export type SectionStatus = "diagnostico" | "proximamente" | "activo";

export interface CourseSection {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lightColor: string;
  borderColor: string;
  topics: string[];
  status: SectionStatus;
}

export const COURSE_SECTIONS: CourseSection[] = [
  {
    id: "saberes",
    number: "01",
    title: "Zona de Repaso",
    subtitle: "Saberes previos",
    icon: "🧮",
    color: "#7c3aed",
    lightColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    topics: [
      "Números naturales y operaciones",
      "Números decimales y operaciones",
      "Números enteros y negativos",
      "Números racionales",
      "Números irracionales",
      "Números reales",
      "Potencias y propiedades",
      "Descomposición en factores primos",
    ],
    status: "diagnostico",
  },
  {
    id: "algebra",
    number: "02",
    title: "Introducción al Álgebra",
    subtitle: "Conceptos fundamentales",
    icon: "✏️",
    color: "#2563eb",
    lightColor: "#eff6ff",
    borderColor: "#bfdbfe",
    topics: [
      "Diferencia con la aritmética",
      "Notación algebraica",
      "Signos en el álgebra",
      "Expresión y término algebraico",
      "Grado de un término",
      "Clasificación de expresiones",
      "Ordenar un polinomio",
      "Términos semejantes y valor numérico",
    ],
    status: "proximamente",
  },
  {
    id: "operaciones",
    number: "03",
    title: "Operaciones Algebraicas",
    subtitle: "Suma, resta, multiplicación y división",
    icon: "⚙️",
    color: "#059669",
    lightColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    topics: [
      "Suma y resta de polinomios",
      "Signos de agrupación",
      "Multiplicación (monomios y polinomios)",
      "División algebraica",
      "Productos notables",
      "Cuadrado de la diferencia",
      "Producto suma por diferencia",
      "Cubo de un binomio",
    ],
    status: "proximamente",
  },
  {
    id: "factorizacion",
    number: "04",
    title: "Factorización",
    subtitle: "Los 8 casos de factorización",
    icon: "🔍",
    color: "#d97706",
    lightColor: "#fffbeb",
    borderColor: "#fde68a",
    topics: [
      "Caso 1: Factor común monomio y polinomio",
      "Caso 2: Factor común por agrupación",
      "Caso 3: Trinomio cuadrado perfecto",
      "Caso 4: Diferencia de cuadrados perfectos",
      "Caso 5 & 6: Trinomios de la forma x²+bx+c",
      "Caso 7: Cubo perfecto de binomios",
      "Caso 8: Suma/diferencia de cubos perfectos",
    ],
    status: "activo",
  },
];
