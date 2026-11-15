import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { flashcards, lessons, quizQuestions, subjects } from "@/db/schema";
import type { LearnerStats } from "./progress";
import { getStreak } from "./progress";

export type DailyChallenge = {
  dayKey: string;
  question: { id: string; prompt: string; options: string[]; answerIndex: number; explanation: string } | null;
  flashcard: { id: string; front: string; back: string } | null;
  lesson: { id: string; title: string; subjectName: string; subjectSlug: string; chapterSlug: string; lessonSlug: string } | null;
  tasks: { id: string; label: string; target: number; done: number; href?: string }[];
};

function dayIndex(dayKey: string): number {
  let hash = 0;
  for (let i = 0; i < dayKey.length; i++) hash = (hash * 31 + dayKey.charCodeAt(i)) % 100000;
  return hash;
}

/**
 * Builds a deterministic daily challenge. The same student sees the same
 * challenge all day, and it changes at midnight.
 */
export async function getDailyChallenge(userId: string, stats: LearnerStats): Promise<DailyChallenge> {
  const dayKey = new Date().toISOString().slice(0, 10);
  const seed = dayIndex(dayKey);

  const questions = await db
    .select({
      id: quizQuestions.id,
      prompt: quizQuestions.prompt,
      options: quizQuestions.options,
      answerIndex: quizQuestions.answerIndex,
      explanation: quizQuestions.explanation,
    })
    .from(quizQuestions)
    .orderBy(sql`random()`)
    .limit(1);
  const question = questions[0] ?? null;

  const cards = await db
    .select({ id: flashcards.id, front: flashcards.front, back: flashcards.back })
    .from(flashcards)
    .orderBy(sql`random()`)
    .limit(1);
  const flashcard = cards[0] ?? null;

  const lessonRows = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      subjectName: subjects.name,
      subjectSlug: subjects.slug,
      chapterSlug: sql<string>`(select slug from chapters where id = ${lessons.chapterId})`,
      lessonSlug: lessons.slug,
    })
    .from(lessons)
    .innerJoin(sql`chapters`, sql`chapters.id = ${lessons.chapterId}`)
    .innerJoin(subjects, sql`subjects.id = chapters.subject_id`)
    .orderBy(sql`random()`)
    .limit(1);
  const lesson = lessonRows[0] ?? null;

  const streak = await getStreak(userId);

  return {
    dayKey,
    question,
    flashcard,
    lesson,
    tasks: [
      {
        id: "question",
        label: "Answer today's question correctly",
        target: 1,
        done: 0,
        href: "/quizzes",
      },
      {
        id: "flashcards",
        label: "Review 5 flashcards",
        target: 5,
        done: Math.min(5, stats.flashcardsReviewed > 0 ? Math.min(5, Math.floor(stats.flashcardsReviewed / 10) + 1) : 0),
        href: "/flashcards",
      },
      {
        id: "lesson",
        label: "Complete a lesson",
        target: 1,
        done: 0,
        href: lesson ? `/learn/${lesson.subjectSlug}/${lesson.chapterSlug}` : "/learn",
      },
      {
        id: "goal",
        label: `Reach your daily goal of ${stats.dailyGoalMinutes} minutes`,
        target: stats.dailyGoalMinutes,
        done: stats.todayMinutes,
      },
      {
        id: "streak",
        label: "Keep your streak alive",
        target: 1,
        done: streak.current > 0 ? 1 : 0,
      },
    ],
  };
}

/** Rotating "question of the day" list used on the dashboard. */
export async function getQuizOfTheDay() {
  const rows = await db
    .select({
      id: quizQuestions.id,
      prompt: quizQuestions.prompt,
      options: quizQuestions.options,
      answerIndex: quizQuestions.answerIndex,
      explanation: quizQuestions.explanation,
      subjectSlug: subjects.slug,
    })
    .from(quizQuestions)
    .innerJoin(subjects, eq(quizQuestions.subjectId, subjects.id))
    .orderBy(sql`random()`)
    .limit(3);
  return rows;
}
