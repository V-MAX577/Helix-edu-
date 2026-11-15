"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chip, Markdown, Panel, ProgressBar, ProgressRing } from "./ui";
import type { DailyChallenge } from "@/lib/daily";

/* ------------------------------------------------------------------ */
/*  Greeting                                                          */
/* ------------------------------------------------------------------ */

export function WelcomeBanner({
  name,
  streak,
  percent,
  lessonsCompleted,
  lessonsTotal,
}: {
  name: string;
  streak: number;
  percent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Still exploring" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Working late";
  const firstName = name.split(" ")[0];

  return (
    <Panel className="relative overflow-hidden glow-violet">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 0%, rgba(168,85,247,0.28), transparent 45%), radial-gradient(circle at 90% 100%, rgba(34,211,238,0.18), transparent 45%)",
        }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.2em] text-[var(--text-muted)] uppercase">{greeting}</p>
          <h1 className="mt-1.5 text-[clamp(1.5rem,3.4vw,2.2rem)] leading-tight font-extrabold tracking-tight">
            Welcome back, <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="mt-2 max-w-lg text-sm text-[var(--text-muted)]">
            {streak > 0
              ? `You are on a ${streak}-day learning streak. Keep the helix spinning.`
              : "Start a lesson today and begin your first learning streak."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/assistant" className="btn btn-primary btn-sm">
              🧠 Ask the assistant
            </Link>
            <Link href="/learn" className="btn btn-ghost btn-sm">
              📚 Continue learning
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <ProgressRing
            value={percent}
            size={104}
            label={`${percent}%`}
            sublabel="Course"
          />
          <div className="text-sm">
            <div className="font-bold tabular-nums">
              {lessonsCompleted}/{lessonsTotal}
            </div>
            <div className="text-xs text-[var(--text-muted)]">lessons done</div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick ask — a real call to the assistant API                       */
/* ------------------------------------------------------------------ */

const MODES = [
  { id: "deep-think", label: "🌌 Deep Think" },
  { id: "quick-learn", label: "⚡ Quick Learn" },
  { id: "exam-prep", label: "🎯 Exam Prep" },
  { id: "creative", label: "🎨 Creative" },
  { id: "coding", label: "💻 Coding" },
];

export function QuickAsk() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("deep-think");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pending = useMemo(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("helixedu_pending_question");
  }, []);

  useEffect(() => {
    if (pending) {
      // Transfer a one-time navigation value from session storage after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestion(pending);
      sessionStorage.removeItem("helixedu_pending_question");
    }
  }, [pending]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setReply(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setReply(data.reply);
      setProviderLabel(data.providerLabel);
      router.refresh();
    } catch {
      setError("Could not reach the assistant. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel className="flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <span aria-hidden>🧠</span> AI Study Assistant
        </h2>
        <Link href="/assistant" className="text-xs font-semibold text-[var(--accent)] hover:underline">
          Open full chat →
        </Link>
      </div>

      <form onSubmit={ask} className="grid gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className="chip"
              style={
                mode === m.id
                  ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 20%, transparent)", color: "var(--text)" }
                  : undefined
              }
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything — e.g. 'explain photosynthesis' or 'solve 2x + 5 = 17'"
            className="field"
            maxLength={4000}
            aria-label="Your question"
          />
          <button type="submit" disabled={loading || !question.trim()} className="btn btn-primary shrink-0">
            {loading ? "…" : "Ask"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 rounded-xl border-l-[3px] border-l-[#f59e0b] bg-[rgba(245,158,11,0.12)] px-3 py-2 text-sm">
          ⚠️ {error}
        </p>
      )}

      {reply && (
        <div className="mt-4 max-h-[22rem] overflow-y-auto rounded-2xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-solid)_45%,transparent)] p-4">
          <Markdown content={reply} />
          <div className="mt-3 border-t border-[var(--panel-border)] pt-2.5 text-[0.68rem] text-[var(--text-muted)]">
            Answered by <strong>{providerLabel}</strong>
            {providerLabel?.includes("Offline") && " — free, local, no paid API used."}
          </div>
        </div>
      )}

      {!reply && !loading && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Explain Newton's laws", "What is 15% of 240?", "Practice questions on fractions", "Make a 5-day revision plan"].map(
            (suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuestion(suggestion)}
                className="chip hover:border-[var(--accent)] hover:text-[var(--text)]"
              >
                {suggestion}
              </button>
            ),
          )}
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Daily challenge                                                   */
/* ------------------------------------------------------------------ */

const TASK_KEY = (day: string) => `helixedu_challenge_${day}`;

