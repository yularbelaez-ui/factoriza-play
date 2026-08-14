import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  unique,
} from "drizzle-orm/pg-core";

// ── Teachers ─────────────────────────────────────────────────────
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  teacherCode: varchar("teacher_code", { length: 30 }).notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Class codes ──────────────────────────────────────────────────
export const classCodes = pgTable("class_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  label: text("label").notNull(),
  teacherId: integer("teacher_id").references(() => teachers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Students ─────────────────────────────────────────────────────
export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey(),
    pseudonym: varchar("pseudonym", { length: 80 }).notNull(),
    classCode: varchar("class_code", { length: 20 }).notNull(),
    totalXP: integer("total_xp").default(0).notNull(),
    streak: integer("streak").default(0).notNull(),
    completedTopics: text("completed_topics").array().default([]).notNull(),
    completedModules: text("completed_modules").array().default([]).notNull(),
    completedExercises: text("completed_exercises").array().default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.pseudonym, t.classCode)]
);

// ── Exercise results ─────────────────────────────────────────────
export const exerciseResults = pgTable("exercise_results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  exerciseId: varchar("exercise_id", { length: 80 }).notNull(),
  correct: boolean("correct").notNull(),
  errorCategory: varchar("error_category", { length: 50 }),
  attempts: integer("attempts").default(1).notNull(),
  answer: text("answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Eval codes (per module, per class) ──────────────────────────
export const evalCodes = pgTable("eval_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull(),
  moduleId: varchar("module_id", { length: 40 }).notNull(),
  classCode: varchar("class_code", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
