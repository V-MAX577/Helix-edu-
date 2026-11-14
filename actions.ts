"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bookmarks,
  chapters,
  chatSessions,
  flashcards,
  flashcardReviews,
  lessonProgress,
  lessons,
  notes,
  profiles,
  quizAttempts,
  quizItems,
  quizQuestions,
  quizzes,
  reminders,
  studyPlans,
  subjects,
  users,
} from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { evaluateAchievements, ensureSeeded, getQuizWithQuestions, logStudy } from "@/lib/progress";

/* ------------------------------------------------------------------ */
/*  Profile & settings                                                */
/* ------------------------------------------------------------------ */

export async function updateProfileAction(formData: FormData) {
  const user = await getLearner();
  await db
    .update(users)
    .set({ name: String(formData.get("name") ?? "").trim() || user.name })
    .where(eq(users.id, user.id));

  await db
    .insert(profiles)
    .values({
      userId: user.id,
      board: String(formData.get("board") ?? "Maharashtra State Board"),
      className: String(formData.get("className") ?? "Class 10"),
      level: String(formData.get("level") ?? "intermediate"),
      dailyGoalMinutes: Number(formData.get("dailyGoalMinutes") ?? 30),
      fontScale: Number(formData.get("fontScale") ?? 100),
      theme: String(formData.get("theme") ?? "cosmos"),
      reduceMotion: formData.get("reduceMotion") === "on",
      avatar: String(formData.get("avatar") ?? "🚀"),
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        board: String(formData.get("board") ?? "Maharashtra State Board"),
        className: String(formData.get("className") ?? "Class 10"),
        level: String(formData.get("level") ?? "intermediate"),
        dailyGoalMinutes: Number(formData.get("dailyGoalMinutes") ?? 30),
        fontScale: Number(formData.get("fontScale") ?? 100),
        theme: String(formData.get("theme") ?? "cosmos"),
        reduceMotion: formData.get("reduceMotion") === "on",
        avatar: String(formData.get("avatar") ?? "🚀"),
      },
    });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

/* ------------------------------------------------------------------ */
/*  Lessons                                                           */
/* ------------------------------------------------------------------ */

export async function completeLessonAction(lessonId: string, minutes = 1) {
  const user = await getLearner();
  await ensureSeeded();
  await db
    .insert(lessonProgress)
    .values({ userId: user.id, lessonId, seconds: minutes * 60 })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { seconds: sql`${lessonProgress.seconds} + ${minutes * 60}`, completedAt: new Date() },
    });
  await logStudy(user.id, minutes);
  const unlocked = await evaluateAchievements(user.id);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  revalidatePath("/learn", "layout");
  return { unlocked };
}

/* ------------------------------------------------------------------ */
/*  Flashcards — Leitner spaced repetition                            */
/* ------------------------------------------------------------------ */

export async function reviewFlashcardAction(flashcardId: string, correct: boolean) {
  const user = await getLearner();
  const existing = await db
    .select()
    .from(flashcardReviews)
    .where(and(eq(flashcardReviews.userId, user.id), eq(flashcardReviews.flashcardId, flashcardId)))
    .limit(1);

  const current = existing[0];
  const box = current ? current.box : 1;
  const nextBox = correct ? Math.min(5, box + 1) : 1;
  const intervalDays = [0, 1, 2, 4, 8, 16][nextBox];

  await db
    .insert(flashcardReviews)
    .values({
      userId: user.id,
      flashcardId,
      box: nextBox,
      seen: 1,
      correct: correct ? 1 : 0,
      dueAt: new Date(Date.now() + intervalDays * 86_400_000),
    })
    .onConflictDoUpdate({
      target: [flashcardReviews.userId, flashcardReviews.flashcardId],
      set: {
        box: nextBox,
        seen: sql`${flashcardReviews.seen} + 1`,
        correct: sql`${flashcardReviews.correct} + ${correct ? 1 : 0}`,
        dueAt: new Date(Date.now() + intervalDays * 86_400_000),
        lastReviewedAt: new Date(),
      },
    });

  await logStudy(user.id, 1);
  return { box: nextBox, dueInDays: intervalDays };
}

/* ------------------------------------------------------------------ */
/*  Quizzes                                                           */
/* ------------------------------------------------------------------ */

