import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles, quizAttempts, quizzes, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getStats } from "@/lib/progress";
import { Chip, EmptyState, Panel, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const user = await getLearner();
  await ensureSeeded();

  const [rows, stats, attempts, profile] = await Promise.all([
    db
      .select({
        id: quizzes.id,
        slug: quizzes.slug,
        title: quizzes.title,
        description: quizzes.description,
        difficulty: quizzes.difficulty,
        timeLimitSec: quizzes.timeLimitSec,
        subjectName: subjects.name,
        subjectIcon: subjects.icon,
        subjectSlug: subjects.slug,
        questionCount: sql<number>`(select count(*) from quiz_items where quiz_id = ${quizzes.id})`,
      })
      .from(quizzes)
      .innerJoin(subjects, eq(quizzes.subjectId, subjects.id))
      .orderBy(subjects.sortOrder, quizzes.sortOrder),
    getStats(user.id),
    db
      .select({
        quizId: quizAttempts.quizId,
        score: quizAttempts.score,
        total: quizAttempts.total,
        createdAt: quizAttempts.createdAt,
        percent: sql<number>`case when ${quizAttempts.total} = 0 then 0 else round((${quizAttempts.score}::numeric / ${quizAttempts.total}) * 100) end`,
        title: quizzes.title,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(eq(quizAttempts.userId, user.id))
      .orderBy(desc(quizAttempts.createdAt)),
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
  ]);

  const bySubject = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = bySubject.get(row.subjectName) ?? [];
    list.push(row);
    bySubject.set(row.subjectName, list);
  }

  const bestByQuiz = new Map<string, number>();
  for (const attempt of attempts) {
    const current = bestByQuiz.get(attempt.quizId) ?? 0;
    bestByQuiz.set(attempt.quizId, Math.max(current, attempt.percent));
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 8% 0%, rgba(168,85,247,0.22), transparent 45%), radial-gradient(circle at 92% 100%, rgba(34,211,238,0.14), transparent 45%)",
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
              Quizzes & <span className="text-gradient">Tests</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Every quiz is auto-marked and shows a full explanation for each answer, so a wrong answer
              still teaches you something. Aligned with {profile[0]?.board ?? "Maharashtra State Board"}.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-[var(--panel-border)] px-4 py-2.5">
              <div className="text-xl font-extrabold tabular-nums">{stats.quizzesTaken}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">attempts</div>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] px-4 py-2.5">
              <div className="text-xl font-extrabold tabular-nums">{stats.quizAccuracy}%</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">accuracy</div>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] px-4 py-2.5">
              <div className="text-xl font-extrabold tabular-nums">{rows.length}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">available</div>
            </div>
          </div>
        </div>
      </Panel>

      {rows.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No quizzes available yet"
          message="Quizzes appear here as soon as a subject publishes questions."
          action={
            <Link href="/learn" className="btn btn-primary btn-sm">
              Browse lessons
            </Link>
          }
        />
      ) : (
        [...bySubject.entries()].map(([subjectName, list]) => (
          <section key={subjectName} className="grid gap-3">
            <h2 className="text-lg font-bold tracking-tight">{list[0].subjectIcon} {subjectName}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((quiz) => {
                const best = bestByQuiz.get(quiz.id);
                return (
                  <Link
                    key={quiz.id}
                    href={`/quizzes/${quiz.id}`}
                    className="panel flex flex-col gap-2.5 p-4 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{quiz.title}</h3>
                      <Chip tone={quiz.difficulty === "easy" ? "emerald" : quiz.difficulty === "hard" ? "gold" : "accent"}>
                        {quiz.difficulty}
                      </Chip>
                    </div>
                    <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{quiz.description}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>❓ {Number(quiz.questionCount)} questions</span>
                      <span>⏱ {Math.round(quiz.timeLimitSec / 60)} min</span>
                    </div>
                    {best !== undefined && (
                      <div>
                        <ProgressBar value={best} label={`Best: ${best}%`} />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}

      {attempts.length > 0 && (
        <Panel>
          <h2 className="mb-3 text-lg font-bold">Your attempt history</h2>
          <div className="grid gap-2">
            {attempts.slice(0, 10).map((attempt, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{attempt.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {new Date(attempt.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums">
                    {attempt.score}/{attempt.total}
                  </span>
                  <Chip tone={attempt.percent >= 80 ? "emerald" : attempt.percent >= 50 ? "accent" : "gold"}>
                    {attempt.percent}%
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
