"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Markdown, Panel } from "./ui";
import { deleteChatAction, newChatAction } from "@/app/actions";

export type AssistantMessage = {
  id: string;
  role: string;
  content: string;
  provider: string;
  createdAt: string;
};

export type ProviderOption = {
  id: string;
  label: string;
  configured: boolean;
  freeTier: boolean;
  note: string;
};

const MODES = [
  { id: "deep-think", label: "Deep Think", icon: "🌌", hint: "Thorough explanations with examples and common mistakes." },
  { id: "quick-learn", label: "Quick Learn", icon: "⚡", hint: "Short, punchy answers for fast revision." },
  { id: "exam-prep", label: "Exam Prep", icon: "🎯", hint: "Key exam points and likely questions." },
  { id: "creative", label: "Creative", icon: "🎨", hint: "Learn through stories and analogies." },
  { id: "coding", label: "Coding", icon: "💻", hint: "Programming with runnable code examples." },
];

const SUGGESTIONS: Record<string, string[]> = {
  "deep-think": ["Explain photosynthesis in detail", "What is the Pythagorean theorem?", "How does the internet work?"],
  "quick-learn": ["What is a fraction?", "Define osmosis", "Capital of Australia?"],
  "exam-prep": ["Exam points on the French Revolution", "Likely questions on trigonometry", "Revise chemical reactions"],
  creative: ["Tell me a story about gravity", "Explain electricity with an analogy", "A tale about the water cycle"],
  coding: ["Teach me Python loops", "Explain binary search with code", "How do I write an SQL query?"],
};

