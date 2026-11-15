import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reminders } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getStats } from "@/lib/progress";
import { Panel } from "@/components/ui";
import { RemindersClient } from "./reminders-client";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const user = await getLearner();
  await ensureSeeded();

  const [rows, stats] = await Promise.all([
    db.select().from(reminders).where(eq(reminders.userId, user.id)).orderBy(reminders.time),
    getStats(user.id),
  ]);

  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(34,211,238,0.16), transparent 45%), radial-gradient(circle at 92% 100%, rgba(168,85,247,0.18), transparent 45%)",
          }}
        />
        <div className="relative">
          <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
            ⏰ Study <span className="text-gradient">Reminders</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            Schedule study reminders and HELIXEDU will notify you in this browser while the tab is open.
            Notifications use your device&apos;s own notification system — nothing is sent by email and no data
            leaves your device.
          </p>
        </div>
      </Panel>

      <RemindersClient
        reminders={rows.map((r) => ({
          id: r.id,
          label: r.label,
          time: r.time,
          days: r.days,
          enabled: r.enabled,
        }))}
        todayMinutes={stats.todayMinutes}
        dailyGoal={stats.dailyGoalMinutes}
      />
    </div>
  );
}

void desc;
