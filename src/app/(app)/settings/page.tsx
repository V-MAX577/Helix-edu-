import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { listProviders } from "@/lib/ai";
import { getStats, getStreak } from "@/lib/progress";
import { Chip, Panel } from "@/components/ui";
import { SettingsForm, ThemeControls } from "./settings-client";

export const dynamic = "force-dynamic";

const BOARDS = [
  "Maharashtra State Board",
  "CBSE",
  "ICSE",
  "IB / Cambridge",
  "State Board (other)",
  "Competitive exams",
];

const CLASSES = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "Undergraduate", "Competitive exams",
];

const LEVELS = [
  { id: "beginner", label: "Beginner — simple language" },
  { id: "intermediate", label: "Intermediate — balanced detail" },
  { id: "advanced", label: "Advanced — deep and precise" },
];

const AVATARS = ["🚀", "🧠", "🌟", "🦉", "🐉", "🌙", "⚡", "🔬", "🎯", "🧭"];

export default async function SettingsPage() {
  const user = await getLearner();

  const [profile, stats, streak, providers] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1),
    getStats(user.id),
    getStreak(user.id),
    Promise.resolve(listProviders()),
  ]);

  const p = profile[0];
  const connected = providers.filter((x) => x.id !== "helix-engine" && x.configured);

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(168,85,247,0.2), transparent 45%), radial-gradient(circle at 92% 100%, rgba(34,211,238,0.14), transparent 45%)",
          }}
        />
        <div className="relative">
          <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
            ⚙️ <span className="text-gradient">Settings</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Your class, board and learning level change how the assistant explains things. Your theme and
            text size are stored on this device.
          </p>
        </div>
      </Panel>

      {/* Profile */}
      <Panel>
        <h2 className="mb-4 text-lg font-bold">👤 Profile & learning preferences</h2>
        <SettingsForm
          defaults={{
            name: user.name,
            email: user.email,
            board: p?.board ?? "Maharashtra State Board",
            className: p?.className ?? "Class 10",
            level: p?.level ?? "intermediate",
            dailyGoalMinutes: p?.dailyGoalMinutes ?? 30,
            avatar: p?.avatar ?? "🚀",
          }}
          boards={BOARDS}
          classes={CLASSES}
          levels={LEVELS}
          avatars={AVATARS}
        />
      </Panel>

      {/* Appearance */}
      <Panel>
        <h2 className="mb-1 text-lg font-bold">🎨 Appearance & accessibility</h2>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          Saved on this device only, so HELIXEDU loads instantly the way you like it.
        </p>
        <ThemeControls />
      </Panel>

      {/* AI providers */}
      <Panel>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">🧠 AI provider integration</h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
              HELIXEDU always works through the built-in offline engine. If an administrator configures an
              external provider on the server, the assistant will use it and tell you so on every answer.
              API keys are read from server environment variables only — they are never sent to your
              browser and never exposed in the frontend.
            </p>
          </div>
          <Chip tone={connected.length ? "emerald" : "cyan"}>
            {connected.length ? `${connected.length} connected` : "offline mode"}
          </Chip>
        </div>

        <div className="grid gap-2.5">
          {providers.map((provider) => {
            const isEngine = provider.id === "helix-engine";
            return (
              <div
                key={provider.id}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: isEngine
                    ? "rgba(16,185,129,0.35)"
                    : provider.configured
                      ? "rgba(16,185,129,0.35)"
                      : "var(--panel-border)",
                  background: isEngine ? "rgba(16,185,129,0.07)" : undefined,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span aria-hidden>{isEngine ? "🛡️" : "🔌"}</span>
                    <span className="font-bold">{provider.label}</span>
                    {provider.freeTier && <Chip tone="emerald">free tier</Chip>}
                  </div>
                  <Chip tone={provider.configured ? "emerald" : "default"}>
                    {isEngine ? "always on" : provider.configured ? "connected" : "not configured"}
                  </Chip>
                </div>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{provider.note}</p>
                {isEngine && (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Covers: step-by-step maths solver, {""}
                    curated topic explanations across 8 subjects, practice-question generation, hints and
                    study planning. Zero cost, zero network calls.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border-l-[3px] border-l-[var(--accent-2)] bg-[rgba(34,211,238,0.09)] p-4 text-sm">
          <strong>To connect a provider</strong>, an administrator sets the matching environment variable on
          the server (for example <code className="font-mono text-xs">GROQ_API_KEY</code> or{" "}
          <code className="font-mono text-xs">OPENROUTER_API_KEY</code>) and restarts the app. Set{" "}
          <code className="font-mono text-xs">HELIXEDU_AI_ENABLED=false</code> to force offline mode
          permanently. HELIXEDU will never make a paid API call without a key being explicitly configured,
          and never asks you for payment details.
        </div>
      </Panel>

      {/* Account stats */}
      <Panel>
        <h2 className="mb-4 text-lg font-bold">📊 Your learning</h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--panel-border)] p-3 text-center">
            <dt className="text-xl font-extrabold tabular-nums">{stats.lessonsCompleted}</dt>
            <dd className="text-[0.65rem] text-[var(--text-muted)]">lessons</dd>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] p-3 text-center">
            <dt className="text-xl font-extrabold tabular-nums">{stats.quizzesTaken}</dt>
            <dd className="text-[0.65rem] text-[var(--text-muted)]">quizzes</dd>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] p-3 text-center">
            <dt className="text-xl font-extrabold tabular-nums">{stats.notesCount}</dt>
            <dd className="text-[0.65rem] text-[var(--text-muted)]">notes</dd>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] p-3 text-center">
            <dt className="text-xl font-extrabold tabular-nums">{streak.current}</dt>
            <dd className="text-[0.65rem] text-[var(--text-muted)]">streak</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Progress, notes and bookmarks are saved automatically on this device — no account required.
        </p>
      </Panel>
    </div>
  );
}
