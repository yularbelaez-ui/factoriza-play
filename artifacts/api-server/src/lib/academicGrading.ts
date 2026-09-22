export type AcademicComponentKey = "initial" | "correction" | "transfer" | "reflection";

export interface AcademicExerciseEvidence {
  exerciseId: string;
  moduleId?: string | null;
  correct: boolean;
  attempts?: number | null;
  timestamp?: Date | string | number | null;
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

const WEIGHTS: Record<AcademicComponentKey, number> = {
  initial: 0.2,
  correction: 0.4,
  transfer: 0.3,
  reflection: 0.1,
};
const COMPONENTS: AcademicComponentKey[] = ["initial", "correction", "transfer", "reflection"];

function grade(proportion: number): number {
  return Math.round((1 + Math.max(0, Math.min(1, proportion)) * 4) * 10) / 10;
}

function summary(components: AcademicComponent[]): AcademicGradeSummary {
  const covered = components.filter((item) => item.covered);
  const weight = covered.reduce((sum, item) => sum + item.weight, 0);
  const proportion = weight === 0
    ? null
    : covered.reduce((sum, item) => sum + (item.proportion ?? 0) * item.weight, 0) / weight;
  return {
    grade: proportion === null ? null : grade(proportion),
    proportion,
    coverage: weight,
    missingComponents: COMPONENTS.filter((key) => !covered.some((item) => item.key === key)),
    components,
    evidenceCount: covered.reduce((sum, item) => sum + item.evidenceCount, 0),
  };
}

function item(
  key: AcademicComponentKey,
  proportion: number | null,
  evidenceCount: number,
  successCount: number,
  opportunityCount: number,
): AcademicComponent {
  return {
    key,
    weight: WEIGHTS[key],
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

function isPrerequisiteTopicId(moduleId: string): boolean {
  return /^s[123]-/.test(moduleId);
}

function timestampValue(record: AcademicExerciseEvidence): number {
  if (record.timestamp == null) return 0;
  return new Date(record.timestamp).getTime() || Number(record.timestamp) || 0;
}

function latest(records: AcademicExerciseEvidence[]): AcademicExerciseEvidence[] {
  const byId = new Map<string, AcademicExerciseEvidence>();
  for (const record of records) {
    const existing = byId.get(record.exerciseId);
    const attempts = record.attempts ?? 1;
    const oldAttempts = existing?.attempts ?? 1;
    const time = timestampValue(record);
    const oldTime = existing ? timestampValue(existing) : 0;
    if (!existing || attempts > oldAttempts || (attempts === oldAttempts && time >= oldTime)) byId.set(record.exerciseId, record);
  }
  return [...byId.values()];
}

function correctionEvidence(records: AcademicExerciseEvidence[]): {
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
    const identified = incorrect.some(({ record }) => Boolean(record.errorCategory?.trim()));
    const feedback = entries.some((record) =>
      (record.feedbackViews ?? 0) > 0 || record.feedbackViewed === true,
    );
    const corrected = orderedEntries
      .filter(({ record }) => record.correct && (record.attempts ?? 1) > 1)
      .filter(({ record, index }) => {
        const correctionTime = timestampValue(record);
        return incorrect.some(({ record: incorrectRecord, index: incorrectIndex }) => {
          const incorrectTime = timestampValue(incorrectRecord);
          return correctionTime > incorrectTime ||
            (correctionTime === 0 && incorrectTime === 0 && index > incorrectIndex);
        });
      });
    const hasCorrection = corrected.length > 0;
    if (identified) earnedCriteria += 1;
    if (feedback) earnedCriteria += 1;
    if (hasCorrection) {
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
  evaluationIds: ReadonlySet<string>,
  reflections: AcademicReflectionEvidence[] = [],
  title?: string,
): TopicGrade {
  const moduleRecords = records.filter((record) =>
    normalizedModuleId(record.moduleId) === moduleId ||
    (!record.moduleId && activeModuleForExercise(record.exerciseId) === moduleId),
  );
  const practice = moduleRecords.filter((record) => !evaluationIds.has(record.exerciseId));
  const first = latest(practice.filter((record) => (record.attempts ?? 1) <= 1));
  const initialSuccesses = first.filter((record) => record.correct).length;
  const initial = first.length > 0 ? initialSuccesses / first.length : null;
  const correctionEvidenceResult = correctionEvidence(practice);
  const transfer = latest(moduleRecords.filter((record) =>
    evaluationIds.has(record.exerciseId),
  ));
  const transferSuccesses = transfer.filter((record) => record.correct).length;
  const transferProportion = transfer.length > 0 ? transferSuccesses / transfer.length : null;
  const reflected = reflections.some((reflection) =>
    reflection.completed !== false &&
    (reflection.moduleId === moduleId || reflection.activityId === moduleId),
  );
  return {
    moduleId,
    title,
    ...summary([
      item("initial", initial, first.length, initialSuccesses, first.length),
      item(
        "correction",
        correctionEvidenceResult.proportion,
        correctionEvidenceResult.evidenceCount,
        correctionEvidenceResult.successCount,
        correctionEvidenceResult.opportunityCount,
      ),
      item("transfer", transferProportion, transfer.length, transferSuccesses, transfer.length),
      item("reflection", reflected ? 1 : null, reflected ? 1 : 0, reflected ? 1 : 0, reflected ? 1 : 0),
    ]),
  };
}

function direct(proportion: number | null, evidenceCount: number): AcademicGradeSummary {
  const result = summary([
    item("initial", proportion, evidenceCount, proportion === null ? 0 : Math.round(proportion * evidenceCount), evidenceCount),
    item("correction", null, 0, 0, 0),
    item("transfer", null, 0, 0, 0),
    item("reflection", null, 0, 0, 0),
  ]);
  return {
    ...result,
    coverage: proportion === null ? 0 : 1,
    missingComponents: proportion === null ? COMPONENTS : [],
  };
}

function pooledComponents(
  topics: TopicGrade[],
  diagnostics: Array<{ category: string; score?: number | null }>,
): AcademicComponent[] {
  const pooled = new Map<AcademicComponentKey, {
    evidenceCount: number;
    successCount: number;
    opportunityCount: number;
  }>();
  for (const key of COMPONENTS) {
    pooled.set(key, { evidenceCount: 0, successCount: 0, opportunityCount: 0 });
  }
  for (const topic of topics) {
    for (const component of topic.components) {
      const target = pooled.get(component.key)!;
      target.evidenceCount += component.evidenceCount;
      target.successCount += component.successCount;
      target.opportunityCount += component.opportunityCount;
    }
  }
  const initial = pooled.get("initial")!;
  for (const diagnostic of diagnostics) {
    initial.evidenceCount += 1;
    initial.successCount += (diagnostic.score ?? 0) / 100;
    initial.opportunityCount += 1;
  }
  return COMPONENTS.map((key) => {
    const value = pooled.get(key)!;
    const proportion = value.opportunityCount > 0
      ? value.successCount / value.opportunityCount
      : null;
    return item(key, proportion, value.evidenceCount, value.successCount, value.opportunityCount);
  });
}

const NUMERIC = new Set(["naturales", "decimales", "enteros", "fracciones", "irracionales", "reales", "potencias"]);
const ALGEBRA = new Set(["propiedades", "terminos", "variables", "igualdad"]);
const ACADEMIC_DIAGNOSTIC_CATEGORIES = new Set([
  "naturales", "decimales", "enteros", "fracciones", "potencias",
  "propiedades", "terminos", "variables", "igualdad",
]);
const ACADEMIC_DIAGNOSTIC_TOPIC_IDS = [
  "s1-naturales", "s1-decimales", "s1-enteros", "s1-racionales", "s1-potencias",
  "s2-signos", "s2-semejantes", "s2-notacion", "s2-diferencia",
] as const;
const ACADEMIC_TOPIC_TITLES: Record<string, string> = {
  "s1-naturales": "Números naturales y operaciones",
  "s1-decimales": "Números decimales y operaciones",
  "s1-enteros": "Números enteros y ley de signos",
  "s1-racionales": "Fracciones y números racionales",
  "s1-potencias": "Potencias y propiedades",
  "s2-signos": "Propiedades y signos algebraicos",
  "s2-semejantes": "Términos semejantes",
  "s2-notacion": "Variables y notación algebraica",
  "s2-diferencia": "Igualdad y equivalencia",
};
export const ACTIVE_ACADEMIC_MODULE_IDS = [
  "factor-comun", "agrupacion-terminos", "trinomio-cuadrado-perfecto",
  "diferencia-cuadrados", "trinomio-forma-x2-bx-c", "cubo-binomio", "suma-diferencia-cubos",
] as const;

const EVALUATION_PREFIX_BY_MODULE: Record<typeof ACTIVE_ACADEMIC_MODULE_IDS[number], string> = {
  "factor-comun": "fc",
  "agrupacion-terminos": "ag",
  "trinomio-cuadrado-perfecto": "tcp",
  "diferencia-cuadrados": "dc",
  "trinomio-forma-x2-bx-c": "tr",
  "cubo-binomio": "cb",
  "suma-diferencia-cubos": "sc",
};

/** Evaluation IDs use catalog abbreviations; retired modules never enter this map. */
export function isActiveEvaluationId(exerciseId: string): boolean {
  return Object.values(EVALUATION_PREFIX_BY_MODULE).some((prefix) =>
    exerciseId.startsWith(`${prefix}-eval-`),
  );
}

function activeModuleForExercise(exerciseId: string): string | null {
  const fullModuleId = ACTIVE_ACADEMIC_MODULE_IDS.find((moduleId) =>
    exerciseId.startsWith(`${moduleId}-`),
  );
  if (fullModuleId) return fullModuleId;
  const abbreviatedModule = (Object.entries(EVALUATION_PREFIX_BY_MODULE) as Array<
    [typeof ACTIVE_ACADEMIC_MODULE_IDS[number], string]
  >).find(([, prefix]) => exerciseId.startsWith(`${prefix}-`));
  return abbreviatedModule?.[0] ?? null;
}

export function evaluationIdsForModule(moduleId: string, records: AcademicExerciseEvidence[]): Set<string> {
  const prefix = EVALUATION_PREFIX_BY_MODULE[moduleId as typeof ACTIVE_ACADEMIC_MODULE_IDS[number]];
  if (!prefix) return new Set();
  return new Set(records
    .filter((record) =>
      (record.moduleId === moduleId || activeModuleForExercise(record.exerciseId) === moduleId) &&
      record.exerciseId.startsWith(`${prefix}-eval-`),
    )
    .map((record) => record.exerciseId));
}

export function calculateAcademicSummary(input: {
  records: AcademicExerciseEvidence[];
  reflections?: AcademicReflectionEvidence[];
  diagnosticResults?: Array<{ category: string; score?: number | null }>;
  moduleTitles?: Record<string, string>;
}): AcademicSummary {
  const activeRecords = input.records
    .filter((record) =>
      !record.exerciseId.startsWith("reconocimiento-patrones-") &&
      !record.exerciseId.startsWith("ax2-") &&
      !record.moduleId?.startsWith("reconocimiento-patrones") &&
      !record.moduleId?.startsWith("trinomio-ax2"),
    )
    .flatMap((record) => {
      const normalized = normalizedModuleId(record.moduleId);
      const moduleId = normalized && (
        ACTIVE_ACADEMIC_MODULE_IDS.includes(normalized as typeof ACTIVE_ACADEMIC_MODULE_IDS[number]) ||
        isPrerequisiteTopicId(normalized)
      )
        ? normalized
        : activeModuleForExercise(record.exerciseId);
      return moduleId ? [{ ...record, moduleId }] : [];
    });
  const academicModuleIds = [...ACADEMIC_DIAGNOSTIC_TOPIC_IDS, ...ACTIVE_ACADEMIC_MODULE_IDS];
  const allTopics = academicModuleIds.map((moduleId) =>
    calculateTopicGrade(
      moduleId,
      activeRecords,
      evaluationIdsForModule(moduleId, activeRecords),
      input.reflections ?? [],
      input.moduleTitles?.[moduleId] ?? ACADEMIC_TOPIC_TITLES[moduleId],
    ),
  );
  const diagnostics = (input.diagnosticResults ?? []).filter((result) =>
    ACADEMIC_DIAGNOSTIC_CATEGORIES.has(result.category) &&
    typeof result.score === "number" &&
    Number.isFinite(result.score),
  );
  // The academic view is intentionally limited to the nine diagnostic topics
  // and the factorization cases. Passing the diagnostic does not hide a topic:
  // it remains part of the student's academic record.
  const topics = allTopics;
  const diagnosticGrades = Object.fromEntries(diagnostics.map((result) => [
    result.category,
    grade((result.score ?? 0) / 100),
  ]));
  const average = (values: typeof diagnostics) =>
    values.length > 0 ? values.reduce((sum, result) => sum + (result.score ?? 0), 0) / values.length / 100 : null;
  const numeric = diagnostics.filter((result) => NUMERIC.has(result.category));
  const algebra = diagnostics.filter((result) => ALGEBRA.has(result.category));
  const numericTopics = topics.filter((topic) => topic.moduleId.startsWith("s1-"));
  const algebraTopics = topics.filter((topic) =>
    topic.moduleId.startsWith("s2-") || topic.moduleId.startsWith("s3-"),
  );
  const general = summary(pooledComponents(topics, diagnostics));
  return {
    topics,
    diagnosticGrades,
    pensamientoNumerico: summary(pooledComponents(numericTopics, numeric)),
    pensamientoAlgebraico: summary(pooledComponents(algebraTopics, algebra)),
    general,
  };
}