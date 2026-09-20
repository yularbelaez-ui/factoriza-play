/**
 * Deterministic academic grading. This deliberately has no React, storage, or
 * network dependencies so the offline student view and the API can use the
 * same rubric.
 */

export type AcademicComponentKey = "initial" | "correction" | "transfer" | "reflection";

export interface AcademicExerciseEvidence {
  exerciseId: string;
  moduleId?: string | null;
  correct: boolean;
  attempts?: number | null;
  timestamp?: number | string | null;
  errorCategory?: string | null;
  feedbackViews?: number | null;
  feedbackViewed?: boolean;
}

export interface AcademicReflectionEvidence {
  moduleId?: string | null;
  activityId?: string | null;
  completed?: boolean;
}

export interface AcademicComponent {
  key: AcademicComponentKey;
  weight: number;
  proportion: number | null;
  evidenceCount: number;
  successCount: number;
  opportunityCount: number;
  covered: boolean;
}

export interface AcademicGradeSummary {
  grade: number | null;
  proportion: number | null;
  coverage: number;
  missingComponents: AcademicComponentKey[];
  components: AcademicComponent[];
  evidenceCount: number;
}

export interface TopicGrade extends AcademicGradeSummary {
  moduleId: string;
  title?: string;
}

export interface AcademicSummary {
  general: AcademicGradeSummary;
  topics: TopicGrade[];
  diagnosticGrades: Record<string, number>;
  pensamientoNumerico: AcademicGradeSummary;
  pensamientoAlgebraico: AcademicGradeSummary;
}

export const ACADEMIC_WEIGHTS: Record<AcademicComponentKey, number> = {
  initial: 0.2,
  correction: 0.4,
  transfer: 0.3,
  reflection: 0.1,
};

const EMPTY_COMPONENTS: AcademicComponentKey[] = ["initial", "correction", "transfer", "reflection"];

function oneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function scoreToGrade(proportion: number): number {
  return oneDecimal(1 + 4 * Math.max(0, Math.min(1, proportion)));
}

function makeSummary(components: AcademicComponent[]): AcademicGradeSummary {
  const covered = components.filter((component) => component.covered);
  const totalWeight = covered.reduce((sum, component) => sum + component.weight, 0);
  const proportion = totalWeight > 0
    ? covered.reduce((sum, component) => sum + (component.proportion ?? 0) * component.weight, 0) / totalWeight
    : null;
  return {
    grade: proportion === null ? null : scoreToGrade(proportion),
    proportion,
    coverage: totalWeight,
    missingComponents: EMPTY_COMPONENTS.filter(
      (key) => !covered.some((component) => component.key === key),
    ),
    components,
    evidenceCount: covered.reduce((sum, component) => sum + component.evidenceCount, 0),
  };
}

function component(
  key: AcademicComponentKey,
  proportion: number | null,
  evidenceCount: number,
  successCount: number,
  opportunityCount: number,
): AcademicComponent {
  return {
    key,
    weight: ACADEMIC_WEIGHTS[key],
    proportion,
    evidenceCount,
    successCount,
    opportunityCount,
    covered: proportion !== null && opportunityCount > 0,
  };
}

function normalizedModuleId(moduleId?: string | null): string | null {
  if (!moduleId) return null;
  return moduleId.startsWith("support:") ? moduleId.slice("support:".length) : moduleId;
}

function latestPerExercise(records: AcademicExerciseEvidence[]): AcademicExerciseEvidence[] {
  const byId = new Map<string, AcademicExerciseEvidence>();
  for (const record of records) {
    const previous = byId.get(record.exerciseId);
    const attempts = record.attempts ?? 1;
    const previousAttempts = previous?.attempts ?? 1;
    const currentTime = record.timestamp == null ? 0 : new Date(record.timestamp).getTime() || Number(record.timestamp) || 0;
    const previousTime = previous?.timestamp == null ? 0 : new Date(previous.timestamp).getTime() || Number(previous.timestamp) || 0;
    if (!previous || attempts > previousAttempts || (attempts === previousAttempts && currentTime >= previousTime)) {
      byId.set(record.exerciseId, record);
    }
  }
  return Array.from(byId.values());
}

