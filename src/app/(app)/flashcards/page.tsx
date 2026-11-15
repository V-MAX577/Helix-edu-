import { and, count, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { flashcards, flashcardReviews, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getStats } from "@/lib/progress";
import { FlashcardsClient, type DeckCard } from "@/components/flashcards-client";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const user = await getLearner();
  await ensureSeeded();

  const rows = await db
    .select({
      id: flashcards.id,
      front: flashcards.front,
      back: flashcards.back,
      hint: flashcards.hint,
      subjectName: subjects.name,
      subjectSlug: subjects.slug,
      subjectIcon: subjects.icon,
      box: sql<number>`coalesce(${flashcardReviews.box}, 1)`,
      dueAt: sql<string | null>`${flashcardReviews.dueAt}`,
      seen: sql<number>`coalesce(${flashcardReviews.seen}, 0)`,
    })
    .from(flashcards)
    .innerJoin(subjects, eq(flashcards.subjectId, subjects.id))
    .leftJoin(
      flashcardReviews,
      and(eq(flashcardReviews.flashcardId, flashcards.id), eq(flashcardReviews.userId, user.id)),
    )
    .orderBy(subjects.sortOrder, flashcards.sortOrder);

  const stats = await getStats(user.id);

  const now = Date.now();
  const cards: DeckCard[] = rows.map((row) => ({
    id: row.id,
    front: row.front,
    back: row.back,
    hint: row.hint,
    subjectName: row.subjectName,
    subjectSlug: row.subjectSlug,
    subjectIcon: row.subjectIcon,
    box: Number(row.box),
    dueAt: row.dueAt ? new Date(row.dueAt).toISOString() : null,
    seen: Number(row.seen),
  }));

  const dueCount = cards.filter((c) => !c.dueAt || new Date(c.dueAt).getTime() <= now).length;

  const reviewedToday = await db
    .select({ n: count() })
    .from(flashcardReviews)
    .where(
      and(
        eq(flashcardReviews.userId, user.id),
        sql`${flashcardReviews.lastReviewedAt}::date = current_date`,
      ),
    );

  const mastered = await db
    .select({ n: count() })
    .from(flashcardReviews)
    .where(and(eq(flashcardReviews.userId, user.id), gte(flashcardReviews.box, 4)));

  return (
    <FlashcardsClient
      cards={cards}
      dueCount={dueCount}
      totalCards={cards.length}
      reviewedToday={Number(reviewedToday[0]?.n ?? 0)}
      mastered={Number(mastered[0]?.n ?? stats.flashcardsMastered ?? 0)}
    />
  );
}
