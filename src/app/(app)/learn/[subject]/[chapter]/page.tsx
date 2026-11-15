import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chapters, flashcards, lessonProgress, lessons, quizzes, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded } from "@/lib/progress";
import { Chip, Panel, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ subject: string; chapter: string }>;
}) {
  const { subject: subjectSlug, chapter: chapterSlug } = await params;
  const user = await getLearner();
  await ensureSeeded();

  const chapter = await db.query.chapters.findFirst({ where: eq(chapters.slug, chapterSlug) });
  if (!chapter) notFound();
  const subject = await db.query.subjects.findFirst({ where: eq(subjects.id, chapter.subjectId) });
  if (!subject || subject.slug !== subjectSlug) notFound();

  const [lessonRows, cardRows, progressRows] = await Promise.all([
    db.select().from(lessons).where(eq(lessons.chapterId, chapter.id)).orderBy(lessons.sortOrder),
    db
      .select({ id: flashcards.id, front: flashcards.front, back: flashcards.back, hint: flashcards.hint })
      .from(flashcards)
      .where(eq(flashcards.chapterId, chapter.id))
      .orderBy(flashcards.sortOrder),
    db.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress).where(eq(lessonProgress.userId, user.id)),
  ]);

  const done = new Set(progressRows.map((p) => p.lessonId));
  const doneCount = lessonRows.filter((l) => done.has(l.id)).length;
  const percent = lessonRows.length ? Math.round((doneCount / lessonRows.length) * 100) : 0;

  const relatedQuizzes = await db
    .select({ id: quizzes.id, title: quizzes.title, description: quizzes.description, difficulty: quizzes.difficulty, timeLimitSec: quizzes.timeLimitSec })
    .from(quizzes)
    .where(eq(quizzes.subjectId, subject.id))
    .orderBy(quizzes.sortOrder);

  const firstLesson = lessonRows[0];

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 12% 0%, rgba(34,211,238,0.18), transparent 45%), radial-gradient(circle at 88% 100%, rgba(168,85,247,0.2), transparent 45%)",
          }}
        />
        <div className="relative">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Link href="/learn" className="hover:text-[var(--text)]">
              Learning Centre
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/learn/${subject.slug}`} className="hover:text-[var(--text)]">
              {subject.icon} {subject.name}
            </Link>
          </nav>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(1.5rem,3.4vw,2.2rem)] leading-tight font-extrabold tracking-tight">
                {chapter.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">{chapter.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone="accent">{chapter.level}</Chip>
                <Chip>~{chapter.minutes} min</Chip>
                <Chip>{lessonRows.length} lessons</Chip>
                <Chip tone="cyan">{cardRows.length} flashcards</Chip>
              </div>
            </div>
            <div className="w-full max-w-[12rem]">
              <ProgressBar value={doneCount} max={lessonRows.length || 1} label="Chapter progress" />
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                {doneCount}/{lessonRows.length} lessons complete
              </p>
            </div>
          </div>
          {firstLesson && (
            <Link
              href={`/learn/${subject.slug}/${chapter.slug}/${firstLesson.slug}`}
              className="btn btn-primary btn-sm mt-4"
            >
              {doneCount > 0 ? "Continue chapter →" : "Start chapter →"}
            </Link>
          )}
        </div>
      </Panel>

      <section className="grid gap-3">
        <h2 className="text-xl font-bold tracking-tight">Lessons</h2>
        <div className="grid gap-2">
          {lessonRows.map((lesson, index) => {
            const isDone = done.has(lesson.id);
            return (
              <Link
                key={lesson.id}
                href={`/learn/${subject.slug}/${chapter.slug}/${lesson.slug}`}
                className="panel flex items-center gap-4 p-4 transition hover:-translate-y-0.5"
              >
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold"
                  style={{
                    background: isDone ? "rgba(16,185,129,0.18)" : "rgba(168,85,247,0.14)",
                    color: isDone ? "#6ee7b7" : "var(--accent)",
                  }}
                >
                  {isDone ? "✓" : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{lesson.title}</span>
                  <span className="block text-xs text-[var(--text-muted)]">{lesson.minutes} minute read</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-[var(--accent)]">
                  {isDone ? "Revisit" : "Read"} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {cardRows.length > 0 && (
        <section className="grid gap-3">
          <h2 className="text-xl font-bold tracking-tight">Chapter flashcards</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {cardRows.map((card) => (
              <div key={card.id} className="panel p-4">
                <div className="text-[0.68rem] tracking-[0.16em] text-[var(--text-muted)] uppercase">Question</div>
                <p className="mt-1 text-sm font-semibold">{card.front}</p>
                <div className="mt-3 text-[0.68rem] tracking-[0.16em] text-[var(--text-muted)] uppercase">Answer</div>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{card.back}</p>
              </div>
            ))}
          </div>
          <Link href="/flashcards" className="btn btn-ghost btn-sm w-fit">
            🃏 Practise with spaced repetition
          </Link>
        </section>
      )}

      {relatedQuizzes.length > 0 && (
        <section className="grid gap-3">
          <h2 className="text-xl font-bold tracking-tight">Test yourself</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedQuizzes.map((quiz) => (
              <Link key={quiz.id} href={`/quizzes/${quiz.id}`} className="panel flex flex-col gap-2 p-4 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">{quiz.title}</h3>
                  <Chip tone={quiz.difficulty === "easy" ? "emerald" : quiz.difficulty === "hard" ? "gold" : "accent"}>
                    {quiz.difficulty}
                  </Chip>
                </div>
                <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{quiz.description}</p>
                <span className="mt-auto text-xs text-[var(--text-muted)]">
                  ⏱ {Math.round(quiz.timeLimitSec / 60)} minutes · auto-marked
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
