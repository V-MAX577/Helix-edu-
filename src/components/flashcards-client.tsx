"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reviewFlashcardAction } from "@/app/actions";
import { Chip, Panel, ProgressBar } from "./ui";

export type DeckCard = {
  id: string;
  front: string;
  back: string;
  hint: string;
  subjectName: string;
  subjectSlug: string;
  subjectIcon: string;
  box: number;
  dueAt: string | null;
  seen: number;
  isDue: boolean;
};

const BOX_LABELS = ["New", "Learning", "Familiar", "Strong", "Mastered", "Permanent"];

export function FlashcardsClient({
  cards,
  dueCount,
  totalCards,
  reviewedToday,
  mastered,
}: {
  cards: DeckCard[];
  dueCount: number;
  totalCards: number;
  reviewedToday: number;
  mastered: number;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState<string>("all");
  const [onlyDue, setOnlyDue] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionSeen, setSessionSeen] = useState(0);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const subjects = useMemo(() => {
    const map = new Map<string, { name: string; icon: string }>();
    for (const card of cards) map.set(card.subjectSlug, { name: card.subjectName, icon: card.subjectIcon });
    return [...map.entries()];
  }, [cards]);

  const queue = useMemo(() => {
    return cards.filter((card) => {
      if (subject !== "all" && card.subjectSlug !== subject) return false;
      if (!onlyDue) return true;
      return card.isDue;
    });
  }, [cards, subject, onlyDue]);

  const card = queue[Math.min(index, Math.max(0, queue.length - 1))];

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setHintShown(false);
  }, [subject, onlyDue]);

  async function grade(correct: boolean) {
    if (!card || busy) return;
    setBusy(true);
    const result = await reviewFlashcardAction(card.id, correct);
    setBusy(false);
    setSessionSeen((n) => n + 1);
    if (correct) setSessionCorrect((n) => n + 1);
    setLastResult(
      correct
        ? `Nice — scheduled again in ${result?.dueInDays ?? 1} day(s).`
        : "No problem — this card comes back tomorrow.",
    );
    setFlipped(false);
    setHintShown(false);
    setIndex((i) => (i + 1) % Math.max(1, queue.length));
    router.refresh();
  }

  if (!cards.length) {
    return (
      <EmptyDecks />
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(16,185,129,0.18), transparent 45%), radial-gradient(circle at 92% 100%, rgba(34,211,238,0.12), transparent 45%)",
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
              Flashcards & <span className="text-gradient">Revision</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
              A Leitner spaced-repetition system. Cards you find hard return tomorrow; cards you know
              come back after 2, 4, 8 then 16 days.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-[var(--panel-border)] px-4 py-2.5">
              <div className="text-xl font-extrabold tabular-nums">{dueCount}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">due now</div>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] px-4 py-2.5">
              <div className="text-xl font-extrabold tabular-nums">{reviewedToday}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">reviewed</div>
            </div>
            <div className="rounded-xl border border-[var(--panel-border)] px-4 py-2.5">
              <div className="text-xl font-extrabold tabular-nums">{mastered}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">mastered</div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSubject("all")}
          className="chip"
          style={subject === "all" ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 20%, transparent)", color: "var(--text)" } : undefined}
        >
          All subjects
        </button>
        {subjects.map(([slug, info]) => (
          <button
            key={slug}
            type="button"
            onClick={() => setSubject(slug)}
            className="chip"
            style={subject === slug ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 20%, transparent)", color: "var(--text)" } : undefined}
          >
            <span aria-hidden>{info.icon}</span> {info.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOnlyDue((v) => !v)}
          className="chip ml-auto"
          style={onlyDue ? { borderColor: "var(--accent-3)", background: "rgba(16,185,129,0.16)", color: "#6ee7b7" } : undefined}
        >
          {onlyDue ? "✓ Due only" : "Show all cards"}
        </button>
      </Panel>

      {queue.length === 0 ? (
        <Panel className="grid place-items-center gap-4 py-14 text-center">
          <div className="text-5xl" aria-hidden>
            🎉
          </div>
          <h2 className="text-lg font-bold">
            {onlyDue ? "Nothing due right now" : "No cards in this deck"}
          </h2>
          <p className="max-w-md text-sm text-[var(--text-muted)]">
            {onlyDue
              ? "You have reviewed every card that was scheduled for today. Come back tomorrow, or switch to 'Show all cards' to revise early."
              : "Pick another subject to revise."}
          </p>
          {onlyDue && (
            <button type="button" onClick={() => setOnlyDue(false)} className="btn btn-primary btn-sm">
              Revise early anyway
            </button>
          )}
        </Panel>
      ) : (
        <>
          <Panel className="grid gap-4">
            <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
              <span>
                Card {Math.min(index + 1, queue.length)} of {queue.length}
              </span>
              <span className="flex items-center gap-2">
                <Chip tone="cyan">{card.subjectName}</Chip>
                <Chip tone={card.box >= 4 ? "emerald" : "accent"}>{BOX_LABELS[card.box] ?? "Learning"}</Chip>
              </span>
            </div>
            <ProgressBar value={index} max={Math.max(1, queue.length)} />

            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              className="grid min-h-[13rem] w-full place-items-center rounded-2xl border border-[var(--panel-border)] p-6 text-center transition"
              style={{
                background: flipped
                  ? "linear-gradient(140deg, rgba(16,185,129,0.16), rgba(34,211,238,0.1))"
                  : "linear-gradient(140deg, rgba(168,85,247,0.16), rgba(124,58,237,0.08))",
              }}
            >
              <span>
                <span className="block text-[0.68rem] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                  {flipped ? "Answer" : "Question"}
                </span>
                <span className="mt-3 block text-lg font-bold">{flipped ? card.back : card.front}</span>
                <span className="mt-3 block text-xs text-[var(--text-muted)]">
                  {flipped ? "Tap to flip back" : "Tap to reveal the answer"}
                </span>
              </span>
            </button>

            {!flipped && card.hint && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--text-muted)]">
                  {hintShown ? `💡 ${card.hint}` : "Need a nudge?"}
                </span>
                <button type="button" onClick={() => setHintShown(true)} className="btn btn-ghost btn-sm">
                  Show hint
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => grade(false)} disabled={busy || !flipped} className="btn btn-ghost">
                {busy ? "…" : "↻ Again"}
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                Session: {sessionCorrect}/{sessionSeen} correct
              </span>
              <button type="button" onClick={() => grade(true)} disabled={busy || !flipped} className="btn btn-emerald">
                {busy ? "…" : "✓ Got it"}
              </button>
            </div>

            {lastResult && <p className="text-center text-xs text-[var(--text-muted)]">{lastResult}</p>}
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel>
              <h2 className="mb-2 font-bold">How this works</h2>
              <ul className="grid gap-1.5 text-sm text-[var(--text-muted)]">
                <li>· Tap the card to reveal the answer before grading yourself honestly.</li>
                <li>· <strong>Got it</strong> moves the card to the next box, doubling the gap.</li>
                <li>· <strong>Again</strong> resets it to box 1 so it returns tomorrow.</li>
                <li>· Box 4 or higher counts as mastered.</li>
              </ul>
            </Panel>
            <Panel>
              <h2 className="mb-2 font-bold">Deck size</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {totalCards} cards across {subjects.length} subjects, {dueCount} due today and {mastered}{" "}
                already mastered.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/learn" className="btn btn-ghost btn-sm">
                  📚 Read lessons
                </Link>
                <Link href="/quizzes" className="btn btn-ghost btn-sm">
                  📝 Take a quiz
                </Link>
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyDecks() {
  return (
    <div className="mx-auto max-w-2xl">
      <Panel className="grid place-items-center gap-4 py-14 text-center">
        <div className="text-5xl" aria-hidden>
          🃏
        </div>
        <h2 className="text-lg font-bold">No flashcards available</h2>
        <p className="max-w-md text-sm text-[var(--text-muted)]">
          Flashcards are generated from the curriculum. If this stays empty, the database seed may not
          have run yet.
        </p>
        <Link href="/learn" className="btn btn-primary btn-sm">
          Browse the Learning Centre
        </Link>
      </Panel>
    </div>
  );
}
