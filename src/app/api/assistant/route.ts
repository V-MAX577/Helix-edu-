import { NextRequest, NextResponse } from "next/server";
import { activeProvider, callProvider, listProviders, ProviderError } from "@/lib/ai";
import { runEngine, type EngineLevel, type EngineMode } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODES: EngineMode[] = ["deep-think", "quick-learn", "exam-prep", "creative", "coding"];
const LEVELS: EngineLevel[] = ["beginner", "intermediate", "advanced"];

type Turn = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  let body: {
    message?: string;
    mode?: string;
    level?: string;
    className?: string;
    board?: string;
    history?: Turn[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Type a question first." }, { status: 400 });
  if (message.length > 4000) return NextResponse.json({ error: "That question is too long (4000 characters max)." }, { status: 400 });

  const mode = MODES.includes(body.mode as EngineMode) ? body.mode as EngineMode : "deep-think";
  const level = LEVELS.includes(body.level as EngineLevel) ? body.level as EngineLevel : "intermediate";
  const history = Array.isArray(body.history)
    ? body.history.filter((turn): turn is Turn => Boolean(turn) && (turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string").slice(-12)
    : [];

  const provider = activeProvider();
  if (provider) {
    try {
      const result = await callProvider({
        messages: [...history, { role: "user", content: message }],
        mode,
        level,
        board: String(body.board ?? "Maharashtra State Board"),
        className: String(body.className ?? "Class 8"),
      });
      return NextResponse.json({
        reply: result.text,
        provider: result.provider,
        providerLabel: provider.label,
        usedProvider: true,
        providers: listProviders().map((item) => ({ id: item.id, label: item.label, configured: item.configured })),
      });
    } catch (error) {
      const providerError = error instanceof ProviderError ? error.message : "The configured AI provider did not respond.";
      const fallback = runEngine({ message, mode, level, board: String(body.board ?? "Maharashtra State Board"), className: String(body.className ?? "Class 8"), history });
      return NextResponse.json({
        reply: fallback.text,
        provider: "helix-engine",
        providerLabel: "Helix Offline Engine (provider unavailable)",
        usedProvider: false,
        providerError,
        providers: listProviders().map((item) => ({ id: item.id, label: item.label, configured: item.configured })),
      });
    }
  }

  const result = runEngine({
    message,
    mode,
    level,
    board: String(body.board ?? "Maharashtra State Board"),
    className: String(body.className ?? "Class 8"),
    history,
  });
  return NextResponse.json({
    reply: result.text,
    provider: "helix-engine",
    providerLabel: "Helix Offline Engine",
    usedProvider: false,
    providers: listProviders().map((item) => ({ id: item.id, label: item.label, configured: item.configured })),
  });
}
