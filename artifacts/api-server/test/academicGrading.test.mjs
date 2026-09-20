import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAcademicSummary,
  calculateTopicGrade,
  evaluationIdsForModule,
  isActiveEvaluationId,
} from "../.academicGrading.test.mjs";
import * as mobileGrading from "../.mobileAcademicGrading.test.mjs";

const activeModules = [
  ["factor-comun", "fc"],
  ["agrupacion-terminos", "ag"],
  ["trinomio-cuadrado-perfecto", "tcp"],
  ["diferencia-cuadrados", "dc"],
  ["trinomio-forma-x2-bx-c", "tr"],
  ["cubo-binomio", "cb"],
  ["suma-diferencia-cubos", "sc"],
].map(([id, prefix]) => ({ id, prefix }));

test("recognizes abbreviated active evaluation catalogs", () => {
  for (const prefix of ["fc", "ag", "tcp", "dc", "tr", "cb", "sc"]) {
    assert.equal(isActiveEvaluationId(`${prefix}-eval-1`), true, prefix);
  }
  assert.equal(isActiveEvaluationId("reconocimiento-patrones-eval-1"), false);
  const ids = evaluationIdsForModule("factor-comun", [
    { exerciseId: "fc-eval-1", moduleId: null, correct: true, attempts: 1 },
  ]);
  assert.deepEqual([...ids], ["fc-eval-1"]);
});

test("renormalizes missing components and reports coverage", () => {
  const topic = calculateTopicGrade("factor-comun", [
    { exerciseId: "fc-ex-1", moduleId: "factor-comun", correct: true, attempts: 1 },
  ], new Set());
  assert.equal(topic.grade, 5);
  assert.equal(topic.coverage, 0.2);
  assert.deepEqual(topic.missingComponents, ["correction", "transfer", "reflection"]);
});

test("does not create correction opportunities from attempts alone", () => {
  const topic = calculateTopicGrade("factor-comun", [
    { exerciseId: "fc-ex-1", moduleId: "factor-comun", correct: true, attempts: 2 },
  ], new Set());
  assert.equal(topic.components.find((component) => component.key === "correction")?.proportion, null);
});

test("scores a successful correction after an initial error", () => {
  const topic = calculateTopicGrade("factor-comun", [
    {
      exerciseId: "fc-ex-1",
      moduleId: "factor-comun",
      correct: false,
      attempts: 1,
      errorCategory: "variables",
      feedbackViews: 1,
      timestamp: 1000,
    },
    { exerciseId: "fc-ex-1", moduleId: "factor-comun", correct: true, attempts: 2, timestamp: 2000 },
  ], new Set());
  const correction = topic.components.find((component) => component.key === "correction");
  assert.equal(correction?.covered, true);
  assert.equal(correction?.successCount, 3);
  assert.equal(correction?.opportunityCount, 3);
  assert.equal(correction?.proportion, 1);
  assert.equal(topic.grade, 3.7);
});

test("exam answers contribute to the 30% evaluation component without prior correction", () => {
  const records = [
    { exerciseId: "fc-eval-1", moduleId: null, correct: true, attempts: 1, timestamp: 3000 },
  ];
  const summary = calculateAcademicSummary({ records, activeModules });
  const topic = summary.topics.find((item) => item.moduleId === "factor-comun");
  assert.equal(topic?.components.find((item) => item.key === "transfer")?.proportion, 1);
  assert.equal(topic?.components.find((item) => item.key === "transfer")?.covered, true);
  assert.equal(topic?.components.find((item) => item.key === "initial")?.proportion, null);
});

test("mobile and server calculators agree on correction and transfer fixtures", () => {
  const records = [
    {
      exerciseId: "fc-ex-1",
      moduleId: null,
      correct: false,
      attempts: 1,
      errorCategory: "variables",
      feedbackViews: 1,
      timestamp: 1000,
    },
    { exerciseId: "fc-ex-1", moduleId: null, correct: true, attempts: 2, timestamp: 2000 },
    { exerciseId: "fc-eval-1", moduleId: null, correct: true, attempts: 1, timestamp: 3000 },
  ];
  const server = calculateAcademicSummary({ records, activeModules });
  const mobile = mobileGrading.calculateAcademicSummary({
    records,
    activeModules: activeModules.map(({ id, prefix }) => ({
      id,
      evaluationExerciseIds: [`${prefix}-eval-1`],
    })),
  });
  const serverTopic = server.topics.find((topic) => topic.moduleId === "factor-comun");
  const mobileTopic = mobile.topics.find((topic) => topic.moduleId === "factor-comun");
  assert.equal(
    mobileTopic?.components.find((component) => component.key === "correction")?.proportion,
    serverTopic?.components.find((component) => component.key === "correction")?.proportion,
  );
  assert.equal(
    mobileTopic?.components.find((component) => component.key === "transfer")?.proportion,
    serverTopic?.components.find((component) => component.key === "transfer")?.proportion,
  );
});

