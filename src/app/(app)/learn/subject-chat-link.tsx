"use client";

import Link from "next/link";

/** Deep-links into the assistant with a subject-scoped question pre-filled. */
export function SubjectChatLink({ subject, slug }: { subject: string; slug: string }) {
  const question = `Explain the most important ideas in ${subject}`;
  return (
    <Link
      href={`/assistant?q=${encodeURIComponent(question)}&mode=deep-think`}
      className="btn btn-primary btn-sm"
    >
      🧠 Ask about {subject}
    </Link>
  );
}
