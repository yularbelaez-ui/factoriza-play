export interface PracticeConcept {
  title: string;
  explanation: string;
  formula?: string;
  example: string;
  tip: string;
}

export interface PracticeMiniExercise {
  id: string;
  question: string;
  expression?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface PracticeCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  shortDesc: string;
  concepts: PracticeConcept[];
  exercises: PracticeMiniExercise[];
}

export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  {
    id: "operaciones",
    title: "Operaciones Aritméticas",
    icon: "🔢",
    color: "#7c3aed",
    shortDesc: "Suma, resta, multiplicación y división de números",
    concepts: [
      {
        title: "Multiplicación de monomios",
        explanation:
          "Al multiplicar dos monomios, multiplicas los coeficientes y sumas los exponentes de cada variable. Por ejemplo: 3x² · 4x = 12x³.",
        formula: "aⁿ · aᵐ = aⁿ⁺ᵐ",
        example: "5x³ · 2x² = 10x⁵",
        tip: "Recuerda: los coeficientes se multiplican, los exponentes se suman (solo para bases iguales).",
      },
      {
        title: "División de monomios",
        explanation:
          "Al dividir monomios, divides los coeficientes y restas los exponentes. El exponente del denominador se resta al del numerador.",
        formula: "aⁿ ÷ aᵐ = aⁿ⁻ᵐ",
        example: "12x⁵ ÷ 4x² = 3x³",
        tip: "Verifica siempre que n > m para que el resultado tenga exponente positivo.",
      },
      {
        title: "Máximo Común Divisor (MCD)",
        explanation:
          "El MCD es el número más grande que divide exactamente a todos los coeficientes. Para encontrarlo, factoriza cada número y toma los factores comunes con el menor exponente.",
        formula: "MCD(12, 8) = 4",
        example: "MCD(15, 25, 10) = 5 — porque 5 divide a 15, 25 y 10",
        tip: "Lista los divisores de cada número y busca el mayor que aparece en todos.",
      },
    ],
    exercises: [
      {
        id: "pr-op-1",
        question: "¿Cuánto es 6x³ · 3x²?",
        options: ["18x⁵", "9x⁵", "18x⁶", "6x⁵"],
        correctAnswer: "18x⁵",
        explanation: "6 · 3 = 18 (coeficientes), x³ · x² = x⁵ (sumas exponentes 3+2=5).",
      },
      {
        id: "pr-op-2",
        question: "Calcula el MCD de 24 y 36:",
        options: ["12", "6", "4", "9"],
        correctAnswer: "12",
        explanation: "Divisores de 24: 1,2,3,4,6,8,12,24. Divisores de 36: 1,2,3,4,6,9,12,18,36. El mayor común es 12.",
      },
      {
        id: "pr-op-3",
        question: "Simplifica: 20x⁴ ÷ 4x²",
        options: ["5x²", "5x⁶", "16x²", "5x"],
        correctAnswer: "5x²",
        explanation: "20 ÷ 4 = 5 (coeficientes). x⁴ ÷ x² = x² (restas exponentes 4-2=2). Resultado: 5x².",
      },
      {
        id: "pr-op-4",
        question: "¿Cuánto es MCD(18x³, 12x²)?",
        options: ["6x²", "6x³", "12x²", "3x"],
        correctAnswer: "6x²",
        explanation: "MCD(18,12)=6. Menor exponente de x: x². Resultado: 6x².",
      },
    ],
  },
  {
    id: "ley_signos",
    title: "Ley de Signos",
    icon: "➕➖",
    color: "#dc2626",
    shortDesc: "Reglas de signos al multiplicar, dividir y factorizar",
    concepts: [
      {
        title: "Signos en la multiplicación",
        explanation:
          "Al multiplicar dos términos, el signo del resultado depende de los signos de los factores. Positivo × Positivo = Positivo. Negativo × Negativo = Positivo. Positivo × Negativo = Negativo.",
        formula: "(+)(+) = (+) | (−)(−) = (+) | (+)(−) = (−)",
        example: "(-3)(−4) = +12 | (5)(−2) = −10",
        tip: "Truco: si los signos son IGUALES el resultado es POSITIVO. Si son DIFERENTES, el resultado es NEGATIVO.",
      },
      {
        title: "Factor común negativo",
        explanation:
          "Cuando el factor común tiene signo negativo, al sacarlo fuera del paréntesis los signos dentro se INVIERTEN. Esto es consecuencia directa de la ley de signos.",
        formula: "-a(b - c) = -ab + ac",
        example: "-3x(2x - 5) = -6x² + 15x — cada signo se invierte",
        tip: "Para verificar: multiplica el factor negativo por cada término del paréntesis. Debes obtener la expresión original.",
      },
      {
        title: "Signos en la factorización",
        explanation:
          "Al factorizar, debes ser cuidadoso con los signos. Si el primer término es negativo, puedes sacar el factor común negativo para que el primer término dentro del paréntesis sea positivo.",
        formula: "-6x² + 4x = -2x(3x - 2)",
        example: "-10a² - 15a = -5a(2a + 3) — verificar: (-5a)(2a) = -10a² ✓, (-5a)(3) = -15a ✓",
        tip: "Siempre verifica multiplicando: factor × paréntesis = expresión original.",
      },
    ],
    exercises: [
      {
        id: "pr-ls-1",
        question: "¿Cuánto es (−3) × (−5)?",
        options: ["+15", "−15", "+8", "−8"],
        correctAnswer: "+15",
        explanation: "(−)(−) = (+). Entonces (−3)(−5) = +15.",
      },
      {
        id: "pr-ls-2",
        question: "Factoriza: −4x + 8",
        options: ["−4(x − 2)", "4(x − 2)", "−4(x + 2)", "4(−x + 2)"],
        correctAnswer: "−4(x − 2)",
        explanation: "Factor: −4. −4x ÷ (−4) = x. 8 ÷ (−4) = −2. Resultado: −4(x − 2). Verifica: −4·x = −4x ✓, −4·(−2) = +8 ✓.",
      },
      {
        id: "pr-ls-3",
        question: "¿Cuál es el signo de −2x · (−3x)?",
        expression: "(−2x) · (−3x)",
        options: ["Positivo: +6x²", "Negativo: −6x²", "Positivo: +6x", "Negativo: −5x²"],
        correctAnswer: "Positivo: +6x²",
        explanation: "(−)(−) = (+). Los coeficientes: 2·3=6. Las variables: x·x=x². Resultado: +6x².",
      },
      {
        id: "pr-ls-4",
        question: "Verifica: ¿es correcto que −5x(x − 3) = −5x² + 15x?",
        options: ["Sí, es correcto", "No, debería ser −5x² − 15x", "No, debería ser 5x² − 15x", "No, debería ser −5x² + 3x"],
        correctAnswer: "Sí, es correcto",
        explanation: "(−5x)(x) = −5x² ✓. (−5x)(−3) = +15x ✓. La distribución es correcta: (−)(−) = (+).",
      },
    ],
  },
  {
    id: "variables",
    title: "Variables y Polinomios",
    icon: "🔤",
    color: "#059669",
    shortDesc: "Comprensión de variables, términos semejantes y polinomios",
    concepts: [
      {
        title: "Términos semejantes",
        explanation:
          "Solo se pueden sumar o restar términos que tienen exactamente la misma variable con el mismo exponente. x² y x son términos DIFERENTES y NO se pueden sumar directamente.",
        formula: "ax² + bx² = (a+b)x²",
        example: "3x² + 5x² = 8x² ✓ | 3x² + 5x ≠ 8x² ✗",
        tip: "Compara SOLO los términos con idéntica parte literal (misma variable Y mismo exponente).",
      },
      {
        title: "Menor potencia en factor común",
        explanation:
          "Al factorizar variables, el factor común usa la MENOR potencia de cada variable. Si tienes x³ y x², la menor es x², y esa es la que va en el factor común.",
        formula: "x³ + x² = x²(x + 1)",
        example: "6a³b + 4a²b² = 2a²b(3a + 2b) — menor potencia de a es a², de b es b",
        tip: "Identifica la potencia más baja de cada variable entre TODOS los términos del polinomio.",
      },
    ],
    exercises: [
      {
        id: "pr-var-1",
        question: "¿Cuál es el factor variable de MCD(x⁴, x²)?",
        options: ["x²", "x⁴", "x⁶", "x"],
        correctAnswer: "x²",
        explanation: "Se toma la MENOR potencia. Entre x⁴ y x², la menor es x². Resultado: x².",
      },
      {
        id: "pr-var-2",
        question: "¿Qué expresión es el MCD de 8a³b² y 12a²b³?",
        options: ["4a²b²", "4a³b³", "8a³b²", "4ab"],
        correctAnswer: "4a²b²",
        explanation: "MCD(8,12)=4. Para a: menores de a³ y a² → a². Para b: menores de b² y b³ → b². Resultado: 4a²b².",
      },
      {
        id: "pr-var-3",
        question: "Factoriza: 9x³y + 6x²y²",
        options: ["3x²y(3x + 2y)", "3xy(3x² + 2y)", "6x²y(x + y)", "3x²(3xy + 2y²)"],
        correctAnswer: "3x²y(3x + 2y)",
        explanation: "MCD(9,6)=3. Menor de x³,x² → x². Menor de y,y² → y. Factor: 3x²y. 9x³y÷3x²y=3x. 6x²y²÷3x²y=2y. Resultado: 3x²y(3x+2y).",
      },
    ],
  },
  {
    id: "equality",
    title: "El Signo Igual",
    icon: "⚖️",
    color: "#d97706",
    shortDesc: "El '=' como equivalencia, no como instrucción de calcular",
    concepts: [
      {
        title: "Equivalencia algebraica",
        explanation:
          "En álgebra, el signo igual (=) indica que dos expresiones son idénticas en valor para todo valor de la variable. No es una instrucción de 'calcular', sino de 'son lo mismo'.",
        formula: "a(b + c) = ab + ac",
        example: "3x(2x + 1) = 6x² + 3x — ambas expresiones son IDÉNTICAS",
        tip: "Para verificar que dos expresiones son iguales, sustituyelas un valor concreto (ej: x=2) y comprueba que dan el mismo resultado.",
      },
      {
        title: "Verificación de factorizaciones",
        explanation:
          "Para comprobar que tu factorización es correcta, expande el resultado multiplicando y debes obtener exactamente la expresión original. Si no coincide, hay un error.",
        formula: "Si P = Q·R, entonces Q·R expandido = P",
        example: "(x+3)(x-3) = x²-3x+3x-9 = x²-9 ✓",
        tip: "Siempre expande tu respuesta al final para verificar. Es el método infalible para detectar errores.",
      },
    ],
    exercises: [
      {
        id: "pr-eq-1",
        question: "Verifica: ¿es 2x(x + 4) = 2x² + 8x?",
        options: ["Sí, son equivalentes", "No, debería ser 2x² + 4x", "No, debería ser 2x² + 8", "No, debería ser x² + 8x"],
        correctAnswer: "Sí, son equivalentes",
        explanation: "2x·x = 2x² ✓. 2x·4 = 8x ✓. Las dos expresiones son equivalentes.",
      },
      {
        id: "pr-eq-2",
        question: "Expande (x + 5)(x − 5). ¿Qué obtienes?",
        options: ["x² − 25", "x² + 25", "x² − 10x + 25", "x² − 5"],
        correctAnswer: "x² − 25",
        explanation: "x·x = x². x·(−5) = −5x. 5·x = +5x. 5·(−5) = −25. Suma: x² − 5x + 5x − 25 = x² − 25.",
      },
      {
        id: "pr-eq-3",
        question: "Si factorizas x² + 6x + 9 = (x + 3)², ¿cómo verificas?",
        options: ["Expandiendo (x+3)² y comparando con x²+6x+9", "Sustituyendo x=0 solamente", "Calculando la raíz cuadrada", "No es necesario verificar"],
        correctAnswer: "Expandiendo (x+3)² y comparando con x²+6x+9",
        explanation: "(x+3)² = x²+6x+9. Comparando con la expresión original: son idénticas ✓.",
      },
    ],
  },
  {
    id: "potenciacion",
    title: "Potenciación",
    icon: "⚡",
    color: "#7c3aed",
    shortDesc: "Propiedades de potencias y exponentes",
    concepts: [
      {
        title: "Potencia de una potencia",
        explanation:
          "Cuando elevas una potencia a otra potencia, los exponentes se MULTIPLICAN. Esta es la propiedad (aⁿ)ᵐ = aⁿ·ᵐ. Es una propiedad fundamental que se usa constantemente en factorización.",
        formula: "(aⁿ)ᵐ = aⁿ·ᵐ",
        example: "(x³)² = x⁶ porque 3·2=6 | (2x²)³ = 8x⁶",
        tip: "No confundas: aⁿ · aᵐ = aⁿ⁺ᵐ (suma) vs (aⁿ)ᵐ = aⁿ·ᵐ (multiplica).",
      },
      {
        title: "Cuadrados perfectos",
        explanation:
          "Un cuadrado perfecto es un número que resulta de elevar otro número entero al cuadrado. Para identificarlos: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100... En variables, los exponentes pares son cuadrados perfectos.",
        formula: "n² = cuadrado perfecto",
        example: "9x⁴ es cuadrado perfecto: √9=3, √x⁴=x². Entonces (3x²)²=9x⁴",
        tip: "Un término algebraico es cuadrado perfecto si el coeficiente es cuadrado perfecto Y el exponente de la variable es par.",
      },
      {
        title: "Cubos perfectos",
        explanation:
          "Un cubo perfecto resulta de elevar algo al cubo. Para reconocerlos: 1, 8, 27, 64, 125... En variables, exponentes divisibles por 3 son cubos perfectos.",
        formula: "n³ = cubo perfecto",
        example: "8x³ es cubo perfecto: ∛8=2, ∛x³=x. Entonces (2x)³=8x³",
        tip: "Memoriza los primeros cubos: 1³=1, 2³=8, 3³=27, 4³=64, 5³=125.",
      },
    ],
    exercises: [
      {
        id: "pr-pot-1",
        question: "¿Cuánto es (x²)³?",
        options: ["x⁶", "x⁵", "x⁸", "3x²"],
        correctAnswer: "x⁶",
        explanation: "(aⁿ)ᵐ = aⁿ·ᵐ. (x²)³ = x²·³ = x⁶.",
      },
      {
        id: "pr-pot-2",
        question: "¿Es 36x⁴ un cuadrado perfecto?",
        options: ["Sí: (6x²)²", "No, 36 no es cuadrado perfecto", "Sí, pero solo si x es positivo", "No, x⁴ no es cuadrado perfecto"],
        correctAnswer: "Sí: (6x²)²",
        explanation: "√36=6 (6²=36 ✓). √x⁴=x² (el exponente 4 es par ✓). Entonces 36x⁴=(6x²)².",
      },
      {
        id: "pr-pot-3",
        question: "¿Cuánto es (2x³)²?",
        options: ["4x⁶", "2x⁶", "4x⁵", "4x⁹"],
        correctAnswer: "4x⁶",
        explanation: "2² = 4. (x³)² = x⁶. Resultado: 4x⁶.",
      },
      {
        id: "pr-pot-4",
        question: "¿Es 27x⁶ un cubo perfecto?",
        options: ["Sí: (3x²)³", "No, 27 no es cubo perfecto", "Sí: (3x³)³", "No, x⁶ no es cubo perfecto"],
        correctAnswer: "Sí: (3x²)³",
        explanation: "∛27=3 (3³=27 ✓). ∛x⁶=x² (6÷3=2 ✓). Entonces (3x²)³=27x⁶.",
      },
    ],
  },
  {
    id: "radicacion",
    title: "Radicación",
    icon: "√",
    color: "#0891b2",
    shortDesc: "Raíces cuadradas, cúbicas y propiedades",
    concepts: [
      {
        title: "Raíz cuadrada",
        explanation:
          "La raíz cuadrada de un número es el valor que, multiplicado por sí mismo, da ese número. Para calcular la raíz cuadrada de un monomio: toma la raíz del coeficiente y divide el exponente entre 2.",
        formula: "√(a²n) = aⁿ",
        example: "√(16x⁴) = 4x² porque (4x²)² = 16x⁴",
        tip: "El exponente de la variable debe ser PAR para que la raíz cuadrada sea exacta.",
      },
      {
        title: "Raíz cúbica",
        explanation:
          "La raíz cúbica da el número que, elevado al cubo, produce el original. Para monomios: toma la raíz cúbica del coeficiente y divide el exponente entre 3.",
        formula: "∛(a³n) = aⁿ",
        example: "∛(27x⁶) = 3x² porque (3x²)³ = 27x⁶",
        tip: "Para que la raíz cúbica sea exacta, el exponente debe ser divisible entre 3.",
      },
      {
        title: "Identificar raíces en factorización",
        explanation:
          "En diferencia de cuadrados y cubos, el primer paso es extraer la raíz de cada término. Si no puedes extraer una raíz exacta, la expresión no es factorizable con esa fórmula.",
        formula: "a² - b² = (a+b)(a-b); necesitas calcular a=√(primer término), b=√(segundo término)",
        example: "Para x²-25: a=√x²=x, b=√25=5. Resultado: (x+5)(x-5)",
        tip: "Si el coeficiente no tiene raíz exacta (ej: √7 no es entero), el término no es cuadrado perfecto.",
      },
    ],
    exercises: [
      {
        id: "pr-rad-1",
        question: "¿Cuánto es √(25x²)?",
        options: ["5x", "5x²", "25x", "√5 · x"],
        correctAnswer: "5x",
        explanation: "√25 = 5. √x² = x. Resultado: 5x. Verifica: (5x)² = 25x² ✓.",
      },
      {
        id: "pr-rad-2",
        question: "¿Cuánto es ∛(8x³)?",
        options: ["2x", "2x³", "8x", "∛8 · x"],
        correctAnswer: "2x",
        explanation: "∛8 = 2. ∛x³ = x. Resultado: 2x. Verifica: (2x)³ = 8x³ ✓.",
      },
      {
        id: "pr-rad-3",
        question: "Para factorizar 9a² − 16b², ¿cuáles son las raíces?",
        options: ["a = 3a, b = 4b", "a = 9a, b = 16b", "a = 3a², b = 4b²", "a = √9·a, b = √16·b"],
        correctAnswer: "a = 3a, b = 4b",
        explanation: "√(9a²) = 3a (porque (3a)² = 9a²). √(16b²) = 4b (porque (4b)² = 16b²). Resultado: (3a+4b)(3a-4b).",
      },
      {
        id: "pr-rad-4",
        question: "¿Cuánto es √(4x⁶)?",
        options: ["2x³", "2x²", "4x³", "2x⁶"],
        correctAnswer: "2x³",
        explanation: "√4=2. √x⁶=x³ (6÷2=3). Resultado: 2x³. Verifica: (2x³)²=4x⁶ ✓.",
      },
    ],
  },
];
