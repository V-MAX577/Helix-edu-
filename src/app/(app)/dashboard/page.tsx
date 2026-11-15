import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, chatSessions, notes, profiles, quizAttempts, quizzes, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getContinueLearning, getStats, getStreak, getSubjectProgress } from "@/lib/progress";
import { getDailyChallenge } from "@/lib/daily";
import { Chip, EmptyState, Panel, ProgressBar } from "@/components/ui";
import { DailyChallengeCard, DailyGoalCard, QuickAsk, WelcomeBanner } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getLearner();
  await ensureSeeded();

  const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  const goal = profile[0]?.dailyGoalMinutes ?? 30;

  const stats = await getStats(user.id, goal);
  const [streak, subjectProgress, continueLearning, challenge] = await Promise.all([
    getStreak(user.id),
    getSubjectProgress(user.id),
    getContinueLearning(user.id, 3),
    getDailyChallenge(user.id, stats),
  ]);

  const [quizRows, noteRows, bookmarkRows, attemptRows] = await Promise.all([
    db
      .select({ id: quizzes.id, title: quizzes.title, difficulty: quizzes.difficulty, timeLimitSec: quizzes.timeLimitSec, subjectName: subjects.name, subjectIcon: subjects.icon })
      .from(quizzes)
      .innerJoin(subjects, eq(quizzes.subjectId, subjects.id))
      .orderBy(quizzes.sortOrder)
      .limit(4),
    db
      .select({ id: notes.id, title: notes.title, updatedAt: notes.updatedAt, pinned: notes.pinned })
      .from(notes)
      .where(eq(notes.userId, user.id))
      .orderBy(desc(notes.pinned), desc(notes.updatedAt))
      .limit(3),
    db.select().from(bookmarks).where(eq(bookmarks.userId, user.id)).orderBy(desc(bookmarks.createdAt)).limit(4),
    db
      .select({ id: quizAttempts.id, score: quizAttempts.score, total: quizAttempts.total, createdAt: quizAttempts.createdAt, title: quizzes.title })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(eq(quizAttempts.userId, user.id))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(3),
  ]);

  const overallPercent = stats.lessonsTotal
    ? Math.round((stats.lessonsCompleted / stats.lessonsTotal) * 100)
    : 0;

  return (
    <div className="mx-auto grid max-w-7xl gap-4">
      <WelcomeBanner
        name={user.name}
        streak={streak.current}
        percent={overallPercent}
        lessonsCompleted={stats.lessonsCompleted}
        lessonsTotal={stats.lessonsTotal}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="🔥" value={streak.current} label="Day streak" />
        <Stat icon="📘" value={`${stats.lessonsCompleted}/${stats.lessonsTotal}`} label="Lessons completed" />
        <Stat icon="📝" value={stats.quizzesTaken} label="Quizzes taken" />
        <Stat icon="🎯" value={`${stats.quizAccuracy}%`} label="Quiz accuracy" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 lg:col-span-2">
          <DailyChallengeCard challenge={challenge} />

          {/* Continue learning */}
          <Panel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <span aria-hidden>▶️</span> Continue Learning
              </h2>
              <Link href="/learn" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                All subjects →
              </Link>
            </div>
            {continueLearning.length ? (
              <div className="grid gap-2.5 sm:grid-cols-3">
                {continueLearning.map((item) => (
                  <Link
                    key={item.lessonId}
                    href={`/learn/${item.subjectSlug}/${item.chapterSlug}/${item.lessonSlug}`}
                    className="group rounded-2xl border border-[var(--panel-border)] p-3.5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                  >
                    <div className="mb-2 text-2xl" aria-hidden>
                      {item.subjectIcon}
                    </div>
                    <div className="text-[0.68rem] tracking-wide text-[var(--text-muted)] uppercase">
                      {item.subjectName}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm font-bold">{item.title}</div>
                    <div className="mt-2 flex items-center justify-between text-[0.68rem] text-[var(--text-muted)]">
                      <span>{item.minutes} min read</span>
                      <span className="font-semibold text-[var(--accent)] group-hover:underline">
                        {item.reason} →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📚"
                title="Nothing to continue yet"
                message="Open the Learning Centre and finish your first lesson — it takes about ten minutes."
                action={
                  <Link href="/learn" className="btn btn-primary btn-sm">
                    Browse subjects
                  </Link>
                }
              />
            )}
          </Panel>

          <QuickAsk />
        </div>

        <div className="grid gap-4">
          <DailyGoalCard minutes={stats.todayMinutes} goal={goal} streak={streak.current} longest={streak.longest} />

          {/* My subjects */}
          <Panel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <span aria-hidden>📚</span> My Subjects
              </h2>
              <Link href="/progress" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                Details →
              </Link>
            </div>
            <div className="space-y-3">
              {subjectProgress.map((subject) => (
                <div key={subject.subjectId}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden>{subject.icon}</span>
                      <Link href={`/learn/${subject.slug}`} className="truncate font-medium hover:text-[var(--accent)]">
                        {subject.name}
                      </Link>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
                      {subject.done}/{subject.total}
                    </span>
                  </div>
                  <ProgressBar value={subject.done} max={subject.total || 1} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Quizzes + notes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span aria-hidden>📝</span> Quizzes and Tests
            </h2>
            <Link href="/quizzes" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              All quizzes →
            </Link>
          </div>
          <div className="grid gap-2">
            {quizRows.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.id}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--panel-border)] p-3 transition hover:border-[var(--accent)]"
              >
                <span className="text-xl" aria-hidden>
                  {quiz.subjectIcon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{quiz.title}</span>
                  <span className="block text-xs text-[var(--text-muted)]">
                    {quiz.subjectName} · {Math.round(quiz.timeLimitSec / 60)} min
                  </span>
                </span>
                <Chip tone={quiz.difficulty === "easy" ? "emerald" : quiz.difficulty === "hard" ? "gold" : "accent"}>
                  {quiz.difficulty}
                </Chip>
              </Link>
            ))}
          </div>
          {attemptRows.length > 0 && (
            <div className="mt-4 border-t border-[var(--panel-border)] pt-3">
              <div className="mb-2 text-xs tracking-[0.16em] text-[var(--text-muted)] uppercase">Recent attempts</div>
              <div className="grid gap-1.5">
                {attemptRows.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-[var(--text-muted)]">{attempt.title}</span>
                    <span className="shrink-0 font-bold tabular-nums">
                      {attempt.score}/{attempt.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span aria-hidden>📒</span> Notes & Bookmarks
            </h2>
            <Link href="/notes" className="text-xs font-semibold text-[var(--accent)] hover:underline">
              All notes →
            </Link>
          </div>

          {noteRows.length === 0 && bookmarkRows.length === 0 ? (
            <EmptyState
              icon="📒"
              title="No notes yet"
              message="While reading a lesson, save a note or bookmark it so revision is one tap away."
              action={
                <Link href="/learn" className="btn btn-ghost btn-sm">
                  Find a lesson
                </Link>
              }
            />
          ) : (
            <div className="grid gap-2">
              {noteRows.map((note) => (
                <Link
                  key={note.id}
                  href="/notes"
                  className="flex items-center gap-3 rounded-xl border border-[var(--panel-border)] p-3 transition hover:border-[var(--accent)]"
                >
                  <span aria-hidden>{note.pinned ? "📌" : "📄"}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{note.title}</span>
                  <span className="shrink-0 text-xs text-[var(--text-muted)]">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
              {bookmarkRows.map((bookmark) => (
                <Link
                  key={bookmark.id}
                  href={bookmark.href}
                  className="flex items-center gap-3 rounded-xl border border-[var(--panel-border)] p-3 transition hover:border-[var(--accent)]"
                >
                  <span aria-hidden>🔖</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{bookmark.title}</span>
                  <span className="shrink-0 text-xs text-[var(--text-muted)]">{bookmark.targetType}</span>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Assistant history */}
      <AssistantHistory />
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string | number; label: string }) {
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

async function AssistantHistory() {
  const user = await getLearner();
  const sessions = await db
    .select({ id: chatSessions.id, title: chatSessions.title, mode: chatSessions.mode, updatedAt: chatSessions.updatedAt })
    .from(chatSessions)
    .where(eq(chatSessions.userId, user.id))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(5);

  if (!sessions.length) return null;

  return (
    <Panel>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <span aria-hidden>💬</span> Recent assistant chats
        </h2>
        <Link href="/assistant" className="text-xs font-semibold text-[var(--accent)] hover:underline">
          Open assistant →
        </Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/assistant?chat=${session.id}`}
            className="rounded-xl border border-[var(--panel-border)] p-3 transition hover:border-[var(--accent)]"
          >
            <div className="truncate text-sm font-bold">{session.title}</div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">
              {new Date(session.updatedAt).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
