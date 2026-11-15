"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeLessonAction, saveNoteAction, toggleBookmarkAction } from "@/app/actions";

export function LessonActions({
  lessonId,
  lessonTitle,
  subjectSlug,
  chapterSlug,
  isDone,
  isBookmarked,
  nextHref,
  prevHref,
}: {
  lessonId: string;
  lessonTitle: string;
  subjectSlug: string;
  chapterSlug: string;
  isDone: boolean;
  isBookmarked: boolean;
  nextHref?: string;
  prevHref?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  async function complete() {
    setPending(true);
    const result = await completeLessonAction(lessonId, 5);
    setPending(false);
    setJustCompleted(true);
    router.refresh();
    if (result && "unlocked" in result && result.unlocked?.length) {
      // Achievement toasts are shown by the progress page; keep it simple here.
    }
  }

  async function bookmark() {
    const result = await toggleBookmarkAction({
      targetType: "lesson",
      targetId: lessonId,
      title: lessonTitle,
      href: `/learn/${subjectSlug}/${chapterSlug}`,
      subtitle: `${subjectSlug} · ${chapterSlug}`,
    });
    setBookmarked(Boolean(result?.bookmarked));
    router.refresh();
  }

  async function saveNote(formData: FormData) {
    await saveNoteAction(formData);
    setNoteSaved(true);
    setNoteOpen(false);
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={complete} disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : isDone || justCompleted ? "✓ Completed — mark again" : "✓ Mark lesson complete"}
        </button>
        <button type="button" onClick={bookmark} className="btn btn-ghost btn-sm">
          {bookmarked ? "🔖 Bookmarked" : "🔖 Bookmark"}
        </button>
        <button type="button" onClick={() => setNoteOpen((v) => !v)} className="btn btn-ghost btn-sm">
          📝 {noteOpen ? "Cancel note" : "Add a note"}
        </button>
        {noteSaved && <span className="text-xs font-semibold text-[#6ee7b7]">Note saved ✓</span>}
        <span className="ml-auto flex gap-2">
          {prevHref && (
            <a href={prevHref} className="btn btn-ghost btn-sm">
              ← Previous
            </a>
          )}
          {nextHref && (
            <a href={nextHref} className="btn btn-ghost btn-sm">
              Next →
            </a>
          )}
        </span>
      </div>

      {noteOpen && (
        <form action={saveNote} className="panel grid gap-3">
          <input type="hidden" name="subjectSlug" value={subjectSlug} />
          <input type="hidden" name="chapterSlug" value={chapterSlug} />
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Note title</span>
            <input name="title" required defaultValue={`Notes — ${lessonTitle}`} className="field" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Your notes</span>
            <textarea
              name="body"
              rows={5}
              required
              placeholder="Write the key ideas in your own words — this is the fastest way to remember them."
              className="field"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-emerald btn-sm">
              Save note
            </button>
            <LinkToNotes />
          </div>
        </form>
      )}
    </div>
  );
}

function LinkToNotes() {
  return (
    <a href="/notes" className="btn btn-ghost btn-sm">
      All notes
    </a>
  );
}
