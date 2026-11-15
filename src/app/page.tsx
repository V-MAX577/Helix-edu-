import Link from "next/link";
import { Logo, Wordmark } from "@/components/ui";
import { LandingActions } from "./landing-actions";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "🧠",
    title: "AI Study Assistant",
    body: "Explains any topic in plain language, solves maths step by step, and generates practice questions. Adapts to your level.",
  },
  {
    icon: "📚",
    title: "Full Learning Centre",
    body: "Mathematics, Science, English, History, Geography, Computer Science, Languages and General Knowledge — chapter by chapter.",
  },
  {
    icon: "📝",
    title: "Quizzes & Tests",
    body: "Auto-marked multiple-choice tests with instant explanations for every answer, so you learn from every mistake.",
  },
  {
    icon: "🃏",
    title: "Spaced-Repetition Flashcards",
    body: "A real Leitner scheduling system: cards you struggle with come back sooner, cards you know appear later.",
  },
  {
    icon: "📈",
    title: "Progress & Streaks",
    body: "Daily goals, learning streaks and twelve achievements — all computed from work you actually completed.",
  },
  {
    icon: "🗓️",
    title: "Study Planner",
    body: "Build a real revision timetable from your subjects and available minutes, then tick it off day by day.",
  },
];

const MODES = [
  { name: "Deep Think", icon: "🌌", body: "Thorough explanations with definitions, worked examples and common mistakes." },
  { name: "Quick Learn", icon: "⚡", body: "Short, punchy answers for revision on the move or a quick concept refresh." },
  { name: "Exam Preparation", icon: "🎯", body: "Key exam points, likely questions and fast revision notes." },
  { name: "Creative Mode", icon: "🎨", body: "Learn through stories, analogies and imagination, then see the real concept underneath." },
  { name: "Coding Mode", icon: "💻", icon2: "", body: "Programming from beginner to advanced with runnable code and line-by-line explanation." },
];

const STEPS = [
  { n: "01", title: "Open the Learning Centre", body: "No account, no card, no trial. Just start learning." },
  { n: "02", title: "Pick your class and board", body: "Maharashtra State Board and other boards, from Class 1 to competitive level." },
  { n: "03", title: "Learn, practise, track", body: "Lessons, quizzes, flashcards and a planner that keeps your streak alive." },
];

