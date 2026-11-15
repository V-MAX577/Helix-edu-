import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { EmptyState, Panel } from "@/components/ui";
import { NotesClient } from "./notes-client";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const user = await getLearner();

  const rows = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, user.id))
    .orderBy(desc(notes.pinned), desc(notes.updatedAt));

  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(34,211,238,0.16), transparent 45%), radial-gradient(circle at 92% 100%, rgba(168,85,247,0.18), transparent 45%)",
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
              Notes & <span className="text-gradient">Bookmarks</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
              Write notes in your own words — it is the single most effective study technique — and download
              them as a Markdown file whenever you want to revise offline.
            </p>
          </div>
          <span className="chip chip-accent">{rows.length} saved</span>
        </div>
      </Panel>

      {rows.length === 0 ? (
        <EmptyState
          icon="📒"
          title="No notes yet"
          message="Open any lesson and press 'Add a note', or create one here. Notes are saved on this device and load instantly."
        />
      ) : (
        <NotesClient
          notes={rows.map((n) => ({
            id: n.id,
            title: n.title,
            body: n.body,
            subjectSlug: n.subjectSlug,
            chapterSlug: n.chapterSlug,
            pinned: n.pinned,
            updatedAt: n.updatedAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
