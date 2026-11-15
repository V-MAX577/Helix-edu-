import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { achievements, userAchievements } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getStats, getStreak } from "@/lib/progress";
import { Chip, Panel, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

const TIER_ORDER: Record<string, number> = { bronze: 0, silver: 1, gold: 2, platinum: 3 };

export default async function AchievementsPage() {
  const user = await getLearner();
  await ensureSeeded();

  const [all, unlocked, stats, streak] = await Promise.all([
    db.select().from(achievements),
    db
      .select({ achievement: achievements, unlockedAt: userAchievements.unlockedAt })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, user.id))
      .orderBy(desc(userAchievements.unlockedAt)),
    getStats(user.id),
    getStreak(user.id),
  ]);

  const unlockedIds = new Set(unlocked.map((u) => u.achievement.id));
  const sorted = [...all].sort(
    (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.name.localeCompare(b.name),
  );
  const locked = sorted.filter((a) => !unlockedIds.has(a.id));
  const percent = sorted.length ? Math.round((unlocked.length / sorted.length) * 100) : 0;

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(251,191,36,0.18), transparent 45%), radial-gradient(circle at 92% 100%, rgba(168,85,247,0.2), transparent 45%)",
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
              🏆 <span className="text-gradient">Achievements</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
              Twelve badges, each unlocked by real work — completed lessons, quiz scores, streak length and
              flashcards reviewed. Nothing here is awarded for simply visiting the page.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold tabular-nums">
              {unlocked.length}/{sorted.length}
            </div>
            <div className="text-xs text-[var(--text-muted)]">unlocked</div>
          </div>
        </div>
        <div className="relative mt-5">
          <ProgressBar value={unlocked.length} max={sorted.length || 1} label="Collection progress" />
        </div>
      </Panel>

      <section className="grid gap-3">
        <h2 className="text-lg font-bold">✅ Unlocked ({unlocked.length})</h2>
        {unlocked.length === 0 ? (
          <Panel className="py-10 text-center text-sm text-[var(--text-muted)]">
            No badges yet. Finish a lesson or a quiz and your first one unlocks automatically.
          </Panel>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.map(({ achievement, unlockedAt }) => (
              <div
                key={achievement.id}
                className="panel flex items-start gap-3 p-4 glow-emerald"
              >
                <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[rgba(16,185,129,0.16)] text-2xl">
                  {achievement.icon}
                </span>
                <div className="min-w-0">
                  <div className="font-bold">{achievement.name}</div>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{achievement.description}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Chip tone={achievement.tier === "gold" ? "gold" : achievement.tier === "silver" ? "cyan" : "default"}>
                      {achievement.tier}
                    </Chip>
                    <span className="text-[0.65rem] text-[var(--text-muted)]">
                      {new Date(unlockedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-bold">🔒 Still to earn ({locked.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locked.map((achievement) => (
            <div key={achievement.id} className="panel flex items-start gap-3 p-4 opacity-80">
              <span
                aria-hidden
                className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--text)_8%,transparent)] text-2xl grayscale"
              >
                {achievement.icon}
              </span>
              <div className="min-w-0">
                <div className="font-bold">{achievement.name}</div>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{achievement.description}</p>
                <Chip className="mt-2" tone={achievement.tier === "gold" ? "gold" : achievement.tier === "silver" ? "cyan" : "default"}>
                  {achievement.tier}
                </Chip>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Panel>
        <h2 className="mb-3 text-lg font-bold">Where you stand</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--panel-border)] p-3 text-center">
            <div className="text-xl font-extrabold tabular-nums">{stats.lessonsCompleted}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)]">lessons</div>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] p-3 text-center">
            <div className="text-xl font-extrabold tabular-nums">{stats.quizzesTaken}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)]">quizzes</div>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] p-3 text-center">
            <div className="text-xl font-extrabold tabular-nums">{stats.flashcardsReviewed}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)]">flashcards</div>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] p-3 text-center">
            <div className="text-xl font-extrabold tabular-nums">{streak.current}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)]">day streak</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          {percent}% of the collection earned. {locked.length > 0 ? `Next up: ${locked[0].name}.` : "Every badge earned — outstanding."}
        </p>
      </Panel>
    </div>
  );
}
