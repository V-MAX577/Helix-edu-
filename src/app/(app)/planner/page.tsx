import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, studyPlans, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getStats, getStreak } from "@/lib/progress";
import { Chip, EmptyState, Panel } from "@/components/ui";
import { DeletePlanButton, PlanClient, PlanForm, type StudyPlan } from "./plan-client";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  const user = await getLearner();
  await ensureSeeded();

  const [subjectRows, profile, plans, stats, streak] = await Promise.all([
    db.select({ slug: subjects.slug, name: subjects.name, icon: subjects.icon }).from(subjects).orderBy(subjects.sortOrder),
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    db.select().from(studyPlans).where(eq(studyPlans.userId, user.id)).orderBy(desc(studyPlans.createdAt)),
    getStats(user.id),
    getStreak(user.id),
  ]);

  const activePlan = plans.find((p) => p.active) ?? plans[0] ?? null;
  const today = new Date().toISOString().slice(0, 10);

  let todayIndex = 0;
  if (activePlan) {
    const found = activePlan.plan.findIndex((d) => d.day >= today);
    todayIndex = found === -1 ? Math.max(0, activePlan.plan.length - 1) : found;
  }

  const plan: StudyPlan | null = activePlan
    ? {
        id: activePlan.id,
        title: activePlan.title,
        examDate: activePlan.examDate,
        subjects: activePlan.subjects,
        minutesPerDay: activePlan.minutesPerDay,
        days: activePlan.plan,
      }
    : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(168,85,247,0.2), transparent 45%), radial-gradient(circle at 92% 100%, rgba(34,211,238,0.12), transparent 45%)",
          }}
        />
        <div className="relative">
          <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
            Study <span className="text-gradient">Planner</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Build a real revision timetable from your subjects and the minutes you actually have. The plan
            rotates through real chapters from your Learning Centre, so every block points at something you
            can study right now.
          </p>
        </div>
      </Panel>

      {plan ? (
        <PlanClient plan={plan} todayIndex={todayIndex} />
      ) : (
        <EmptyState
          icon="🗓️"
          title="No study plan yet"
          message="Create your first plan below and HELIXEDU will build a day-by-day timetable from real chapters."
        />
      )}

      <Panel>
        <h2 className="text-lg font-bold">Create a new plan</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Pick subjects, your daily time budget and how many days you have. Creating a new plan replaces the
          current one.
        </p>
        <PlanForm subjects={subjectRows} defaultMinutes={profile[0]?.dailyGoalMinutes ?? 45} />
      </Panel>

      {plans.length > 0 && (
        <Panel>
          <h2 className="mb-3 text-lg font-bold">Your plans</h2>
          <div className="grid gap-2">
            {plans.map((planRow) => (
              <div
                key={planRow.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] p-3"
                style={planRow.active ? { borderColor: "rgba(16,185,129,0.35)" } : undefined}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{planRow.title}</span>
                    {planRow.active && <Chip tone="emerald">active</Chip>}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {planRow.plan.length} days · {planRow.minutesPerDay} min/day · {planRow.subjects.join(", ")}
                    {planRow.examDate ? ` · exam ${planRow.examDate}` : ""}
                  </div>
                </div>
                <DeletePlanButton id={planRow.id} />
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Study momentum</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {stats.totalMinutes} minutes logged in total · {stats.todayMinutes} today · 🔥 {streak.current}-day
            streak (best {streak.longest})
          </p>
        </div>
      </Panel>
    </div>
  );
}
