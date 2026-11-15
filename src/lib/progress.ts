import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  achievements,
  chatMessages,
  chatSessions,
  chapters,
  flashcards,
  flashcardReviews,
  lessonProgress,
  lessons,
  notes,
  quizAttempts,
  quizItems,
  quizQuestions,
  quizzes,
  studyLog,
  subjects,
  userAchievements,
} from "@/db/schema";
import { seedDatabase } from "./seed";

/* ------------------------------ bootstrap ------------------------------ */

let seeding: Promise<void> | null = null;

/** Seeds the curriculum on first use. Idempotent and safe to call often. */
export function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = seedDatabase().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}

/* ------------------------------ study log ------------------------------ */

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function logStudy(userId: string, minutes = 1) {
  const day = today();
  await db
    .insert(studyLog)
    .values({ userId, day, minutes, actions: 1 })
    .onConflictDoUpdate({
      target: [studyLog.userId, studyLog.day],
      set: {
        minutes: sql`${studyLog.minutes} + ${minutes}`,
        actions: sql`${studyLog.actions} + 1`,
      },
    });
}

/* ------------------------------- streaks ------------------------------- */

export async function getStreak(userId: string): Promise<{ current: number; longest: number; totalDays: number }> {
  const rows = await db
    .select({ day: studyLog.day, minutes: studyLog.minutes })
    .from(studyLog)
    .where(eq(studyLog.userId, userId))
    .orderBy(desc(studyLog.day));

  if (!rows.length) return { current: 0, longest: 0, totalDays: 0 };

  const days = new Set(rows.filter((r) => r.minutes > 0).map((r) => r.day));
  let longest = 0;
  let run = 0;
  const sorted = [...days].sort();
  let previous: string | null = null;
  for (const day of sorted) {
    if (previous) {
      const diff =
        (Date.parse(day) - Date.parse(previous)) / 86_400_000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    previous = day;
    longest = Math.max(longest, run);
  }

  // Current streak: today or yesterday must be present, then walk backwards.
  let current = 0;
  let cursor = new Date();
  const todayKey = today();
  if (!days.has(todayKey)) {
    cursor = new Date(cursor.getTime() - 86_400_000);
    if (!days.has(cursor.toISOString().slice(0, 10))) return { current: 0, longest, totalDays: days.size };
  }
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    current++;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }

  return { current, longest: Math.max(longest, current), totalDays: days.size };
}

/* -------------------------------- stats -------------------------------- */

export type LearnerStats = {
  lessonsCompleted: number;
  lessonsTotal: number;
  quizzesTaken: number;
  quizAccuracy: number;
  flashcardsReviewed: number;
  flashcardsMastered: number;
  flashcardsTotal: number;
  notesCount: number;
  chatQuestions: number;
  totalMinutes: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  subjectsTouched: number;
};

