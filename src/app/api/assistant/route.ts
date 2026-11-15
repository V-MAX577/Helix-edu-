import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, chatSessions, profiles } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { activeProvider, callProvider, listProviders, ProviderError } from "@/lib/ai";
import { runEngine } from "@/lib/engine";
import { ensureSeeded, getQuestionBank } from "@/lib/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODES = ["deep-think", "quick-learn", "exam-prep", "creative", "coding"] as const;

export async function POST(request: NextRequest) {
  const user = await getLearner();

  let body: { sessionId?: string; message?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Type a question first." }, { status: 400 });
  if (message.length > 4000)
    return NextResponse.json({ error: "That question is too long (4000 characters max)." }, { status: 400 });

  const mode = MODES.includes(body.mode as (typeof MODES)[number])
    ? (body.mode as (typeof MODES)[number])
    : "deep-think";

  await ensureSeeded();

  const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  const p = profile[0];

  /* Resolve or create the chat session */
  let sessionId = body.sessionId;
  if (sessionId) {
    const owned = await db
      .select({ id: chatSessions.id })
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId))
      .limit(1);
    if (!owned.length) sessionId = undefined;
  }
  if (!sessionId) {
    const [created] = await db
      .insert(chatSessions)
      .values({ userId: user.id, mode, title: message.slice(0, 60) })
      .returning();
    sessionId = created.id;
  }

  const historyRows = await db
    .select({ role: chatMessages.role, content: chatMessages.content })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt)
    .limit(12);

  await db
    .insert(chatMessages)
    .values({ sessionId, role: "user", content: message, provider: "user" });

  const history = historyRows.map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.content,
  }));

  /* 1. Try a connected provider (only if explicitly configured). */
  const provider = activeProvider();
  let replyText = "";
  let providerId = "helix-engine";
  let providerLabel = "Helix Offline Engine";
  let usedProvider = false;
  let providerError: string | null = null;

  if (provider) {
    try {
      const result = await callProvider({
        messages: [...history, { role: "user", content: message }],
        mode,
        level: p?.level ?? "intermediate",
        board: p?.board ?? "Maharashtra State Board",
        className: p?.className ?? "Class 10",
      });
      replyText = result.text;
      providerId = result.provider;
      providerLabel = provider.label;
      usedProvider = true;
    } catch (err) {
      providerError =
        err instanceof ProviderError ? err.message : "The connected AI provider failed to respond.";
    }
  }

  /* 2. Fall back to the offline Helix Engine (always available, always free). */
  if (!usedProvider) {
    const engine = runEngine({
      message,
      mode,
      level: (p?.level as "beginner" | "intermediate" | "advanced") ?? "intermediate",
      className: p?.className ?? "Class 10",
      board: p?.board ?? "Maharashtra State Board",
      history,
      questionBank: await getQuestionBank(),
    });
    replyText = engine.text;
    providerId = "helix-engine";
    providerLabel = providerError
      ? "Helix Offline Engine (provider unavailable)"
      : "Helix Offline Engine";
  }

  await db.insert(chatMessages).values({
    sessionId,
    role: "assistant",
    content: replyText,
    provider: providerId,
  });
  await db.update(chatSessions).set({ mode, updatedAt: new Date() }).where(eq(chatSessions.id, sessionId));

  return NextResponse.json({
    reply: replyText,
    sessionId,
    mode,
    usedProvider,
    provider: providerId,
    providerLabel,
    providerError,
    providers: listProviders().map((x) => ({ id: x.id, label: x.label, configured: x.configured })),
  });
}
