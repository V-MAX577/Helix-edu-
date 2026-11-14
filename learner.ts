import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";

/**
 * HELIXEDU runs with no accounts and no registration.
 *
 * All learner state (progress, notes, bookmarks, streaks, chat history) is
 * stored against one shared local learner record that is created automatically
 * the first time the app is used. This keeps every personalised feature working
 * while removing all sign-in friction.
 */

const SHARED_EMAIL = "learner@helixedu.local";

export type Learner = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
};

async function loadLearner(): Promise<Learner> {
  let user = await db.query.users.findFirst({ where: eq(users.email, SHARED_EMAIL) });

  if (!user) {
    user = (
      await db
        .insert(users)
        .values({ email: SHARED_EMAIL, name: "Explorer", passwordHash: "", role: "student" })
        .returning()
    )[0];
  }

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
  if (!profile) {
    await db.insert(profiles).values({ userId: user.id }).onConflictDoNothing();
  }

  return user;
}

/** Returns the shared learner, creating it on first use. Deduped per request. */
export const getLearner = cache(loadLearner);
