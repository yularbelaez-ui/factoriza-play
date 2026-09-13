export type CreditSource = {
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
};

export const CREDIT_SOURCES: CreditSource[] = [
  {
    name: "Khan Academy en Español",
    description: "Apoyo audiovisual para aritmética, álgebra y factorización.",
    url: "https://es.khanacademy.org/math",
    icon: "🎓",
    color: "#14b8a6",
  },
  {
    name: "Unicoos",
    description: "Explicaciones y ejemplos de matemáticas para repasar conceptos.",
    url: "https://www.youtube.com/@unicoos",
    icon: "📐",
    color: "#2563eb",
  },
  {
    name: "Profe Alex",
    description: "Videos de apoyo con procedimientos y ejercicios resueltos.",
    url: "https://www.youtube.com/@profealex",
    icon: "✏️",
    color: "#f97316",
  },
  {
    name: "Julioprofe",
    description: "Recursos audiovisuales para practicar álgebra y factorización.",
    url: "https://www.youtube.com/@julioprofe",
    icon: "🧮",
    color: "#7c3aed",
  },
];