export default async function LandingPage() {
  const rows = [
    { id: "math", slug: "mathematics", name: "Mathematics", tagline: "Numbers, patterns and the language of the universe", icon: "📐" },
    { id: "science", slug: "science", name: "Science", tagline: "Explore how the universe works", icon: "🔬" },
    { id: "english", slug: "english", name: "English", tagline: "Read, write and communicate clearly", icon: "📖" },
    { id: "history", slug: "history", name: "History", tagline: "Understand the stories that shaped us", icon: "🏛️" },
    { id: "geography", slug: "geography", name: "Geography", tagline: "Discover Earth and its systems", icon: "🌍" },
    { id: "computers", slug: "computer-science", name: "Computer Science", tagline: "Build logic and digital skills", icon: "💻" },
    { id: "languages", slug: "languages", name: "Languages", tagline: "Learn to communicate across cultures", icon: "🗣️" },
    { id: "general", slug: "general-knowledge", name: "General Knowledge", tagline: "Curiosity without borders", icon: "🌌" },
  ];

  return (
    <div className="min-h-dvh">
      {/* ---------------------------------------------------------------- */}
      {/*  Hero                                                           */}
      {/* ---------------------------------------------------------------- */}
      <header className="mx-auto max-w-6xl px-5 pt-6 pb-4 lg:px-8">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="HELIXEDU home">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/demo" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              🔍 Search lessons
            </Link>
            <Link href="/demo" className="btn btn-primary btn-sm">
              Explore demo →
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pt-10 pb-16 text-center lg:px-8 lg:pt-16">
          <div className="animate-rise mx-auto mb-7 grid size-20 place-items-center rounded-3xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] glow-violet lg:size-24">
            <Logo size={56} />
          </div>

          <p className="animate-rise chip chip-accent mx-auto mb-5" style={{ animationDelay: "60ms" }}>
            🚀 The future of learning is here
          </p>

          <h1
            className="animate-rise mx-auto max-w-4xl text-[clamp(2.4rem,7vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.03em]"
            style={{ animationDelay: "100ms" }}
          >
            <span className="text-gradient">HELIXEDU</span>
            <br />
            <span className="text-[0.42em] font-semibold tracking-[0.02em] text-[var(--text-muted)]">
              Unlock Your Mind. Explore Infinity.
            </span>
          </h1>

          <p
            className="animate-rise mx-auto mt-7 max-w-2xl text-base text-[var(--text-muted)] sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            A cosmic, AI-powered education platform with real lessons, auto-marked quizzes,
            spaced-repetition flashcards and a study assistant that actually works — built to run
            fast on any Android phone, even with a weak connection.
          </p>

          <LandingActions />

          <dl
            className="animate-rise mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
            style={{ animationDelay: "320ms" }}
          >
            {[
              { k: "8", v: "Subjects" },
              { k: "27", v: "Chapters" },
              { k: "43", v: "Lessons" },
              { k: "0 ₹", v: "Forever free" },
            ].map((stat) => (
              <div key={stat.v} className="panel px-3 py-4">
                <dt className="text-2xl font-extrabold tabular-nums">{stat.k}</dt>
                <dd className="mt-0.5 text-xs text-[var(--text-muted)]">{stat.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Subjects                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Explore the galaxy of subjects</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--text-muted)]">
              Chapter-wise content with lessons, flashcards and quizzes for every subject — mapped to
              class, board and level.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rows.map((subject) => (
              <Link
                key={subject.id}
                href="/demo"
                className="panel group flex items-center gap-3.5 p-4 transition hover:-translate-y-0.5"
              >
                <span
                  aria-hidden
                  className="grid size-11 shrink-0 place-items-center rounded-xl text-xl transition group-hover:scale-110"
                  style={{ background: "rgba(168,85,247,0.16)" }}
                >
                  {subject.icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold">{subject.name}</span>
                  <span className="block truncate text-xs text-[var(--text-muted)]">{subject.tagline}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  AI modes                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Five ways to learn anything</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--text-muted)]">
              Switch the assistant&apos;s mode and the same question gets a completely different, purpose-built answer.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((mode) => (
              <div key={mode.name} className="panel p-5">
                <div className="mb-3 text-2xl" aria-hidden>
                  {mode.icon}
                  {mode.icon2}
                </div>
                <h3 className="font-bold">{mode.name}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-muted)]">{mode.body}</p>
              </div>
            ))}
            <div className="panel grid place-items-center p-5 text-center">
              <div>
                <div className="text-2xl" aria-hidden>
                  🛡️
                </div>
                <h3 className="mt-2 font-bold">Honest by design</h3>
                <p className="mt-1.5 text-sm text-[var(--text-muted)]">
                  If no AI provider is connected, the app says so plainly and uses the built-in
                  offline engine. No fake answers, no fake integrations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Features                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Everything a student actually needs</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="panel p-5">
                <div className="mb-3 text-2xl" aria-hidden>
                  {feature.icon}
                </div>
                <h3 className="font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-muted)]">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Free mode                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
          <div className="panel relative overflow-hidden p-8 text-center glow-violet">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.22), transparent 45%), radial-gradient(circle at 80% 80%, rgba(34,211,238,0.16), transparent 45%)",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight">
                A free mode that never needs a paid API
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[var(--text-muted)]">
                HELIXEDU ships with a complete offline learning engine: a real step-by-step maths
                solver, a curated knowledge base and a question bank that all run on the server. You
                can learn every day without spending a rupee.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-muted)]">
                Want a large language model too? An administrator can connect an optional provider —
                OpenAI, OpenRouter, Groq, Gemini, Anthropic or any self-hosted endpoint. Keys stay on
                the server, are never sent to your browser, and the interface always tells you which
                brain answered.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                <span className="chip chip-emerald">No payment details</span>
                <span className="chip chip-cyan">No API keys in the browser</span>
                <span className="chip chip-accent">Works offline</span>
                <span className="chip chip-gold">Low data usage</span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  How it works                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="panel p-5">
                <div className="text-gradient text-3xl font-extrabold">{step.n}</div>
                <h3 className="mt-2 font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-muted)]">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Final CTA                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8">
          <h2 className="text-[clamp(1.9rem,4.5vw,3rem)] leading-tight font-extrabold tracking-tight">
            Your universe of knowledge <span className="text-gradient">starts here</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--text-muted)]">
            Join HELIXEDU and turn curiosity into mastery — one chapter, one quiz, one streak at a time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/demo" className="btn btn-primary px-7 py-3 text-base">
              Enter HELIXEDU
            </Link>
            <Link href="/demo" className="btn btn-ghost px-7 py-3 text-base">
              Browse lessons
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--panel-border)] px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[var(--text-muted)] sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-bold tracking-[0.14em] text-[var(--text)]">HELIXEDU</span>
          </div>
          <p className="text-center text-xs">
            Unlock Your Mind. Explore Infinity. — Built for students on every device.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/demo" className="hover:text-[var(--text)]">
              Learn
            </Link>
            <Link href="/demo" className="hover:text-[var(--text)]">
              Assistant
            </Link>
            <Link href="/demo" className="hover:text-[var(--text)]">
              AI providers
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
