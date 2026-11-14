"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DEMO = [
  "Explain photosynthesis",
  "Solve 2x + 5 = 17",
  "What is 15% of 240?",
  "Practice questions on algebra",
];

export function LandingActions() {
  const [theme, setTheme] = useState<"cosmos" | "light">("cosmos");

  useEffect(() => {
    const saved = localStorage.getItem("helixedu_theme");
    if (saved === "light" || saved === "cosmos") setTheme(saved);
  }, []);

  function toggleTheme() {
    const next = theme === "cosmos" ? "light" : "cosmos";
    setTheme(next);
    localStorage.setItem("helixedu_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <div className="animate-rise mt-9 flex flex-col items-center gap-5" style={{ animationDelay: "220ms" }}>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className="btn btn-primary px-7 py-3 text-base">
          🚀 Enter HELIXEDU
        </Link>
        <Link href="/learn" className="btn btn-ghost px-7 py-3 text-base">
          Browse lessons
        </Link>
        <button type="button" onClick={toggleTheme} className="btn btn-ghost btn-icon" aria-label="Toggle light and dark theme">
          {theme === "cosmos" ? "🌙" : "☀️"}
        </button>
      </div>

      <div className="w-full max-w-xl">
        <p className="mb-2.5 text-xs tracking-[0.18em] text-[var(--text-muted)] uppercase">
          No account needed — try the assistant with a real question
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {DEMO.map((q) => (
            <Link key={q} href={`/assistant?q=${encodeURIComponent(q)}`} className="chip hover:border-[var(--accent)] hover:text-[var(--text)]">
              {q}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
