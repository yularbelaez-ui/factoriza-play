export interface ModuleVideo {
  kind: "theory" | "solved";
  title: string;
  channel: string;
  url: string;
}

const youtubeSearch = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export const MODULE_VIDEOS: Record<string, ModuleVideo[]> = {
  "reconocimiento-patrones": [
    {
      kind: "theory",
      title: "Cómo reconocer los casos de factorización",
      channel: "Khan Academy en Español",
      url: youtubeSearch("reconocer casos de factorización Khan Academy español"),
    },
    {
      kind: "solved",
      title: "Reconocimiento de casos: ejercicios resueltos",
      channel: "Matemáticas profe Alex",
      url: youtubeSearch("reconocer casos de factorización ejercicios resueltos profe Alex"),
    },
  ],
  "factor-comun": [
    {
      kind: "theory",
      title: "Factor común: explicación y procedimiento",
      channel: "Khan Academy en Español",
      url: youtubeSearch("factor común explicación Khan Academy español"),
    },
    {
      kind: "solved",
      title: "Factor común: ejercicios resueltos paso a paso",
      channel: "Matemáticas profe Alex",
      url: youtubeSearch("factor común ejercicios resueltos profe Alex"),
    },
  ],
  "diferencia-cuadrados": [
    {
      kind: "theory",
      title: "Diferencia de cuadrados perfectos",
      channel: "Khan Academy en Español",
      url: youtubeSearch("diferencia de cuadrados perfectos Khan Academy español"),
    },
    {
      kind: "solved",
      title: "Diferencia de cuadrados: ejercicios resueltos",
      channel: "julioprofe",
      url: youtubeSearch("diferencia de cuadrados ejercicios resueltos julioprofe"),
    },
  ],
  "suma-diferencia-cubos": [
    {
      kind: "theory",
      title: "Suma y diferencia de cubos",
      channel: "Khan Academy en Español",
      url: youtubeSearch("suma diferencia de cubos factorización Khan Academy español"),
    },
    {
      kind: "solved",
      title: "Suma y diferencia de cubos: ejercicios resueltos",
      channel: "Matemáticas profe Alex",
      url: youtubeSearch("suma diferencia de cubos ejercicios resueltos profe Alex"),
    },
  ],
  "trinomio-cuadrado-perfecto": [
    {
      kind: "theory",
      title: "Trinomio cuadrado perfecto",
      channel: "Khan Academy en Español",
      url: youtubeSearch("trinomio cuadrado perfecto Khan Academy español"),
    },
    {
      kind: "solved",
      title: "Trinomio cuadrado perfecto: ejercicios resueltos",
      channel: "julioprofe",
      url: youtubeSearch("trinomio cuadrado perfecto ejercicios resueltos julioprofe"),
    },
  ],
  "trinomio-forma-x2-bx-c": [
    {
      kind: "theory",
      title: "Trinomios de la forma x² + bx + c",
      channel: "Khan Academy en Español",
      url: youtubeSearch("factorización trinomio x2 bx c Khan Academy español"),
    },
    {
      kind: "solved",
      title: "x² + bx + c: ejercicios resueltos",
      channel: "Matemáticas profe Alex",
      url: youtubeSearch("trinomio x2 bx c ejercicios resueltos profe Alex"),
    },
  ],
  "trinomio-ax2-bx-c": [
    {
      kind: "theory",
      title: "Trinomios de la forma ax² + bx + c",
      channel: "Khan Academy en Español",
      url: youtubeSearch("factorización trinomio ax2 bx c Khan Academy español"),
    },
    {
      kind: "solved",
      title: "ax² + bx + c: ejercicios resueltos",
      channel: "julioprofe",
      url: youtubeSearch("trinomio ax2 bx c ejercicios resueltos julioprofe"),
    },
  ],
  "cubo-binomio": [
    {
      kind: "theory",
      title: "Cubo perfecto de un binomio",
      channel: "Khan Academy en Español",
      url: youtubeSearch("cubo perfecto de binomio factorización Khan Academy español"),
    },
    {
      kind: "solved",
      title: "Cubo perfecto de binomio: ejercicios resueltos",
      channel: "Matemáticas profe Alex",
      url: youtubeSearch("cubo perfecto binomio ejercicios resueltos profe Alex"),
    },
  ],
  "agrupacion-terminos": [
    {
      kind: "theory",
      title: "Factorización por agrupación de términos",
      channel: "Khan Academy en Español",
      url: youtubeSearch("factorización por agrupación de términos Khan Academy español"),
    },
    {
      kind: "solved",
      title: "Agrupación de términos: ejercicios resueltos",
      channel: "julioprofe",
      url: youtubeSearch("factorización agrupación términos ejercicios resueltos julioprofe"),
    },
  ],
};