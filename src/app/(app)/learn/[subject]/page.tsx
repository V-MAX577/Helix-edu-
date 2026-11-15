import Link from "next/link";
import { notFound } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { chapters, flashcards, lessonProgress, lessons, quizzes, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded } from "@/lib/progress";
import { Chip, Panel, ProgressBar } from "@/components/ui";
import { SubjectChatLink } from "../subject-chat-link";

export const dynamic = "force-dynamic";

const LEVEL_TONE: Record<string, "emerald" | "accent" | "gold"> = {
  beginner: "emerald",
  intermediate: "accent",
  advanced: "gold",
};

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: slug } = await params;
  const user = await getLearner();
  await ensureSeeded();

  const subject = await db.query.subjects.findFirst({ where: eq(subjects.slug, slug) });
  if (!subject) notFound();

  const chapterRows = await db
    .select()
    .from(chapters)
    .where(eq(chapters.subjectId, subject.id))
    .orderBy(chapters.sortOrder);

  const allLessons = await db
    .select({
      id: lessons.id,
      chapterId: lessons.chapterId,
      slug: lessons.slug,
      title: lessons.title,
      minutes: lessons.minutes,
      sortOrder: lessons.sortOrder,
    })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(eq(chapters.subjectId, subject.id))
    .orderBy(lessons.sortOrder);

  const progressRows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, user.id));
  const done = new Set(progressRows.map((p) => p.lessonId));

  const cardCount = await db
    .select({ n: count() })
    .from(flashcards)
    .where(eq(flashcards.subjectId, subject.id));

  const subjectQuizzes = await db
    .select({ id: quizzes.id, title: quizzes.title, description: quizzes.description, difficulty: quizzes.difficulty, timeLimitSec: quizzes.timeLimitSec })
    .from(quizzes)
    .where(eq(quizzes.subjectId, subject.id))
    .orderBy(quizzes.sortOrder);

  const totalLessons = allLessons.length;
  const doneLessons = allLessons.filter((l) => done.has(l.id)).length;
  const percent = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(168,85,247,0.24), transparent 45%), radial-gradient(circle at 90% 100%, rgba(34,211,238,0.16), transparent 45%)",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <Link href="/learn" className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
              ← Learning Centre
            </Link>
            <div className="mt-2 flex items-center gap-3">
              <span aria-hidden className="grid size-14 place-items-center rounded-2xl bg-[rgba(168,85,247,0.16)] text-3xl">
                {subject.icon}
              </span>
              <div>
                <h1 className="text-[clamp(1.5rem,3.4vw,2.2rem)] leading-tight font-extrabold tracking-tight">
                  {subject.name}
                </h1>
                <p className="text-sm text-[var(--text-muted)]">{subject.tagline}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip tone="accent">
                {chapterRows.length} chapters
              </Chip>
              <Chip>{totalLessons} lessons</Chip>
              <Chip>{Number(cardCount[0]?.n ?? 0)} flashcards</Chip>
              <Chip tone="cyan">{subjectQuizzes.length} quizzes</Chip>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <SubjectChatLink subject={subject.name} slug={subject.slug} />
              <Link href="/flashcards" className="btn btn-ghost btn-sm">
                🃏 Study flashcards
              </Link>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <ProgressBar value={doneLessons} max={totalLessons || 1} label="Subject progress" />
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {doneLessons} of {totalLessons} lessons completed ({percent}%)
            </p>
          </div>
        </div>
      </Panel>

      {/* Chapters */}
      <section className="grid gap-4">
        <h2 className="text-xl font-bold tracking-tight">Chapters</h2>
        {chapterRows.map((chapter, index) => {
          const chapterLessons = allLessons.filter((l) => l.chapterId === chapter.id);
          const chapterDone = chapterLessons.filter((l) => done.has(l.id)).length;
          const chapterPercent = chapterLessons.length
            ? Math.round((chapterDone / chapterLessons.length) * 100)
            : 0;
          return (
            <Panel key={chapter.id} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-gradient text-sm font-extrabold tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-bold">{chapter.title}</h3>
                    <Chip tone={LEVEL_TONE[chapter.level] ?? "accent"}>{chapter.level}</Chip>
                  </div>
                  <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-muted)]">{chapter.summary}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    ~{chapter.minutes} minutes · {chapterLessons.length} lessons ·{" "}
                    {chapterDone}/{chapterLessons.length} complete
                  </p>
                </div>
                <div className="w-full max-w-[10rem]">
                  <ProgressBar value={chapterDone} max={chapterLessons.length || 1} />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {chapterLessons.map((lesson) => {
                  const isDone = done.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${subject.slug}/${chapter.slug}/${lesson.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-[var(--panel-border)] p-3 transition hover:border-[var(--accent)]"
                      style={isDone ? { borderColor: "rgba(16,185,129,0.35)" } : undefined}
                    >
                      <span
                        aria-hidden
                        className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold"
                        style={{
                          background: isDone ? "rgba(16,185,129,0.18)" : "rgba(168,85,247,0.14)",
                          color: isDone ? "#6ee7b7" : "var(--accent)",
                        }}
                      >
                        {isDone ? "✓" : "▶"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{lesson.title}</span>
                        <span className="block text-xs text-[var(--text-muted)]">{lesson.minutes} min</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </section>

      {/* Quizzes */}
      {subjectQuizzes.length > 0 && (
        <section className="grid gap-3">
          <h2 className="text-xl font-bold tracking-tight">Quizzes & Tests</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {subjectQuizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.id}`}
                className="panel flex flex-col gap-2 p-4 transition hover:-translate-y-0.5"
              >
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

      {/* Flashcards */}
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">🃏 {Number(cardCount[0]?.n ?? 0)} flashcards in {subject.name}</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Spaced repetition schedules cards you find hard more often, and cards you know less often.
          </p>
        </div>
        <Link href="/flashcards" className="btn btn-primary btn-sm">
          Start revising
        </Link>
      </Panel>
    </div>
  );
}
