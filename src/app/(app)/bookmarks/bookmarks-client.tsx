"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { removeBookmarkAction } from "@/app/actions";
import { Chip, Panel } from "@/components/ui";

export type SavedBookmark = {
  id: string;
  targetType: string;
  targetId: string;
  title: string;
  href: string;
  subtitle: string;
  createdAt: string;
};

export function BookmarksClient({ bookmarks }: { bookmarks: SavedBookmark[] }) {
  const router = useRouter();

  return (
    <div className="grid gap-2.5">
      {bookmarks.map((bookmark) => (
        <Panel key={bookmark.id} className="flex flex-wrap items-center gap-3 p-4">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgba(251,191,36,0.16)] text-lg">
            🔖
          </span>
          <div className="min-w-0 flex-1">
            <Link href={bookmark.href} className="block truncate font-bold hover:text-[var(--accent)]">
              {bookmark.title}
            </Link>
            <div className="text-xs text-[var(--text-muted)]">
              {bookmark.subtitle || bookmark.targetType} · saved {new Date(bookmark.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Chip tone="cyan">{bookmark.targetType}</Chip>
          <button
            type="button"
            onClick={async () => {
              await removeBookmarkAction(bookmark.id);
              router.refresh();
            }}
            className="btn btn-danger btn-sm"
          >
            Remove
          </button>
        </Panel>
      ))}
    </div>
  );
}
