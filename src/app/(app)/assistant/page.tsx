import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, chatSessions, profiles } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { listProviders } from "@/lib/ai";
import { ensureSeeded } from "@/lib/progress";
import { AssistantClient } from "@/components/assistant-client";

export const dynamic = "force-dynamic";

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string; q?: string; mode?: string }>;
}) {
  const user = await getLearner();
  await ensureSeeded();
  const params = await searchParams;

  const [profile, sessions] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, user.id))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(30),
  ]);

  const activeId = params.chat && sessions.some((s) => s.id === params.chat) ? params.chat : sessions[0]?.id;

  const messages = activeId
    ? await db
        .select({ id: chatMessages.id, role: chatMessages.role, content: chatMessages.content, provider: chatMessages.provider, createdAt: chatMessages.createdAt })
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, activeId))
        .orderBy(chatMessages.createdAt)
    : [];

  return (
    <AssistantClient
      initialSessionId={activeId ?? null}
      initialMode={sessions.find((s) => s.id === activeId)?.mode ?? "deep-think"}
      initialMessages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
      sessions={sessions.map((s) => ({ id: s.id, title: s.title, mode: s.mode, updatedAt: s.updatedAt.toISOString() }))}
      prefill={params.q ?? ""}
      requestedMode={params.mode ?? undefined}
      level={profile[0]?.level ?? "intermediate"}
      className={profile[0]?.className ?? "Class 10"}
      board={profile[0]?.board ?? "Maharashtra State Board"}
      providers={listProviders()}
    />
  );
}
