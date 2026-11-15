"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/actions";
import { Chip, Panel } from "@/components/ui";

const SCALES = [
  { value: 90, label: "Small" },
  { value: 100, label: "Default" },
  { value: 112, label: "Large" },
  { value: 125, label: "Larger" },
];

export function ThemeControls() {
  const [theme, setTheme] = useState<"cosmos" | "light">("cosmos");
  const [scale, setScale] = useState(100);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("helixedu_theme");
    const savedScale = Number(localStorage.getItem("helixedu_font") ?? "100");
    const savedMotion = localStorage.getItem("helixedu_motion") === "reduced";
    if (savedTheme === "light" || savedTheme === "cosmos") setTheme(savedTheme);
    if ([90, 100, 112, 125].includes(savedScale)) setScale(savedScale);
    setReduceMotion(savedMotion);
  }, []);

  function applyTheme(next: "cosmos" | "light") {
    setTheme(next);
    localStorage.setItem("helixedu_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  function applyScale(next: number) {
    setScale(next);
    localStorage.setItem("helixedu_font", String(next));
    document.documentElement.style.setProperty("--font-scale", String(next / 100));
  }

  function applyMotion(next: boolean) {
    setReduceMotion(next);
    localStorage.setItem("helixedu_motion", next ? "reduced" : "full");
    if (next) document.documentElement.setAttribute("data-reduce-motion", "true");
    else document.documentElement.removeAttribute("data-reduce-motion");
  }

  return (
    <div className="grid gap-5">
      <div>
        <div className="mb-2 text-sm font-medium">Theme</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyTheme("cosmos")}
            className="chip"
            style={
              theme === "cosmos"
                ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 20%, transparent)", color: "var(--text)" }
                : undefined
            }
          >
            🌙 Dark cosmos (default)
          </button>
          <button
            type="button"
            onClick={() => applyTheme("light")}
            className="chip"
            style={
              theme === "light"
                ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 20%, transparent)", color: "var(--text)" }
                : undefined
            }
          >
            ☀️ Light nebula
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">Text size</div>
        <div className="flex flex-wrap gap-2">
          {SCALES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => applyScale(option.value)}
              className="chip"
              style={
                scale === option.value
                  ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 20%, transparent)", color: "var(--text)" }
                  : undefined
              }
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Applies to every page immediately. Useful for reading on a small phone screen.
        </p>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => applyMotion(e.target.checked)}
          className="size-4 accent-[var(--accent)]"
        />
        <span>
          <span className="block text-sm font-medium">Reduce motion</span>
          <span className="block text-xs text-[var(--text-muted)]">
            Stops star drift, floating and pulsing animations. Recommended if you are sensitive to motion.
          </span>
        </span>
      </label>

      <div className="rounded-2xl border border-[var(--panel-border)] p-4">
        <div className="mb-1 text-xs tracking-[0.16em] text-[var(--text-muted)] uppercase">Preview</div>
        <p className="text-base">
          The quick brown fox jumps over the lazy dog. <strong>Bold text</strong> and{" "}
          <code className="font-mono text-sm">code</code> should both be easy to read.
        </p>
      </div>
    </div>
  );
}

export function SettingsForm({
  defaults,
  boards,
  classes,
  levels,
  avatars,
}: {
  defaults: {
    name: string;
    email: string;
    board: string;
    className: string;
    level: string;
    dailyGoalMinutes: number;
    avatar: string;
  };
  boards: string[];
  classes: string[];
  levels: { id: string; label: string }[];
  avatars: string[];
}) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  return (
    <form
      action={async (formData: FormData) => {
        setPending(true);
        setSaved(false);
        await updateProfileAction(formData);
        setPending(false);
        setSaved(true);
        router.refresh();
      }}
      className="grid gap-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Display name</span>
          <input name="name" required defaultValue={defaults.name} className="field" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input value={defaults.email} disabled className="field opacity-60" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Board</span>
          <select name="board" defaultValue={defaults.board} className="field">
            {boards.map((board) => (
              <option key={board} value={board}>
                {board}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Class / level</span>
          <select name="className" defaultValue={defaults.className} className="field">
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Explanation depth</span>
          <select name="level" defaultValue={defaults.level} className="field">
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Daily study goal (minutes)</span>
          <input
            name="dailyGoalMinutes"
            type="number"
            min={5}
            max={480}
            step={5}
            defaultValue={defaults.dailyGoalMinutes}
            className="field"
          />
        </label>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">Avatar</legend>
        <div className="flex flex-wrap gap-1.5">
          {avatars.map((avatar) => (
            <label key={avatar} className="cursor-pointer">
              <input
                type="radio"
                name="avatar"
                value={avatar}
                defaultChecked={defaults.avatar === avatar}
                className="sr-only"
              />
              <span
                className="grid size-10 place-items-center rounded-xl border text-xl"
                style={
                  defaults.avatar === avatar
                    ? { borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 18%, transparent)" }
                    : { borderColor: "var(--panel-border)" }
                }
              >
                {avatar}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[#6ee7b7]">
            ✓ Saved
          </span>
        )}
      </div>
    </form>
  );
}