export function DailyChallengeCard({ challenge }: { challenge: DailyChallenge }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASK_KEY(challenge.dayKey));
      if (raw) {
        // Restore this device saved daily challenge state after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDone(JSON.parse(raw));
      }
    } catch {
      /* ignore */
    }
  }, [challenge.dayKey]);

  function toggle(id: string) {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(TASK_KEY(challenge.dayKey), JSON.stringify(next));
      return next;
    });
  }

  const completed = challenge.tasks.filter((t) => done[t.id]).length;
  const correct = selected !== null && challenge.question && selected === challenge.question.answerIndex;

  return (
    <Panel className="flex flex-col">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <span aria-hidden>🎯</span> Daily Learning Challenge
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Fresh every midnight · {completed}/{challenge.tasks.length} tasks done
          </p>
        </div>
        <Chip tone={completed === challenge.tasks.length ? "emerald" : "accent"}>
          {completed === challenge.tasks.length ? "Complete 🎉" : "In progress"}
        </Chip>
      </div>

      <div className="space-y-3">
        {challenge.question && (
          <div className="rounded-2xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-solid)_40%,transparent)] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.16em] text-[var(--text-muted)] uppercase">
              ❓ Question of the day
            </div>
            <p className="text-sm font-semibold">{challenge.question.prompt}</p>
            <div className="mt-3 grid gap-1.5">
              {challenge.question.options.map((option, index) => {
                const isChosen = selected === index;
                const isAnswer = index === challenge.question!.answerIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelected(index);
                      setRevealed(true);
                      if (index === challenge.question!.answerIndex) toggle("question");
                    }}
                    className="field text-left text-sm"
                    style={
                      revealed && isAnswer
                        ? { borderColor: "var(--accent-3)", background: "rgba(16,185,129,0.14)" }
                        : revealed && isChosen
                          ? { borderColor: "#f59e0b", background: "rgba(245,158,11,0.12)" }
                          : undefined
                    }
                  >
                    <span className="mr-2 font-bold text-[var(--text-muted)]">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <p className={`mt-2.5 text-sm ${correct ? "text-[#6ee7b7]" : "text-[#fcd34d]"}`}>
                {correct ? "✅ Correct! " : "💡 Not quite. "}
                {challenge.question.explanation}
              </p>
            )}
          </div>
        )}

        {challenge.flashcard && (
          <div className="rounded-2xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-solid)_40%,transparent)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs tracking-[0.16em] text-[var(--text-muted)] uppercase">🃏 Flashcard flip</span>
              <Link href="/flashcards" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                Review all →
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                setFlipped((v) => !v);
                if (!flipped) toggle("flashcards");
              }}
              className="w-full text-left"
            >
              <p className="text-sm font-semibold">{flipped ? challenge.flashcard.back : challenge.flashcard.front}</p>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">{flipped ? "Tap to flip back" : "Tap to reveal the answer"}</p>
            </button>
          </div>
        )}

        <div className="grid gap-1.5">
          {challenge.tasks.map((task) => {
            const isDone = Boolean(done[task.id]);
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--panel-border)] px-3 py-2.5"
                style={isDone ? { borderColor: "rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.1)" } : undefined}
              >
                <button
                  type="button"
                  onClick={() => toggle(task.id)}
                  aria-pressed={isDone}
                  aria-label={task.label}
                  className="grid size-5 shrink-0 place-items-center rounded-md border text-[0.65rem] font-bold"
                  style={{
                    borderColor: isDone ? "var(--accent-3)" : "var(--panel-border)",
                    background: isDone ? "var(--accent-3)" : "transparent",
                    color: isDone ? "#04231a" : "transparent",
                  }}
                >
                  ✓
                </button>
                <span className={`flex-1 text-sm ${isDone ? "text-[var(--text-muted)] line-through" : ""}`}>{task.label}</span>
                {task.href && !isDone && (
                  <Link href={task.href} className="text-xs font-semibold text-[var(--accent)] hover:underline">
                    Go →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/*  Daily goal                                                        */
/* ------------------------------------------------------------------ */

export function DailyGoalCard({ minutes, goal, streak, longest }: { minutes: number; goal: number; streak: number; longest: number }) {
  const pct = goal ? Math.min(100, Math.round((minutes / goal) * 100)) : 0;
  return (
    <Panel className="flex flex-col justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <span aria-hidden>⏱️</span> Daily Study Goal
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {minutes >= goal
            ? "Goal smashed today. Anything more is a bonus. 🎉"
            : `${goal - minutes} more minutes to hit today's goal.`}
        </p>
      </div>

      <div className="my-5 grid place-items-center">
        <ProgressRing value={pct} size={128} label={`${minutes}`} sublabel={`of ${goal} min`} />
      </div>

      <div className="space-y-2.5">
        <ProgressBar value={minutes} max={goal} label="Today" />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-[var(--panel-border)] p-2.5 text-center">
            <div className="text-xl font-extrabold tabular-nums">🔥 {streak}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)]">current streak</div>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] p-2.5 text-center">
            <div className="text-xl font-extrabold tabular-nums">🏅 {longest}</div>
            <div className="text-[0.65rem] text-[var(--text-muted)]">best streak</div>
          </div>
        </div>
        <Link href="/settings" className="btn btn-ghost btn-sm w-full">
          Change my daily goal
        </Link>
      </div>
    </Panel>
  );
}
