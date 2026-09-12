export type SectionStatus = "diagnostico" | "disponible" | "activo";

export interface SectionTopic {
  label: string;
  topicId: string | null;
}

export interface CourseSection {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lightColor: string;
  borderColor: string;
  topics: SectionTopic[];
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
      { label: "Números naturales y operaciones",   topicId: "s1-naturales"   },
      { label: "Números decimales y operaciones",   topicId: "s1-decimales"   },
      { label: "Números enteros y negativos",       topicId: "s1-enteros"     },
      { label: "Números racionales",                topicId: "s1-racionales"  },
      { label: "Números irracionales",              topicId: "s1-irracionales"},
      { label: "Números reales",                    topicId: "s1-reales"      },
      { label: "Potencias y propiedades",           topicId: "s1-potencias"   },
      { label: "Descomposición en factores primos", topicId: "s1-factores"    },
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
      { label: "Diferencia con la aritmética",         topicId: "s2-diferencia"   },
      { label: "Notación algebraica",                  topicId: "s2-notacion"     },
      { label: "Signos en el álgebra",                 topicId: "s2-signos"       },
      { label: "Expresión y término algebraico",       topicId: "s2-expresion"    },
      { label: "Grado de un término",                  topicId: "s2-grado"        },
      { label: "Clasificación de expresiones algebraicas", topicId: "s2-clasificacion" },
      { label: "Ordenar un polinomio",                 topicId: "s2-orden"        },
      { label: "Términos semejantes y valor numérico", topicId: "s2-semejantes"   },
    ],
    status: "disponible",
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
      { label: "Suma y resta de polinomios",            topicId: "s3-suma-resta"          },
      { label: "Signos de agrupación",                  topicId: "s3-agrupacion"          },
      { label: "Multiplicación de monomios y polinomios", topicId: "s3-multiplicacion"    },
      { label: "División algebraica",                   topicId: "s3-division"            },
      { label: "Productos notables",                    topicId: "s3-productos"           },
      { label: "Cuadrado de la diferencia",             topicId: "s3-cuadrado-diferencia" },
      { label: "Producto suma por diferencia",          topicId: "s3-suma-diferencia"     },
      { label: "Cubo de un binomio",                    topicId: "s3-cubo"               },
    ],
    status: "disponible",
  },
  {
    id: "factorizacion",
    number: "04",
    title: "Factorización",
    subtitle: "Una secuencia progresiva de patrones y casos",
    icon: "🔍",
    color: "#d97706",
    lightColor: "#fffbeb",
    borderColor: "#fde68a",
    topics: [
      { label: "Módulo 1: Factor común (numérico, literal y mixto)", topicId: null },
      { label: "Módulo 2: Factor común por agrupación",              topicId: null },
      { label: "Módulo 3: Trinomio cuadrado perfecto",               topicId: null },
      { label: "Módulo 4: Diferencia de cuadrados perfectos",        topicId: null },
      { label: "Módulo 5: Trinomio de la forma x²+bx+c",             topicId: null },
      { label: "Módulo 6: Cubo perfecto de binomios",                topicId: null },
      { label: "Módulo 7: Suma o diferencia de cubos perfectos",     topicId: null },
    ],
    status: "activo",
  },
];
