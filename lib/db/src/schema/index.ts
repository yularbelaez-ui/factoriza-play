import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
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
    dailyXP: integer("daily_xp").default(0).notNull(),
    dailyXPDate: varchar("daily_xp_date", { length: 10 }),
    streakLastDate: varchar("streak_last_date", { length: 10 }),
    completedTopics: text("completed_topics").array().default([]).notNull(),
    completedModules: text("completed_modules").array().default([]).notNull(),
    completedExercises: text("completed_exercises").array().default([]).notNull(),
    diagnosticProfile: jsonb("diagnostic_profile").$type<Record<string, unknown>>(),
    initialProfile: varchar("initial_profile", { length: 80 }),
    initialRank: varchar("initial_rank", { length: 40 }),
    profileHistory: jsonb("profile_history").$type<Array<Record<string, unknown>>>().default([]).notNull(),
    rankHistory: jsonb("rank_history").$type<Array<Record<string, unknown>>>().default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.pseudonym, t.classCode)]
);

// ── Exercise results ─────────────────────────────────────────────
export const exerciseResults = pgTable(
  "exercise_results",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id),
    exerciseId: varchar("exercise_id", { length: 80 }).notNull(),
    moduleId: varchar("module_id", { length: 60 }),
    correct: boolean("correct").notNull(),
    errorCategory: varchar("error_category", { length: 50 }),
    attempts: integer("attempts").default(1).notNull(),
    answer: text("answer"),
    hintsUsed: integer("hints_used").default(0).notNull(),
    feedbackViews: integer("feedback_views").default(0).notNull(),
    durationSeconds: integer("duration_seconds"),
    // Client-generated idempotency key so retried syncs never double-count XP.
    // Nullable for pre-idempotency records; new API submissions require it.
    clientId: varchar("client_id", { length: 64 }),
    questionText: text("question_text"),
    topicName: varchar("topic_name", { length: 120 }),
    correctAnswer: text("correct_answer"),
    evidenceUrl: text("evidence_url"),
    evidenceDriveFileId: varchar("evidence_drive_file_id", { length: 200 }),
    evidenceMetadata: jsonb("evidence_metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.studentId, t.clientId)]
);

// End-of-module student reflection. Kept separate so a student can revise a
// reflection without creating a fake exercise result.
export const moduleReflections = pgTable(
  "module_reflections",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    moduleId: varchar("module_id", { length: 60 }).notNull(),
    aspectsWorked: text("aspects_worked"),
    difficulties: text("difficulties"),
    improvementSuggestions: text("improvement_suggestions"),
    clientId: varchar("client_id", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.studentId, t.moduleId, t.clientId)]
);

// A server-issued lifecycle record. A session can receive its reflection XP
// exactly once and cannot be completed until its reflection is submitted.
export const learningSessions = pgTable(
  "learning_sessions",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    activityId: varchar("activity_id", { length: 100 }).notNull(),
    clientId: varchar("client_id", { length: 80 }).notNull(),
    status: varchar("status", { length: 20 }).default("open").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    qualifyingWorkAt: timestamp("qualifying_work_at"),
    reflectedAt: timestamp("reflected_at"),
    completedAt: timestamp("completed_at"),
    durationSeconds: integer("duration_seconds"),
  },
  (t) => [unique().on(t.studentId, t.clientId)]
);

// Required end-of-session reflection. Each client submission is idempotent so
// an offline retry cannot award XP twice.
export const sessionReflections = pgTable(
  "session_reflections",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 100 }).notNull(),
    understood: text("understood").notNull(),
    mistakes: text("mistakes").notNull(),
    helpful: text("helpful").notNull(),
    remainingQuestions: text("remaining_questions").notNull(),
    clientId: varchar("client_id", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.studentId, t.clientId), unique().on(t.studentId, t.sessionId)]
);

// One reflection per student/week. weekStart is an ISO date (YYYY-MM-DD)
// generated by the client or API and is kept as text for timezone stability.
export const weeklyReflections = pgTable(
  "weekly_reflections",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    weekStart: varchar("week_start", { length: 10 }).notNull(),
    mostImportant: text("most_important").notNull(),
    mainDifficulty: text("main_difficulty").notNull(),
    appHelp: text("app_help").notNull(),
    advice: text("advice").notNull(),
    clientId: varchar("client_id", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.studentId, t.weekStart), unique().on(t.studentId, t.clientId)]
);

// Auditable XP ledger. `sourceId` is stable for a logical event and prevents
// duplicate rewards when a request is retried or the user revisits a screen.
export const xpEvents = pgTable(
  "xp_events",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 60 }).notNull(),
    sourceId: varchar("source_id", { length: 120 }).notNull(),
    xp: integer("xp").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.studentId, t.eventType, t.sourceId)]
);

// ── Eval codes (per module, per class) ──────────────────────────
export const evalCodes = pgTable("eval_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull(),
  moduleId: varchar("module_id", { length: 40 }).notNull(),
  classCode: varchar("class_code", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
