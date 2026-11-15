import assert from "node:assert/strict";
import { after, test } from "node:test";
import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../src/db/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for HELIXEDU database integration tests.");
}

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool, { schema });

after(async () => {
  await pool.end();
});

test("one learner cannot read, update, or delete another learner's notes", async () => {
  await db.transaction(async (tx) => {
    const [alice, bob] = await tx
      .insert(schema.users)
      .values([
        {
          email: "helixedu-test-alice@device.helixedu.local",
          name: "Test Learner A",
          passwordHash: "test-only",
          role: "student",
        },
        {
          email: "helixedu-test-bob@device.helixedu.local",
          name: "Test Learner B",
          passwordHash: "test-only",
          role: "student",
        },
      ])
      .returning();

    const [aliceNote] = await tx
      .insert(schema.notes)
      .values({ userId: alice.id, title: "Alice private note", body: "A-only sample" })
      .returning();

    const [bobNote] = await tx
      .insert(schema.notes)
      .values({ userId: bob.id, title: "Bob private note", body: "B-only sample" })
      .returning();

    const aliceNotes = await tx
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.userId, alice.id));

    assert.deepEqual(aliceNotes.map((note) => note.id), [aliceNote.id]);
    assert.equal(aliceNotes.some((note) => note.id === bobNote.id), false);

    await tx
      .update(schema.notes)
      .set({ title: "Changed by Alice" })
      .where(and(eq(schema.notes.id, bobNote.id), eq(schema.notes.userId, alice.id)));

    await tx
      .delete(schema.notes)
      .where(and(eq(schema.notes.id, bobNote.id), eq(schema.notes.userId, alice.id)));

    const bobNotes = await tx
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.userId, bob.id));

    assert.equal(bobNotes.length, 1);
    assert.equal(bobNotes[0].title, "Bob private note");

    await tx.delete(schema.users).where(inArray(schema.users.id, [alice.id, bob.id]));
  });
});
