"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteNoteAction, saveNoteAction, toggleNotePinAction } from "@/app/actions";
import { Chip, Markdown, Panel } from "@/components/ui";

export type SavedNote = {
  id: string;
  title: string;
  body: string;
  subjectSlug: string | null;
  chapterSlug: string | null;
  pinned: boolean;
  updatedAt: string;
};

export function NotesClient({ notes }: { notes: SavedNote[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    );
  }, [notes, query]);

  function download(note: SavedNote) {
    const content = `# ${note.title}\n\n${note.body}\n\n---\n_Exported from HELIXEDU on ${new Date().toLocaleString()}_\n`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${note.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function downloadAll() {
    const content = notes
      .map((n) => `# ${n.title}\n\n${n.body}\n`)
      .join("\n\n---\n\n");
    const blob = new Blob([`# HELIXEDU notes\n\n${content}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "helixedu-notes.md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4">
      <Panel className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your notes…"
          className="field max-w-sm flex-1"
          aria-label="Search notes"
        />
        <button type="button" onClick={() => setCreating((v) => !v)} className="btn btn-primary btn-sm">
          {creating ? "Cancel" : "＋ New note"}
        </button>
        <button type="button" onClick={downloadAll} className="btn btn-ghost btn-sm">
          ⬇ Download all (.md)
        </button>
      </Panel>

      {creating && (
        <NoteEditor
          pending={pending}
          setPending={setPending}
          onDone={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      )}

      {filtered.length === 0 && (
        <Panel className="py-10 text-center text-sm text-[var(--text-muted)]">
          No notes match “{query}”.
        </Panel>
      )}

      {filtered.map((note) => (
        <Panel key={note.id} className="grid gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold">{note.title}</h2>
                {note.pinned && <Chip tone="gold">📌 pinned</Chip>}
                {note.subjectSlug && <Chip tone="cyan">{note.subjectSlug}</Chip>}
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Updated {new Date(note.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => download(note)} className="btn btn-ghost btn-sm">
                ⬇ Download
              </button>
              <button
                type="button"
                onClick={async () => {
                  await toggleNotePinAction(note.id);
                  router.refresh();
                }}
                className="btn btn-ghost btn-sm"
              >
                {note.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(editing === note.id ? null : note.id)}
                className="btn btn-ghost btn-sm"
              >
                {editing === note.id ? "Close" : "Edit"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
                  await deleteNoteAction(note.id);
                  router.refresh();
                }}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>

          {editing === note.id ? (
            <NoteEditor
              note={note}
              pending={pending}
              setPending={setPending}
              onDone={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          ) : (
            <div className="rounded-2xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-solid)_35%,transparent)] p-4">
              <Markdown content={note.body} />
            </div>
          )}

          {note.subjectSlug && note.chapterSlug && (
            <Link
              href={`/learn/${note.subjectSlug}/${note.chapterSlug}`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Go to the source lesson →
            </Link>
          )}
        </Panel>
      ))}
    </div>
  );
}

function NoteEditor({
  note,
  pending,
  setPending,
  onDone,
}: {
  note?: SavedNote;
  pending: boolean;
  setPending: (value: boolean) => void;
  onDone: () => void;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        setPending(true);
        await saveNoteAction(formData);
        setPending(false);
        onDone();
      }}
      className="grid gap-3"
    >
      {note && <input type="hidden" name="id" value={note.id} />}
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Title</span>
        <input name="title" required defaultValue={note?.title ?? ""} className="field" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Notes (Markdown supported)</span>
        <textarea
          name="body"
          required
          rows={8}
          defaultValue={note?.body ?? ""}
          placeholder="Write the key ideas in your own words. Use **bold**, lists and `code`."
          className="field font-mono text-sm"
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-emerald btn-sm">
          {pending ? "Saving…" : note ? "Save changes" : "Save note"}
        </button>
        <button type="button" onClick={onDone} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
