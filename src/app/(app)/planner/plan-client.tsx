"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPlanAction, deletePlanAction } from "@/app/actions";
import { Chip, Panel, ProgressBar } from "@/components/ui";

export type PlanDay = {
  day: string;
  focus: string;
  blocks: { minutes: number; activity: string; subject?: string; chapter?: string }[];
};

export type StudyPlan = {
  id: string;
  title: string;
  examDate: string | null;
  subjects: string[];
  minutesPerDay: number;
  days: PlanDay[];
};

export function PlanClient({ plan, todayIndex }: { plan: StudyPlan; todayIndex: number }) {
  const storageKey = `helixedu_plan_${plan.id}`;
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  });

  function toggle(dayKey: string) {
    setDone((prev) => {
      const next = { ...prev, [dayKey]: !prev[dayKey] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const daysDone = plan.days.filter((d) => done[d.day]).length;
  const percent = plan.days.length ? Math.round((daysDone / plan.days.length) * 100) : 0;

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{plan.title}</h2>
            {plan.examDate && <Chip tone="gold">Exam: {plan.examDate}</Chip>}
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {plan.days.length} days · {plan.minutesPerDay} minutes a day · {plan.subjects.join(", ")}
          </p>
        </div>
        <div className="w-full max-w-[12rem]">
          <ProgressBar value={daysDone} max={plan.days.length || 1} label="Plan progress" />
        </div>
      </div>

      <div className="grid gap-2.5">
        {plan.days.map((day, index) => {
          const isToday = index === todayIndex;
          const isPast = index < todayIndex;
          const isDone = Boolean(done[day.day]);
          return (
            <div
              key={day.day}
              className="rounded-2xl border p-4"
              style={{
                borderColor: isDone
                  ? "rgba(16,185,129,0.4)"
                  : isToday
                    ? "var(--accent)"
                    : "var(--panel-border)",
                background: isToday ? "color-mix(in srgb, var(--accent) 10%, transparent)" : undefined,
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggle(day.day)}
                    aria-pressed={isDone}
                    aria-label={`Mark ${day.day} complete`}
                    className="grid size-6 shrink-0 place-items-center rounded-md border text-[0.7rem] font-bold"
                    style={{
                      borderColor: isDone ? "var(--accent-3)" : "var(--panel-border)",
                      background: isDone ? "var(--accent-3)" : "transparent",
                      color: isDone ? "#04231a" : "transparent",
                    }}
                  >
                    ✓
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">Day {index + 1}</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(day.day).toLocaleDateString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {isToday && <Chip tone="accent">today</Chip>}
                      {isDone && <Chip tone="emerald">done</Chip>}
                      {isPast && !isDone && <Chip tone="gold">missed</Chip>}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{day.focus}</div>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {day.blocks.reduce((n, b) => n + b.minutes, 0)} min
                </span>
              </div>

              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {day.blocks.map((block, i) => (
                  <div key={i} className="rounded-xl bg-[color-mix(in_srgb,var(--panel-solid)_40%,transparent)] px-3 py-2">
                    <div className="text-[0.68rem] tracking-wide text-[var(--text-muted)] uppercase">
                      {block.subject} · {block.minutes} min
                    </div>
                    <div className="text-sm font-semibold">{block.chapter ?? block.activity}</div>
                    <div className="text-xs text-[var(--text-muted)]">{block.activity}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--panel-border)] pt-4">
        <p className="text-sm text-[var(--text-muted)]">
          {daysDone} of {plan.days.length} days complete ({percent}%).
          {loaded && daysDone === 0 && " Tick a day as you finish it — progress is saved on this device."}
        </p>
        <div className="flex gap-2">
          <Link href="/reminders" className="btn btn-ghost btn-sm">
            ⏰ Set a reminder
          </Link>
          <Link href="/learn" className="btn btn-primary btn-sm">
            📚 Start today&apos;s block
          </Link>
        </div>
      </div>
    </Panel>
  );
}

export function PlanForm({
  subjects,
  defaultMinutes,
}: {
  subjects: { slug: string; name: string; icon: string }[];
  defaultMinutes: number;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData: FormData) => {
        setPending(true);
        setError(null);
        const result = await createPlanAction(formData);
        setPending(false);
        if (result?.error) setError(result.error);
      }}
      className="mt-4 grid gap-4"
    >
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Plan name</span>
        <input name="title" defaultValue="My revision plan" className="field" />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Days</span>
          <input name="days" type="number" min={1} max={30} defaultValue={7} className="field" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Minutes per day</span>
          <input
            name="minutesPerDay"
            type="number"
            min={15}
            max={480}
            step={5}
            defaultValue={defaultMinutes}
            className="field"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Exam date (optional)</span>
          <input name="examDate" type="date" className="field" />
        </label>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">Subjects</legend>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((subject) => (
            <label key={subject.slug} className="chip cursor-pointer">
              <input
                type="checkbox"
                name="subjects"
                value={subject.slug}
                defaultChecked
                className="size-3 accent-[var(--accent)]"
              />
              <span aria-hidden>{subject.icon}</span> {subject.name}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-xl border-l-[3px] border-l-[#f59e0b] bg-[rgba(245,158,11,0.12)] px-3 py-2 text-sm">
          ⚠️ {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-fit">
        {pending ? "Building…" : "🗓️ Build my plan"}
      </button>
    </form>
  );
}

export function DeletePlanButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await deletePlanAction(id);
        setPending(false);
      }}
      className="btn btn-danger btn-sm"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
