import { cache } from "react";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { profiles, sessions, users } from "@/db/schema";

const DEVICE_COOKIE = "helixedu_device";
const SESSION_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;

export type Learner = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
};

/**
 * Gives each browser installation a private anonymous learner profile.
 * The opaque, HttpOnly device token is stored in the sessions table; no
 * email address, password, or other personal information is requested.
 */
async function loadLearner(): Promise<Learner> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEVICE_COOKIE)?.value;

  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    throw new Error("HELIXEDU device identity is missing. Refresh the page and try again.");
  }

  const now = new Date();
  let session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });

  if (session) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS) })
      .where(and(eq(sessions.id, session.id), eq(sessions.token, token)));
  } else {
    const email = `device-${token}@device.helixedu.local`;
    await db
      .insert(users)
      .values({ email, name: "Explorer", passwordHash: "", role: "student" })
      .onConflictDoNothing();

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) throw new Error("Could not create this device's learner profile.");

    await db
      .insert(sessions)
      .values({
        userId: user.id,
        token,
        expiresAt: new Date(now.getTime() + SESSION_LIFETIME_MS),
      })
      .onConflictDoNothing();

    session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });
    if (!session) throw new Error("Could not create this device's private session.");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  if (!user) throw new Error("This device's learner profile is unavailable.");

  await db
    .insert(profiles)
    .values({ userId: user.id })
    .onConflictDoNothing();

  return user;
}

/** Returns this browser's learner, deduped within the current server request. */
export const getLearner = cache(loadLearner);
