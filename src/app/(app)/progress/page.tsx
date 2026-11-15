import Link from "next/link";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { flashcardReviews, profiles, quizAttempts, quizzes, studyLog, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getStats, getStreak, getSubjectProgress } from "@/lib/progress";
import { Panel, ProgressBar, ProgressRing } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getLearner();
  await ensureSeeded();

  const [stats, streak, subjectProgress, profile, recentLog, todayResult] = await Promise.all([
    getStats(user.id),
    getStreak(user.id),
    getSubjectProgress(user.id),
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    db
      .select({ day: studyLog.day, minutes: studyLog.minutes, actions: studyLog.actions })
      .from(studyLog)
      .where(eq(studyLog.userId, user.id))
      .orderBy(desc(studyLog.day))
      .limit(14),
    db.select({ today: sql<string>`current_date::text` }).from(profiles).limit(1),
  ]);

  const today = todayResult[0]?.today ?? recentLog[0]?.day ?? "1970-01-01";

  // 14-day study heatmap data
  const days: { day: string; minutes: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.parse(`${today}T00:00:00Z`) - i * 86_400_000).toISOString().slice(0, 10);
    days.push({ day: d, minutes: 0 });
  }
  const logMap = new Map(recentLog.map((l) => [l.day, l.minutes]));
  for (const entry of days) entry.minutes = logMap.get(entry.day) ?? 0;
  const maxMinutes = Math.max(30, ...days.map((d) => d.minutes));

  const goal = profile[0]?.dailyGoalMinutes ?? 30;
  const overall = stats.lessonsTotal ? Math.round((stats.lessonsCompleted / stats.lessonsTotal) * 100) : 0;

  const byDifficulty = await db
    .select({ difficulty: quizzes.difficulty, n: sql<number>`count(*)`, avg: sql<number>`round(avg(${quizAttempts.score}::numeric / nullif(${quizAttempts.total}, 0) * 100))` })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
    .where(eq(quizAttempts.userId, user.id))
    .groupBy(quizzes.difficulty);

  const dueCards = await db
    .select({ n: sql<number>`count(*)` })
    .from(flashcardReviews)
    .where(and2(user.id));

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(34,211,238,0.18), transparent 45%), radial-gradient(circle at 92% 100%, rgba(168,85,247,0.2), transparent 45%)",
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
              Progress <span className="text-gradient">Tracker</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
              Every number here is computed from work you have actually completed — lessons finished, quizzes
              submitted and flashcards reviewed. Nothing is simulated.
            </p>
          </div>
          <ProgressRing value={overall} size={124} label={`${overall}%`} sublabel="Course complete" />
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon="📘" value={`${stats.lessonsCompleted}/${stats.lessonsTotal}`} label="Lessons completed" />
        <Metric icon="📝" value={stats.quizzesTaken} label="Quizzes submitted" />
        <Metric icon="🎯" value={`${stats.quizAccuracy}%`} label="Average accuracy" />
        <Metric icon="⏱️" value={`${stats.totalMinutes}m`} label="Total study time" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-bold">🔥 Learning streak</h2>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-[var(--panel-border)] p-3">
              <div className="text-2xl font-extrabold tabular-nums">{streak.current}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">current days</div>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] p-3">
              <div className="text-2xl font-extrabold tabular-nums">{streak.longest}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">longest days</div>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] p-3">
              <div className="text-2xl font-extrabold tabular-nums">{streak.totalDays}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">active days</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={stats.todayMinutes} max={goal} label={`Today: ${stats.todayMinutes} / ${goal} min`} />
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-bold">🗓️ Last 14 days</h2>
          <div className="flex items-end gap-1.5" style={{ height: 120 }}>
            {days.map((day) => {
              const height = Math.round((day.minutes / maxMinutes) * 100);
              const isToday = day.day === today;
              return (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    title={`${day.day}: ${day.minutes} min`}
                    className="w-full rounded-t-md transition"
                    style={{
                      height: `${Math.max(3, height)}%`,
                      background:
                        day.minutes >= goal
                          ? "linear-gradient(180deg,#10b981,#34d399)"
                          : day.minutes > 0
                            ? "linear-gradient(180deg,#a855f7,#22d3ee)"
                            : "color-mix(in srgb, var(--text) 8%, transparent)",
                      border: isToday ? "1px solid var(--accent)" : undefined,
                    }}
                  />
                  <span className="text-[0.55rem] text-[var(--text-muted)]">
                    {new Date(day.day).toLocaleDateString(undefined, { weekday: "narrow" })}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Bars show minutes studied. Green means you met your daily goal of {goal} minutes.
          </p>
        </Panel>
      </div>

      <Panel>
        <h2 className="mb-4 text-lg font-bold">📚 Progress by subject</h2>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {subjectProgress.map((subject) => (
            <div key={subject.subjectId}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                <Link href={`/learn/${subject.slug}`} className="flex min-w-0 items-center gap-2 hover:text-[var(--accent)]">
                  <span aria-hidden>{subject.icon}</span>
                  <span className="truncate font-medium">{subject.name}</span>
                </Link>
                <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
                  {subject.done}/{subject.total} · {subject.percent}%
                </span>
              </div>
              <ProgressBar value={subject.done} max={subject.total || 1} />
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-lg font-bold">🃏 Flashcard mastery</h2>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-[var(--panel-border)] p-3">
              <div className="text-2xl font-extrabold tabular-nums">{stats.flashcardsReviewed}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">reviewed</div>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] p-3">
              <div className="text-2xl font-extrabold tabular-nums">{stats.flashcardsMastered}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">mastered</div>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] p-3">
              <div className="text-2xl font-extrabold tabular-nums">{Number(dueCards[0]?.n ?? 0)}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">due today</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              value={stats.flashcardsMastered}
              max={stats.flashcardsTotal || 1}
              label="Mastered of all cards"
            />
          </div>
          <Link href="/flashcards" className="btn btn-ghost btn-sm mt-4">
            Revise flashcards →
          </Link>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-bold">🎯 Accuracy by difficulty</h2>
          {byDifficulty.length ? (
            <div className="grid gap-3">
              {byDifficulty.map((row) => (
                <div key={row.difficulty}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="capitalize">{row.difficulty}</span>
                    <span className="text-xs tabular-nums text-[var(--text-muted)]">
                      {Number(row.n)} attempt(s) · {Number(row.avg ?? 0)}%
                    </span>
                  </div>
                  <ProgressBar value={Number(row.avg ?? 0)} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              Submit a quiz to see how your accuracy breaks down by difficulty.
            </p>
          )}
          <Link href="/quizzes" className="btn btn-ghost btn-sm mt-4">
            Take a quiz →
          </Link>
        </Panel>
      </div>

      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Keep going</h2>
          <p className="text-sm text-[var(--text-muted)]">
            You have touched {stats.subjectsTouched} of {subjectProgress.length} subjects and written{" "}
            {stats.notesCount} notes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/achievements" className="btn btn-ghost btn-sm">
            🏆 Achievements
          </Link>
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Back to dashboard
          </Link>
        </div>
      </Panel>
    </div>
  );
}

function Metric({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="panel flex items-center gap-3 p-4">
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(168,85,247,0.16)] text-lg">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xl leading-tight font-extrabold tabular-nums">{value}</span>
        <span className="block truncate text-xs text-[var(--text-muted)]">{label}</span>
      </span>
    </div>
  );
}

function and2(userId: string) {
  return sql`${flashcardReviews.userId} = ${userId} and ${flashcardReviews.dueAt} <= now()`;
}