function timestampValue(record: AcademicExerciseEvidence): number {
  if (record.timestamp == null) return 0;
  return new Date(record.timestamp).getTime() || Number(record.timestamp) || 0;
}

function correctionEvidence(records: AcademicExerciseEvidence[], theoryRead = false): {
  proportion: number | null;
  evidenceCount: number;
  successCount: number;
  opportunityCount: number;
  latestCorrectionAt: number | null;
} {
  const byExercise = new Map<string, AcademicExerciseEvidence[]>();
  records.forEach((record) => {
    const entries = byExercise.get(record.exerciseId) ?? [];
    entries.push(record);
    byExercise.set(record.exerciseId, entries);
  });
  let opportunities = 0;
  let earnedCriteria = 0;
  let latestCorrectionAt: number | null = null;
  for (const entries of byExercise.values()) {
    const orderedEntries = entries.map((record, index) => ({ record, index }));
    const incorrect = orderedEntries.filter(({ record }) => !record.correct);
    if (incorrect.length === 0) continue;
    opportunities += 1;
    if (incorrect.some(({ record }) => Boolean(record.errorCategory?.trim()))) earnedCriteria += 1;
    if (theoryRead || entries.some((record) => (record.feedbackViews ?? 0) > 0 || record.feedbackViewed === true)) {
      earnedCriteria += 1;
    }
    const corrected = orderedEntries.filter(({ record, index }) =>
      record.correct &&
      (record.attempts ?? 1) > 1 &&
      incorrect.some(({ record: incorrectRecord, index: incorrectIndex }) => {
        const correctionTime = timestampValue(record);
        const incorrectTime = timestampValue(incorrectRecord);
        return correctionTime > incorrectTime ||
          (correctionTime === 0 && incorrectTime === 0 && index > incorrectIndex);
      }),
    );
    if (corrected.length > 0) {
      earnedCriteria += 1;
      const correctionTime = Math.max(...corrected.map(({ record }) => timestampValue(record)));
      if (correctionTime > 0) {
        latestCorrectionAt = latestCorrectionAt == null
          ? correctionTime
          : Math.max(latestCorrectionAt, correctionTime);
      }
    }
  }
  return {
    proportion: opportunities > 0 ? earnedCriteria / (opportunities * 3) : null,
    evidenceCount: opportunities,
    successCount: earnedCriteria,
    opportunityCount: opportunities * 3,
    latestCorrectionAt,
  };
}

