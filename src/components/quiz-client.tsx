"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitQuizAction } from "@/app/actions";
import { Chip, Panel, ProgressBar } from "./ui";

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type QuizResult = {
  attemptId: string;
  score: number;
  total: number;
  percent: number;
  detail: {
    questionId: string;
    prompt: string;
    options: string[];
    chosen: number;
    answerIndex: number;
    explanation: string;
    correct: boolean;
  }[];
  unlocked?: string[];
};

export function QuizTaker({
  quizId,
  quizTitle,
  quizDescription,
  timeLimitSec,
  difficulty,
  subjectName,
  subjectSlug,
  questions,
}: {
  quizId: string;
  quizTitle: string;
  quizDescription: string;
  timeLimitSec: number;
  difficulty: string;
  subjectName: string;
  subjectSlug: string;
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSec);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);

  const answeredCount = Object.keys(answers).length;
  const question = questions[current];

  const submit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    setError(null);
    try {
      const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const res = await submitQuizAction(quizId, answers, elapsed);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setResult(res as QuizResult);
      router.refresh();
    } catch {
      setError("Could not submit your attempt. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [answers, quizId, result, router, startedAt, submitting]);

  useEffect(() => {
    if (result) return;
    if (secondsLeft <= 0) {
      const submitTimer = setTimeout(() => void submit(), 0);
      return () => clearTimeout(submitTimer);
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, result, submit]);

  const timeLabel = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  if (result) {
    const passed = result.percent >= 50;
    return (
      <div className="mx-auto grid max-w-3xl gap-4">
        <Panel className="relative overflow-hidden text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: passed
                ? "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.24), transparent 55%)"
                : "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.22), transparent 55%)",
            }}
          />
          <div className="relative py-4">
            <div className="text-5xl" aria-hidden>
              {result.percent === 100 ? "🏆" : passed ? "🎉" : "💪"}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              {result.score} / {result.total}
            </h1>
            <p className="mt-1 text-[var(--text-muted)]">
              {result.percent}% · {quizTitle}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-muted)]">
              {result.percent === 100
                ? "Flawless run. Every single answer correct."
                : passed
                  ? "Solid work. Read the explanations below to close the remaining gaps."
                  : "Good effort. Every explanation below is worth reading — that is where the marks are."}
            </p>
            {result.unlocked && result.unlocked.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                <span className="text-xs text-[var(--text-muted)]">New achievements:</span>
                {result.unlocked.map((name) => (
                  <Chip key={name} tone="gold">
                    🏅 {name}
                  </Chip>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/quizzes" className="btn btn-ghost btn-sm">
                All quizzes
              </Link>
              <Link href={`/learn/${subjectSlug}`} className="btn btn-ghost btn-sm">
                📚 {subjectName} lessons
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrent(0);
                  setSecondsLeft(timeLimitSec);
                }}
                className="btn btn-primary btn-sm"
              >
                Retry this quiz
              </button>
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-bold">Answer review</h2>
          <div className="grid gap-3">
            {result.detail.map((item, index) => (
              <div
                key={item.questionId}
                className="rounded-2xl border p-4"
                style={{ borderColor: item.correct ? "rgba(16,185,129,0.35)" : "rgba(245,158,11,0.35)" }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg" aria-hidden>
                    {item.correct ? "✅" : "❌"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {index + 1}. {item.prompt}
                    </p>
                    <div className="mt-2 grid gap-1">
                      {item.options.map((option, oi) => {
                        const isAnswer = oi === item.answerIndex;
                        const isChosen = oi === item.chosen;
                        return (
                          <div
                            key={oi}
                            className="rounded-lg px-2.5 py-1.5 text-sm"
                            style={
                              isAnswer
                                ? { background: "rgba(16,185,129,0.14)", color: "#a7f3d0" }
                                : isChosen
                                  ? { background: "rgba(245,158,11,0.12)", color: "#fcd34d" }
                                  : undefined
                            }
                          >
                            <strong className="mr-1.5">{String.fromCharCode(65 + oi)}</strong>
                            {option}
                            {isAnswer && " ✓ correct"}
                            {isChosen && !isAnswer && " ← your answer"}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">{item.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(168,85,247,0.2), transparent 45%), radial-gradient(circle at 90% 100%, rgba(34,211,238,0.12), transparent 45%)",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/quizzes" className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
              ← All quizzes
            </Link>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{quizTitle}</h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">{quizDescription}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone="accent">{subjectName}</Chip>
              <Chip tone={difficulty === "easy" ? "emerald" : difficulty === "hard" ? "gold" : "accent"}>{difficulty}</Chip>
              <Chip>{questions.length} questions</Chip>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold tabular-nums" style={{ color: secondsLeft < 30 ? "#fcd34d" : undefined }}>
              {timeLabel}
            </div>
            <div className="text-xs text-[var(--text-muted)]">time remaining</div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm font-bold">
            Question {current + 1} of {questions.length}
          </span>
          <span className="text-xs text-[var(--text-muted)]">{answeredCount} answered</span>
        </div>
        <ProgressBar value={current + 1} max={questions.length} />

        <div className="mt-6">
          <p className="text-lg leading-snug font-semibold">{question.prompt}</p>
          <div className="mt-4 grid gap-2">
            {question.options.map((option, index) => {
              const selected = answers[question.id] === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
                  className="field flex items-center gap-3 text-left"
                  style={
                    selected
                      ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 16%, transparent)" }
                      : undefined
                  }
                >
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold"
                    style={{
                      background: selected ? "var(--accent)" : "rgba(168,85,247,0.14)",
                      color: selected ? "#fff" : "var(--accent)",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn btn-ghost btn-sm"
          >
            ← Previous
          </button>

          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, index) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Go to question ${index + 1}`}
                className="size-7 rounded-lg text-[0.7rem] font-bold transition"
                style={{
                  border: "1px solid var(--panel-border)",
                  background:
                    index === current
                      ? "var(--accent)"
                      : answers[q.id] !== undefined
                        ? "rgba(16,185,129,0.25)"
                        : "transparent",
                  color: index === current ? "#fff" : "var(--text)",
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {current < questions.length - 1 ? (
            <button type="button" onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))} className="btn btn-primary btn-sm">
              Next →
            </button>
          ) : (
            <button type="button" onClick={() => void submit()} disabled={submitting} className="btn btn-emerald btn-sm">
              {submitting ? "Submitting…" : "Submit quiz"}
            </button>
          )}
        </div>
      </Panel>

      {error && (
        <div role="alert" className="rounded-xl border-l-[3px] border-l-[#f59e0b] bg-[rgba(245,158,11,0.12)] px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">
          {answeredCount === questions.length
            ? "All questions answered. Ready when you are."
            : `${questions.length - answeredCount} question(s) still unanswered — unanswered questions score zero.`}
        </p>
        <button type="button" onClick={() => void submit()} disabled={submitting} className="btn btn-primary btn-sm">
          {submitting ? "Submitting…" : "Submit now"}
        </button>
      </Panel>
    </div>
  );
}
