import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, chatSessions } from "@/db/schema";
import { getLearner } from "@/lib/learner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getLearner();

  const sessionId = request.nextUrl.searchParams.get("session");
  if (!sessionId) return NextResponse.json({ messages: [] });

  const owned = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, user.id)))
    .limit(1);
  if (!owned.length) return NextResponse.json({ error: "Chat not found." }, { status: 404 });

  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      provider: chatMessages.provider,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);

  return NextResponse.json({
    messages: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  });
}
