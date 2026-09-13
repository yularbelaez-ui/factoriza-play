export interface EvaluationAccessCode {
  moduleId: string;
  code: string;
}

// Códigos docentes preparados para los siete casos activos.
// No se incluyen los contenidos retirados.
export const EVALUATION_ACCESS_CODES: EvaluationAccessCode[] = [
  { moduleId: "factor-comun", code: "FC-7A4K" },
  { moduleId: "agrupacion-terminos", code: "AG-3N8P" },
  { moduleId: "trinomio-cuadrado-perfecto", code: "TCP-6R2M" },
  { moduleId: "diferencia-cuadrados", code: "DC-9L5Q" },
  { moduleId: "trinomio-forma-x2-bx-c", code: "TR-4H7X" },
  { moduleId: "cubo-binomio", code: "CB-8V3D" },
  { moduleId: "suma-diferencia-cubos", code: "SC-5J9W" },
];