test("mobile and server calculators agree when theory is read without feedback evidence", () => {
  const records = [
    {
      exerciseId: "fc-ex-1",
      moduleId: null,
      correct: false,
      attempts: 1,
      errorCategory: "variables",
      feedbackViews: 0,
      timestamp: 1000,
    },
  ];
  const server = calculateAcademicSummary({ records, activeModules });
  const mobile = mobileGrading.calculateAcademicSummary({
    records,
    activeModules: activeModules.map(({ id, prefix }) => ({
      id,
      evaluationExerciseIds: [`${prefix}-eval-1`],
    })),
    theoryReadModuleIds: ["factor-comun"],
  });
  const serverTopic = server.topics.find((topic) => topic.moduleId === "factor-comun");
  const mobileTopic = mobile.topics.find((topic) => topic.moduleId === "factor-comun");
  assert.equal(
    mobileTopic?.components.find((component) => component.key === "correction")?.proportion,
    serverTopic?.components.find((component) => component.key === "correction")?.proportion,
  );
  assert.equal(
    mobileTopic?.components.find((component) => component.key === "correction")?.proportion,
    1 / 3,
  );
  assert.equal(
    mobileTopic?.components.find((component) => component.key === "correction")?.covered,
    true,
  );
});

test("general pools topic components and diagnostics, without numeric factorizacion", () => {
  const summary = calculateAcademicSummary({
    records: [
      { exerciseId: "fc-ex-1", moduleId: "factor-comun", correct: true, attempts: 1 },
    ],
    diagnosticResults: [
      { category: "naturales", score: 50 },
      { category: "factorizacion", score: 100 },
      { category: "patrones", score: 100 },
    ],
    activeModules,
  });
  const initial = summary.general.components.find((component) => component.key === "initial");
  assert.equal(initial?.opportunityCount, 3);
  assert.equal(initial?.successCount, 2.5);
  assert.equal(summary.pensamientoNumerico.components.find((component) => component.key === "initial")?.opportunityCount, 1);
  assert.deepEqual(summary.diagnosticGrades.patrones, undefined);
  assert.equal(summary.pensamientoNumerico.grade, 3);
});

test("includes algebraic thinking diagnostic evidence in the final grade", () => {
  const numericOnly = calculateAcademicSummary({
    records: [],
    diagnosticResults: [{ category: "naturales", score: 100 }],
    activeModules,
  });
  const withAlgebra = calculateAcademicSummary({
    records: [],
    diagnosticResults: [
      { category: "naturales", score: 100 },
      { category: "variables", score: 0 },
      { category: "propiedades", score: 0 },
      { category: "terminos", score: 0 },
      { category: "igualdad", score: 0 },
    ],
    activeModules,
  });
  assert.equal(withAlgebra.pensamientoAlgebraico.grade, 1);
  assert.notEqual(withAlgebra.general.grade, numericOnly.general.grade);
});

test("excludes retired module, exercises, and diagnostic patrones", () => {
  const summary = calculateAcademicSummary({
    records: [
      { exerciseId: "reconocimiento-patrones-ex-1", moduleId: "reconocimiento-patrones", correct: true, attempts: 1 },
      { exerciseId: "ax2-eval-1", moduleId: "trinomio-ax2-bx-c", correct: true, attempts: 1 },
    ],
    diagnosticResults: [
      { category: "patrones", score: 100 },
    ],
    activeModules,
  });
  assert.equal(summary.general.grade, null);
  assert.deepEqual(summary.diagnosticGrades, {});
  assert.equal(summary.topics.some((topic) => topic.moduleId === "reconocimiento-patrones"), false);
  assert.equal(summary.topics.some((topic) => topic.moduleId === "trinomio-ax2-bx-c"), false);
});