export function calculateTopicGrade(
  moduleId: string,
  records: AcademicExerciseEvidence[],
  evaluationExerciseIds: ReadonlySet<string> = new Set(),
  reflections: AcademicReflectionEvidence[] = [],
  title?: string,
  theoryRead = false,
): TopicGrade {
  const evaluationPrefix = Array.from(evaluationExerciseIds)
    .map((id) => id.split("-eval-")[0])
    .find(Boolean);
  const moduleRecords = records.filter((record) =>
    !record.exerciseId.startsWith("reconocimiento-patrones-") &&
    !record.exerciseId.startsWith("ax2-") &&
    (normalizedModuleId(record.moduleId) === moduleId ||
      record.exerciseId.startsWith(`${moduleId}-`) ||
      (evaluationPrefix != null && record.exerciseId.startsWith(`${evaluationPrefix}-`))) &&
    !normalizedModuleId(record.moduleId)?.startsWith("reconocimiento-patrones") &&
    !normalizedModuleId(record.moduleId)?.startsWith("trinomio-ax2-bx-c"),
  );
  const practiceRecords = moduleRecords.filter((record) => !evaluationExerciseIds.has(record.exerciseId));
  const first = latestPerExercise(practiceRecords.filter((record) => (record.attempts ?? 1) <= 1));
  const initial = first.length > 0
    ? first.filter((record) => record.correct).length / first.length
    : null;
  const correctionEvidenceResult = correctionEvidence(practiceRecords, theoryRead);

  const transferRecords = latestPerExercise(moduleRecords.filter((record) =>
    evaluationExerciseIds.has(record.exerciseId),
  ));
  const transfer = transferRecords.length > 0
    ? transferRecords.filter((record) => record.correct).length / transferRecords.length
    : null;

  const reflected = reflections.some((reflection) =>
    reflection.completed !== false &&
    (reflection.moduleId === moduleId || reflection.activityId === moduleId),
  );
  const components = [
    component("initial", initial, first.length, first.filter((record) => record.correct).length, first.length),
    component(
      "correction",
      correctionEvidenceResult.proportion,
      correctionEvidenceResult.evidenceCount,
      correctionEvidenceResult.successCount,
      correctionEvidenceResult.opportunityCount,
    ),
    component("transfer", transfer, transferRecords.length, transferRecords.filter((record) => record.correct).length, transferRecords.length),
    component("reflection", reflected ? 1 : null, reflected ? 1 : 0, reflected ? 1 : 0, reflected ? 1 : 0),
  ];
  return { moduleId, title, ...makeSummary(components) };
}

function directSummary(proportion: number | null, evidenceCount: number): AcademicGradeSummary {
  const result = makeSummary([
    component("initial", proportion, evidenceCount, proportion === null ? 0 : Math.round(proportion * evidenceCount), evidenceCount),
    component("correction", null, 0, 0, 0),
    component("transfer", null, 0, 0, 0),
    component("reflection", null, 0, 0, 0),
  ]);
  return {
    ...result,
    coverage: proportion === null ? 0 : 1,
    missingComponents: proportion === null ? EMPTY_COMPONENTS : [],
  };
}

const NUMERIC_CATEGORIES = new Set([
  "naturales", "decimales", "enteros", "fracciones", "irracionales", "reales", "potencias",
]);
const ALGEBRA_CATEGORIES = new Set(["propiedades", "terminos", "variables", "igualdad"]);
const DIAGNOSTIC_PASS_THRESHOLD = 75;
const TOPIC_DIAGNOSTIC_CATEGORY: Record<string, string> = {
  "s1-naturales": "naturales",
  "s1-decimales": "decimales",
  "s1-enteros": "enteros",
  "s1-racionales": "fracciones",
  "s1-irracionales": "irracionales",
  "s1-reales": "reales",
  "s1-potencias": "potencias",
  "s1-factores": "factorizacion",
  "s2-diferencia": "igualdad",
  "s2-notacion": "variables",
  "s2-signos": "propiedades",
  "s2-expresion": "propiedades",
  "s2-grado": "propiedades",
  "s2-clasificacion": "terminos",
  "s2-orden": "igualdad",
  "s2-semejantes": "terminos",
  "s3-suma-resta": "operaciones",
  "s3-agrupacion": "operaciones",
  "s3-multiplicacion": "operaciones",
  "s3-division": "operaciones",
  "s3-productos": "patrones",
  "s3-cuadrado-diferencia": "patrones",
  "s3-suma-diferencia": "patrones",
  "s3-cubo": "patrones",
};

