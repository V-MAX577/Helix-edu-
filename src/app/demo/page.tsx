"use client";

import Link from "next/link";
import { useState } from "react";

const subjects = [
  { icon: "📐", name: "Mathematics", detail: "Fractions, algebra and geometry", lessons: 12 },
  { icon: "🔬", name: "Science", detail: "Physics, chemistry and biology", lessons: 9 },
  { icon: "📖", name: "English", detail: "Grammar, reading and writing", lessons: 6 },
  { icon: "🌍", name: "Geography", detail: "Earth, climate and maps", lessons: 5 },
];

const question = {
  prompt: "What is 20% of 250?",
  options: ["25", "50", "75", "100"],
  answer: 1,
  explanation: "20% = 0.20, and 0.20 × 250 = 50.",
};

export default function DemoPage() {
  const [tab, setTab] = useState("overview");
  const [answer, setAnswer] = useState<number | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 lg:px-8">
        <Link href="/" className="font-extrabold tracking-[0.16em] text-gradient">HELIXEDU</Link>
        <span className="chip chip-emerald">DEMO MODE · SAMPLE DATA</span>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 lg:px-8">
        <section className="panel relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 85% 10%, rgba(168,85,247,.25), transparent 42%), radial-gradient(circle at 10% 90%, rgba(34,211,238,.12), transparent 40%)" }} />
          <div className="relative">
            <p className="chip chip-accent">🚀 YOUR LEARNING UNIVERSE</p>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Welcome, Explorer.</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">This is a working HELIXEDU preview. Explore sample lessons, try a quiz and flip a flashcard. No account, database or AI key required.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["8","Subjects"],["43","Sample lessons"],["6","Quiz questions"],["100%","Demo access"]].map(([value,label]) => (
                <div className="rounded-xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel)_75%,transparent)] p-3" key={label}>
                  <div className="text-2xl font-extrabold">{value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <nav className="my-6 flex flex-wrap gap-2" aria-label="Demo sections">
          {[
            ["overview","Overview"],["lessons","Lessons"],["quiz","Quick quiz"],["flashcards","Flashcards"]
          ].map(([value,label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} className={`btn btn-sm ${tab === value ? "btn-primary" : "btn-ghost"}`}>{label}</button>
          ))}
        </nav>

        {tab === "overview" && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div><h2 className="text-2xl font-extrabold">Explore subjects</h2><p className="mt-1 text-sm text-[var(--text-muted)]">A sample of the HELIXEDU curriculum.</p></div>
              <span className="text-xs text-[var(--text-muted)]">Preview content</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {subjects.map((subject) => (
                <button type="button" key={subject.name} onClick={() => setTab("lessons")} className="panel p-5 text-left transition hover:-translate-y-0.5">
                  <div className="text-3xl">{subject.icon}</div><h3 className="mt-3 font-bold">{subject.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{subject.detail}</p>
                  <p className="mt-4 text-xs text-[var(--text-muted)]">{subject.lessons} sample lessons →</p>
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="panel p-5"><h3 className="font-bold">📈 Learning progress</h3><p className="mt-2 text-sm text-[var(--text-muted)]">Demo progress is illustrative and is not saved to an account.</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--panel-border)]"><div className="h-full w-3/5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" /></div><p className="mt-2 text-xs text-[var(--text-muted)]">3 of 5 example activities explored</p></div>
              <div className="panel p-5"><h3 className="font-bold">🗓️ Today's study plan</h3><label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" checked={done} onChange={(event) => setDone(event.target.checked)} /> Revise fractions for 10 minutes</label><p className="mt-3 text-xs text-[var(--text-muted)]">{done ? "Marked complete in this demo session." : "Tick the task to try the planner interaction."}</p></div>
            </div>
          </section>
        )}

        {tab === "lessons" && (
          <section>
            <h2 className="text-2xl font-extrabold">Sample lesson: Fractions</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Mathematics · Beginner · 5 minute read</p>
            <article className="panel mt-4 space-y-4 p-5 sm:p-7">
              <div><h3 className="text-lg font-bold">What is a fraction?</h3><p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">A fraction represents part of a whole. The denominator tells you how many equal parts make the whole, while the numerator tells you how many parts you are considering.</p></div>
              <div className="rounded-xl border border-[var(--panel-border)] p-4 text-center"><p className="text-2xl font-extrabold">1/2 + 1/3 = 5/6</p><p className="mt-1 text-xs text-[var(--text-muted)]">Find a common denominator: 3/6 + 2/6 = 5/6.</p></div>
              <div><h3 className="font-bold">Remember</h3><p className="mt-2 text-sm text-[var(--text-muted)]">When adding fractions, convert them to equivalent fractions with the same denominator first.</p></div>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setTab("quiz")}>Try a practice question →</button>
            </article>
          </section>
        )}

        {tab === "quiz" && (
          <section className="panel p-5 sm:p-7">
            <p className="chip chip-accent">QUICK QUIZ · MATHEMATICS</p>
            <h2 className="mt-4 text-2xl font-extrabold">{question.prompt}</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {question.options.map((option,index) => (
                <button type="button" key={option} onClick={() => setAnswer(index)} className={`rounded-xl border p-4 text-left text-sm transition ${answer === index ? "border-violet-400 bg-violet-500/15" : "border-[var(--panel-border)]"}`}>{String.fromCharCode(65+index)}. {option}</button>
              ))}
            </div>
            {answer !== null && <div className="mt-5 rounded-xl border border-[var(--panel-border)] p-4"><p className="font-bold">{answer === question.answer ? "Correct answer." : "Not quite. Keep practising."}</p><p className="mt-1 text-sm text-[var(--text-muted)]">{question.explanation}</p></div>}
            <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => setAnswer(null)}>Reset question</button>
          </section>
        )}

        {tab === "flashcards" && (
          <section className="panel p-5 sm:p-7">
            <p className="chip chip-accent">FLASHCARD · MATHEMATICS</p>
            <h2 className="mt-4 text-2xl font-extrabold">Test your memory</h2>
            <button type="button" onClick={() => setShowCard(!showCard)} className="mt-5 flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel)_75%,transparent)] p-6 text-center">
              <span className="text-xs tracking-widest text-[var(--text-muted)]">{showCard ? "ANSWER" : "QUESTION"} · TAP TO FLIP</span>
              <span className="mt-4 text-xl font-bold">{showCard ? "1 (four quarters make a whole)." : "What is 3/4 + 1/4?"}</span>
            </button>
            <p className="mt-3 text-xs text-[var(--text-muted)]">This is a temporary demo interaction. Your response is not stored.</p>
          </section>
        )}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--panel-border)] pt-5 text-xs text-[var(--text-muted)]">
          <span>HELIXEDU · Demo mode · Sample data only</span>
          <Link href="/" className="hover:text-[var(--text)]">← Back to home</Link>
        </footer>
      </div>
    </main>
  );
}
