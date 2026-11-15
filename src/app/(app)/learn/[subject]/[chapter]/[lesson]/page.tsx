import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  bookmarks,
  chapters,
  flashcards,
  lessonProgress,
  lessons,
  quizQuestions,
  subjects,
  type LessonBlock,
} from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded } from "@/lib/progress";
import { Chip, Panel } from "@/components/ui";
import { LessonActions } from "./lesson-actions";

export const dynamic = "force-dynamic";

function Block({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case "heading":
      return (
        <h2 className="mt-8 mb-3 text-xl font-bold tracking-tight first:mt-0">
          <span className="text-gradient">{block.text}</span>
        </h2>
      );
    case "paragraph":
      return <p className="my-3 text-[0.97rem] leading-relaxed text-[color-mix(in_srgb,var(--text)_90%,transparent)]">{block.text}</p>;
    case "list":
      return block.ordered ? (
        <ol className="my-3 grid gap-1.5 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[0.95rem]">
              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[rgba(168,85,247,0.16)] text-xs font-bold text-[var(--accent)]">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-3 grid gap-1.5 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[0.95rem]">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent-2)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "example":
      return (
        <div className="my-4 rounded-2xl border-l-[3px] border-l-[var(--accent-2)] bg-[rgba(34,211,238,0.09)] p-4">
          {block.title && <div className="mb-1.5 text-xs font-bold tracking-[0.14em] text-[var(--accent-2)] uppercase">{block.title}</div>}
          <p className="text-[0.95rem]">{block.text}</p>
        </div>
      );
    case "tip":
      return (
        <div className="my-4 flex gap-3 rounded-2xl border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.1)] p-4">
          <span aria-hidden className="text-lg">
            💡
          </span>
          <p className="text-[0.92rem] text-[#a7f3d0]">{block.text}</p>
        </div>
      );
    case "formula":
      return (
        <div className="my-4 overflow-x-auto rounded-2xl border border-[var(--panel-border)] bg-[#0b0820] px-4 py-3">
          <code className="font-mono text-[0.95rem] text-[#e9d5ff]">{block.text}</code>
        </div>
      );
    case "code":
      return (
        <div className="my-4 overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[#0b0820]">
          <div className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-2">
            <span className="text-[0.68rem] font-bold tracking-[0.16em] text-[var(--text-muted)] uppercase">{block.lang}</span>
            <span className="text-[0.68rem] text-[var(--text-muted)]">runnable example</span>
          </div>
          <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.82rem] leading-relaxed text-[#e9e4ff]">
            <code>{block.code}</code>
          </pre>
        </div>
      );
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subject: string; chapter: string; lesson: string }>;
}) {
  const { subject: subjectSlug, chapter: chapterSlug, lesson: lessonSlug } = await params;
  const user = await getLearner();
  await ensureSeeded();

  const lesson = await db.query.lessons.findFirst({ where: eq(lessons.slug, lessonSlug) });
  if (!lesson) notFound();
  const chapter = await db.query.chapters.findFirst({ where: eq(chapters.id, lesson.chapterId) });
  if (!chapter || chapter.slug !== chapterSlug) notFound();
  const subject = await db.query.subjects.findFirst({ where: eq(subjects.id, chapter.subjectId) });
  if (!subject || subject.slug !== subjectSlug) notFound();

  const [siblings, progressRow, bookmarkRow, chapterCards, relatedQuestions] = await Promise.all([
    db.select({ id: lessons.id, slug: lessons.slug, title: lessons.title }).from(lessons).where(eq(lessons.chapterId, chapter.id)).orderBy(lessons.sortOrder),
    db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lesson.id)))
      .limit(1),
    db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.targetType, "lesson"),
          eq(bookmarks.targetId, lesson.id),
        ),
      )
      .limit(1),
    db.select({ front: flashcards.front, back: flashcards.back }).from(flashcards).where(eq(flashcards.chapterId, chapter.id)).limit(3),
    db
      .select({ prompt: quizQuestions.prompt, options: quizQuestions.options, answerIndex: quizQuestions.answerIndex, explanation: quizQuestions.explanation })
      .from(quizQuestions)
      .where(eq(quizQuestions.chapterId, chapter.id))
      .limit(2),
  ]);

  const index = siblings.findIndex((s) => s.slug === lessonSlug);
  const prev = index > 0 ? siblings[index - 1] : undefined;
  const next = index < siblings.length - 1 ? siblings[index + 1] : undefined;
  const base = `/learn/${subjectSlug}/${chapterSlug}`;

  return (
    <article className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_18rem]">
      <div className="grid gap-5">
        <Panel className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 5% 0%, rgba(168,85,247,0.2), transparent 40%), radial-gradient(circle at 95% 100%, rgba(34,211,238,0.12), transparent 40%)",
            }}
          />
          <div className="relative">
            <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Link href="/learn" className="hover:text-[var(--text)]">
                Learning Centre
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/learn/${subjectSlug}`} className="hover:text-[var(--text)]">
                {subject.icon} {subject.name}
              </Link>
              <span aria-hidden>/</span>
              <Link href={base} className="hover:text-[var(--text)]">
                {chapter.title}
              </Link>
            </nav>
            <h1 className="mt-3 text-[clamp(1.6rem,3.8vw,2.5rem)] leading-[1.1] font-extrabold tracking-tight">
              {lesson.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Chip tone="accent">{subject.name}</Chip>
              <Chip>{lesson.minutes} min read</Chip>
              <Chip tone={progressRow.length ? "emerald" : "default"}>
                {progressRow.length ? "Completed ✓" : "Not started"}
              </Chip>
              <Chip tone="cyan">{chapter.level}</Chip>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="grid gap-1">
            {lesson.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </Panel>

        <LessonActions
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          subjectSlug={subjectSlug}
          chapterSlug={chapterSlug}
          isDone={progressRow.length > 0}
          isBookmarked={bookmarkRow.length > 0}
          nextHref={next ? `${base}/${next.slug}` : undefined}
          prevHref={prev ? `${base}/${prev.slug}` : undefined}
        />

        {/* Chapter quiz questions as instant practice */}
        {relatedQuestions.length > 0 && (
          <Panel>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <span aria-hidden>❓</span> Check your understanding
            </h2>
            <div className="grid gap-3">
              {relatedQuestions.map((question, i) => (
                <details key={i} className="rounded-xl border border-[var(--panel-border)] p-3.5">
                  <summary className="cursor-pointer text-sm font-semibold">
                    {i + 1}. {question.prompt}
                  </summary>
                  <div className="mt-2.5 grid gap-1">
                    {question.options.map((option, oi) => (
                      <div
                        key={oi}
                        className="rounded-lg px-2.5 py-1.5 text-sm"
                        style={
                          oi === question.answerIndex
                            ? { background: "rgba(16,185,129,0.14)", color: "#a7f3d0" }
                            : undefined
                        }
                      >
                        <strong className="mr-1.5">{String.fromCharCode(65 + oi)}</strong>
                        {option}
                        {oi === question.answerIndex && " ✓"}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">{question.explanation}</p>
                </details>
              ))}
            </div>
            <Link href="/quizzes" className="btn btn-ghost btn-sm mt-3">
              Take a full timed quiz →
            </Link>
          </Panel>
        )}
      </div>

      {/* Chapter sidebar */}
      <aside className="grid gap-4 lg:sticky lg:top-20 lg:self-start">
        <Panel>
          <h2 className="mb-3 text-sm font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
            In this chapter
          </h2>
          <div className="grid gap-1">
            {siblings.map((sibling) => {
              const active = sibling.slug === lessonSlug;
              return (
                <Link
                  key={sibling.id}
                  href={`${base}/${sibling.slug}`}
                  className="nav-link text-[0.82rem]"
                  data-active={active}
                >
                  <span className="truncate">{sibling.title}</span>
                </Link>
              );
            })}
          </div>
          <Link href={base} className="btn btn-ghost btn-sm mt-3 w-full">
            Chapter overview
          </Link>
        </Panel>

        {chapterCards.length > 0 && (
          <Panel>
            <h2 className="mb-3 text-sm font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
              Flashcards from this chapter
            </h2>
            <div className="grid gap-2">
              {chapterCards.map((card, i) => (
                <div key={i} className="rounded-xl border border-[var(--panel-border)] p-3 text-xs">
                  <div className="font-semibold">{card.front}</div>
                  <div className="mt-1 text-[var(--text-muted)]">{card.back}</div>
                </div>
              ))}
            </div>
            <Link href="/flashcards" className="btn btn-ghost btn-sm mt-3 w-full">
              Revise all flashcards
            </Link>
          </Panel>
        )}

        <Panel>
          <h2 className="mb-2 text-sm font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
            Stuck on this?
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Ask the assistant about <strong>{chapter.title}</strong> and get a step-by-step explanation.
          </p>
          <Link
            href={`/assistant?q=${encodeURIComponent(`Explain ${lesson.title} in simple words`)}`}
            className="btn btn-primary btn-sm mt-3 w-full"
          >
            🧠 Ask the assistant
          </Link>
        </Panel>
      </aside>
    </article>
  );
}
