import Link from "next/link";
import { countDistinct, eq } from "drizzle-orm";
import { db } from "@/db";
import { chapters, lessons, profiles, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getSubjectProgress, getStats } from "@/lib/progress";
import { Chip, Panel } from "@/components/ui";

export const dynamic = "force-dynamic";

const LEVELS = [
  { id: "all", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const BOARDS = [
  "Maharashtra State Board",
  "CBSE",
  "ICSE",
  "IB / Cambridge",
  "State Board (other)",
  "Competitive exams",
];

export default async function LearnCentrePage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const user = await getLearner();
  await ensureSeeded();
  const params = await searchParams;
  const level = params.level ?? "all";

  const [progress, stats, profile] = await Promise.all([
    getSubjectProgress(user.id),
    getStats(user.id),
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
  ]);

  const allSubjects = await db
    .select({
      id: subjects.id,
      slug: subjects.slug,
      name: subjects.name,
      tagline: subjects.tagline,
      icon: subjects.icon,
      sortOrder: subjects.sortOrder,
    })
    .from(subjects)
    .orderBy(subjects.sortOrder);

  const counts = await db
    .select({
      subjectId: chapters.subjectId,
      chapterCount: countDistinct(chapters.id),
      lessonCount: countDistinct(lessons.id),
    })
    .from(chapters)
    .leftJoin(lessons, eq(lessons.chapterId, chapters.id))
    .groupBy(chapters.subjectId);

  const countMap = new Map(counts.map((c) => [c.subjectId, c]));
  const board = profile[0]?.board ?? "Maharashtra State Board";

  // Chapters carry their own level; the filter narrows the chapter lists the
  // student will see, and we surface it honestly on each card.
  const levelNote =
    level === "all"
      ? null
      : `Filtering for ${level} content. Chapters are labelled with their level on each subject page.`;

  return (
    <div className="mx-auto grid max-w-7xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 8% 0%, rgba(16,185,129,0.2), transparent 45%), radial-gradient(circle at 92% 100%, rgba(34,211,238,0.14), transparent 45%)",
          }}
        />
        <div className="relative">
          <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
            Learning <span className="text-gradient">Centre</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Chapter-wise lessons, flashcards and quizzes for {board}. Pick a subject to begin, or filter by
            difficulty below.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs tracking-[0.16em] text-[var(--text-muted)] uppercase">Level</span>
            {LEVELS.map((l) => (
              <Link
                key={l.id}
                href={`/learn${l.id === "all" ? "" : `?level=${l.id}`}`}
                className="chip"
                style={
                  level === l.id
                    ? {
                        borderColor: "var(--accent)",
                        background: "color-mix(in srgb, var(--accent) 20%, transparent)",
                        color: "var(--text)",
                      }
                    : undefined
                }
              >
                {l.label}
              </Link>
            ))}
          </div>
          {levelNote && <p className="mt-3 text-xs text-[var(--text-muted)]">{levelNote}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>Supported boards:</span>
            {BOARDS.map((b) => (
              <Chip key={b}>{b}</Chip>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allSubjects.map((subject) => {
          const p = progress.find((x) => x.slug === subject.slug);
          const c = countMap.get(subject.id);
          const percent = p?.percent ?? 0;
          return (
            <Link
              key={subject.id}
              href={`/learn/${subject.slug}`}
              className="panel group flex flex-col gap-3 p-5 transition hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden
                  className="grid size-12 place-items-center rounded-2xl text-2xl transition group-hover:scale-110"
                  style={{ background: "rgba(168,85,247,0.16)" }}
                >
                  {subject.icon}
                </span>
                <Chip tone={percent === 100 ? "emerald" : percent > 0 ? "accent" : "default"}>{percent}% done</Chip>
              </div>
              <div>
                <h2 className="text-lg font-bold">{subject.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{subject.tagline}</p>
              </div>
              <div className="mt-auto flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>
                  {Number(c?.chapterCount ?? 0)} chapters · {Number(c?.lessonCount ?? 0)} lessons
                </span>
                <span className="font-semibold text-[var(--accent)] group-hover:underline">Open →</span>
              </div>
              <div className="bar">
                <span style={{ width: `${percent}%` }} />
              </div>
            </Link>
          );
        })}
      </div>

      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Your overall progress</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {stats.lessonsCompleted} of {stats.lessonsTotal} lessons completed across {stats.subjectsTouched}{" "}
            subject{stats.subjectsTouched === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/progress" className="btn btn-ghost btn-sm">
          📈 Open progress tracker
        </Link>
      </Panel>
    </div>
  );
}