function pooledComponents(
  topics: TopicGrade[],
  diagnostics: ReadonlyArray<{ category: string; score?: number | null }>,
): AcademicComponent[] {
  const pooled = new Map<AcademicComponentKey, {
    evidenceCount: number;
    successCount: number;
    opportunityCount: number;
  }>();
  for (const key of EMPTY_COMPONENTS) {
    pooled.set(key, { evidenceCount: 0, successCount: 0, opportunityCount: 0 });
  }
  for (const topic of topics) {
    for (const item of topic.components) {
      const target = pooled.get(item.key)!;
      target.evidenceCount += item.evidenceCount;
      target.successCount += item.successCount;
      target.opportunityCount += item.opportunityCount;
    }
  }
  const initial = pooled.get("initial")!;
  for (const diagnostic of diagnostics) {
    initial.evidenceCount += 1;
    initial.successCount += (diagnostic.score ?? 0) / 100;
    initial.opportunityCount += 1;
  }
  return EMPTY_COMPONENTS.map((key) => {
    const value = pooled.get(key)!;
    const proportion = value.opportunityCount > 0
      ? value.successCount / value.opportunityCount
      : null;
    return component(key, proportion, value.evidenceCount, value.successCount, value.opportunityCount);
  });
}

export function calculateAcademicSummary(input: {
  records: AcademicExerciseEvidence[];
  activeModules: ReadonlyArray<{ id: string; title?: string; evaluationExerciseIds?: ReadonlyArray<string> }>;
  reflections?: AcademicReflectionEvidence[];
  diagnosticResults?: ReadonlyArray<{ category: string; score?: number | null; total?: number | null }>;
  theoryReadModuleIds?: ReadonlyArray<string>;
}): AcademicSummary {
  const theoryRead = new Set(input.theoryReadModuleIds ?? []);
  const activeRecords = input.records
    .filter((record) =>
      !record.exerciseId.startsWith("reconocimiento-patrones-") &&
      !record.exerciseId.startsWith("ax2-") &&
      !normalizedModuleId(record.moduleId)?.startsWith("reconocimiento-patrones") &&
      !normalizedModuleId(record.moduleId)?.startsWith("trinomio-ax2"),
    )
    .map((record) => ({ ...record, moduleId: normalizedModuleId(record.moduleId) }));
  const allTopics = input.activeModules.map((module) => calculateTopicGrade(
    module.id,
    activeRecords,
    new Set(module.evaluationExerciseIds ?? []),
    input.reflections ?? [],
    module.title,
    theoryRead.has(module.id),
  ));
  const diagnostics = (input.diagnosticResults ?? []).filter(
    (result) => result.category !== "patrones" && typeof result.score === "number" && Number.isFinite(result.score),
  );
  const diagnosticScores = new Map(diagnostics.map((result) => [result.category, result.score ?? 0]));
  const topics = allTopics.filter((topic) => {
    const category = TOPIC_DIAGNOSTIC_CATEGORY[topic.moduleId];
    const diagnosticScore = category == null ? undefined : diagnosticScores.get(category);
    return diagnosticScore == null || diagnosticScore < DIAGNOSTIC_PASS_THRESHOLD;
  });
  const diagnosticGrades = Object.fromEntries(
    diagnostics.map((result) => [result.category, scoreToGrade((result.score ?? 0) / 100)]),
  );
  const numeric = diagnostics.filter((result) => NUMERIC_CATEGORIES.has(result.category));
  const algebra = diagnostics.filter((result) => ALGEBRA_CATEGORIES.has(result.category));
  const avg = (items: typeof diagnostics) =>
    items.length > 0 ? items.reduce((sum, result) => sum + (result.score ?? 0), 0) / items.length / 100 : null;
  const numericTopics = topics.filter((topic) => topic.moduleId.startsWith("s1-"));
  const algebraTopics = topics.filter((topic) =>
    topic.moduleId.startsWith("s2-") || topic.moduleId.startsWith("s3-"),
  );
  const pensamientoNumerico = makeSummary(pooledComponents(numericTopics, numeric));
  const pensamientoAlgebraico = makeSummary(pooledComponents(algebraTopics, algebra));
  const general = makeSummary(pooledComponents(topics, diagnostics));
  return { general, topics, diagnosticGrades, pensamientoNumerico, pensamientoAlgebraico };
}