export function AssistantClient({
  initialSessionId,
  initialMode,
  initialMessages,
  sessions,
  prefill,
  requestedMode,
  level,
  className,
  board,
  providers,
}: {
  initialSessionId: string | null;
  initialMode: string;
  initialMessages: AssistantMessage[];
  sessions: { id: string; title: string; mode: string; updatedAt: string }[];
  prefill: string;
  requestedMode?: string;
  level: string;
  className: string;
  board: string;
  providers: ProviderOption[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [mode, setMode] = useState(requestedMode && MODES.some((m) => m.id === requestedMode) ? requestedMode : initialMode);
  const [input, setInput] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const activeMode = useMemo(() => MODES.find((m) => m.id === mode) ?? MODES[0], [mode]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    setLoading(true);
    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `tmp-${Date.now()}`, role: "user", content: question, provider: "user", createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, message: question, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "The assistant could not answer that.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        router.replace(`/assistant?chat=${data.sessionId}`);
      }
      setProviderLabel(data.providerLabel);
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}-a`,
          role: "assistant",
          content: data.reply,
          provider: data.provider,
          createdAt: new Date().toISOString(),
        },
      ]);
      if (data.providerError) setError(data.providerError);
      router.refresh();
    } catch {
      setError("Network problem — the assistant could not be reached. Offline learning features still work.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  async function startNewChat() {
    const result = await newChatAction(mode);
    if (result?.id) {
      setSessionId(result.id);
      setMessages([]);
      router.replace(`/assistant?chat=${result.id}`);
    }
  }

  async function openSession(id: string) {
    setSessionId(id);
    setShowSessions(false);
    router.push(`/assistant?chat=${id}`);
    router.refresh();
    const res = await fetch(`/api/assistant/messages?session=${id}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[16rem_1fr]">
      {/* Session list */}
      <aside className="grid gap-3 lg:sticky lg:top-20 lg:self-start">
        <Panel className="flex items-center justify-between gap-2 lg:hidden">
          <span className="text-sm font-bold">Chat history ({sessions.length})</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowSessions((v) => !v)}>
            {showSessions ? "Hide" : "Show"}
          </button>
        </Panel>

        <Panel className={`${showSessions ? "grid" : "hidden"} lg:grid`}>
          <button type="button" onClick={startNewChat} className="btn btn-primary btn-sm mb-3 w-full">
            ＋ New chat
          </button>
          <div className="max-h-[24rem] space-y-1 overflow-y-auto">
            {sessions.length === 0 && <p className="px-1 text-xs text-[var(--text-muted)]">No chats yet. Ask your first question.</p>}
            {sessions.map((session) => (
              <div key={session.id} className="group relative">
                <button
                  type="button"
                  onClick={() => openSession(session.id)}
                  className="nav-link w-full text-left text-[0.82rem]"
                  data-active={session.id === sessionId}
                >
                  <span className="truncate pr-6">{session.title}</span>
                </button>
                <button
                  type="button"
                  aria-label="Delete chat"
                  onClick={async () => {
                    await deleteChatAction(session.id);
                    if (session.id === sessionId) {
                      setMessages([]);
                      setSessionId(null);
                    }
                    router.refresh();
                  }}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 px-1 text-xs text-[var(--text-muted)] opacity-0 transition group-hover:opacity-100 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-2 text-sm font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">Your profile</h2>
          <dl className="grid gap-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-muted)]">Class</dt>
              <dd className="font-semibold">{className}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-muted)]">Board</dt>
              <dd className="truncate font-semibold">{board}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--text-muted)]">Level</dt>
              <dd className="font-semibold">{level}</dd>
            </div>
          </dl>
          <Link href="/settings" className="btn btn-ghost btn-sm mt-3 w-full">
            Edit in settings
          </Link>
        </Panel>

        <Panel>
          <button type="button" onClick={() => setShowProviders((v) => !v)} className="flex w-full items-center justify-between gap-2 text-left">
            <h2 className="text-sm font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">AI providers</h2>
            <span className="text-xs text-[var(--text-muted)]">{showProviders ? "▲" : "▼"}</span>
          </button>
          {showProviders && (
            <div className="mt-3 space-y-2">
              {providers.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-[var(--panel-border)] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{provider.label}</span>
                    <span className="chip" style={provider.configured ? { borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" } : undefined}>
                      {provider.configured ? "Connected" : "Not set"}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.68rem] leading-snug text-[var(--text-muted)]">{provider.note}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </aside>

      {/* Chat */}
      <div className="grid min-w-0 gap-3">
        <Panel className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 10% 0%, rgba(168,85,247,0.2), transparent 45%), radial-gradient(circle at 90% 100%, rgba(34,211,238,0.12), transparent 45%)",
            }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                <span aria-hidden>🧠</span> AI Study Assistant
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {activeMode.hint}
              </p>
            </div>
            <span className="chip chip-cyan">
              {providerLabel ?? "Helix Offline Engine"}
            </span>
          </div>
        </Panel>

        {/* Mode selector */}
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className="chip"
              style={
                mode === m.id
                  ? {
                      borderColor: "var(--accent)",
                      background: "color-mix(in srgb, var(--accent) 20%, transparent)",
                      color: "var(--text)",
                    }
                  : undefined
              }
            >
              <span aria-hidden>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <Panel className="flex min-h-[24rem] flex-col gap-4">
          {messages.length === 0 && (
            <div className="grid flex-1 place-items-center gap-4 py-10 text-center">
              <div className="text-5xl" aria-hidden>
                🌌
              </div>
              <div>
                <h2 className="text-lg font-bold">Ask me anything</h2>
                <p className="mx-auto mt-1.5 max-w-md text-sm text-[var(--text-muted)]">
                  I run on the built-in Helix Offline Engine: a real maths solver, a curated knowledge
                  base and your question bank. Nothing here is a canned reply.
                </p>
              </div>
              <div className="flex max-w-lg flex-wrap justify-center gap-1.5">
                {(SUGGESTIONS[mode] ?? SUGGESTIONS["deep-think"]).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="chip hover:border-[var(--accent)] hover:text-[var(--text)]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <span
                  aria-hidden
                  className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-[rgba(168,85,247,0.18)] text-sm"
                >
                  🧠
                </span>
              )}
              <div
                className={`max-w-[min(46rem,92%)] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "bg-[linear-gradient(120deg,rgba(124,58,237,0.85),rgba(34,211,238,0.65))] text-white"
                    : "border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-solid)_45%,transparent)]"
                }`}
              >
                {message.role === "assistant" ? (
                  <Markdown content={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                {message.role === "assistant" && (
                  <div className="mt-2.5 border-t border-[var(--panel-border)] pt-2 text-[0.66rem] text-[var(--text-muted)]">
                    {message.provider === "helix-engine"
                      ? "Generated locally by the Helix Offline Engine — free, no paid API."
                      : message.provider === "user"
                        ? "You"
                        : `Generated by ${message.provider}.`}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-xl bg-[rgba(168,85,247,0.18)] text-sm">
                🧠
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--panel-border)] px-4 py-3">
                <span className="size-1.5 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 animate-bounce rounded-full bg-[var(--accent-2)]" style={{ animationDelay: "120ms" }} />
                <span className="size-1.5 animate-bounce rounded-full bg-[var(--accent-3)]" style={{ animationDelay: "240ms" }} />
                <span className="ml-2 text-xs text-[var(--text-muted)]">Thinking…</span>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border-l-[3px] border-l-[#f59e0b] bg-[rgba(245,158,11,0.12)] px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div ref={endRef} />
        </Panel>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="panel flex items-end gap-2 p-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={`Ask in ${activeMode.label} mode… (Enter to send, Shift+Enter for a new line)`}
            className="field max-h-40 min-h-[2.75rem] flex-1 resize-y"
            aria-label="Your question"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary shrink-0">
            {loading ? "…" : "Send"}
          </button>
        </form>

        <p className="px-1 text-center text-[0.7rem] text-[var(--text-muted)]">
          HELIXEDU never claims an AI connection it does not have. When no provider is configured, every
          answer comes from the offline Helix Engine running on this server.{" "}
          <Link href="/settings" className="underline hover:text-[var(--text)]">
            Provider settings
          </Link>
        </p>
      </div>
    </div>
  );
}
