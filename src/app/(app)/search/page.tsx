import Link from "next/link";
import { eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { chapters, flashcards, lessons, quizzes, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded } from "@/lib/progress";
import { searchTopics } from "@/lib/knowledge";
import { Chip, EmptyState, Panel } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search lessons" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getLearner();
  await ensureSeeded();
  const { q = "" } = await searchParams;
  const query = q.trim();
  const like = `%${query}%`;

  const [lessonHits, chapterHits, cardHits, quizHits, topicHits] = query
    ? await Promise.all([
        db
          .select({
            id: lessons.id,
            title: lessons.title,
            slug: lessons.slug,
            subjectName: subjects.name,
            subjectSlug: subjects.slug,
            subjectIcon: subjects.icon,
            chapterSlug: chapters.slug,
            chapterTitle: chapters.title,
            minutes: lessons.minutes,
          })
          .from(lessons)
          .innerJoin(chapters, eq1())
          .innerJoin(subjects, eq2())
          .where(or(ilike(lessons.title, like), ilike(chapters.title, like), ilike(subjects.name, like)))
          .limit(20),
        db
          .select({ id: chapters.id, title: chapters.title, slug: chapters.slug, summary: chapters.summary, subjectName: subjects.name, subjectSlug: subjects.slug, subjectIcon: subjects.icon })
          .from(chapters)
          .innerJoin(subjects, eq2())
          .where(or(ilike(chapters.title, like), ilike(chapters.summary, like), ilike(subjects.name, like)))
          .limit(10),
        db
          .select({ id: flashcards.id, front: flashcards.front, back: flashcards.back, subjectName: subjects.name, subjectSlug: subjects.slug })
          .from(flashcards)
          .innerJoin(subjects, eq2())
          .where(or(ilike(flashcards.front, like), ilike(flashcards.back, like)))
          .limit(12),
        db
          .select({ id: quizzes.id, title: quizzes.title, description: quizzes.description, subjectName: subjects.name })
          .from(quizzes)
          .innerJoin(subjects, eq2())
          .where(or(ilike(quizzes.title, like), ilike(quizzes.description, like)))
          .limit(10),
        Promise.resolve(searchTopics(query).slice(0, 6)),
      ])
    : [[], [], [], [], []];

  const total =
    lessonHits.length + chapterHits.length + cardHits.length + quizHits.length + topicHits.length;

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <Panel>
        <h1 className="text-[clamp(1.5rem,3.4vw,2.2rem)] leading-tight font-extrabold tracking-tight">
          🔍 Search <span className="text-gradient">lessons</span>
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Search across every lesson, chapter, flashcard, quiz and knowledge-base topic.
        </p>
        <form className="mt-4 flex flex-wrap gap-2" action="/search">
          <input
            name="q"
            defaultValue={query}
            placeholder="e.g. photosynthesis, fractions, quadratic…"
            className="field max-w-md flex-1"
            autoFocus
            aria-label="Search query"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </Panel>

      {!query && (
        <EmptyState
          icon="🔍"
          title="Search the whole curriculum"
          message="Type a topic, chapter or keyword above. Results are grouped by content type."
        />
      )}

      {query && total === 0 && (
        <EmptyState
          icon="🛰️"
          title={`No results for “${query}”`}
          message="Try a shorter keyword, or check the spelling. You can also ask the assistant directly."
          action={
            <Link href={`/assistant?q=${encodeURIComponent(query)}`} className="btn btn-primary btn-sm">
              🧠 Ask the assistant
            </Link>
          }
        />
      )}

      {lessonHits.length > 0 && (
        <section className="grid gap-2.5">
          <h2 className="text-lg font-bold">📘 Lessons ({lessonHits.length})</h2>
          {lessonHits.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/learn/${lesson.subjectSlug}/${lesson.chapterSlug}/${lesson.slug}`}
              className="panel flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5"
            >
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(168,85,247,0.16)] text-lg">
                {lesson.subjectIcon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{lesson.title}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">
                  {lesson.subjectName} · {lesson.chapterTitle} · {lesson.minutes} min
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-[var(--accent)]">Read →</span>
            </Link>
          ))}
        </section>
      )}

      {chapterHits.length > 0 && (
        <section className="grid gap-2.5">
          <h2 className="text-lg font-bold">📚 Chapters ({chapterHits.length})</h2>
          {chapterHits.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/learn/${chapter.subjectSlug}/${chapter.slug}`}
              className="panel flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5"
            >
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(34,211,238,0.16)] text-lg">
                {chapter.subjectIcon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{chapter.title}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">
                  {chapter.subjectName} · {chapter.summary}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-[var(--accent)]">Open →</span>
            </Link>
          ))}
        </section>
      )}

      {topicHits.length > 0 && (
        <section className="grid gap-2.5">
          <h2 className="text-lg font-bold">🧠 Knowledge topics ({topicHits.length})</h2>
          {topicHits.map(({ topic }) => (
            <Link
              key={topic.id}
              href={`/assistant?q=${encodeURIComponent(`Explain ${topic.title}`)}&mode=deep-think`}
              className="panel flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5"
            >
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(16,185,129,0.16)] text-lg">
                🧠
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{topic.title}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">
                  {topic.simple.slice(0, 110)}…
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-[var(--accent)]">Ask →</span>
            </Link>
          ))}
        </section>
      )}

      {quizHits.length > 0 && (
        <section className="grid gap-2.5">
          <h2 className="text-lg font-bold">📝 Quizzes ({quizHits.length})</h2>
          {quizHits.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/quizzes/${quiz.id}`}
              className="panel flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5"
            >
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(251,191,36,0.16)] text-lg">
                📝
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{quiz.title}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">{quiz.subjectName}</span>
              </span>
              <Chip tone="gold">Start</Chip>
            </Link>
          ))}
        </section>
      )}

      {cardHits.length > 0 && (
        <section className="grid gap-2.5">
          <h2 className="text-lg font-bold">🃏 Flashcards ({cardHits.length})</h2>
          {cardHits.map((card) => (
            <div key={card.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{card.front}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{card.back}</p>
                </div>
                <Chip tone="cyan">{card.subjectName}</Chip>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function eq1() {
  return eq(lessons.chapterId, chapters.id);
}

function eq2() {
  return eq(chapters.subjectId, subjects.id);
}