export async function submitQuizAction(quizId: string, answers: Record<string, number>, seconds: number) {
  const user = await getLearner();
  const data = await getQuizWithQuestions(quizId);
  if (!data) return { error: "Quiz not found." };

  let score = 0;
  const detail = data.questions.map((question) => {
    const chosen = answers[question.id];
    const isCorrect = chosen === question.answerIndex;
    if (isCorrect) score++;
    return {
      questionId: question.id,
      prompt: question.prompt,
      options: question.options,
      chosen: chosen ?? -1,
      answerIndex: question.answerIndex,
      explanation: question.explanation,
      correct: isCorrect,
    };
  });

  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      userId: user.id,
      quizId,
      answers,
      score,
      total: data.questions.length,
      seconds,
    })
    .returning();

  await logStudy(user.id, Math.max(1, Math.round(seconds / 60)));
  const unlocked = await evaluateAchievements(user.id);
  revalidatePath("/quizzes");
  revalidatePath("/progress");
  revalidatePath("/dashboard");

  return {
    attemptId: attempt.id,
    score,
    total: data.questions.length,
    percent: data.questions.length ? Math.round((score / data.questions.length) * 100) : 0,
    detail,
    unlocked,
  };
}

/* ------------------------------------------------------------------ */
/*  Notes                                                             */
/* ------------------------------------------------------------------ */

export async function saveNoteAction(formData: FormData) {
  const user = await getLearner();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim() || "Untitled note";
  const body = String(formData.get("body") ?? "");

  if (id) {
    await db
      .update(notes)
      .set({ title, body, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  } else {
    await db.insert(notes).values({
      userId: user.id,
      title,
      body,
      subjectSlug: String(formData.get("subjectSlug") ?? "") || null,
      chapterSlug: String(formData.get("chapterSlug") ?? "") || null,
    });
  }
  await logStudy(user.id, 1);
  await evaluateAchievements(user.id);
  revalidatePath("/notes");
  return { ok: true };
}

export async function deleteNoteAction(id: string) {
  const user = await getLearner();
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, user.id)));
  revalidatePath("/notes");
}

export async function toggleNotePinAction(id: string) {
  const user = await getLearner();
  const [note] = await db
    .select({ pinned: notes.pinned })
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .limit(1);
  if (note) {
    await db.update(notes).set({ pinned: !note.pinned }).where(eq(notes.id, id));
  }
  revalidatePath("/notes");
}

/* ------------------------------------------------------------------ */
/*  Bookmarks                                                         */
/* ------------------------------------------------------------------ */

export async function toggleBookmarkAction(input: {
  targetType: string;
  targetId: string;
  title: string;
  href: string;
  subtitle?: string;
}) {
  const user = await getLearner();
  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, user.id),
        eq(bookmarks.targetType, input.targetType),
        eq(bookmarks.targetId, input.targetId),
      ),
    )
    .limit(1);

  if (existing.length) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
    revalidatePath("/bookmarks");
    return { bookmarked: false };
  }

  await db.insert(bookmarks).values({
    userId: user.id,
    targetType: input.targetType,
    targetId: input.targetId,
    title: input.title,
    href: input.href,
    subtitle: input.subtitle ?? "",
  });
  revalidatePath("/bookmarks");
  return { bookmarked: true };
}

export async function removeBookmarkAction(id: string) {
  const user = await getLearner();
  await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, user.id)));
  revalidatePath("/bookmarks");
}

/* ------------------------------------------------------------------ */
/*  Study planner                                                     */
/* ------------------------------------------------------------------ */