export async function getStats(userId: string, dailyGoalMinutes = 30): Promise<LearnerStats> {
  const [
    totalLessons,
    completedLessons,
    attempts,
    flashTotal,
    flashReviewed,
    flashMastered,
    noteCount,
    chatCount,
    minutesRow,
    todayRow,
  ] = await Promise.all([
    db.select({ n: count() }).from(lessons),
    db
      .select({ n: count() })
      .from(lessons)
      .innerJoin(sql`lesson_progress`, sql`lesson_progress.lesson_id = ${lessons.id} AND lesson_progress.user_id = ${userId}`),
    db
      .select({ score: quizAttempts.score, total: quizAttempts.total })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId)),
    db.select({ n: count() }).from(flashcards),
    db
      .select({ n: count() })
      .from(flashcardReviews)
      .where(and(eq(flashcardReviews.userId, userId), sql`${flashcardReviews.seen} > 0`)),
    db
      .select({ n: count() })
      .from(flashcardReviews)
      .where(and(eq(flashcardReviews.userId, userId), gte(flashcardReviews.box, 4))),
    db.select({ n: count() }).from(notes).where(eq(notes.userId, userId)),
    db
      .select({ n: count() })
      .from(chatMessages)
      .innerJoin(chatSessions, eq(chatMessages.sessionId, chatSessions.id))
      .where(and(eq(chatSessions.userId, userId), eq(chatMessages.role, "user"))),
    db.select({ total: sql<number>`coalesce(sum(${studyLog.minutes}), 0)` }).from(studyLog).where(eq(studyLog.userId, userId)),
    db.select({ today: sql<number>`coalesce(sum(${studyLog.minutes}), 0)` }).from(studyLog).where(
      and(eq(studyLog.userId, userId), eq(studyLog.day, today())),
    ),
  ]);

  const attemptsTotal = attempts.reduce((n, a) => n + (a.total ?? 0), 0);
  const attemptsScore = attempts.reduce((n, a) => n + (a.score ?? 0), 0);

  const subjectsTouched = await db
    .select({ n: sql<number>`count(distinct ${chapters.subjectId})` })
    .from(lessons)
    .innerJoin(sql`lesson_progress`, sql`lesson_progress.lesson_id = ${lessons.id} AND lesson_progress.user_id = ${userId}`)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id));

  return {
    lessonsCompleted: Number(completedLessons[0]?.n ?? 0),
    lessonsTotal: Number(totalLessons[0]?.n ?? 0),
    quizzesTaken: attempts.length,
    quizAccuracy: attemptsTotal ? Math.round((attemptsScore / attemptsTotal) * 100) : 0,
    flashcardsReviewed: Number(flashReviewed[0]?.n ?? 0),
    flashcardsMastered: Number(flashMastered[0]?.n ?? 0),
    flashcardsTotal: Number(flashTotal[0]?.n ?? 0),
    notesCount: Number(noteCount[0]?.n ?? 0),
    chatQuestions: Number(chatCount[0]?.n ?? 0),
    totalMinutes: Number(minutesRow[0]?.total ?? 0),
    todayMinutes: Number(todayRow[0]?.today ?? 0),
    dailyGoalMinutes,
    subjectsTouched: Number(subjectsTouched[0]?.n ?? 0),
  };
}

/* ---------------------------- subject progress ------------------------- */

export async function getSubjectProgress(userId: string) {
  const rows = await db
    .select({
      subjectId: subjects.id,
      slug: subjects.slug,
      name: subjects.name,
      icon: subjects.icon,
      color: subjects.color,
      total: sql<number>`count(${lessons.id})`,
      done: sql<number>`count(${sql.raw("lesson_progress.lesson_id")})`,
    })
    .from(subjects)
    .innerJoin(chapters, eq(chapters.subjectId, subjects.id))
    .innerJoin(lessons, eq(lessons.chapterId, chapters.id))
    .leftJoin(
      sql`lesson_progress`,
      sql`lesson_progress.lesson_id = ${lessons.id} AND lesson_progress.user_id = ${userId}`,
    )
    .groupBy(subjects.id, subjects.slug, subjects.name, subjects.icon, subjects.color)
    .orderBy(subjects.sortOrder);

  return rows.map((r) => ({
    subjectId: r.subjectId,
    slug: r.slug,
    name: r.name,
    icon: r.icon,
    color: r.color,
    total: Number(r.total),
    done: Number(r.done),
    percent: Number(r.total) ? Math.round((Number(r.done) / Number(r.total)) * 100) : 0,
  }));
}

/* ----------------------------- achievements ---------------------------- */

type Rule = {
  code: string;
  test: (s: LearnerStats, streak: { current: number; longest: number }) => boolean;
};

const RULES: Rule[] = [
  { code: "first-steps", test: (s) => s.lessonsCompleted >= 1 },
  { code: "curious-mind", test: (s) => s.chatQuestions >= 10 },
  { code: "quiz-rookie", test: (s) => s.quizzesTaken >= 1 },
  { code: "sharp-shooter", test: (s) => s.quizAccuracy >= 100 && s.quizzesTaken >= 1 },
  { code: "streak-3", test: (_s, st) => st.current >= 3 },
  { code: "streak-7", test: (_s, st) => st.current >= 7 },
  { code: "streak-30", test: (_s, st) => st.current >= 30 },
  { code: "flashcard-50", test: (s) => s.flashcardsReviewed >= 50 },
  { code: "note-taker", test: (s) => s.notesCount >= 5 },
  { code: "explorer", test: (s) => s.subjectsTouched >= 3 },
  { code: "scholar", test: (s) => s.lessonsCompleted >= 25 },
];

