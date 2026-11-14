import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { activeProvider } from "@/lib/ai";
import { getStats, getStreak } from "./progress";

export type ShellData = {
  streak: number;
  name: string;
  todayMinutes: number;
  goalMinutes: number;
  providerLabel: string;
  providerConnected: boolean;
};

/** Loads everything the app chrome needs. Call once per page. */
export async function getShellData(): Promise<ShellData> {
  const user = await getLearner();
  const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  const goal = profile[0]?.dailyGoalMinutes ?? 30;
  const [streak, stats] = await Promise.all([getStreak(user.id), getStats(user.id, goal)]);
  const provider = activeProvider();
  return {
    streak: streak.current,
    name: user.name,
    todayMinutes: stats.todayMinutes,
    goalMinutes: goal,
    providerLabel: provider?.label ?? "Helix Offline Engine",
    providerConnected: Boolean(provider),
  };
}
