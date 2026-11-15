"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addReminderAction, deleteReminderAction, toggleReminderAction } from "@/app/actions";
import { Chip, EmptyState, Panel } from "@/components/ui";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export type SavedReminder = {
  id: string;
  label: string;
  time: string;
  days: number[];
  enabled: boolean;
};

export function RemindersClient({
  reminders,
  todayMinutes,
  dailyGoal,
}: {
  reminders: SavedReminder[];
  todayMinutes: number;
  dailyGoal: number;
}) {
  const router = useRouter();
  const [permission, setPermission] = useState<"default" | "granted" | "denied" | "unsupported">("default");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fired, setFired] = useState<Set<string>>(new Set());
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  // Real scheduler: checks every 30 seconds and fires a notification when a
  // reminder's time is reached on one of its selected weekdays.
  useEffect(() => {
    if (permission !== "granted") return;
    const check = () => {
      const now = new Date();
      const weekday = now.getDay();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      for (const reminder of reminders) {
        if (!reminder.enabled || !reminder.days.includes(weekday)) continue;
        const key = `${reminder.id}-${now.toISOString().slice(0, 10)}-${reminder.time}`;
        if (firedRef.current.has(key)) continue;
        if (reminder.time <= hhmm) {
          firedRef.current.add(key);
          setFired((prev) => new Set(prev).add(key));
          try {
            new Notification("HELIXEDU study reminder", {
              body: `${reminder.label} — ${todayMinutes}/${dailyGoal} minutes studied today.`,
              icon: "/icon.svg",
              tag: key,
            });
          } catch {
            /* some browsers require a service worker; ignore */
          }
        }
      }
    };
    check();
    const timer = setInterval(check, 30_000);
    return () => clearInterval(timer);
  }, [reminders, permission, todayMinutes, dailyGoal]);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  return (
    <div className="grid gap-4">
      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Browser notifications</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {permission === "granted"
              ? "Enabled — reminders will pop up while this tab is open."
              : permission === "denied"
                ? "Blocked in your browser settings. Re-enable notifications for this site to receive reminders."
                : permission === "unsupported"
                  ? "This browser does not support notifications. Reminders are still saved and shown below."
                  : "Allow notifications so reminders can reach you."}
          </p>
        </div>
        {permission === "default" && (
          <button type="button" onClick={requestPermission} className="btn btn-primary btn-sm">
            Enable notifications
          </button>
        )}
        {permission === "granted" && <Chip tone="emerald">✓ active</Chip>}
      </Panel>

      {reminders.length === 0 ? (
        <EmptyState
          icon="⏰"
          title="No reminders set"
          message="Add a reminder below. Studies show a fixed daily time is the strongest predictor of keeping a streak alive."
        />
      ) : (
        <div className="grid gap-2.5">
          {reminders.map((reminder) => {
            const dayLabels = DAYS.filter((d) => reminder.days.includes(d.value)).map((d) => d.label);
            return (
              <Panel key={reminder.id} className="flex flex-wrap items-center gap-3 p-4">
                <span
                  aria-hidden
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-[rgba(34,211,238,0.16)] text-lg"
                >
                  ⏰
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{reminder.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {reminder.time} · {dayLabels.length ? dayLabels.join(", ") : "no days selected"}
                  </div>
                </div>
                <Chip tone={reminder.enabled ? "emerald" : "default"}>
                  {reminder.enabled ? "on" : "off"}
                </Chip>
                <button
                  type="button"
                  onClick={async () => {
                    await toggleReminderAction(reminder.id);
                    router.refresh();
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  {reminder.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteReminderAction(reminder.id);
                    router.refresh();
                  }}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </Panel>
            );
          })}
        </div>
      )}

      <Panel>
        <h2 className="mb-3 text-lg font-bold">Add a reminder</h2>
        <form
          action={async (formData: FormData) => {
            setPending(true);
            setError(null);
            const result = await addReminderAction(formData);
            setPending(false);
            if (result?.error) setError(result.error);
            else router.refresh();
          }}
          className="grid gap-4"
        >
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">What should I remind you about?</span>
            <input name="label" defaultValue="Study time" required className="field" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Time</span>
              <input name="time" type="time" defaultValue="18:00" required className="field" />
            </label>
            <div className="grid gap-1.5">
              <span className="text-sm font-medium">Repeat on</span>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => (
                  <label key={day.value} className="chip cursor-pointer">
                    <input
                      type="checkbox"
                      name="days"
                      value={day.value}
                      defaultChecked={day.value >= 1 && day.value <= 5}
                      className="size-3 accent-[var(--accent)]"
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border-l-[3px] border-l-[#f59e0b] bg-[rgba(245,158,11,0.12)] px-3 py-2 text-sm">
              ⚠️ {error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn btn-primary w-fit">
            {pending ? "Saving…" : "＋ Add reminder"}
          </button>
        </form>
      </Panel>

      <Panel>
        <h2 className="mb-2 font-bold">How reminders behave</h2>
        <ul className="grid gap-1.5 text-sm text-[var(--text-muted)]">
          <li>· Reminders are saved on this device and load every time you open HELIXEDU.</li>
          <li>· The notification itself is delivered by this browser only while a HELIXEDU tab is open — there is no server-side push, so nothing is sent when you are away.</li>
          <li>· Each reminder fires at most once per day.</li>
          <li>· {fired.size > 0 ? `${fired.size} reminder(s) have fired in this session.` : "No reminders have fired in this session yet."}</li>
        </ul>
      </Panel>
    </div>
  );
}
