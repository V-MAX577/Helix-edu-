"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteDeviceRecord, getAllDeviceRecords, getDeviceRecord, putDeviceRecord } from "@/lib/device-store";

type Bookmark = {
  id: string;
  targetType: string;
  targetId: string;
  title: string;
  href: string;
  subtitle: string;
  createdAt: string;
};

export function LocalBookmarkButton({
  targetId,
  title,
  subtitle,
  href,
}: {
  targetId: string;
  title: string;
  subtitle: string;
  href: string;
}) {
  const id = "lesson:" + targetId;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getDeviceRecord<Bookmark>("bookmarks", id).then((row) => {
      if (!cancelled) setSaved(Boolean(row));
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [id]);

  async function toggle() {
    if (saved) {
      await deleteDeviceRecord("bookmarks", id);
      setSaved(false);
      return;
    }
    await putDeviceRecord("bookmarks", {
      id,
      targetType: "lesson",
      targetId,
      title,
      href,
      subtitle,
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  return (
    <button type="button" onClick={() => void toggle()} className="btn btn-ghost btn-sm">
      {saved ? "🔖 Saved" : "🔖 Save lesson"}
    </button>
  );
}

export function LocalBookmarksPanel() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);

  async function refresh() {
    const rows = await getAllDeviceRecords<Bookmark>("bookmarks");
    setItems(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  useEffect(() => {
    let cancelled = false;
    void getAllDeviceRecords<Bookmark>("bookmarks").then((rows) => {
      if (!cancelled) {
        setItems(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        setReady(true);
      }
    }).catch(() => setReady(true));
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="panel p-5">
      <h2 className="text-xl font-bold">🔖 Saved lessons</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">Bookmarks stay in this browser only.</p>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--panel-border)] p-3">
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-xs text-[var(--text-muted)]">{item.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <Link href={item.href} className="btn btn-ghost btn-sm">Open</Link>
              <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await deleteDeviceRecord("bookmarks", item.id); await refresh(); }}>Remove</button>
            </div>
          </article>
        ))}
        {ready && items.length === 0 && <p className="text-sm text-[var(--text-muted)]">No saved lessons yet. Use “Save lesson” while studying.</p>}
      </div>
    </section>
  );
}
