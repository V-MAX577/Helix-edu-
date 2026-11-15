import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/*  Identity                                                           */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("student"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  board: varchar("board", { length: 80 }).notNull().default("Maharashtra State Board"),
  className: varchar("class_name", { length: 40 }).notNull().default("Class 10"),
  level: varchar("level", { length: 20 }).notNull().default("intermediate"),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(30),
  fontScale: integer("font_scale").notNull().default(100),
  theme: varchar("theme", { length: 20 }).notNull().default("cosmos"),
  reduceMotion: boolean("reduce_motion").notNull().default(false),
  avatar: varchar("avatar", { length: 8 }).notNull().default("🚀"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_uq").on(t.token), index("sessions_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/*  Curriculum                                                        */
/* ------------------------------------------------------------------ */

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 60 }).notNull(),
    name: varchar("name", { length: 80 }).notNull(),
    tagline: varchar("tagline", { length: 160 }).notNull().default(""),
    icon: varchar("icon", { length: 8 }).notNull().default("📘"),
    color: varchar("color", { length: 20 }).notNull().default("violet"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("subjects_slug_uq").on(t.slug)],
);

export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 90 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    summary: text("summary").notNull().default(""),
    level: varchar("level", { length: 20 }).notNull().default("intermediate"),
    minutes: integer("minutes").notNull().default(12),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("chapters_slug_uq").on(t.slug), index("chapters_subject_idx").on(t.subjectId)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 120 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    /** Structured blocks: heading | paragraph | list | example | tip | formula | code */
    blocks: jsonb("blocks").notNull().$type<LessonBlock[]>(),
    minutes: integer("minutes").notNull().default(6),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("lessons_slug_uq").on(t.slug), index("lessons_chapter_idx").on(t.chapterId)],
);

export const flashcards = pgTable(
  "flashcards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("flashcards_subject_idx").on(t.subjectId)],
);

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    options: jsonb("options").notNull().$type<string[]>(),
    answerIndex: integer("answer_index").notNull(),
    explanation: text("explanation").notNull().default(""),
    difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"),
  },
  (t) => [index("quiz_questions_subject_idx").on(t.subjectId)],
);

export const quizzes = pgTable(
  "quizzes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 120 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull().default(""),
    difficulty: varchar("difficulty", { length: 20 }).notNull().default("medium"),
    timeLimitSec: integer("time_limit_sec").notNull().default(300),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("quizzes_slug_uq").on(t.slug)],
);

export const quizItems = pgTable(
  "quiz_items",
  {
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => quizQuestions.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.quizId, t.questionId] })],
);

/* ------------------------------------------------------------------ */
/*  Learner state                                                     */
/* ------------------------------------------------------------------ */

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    seconds: integer("seconds").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    answers: jsonb("answers").notNull().$type<Record<string, number>>(),
    score: integer("score").notNull().default(0),
    total: integer("total").notNull().default(0),
    seconds: integer("seconds").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("quiz_attempts_user_idx").on(t.userId)],
);

export const flashcardReviews = pgTable(
  "flashcard_reviews",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    flashcardId: uuid("flashcard_id")
      .notNull()
      .references(() => flashcards.id, { onDelete: "cascade" }),
    box: integer("box").notNull().default(1),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull().defaultNow(),
    seen: integer("seen").notNull().default(0),
    correct: integer("correct").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.flashcardId] })],
);

export const studyLog = pgTable(
  "study_log",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    minutes: integer("minutes").notNull().default(0),
    actions: integer("actions").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] }), index("study_log_user_day_idx").on(t.userId, t.day)],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull().default(""),
    subjectSlug: varchar("subject_slug", { length: 60 }),
    chapterSlug: varchar("chapter_slug", { length: 90 }),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notes_user_idx").on(t.userId)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: varchar("target_type", { length: 30 }).notNull(),
    targetId: varchar("target_id", { length: 120 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    href: varchar("href", { length: 240 }).notNull(),
    subtitle: varchar("subtitle", { length: 200 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("bookmarks_unique").on(t.userId, t.targetType, t.targetId),
    index("bookmarks_user_idx").on(t.userId),
  ],
);

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 60 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull().default(""),
  icon: varchar("icon", { length: 8 }).notNull().default("🏅"),
  tier: varchar("tier", { length: 20 }).notNull().default("bronze"),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);

/* ------------------------------------------------------------------ */
/*  AI assistant + planning                                           */
/* ------------------------------------------------------------------ */

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull().default("New chat"),
    mode: varchar("mode", { length: 30 }).notNull().default("deep-think"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("chat_sessions_user_idx").on(t.userId)],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    provider: varchar("provider", { length: 40 }).notNull().default("helix-engine"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("chat_messages_session_idx").on(t.sessionId)],
);

export const studyPlans = pgTable(
  "study_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    examDate: date("exam_date"),
    subjects: jsonb("subjects").notNull().$type<string[]>(),
    minutesPerDay: integer("minutes_per_day").notNull().default(45),
    plan: jsonb("plan").notNull().$type<PlanDay[]>(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("study_plans_user_idx").on(t.userId)],
);

export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 160 }).notNull(),
    time: varchar("time", { length: 5 }).notNull(),
    days: jsonb("days").notNull().$type<number[]>(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reminders_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type LessonBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "example"; title?: string; text: string }
  | { kind: "tip"; text: string }
  | { kind: "formula"; text: string }
  | { kind: "code"; lang: string; code: string };

export type PlanDay = {
  day: string;
  focus: string;
  blocks: { minutes: number; activity: string; subject?: string }[];
};

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type Flashcard = typeof flashcards.$inferSelect;