export async function createPlanAction(formData: FormData) {
  const user = await getLearner();
  const title = String(formData.get("title") ?? "").trim() || "My study plan";
  const examDate = String(formData.get("examDate") ?? "") || null;
  const minutesPerDay = Math.max(15, Math.min(480, Number(formData.get("minutesPerDay") ?? 45)));
  const subjectSlugs = formData.getAll("subjects").map((s) => String(s));
  const days = Math.max(1, Math.min(30, Number(formData.get("days") ?? 7)));

  if (!subjectSlugs.length) return { error: "Choose at least one subject." };

  const chosen = await db
    .select()
    .from(subjects)
    .where(inArray(subjects.slug, subjectSlugs))
    .orderBy(subjects.sortOrder);
  if (!chosen.length) return { error: "Those subjects could not be found." };

  // Build a real rotating plan from the actual chapters that exist.
  const chapterRows = await db
    .select({ id: chapters.id, title: chapters.title, minutes: chapters.minutes, subjectSlug: subjects.slug, subjectName: subjects.name })
    .from(chapters)
    .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
    .where(inArray(subjects.slug, subjectSlugs))
    .orderBy(subjects.sortOrder, chapters.sortOrder);

  const plan = [];
  const blocks = Math.max(1, Math.round(minutesPerDay / 30));
  for (let i = 0; i < days; i++) {
    const subject = chosen[i % chosen.length];
    const subjectChapters = chapterRows.filter((c) => c.subjectSlug === subject.slug);
    const focusChapters = subjectChapters.length
      ? subjectChapters
      : [{ id: subject.slug, title: `${subject.name} — revision`, minutes: minutesPerDay, subjectSlug: subject.slug, subjectName: subject.name }];
    const blocksForDay = [];
    for (let b = 0; b < blocks; b++) {
      const chapter = focusChapters[(i * blocks + b) % focusChapters.length];
      blocksForDay.push({
        minutes: Math.round(minutesPerDay / blocks),
        activity: b % 3 === 0 ? "Read the lesson and take notes" : b % 3 === 1 ? "Revise flashcards" : "Attempt the quiz",
        subject: subject.name,
        chapter: chapter.title,
      });
    }
    plan.push({
      day: new Date(Date.now() + i * 86_400_000).toISOString().slice(0, 10),
      focus: `${subject.name} — ${focusChapters[(i * blocks) % focusChapters.length].title}`,
      blocks: blocksForDay,
    });
  }

  await db.update(studyPlans).set({ active: false }).where(eq(studyPlans.userId, user.id));
  await db.insert(studyPlans).values({
    userId: user.id,
    title,
    examDate,
    subjects: chosen.map((c) => c.slug),
    minutesPerDay,
    plan,
    active: true,
  });

  revalidatePath("/planner");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deletePlanAction(id: string) {
  const user = await getLearner();
  await db.delete(studyPlans).where(and(eq(studyPlans.id, id), eq(studyPlans.userId, user.id)));
  revalidatePath("/planner");
}

/* ------------------------------------------------------------------ */
/*  Reminders                                                         */
/* ------------------------------------------------------------------ */


export async function addReminderAction(formData: FormData) {
  const user = await getLearner();
  const label = String(formData.get("label") ?? "").trim() || "Study time";
  const time = String(formData.get("time") ?? "18:00");
  const days = formData
    .getAll("days")
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  if (!days.length) return { error: "Pick at least one day." };

  await db.insert(reminders).values({ userId: user.id, label, time, days });
  revalidatePath("/reminders");
  return { ok: true, days };
}

export async function toggleReminderAction(id: string) {
  const user = await getLearner();
  const [reminder] = await db
    .select({ enabled: reminders.enabled })
    .from(reminders)
    .where(and(eq(reminders.id, id), eq(reminders.userId, user.id)))
    .limit(1);
  if (reminder) await db.update(reminders).set({ enabled: !reminder.enabled }).where(eq(reminders.id, id));
  revalidatePath("/reminders");
}

export async function deleteReminderAction(id: string) {
  const user = await getLearner();
  await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, user.id)));
  revalidatePath("/reminders");
}

/* ------------------------------------------------------------------ */
/*  Chat sessions                                                     */
/* ------------------------------------------------------------------ */

export async function newChatAction(mode: string) {
  const user = await getLearner();
  const [session] = await db
    .insert(chatSessions)
    .values({ userId: user.id, mode, title: "New chat" })
    .returning();
  revalidatePath("/assistant");
  return { id: session.id };
}

export async function deleteChatAction(id: string) {
  const user = await getLearner();
  await db.delete(chatSessions).where(and(eq(chatSessions.id, id), eq(chatSessions.userId, user.id)));
  revalidatePath("/assistant");
}

export async function setChatModeAction(id: string, mode: string) {
  const user = await getLearner();
  await db
    .update(chatSessions)
    .set({ mode, updatedAt: new Date() })
    .where(and(eq(chatSessions.id, id), eq(chatSessions.userId, user.id)));
  revalidatePath("/assistant");
}

/* ------------------------------------------------------------------ */
/*  Client-side study-time logger                                     */
/* ------------------------------------------------------------------ */

export async function logStudyMinutesAction(minutes: number) {
  const user = await getLearner();
  await logStudy(user.id, Math.max(1, Math.min(60, Math.round(minutes))));
  revalidatePath("/dashboard");
}

/* ------------------------------------------------------------------ */
/*  Misc                                                              */
/* ------------------------------------------------------------------ */

export async function dailyChallengeDone() {
  const user = await getLearner();
  await logStudy(user.id, 5);
  const unlocked = await evaluateAchievements(user.id);
  revalidatePath("/dashboard");
  return { unlocked };
}


