export interface TopicTheory {
  id: string;
  title: string;
  content: string;
  formula?: string;
  tip?: string;
}

export interface TopicExample {
  id: string;
  title: string;
  problem: string;
  expression?: string;
  steps: string[];
  result: string;
}

export interface TopicExercise {
  id: string;
  question: string;
  expression?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface VideoSuggestion {
  title: string;
  channel: string;
  url: string;
}

export interface TopicContent {
  id: string;
  sectionId: "saberes" | "algebra" | "operaciones";
  title: string;
  icon: string;
  color: string;
  definition: string;
  practiceHint?: string;
  videos?: VideoSuggestion[];
  theory: TopicTheory[];
  examples: TopicExample[];
  exercises: TopicExercise[];
}

// ══════════════════════════════════════════════
// SECCIÓN 1 — ZONA DE REPASO: SABERES PREVIOS
// ══════════════════════════════════════════════

const SABERES_TOPICS: TopicContent[] = [
  {
    id: "s1-naturales",
    sectionId: "saberes",
    title: "Números Naturales",
    icon: "🔢",
    color: "#7c3aed",
    definition:
      "Los números naturales (ℕ) son los números que usamos para contar: 1, 2, 3, 4, 5, … Se usan para contar objetos, ordenar posiciones y realizar las cuatro operaciones básicas.",
    practiceHint: "Recuerda las propiedades de los números naturales y las cuatro operaciones básicas (suma, resta, multiplicación, división). Piensa qué operación pide el problema y aplícala paso a paso.",
    videos: [
      { title: "Números naturales y operaciones básicas", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=numeros%20naturales%20operaciones%20basicas%20khan%20academy%20espa%C3%B1ol" },
      { title: "Propiedades de los números naturales", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=propiedades%20numeros%20naturales%20unicoos" },
      { title: "Operaciones con números naturales – ejercicios", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=operaciones%20numeros%20naturales%20ejercicios%20profe%20alex" },
    ],
    theory: [
      {
        id: "nat-t1",
        title: "¿Qué son los números naturales?",
        content:
          "Los números naturales comienzan en 1 y no tienen fin. Algunos autores incluyen el 0. Se representan en la recta numérica de izquierda a derecha, siempre creciendo. No incluyen decimales, fracciones ni números negativos.",
        formula: "ℕ = {1, 2, 3, 4, 5, …}",
        tip: "Truco: si puedes contar objetos físicos con ese número, es natural.",
      },
      {
        id: "nat-t2",
        title: "Operaciones con naturales",
        content:
          "Las cuatro operaciones básicas son suma, resta, multiplicación y división. El orden de operaciones (PEMDAS) indica que primero se resuelven paréntesis, luego potencias, luego multiplicación y división (de izquierda a derecha), y por último suma y resta.",
        formula: "2 + 3 × 4 = 2 + 12 = 14 (no 20)",
        tip: "Recuerda: multiplicación y división antes que suma y resta.",
      },
      {
        id: "nat-t3",
        title: "MCM y MCD",
        content:
          "El Máximo Común Divisor (MCD) es el número más grande que divide exactamente a dos o más números. El Mínimo Común Múltiplo (MCM) es el número más pequeño que es múltiplo de dos o más números. Se calculan usando la descomposición en factores primos.",
        formula: "MCD(12,18)=6 · MCM(4,6)=12",
        tip: "MCD: toma los factores comunes con el MENOR exponente. MCM: toma TODOS los factores con el MAYOR exponente.",
      },
    ],
    examples: [
      {
        id: "nat-e1",
        title: "Orden de operaciones",
        problem: "Resuelve: 5 + 3 × 2 − 4 ÷ 2",
        steps: [
          "Paso 1: Multiplicación: 3 × 2 = 6",
          "Paso 2: División: 4 ÷ 2 = 2",
          "Paso 3: Suma y resta de izquierda a derecha: 5 + 6 − 2 = 9",
        ],
        result: "9",
      },
      {
        id: "nat-e2",
        title: "Calcular MCM y MCD",
        problem: "Halla el MCD y el MCM de 12 y 18",
        expression: "12 = 2² × 3   |   18 = 2 × 3²",
        steps: [
          "Descompón: 12 = 2² × 3 y 18 = 2 × 3²",
          "MCD: factores comunes con menor exponente → 2¹ × 3¹ = 6",
          "MCM: todos los factores con mayor exponente → 2² × 3² = 36",
        ],
        result: "MCD = 6, MCM = 36",
      },
    ],
    exercises: [
      {
        id: "nat-ex1",
        question: "¿Cuánto es 8 + 4 × 3?",
        options: ["36", "20", "12", "44"],
        correctAnswer: "20",
        explanation: "Primero la multiplicación: 4 × 3 = 12. Luego la suma: 8 + 12 = 20.",
      },
      {
        id: "nat-ex2",
        question: "¿Cuál es el MCD de 8 y 12?",
        options: ["4", "2", "6", "24"],
        correctAnswer: "4",
        explanation: "8 = 2³, 12 = 2² × 3. Factor común mínimo: 2² = 4.",
      },
      {
        id: "nat-ex3",
        question: "¿Cuál es el MCM de 6 y 9?",
        options: ["18", "3", "54", "6"],
        correctAnswer: "18",
        explanation: "6 = 2 × 3, 9 = 3². MCM = 2 × 3² = 18.",
      },
      {
        id: "nat-ex4",
        question: "¿Cuánto es (12 − 4) ÷ 2 + 3 × 2?",
        options: ["10", "12", "4", "8"],
        correctAnswer: "10",
        explanation: "Paréntesis: 12−4=8. División: 8÷2=4. Multiplicación: 3×2=6. Suma: 4+6=10.",
      },
      {
        id: "nat-ex5",
        question: "En una tienda, los productos A llegan cada 6 días y los B cada 9 días. ¿Cada cuántos días coinciden ambas entregas?",
        options: ["18 días", "3 días", "54 días", "15 días"],
        correctAnswer: "18 días",
        explanation: "El MCM(6, 9) = 18. Se toman los factores con mayor exponente: 2 × 3² = 18.",
      },
      {
        id: "nat-ex6",
        question: "Un maratón tiene 144 participantes. Si se forman filas de 12 personas, ¿cuántas filas se necesitan?",
        options: ["12 filas", "10 filas", "14 filas", "18 filas"],
        correctAnswer: "12 filas",
        explanation: "144 ÷ 12 = 12 filas. División exacta de naturales.",
      },
      {
        id: "nat-ex7",
        question: "¿Cuánto es 5² − (3 + 1) × 4?",
        options: ["9", "41", "84", "21"],
        correctAnswer: "9",
        explanation: "Paréntesis: 3+1=4. Potencia: 5²=25. Multiplicación: 4×4=16. Resta: 25−16=9.",
      },
      {
        id: "nat-ex8",
        question: "Una fábrica produce 360 piezas en 8 horas. ¿Cuántas piezas produce por hora?",
        options: ["45", "40", "48", "36"],
        correctAnswer: "45",
        explanation: "360 ÷ 8 = 45 piezas por hora.",
      },
    ],
  },

  {
    id: "s1-decimales",
    sectionId: "saberes",
    title: "Números Decimales",
    icon: "🔸",
    color: "#2563eb",
    definition:
      "Los números decimales tienen una parte entera y una parte fraccionaria separadas por una coma (o punto). Permiten representar cantidades que no son enteras exactas.",
    practiceHint: "Alinea los puntos decimales uno sobre otro antes de sumar o restar. La posición de cada cifra (décimas, centésimas…) es clave para no cometer errores.",
    videos: [
      { title: "Números decimales: suma y resta", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=numeros%20decimales%20suma%20resta%20khan%20academy%20espa%C3%B1ol" },
      { title: "Multiplicación y división de decimales", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=multiplicacion%20division%20numeros%20decimales%20unicoos" },
      { title: "Ejercicios con decimales paso a paso", channel: "Matemáticas profe Alex", url: "https://www.youtube.com/results?search_query=ejercicios%20decimales%20paso%20a%20paso%20matematicas" },
    ],
    theory: [
      {
        id: "dec-t1",
        title: "Partes de un decimal",
        content:
          "En el número 3,75: la parte entera es 3 (unidades) y la parte decimal es 75 (75 centésimas = 0,75). El valor posicional disminuye hacia la derecha: décimas, centésimas, milésimas...",
        formula: "3,75 = 3 + 7/10 + 5/100",
        tip: "Cada posición a la derecha de la coma vale 10 veces menos que la anterior.",
      },
      {
        id: "dec-t2",
        title: "Operaciones con decimales",
        content:
          "Suma y resta: alinea las comas y opera dígito a dígito. Multiplicación: opera sin coma y luego cuenta los decimales totales de los factores. División: si el divisor tiene decimales, multiplica ambos por 10 hasta que sea entero.",
        formula: "0,4 × 0,5 = 0,20 (2 decimales en total)",
        tip: "En la multiplicación cuenta los decimales de AMBOS factores y ponlos en el resultado.",
      },
    ],
    examples: [
      {
        id: "dec-e1",
        title: "Suma de decimales",
        problem: "Suma 5,7 + 2,35",
        expression: "5,70 + 2,35",
        steps: [
          "Alinea las comas: 5,70 + 2,35",
          "Suma centésimas: 0 + 5 = 5",
          "Suma décimas: 7 + 3 = 10, escribe 0 y lleva 1",
          "Suma enteros: 5 + 2 + 1 = 8",
        ],
        result: "8,05",
      },
      {
        id: "dec-e2",
        title: "Multiplicación de decimales",
        problem: "Calcula 1,2 × 0,3",
        steps: [
          "Opera sin coma: 12 × 3 = 36",
          "Cuenta decimales: 1 (de 1,2) + 1 (de 0,3) = 2 decimales",
          "Ubica la coma: 0,36",
        ],
        result: "0,36",
      },
    ],
    exercises: [
      {
        id: "dec-ex1",
        question: "¿Cuánto es 4,5 + 2,75?",
        options: ["7,25", "6,25", "7,75", "6,75"],
        correctAnswer: "7,25",
        explanation: "4,50 + 2,75 = 7,25. Alineando comas: 50+75=125, escribe 25 lleva 1; 4+2+1=7.",
      },
      {
        id: "dec-ex2",
        question: "¿Cuánto es 0,6 × 0,4?",
        options: ["0,24", "2,4", "0,024", "24"],
        correctAnswer: "0,24",
        explanation: "6 × 4 = 24. Con 2 decimales totales: 0,24.",
      },
      {
        id: "dec-ex3",
        question: "¿Cuánto es 3,6 ÷ 0,9?",
        options: ["4", "0,4", "40", "0,04"],
        correctAnswer: "4",
        explanation: "Multiplica por 10: 36 ÷ 9 = 4.",
      },
      {
        id: "dec-ex4",
        question: "¿Cuánto es 2,5 − 1,38?",
        options: ["1,12", "1,22", "1,38", "0,87"],
        correctAnswer: "1,12",
        explanation: "2,50 − 1,38 = 1,12. Centésimas: 0−8, pedimos prestado → 10−8=2. Décimas: 4−3=1. Enteros: 2−1=1.",
      },
      {
        id: "dec-ex5",
        question: "Compras 3 cuadernos a $12,50 cada uno. Pagas con $50. ¿Cuánto te devuelven?",
        options: ["$12,50", "$37,50", "$10,00", "$25,00"],
        correctAnswer: "$12,50",
        explanation: "3 × 12,50 = 37,50. Cambio: 50 − 37,50 = 12,50.",
      },
      {
        id: "dec-ex6",
        question: "Un carro recorre 240 km consumiendo 18,6 litros. ¿Cuántos litros por cada 100 km?",
        options: ["7,75 L", "8,0 L", "6,5 L", "9,3 L"],
        correctAnswer: "7,75 L",
        explanation: "18,6 ÷ 240 × 100 = 7,75 L/100 km.",
      },
      {
        id: "dec-ex7",
        question: "Un estudiante obtiene notas: 4,5 — 3,8 — 4,2 — 3,6. ¿Cuál es su promedio?",
        options: ["4,025", "4,0", "3,95", "4,1"],
        correctAnswer: "4,025",
        explanation: "(4,5 + 3,8 + 4,2 + 3,6) ÷ 4 = 16,1 ÷ 4 = 4,025.",
      },
      {
        id: "dec-ex8",
        question: "Una tela mide 5,75 m. Se cortan 2,3 m. ¿Cuánto sobra?",
        options: ["3,45 m", "3,55 m", "3,25 m", "3,15 m"],
        correctAnswer: "3,45 m",
        explanation: "5,75 − 2,30 = 3,45 m. Alinea la coma al restar.",
      },
    ],
  },

  {
    id: "s1-enteros",
    sectionId: "saberes",
    title: "Números Enteros",
    icon: "➕",
    color: "#dc2626",
    definition:
      "Los números enteros (ℤ) incluyen los naturales, el cero y los números negativos: …, −3, −2, −1, 0, 1, 2, 3, … Los negativos aparecen en deudas, temperaturas bajo cero, pisos de sótano, etc.",
    practiceHint: "Usa la recta numérica: positivos a la derecha, negativos a la izquierda. Mismo signo: suma y conserva el signo. Signos distintos: resta y usa el signo del mayor.",
    videos: [
      { title: "Números enteros y la recta numérica", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=numeros%20enteros%20recta%20numerica%20khan%20academy%20espa%C3%B1ol" },
      { title: "Suma y resta de números enteros", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=suma%20resta%20numeros%20enteros%20unicoos" },
      { title: "Multiplicación de enteros – regla de signos", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=multiplicacion%20numeros%20enteros%20regla%20signos%20profe%20alex" },
    ],
    theory: [
      {
        id: "ent-t1",
        title: "La recta numérica entera",
        content:
          "En la recta numérica los números negativos están a la izquierda del 0 y los positivos a la derecha. −5 es menor que −2 porque está más a la izquierda. El valor absoluto |n| es la distancia al 0 (siempre positiva).",
        formula: "ℤ = {…, −3, −2, −1, 0, 1, 2, 3, …}",
        tip: "|−7| = 7 y |7| = 7. El valor absoluto nunca es negativo.",
      },
      {
        id: "ent-t2",
        title: "Ley de signos",
        content:
          "Al sumar enteros de igual signo, se suman los valores absolutos y se conserva el signo. Si tienen diferente signo, se restan los valores absolutos y se toma el signo del mayor. En multiplicación y división: igual signo → positivo; diferente signo → negativo.",
        formula: "(+)(+)=+ · (−)(−)=+ · (+)(−)=− · (−)(+)=−",
        tip: "Para la multiplicación: cuenta las cantidades de signos negativos. Par de negativos → resultado positivo.",
      },
    ],
    examples: [
      {
        id: "ent-e1",
        title: "Suma con distintos signos",
        problem: "Calcula −8 + 5",
        steps: [
          "Signos distintos: resto los valores absolutos: 8 − 5 = 3",
          "Tomo el signo del mayor: |−8| > |5|, entonces el signo es negativo",
        ],
        result: "−3",
      },
      {
        id: "ent-e2",
        title: "Multiplicación de enteros",
        problem: "Calcula (−4) × (−3) × 2",
        steps: [
          "(−4) × (−3) = +12 (negativo × negativo = positivo)",
          "+12 × 2 = +24",
        ],
        result: "+24",
      },
    ],
    exercises: [
      {
        id: "ent-ex1",
        question: "¿Cuánto es (−6) + (−4)?",
        options: ["−10", "10", "−2", "2"],
        correctAnswer: "−10",
        explanation: "Igual signo: se suman los valores absolutos (6+4=10) y se conserva el negativo.",
      },
      {
        id: "ent-ex2",
        question: "¿Cuánto es (−3) × 5?",
        options: ["−15", "15", "−8", "8"],
        correctAnswer: "−15",
        explanation: "Diferente signo → resultado negativo. 3 × 5 = 15, resultado: −15.",
      },
      {
        id: "ent-ex3",
        question: "¿Cuánto es −20 ÷ (−4)?",
        options: ["5", "−5", "−16", "16"],
        correctAnswer: "5",
        explanation: "Igual signo → positivo. 20 ÷ 4 = 5.",
      },
      {
        id: "ent-ex4",
        question: "¿Cuánto es −3 + 7 − 5?",
        options: ["−1", "1", "5", "−5"],
        correctAnswer: "−1",
        explanation: "−3 + 7 = 4. Luego 4 − 5 = −1.",
      },
      {
        id: "ent-ex5",
        question: "La temperatura en Bogotá es −3°C. Sube 11 grados. ¿Cuál es la temperatura final?",
        options: ["8°C", "−14°C", "14°C", "−8°C"],
        correctAnswer: "8°C",
        explanation: "−3 + 11 = 8°C. Suma de entero negativo + positivo: |11| > |−3|, resultado positivo.",
      },
      {
        id: "ent-ex6",
        question: "Una cuenta bancaria tiene $200. Se retira $350 y luego se deposita $100. ¿Cuál es el saldo?",
        options: ["−$50", "$50", "$650", "−$150"],
        correctAnswer: "−$50",
        explanation: "200 − 350 + 100 = −150 + 100 = −50. Saldo negativo (deuda).",
      },
      {
        id: "ent-ex7",
        question: "Un submarino está a −120 m. Sube 45 m. ¿A qué profundidad queda?",
        options: ["−75 m", "75 m", "−165 m", "165 m"],
        correctAnswer: "−75 m",
        explanation: "−120 + 45 = −75 m. Sigue bajo el nivel del mar (negativo).",
      },
      {
        id: "ent-ex8",
        question: "¿Cuánto es (−4) × (−3) + (−6)?",
        options: ["6", "18", "−18", "−6"],
        correctAnswer: "6",
        explanation: "(−4) × (−3) = 12 (negativo × negativo = positivo). 12 + (−6) = 6.",
      },
    ],
  },

  {
    id: "s1-racionales",
    sectionId: "saberes",
    title: "Números Racionales",
    icon: "½",
    color: "#7c3aed",
    definition:
      "Un número racional es todo número que se puede expresar como fracción p/q donde p y q son enteros y q ≠ 0. Incluye los naturales, enteros, fracciones y decimales periódicos.",
    practiceHint: "Para operar fracciones, iguala los denominadores primero. Para multiplicar: numerador × numerador, denominador × denominador. Simplifica al final.",
    videos: [
      { title: "Números racionales y fracciones", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=numeros%20racionales%20fracciones%20khan%20academy%20espa%C3%B1ol" },
      { title: "Operaciones con fracciones paso a paso", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=operaciones%20fracciones%20paso%20a%20paso%20unicoos" },
      { title: "Fracciones: suma resta multiplicación división", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=fracciones%20suma%20resta%20multiplicacion%20division%20profe%20alex" },
    ],
    theory: [
      {
        id: "rac-t1",
        title: "¿Qué es un racional?",
        content:
          "Los racionales se escriben como fracción: numerador sobre denominador. Un decimal periódico (0,333… = 1/3) es racional. Un decimal exacto (0,25 = 1/4) también lo es. Los no periódicos e infinitos como √2 son irracionales.",
        formula: "ℚ = {p/q | p,q ∈ ℤ, q ≠ 0}",
        tip: "Si el decimal termina o se repite, el número es racional.",
      },
      {
        id: "rac-t2",
        title: "Operaciones con fracciones",
        content:
          "Suma/resta: convierte a denominador común (usando MCM). Multiplicación: numerador × numerador sobre denominador × denominador. División: multiplica por el inverso (da vuelta la segunda fracción).",
        formula: "a/b + c/d = (ad + bc)/(bd)",
        tip: "En la multiplicación de fracciones NO es necesario igualar denominadores.",
      },
    ],
    examples: [
      {
        id: "rac-e1",
        title: "Suma de fracciones",
        problem: "Calcula 1/3 + 1/4",
        steps: [
          "MCM de 3 y 4 = 12",
          "1/3 = 4/12 y 1/4 = 3/12",
          "4/12 + 3/12 = 7/12",
        ],
        result: "7/12",
      },
      {
        id: "rac-e2",
        title: "División de fracciones",
        problem: "Calcula (3/5) ÷ (2/7)",
        steps: [
          "Multiplica por el inverso: 3/5 × 7/2",
          "Numeradores: 3 × 7 = 21",
          "Denominadores: 5 × 2 = 10",
        ],
        result: "21/10 = 2,1",
      },
    ],
    exercises: [
      {
        id: "rac-ex1",
        question: "¿Cuánto es 2/5 + 1/4?",
        options: ["13/20", "3/9", "3/20", "7/10"],
        correctAnswer: "13/20",
        explanation: "MCM(5,4)=20. 2/5=8/20, 1/4=5/20. Suma: 13/20.",
      },
      {
        id: "rac-ex2",
        question: "¿Cuánto es (3/4) × (8/9)?",
        options: ["24/36 = 2/3", "11/13", "1/3", "3/8"],
        correctAnswer: "24/36 = 2/3",
        explanation: "3×8=24 y 4×9=36. 24/36 simplifica a 2/3.",
      },
      {
        id: "rac-ex3",
        question: "¿Cuál es el decimal equivalente a 3/8?",
        options: ["0,375", "0,38", "0,3", "0,125"],
        correctAnswer: "0,375",
        explanation: "3 ÷ 8 = 0,375.",
      },
      {
        id: "rac-ex4",
        question: "¿0,666… es un número racional?",
        options: ["Sí, porque es periódico", "No, porque no termina", "Sí, porque es positivo", "No, es irracional"],
        correctAnswer: "Sí, porque es periódico",
        explanation: "0,666… = 2/3. Los decimales periódicos son racionales.",
      },
      {
        id: "rac-ex5",
        question: "Una receta para 4 personas usa 3/4 de taza de harina. ¿Cuánta harina se necesita para 12 personas?",
        options: ["9/4 tazas", "3/4 taza", "9/12 tazas", "1/4 taza"],
        correctAnswer: "9/4 tazas",
        explanation: "12 personas = 3 veces la receta. 3/4 × 3 = 9/4 tazas.",
      },
      {
        id: "rac-ex6",
        question: "Pedro caminó 2/3 de un recorrido de 15 km. ¿Cuántos km caminó?",
        options: ["10 km", "5 km", "12 km", "9 km"],
        correctAnswer: "10 km",
        explanation: "2/3 × 15 = 30/3 = 10 km.",
      },
      {
        id: "rac-ex7",
        question: "¿Cuánto es 3/4 + 1/6?",
        options: ["11/12", "4/10", "9/24", "5/12"],
        correctAnswer: "11/12",
        explanation: "MCM(4,6)=12. 3/4=9/12, 1/6=2/12. 9/12+2/12=11/12.",
      },
      {
        id: "rac-ex8",
        question: "En una clase de 30 estudiantes, 2/5 son niñas. ¿Cuántas niñas hay?",
        options: ["12", "15", "10", "18"],
        correctAnswer: "12",
        explanation: "2/5 × 30 = 60/5 = 12 niñas.",
      },
    ],
  },

  {
    id: "s1-irracionales",
    sectionId: "saberes",
    title: "Números Irracionales",
    icon: "√",
    color: "#059669",
    definition:
      "Un número irracional NO puede expresarse como fracción de enteros. Su decimal es infinito y NO periódico (nunca se repite de forma regular). Ejemplos: √2, √3, π, φ (número áureo).",
    practiceHint: "Los irracionales no pueden escribirse como fracción exacta (π, √2, √3…). Si la raíz no da un número exacto, el resultado es irracional.",
    videos: [
      { title: "Números irracionales: qué son y ejemplos", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=numeros%20irracionales%20que%20son%20ejemplos%20khan%20academy%20espa%C3%B1ol" },
      { title: "Diferencia entre racionales e irracionales", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=diferencia%20racionales%20irracionales%20unicoos" },
      { title: "√2, π y otros irracionales explicados", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=numeros%20irracionales%20raiz%20cuadrada%20pi%20explicacion" },
    ],
    theory: [
      {
        id: "irr-t1",
        title: "¿Qué es un irracional?",
        content:
          "√2 = 1,41421356… Los dígitos continúan infinitamente sin ningún patrón que se repita. No existe fracción p/q exacta para este número. Históricamente, los griegos descubrieron los irracionales con el lado de un cuadrado de área 2.",
        formula: "√2 ≈ 1,4142 · π ≈ 3,1416",
        tip: "Una raíz cuadrada de un número que NO es cuadrado perfecto siempre es irracional.",
      },
      {
        id: "irr-t2",
        title: "Operaciones con irracionales",
        content:
          "√a × √b = √(ab). √a / √b = √(a/b). (√a)² = a. Para sumar irracionales del mismo tipo: 2√3 + 5√3 = 7√3. No se pueden sumar irracionales distintos: √2 + √3 no se simplifica.",
        formula: "(√5)² = 5 · √4 × √9 = √36 = 6",
        tip: "Recuerda que elevar al cuadrado y sacar raíz son operaciones inversas.",
      },
    ],
    examples: [
      {
        id: "irr-e1",
        title: "Simplificar una raíz",
        problem: "Simplifica √48",
        steps: [
          "Descompón 48 = 16 × 3",
          "√48 = √(16 × 3) = √16 × √3",
          "= 4√3",
        ],
        result: "4√3",
      },
      {
        id: "irr-e2",
        title: "Sumar raíces semejantes",
        problem: "Calcula 3√5 + 2√5 − √5",
        steps: [
          "Todos tienen √5 como factor común",
          "Suma los coeficientes: 3 + 2 − 1 = 4",
        ],
        result: "4√5",
      },
    ],
    exercises: [
      {
        id: "irr-ex1",
        question: "¿Cuál de los siguientes es irracional?",
        options: ["√7", "√9", "0,5", "4/5"],
        correctAnswer: "√7",
        explanation: "√9 = 3 (racional). √7 = 2,6457… (no periódico, irracional).",
      },
      {
        id: "irr-ex2",
        question: "¿Cuánto es (√6)²?",
        options: ["6", "36", "√36", "3"],
        correctAnswer: "6",
        explanation: "(√6)² = 6. La raíz y el cuadrado se anulan.",
      },
      {
        id: "irr-ex3",
        question: "Simplifica √75",
        options: ["5√3", "3√5", "25√3", "√75"],
        correctAnswer: "5√3",
        explanation: "75 = 25 × 3. √75 = √25 × √3 = 5√3.",
      },
      {
        id: "irr-ex4",
        question: "¿Cuánto es 2√2 + 3√2?",
        options: ["5√2", "5√4", "6√2", "5√6"],
        correctAnswer: "5√2",
        explanation: "Son semejantes: (2+3)√2 = 5√2.",
      },
      {
        id: "irr-ex5",
        question: "¿Cuál de estos números es irracional?",
        options: ["√7", "√9", "√16", "√25"],
        correctAnswer: "√7",
        explanation: "√9=3, √16=4, √25=5 son enteros. √7 ≈ 2,6457… no tiene fin ni periodo.",
      },
      {
        id: "irr-ex6",
        question: "Un cuadrado tiene área 50 m². ¿Cuánto mide su lado?",
        options: ["5√2 m", "10 m", "7 m", "25 m"],
        correctAnswer: "5√2 m",
        explanation: "lado = √50 = √(25×2) = 5√2 ≈ 7,07 m. No es racional.",
      },
      {
        id: "irr-ex7",
        question: "Un cuadrado de lado 6 cm. ¿Cuánto mide su diagonal (simplificada)?",
        options: ["6√2 cm", "12 cm", "√36 cm", "36 cm"],
        correctAnswer: "6√2 cm",
        explanation: "diagonal = lado × √2 = 6√2 cm ≈ 8,49 cm.",
      },
      {
        id: "irr-ex8",
        question: "¿Por qué π es un número irracional?",
        options: ["Porque su decimal no termina ni se repite", "Porque es mayor que 3", "Porque no se puede dibujar", "Porque es negativo"],
        correctAnswer: "Porque su decimal no termina ni se repite",
        explanation: "π = 3,14159265… es irracional: infinitos decimales sin patrón periódico.",
      },
    ],
  },

  {
    id: "s1-reales",
    sectionId: "saberes",
    title: "Números Reales",
    icon: "♾️",
    color: "#0891b2",
    definition:
      "El conjunto de los números reales (ℝ) reúne TODOS los anteriores: naturales, enteros, racionales e irracionales. Cualquier punto en la recta numérica corresponde a un real.",
    practiceHint: "Clasifica el número: ¿es entero? ¿fracción exacta? ¿decimal infinito no periódico? Cada número real pertenece a una categoría: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.",
    videos: [
      { title: "Números reales y su clasificación", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=numeros%20reales%20clasificacion%20khan%20academy%20espa%C3%B1ol" },
      { title: "Conjunto de los números reales", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=conjunto%20numeros%20reales%20unicoos" },
      { title: "¿Qué son los números reales? Explicación completa", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=numeros%20reales%20explicacion%20completa%20profe%20alex" },
    ],
    theory: [
      {
        id: "real-t1",
        title: "Clasificación de los reales",
        content:
          "ℝ = ℚ ∪ 𝕀 (racionales + irracionales). Todo natural es entero, todo entero es racional, todo racional es real. Pero no todo real es racional (los irracionales no lo son). Se representan como subconjuntos anidados: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.",
        formula: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ",
        tip: "Un número real puede ser racional O irracional, pero nunca ambos al mismo tiempo.",
      },
      {
        id: "real-t2",
        title: "Orden en los reales",
        content:
          "Los reales se pueden ordenar en la recta numérica. Para comparar: convierte a decimales si es necesario. Útil para comparar mezclados: −√3 ≈ −1,73; comparar con −2 o −1 directamente en la recta.",
        formula: "−π < −2 < −√2 < 0 < ½ < 1 < √3 < 2",
        tip: "Convierte todos a decimal aproximado antes de ordenar.",
      },
    ],
    examples: [
      {
        id: "real-e1",
        title: "Clasificar números",
        problem: "Clasifica: −3, 0, ½, √5, π, 0,25",
        steps: [
          "−3: natural❌ entero✅ racional✅ real✅",
          "0: natural❌(algunos lo incluyen) entero✅ racional✅ real✅",
          "½: natural❌ entero❌ racional✅ real✅",
          "√5: racional❌ irracional✅ real✅",
          "π: racional❌ irracional✅ real✅",
          "0,25 = 1/4: racional✅ real✅",
        ],
        result: "Todos son reales. √5 y π son irracionales. Los demás son racionales.",
      },
      {
        id: "real-e2",
        title: "Ordenar de menor a mayor",
        problem: "Ordena: √3, −1, 2, −√5, ½",
        expression: "√3≈1,73 · √5≈2,24",
        steps: [
          "Convierte: √3 ≈ 1,73 y −√5 ≈ −2,24",
          "Lista: −2,24 < −1 < 0,5 < 1,73 < 2",
        ],
        result: "−√5 < −1 < ½ < √3 < 2",
      },
    ],
    exercises: [
      {
        id: "real-ex1",
        question: "¿A cuál conjunto NO pertenece π?",
        options: ["Racionales", "Irracionales", "Reales", "Ninguno de los anteriores"],
        correctAnswer: "Racionales",
        explanation: "π = 3,14159… es irracional (no se puede expresar como fracción).",
      },
      {
        id: "real-ex2",
        question: "¿Cuál de estos es racional?",
        options: ["0,252525…", "√11", "π", "√7"],
        correctAnswer: "0,252525…",
        explanation: "0,2525… = 25/99, es periódico por lo tanto racional.",
      },
      {
        id: "real-ex3",
        question: "¿Cuál es el orden correcto de menor a mayor?",
        expression: "−√2,  0,  1/2,  √3",
        options: ["−√2 < 0 < ½ < √3", "0 < −√2 < ½ < √3", "−√2 < ½ < 0 < √3", "½ < 0 < −√2 < √3"],
        correctAnswer: "−√2 < 0 < ½ < √3",
        explanation: "−√2≈−1,41. Orden: −1,41 < 0 < 0,5 < 1,73.",
      },
      {
        id: "real-ex4",
        question: "Todo número racional es real, ¿y al revés?",
        options: ["No, hay reales irracionales que no son racionales", "Sí, todo real es racional", "Solo los enteros son reales", "Ningún irracional es real"],
        correctAnswer: "No, hay reales irracionales que no son racionales",
        explanation: "ℚ ⊂ ℝ pero no al revés. Los irracionales (√2, π) son reales pero no racionales.",
      },
      {
        id: "real-ex5",
        question: "¿A cuál subconjunto de los reales pertenece −3/4?",
        options: ["Racional (Q)", "Natural (N)", "Irracional (I)", "Solo entero (Z)"],
        correctAnswer: "Racional (Q)",
        explanation: "−3/4 es una fracción, por tanto racional. Pertenece a Q ⊂ R, pero no a N ni Z.",
      },
      {
        id: "real-ex6",
        question: "¿Cuál de estos NO es un número real?",
        options: ["√−4", "√4", "π", "−7"],
        correctAnswer: "√−4",
        explanation: "√−4 es imaginario, no real. Los reales incluyen racionales, irracionales, enteros y naturales.",
      },
      {
        id: "real-ex7",
        question: "0,121212… ¿a qué conjunto pertenece?",
        options: ["Racional (decimal periódico)", "Irracional", "Natural", "Entero negativo"],
        correctAnswer: "Racional (decimal periódico)",
        explanation: "0,1212… = 12/99 = 4/33. Todo decimal periódico es racional.",
      },
      {
        id: "real-ex8",
        question: "¿Cuál relación de contenido es correcta?",
        options: ["ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ", "ℚ ⊂ ℤ ⊂ ℕ ⊂ ℝ", "ℝ ⊂ ℚ ⊂ ℤ ⊂ ℕ", "ℤ ⊂ ℕ ⊂ ℚ ⊂ ℝ"],
        correctAnswer: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ",
        explanation: "Los naturales están dentro de los enteros, que están dentro de los racionales, que están dentro de los reales.",
      },
    ],
  },

  {
    id: "s1-potencias",
    sectionId: "saberes",
    title: "Potencias y Propiedades",
    icon: "⬆️",
    color: "#d97706",
    definition:
      "Una potencia aⁿ representa multiplicar la base a por sí misma n veces. El exponente n indica cuántas veces se multiplica la base. Las propiedades de potencias permiten simplificar operaciones.",
    practiceHint: "Base^exponente = base multiplicada por sí misma 'exponente' veces. Para multiplicar potencias de igual base: suma exponentes. Para dividir: réstalos.",
    videos: [
      { title: "Potencias y sus propiedades", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=potencias%20propiedades%20khan%20academy%20espa%C3%B1ol" },
      { title: "Leyes de los exponentes explicadas", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=leyes%20exponentes%20potencias%20unicoos" },
      { title: "Ejercicios de potencias: producto, cociente, potencia", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=ejercicios%20potencias%20exponentes%20profe%20alex" },
    ],
    theory: [
      {
        id: "pot-t1",
        title: "Definición y lectura",
        content:
          "aⁿ se lee 'a elevado a la n' o 'a a la n'. La base es a y el exponente es n. Casos especiales: a¹ = a, a⁰ = 1 (para a ≠ 0), a⁻ⁿ = 1/aⁿ. Una potencia de base negativa con exponente par es positiva; con exponente impar es negativa.",
        formula: "aⁿ = a × a × a … (n veces)",
        tip: "(−3)² = 9 pero −3² = −9. ¡El paréntesis importa!",
      },
      {
        id: "pot-t2",
        title: "Propiedades de potencias",
        content:
          "① Producto de misma base: aᵐ × aⁿ = aᵐ⁺ⁿ. ② División de misma base: aᵐ ÷ aⁿ = aᵐ⁻ⁿ. ③ Potencia de una potencia: (aᵐ)ⁿ = aᵐˣⁿ. ④ Potencia de un producto: (ab)ⁿ = aⁿbⁿ. ⑤ Potencia de una fracción: (a/b)ⁿ = aⁿ/bⁿ.",
        formula: "2³ × 2⁴ = 2⁷ · (3²)⁴ = 3⁸",
        tip: "Al multiplicar misma base: SUMA exponentes. Al dividir: RESTA.",
      },
    ],
    examples: [
      {
        id: "pot-e1",
        title: "Aplicar propiedades",
        problem: "Simplifica: x⁵ × x³ ÷ x²",
        steps: [
          "Multiplicación: x⁵ × x³ = x⁵⁺³ = x⁸",
          "División: x⁸ ÷ x² = x⁸⁻² = x⁶",
        ],
        result: "x⁶",
      },
      {
        id: "pot-e2",
        title: "Potencia de potencia",
        problem: "Calcula (2³)⁴",
        steps: [
          "Multiplica los exponentes: 3 × 4 = 12",
          "(2³)⁴ = 2¹² = 4096",
        ],
        result: "4096",
      },
    ],
    exercises: [
      {
        id: "pot-ex1",
        question: "¿Cuánto es 3⁵?",
        expression: "3⁵ = 3 × 3 × 3 × 3 × 3",
        options: ["243", "125", "81", "15"],
        correctAnswer: "243",
        explanation: "3¹=3, 3²=9, 3³=27, 3⁴=81, 3⁵=243.",
      },
      {
        id: "pot-ex2",
        question: "Simplifica: a⁴ × a³",
        options: ["a⁷", "a¹²", "a⁴", "a³"],
        correctAnswer: "a⁷",
        explanation: "Misma base, suma exponentes: 4 + 3 = 7.",
      },
      {
        id: "pot-ex3",
        question: "¿Cuánto es (x²)³?",
        options: ["x⁶", "x⁵", "x²", "x⁸"],
        correctAnswer: "x⁶",
        explanation: "Potencia de potencia: 2 × 3 = 6, resultado x⁶.",
      },
      {
        id: "pot-ex4",
        question: "¿Cuánto es 5⁰?",
        options: ["1", "0", "5", "indefinido"],
        correctAnswer: "1",
        explanation: "Todo número distinto de 0 elevado a 0 es igual a 1.",
      },
      {
        id: "pot-ex5",
        question: "Una bacteria se duplica cada hora. Si hay 1 bacteria, ¿cuántas hay después de 8 horas?",
        options: ["256", "128", "512", "64"],
        correctAnswer: "256",
        explanation: "2⁸ = 256. Cada hora se multiplica por 2: 1→2→4→8→16→32→64→128→256.",
      },
      {
        id: "pot-ex6",
        question: "¿Cuánto es (2³)²?",
        options: ["64", "32", "16", "12"],
        correctAnswer: "64",
        explanation: "(2³)² = 2^(3×2) = 2⁶ = 64. Al elevar una potencia, se multiplican los exponentes.",
      },
      {
        id: "pot-ex7",
        question: "¿Cuánto es 3⁴ ÷ 3²?",
        options: ["9", "81", "27", "3"],
        correctAnswer: "9",
        explanation: "3⁴ ÷ 3² = 3^(4−2) = 3² = 9. Al dividir potencias de igual base, se restan los exponentes.",
      },
      {
        id: "pot-ex8",
        question: "Si doblas una hoja de papel 10 veces, ¿cuántas capas tienes?",
        options: ["1024", "512", "2048", "256"],
        correctAnswer: "1024",
        explanation: "Cada doblez duplica las capas: 2¹⁰ = 1024 capas.",
      },
    ],
  },

  {
    id: "s1-factores",
    sectionId: "saberes",
    title: "Descomposición en Factores Primos",
    icon: "🔍",
    color: "#7c3aed",
    definition:
      "Descomponer un número natural en factores primos significa escribirlo como producto de números primos. Todo número mayor que 1 tiene una única descomposición en primos (Teorema Fundamental de la Aritmética).",
    practiceHint: "Divide entre los primos en orden (2, 3, 5, 7…) hasta llegar a 1. El MCD = producto de factores comunes con el menor exponente.",
    videos: [
      { title: "Factorización prima de números", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=factorizacion%20prima%20numeros%20khan%20academy%20espa%C3%B1ol" },
      { title: "MCD y MCM usando factores primos", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=mcd%20mcm%20factores%20primos%20unicoos" },
      { title: "Descomposición en factores primos – ejercicios", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=descomposicion%20factores%20primos%20ejercicios%20profe%20alex" },
    ],
    theory: [
      {
        id: "fac-t1",
        title: "Números primos y compuestos",
        content:
          "Un número primo tiene exactamente dos divisores: 1 y él mismo. Primos: 2, 3, 5, 7, 11, 13, 17, 19, 23… Un número compuesto tiene más de dos divisores. El 1 no es primo ni compuesto.",
        formula: "Primos < 20: 2, 3, 5, 7, 11, 13, 17, 19",
        tip: "El 2 es el único primo par. Todos los demás primos son impares.",
      },
      {
        id: "fac-t2",
        title: "Árbol de factores / división sucesiva",
        content:
          "Para descomponer un número: divídelo entre el primo más pequeño que lo divide exactamente. Continúa con el cociente hasta llegar a 1. El resultado es el producto de todos los divisores usados. Escribe con potencias los factores repetidos.",
        formula: "360 = 2³ × 3² × 5",
        tip: "Empieza siempre probando si el número es divisible por 2, luego por 3, luego por 5, 7, 11…",
      },
    ],
    examples: [
      {
        id: "fac-e1",
        title: "Descomponer 60",
        problem: "Descompón 60 en factores primos",
        steps: [
          "60 ÷ 2 = 30",
          "30 ÷ 2 = 15",
          "15 ÷ 3 = 5",
          "5 ÷ 5 = 1",
          "60 = 2 × 2 × 3 × 5",
        ],
        result: "60 = 2² × 3 × 5",
      },
      {
        id: "fac-e2",
        title: "MCD y MCM con factores primos",
        problem: "Halla MCD y MCM de 36 y 48",
        expression: "36 = 2² × 3²   |   48 = 2⁴ × 3",
        steps: [
          "MCD: factores comunes con MENOR exponente → 2² × 3 = 12",
          "MCM: TODOS los factores con MAYOR exponente → 2⁴ × 3² = 144",
        ],
        result: "MCD = 12, MCM = 144",
      },
    ],
    exercises: [
      {
        id: "fac-ex1",
        question: "¿Cuál es la descomposición en factores primos de 24?",
        options: ["2³ × 3", "2² × 6", "4 × 6", "2 × 12"],
        correctAnswer: "2³ × 3",
        explanation: "24÷2=12÷2=6÷2=3÷3=1. Factores: 2×2×2×3 = 2³×3.",
      },
      {
        id: "fac-ex2",
        question: "¿Cuántos factores primos distintos tiene 30?",
        options: ["3", "2", "4", "6"],
        correctAnswer: "3",
        explanation: "30 = 2 × 3 × 5. Tres factores primos distintos: 2, 3 y 5.",
      },
      {
        id: "fac-ex3",
        question: "¿Cuál es el MCD de 24 y 36?",
        options: ["12", "6", "4", "72"],
        correctAnswer: "12",
        explanation: "24=2³×3, 36=2²×3². MCD: factores comunes mínimos = 2²×3 = 12.",
      },
      {
        id: "fac-ex4",
        question: "¿Es 91 un número primo?",
        options: ["No, 91 = 7 × 13", "Sí, solo lo divide el 1 y él mismo", "No, es par", "Sí, es impar"],
        correctAnswer: "No, 91 = 7 × 13",
        explanation: "91 ÷ 7 = 13. Como tiene divisores distintos de 1 y 91, es compuesto.",
      },
      {
        id: "fac-ex5",
        question: "¿Es 97 un número primo?",
        options: ["Sí, es primo", "No, divisible por 7", "No, divisible por 3", "No, divisible por 11"],
        correctAnswer: "Sí, es primo",
        explanation: "97 no es divisible por 2, 3, 5, 7. Su raíz es ≈9,8. Se prueban primos hasta 9. Es primo.",
      },
      {
        id: "fac-ex6",
        question: "Descompón 84 en factores primos.",
        options: ["2² × 3 × 7", "2³ × 3 × 7", "4 × 21", "2 × 42"],
        correctAnswer: "2² × 3 × 7",
        explanation: "84÷2=42, 42÷2=21, 21÷3=7. Resultado: 2² × 3 × 7.",
      },
      {
        id: "fac-ex7",
        question: "Halla el MCD(48, 60) usando factores primos.",
        options: ["12", "6", "24", "4"],
        correctAnswer: "12",
        explanation: "48=2⁴×3, 60=2²×3×5. MCD=2²×3=12.",
      },
      {
        id: "fac-ex8",
        question: "Un profesor quiere repartir 36 lápices y 48 cuadernos en grupos iguales. ¿Cuál es el mayor número de grupos posible?",
        options: ["12 grupos", "6 grupos", "18 grupos", "4 grupos"],
        correctAnswer: "12 grupos",
        explanation: "MCD(36,48)=12. Con 12 grupos: 3 lápices + 4 cuadernos por grupo.",
      },
    ],
  },
];

// ══════════════════════════════════════════════
// SECCIÓN 2 — INTRODUCCIÓN AL ÁLGEBRA
// ══════════════════════════════════════════════

const ALGEBRA_TOPICS: TopicContent[] = [
  {
    id: "s2-diferencia",
    sectionId: "algebra",
    title: "Álgebra vs Aritmética",
    icon: "🔄",
    color: "#2563eb",
    definition:
      "La aritmética trabaja con números concretos. El álgebra usa letras (variables) para representar cantidades desconocidas o que pueden cambiar, permitiendo formular reglas generales.",
    practiceHint: "Las variables (letras) representan valores desconocidos. Para evaluar una expresión algebraica, sustituye la variable por el número dado y calcula respetando el orden de operaciones.",
    videos: [
      { title: "Introducción al álgebra: variables y expresiones", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=introduccion%20algebra%20variables%20expresiones%20khan%20academy%20espa%C3%B1ol" },
      { title: "¿Qué es el álgebra? Conceptos básicos", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=que%20es%20algebra%20conceptos%20basicos%20unicoos" },
      { title: "Diferencia entre aritmética y álgebra", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=diferencia%20aritmetica%20algebra%20variables%20explicacion" },
    ],
    theory: [
      {
        id: "dif-t1",
        title: "¿Qué cambia en el álgebra?",
        content:
          "En aritmética: 3 + 5 = 8 (respuesta única). En álgebra: x + 5 = 8 (¿qué vale x?). Las letras representan números desconocidos. Una variable puede representar cualquier número, y al darle un valor se obtiene una respuesta concreta.",
        formula: "Aritmética: 3+4=7 · Álgebra: a+b=c",
        tip: "El álgebra generaliza la aritmética: en lugar de UN número, trabaja con CUALQUIER número.",
      },
      {
        id: "dif-t2",
        title: "De palabras a álgebra",
        content:
          "Traducir lenguaje natural a lenguaje algebraico: 'el doble de un número' → 2n. 'Un número aumentado en 5' → n + 5. 'La tercera parte de x' → x/3. 'El cuadrado de la suma de a y b' → (a + b)². Cada frase matemática tiene su equivalente algebraico.",
        formula: "'3 veces un número menos 4' → 3n − 4",
        tip: "Lee despacio la frase y traduce parte por parte. 'De' y 'por' suelen indicar multiplicación.",
      },
    ],
    examples: [
      {
        id: "dif-e1",
        title: "Traducción aritmética → álgebra",
        problem: "Escribe como expresión algebraica: 'el doble de la suma de x y 7'",
        steps: [
          "La suma de x y 7: (x + 7)",
          "El doble de eso: 2 × (x + 7)",
          "Simplificado: 2(x + 7)",
        ],
        result: "2(x + 7)",
      },
      {
        id: "dif-e2",
        title: "Álgebra → lenguaje natural",
        problem: "Describe con palabras: 3a − 5",
        steps: [
          "3a = tres veces el número a",
          "−5 = disminuido en cinco",
        ],
        result: "Tres veces el número a, disminuido en cinco",
      },
    ],
    exercises: [
      {
        id: "dif-ex1",
        question: "¿Cuál es la expresión algebraica de 'cinco menos el triple de x'?",
        options: ["5 − 3x", "3x − 5", "5 + 3x", "5 × 3x"],
        correctAnswer: "5 − 3x",
        explanation: "Cinco menos (−) el triple de x (3x): 5 − 3x.",
      },
      {
        id: "dif-ex2",
        question: "¿Qué frase representa a 2(n + 4)?",
        options: ["El doble de la suma de n y 4", "Dos más n más cuatro", "El cuadrado de n más 4", "Dos veces n más cuatro"],
        correctAnswer: "El doble de la suma de n y 4",
        explanation: "2 × (n + 4): el doble del resultado de sumar n y 4.",
      },
      {
        id: "dif-ex3",
        question: "Si n = 3, ¿cuánto vale 4n − 2?",
        options: ["10", "12", "6", "14"],
        correctAnswer: "10",
        explanation: "4(3) − 2 = 12 − 2 = 10.",
      },
      {
        id: "dif-ex4",
        question: "¿Cuál es la diferencia principal entre aritmética y álgebra?",
        options: ["El álgebra usa variables/letras, la aritmética solo números", "El álgebra es más fácil", "La aritmética usa letras", "No hay diferencia"],
        correctAnswer: "El álgebra usa variables/letras, la aritmética solo números",
        explanation: "El álgebra introduce letras (variables) para representar valores desconocidos o generales.",
      },
      {
        id: "dif-ex5",
        question: "Un rectángulo tiene lados a y 2a. ¿Cuál expresión representa su perímetro?",
        options: ["6a", "2a²", "3a", "4a"],
        correctAnswer: "6a",
        explanation: "Perímetro = 2(a + 2a) = 2(3a) = 6a. El álgebra permite una fórmula general.",
      },
      {
        id: "dif-ex6",
        question: "Juan tiene n libros. María tiene 5 más que Juan. ¿Cuántos libros tienen en total?",
        options: ["2n + 5", "n + 5", "2n − 5", "n × 5"],
        correctAnswer: "2n + 5",
        explanation: "Juan: n. María: n+5. Total: n + (n+5) = 2n + 5.",
      },
      {
        id: "dif-ex7",
        question: "Si x = 4, ¿cuánto vale 3x − 5?",
        options: ["7", "17", "12", "−17"],
        correctAnswer: "7",
        explanation: "Sustituye: 3(4) − 5 = 12 − 5 = 7.",
      },
      {
        id: "dif-ex8",
        question: "¿Qué ventaja tiene escribir el área de un cuadrado como s² en lugar de calcularla para cada medida?",
        options: ["Sirve para cualquier valor de s", "Solo sirve para s = 2", "No tiene ventaja", "Cambia el resultado"],
        correctAnswer: "Sirve para cualquier valor de s",
        explanation: "La expresión algebraica s² es general: sustituyes cualquier valor de s y obtienes el área.",
      },
    ],
  },

  {
    id: "s2-notacion",
    sectionId: "algebra",
    title: "Notación Algebraica",
    icon: "✏️",
    color: "#2563eb",
    definition:
      "La notación algebraica es el conjunto de símbolos y convenciones para escribir expresiones matemáticas con variables. Permite comunicar ideas matemáticas de forma compacta y precisa.",
    practiceHint: "'ab' significa a×b (multiplicación implícita). El exponente afecta solo a la base inmediata. Identifica bien base y exponente antes de calcular.",
    videos: [
      { title: "Notación algebraica: coeficientes y variables", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=notacion%20algebraica%20coeficientes%20variables%20khan%20academy" },
      { title: "Cómo leer y escribir expresiones algebraicas", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=leer%20escribir%20expresiones%20algebraicas%20unicoos" },
      { title: "Simbología algebraica explicada", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=simbologia%20algebraica%20explicacion%20profe%20alex" },
    ],
    theory: [
      {
        id: "not-t1",
        title: "Convenciones de escritura",
        content:
          "1 × a se escribe simplemente a. 2 × a se escribe 2a (el número va primero). a × b se escribe ab. a ÷ b se escribe a/b. El exponente va arriba y a la derecha: a² = a × a. La multiplicación entre letra y número nunca usa el símbolo ×.",
        formula: "3 × x = 3x · a × a = a² · 1 × n = n",
        tip: "Nunca escribas 1n, escribe solo n. Nunca escribas n1 (el coeficiente siempre va primero).",
      },
      {
        id: "not-t2",
        title: "Coeficientes y partes",
        content:
          "En el término 5x²y: el coeficiente es 5 (la parte numérica), las variables son x e y, los exponentes son 2 (de x) y 1 (de y, implícito). El signo del término forma parte del coeficiente: en −3ab, el coeficiente es −3.",
        formula: "−3ab: coef.=−3, variables=a y b",
        tip: "El signo siempre 'viaja' con el coeficiente del término.",
      },
    ],
    examples: [
      {
        id: "not-e1",
        title: "Identificar partes de un término",
        problem: "Analiza el término: −4x³y²",
        steps: [
          "Coeficiente: −4 (parte numérica con su signo)",
          "Variables: x e y",
          "Exponente de x: 3",
          "Exponente de y: 2",
        ],
        result: "Coef. = −4, variables = x³ y y²",
      },
      {
        id: "not-e2",
        title: "Escribir en notación algebraica",
        problem: "Escribe: el producto de 3, a y el cuadrado de b",
        steps: [
          "Producto de 3 y a: 3a",
          "Cuadrado de b: b²",
          "Todo junto: 3ab²",
        ],
        result: "3ab²",
      },
    ],
    exercises: [
      {
        id: "not-ex1",
        question: "En el término −7x²y, ¿qué número multiplica a las variables x²y?",
        options: ["−7", "7", "x²y", "2"],
        correctAnswer: "−7",
        explanation: "Separamos el término como −7 · x² · y. El número que multiplica a las variables es −7; el signo también pertenece al coeficiente.",
      },
      {
        id: "not-ex2",
        question: "¿Cómo se escribe correctamente 'n por n'?",
        options: ["n²", "2n", "nn", "n × n"],
        correctAnswer: "n²",
        explanation: "n × n = n² (n al cuadrado).",
      },
      {
        id: "not-ex3",
        question: "¿Cuántas variables tiene el término 5x²yz³?",
        options: ["3", "2", "5", "1"],
        correctAnswer: "3",
        explanation: "Las variables son x, y, z. Tres variables distintas.",
      },
      {
        id: "not-ex4",
        question: "¿Cómo se escribe 1 × m²n?",
        options: ["m²n", "1m²n", "m² + n", "mn²"],
        correctAnswer: "m²n",
        explanation: "El coeficiente 1 no se escribe (convención algebraica).",
      },
      {
        id: "not-ex5",
        question: "¿Qué significa la expresión 4ab?",
        options: ["4 veces a veces b", "4 más a más b", "a elevado a b dividido 4", "4 dividido entre ab"],
        correctAnswer: "4 veces a veces b",
        explanation: "En notación algebraica, letras juntas implican multiplicación: 4ab = 4 × a × b.",
      },
      {
        id: "not-ex6",
        question: "¿Cómo se escribe en álgebra: 'el doble de la suma de un número y 3'?",
        options: ["2(n + 3)", "2n + 3", "2n × 3", "(2 + n) × 3"],
        correctAnswer: "2(n + 3)",
        explanation: "Suma de n y 3: (n+3). El doble de eso: 2(n+3).",
      },
      {
        id: "not-ex7",
        question: "En la expresión −7x²y, ¿cuál es el coeficiente?",
        options: ["−7", "7", "x²y", "−7x²"],
        correctAnswer: "−7",
        explanation: "El coeficiente es la parte numérica del término: −7.",
      },
      {
        id: "not-ex8",
        question: "¿Cómo se expresa el costo total de n artículos a $8 cada uno?",
        options: ["8n", "n + 8", "n ÷ 8", "8 − n"],
        correctAnswer: "8n",
        explanation: "Costo total = precio × cantidad = 8 × n = 8n.",
      },
    ],
  },

  {
    id: "s2-signos",
    sectionId: "algebra",
    title: "Signos en el Álgebra",
    icon: "±",
    color: "#2563eb",
    definition:
      "Los signos + y − en álgebra funcionan como en aritmética, pero con variables. Determinan si un término es positivo o negativo y cambian al quitar o agregar paréntesis según las reglas de agrupación.",
    practiceHint: "Regla clave: (−)(−)=+, (+)(−)=−. Para sumas con distintos signos, resta los valores absolutos y conserva el signo del mayor.",
    videos: [
      { title: "Regla de los signos en álgebra", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=regla%20signos%20algebra%20khan%20academy%20espa%C3%B1ol" },
      { title: "Suma y resta con signos – ejercicios", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=suma%20resta%20signos%20algebra%20unicoos" },
      { title: "Signos en álgebra: positivo y negativo", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=signos%20algebra%20positivo%20negativo%20profe%20alex" },
    ],
    theory: [
      {
        id: "sig-t1",
        title: "Signos de los términos",
        content:
          "En 3x − 5y + 2: el término 3x es positivo (+3x), −5y es negativo, +2 es positivo. Al cambiar el signo de un factor, el producto cambia de signo. Al mover términos entre miembros de una ecuación, su signo cambia.",
        formula: "a − b = a + (−b)",
        tip: "Un término sin signo visible tiene signo + implícito.",
      },
      {
        id: "sig-t2",
        title: "Eliminación de paréntesis",
        content:
          "Si hay un + antes del paréntesis, se elimina sin cambiar signos: +(a − b) = a − b. Si hay un − antes, se eliminan y TODOS los signos internos se invierten: −(a − b) = −a + b. Este es uno de los errores más comunes en álgebra.",
        formula: "−(3x − 2) = −3x + 2",
        tip: "El '−' fuera del paréntesis es como multiplicar todo lo de adentro por −1.",
      },
    ],
    examples: [
      {
        id: "sig-e1",
        title: "Eliminar paréntesis con −",
        problem: "Simplifica: 5x − (3x − 4y + 2)",
        steps: [
          "El '−' invierte todos los signos dentro: −(3x − 4y + 2) = −3x + 4y − 2",
          "5x − 3x + 4y − 2",
          "Combina términos semejantes: 2x + 4y − 2",
        ],
        result: "2x + 4y − 2",
      },
      {
        id: "sig-e2",
        title: "Cambio de signos al transponer",
        problem: "En la ecuación x + 5 = 12, despeja x",
        steps: [
          "Pasa el +5 al otro miembro cambiando su signo",
          "x = 12 − 5",
          "x = 7",
        ],
        result: "x = 7",
      },
    ],
    exercises: [
      {
        id: "sig-ex1",
        question: "¿Cuánto es −(−x + 3)?",
        options: ["x − 3", "−x − 3", "x + 3", "−x + 3"],
        correctAnswer: "x − 3",
        explanation: "El − invierte todos los signos: −(−x + 3) = x − 3.",
      },
      {
        id: "sig-ex2",
        question: "Simplifica: 4a − (2a + 1)",
        options: ["2a − 1", "2a + 1", "6a − 1", "−2a − 1"],
        correctAnswer: "2a − 1",
        explanation: "−(2a + 1) = −2a − 1. Luego 4a − 2a − 1 = 2a − 1.",
      },
      {
        id: "sig-ex3",
        question: "¿Qué signo tiene el término sin símbolo visible en x² + 3x − 5?",
        options: ["El x² es positivo", "El x² es negativo", "x² no tiene signo", "Depende del valor de x"],
        correctAnswer: "El x² es positivo",
        explanation: "Un término sin signo visible tiene signo + implícito: +x².",
      },
      {
        id: "sig-ex4",
        question: "Simplifica: 3 − (x − 2)",
        options: ["5 − x", "1 − x", "3 − x − 2", "x + 1"],
        correctAnswer: "5 − x",
        explanation: "−(x − 2) = −x + 2. Luego 3 + (−x + 2) = 5 − x.",
      },
      {
        id: "sig-ex5",
        question: "Expande: −(x − 3)",
        options: ["−x + 3", "−x − 3", "x − 3", "x + 3"],
        correctAnswer: "−x + 3",
        explanation: "El signo menos distribuye: −1·x + (−1)·(−3) = −x + 3.",
      },
      {
        id: "sig-ex6",
        question: "Simplifica: a − (−b + c)",
        options: ["a + b − c", "a − b + c", "a − b − c", "a + b + c"],
        correctAnswer: "a + b − c",
        explanation: "Al quitar paréntesis con − adelante, se cambia signo: −(−b) = +b, −(+c) = −c.",
      },
      {
        id: "sig-ex7",
        question: "¿Qué signo tiene el producto (−a)(−b)(−c)?",
        options: ["Negativo", "Positivo", "Cero", "Depende de los valores"],
        correctAnswer: "Negativo",
        explanation: "Tres factores negativos: (−)(−)(−). Primero dos negativos = positivo, luego positivo × negativo = negativo.",
      },
      {
        id: "sig-ex8",
        question: "Simplifica: −3(x − 2)",
        options: ["−3x + 6", "−3x − 6", "3x − 6", "3x + 6"],
        correctAnswer: "−3x + 6",
        explanation: "Distributiva: −3·x = −3x, −3·(−2) = +6. Resultado: −3x + 6.",
      },
    ],
  },

  {
    id: "s2-expresion",
    sectionId: "algebra",
    title: "Expresión y Término Algebraico",
    icon: "📐",
    color: "#2563eb",
    definition:
      "Un término algebraico es el producto de un coeficiente y una o más variables con exponentes. Una expresión algebraica es la suma o diferencia de uno o más términos.",
    practiceHint: "Para evaluar una expresión, sustituye cada variable por su valor. Respeta el orden: primero potencias, luego ×÷, luego +−. Identifica coeficiente, variable y exponente en cada término.",
    videos: [
      { title: "Expresiones algebraicas: evaluación y simplificación", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=expresiones%20algebraicas%20evaluacion%20simplificacion%20khan%20academy" },
      { title: "Cómo evaluar una expresión algebraica", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=evaluar%20expresion%20algebraica%20unicoos" },
      { title: "Expresiones algebraicas – ejercicios paso a paso", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=expresiones%20algebraicas%20ejercicios%20paso%20a%20paso%20profe%20alex" },
    ],
    theory: [
      {
        id: "expr-t1",
        title: "El término algebraico",
        content:
          "Un término es una cantidad que no tiene suma ni resta sin paréntesis. Ejemplos de términos: 5x, −3ab², 7, x²y³. El coeficiente es la parte numérica y la parte literal es el producto de las variables. Términos separados por + o − son distintos términos.",
        formula: "5x²y → coef: 5 · parte literal: x²y",
        tip: "Para contar términos, cuenta los signos + y − que están fuera de paréntesis y suma 1.",
      },
      {
        id: "expr-t2",
        title: "La expresión algebraica",
        content:
          "Una expresión algebraica combina términos con operaciones. Ejemplos: 3x + 2 (dos términos), 4a − b + 5c (tres términos). Se evalúa reemplazando las variables por valores numéricos.",
        formula: "Si x=2: 3x² − x + 1 = 3(4) − 2 + 1 = 11",
        tip: "Al evaluar, sustituye CADA ocurrencia de la variable por el valor dado, con su paréntesis si es negativo.",
      },
    ],
    examples: [
      {
        id: "expr-e1",
        title: "Identificar términos",
        problem: "¿Cuántos términos tiene: 4x² − 3xy + y − 5?",
        steps: [
          "Término 1: +4x²",
          "Término 2: −3xy",
          "Término 3: +y",
          "Término 4: −5",
        ],
        result: "4 términos",
      },
      {
        id: "expr-e2",
        title: "Evaluar una expresión",
        problem: "Si a = 2 y b = −1, evalúa: a² + 3b − 4",
        steps: [
          "Sustituye: (2)² + 3(−1) − 4",
          "Potencia: 4 + 3(−1) − 4",
          "Multiplicación: 4 − 3 − 4",
          "Resta: −3",
        ],
        result: "−3",
      },
    ],
    exercises: [
      {
        id: "expr-ex1",
        question: "¿Cuántos términos tiene 2x³ − 5x + 7?",
        options: ["3", "2", "1", "5"],
        correctAnswer: "3",
        explanation: "Los términos son: 2x³, −5x, y 7. Total: 3 términos.",
      },
      {
        id: "expr-ex2",
        question: "Si x = 3, ¿cuánto vale 2x² − x + 4?",
        options: ["19", "21", "13", "7"],
        correctAnswer: "19",
        explanation: "2(9) − 3 + 4 = 18 − 3 + 4 = 19.",
      },
      {
        id: "expr-ex3",
        question: "¿Cuál de estas opciones es una expresión algebraica, pero no un término individual?",
        options: ["x + 3", "5xy", "−2a²", "7"],
        correctAnswer: "x + 3",
        explanation: "x + 3 es una expresión algebraica formada por dos términos: x y 3. Las otras opciones (5xy, −2a² y 7) son términos individuales.",
      },
      {
        id: "expr-ex4",
        question: "Si n = −2, ¿cuánto vale n² + n?",
        options: ["2", "−6", "6", "−2"],
        correctAnswer: "2",
        explanation: "(−2)² + (−2) = 4 − 2 = 2.",
      },
      {
        id: "expr-ex5",
        question: "¿Cuántos términos tiene la expresión 5x² − 3xy + 2?",
        options: ["3", "2", "4", "1"],
        correctAnswer: "3",
        explanation: "Los términos se separan por + o −: 5x², −3xy y 2. Son 3 términos.",
      },
      {
        id: "expr-ex6",
        question: "En 4x² − 7y + 3z, ¿cuál es el coeficiente de y?",
        options: ["−7", "7", "4", "3"],
        correctAnswer: "−7",
        explanation: "El término con y es −7y. Su coeficiente es −7 (incluye el signo).",
      },
      {
        id: "expr-ex7",
        question: "¿Cuál es el término independiente (constante) de 2a³ − 5a + 9?",
        options: ["9", "−5", "2", "0"],
        correctAnswer: "9",
        explanation: "El término independiente no tiene variable. Aquí es 9.",
      },
      {
        id: "expr-ex8",
        question: "Si x = 2 e y = −1, ¿cuánto vale 3x² − 2y + 1?",
        options: ["15", "11", "13", "9"],
        correctAnswer: "15",
        explanation: "3(2²) − 2(−1) + 1 = 3(4) + 2 + 1 = 12 + 2 + 1 = 15.",
      },
    ],
  },

  {
    id: "s2-grado",
    sectionId: "algebra",
    title: "Grado de un Término",
    icon: "🎓",
    color: "#2563eb",
    definition:
      "El grado de un término es la suma de los exponentes de todas sus variables. El grado de una expresión algebraica (polinomio) es el mayor grado entre sus términos.",
    practiceHint: "Grado de un monomio = suma de todos los exponentes de sus variables. Grado de un polinomio = grado del término con mayor exponente.",
    videos: [
      { title: "Grado de un monomio y un polinomio", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=grado%20monomio%20polinomio%20khan%20academy%20espa%C3%B1ol" },
      { title: "Monomios: definición y grado", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=monomios%20definicion%20grado%20unicoos" },
      { title: "¿Qué es el grado de un polinomio?", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=grado%20polinomio%20explicacion%20profe%20alex" },
    ],
    theory: [
      {
        id: "grad-t1",
        title: "Grado de un término",
        content:
          "Para un término con una sola variable: el grado es el exponente de esa variable. Para un término con varias variables: se suman todos los exponentes. Una constante (número sin variables) tiene grado 0. Ejemplos: 5x³ → grado 3; 4x²y → grado 3 (2+1); 7 → grado 0.",
        formula: "grado(4x²y³) = 2 + 3 = 5",
        tip: "Si la variable no tiene exponente visible, su exponente es 1.",
      },
      {
        id: "grad-t2",
        title: "Grado de un polinomio",
        content:
          "El grado de un polinomio es el mayor grado de sus términos. En 3x⁴ − 2x² + x − 5: los grados son 4, 2, 1, 0. El mayor es 4, entonces el polinomio es de grado 4.",
        formula: "3x⁴ − 2x² + x − 5 → grado 4",
        tip: "Siempre busca el término con el mayor exponente para determinar el grado del polinomio.",
      },
    ],
    examples: [
      {
        id: "grad-e1",
        title: "Grado de términos",
        problem: "Halla el grado de: a) 6x²y³z, b) −5a, c) 8",
        steps: [
          "a) 6x²y³z: grados 2 + 3 + 1 = 6",
          "b) −5a: grado 1 (exponente implícito de a)",
          "c) 8: grado 0 (constante, sin variables)",
        ],
        result: "a) 6, b) 1, c) 0",
      },
      {
        id: "grad-e2",
        title: "Grado de un polinomio",
        problem: "¿Cuál es el grado de 7x⁵ − 3x³y + 2y² − 4?",
        steps: [
          "7x⁵ → grado 5",
          "−3x³y → grado 4 (3+1)",
          "2y² → grado 2",
          "−4 → grado 0",
          "El mayor es 5",
        ],
        result: "Polinomio de grado 5",
      },
    ],
    exercises: [
      {
        id: "grad-ex1",
        question: "¿Cuál es el grado del término 3x²y⁴?",
        options: ["6", "8", "4", "2"],
        correctAnswer: "6",
        explanation: "2 + 4 = 6.",
      },
      {
        id: "grad-ex2",
        question: "¿Cuál es el grado de 5x³ − 2x + 8?",
        options: ["3", "1", "8", "0"],
        correctAnswer: "3",
        explanation: "El término de mayor grado es 5x³ (grado 3).",
      },
      {
        id: "grad-ex3",
        question: "¿Cuál es el grado de la constante 9?",
        options: ["0", "1", "9", "indefinido"],
        correctAnswer: "0",
        explanation: "Las constantes son términos de grado 0.",
      },
      {
        id: "grad-ex4",
        question: "¿Cuál es el grado de −4ab²c?",
        options: ["4", "3", "1", "2"],
        correctAnswer: "4",
        explanation: "a¹b²c¹: 1 + 2 + 1 = 4.",
      },
      {
        id: "grad-ex5",
        question: "¿Cuál es el grado del término 4x³y²?",
        options: ["5", "3", "2", "6"],
        correctAnswer: "5",
        explanation: "El grado de un término es la suma de exponentes de sus variables: 3 + 2 = 5.",
      },
      {
        id: "grad-ex6",
        question: "¿Cuál es el grado del término constante 7?",
        options: ["0", "1", "7", "Indefinido"],
        correctAnswer: "0",
        explanation: "Un número constante tiene grado 0. Se puede escribir como 7·x⁰ = 7.",
      },
      {
        id: "grad-ex7",
        question: "¿Cuál es el grado del polinomio 3x⁴ − 2x² + x − 5?",
        options: ["4", "2", "7", "1"],
        correctAnswer: "4",
        explanation: "El grado del polinomio es el mayor exponente de sus términos: 3x⁴ tiene grado 4.",
      },
      {
        id: "grad-ex8",
        question: "¿Cuál de estos términos tiene grado 3?",
        options: ["2x³", "5x²y", "4xy", "x⁴"],
        correctAnswer: "2x³",
        explanation: "2x³ tiene exponente 3. 5x²y tiene grado 3 también, pero 4xy tiene grado 2 y x⁴ tiene grado 4.",
      },
    ],
  },

  {
    id: "s2-clasificacion",
    sectionId: "algebra",
    title: "Clasificación de Expresiones",
    icon: "🏷️",
    color: "#2563eb",
    definition:
      "Las expresiones algebraicas se clasifican según el número de términos: monomio (1), binomio (2), trinomio (3) y polinomio (4 o más). También se clasifican según su grado.",
    practiceHint: "Cuenta los términos separados por + o −: 1 = monomio, 2 = binomio, 3 = trinomio. Grado = mayor exponente presente.",
    videos: [
      { title: "Clasificación de polinomios por términos y grado", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=clasificacion%20polinomios%20terminos%20grado%20khan%20academy" },
      { title: "Monomio, binomio, trinomio y polinomio", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=monomio%20binomio%20trinomio%20polinomio%20unicoos" },
      { title: "Tipos de polinomios – explicación completa", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=tipos%20polinomios%20explicacion%20completa%20profe%20alex" },
    ],
    theory: [
      {
        id: "clas-t1",
        title: "Clasificación por número de términos",
        content:
          "Monomio: un solo término (5x, −3a²b). Binomio: exactamente dos términos (x + 3, 2a − b). Trinomio: exactamente tres términos (x² + 2x + 1). Polinomio: cuatro o más términos. Los binomios y trinomios son polinomios especiales.",
        formula: "5x²y → monomio · x+1 → binomio",
        tip: "Cuenta los términos (separados por + o − fuera de paréntesis) para clasificar.",
      },
      {
        id: "clas-t2",
        title: "Clasificación por grado",
        content:
          "Grado 1: lineal (3x + 2). Grado 2: cuadrático (x² − 5). Grado 3: cúbico (2x³ + x). Grado 4: cuártico. Un polinomio completo tiene todos los términos hasta su grado; uno incompleto tiene algunos términos faltantes.",
        formula: "x³ − x + 1 → cúbico incompleto",
        tip: "Un polinomio cuadrático completo tiene tres términos: ax² + bx + c.",
      },
    ],
    examples: [
      {
        id: "clas-e1",
        title: "Clasificar expresiones",
        problem: "Clasifica: a) 4x², b) 3x − 7, c) x² + 2x + 1, d) 2a³ − a² + 3a − 5",
        steps: [
          "a) 4x²: 1 término → monomio (grado 2)",
          "b) 3x − 7: 2 términos → binomio (grado 1, lineal)",
          "c) x² + 2x + 1: 3 términos → trinomio (grado 2, cuadrático)",
          "d) 2a³ − a² + 3a − 5: 4 términos → polinomio (grado 3, cúbico)",
        ],
        result: "Monomio, binomio, trinomio, polinomio",
      },
      {
        id: "clas-e2",
        title: "Polinomio completo vs incompleto",
        problem: "¿Es x³ + 2x − 1 completo o incompleto?",
        steps: [
          "Es de grado 3, debería tener: x³, x², x, cte",
          "Faltan: x² (coeficiente 0)",
          "Es incompleto",
        ],
        result: "Incompleto (falta el término x²)",
      },
    ],
    exercises: [
      {
        id: "clas-ex1",
        question: "¿Cómo se clasifica 5x³y²?",
        options: ["Monomio", "Binomio", "Trinomio", "Polinomio"],
        correctAnswer: "Monomio",
        explanation: "5x³y² es un solo término, por tanto monomio.",
      },
      {
        id: "clas-ex2",
        question: "Un polinomio de grado 2 se llama:",
        options: ["Cuadrático", "Lineal", "Cúbico", "Monomio"],
        correctAnswer: "Cuadrático",
        explanation: "Grado 2 → cuadrático (o de segundo grado).",
      },
      {
        id: "clas-ex3",
        question: "¿Cuántos términos tiene un trinomio?",
        options: ["3", "2", "4", "1"],
        correctAnswer: "3",
        explanation: "Tri = tres. Un trinomio tiene exactamente 3 términos.",
      },
      {
        id: "clas-ex4",
        question: "¿x² + 5 es un polinomio completo de grado 2?",
        options: ["No, falta el término de grado 1", "Sí, tiene x² y constante", "No, necesita más términos", "Sí, cualquier polinomio de grado 2 es completo"],
        correctAnswer: "No, falta el término de grado 1",
        explanation: "Un cuadrático completo es ax² + bx + c. Falta bx.",
      },
      {
        id: "clas-ex5",
        question: "3x² − 2x + 7 es un…",
        options: ["Trinomio", "Binomio", "Monómio", "Polinomio de 4 términos"],
        correctAnswer: "Trinomio",
        explanation: "Tiene exactamente 3 términos: 3x², −2x y 7. Por eso es un trinomio.",
      },
      {
        id: "clas-ex6",
        question: "¿Cuántos términos tiene un binomio?",
        options: ["2", "1", "3", "4"],
        correctAnswer: "2",
        explanation: "Binomio = 2 términos (bi = dos). Ejemplo: a + b.",
      },
      {
        id: "clas-ex7",
        question: "¿Cuál de estas expresiones es un monómio?",
        options: ["3xy", "x + y", "x − 1", "a² + b + c"],
        correctAnswer: "3xy",
        explanation: "3xy es un solo término (sin suma ni resta). Los demás son polinomios con múltiples términos.",
      },
      {
        id: "clas-ex8",
        question: "¿Cómo se clasifica el polinomio 5x⁴ − 2x² + 3x − 8 según su número de términos?",
        options: ["Polinomio de 4 términos", "Trinomio", "Binomio", "Monómio"],
        correctAnswer: "Polinomio de 4 términos",
        explanation: "Tiene 4 términos: 5x⁴, −2x², 3x y −8. Se llama polinomio de cuatro términos.",
      },
    ],
  },

  {
    id: "s2-orden",
    sectionId: "algebra",
    title: "Ordenar un Polinomio",
    icon: "📋",
    color: "#2563eb",
    definition:
      "Ordenar un polinomio significa escribir sus términos de mayor a menor grado (orden descendente) o de menor a mayor (orden ascendente). La forma descendente es la estándar en matemáticas.",
    practiceHint: "Para ordenar un polinomio escribe los términos de mayor a menor grado de su variable. El término independiente (sin variable) va al final.",
    videos: [
      { title: "Ordenar y completar polinomios", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=ordenar%20completar%20polinomios%20khan%20academy%20espa%C3%B1ol" },
      { title: "Polinomio ordenado y completo", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=polinomio%20ordenado%20completo%20unicoos" },
      { title: "Cómo ordenar un polinomio correctamente", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=ordenar%20polinomio%20correctamente%20profe%20alex" },
    ],
    theory: [
      {
        id: "ord-t1",
        title: "Orden descendente (estándar)",
        content:
          "El orden descendente coloca primero el término de mayor grado y así sucesivamente hasta la constante. Ejemplo: −2 + 5x³ + x − 4x² se ordena como 5x³ − 4x² + x − 2. Es la forma más usada porque facilita las operaciones y la identificación del grado.",
        formula: "5x³ − 4x² + x − 2 (descendente)",
        tip: "Siempre organiza tus polinomios en forma descendente antes de operar con ellos.",
      },
      {
        id: "ord-t2",
        title: "Polinomios en varias variables",
        content:
          "Si el polinomio tiene más de una variable, se elige una variable 'principal' y se ordena por el exponente de esa variable. En x³ − 2x²y + xy² − y³: todos los términos son de grado 3, ordenados por el exponente de x de mayor a menor.",
        formula: "x³ − 2x²y + xy² − y³",
        tip: "Al ordenar por x: de x³ (sin y) hasta el término sin x (solo y).",
      },
    ],
    examples: [
      {
        id: "ord-e1",
        title: "Ordenar descendentemente",
        problem: "Ordena: 3 − 4x + x³ + 2x²",
        steps: [
          "Identifica los grados: x³(3), 2x²(2), −4x(1), 3(0)",
          "Ordena de mayor a menor: x³, 2x², −4x, 3",
          "Escribe: x³ + 2x² − 4x + 3",
        ],
        result: "x³ + 2x² − 4x + 3",
      },
      {
        id: "ord-e2",
        title: "Comparar formas ascendente y descendente",
        problem: "Escribe 2x⁴ − x² + 3 en orden ascendente",
        steps: [
          "Orden descendente: 2x⁴ − x² + 3 (actual)",
          "Orden ascendente: 3 − x² + 2x⁴",
        ],
        result: "Ascendente: 3 − x² + 2x⁴",
      },
    ],
    exercises: [
      {
        id: "ord-ex1",
        question: "¿Cuál es el orden correcto descendente de 5 − 3x² + x?",
        options: ["−3x² + x + 5", "5 + x − 3x²", "x + 5 − 3x²", "−3x² + 5 + x"],
        correctAnswer: "−3x² + x + 5",
        explanation: "Grados: x²(2), x(1), 5(0). Descendente: −3x² + x + 5.",
      },
      {
        id: "ord-ex2",
        question: "¿Cuál es el término de mayor grado en 7 − 2x + x⁴ − 3x²?",
        options: ["x⁴", "−3x²", "7", "−2x"],
        correctAnswer: "x⁴",
        explanation: "x⁴ tiene grado 4, el mayor de todos.",
      },
      {
        id: "ord-ex3",
        question: "Ordena descendentemente: 6x + x³ − 2",
        options: ["x³ + 6x − 2", "6x + x³ − 2", "−2 + 6x + x³", "6x − 2 + x³"],
        correctAnswer: "x³ + 6x − 2",
        explanation: "Grados: x³(3), 6x(1), −2(0). Descendente: x³ + 6x − 2.",
      },
      {
        id: "ord-ex4",
        question: "¿Cuál de estos polinomios ya está en orden descendente?",
        options: ["x³ − 2x² + x − 5", "x − 2x² + x³ − 5", "−5 + x − 2x² + x³", "x² − x³ + 5"],
        correctAnswer: "x³ − 2x² + x − 5",
        explanation: "x³(g3) − 2x²(g2) + x(g1) − 5(g0): grados decrecentos, correcto.",
      },
      {
        id: "ord-ex5",
        question: "Ordena descendentemente: 3x + x³ − 2 + 5x²",
        options: ["x³ + 5x² + 3x − 2", "−2 + 3x + 5x² + x³", "5x² + x³ + 3x − 2", "3x + 5x² − 2 + x³"],
        correctAnswer: "x³ + 5x² + 3x − 2",
        explanation: "Ordenar descendente = mayor grado primero: x³ (grado 3), 5x² (grado 2), 3x (grado 1), −2 (grado 0).",
      },
      {
        id: "ord-ex6",
        question: "¿Cuál es el primer término de 2 − x + 4x³ − x² ordenado descendentemente?",
        options: ["4x³", "2", "−x²", "−x"],
        correctAnswer: "4x³",
        explanation: "Ordenado: 4x³ − x² − x + 2. El primer término es 4x³ (grado 3, el mayor).",
      },
      {
        id: "ord-ex7",
        question: "¿Cuál es el coeficiente principal de x³ − 5x² + 2x − 1?",
        options: ["1", "−5", "2", "−1"],
        correctAnswer: "1",
        explanation: "El coeficiente principal es el del término de mayor grado: x³ = 1·x³, coeficiente = 1.",
      },
      {
        id: "ord-ex8",
        question: "¿Cuántos términos tiene 5x² + 0·x³ + 3 − 2x al ordenar y simplificar?",
        options: ["3", "4", "2", "1"],
        correctAnswer: "3",
        explanation: "0·x³ = 0, se elimina. Quedan: 5x², −2x, y 3. Son 3 términos.",
      },
    ],
  },

  {
    id: "s2-semejantes",
    sectionId: "algebra",
    title: "Términos Semejantes y Valor Numérico",
    icon: "🔗",
    color: "#2563eb",
    definition:
      "Los términos semejantes tienen exactamente la misma parte literal (mismas variables con los mismos exponentes). Solo los términos semejantes se pueden sumar o restar combinando sus coeficientes.",
    practiceHint: "Términos semejantes: misma parte literal (mismas variables con mismos exponentes). Solo puedes sumar o restar sus coeficientes si son semejantes.",
    videos: [
      { title: "Términos semejantes: identificar y simplificar", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=terminos%20semejantes%20identificar%20simplificar%20khan%20academy%20espa%C3%B1ol" },
      { title: "Suma de términos semejantes", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=suma%20terminos%20semejantes%20unicoos" },
      { title: "Términos semejantes – ejercicios resueltos", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=terminos%20semejantes%20ejercicios%20resueltos%20profe%20alex" },
    ],
    theory: [
      {
        id: "sem-t1",
        title: "Identificar términos semejantes",
        content:
          "Son semejantes: 3x y −7x (misma variable, mismo exponente). 4x²y y 2x²y (mismas variables y exponentes). NO son semejantes: 3x y 3x² (diferente exponente), 2xy y 2x²y (diferente exponente de x). Los números sin variables son todos semejantes entre sí.",
        formula: "3x + 5x = 8x · 4x² − x² = 3x²",
        tip: "Para verificar si son semejantes, compara SOLO la parte literal (las letras y sus exponentes).",
      },
      {
        id: "sem-t2",
        title: "Valor numérico",
        content:
          "El valor numérico de una expresión es el número que resulta de sustituir las variables por valores dados. Siempre aplica el orden de operaciones: primero potencias, luego multiplicación, finalmente suma y resta.",
        formula: "Para x=2: 3x² − 2x + 1 = 3(4) − 4 + 1 = 9",
        tip: "Pon paréntesis alrededor del valor que sustituyes, especialmente si es negativo.",
      },
    ],
    examples: [
      {
        id: "sem-e1",
        title: "Reducir términos semejantes",
        problem: "Simplifica: 5x² − 3x + 4x² + 7x − 2",
        steps: [
          "Agrupa semejantes: (5x² + 4x²) + (−3x + 7x) − 2",
          "Suma coeficientes: 9x² + 4x − 2",
        ],
        result: "9x² + 4x − 2",
      },
      {
        id: "sem-e2",
        title: "Valor numérico",
        problem: "Si x = −3, halla el valor de x³ + 2x² − x + 4",
        steps: [
          "x³ = (−3)³ = −27",
          "2x² = 2(−3)² = 2(9) = 18",
          "−x = −(−3) = 3",
          "Suma: −27 + 18 + 3 + 4 = −2",
        ],
        result: "−2",
      },
    ],
    exercises: [
      {
        id: "sem-ex1",
        question: "¿Cuáles son términos semejantes en 3x² − 2x + 5x² − x?",
        options: ["3x² y 5x², también −2x y −x", "3x² y −2x", "5x² y −x", "Ninguno es semejante"],
        correctAnswer: "3x² y 5x², también −2x y −x",
        explanation: "3x² y 5x² comparten x². −2x y −x comparten x¹.",
      },
      {
        id: "sem-ex2",
        question: "Simplifica: 4ab − 3ab + 2ab",
        options: ["3ab", "9ab", "−ab", "ab"],
        correctAnswer: "3ab",
        explanation: "(4 − 3 + 2)ab = 3ab.",
      },
      {
        id: "sem-ex3",
        question: "Si a = 2 y b = −1, ¿cuánto vale a² − 2ab + b²?",
        options: ["9", "1", "7", "−1"],
        correctAnswer: "9",
        explanation: "4 − 2(2)(−1) + 1 = 4 + 4 + 1 = 9.",
      },
      {
        id: "sem-ex4",
        question: "¿Cuáles NO son semejantes?",
        options: ["3x²y y 5xy²", "2ab y −7ab", "x³ y 4x³", "−c y 3c"],
        correctAnswer: "3x²y y 5xy²",
        explanation: "3x²y tiene x²y y el otro tiene xy². Distinta parte literal → no semejantes.",
      },
      {
        id: "sem-ex5",
        question: "¿Son 3x²y y 5x²y términos semejantes?",
        options: ["Sí, misma parte literal", "No, distintos coeficientes", "No, distinto grado", "Solo si x=y"],
        correctAnswer: "Sí, misma parte literal",
        explanation: "Términos semejantes tienen la misma parte literal (x²y). Los coeficientes pueden diferir.",
      },
      {
        id: "sem-ex6",
        question: "Simplifica: 7a − 3b + 2a − 5b",
        options: ["9a − 8b", "5a − 2b", "9a + 8b", "5a + 2b"],
        correctAnswer: "9a − 8b",
        explanation: "(7a+2a)+(−3b−5b) = 9a − 8b.",
      },
      {
        id: "sem-ex7",
        question: "Si x = 3 e y = 1, ¿cuánto vale 4x − 2y?",
        options: ["10", "14", "8", "12"],
        correctAnswer: "10",
        explanation: "4(3) − 2(1) = 12 − 2 = 10.",
      },
      {
        id: "sem-ex8",
        question: "Simplifica: 5mn − 3mn + mn",
        options: ["3mn", "9mn", "mn", "−3mn"],
        correctAnswer: "3mn",
        explanation: "(5−3+1)mn = 3mn.",
      },
    ],
  },
];

// ══════════════════════════════════════════════
// SECCIÓN 3 — OPERACIONES ALGEBRAICAS
// ══════════════════════════════════════════════

const OPERACIONES_TOPICS: TopicContent[] = [
  {
    id: "s3-suma-resta",
    sectionId: "operaciones",
    title: "Suma y Resta de Polinomios",
    icon: "➕",
    color: "#059669",
    definition:
      "Sumar o restar polinomios consiste en combinar los términos semejantes de ambos polinomios. Al restar, se cambian todos los signos del polinomio sustraendo antes de combinar.",
    practiceHint: "Agrupa términos semejantes. Al restar un polinomio, distribuye el signo negativo a TODOS sus términos antes de combinar.",
    videos: [
      { title: "Suma y resta de polinomios", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=suma%20resta%20polinomios%20khan%20academy%20espa%C3%B1ol" },
      { title: "Operaciones con polinomios: suma y resta", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=operaciones%20polinomios%20suma%20resta%20unicoos" },
      { title: "Sumar y restar polinomios paso a paso", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=sumar%20restar%20polinomios%20paso%20a%20paso%20profe%20alex" },
    ],
    theory: [
      {
        id: "sr-t1",
        title: "Suma de polinomios",
        content:
          "Para sumar: elimina los paréntesis (un + antes del paréntesis no cambia los signos) y combina términos semejantes. Es conveniente ordenar los términos por grado antes de operar. La suma de polinomios es commutativa y asociativa.",
        formula: "(3x² + 2x) + (x² − 4x + 1) = 4x² − 2x + 1",
        tip: "Alinea los términos semejantes en columnas para evitar errores al sumar.",
      },
      {
        id: "sr-t2",
        title: "Resta de polinomios",
        content:
          "Para restar: cambia el signo a TODOS los términos del segundo polinomio (equivale a multiplicar por −1) y luego suma. El error más frecuente es cambiar el signo solo del primer término.",
        formula: "(5x − 2) − (2x + 3) = 5x − 2 − 2x − 3 = 3x − 5",
        tip: "Escribe el − como ×(−1) distribuido entre todos los términos del segundo polinomio.",
      },
    ],
    examples: [
      {
        id: "sr-e1",
        title: "Suma de polinomios",
        problem: "Suma: (4x³ − 2x + 5) + (−x³ + 3x² + x − 2)",
        steps: [
          "Elimina paréntesis: 4x³ − 2x + 5 − x³ + 3x² + x − 2",
          "Agrupa: (4x³ − x³) + (3x²) + (−2x + x) + (5 − 2)",
          "Combina: 3x³ + 3x² − x + 3",
        ],
        result: "3x³ + 3x² − x + 3",
      },
      {
        id: "sr-e2",
        title: "Resta de polinomios",
        problem: "Resta: (6x² − 3x + 4) − (2x² + 5x − 1)",
        steps: [
          "Cambia signos del sustraendo: −(2x² + 5x − 1) = −2x² − 5x + 1",
          "Suma: 6x² − 3x + 4 − 2x² − 5x + 1",
          "Combina: (6−2)x² + (−3−5)x + (4+1) = 4x² − 8x + 5",
        ],
        result: "4x² − 8x + 5",
      },
    ],
    exercises: [
      {
        id: "sr-ex1",
        question: "Suma: (3x + 4) + (2x − 1)",
        options: ["5x + 3", "5x − 3", "x + 5", "3x + 3"],
        correctAnswer: "5x + 3",
        explanation: "3x + 2x = 5x y 4 − 1 = 3. Resultado: 5x + 3.",
      },
      {
        id: "sr-ex2",
        question: "Resta: (5x² − 2x) − (3x² + x)",
        options: ["2x² − 3x", "8x² − x", "2x² + x", "8x² − 3x"],
        correctAnswer: "2x² − 3x",
        explanation: "−(3x² + x) = −3x² − x. Luego: 5x² − 3x² = 2x² y −2x − x = −3x.",
      },
      {
        id: "sr-ex3",
        question: "¿Cuánto es (x² + 3x − 1) + (−x² + 2)?",
        options: ["3x + 1", "2x² + 3x + 1", "3x − 1", "−3x + 1"],
        correctAnswer: "3x + 1",
        explanation: "x² − x² = 0. 3x + 0 = 3x. −1 + 2 = 1. Resultado: 3x + 1.",
      },
      {
        id: "sr-ex4",
        question: "Resta: (4a − 3b + 2) − (a − b − 5)",
        options: ["3a − 2b + 7", "3a − 4b − 3", "5a − 2b + 7", "3a + 2b − 3"],
        correctAnswer: "3a − 2b + 7",
        explanation: "−(a − b − 5) = −a + b + 5. 4a−a=3a, −3b+b=−2b, 2+5=7.",
      },
      {
        id: "sr-ex5",
        question: "Suma: (3x² + 2x − 1) + (x² − 4x + 3)",
        options: ["4x² − 2x + 2", "4x² + 6x − 2", "2x² − 2x + 4", "4x² + 2x + 2"],
        correctAnswer: "4x² − 2x + 2",
        explanation: "(3x²+x²) + (2x−4x) + (−1+3) = 4x² − 2x + 2.",
      },
      {
        id: "sr-ex6",
        question: "Resta: (5y² − 3y) − (2y² + y − 4)",
        options: ["3y² − 4y + 4", "3y² − 2y − 4", "7y² − 2y + 4", "3y² + 4y − 4"],
        correctAnswer: "3y² − 4y + 4",
        explanation: "Distribuyendo el menos: 5y² − 3y − 2y² − y + 4 = 3y² − 4y + 4.",
      },
      {
        id: "sr-ex7",
        question: "Un triángulo tiene lados (a+b), (2a−b) y (3a). ¿Cuál es el perímetro?",
        options: ["6a", "6a + 2b", "5a", "6a − b"],
        correctAnswer: "6a",
        explanation: "(a+b) + (2a−b) + 3a = a+b+2a−b+3a = 6a.",
      },
      {
        id: "sr-ex8",
        question: "Resta: (4a³ − 2a + 5) − (a³ + 3a − 2)",
        options: ["3a³ − 5a + 7", "5a³ − a + 7", "3a³ + a + 3", "3a³ − 5a − 7"],
        correctAnswer: "3a³ − 5a + 7",
        explanation: "4a³ − 2a + 5 − a³ − 3a + 2 = (4−1)a³ + (−2−3)a + (5+2) = 3a³ − 5a + 7.",
      },
    ],
  },

  {
    id: "s3-agrupacion",
    sectionId: "operaciones",
    title: "Signos de Agrupación",
    icon: "( )",
    color: "#059669",
    definition:
      "Los signos de agrupación (paréntesis (), corchetes [] y llaves {}) se usan para indicar qué operaciones se realizan primero. Al eliminarlos, se deben aplicar correctamente las reglas de signos.",
    practiceHint: "Trabaja de adentro hacia afuera: () primero, luego [], luego {}. Signo − antes de un paréntesis cambia el signo de cada término interno.",
    videos: [
      { title: "Operaciones de agrupación: paréntesis y corchetes", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=operaciones%20agrupacion%20parentesis%20corchetes%20algebra%20khan%20academy" },
      { title: "Signos de agrupación en álgebra", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=signos%20agrupacion%20algebra%20unicoos" },
      { title: "Paréntesis y corchetes en expresiones algebraicas", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=parentesis%20corchetes%20expresiones%20algebraicas%20profe%20alex" },
    ],
    theory: [
      {
        id: "agr-t1",
        title: "Tipos y orden",
        content:
          "Se usan en orden: primero paréntesis (), luego corchetes [], luego llaves {}. Se eliminan de adentro hacia afuera. Reglas: + exterior no cambia signos internos. − exterior invierte TODOS los signos internos.",
        formula: "{2 − [3 + (x − 1)]} → de adentro afuera",
        tip: "Siempre resuelve los signos de agrupación más internos primero.",
      },
      {
        id: "agr-t2",
        title: "Proceso de eliminación",
        content:
          "Paso 1: elimina los paréntesis interiores aplicando la regla de signos. Paso 2: combina términos semejantes si los hay. Paso 3: elimina los corchetes. Paso 4: combina. Paso 5: elimina llaves. Paso 6: simplifica.",
        formula: "2 − [3 + (x − 1)] = 2 − [3 + x − 1] = 2 − [2 + x] = 2 − 2 − x = −x",
        tip: "Después de eliminar cada nivel, simplifica antes de pasar al siguiente.",
      },
    ],
    examples: [
      {
        id: "agr-e1",
        title: "Eliminar signos de agrupación",
        problem: "Simplifica: 5 − [2x − (3 − x) + 4]",
        steps: [
          "Paréntesis: −(3 − x) = −3 + x",
          "Dentro del corchete: 2x − 3 + x + 4 = 3x + 1",
          "Elimina corchete: 5 − [3x + 1] = 5 − 3x − 1",
          "Combina: 4 − 3x",
        ],
        result: "4 − 3x o −3x + 4",
      },
      {
        id: "agr-e2",
        title: "Tres niveles de agrupación",
        problem: "Simplifica: {x + [2 − (x − 3)]}",
        steps: [
          "Paréntesis: −(x − 3) = −x + 3",
          "Corchete: 2 − x + 3 = 5 − x",
          "Llave: x + 5 − x = 5",
        ],
        result: "5",
      },
    ],
    exercises: [
      {
        id: "agr-ex1",
        question: "Simplifica: 3 − (x − 5)",
        options: ["8 − x", "x − 2", "3 + x + 5", "−x + 2"],
        correctAnswer: "8 − x",
        explanation: "−(x − 5) = −x + 5. Luego: 3 + (−x + 5) = 8 − x.",
      },
      {
        id: "agr-ex2",
        question: "Simplifica: 2x − [3 + (x − 1)]",
        options: ["x − 2", "x + 2", "3x − 2", "x + 4"],
        correctAnswer: "x − 2",
        explanation: "(x−1): queda. Corchete: −[3+x−1]=−[2+x]=−2−x. 2x−2−x = x−2.",
      },
      {
        id: "agr-ex3",
        question: "¿Qué signo queda en x al simplificar −(−x + 2)?",
        options: ["+x", "−x", "2x", "−2x"],
        correctAnswer: "+x",
        explanation: "−(−x + 2) = x − 2. El signo de x queda positivo.",
      },
      {
        id: "agr-ex4",
        question: "Simplifica: a − [b − (a − b)]",
        options: ["2a − 2b", "2b − 2a", "0", "2a"],
        correctAnswer: "2a − 2b",
        explanation: "−(a−b) = −a+b. [b−a+b]=[2b−a]. a−(2b−a)=a−2b+a=2a−2b.",
      },
      {
        id: "agr-ex5",
        question: "Simplifica: 5 − (2a − 3b + c)",
        options: ["5 − 2a + 3b − c", "5 + 2a − 3b + c", "5 − 2a − 3b − c", "5 + 2a + 3b + c"],
        correctAnswer: "5 − 2a + 3b − c",
        explanation: "El signo − invierte todos los signos dentro: −2a → −(2a) = −2a, −(+3b) va ya...(−3b) → quita: − antes de −3b = +3b, −c.",
      },
      {
        id: "agr-ex6",
        question: "Simplifica: a − [b − (c − d)]",
        options: ["a − b + c − d", "a + b − c + d", "a − b − c + d", "a + b + c + d"],
        correctAnswer: "a − b + c − d",
        explanation: "Desde adentro: c−d. Luego b−(c−d)=b−c+d. Luego a−(b−c+d)=a−b+c−d.",
      },
      {
        id: "agr-ex7",
        question: "Simplifica: 3x + [2x − (x + 4)]",
        options: ["4x − 4", "3x − 4", "5x − 4", "6x + 4"],
        correctAnswer: "4x − 4",
        explanation: "Desde adentro: 2x − (x+4) = 2x − x − 4 = x − 4. Luego: 3x + (x−4) = 4x − 4.",
      },
      {
        id: "agr-ex8",
        question: "Simplifica: +(a − b) − (−b + c)",
        options: ["a − c", "a − 2b + c", "a + c", "a + 2b − c"],
        correctAnswer: "a − c",
        explanation: "+(a−b) = a−b. −(−b+c) = +b−c. Resultado: a−b+b−c = a−c.",
      },
    ],
  },

  {
    id: "s3-multiplicacion",
    sectionId: "operaciones",
    title: "Multiplicación Algebraica",
    icon: "✖️",
    color: "#059669",
    definition:
      "La multiplicación algebraica aplica la ley de signos, la ley de exponentes y la propiedad distributiva. Se multiplican coeficientes entre sí y variables de igual base se suman sus exponentes.",
    practiceHint: "Multiplica cada término del primer factor por cada término del segundo (propiedad distributiva). Al multiplicar monomios: suma los exponentes de igual variable.",
    videos: [
      { title: "Multiplicación de polinomios", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=multiplicacion%20polinomios%20khan%20academy%20espa%C3%B1ol" },
      { title: "Multiplicar polinomios – propiedad distributiva", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=multiplicar%20polinomios%20propiedad%20distributiva%20unicoos" },
      { title: "Multiplicación de polinomios – ejercicios", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=multiplicacion%20polinomios%20ejercicios%20profe%20alex" },
    ],
    theory: [
      {
        id: "mul-t1",
        title: "Monomio × Monomio",
        content:
          "Para multiplicar dos monomios: multiplica los coeficientes, aplica la ley de signos, y suma los exponentes de variables iguales. (2x²)(3x³) = 6x⁵. (−4ab²)(3a²b) = −12a³b³.",
        formula: "(axⁿ)(bxᵐ) = ab · xⁿ⁺ᵐ",
        tip: "Los coeficientes se multiplican normalmente. Los exponentes de la MISMA variable se SUMAN.",
      },
      {
        id: "mul-t2",
        title: "Monomio × Polinomio",
        content:
          "Aplica la propiedad distributiva: multiplica el monomio por CADA término del polinomio. 3x(2x² − x + 4) = 6x³ − 3x² + 12x. No olvides aplicar la ley de signos a cada término.",
        formula: "a(b + c + d) = ab + ac + ad",
        tip: "El monomio debe multiplicar a TODOS y cada uno de los términos del polinomio.",
      },
      {
        id: "mul-t3",
        title: "Polinomio × Polinomio",
        content:
          "Cada término del primer polinomio multiplica a cada término del segundo. Para un binomio × binomio (FOIL): Primeros + Externos + Internos + Últimos. (a+b)(c+d) = ac + ad + bc + bd. Luego se combinan términos semejantes.",
        formula: "(x+2)(x+3) = x²+3x+2x+6 = x²+5x+6",
        tip: "Cuenta cuántos productos debes obtener: m términos × n términos = m×n productos antes de combinar.",
      },
    ],
    examples: [
      {
        id: "mul-e1",
        title: "Monomio × Polinomio",
        problem: "Multiplica: 2x(3x² − 4x + 1)",
        steps: [
          "2x × 3x² = 6x³",
          "2x × (−4x) = −8x²",
          "2x × 1 = 2x",
        ],
        result: "6x³ − 8x² + 2x",
      },
      {
        id: "mul-e2",
        title: "Binomio × Binomio",
        problem: "Multiplica: (x + 5)(x − 3)",
        steps: [
          "Primeros: x × x = x²",
          "Externos: x × (−3) = −3x",
          "Internos: 5 × x = 5x",
          "Últimos: 5 × (−3) = −15",
          "Combina: x² + (−3x + 5x) − 15 = x² + 2x − 15",
        ],
        result: "x² + 2x − 15",
      },
    ],
    exercises: [
      {
        id: "mul-ex1",
        question: "¿Cuánto es (−3x²)(4x³)?",
        options: ["−12x⁵", "12x⁵", "−12x⁶", "12x⁶"],
        correctAnswer: "−12x⁵",
        explanation: "Coef: −3×4=−12. Exponentes: 2+3=5. Resultado: −12x⁵.",
      },
      {
        id: "mul-ex2",
        question: "Expande: 5x(x² − 2)",
        options: ["5x³ − 10x", "5x³ − 2", "5x² − 10x", "5x³ + 10x"],
        correctAnswer: "5x³ − 10x",
        explanation: "5x(x²) = 5x³ y 5x(−2) = −10x.",
      },
      {
        id: "mul-ex3",
        question: "¿Cuánto es (x + 4)(x − 4)?",
        options: ["x² − 16", "x² + 16", "x² − 8x + 16", "x² + 8x − 16"],
        correctAnswer: "x² − 16",
        explanation: "x²−4x+4x−16 = x²−16. (Producto notable: diferencia de cuadrados).",
      },
      {
        id: "mul-ex4",
        question: "Multiplica: (2x − 1)(3x + 2)",
        options: ["6x² + x − 2", "6x² − x − 2", "5x² + x − 2", "6x² − x + 2"],
        correctAnswer: "6x² + x − 2",
        explanation: "6x² + 4x − 3x − 2 = 6x² + x − 2.",
      },
      {
        id: "mul-ex5",
        question: "Expande: 2x(x² − 3x + 5)",
        options: ["2x³ − 6x² + 10x", "2x² − 6x + 10", "2x³ + 6x² + 10x", "2x³ − 3x + 5"],
        correctAnswer: "2x³ − 6x² + 10x",
        explanation: "Distributiva: 2x·x²=2x³, 2x·(−3x)=−6x², 2x·5=10x.",
      },
      {
        id: "mul-ex6",
        question: "Multiplica: 3ab · 4a²b³",
        options: ["12a³b⁴", "7a³b⁴", "12a²b³", "12a³b³"],
        correctAnswer: "12a³b⁴",
        explanation: "Coeficientes: 3×4=12. Variables: a·a²=a³, b·b³=b⁴. Resultado: 12a³b⁴.",
      },
      {
        id: "mul-ex7",
        question: "Desarrolla: (x + 3)(x + 2)",
        options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5x + 5", "x² + 6x + 6"],
        correctAnswer: "x² + 5x + 6",
        explanation: "x·x=x², x·2=2x, 3·x=3x, 3·2=6. Suma: x² + (2x+3x) + 6 = x² + 5x + 6.",
      },
      {
        id: "mul-ex8",
        question: "¿Cuánto es (a + b)²?",
        options: ["a² + 2ab + b²", "a² + b²", "a² − 2ab + b²", "2a + 2b"],
        correctAnswer: "a² + 2ab + b²",
        explanation: "(a+b)² = a² + 2ab + b². El término 2ab es el producto cruzado que muchos olvidan.",
      },
    ],
  },

  {
    id: "s3-division",
    sectionId: "operaciones",
    title: "División Algebraica",
    icon: "➗",
    color: "#059669",
    definition:
      "La división algebraica aplica la ley de signos y la ley de exponentes (se restan). Para dividir un polinomio entre un monomio, se divide cada término. Para dividir entre un polinomio se usa la división larga.",
    practiceHint: "Para dividir un polinomio entre un monomio, divide cada término por separado. Al dividir potencias de igual base: resta exponentes.",
    videos: [
      { title: "División de polinomios: monomio entre monomio", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=division%20polinomios%20monomio%20khan%20academy%20espa%C3%B1ol" },
      { title: "Dividir polinomios paso a paso", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=dividir%20polinomios%20paso%20a%20paso%20unicoos" },
      { title: "División de expresiones algebraicas", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=division%20expresiones%20algebraicas%20profe%20alex" },
    ],
    theory: [
      {
        id: "div-t1",
        title: "Monomio ÷ Monomio",
        content:
          "Divide los coeficientes, aplica la ley de signos, y resta los exponentes de variables iguales. 12x⁵ ÷ 4x² = 3x³. −15a³b² ÷ 5ab = −3a²b. Si el exponente queda 0, la variable desaparece (x⁰ = 1).",
        formula: "(axⁿ) ÷ (bxᵐ) = (a/b) · xⁿ⁻ᵐ",
        tip: "Al dividir misma base: RESTA los exponentes. Siempre coloca el signo primero.",
      },
      {
        id: "div-t2",
        title: "Polinomio ÷ Monomio",
        content:
          "Divide CADA término del polinomio entre el monomio. Es la operación inversa de monomio × polinomio. (6x³ − 4x² + 2x) ÷ 2x = 3x² − 2x + 1. Verifica multiplicando el resultado por el divisor.",
        formula: "(a + b + c) ÷ d = a/d + b/d + c/d",
        tip: "Divide término a término. Verifica: resultado × divisor debe dar el dividendo.",
      },
    ],
    examples: [
      {
        id: "div-e1",
        title: "Monomio ÷ Monomio",
        problem: "Divide: −18x⁴y³ ÷ 6x²y",
        steps: [
          "Coeficientes: −18 ÷ 6 = −3",
          "Variable x: x⁴ ÷ x² = x⁴⁻² = x²",
          "Variable y: y³ ÷ y = y³⁻¹ = y²",
        ],
        result: "−3x²y²",
      },
      {
        id: "div-e2",
        title: "Polinomio ÷ Monomio",
        problem: "Divide: (10x³ − 15x² + 5x) ÷ 5x",
        steps: [
          "10x³ ÷ 5x = 2x²",
          "−15x² ÷ 5x = −3x",
          "5x ÷ 5x = 1",
        ],
        result: "2x² − 3x + 1",
      },
    ],
    exercises: [
      {
        id: "div-ex1",
        question: "¿Cuánto es 20x⁵ ÷ 4x²?",
        options: ["5x³", "5x²", "16x³", "5x⁷"],
        correctAnswer: "5x³",
        explanation: "20÷4=5 y x⁵÷x²=x³. Resultado: 5x³.",
      },
      {
        id: "div-ex2",
        question: "Divide: (8x² − 4x) ÷ 4x",
        options: ["2x − 1", "2x + 1", "4x − 1", "2x² − 1"],
        correctAnswer: "2x − 1",
        explanation: "8x²÷4x=2x y −4x÷4x=−1. Resultado: 2x−1.",
      },
      {
        id: "div-ex3",
        question: "¿Cuánto es −12a³b² ÷ 3a²b?",
        options: ["−4ab", "4ab", "−4a²b²", "−4ab²"],
        correctAnswer: "−4ab",
        explanation: "−12÷3=−4, a³÷a²=a, b²÷b=b. Resultado: −4ab.",
      },
      {
        id: "div-ex4",
        question: "Divide: (9x³ + 6x² − 3x) ÷ 3x",
        options: ["3x² + 2x − 1", "3x² + 2x + 1", "6x² + 3x − 1", "3x + 2 − 1"],
        correctAnswer: "3x² + 2x − 1",
        explanation: "9x³÷3x=3x², 6x²÷3x=2x, −3x÷3x=−1.",
      },
      {
        id: "div-ex5",
        question: "Divide: 12a³b² ÷ 4ab",
        options: ["3a²b", "3ab", "8a²b", "3a³b"],
        correctAnswer: "3a²b",
        explanation: "Coeficientes: 12÷4=3. Variables: a³÷a=a², b²÷b=b. Resultado: 3a²b.",
      },
      {
        id: "div-ex6",
        question: "Divide: 15x³y ÷ 3xy",
        options: ["5x²", "5x²y", "12x²", "5x³"],
        correctAnswer: "5x²",
        explanation: "15÷3=5. x³÷x=x². y÷y=1. Resultado: 5x².",
      },
      {
        id: "div-ex7",
        question: "Divide: (6a² + 3a) ÷ 3a",
        options: ["2a + 1", "2a − 1", "3a + 1", "2a"],
        correctAnswer: "2a + 1",
        explanation: "6a²÷3a = 2a. 3a÷3a = 1. Resultado: 2a + 1.",
      },
      {
        id: "div-ex8",
        question: "Divide: (x² − 5x + 6) ÷ (x − 2)",
        options: ["x − 3", "x + 3", "x − 2", "x + 2"],
        correctAnswer: "x − 3",
        explanation: "(x−2)(x−3) = x²−3x−2x+6 = x²−5x+6. Por tanto (x²−5x+6)÷(x−2) = x−3.",
      },
    ],
  },

  {
    id: "s3-productos",
    sectionId: "operaciones",
    title: "Productos Notables",
    icon: "⭐",
    color: "#059669",
    definition:
      "Los productos notables son multiplicaciones de polinomios especiales cuyo resultado sigue un patrón fijo, lo que permite calcularlos directamente sin desarrollar término a término.",
    practiceHint: "Identifica el patrón: (a+b)²=a²+2ab+b², (a−b)²=a²−2ab+b², (a+b)(a−b)=a²−b². Aplica la fórmula directamente sin multiplicar término a término.",
    videos: [
      { title: "Productos notables: cuadrado de la suma", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=productos%20notables%20cuadrado%20suma%20khan%20academy%20espa%C3%B1ol" },
      { title: "Productos notables explicados con ejemplos", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=productos%20notables%20explicados%20ejemplos%20unicoos" },
      { title: "Fórmulas de productos notables – ejercicios", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=formulas%20productos%20notables%20ejercicios%20profe%20alex" },
    ],
    theory: [
      {
        id: "prod-t1",
        title: "¿Por qué son 'notables'?",
        content:
          "Son notables porque aparecen con mucha frecuencia en matemáticas y sus resultados se memorizan como fórmulas. Conocerlos permite factorizar y resolver ecuaciones más rápidamente. Los más importantes son: cuadrado de la suma, cuadrado de la diferencia, producto de la suma por la diferencia, y cubo de un binomio.",
        formula: "(a+b)² · (a-b)² · (a+b)(a-b) · (a±b)³",
        tip: "Memoriza los cuatro productos notables fundamentales — te ahorrarán mucho tiempo en factorización.",
      },
      {
        id: "prod-t2",
        title: "Cuadrado de la suma",
        content:
          "Es el producto notable más común: (a + b)² = a² + 2ab + b². Tres términos: el cuadrado del primero, el doble del producto, el cuadrado del segundo. El signo del término medio siempre es positivo en el cuadrado de la suma.",
        formula: "(a + b)² = a² + 2ab + b²",
        tip: "El término medio es SIEMPRE 2ab, nunca olvides el '2'.",
      },
    ],
    examples: [
      {
        id: "prod-e1",
        title: "Cuadrado de la suma",
        problem: "Desarrolla: (3x + 4)²",
        steps: [
          "a = 3x, b = 4",
          "a² = (3x)² = 9x²",
          "2ab = 2(3x)(4) = 24x",
          "b² = 4² = 16",
        ],
        result: "9x² + 24x + 16",
      },
      {
        id: "prod-e2",
        title: "Cuadrado de la diferencia",
        problem: "Desarrolla: (2x − 5)²",
        steps: [
          "a = 2x, b = 5",
          "a² = 4x²",
          "−2ab = −2(2x)(5) = −20x",
          "b² = 25",
        ],
        result: "4x² − 20x + 25",
      },
    ],
    exercises: [
      {
        id: "prod-ex1",
        question: "¿Cuánto es (2x + 3)(2x − 3)?",
        options: ["4x² − 9", "4x² + 9", "4x² − 12x + 9", "4x² + 12x − 9"],
        correctAnswer: "4x² − 9",
        explanation: "Es una suma por diferencia: (a+b)(a−b)=a²−b². Con a=2x y b=3: (2x)²−3²=4x²−9.",
      },
      {
        id: "prod-ex2",
        question: "¿Cuánto es (2a − 3)²?",
        options: ["4a² − 12a + 9", "4a² + 9", "4a² − 6a + 9", "2a² − 12a + 9"],
        correctAnswer: "4a² − 12a + 9",
        explanation: "a=2a, b=3. (2a)²−2(2a)(3)+3² = 4a²−12a+9.",
      },
      {
        id: "prod-ex3",
        question: "¿Cuánto es (x + y)(x − y)?",
        options: ["x² − y²", "x² + y²", "x² − 2xy + y²", "x² + 2xy − y²"],
        correctAnswer: "x² − y²",
        explanation: "Producto suma por diferencia: a² − b² = x² − y².",
      },
      {
        id: "prod-ex4",
        question: "En (a + b)², ¿cuál es el término medio?",
        options: ["2ab", "ab", "a²b", "2a²b²"],
        correctAnswer: "2ab",
        explanation: "(a+b)² = a² + 2ab + b². El término medio es 2ab.",
      },
      {
        id: "prod-ex5",
        question: "¿Cuánto es (3x + 2)²?",
        options: ["9x² + 12x + 4", "9x² + 4", "9x² + 6x + 4", "6x² + 12x + 4"],
        correctAnswer: "9x² + 12x + 4",
        explanation: "(3x+2)² = (3x)² + 2·(3x)·2 + 2² = 9x² + 12x + 4.",
      },
      {
        id: "prod-ex6",
        question: "¿Cuánto es (2x − 5)²?",
        options: ["4x² − 20x + 25", "4x² + 25", "4x² − 10x + 25", "4x² − 20x − 25"],
        correctAnswer: "4x² − 20x + 25",
        explanation: "(2x−5)² = (2x)² − 2·(2x)·5 + 5² = 4x² − 20x + 25.",
      },
      {
        id: "prod-ex7",
        question: "Calcula (x + 4)(x − 4) usando productos notables.",
        options: ["x² − 16", "x² + 16", "x² − 8x − 16", "x² + 8x − 16"],
        correctAnswer: "x² − 16",
        explanation: "(a+b)(a−b) = a² − b². Aquí a=x, b=4: x² − 4² = x² − 16.",
      },
      {
        id: "prod-ex8",
        question: "¿Cuánto es (a + 3)² − (a − 3)²?",
        options: ["12a", "2a² + 18", "18", "0"],
        correctAnswer: "12a",
        explanation: "(a²+6a+9)−(a²−6a+9) = a²+6a+9−a²+6a−9 = 12a.",
      },
    ],
  },

  {
    id: "s3-cuadrado-diferencia",
    sectionId: "operaciones",
    title: "Cuadrado de la Diferencia",
    icon: "²",
    color: "#059669",
    definition:
      "El cuadrado de la diferencia es el producto notable (a − b)² = a² − 2ab + b². Siempre produce tres términos: el cuadrado del primero, MENOS el doble del producto, MÁS el cuadrado del segundo.",
    practiceHint: "(a−b)² = a² − 2ab + b². El término central es NEGATIVO. Identifica a y b, cuadra cada uno y no olvides el doble producto con signo −.",
    videos: [
      { title: "Cuadrado de la diferencia (a−b)²", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=cuadrado%20diferencia%20binomio%20algebra%20khan%20academy%20espa%C3%B1ol" },
      { title: "(a−b)² desarrollado paso a paso", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=cuadrado%20diferencia%20a%20menos%20b%20unicoos" },
      { title: "Producto notable: cuadrado de un binomio", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=producto%20notable%20cuadrado%20binomio%20diferencia%20profe%20alex" },
    ],
    theory: [
      {
        id: "cd-t1",
        title: "La fórmula y sus términos",
        content:
          "En (a − b)²: primer término = a² (positivo), término medio = −2ab (NEGATIVO), tercer término = b² (SIEMPRE POSITIVO, porque b² ≥ 0). El error más frecuente es hacer el término medio positivo o el tercer término negativo.",
        formula: "(a − b)² = a² − 2ab + b²",
        tip: "El cuadrado de cualquier número real es SIEMPRE positivo, por eso b² es positivo aunque b sea negativo.",
      },
      {
        id: "cd-t2",
        title: "Verificación y uso",
        content:
          "Verifica: (a − b)² = (a − b)(a − b) = a² − ab − ab + b² = a² − 2ab + b². Se usa mucho en factorización: si ves a² − 2ab + b², puedes factorizar como (a − b)². Reconocer el patrón es clave.",
        formula: "x² − 10x + 25 = (x − 5)² ✓ porque 2×x×5=10 y 5²=25",
        tip: "Para verificar si es cuadrado perfecto: el término medio debe ser el doble del producto de las raíces de los extremos.",
      },
    ],
    examples: [
      {
        id: "cd-e1",
        title: "Desarrollar (5x − 3)²",
        problem: "Desarrolla usando la fórmula: (5x − 3)²",
        steps: [
          "a = 5x, b = 3",
          "a² = (5x)² = 25x²",
          "−2ab = −2(5x)(3) = −30x",
          "b² = 3² = 9",
        ],
        result: "25x² − 30x + 9",
      },
      {
        id: "cd-e2",
        title: "Verificar si es cuadrado de diferencia",
        problem: "¿Es 4x² − 12x + 9 un cuadrado de diferencia? ¿De cuál?",
        steps: [
          "Primer término: 4x² = (2x)², a = 2x",
          "Tercer término: 9 = 3², b = 3",
          "Término medio esperado: −2(2x)(3) = −12x ✓",
        ],
        result: "Sí: 4x² − 12x + 9 = (2x − 3)²",
      },
    ],
    exercises: [
      {
        id: "cd-ex1",
        question: "¿Cuánto es (x − 7)²?",
        options: ["x² − 14x + 49", "x² + 14x + 49", "x² − 7x + 49", "x² − 49"],
        correctAnswer: "x² − 14x + 49",
        explanation: "a=x, b=7. x² − 2(x)(7) + 49 = x² − 14x + 49.",
      },
      {
        id: "cd-ex2",
        question: "¿Cuánto es (3a − 2b)²?",
        options: ["9a² − 12ab + 4b²", "9a² + 4b²", "9a² − 6ab + 4b²", "3a² − 12ab + 4b²"],
        correctAnswer: "9a² − 12ab + 4b²",
        explanation: "(3a)²−2(3a)(2b)+(2b)² = 9a²−12ab+4b².",
      },
      {
        id: "cd-ex3",
        question: "x² − 8x + 16 es igual a:",
        options: ["(x − 4)²", "(x + 4)²", "(x − 8)²", "(x − 4)(x + 4)"],
        correctAnswer: "(x − 4)²",
        explanation: "a=x, b=4: x²−2(x)(4)+4²=x²−8x+16. Factoriza como (x−4)².",
      },
      {
        id: "cd-ex4",
        question: "¿Cuál es el signo del tercer término en (a − b)²?",
        options: ["Siempre positivo", "Siempre negativo", "Depende de a y b", "Puede ser cero"],
        correctAnswer: "Siempre positivo",
        explanation: "b² siempre es positivo o cero (cuadrado de un número real).",
      },
      {
        id: "cd-ex5",
        question: "Factoriza: x² − 25",
        options: ["(x + 5)(x − 5)", "(x − 5)²", "(x + 25)(x − 1)", "(x + 5)²"],
        correctAnswer: "(x + 5)(x − 5)",
        explanation: "x² − 25 = x² − 5². Por diferencia de cuadrados: (x+5)(x−5).",
      },
      {
        id: "cd-ex6",
        question: "Factoriza: 4a² − 9",
        options: ["(2a + 3)(2a − 3)", "(2a − 3)²", "(4a + 9)(a − 1)", "(2a + 3)²"],
        correctAnswer: "(2a + 3)(2a − 3)",
        explanation: "4a² = (2a)², 9 = 3². Diferencia de cuadrados: (2a+3)(2a−3).",
      },
      {
        id: "cd-ex7",
        question: "Calcula 51 × 49 usando diferencia de cuadrados.",
        options: ["2499", "2500", "2501", "2450"],
        correctAnswer: "2499",
        explanation: "51×49 = (50+1)(50−1) = 50² − 1² = 2500 − 1 = 2499.",
      },
      {
        id: "cd-ex8",
        question: "¿Cuál de estas expresiones es una diferencia de cuadrados perfectos?",
        options: ["4x² − 1", "x² + 4", "x² − 3", "9x + 25"],
        correctAnswer: "4x² − 1",
        explanation: "4x² = (2x)², 1 = 1². 4x² − 1 = (2x+1)(2x−1). Los demás no cumplen la forma a²−b².",
      },
    ],
  },

  {
    id: "s3-suma-diferencia",
    sectionId: "operaciones",
    title: "Producto Suma × Diferencia",
    icon: "⟺",
    color: "#059669",
    definition:
      "El producto de la suma por la diferencia es el producto notable (a + b)(a − b) = a² − b². Su resultado es siempre una diferencia de cuadrados: solo dos términos, sin término medio.",
    practiceHint: "(a+b)(a−b) = a²−b². El resultado siempre elimina el término del medio. Solo cuadra cada término y réstalos. Identifica a y b primero.",
    videos: [
      { title: "Suma por diferencia: diferencia de cuadrados", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=suma%20por%20diferencia%20diferencia%20cuadrados%20khan%20academy%20espa%C3%B1ol" },
      { title: "(a+b)(a−b) = a²−b² explicado", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=suma%20por%20diferencia%20producto%20notable%20unicoos" },
      { title: "Diferencia de cuadrados – ejemplos y ejercicios", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=diferencia%20cuadrados%20producto%20notable%20profe%20alex" },
    ],
    theory: [
      {
        id: "sd-t1",
        title: "La fórmula y su demostración",
        content:
          "Desarrollo: (a + b)(a − b) = a² − ab + ab − b² = a² − b². Los términos medios se cancelan. El resultado tiene exactamente dos términos: el cuadrado del primer binomio menos el cuadrado del segundo. Es el producto notable más limpio de todos.",
        formula: "(a + b)(a − b) = a² − b²",
        tip: "Si ves una multiplicación donde uno tiene + y otro − con los mismos términos, el resultado es a² − b² directamente.",
      },
      {
        id: "sd-t2",
        title: "Aplicaciones",
        content:
          "Este producto notable sirve para: (1) calcular productos mentalmente: 49 × 51 = (50−1)(50+1) = 2500−1 = 2499. (2) Reconocer la factorización de diferencias de cuadrados: x² − 9 = (x+3)(x−3). (3) Simplificar expresiones algebraicas complejas.",
        formula: "97 × 103 = (100−3)(100+3) = 10000 − 9 = 9991",
        tip: "Úsalo para calcular mentalmente productos como 38×42 = (40−2)(40+2) = 1600−4 = 1596.",
      },
    ],
    examples: [
      {
        id: "sd-e1",
        title: "Aplicar la fórmula",
        problem: "Calcula: (4x + 3)(4x − 3)",
        steps: [
          "a = 4x, b = 3",
          "a² = (4x)² = 16x²",
          "b² = 3² = 9",
          "Resultado: a² − b²",
        ],
        result: "16x² − 9",
      },
      {
        id: "sd-e2",
        title: "Cálculo mental",
        problem: "Calcula 45 × 55 usando el producto notable",
        steps: [
          "45 = 50 − 5 y 55 = 50 + 5",
          "(50 − 5)(50 + 5) = 50² − 5²",
          "= 2500 − 25",
        ],
        result: "2475",
      },
    ],
    exercises: [
      {
        id: "sd-ex1",
        question: "¿Cuánto es (x + 6)(x − 6)?",
        options: ["x² − 36", "x² + 36", "x² − 12x + 36", "x² − 6x − 6x + 36"],
        correctAnswer: "x² − 36",
        explanation: "a=x, b=6. Resultado: x² − 36.",
      },
      {
        id: "sd-ex2",
        question: "¿Cuánto es (5a + 2b)(5a − 2b)?",
        options: ["25a² − 4b²", "25a² + 4b²", "5a² − 4b²", "25a² − 2b²"],
        correctAnswer: "25a² − 4b²",
        explanation: "(5a)²−(2b)² = 25a²−4b².",
      },
      {
        id: "sd-ex3",
        question: "Calcula mentalmente 38 × 42",
        options: ["1596", "1600", "1592", "1604"],
        correctAnswer: "1596",
        explanation: "(40−2)(40+2) = 1600 − 4 = 1596.",
      },
      {
        id: "sd-ex4",
        question: "¿Cuántos términos tiene el resultado de (a+b)(a−b)?",
        options: ["2", "3", "4", "1"],
        correctAnswer: "2",
        explanation: "Resultado: a² − b². Exactamente dos términos (sin término medio).",
      },
      {
        id: "sd-ex5",
        question: "¿Cuánto es (5 + x)(5 − x)?",
        options: ["25 − x²", "25 + x²", "x² − 25", "10x"],
        correctAnswer: "25 − x²",
        explanation: "(a+b)(a−b) = a² − b². Con a=5, b=x: 25 − x².",
      },
      {
        id: "sd-ex6",
        question: "Desarrolla: (2a + 3b)(2a − 3b)",
        options: ["4a² − 9b²", "4a² + 9b²", "4a² − 6ab", "2a² − 3b²"],
        correctAnswer: "4a² − 9b²",
        explanation: "(2a)² − (3b)² = 4a² − 9b².",
      },
      {
        id: "sd-ex7",
        question: "Calcula 102 × 98 usando la fórmula (a+b)(a−b).",
        options: ["9996", "9998", "10000", "9904"],
        correctAnswer: "9996",
        explanation: "(100+2)(100−2) = 100² − 2² = 10000 − 4 = 9996.",
      },
      {
        id: "sd-ex8",
        question: "¿Cuánto es (7x + y)(7x − y)?",
        options: ["49x² − y²", "49x² + y²", "7x² − y²", "14xy"],
        correctAnswer: "49x² − y²",
        explanation: "(7x)² − y² = 49x² − y².",
      },
    ],
  },

  {
    id: "s3-cubo",
    sectionId: "operaciones",
    title: "Cubo de un Binomio",
    icon: "³",
    color: "#059669",
    definition:
      "El cubo de un binomio es el producto notable (a ± b)³. Su desarrollo sigue un patrón de cuatro términos cuyos coeficientes son 1, 3, 3, 1 (de la fila del triángulo de Pascal).",
    practiceHint: "(a+b)³ = a³+3a²b+3ab²+b³. Coeficientes: 1,3,3,1. Para (a−b)³ los signos alternan: +,−,+,−. Identifica a y b primero.",
    videos: [
      { title: "Cubo de un binomio (a+b)³ y (a−b)³", channel: "Khan Academy en Español", url: "https://www.youtube.com/results?search_query=cubo%20binomio%20producto%20notable%20khan%20academy%20espa%C3%B1ol" },
      { title: "Cómo desarrollar el cubo de un binomio", channel: "Unicoos", url: "https://www.youtube.com/results?search_query=cubo%20binomio%20desarrollo%20unicoos" },
      { title: "Fórmula del cubo del binomio – ejercicios resueltos", channel: "Profe Alex", url: "https://www.youtube.com/results?search_query=cubo%20binomio%20formula%20ejercicios%20profe%20alex" },
    ],
    theory: [
      {
        id: "cub-t1",
        title: "Cubo de la suma: (a + b)³",
        content:
          "Desarrollo: (a + b)³ = a³ + 3a²b + 3ab² + b³. Cuatro términos: cubo del primero, tres veces cuadrado del primero por el segundo, tres veces el primero por cuadrado del segundo, cubo del segundo. Todos los signos son positivos.",
        formula: "(a + b)³ = a³ + 3a²b + 3ab² + b³",
        tip: "Los coeficientes 1, 3, 3, 1 son la tercera fila del triángulo de Pascal.",
      },
      {
        id: "cub-t2",
        title: "Cubo de la diferencia: (a − b)³",
        content:
          "Desarrollo: (a − b)³ = a³ − 3a²b + 3ab² − b³. Los signos alternan: +, −, +, −. La regla es: mismos términos que el cubo de la suma, pero los términos pares (2° y 4°) tienen signo negativo.",
        formula: "(a − b)³ = a³ − 3a²b + 3ab² − b³",
        tip: "Para el cubo de la diferencia: signos alternados empezando en +. Impar=+, Par=−.",
      },
    ],
    examples: [
      {
        id: "cub-e1",
        title: "Cubo de la suma",
        problem: "Desarrolla: (x + 2)³",
        steps: [
          "a = x, b = 2",
          "a³ = x³",
          "3a²b = 3(x²)(2) = 6x²",
          "3ab² = 3(x)(4) = 12x",
          "b³ = 8",
        ],
        result: "x³ + 6x² + 12x + 8",
      },
      {
        id: "cub-e2",
        title: "Cubo de la diferencia",
        problem: "Desarrolla: (2x − 1)³",
        steps: [
          "a = 2x, b = 1",
          "a³ = 8x³",
          "−3a²b = −3(4x²)(1) = −12x²",
          "3ab² = 3(2x)(1) = 6x",
          "−b³ = −1",
        ],
        result: "8x³ − 12x² + 6x − 1",
      },
    ],
    exercises: [
      {
        id: "cub-ex1",
        question: "¿Cuánto es (x + 1)³?",
        options: ["x³ + 3x² + 3x + 1", "x³ + 3x + 1", "x³ + x² + x + 1", "x³ + 1"],
        correctAnswer: "x³ + 3x² + 3x + 1",
        explanation: "a=x, b=1. x³+3x²(1)+3x(1)+1 = x³+3x²+3x+1.",
      },
      {
        id: "cub-ex2",
        question: "¿Cuántos términos tiene el desarrollo de (a + b)³?",
        options: ["4", "3", "2", "6"],
        correctAnswer: "4",
        explanation: "a³ + 3a²b + 3ab² + b³. Cuatro términos.",
      },
      {
        id: "cub-ex3",
        question: "¿Cuál es el signo del segundo término en (a − b)³?",
        options: ["Negativo", "Positivo", "Cero", "Depende de a y b"],
        correctAnswer: "Negativo",
        explanation: "(a−b)³ = a³ − 3a²b + 3ab² − b³. El segundo término −3a²b es negativo.",
      },
      {
        id: "cub-ex4",
        question: "¿Cuál es el coeficiente del término 3a²b en (a + b)³?",
        options: ["3", "1", "6", "2"],
        correctAnswer: "3",
        explanation: "El patrón de coeficientes en (a+b)³ es 1, 3, 3, 1. El segundo término tiene coeficiente 3.",
      },
      {
        id: "cub-ex5",
        question: "¿Cuánto es (x + 2)³?",
        options: ["x³ + 6x² + 12x + 8", "x³ + 8", "x³ + 2x² + 4x + 8", "x³ + 6x + 8"],
        correctAnswer: "x³ + 6x² + 12x + 8",
        explanation: "(a+b)³ = a³+3a²b+3ab²+b³. Con a=x, b=2: x³+6x²+12x+8.",
      },
      {
        id: "cub-ex6",
        question: "¿Cuánto es (a − b)³?",
        options: ["a³ − 3a²b + 3ab² − b³", "a³ − b³", "a³ + 3a²b − 3ab² + b³", "a³ − 3ab − b³"],
        correctAnswer: "a³ − 3a²b + 3ab² − b³",
        explanation: "(a−b)³ = a³−3a²b+3ab²−b³. Los signos del 2.° y 4.° término son negativos.",
      },
      {
        id: "cub-ex7",
        question: "¿Cuál es el primer término de (2x − 1)³?",
        options: ["8x³", "2x³", "6x³", "4x³"],
        correctAnswer: "8x³",
        explanation: "(2x−1)³: primer término = (2x)³ = 8x³.",
      },
      {
        id: "cub-ex8",
        question: "El volumen de un cubo de lado (a+3) es (a+3)³. ¿Cuál es el término con a²?",
        options: ["9a²", "27a²", "3a²", "6a²"],
        correctAnswer: "9a²",
        explanation: "(a+3)³ = a³+9a²+27a+27. El término con a² es 9a².",
      },
    ],
  },
];

// ══════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════

export const ALL_TOPICS: TopicContent[] = [
  ...SABERES_TOPICS,
  ...ALGEBRA_TOPICS,
  ...OPERACIONES_TOPICS,
];

export function getTopicById(id: string): TopicContent | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}

export function getTopicsBySection(sectionId: string): TopicContent[] {
  return ALL_TOPICS.filter((t) => t.sectionId === sectionId);
}
