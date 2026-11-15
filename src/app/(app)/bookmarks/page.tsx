import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { EmptyState, Panel } from "@/components/ui";
import { BookmarksClient } from "./bookmarks-client";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const user = await getLearner();

  const rows = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, user.id))
    .orderBy(desc(bookmarks.createdAt));

  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      <Panel className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 10% 0%, rgba(251,191,36,0.14), transparent 45%), radial-gradient(circle at 92% 100%, rgba(168,85,247,0.18), transparent 45%)",
          }}
        />
        <div className="relative">
          <h1 className="text-[clamp(1.6rem,3.6vw,2.4rem)] leading-tight font-extrabold tracking-tight">
            🔖 <span className="text-gradient">Bookmarks</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            Everything you saved while studying, in one place. Bookmark any lesson from the lesson page.
          </p>
          <span className="chip chip-gold mt-3">{rows.length} saved</span>
        </div>
      </Panel>

      {rows.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No bookmarks yet"
          message="Open a lesson and press 'Bookmark' to save it here for quick revision."
          action={
            <Link href="/learn" className="btn btn-primary btn-sm">
              Browse lessons
            </Link>
          }
        />
      ) : (
        <BookmarksClient
          bookmarks={rows.map((b) => ({
            id: b.id,
            targetType: b.targetType,
            targetId: b.targetId,
            title: b.title,
            href: b.href,
            subtitle: b.subtitle,
            createdAt: b.createdAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
