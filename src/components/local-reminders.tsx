"use client";

import { useEffect, useRef, useState } from "react";
import { deleteDeviceRecord, getAllDeviceRecords, putDeviceRecord } from "@/lib/device-store";

type Reminder = {
  [key: string]: unknown;
  id: string;
  label: string;
  time: string;
  enabled: boolean;
  createdAt: string;
};

export function LocalReminderPanel() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [label, setLabel] = useState("Daily revision");
  const [time, setTime] = useState("18:00");
  const [permission, setPermission] = useState("default");
  const [status, setStatus] = useState("");
  const lastSent = useRef(new Set<string>());

  async function refresh() {
    const rows = await getAllDeviceRecords<Reminder>("reminders");
    setItems(rows.sort((a, b) => a.time.localeCompare(b.time)));
  }

  useEffect(() => {
    let cancelled = false;
    void getAllDeviceRecords<Reminder>("reminders").then((rows) => {
      if (!cancelled) setItems(rows.sort((a, b) => a.time.localeCompare(b.time)));
    }).catch(() => undefined);
    if ("Notification" in window) setPermission(Notification.permission);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;
    const check = () => {
      const now = new Date();
      const timeKey = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      const dayKey = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
      for (const reminder of items) {
        const key = reminder.id + ":" + dayKey;
        if (reminder.enabled && reminder.time === timeKey && !lastSent.current.has(key)) {
          new Notification("HELIXEDU reminder", { body: reminder.label });
          lastSent.current.add(key);
        }
      }
    };
    check();
    const timer = window.setInterval(check, 30000);
    return () => window.clearInterval(timer);
  }, [items, permission]);

  async function addReminder(event: React.FormEvent) {
    event.preventDefault();
    const item: Reminder = {
      id: "reminder-" + crypto.randomUUID(),
      label: label.trim() || "Study reminder",
      time,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    await putDeviceRecord("reminders", item);
    setLabel("Daily revision");
    await refresh();
  }

  async function requestAlerts() {
    if (!("Notification" in window)) {
      setStatus("This browser does not support notifications.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    setStatus(result === "granted" ? "Browser alerts enabled while HELIXEDU is open." : "Notification permission was not granted.");
  }

  return (
    <section className="panel p-5">
      <h2 className="text-xl font-bold">⏰ Study reminders</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Schedules are saved on this device. Browser alerts can appear while HELIXEDU is open; this version does not send background push notifications.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => void requestAlerts()}>Enable browser alerts</button>
        <span className="self-center text-xs text-[var(--text-muted)]">Permission: {permission}</span>
      </div>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={addReminder}>
        <input className="field flex-1" value={label} onChange={(event) => setLabel(event.target.value)} aria-label="Reminder label" />
        <input className="field sm:max-w-36" type="time" value={time} onChange={(event) => setTime(event.target.value)} aria-label="Reminder time" />
        <button type="submit" className="btn btn-ghost btn-sm">Add reminder</button>
      </form>
      {status && <p role="status" className="mt-3 text-xs text-[var(--text-muted)]">{status}</p>}
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--panel-border)] p-3">
            <div><p className="font-semibold">{item.label}</p><p className="text-xs text-[var(--text-muted)]">{item.time} · {item.enabled ? "Enabled" : "Paused"}</p></div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await putDeviceRecord("reminders", { ...item, enabled: !item.enabled }); await refresh(); }}>{item.enabled ? "Pause" : "Enable"}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await deleteDeviceRecord("reminders", item.id); await refresh(); }}>Delete</button>
            </div>
          </div>
        ))}
        {!items.length && <p className="text-sm text-[var(--text-muted)]">No reminders saved yet.</p>}
      </div>
    </section>
  );
}