export async function evaluateAchievements(userId: string): Promise<string[]> {
  const [stats, streak] = await Promise.all([getStats(userId), getStreak(userId)]);
  const all = await db.select().from(achievements);
  const owned = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));
  const ownedSet = new Set(owned.map((o) => o.achievementId));

  const unlocked: string[] = [];
  for (const rule of RULES) {
    const achievement = all.find((a) => a.code === rule.code);
    if (!achievement || ownedSet.has(achievement.id)) continue;
    if (rule.test(stats, streak)) {
      await db
        .insert(userAchievements)
        .values({ userId, achievementId: achievement.id })
        .onConflictDoNothing();
      unlocked.push(achievement.name);
    }
  }
  return unlocked;
}

export async function getUserAchievements(userId: string) {
  const rows = await db
    .select({ achievement: achievements, unlockedAt: userAchievements.unlockedAt })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt));
  return rows.map((r) => ({ ...r.achievement, unlockedAt: r.unlockedAt }));
}

/* ------------------------------- continue ------------------------------ */

export async function getContinueLearning(userId: string, limit = 3) {
  // Chapters the learner has touched most recently, then the next unfinished lesson.
  const completed = await db
    .select({ lessonId: lessonProgress.lessonId, chapterId: chapters.id })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(eq(lessonProgress.userId, userId))
    .orderBy(desc(lessonProgress.completedAt))
    .limit(60);

  const done = new Set(completed.map((c) => c.lessonId));
  const chapterIds = [...new Set(completed.map((c) => c.chapterId))];

  const shape = {
    lessonId: lessons.id,
    title: lessons.title,
    minutes: lessons.minutes,
    chapterId: chapters.id,
    chapterTitle: chapters.title,
    subjectName: subjects.name,
    subjectIcon: subjects.icon,
    subjectSlug: subjects.slug,
    chapterSlug: chapters.slug,
    lessonSlug: lessons.slug,
  };

  if (!chapterIds.length) {
    const fresh = await db
      .select(shape)
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
      .orderBy(subjects.sortOrder, chapters.sortOrder, lessons.sortOrder)
      .limit(limit);
    return fresh.map((f) => ({ ...f, reason: "Recommended start" }));
  }

  const rows = await db
    .select(shape)
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
    .where(inArray(chapters.id, chapterIds.slice(0, limit)))
    .orderBy(lessons.sortOrder);

  const out: typeof rows = [];
  for (const chapterId of chapterIds.slice(0, limit)) {
    const next = rows.find((r) => r.chapterId === chapterId && !done.has(r.lessonId));
    if (next) out.push(next);
  }

  if (!out.length) {
    const fallback = await db
      .select(shape)
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
      .orderBy(sql`random()`)
      .limit(limit);
    return fallback.map((f) => ({ ...f, reason: "Explore something new" }));
  }

  return out.map((o) => ({ ...o, reason: "Continue where you left off" }));
}

/* ------------------------------ question bank -------------------------- */

export async function getQuestionBank(): Promise<
  Record<string, { prompt: string; options: string[]; answerIndex: number; explanation: string }[]>
> {
  await ensureSeeded();
  const rows = await db
    .select({
      prompt: quizQuestions.prompt,
      options: quizQuestions.options,
      answerIndex: quizQuestions.answerIndex,
      explanation: quizQuestions.explanation,
      subjectSlug: subjects.slug,
    })
    .from(quizQuestions)
    .innerJoin(subjects, eq(quizQuestions.subjectId, subjects.id));

  const bank: Record<string, { prompt: string; options: string[]; answerIndex: number; explanation: string }[]> = {};
  for (const row of rows) {
    (bank[row.subjectSlug] ??= []).push({
      prompt: row.prompt,
      options: row.options,
      answerIndex: row.answerIndex,
      explanation: row.explanation,
    });
  }
  return bank;
}

/* ------------------------------- quizzes ------------------------------- */

export async function getQuizWithQuestions(quizId: string) {
  const quiz = await db.query.quizzes.findFirst({ where: eq(quizzes.id, quizId) });
  if (!quiz) return null;
  const items = await db
    .select({ question: quizQuestions })
    .from(quizItems)
    .innerJoin(quizQuestions, eq(quizItems.questionId, quizQuestions.id))
    .where(eq(quizItems.quizId, quizId))
    .orderBy(quizItems.sortOrder);
  return { quiz, questions: items.map((i) => i.question) };
}

export async function getQuizById(quizId: string) {
  return db.query.quizzes.findFirst({ where: eq(quizzes.id, quizId) });
}

export { db };
