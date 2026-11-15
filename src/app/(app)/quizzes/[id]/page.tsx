import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quizzes, subjects } from "@/db/schema";
import { getLearner } from "@/lib/learner";
import { ensureSeeded, getQuizWithQuestions } from "@/lib/progress";
import { EmptyState } from "@/components/ui";
import { QuizTaker } from "@/components/quiz-client";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getLearner();
  await ensureSeeded();

  const data = await getQuizWithQuestions(id);
  if (!data) notFound();

  const subject = await db.query.subjects.findFirst({ where: eq(subjects.id, data.quiz.subjectId) });

  if (!data.questions.length) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon="📝"
          title="This quiz has no questions yet"
          message="The quiz exists but its question set is empty. Try another quiz from the list."
        />
      </div>
    );
  }

  return (
    <QuizTaker
      quizId={data.quiz.id}
      quizTitle={data.quiz.title}
      quizDescription={data.quiz.description}
      timeLimitSec={data.quiz.timeLimitSec}
      difficulty={data.quiz.difficulty}
      subjectName={subject?.name ?? "General"}
      subjectSlug={subject?.slug ?? "general-knowledge"}
      questions={data.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        answerIndex: q.answerIndex,
        explanation: q.explanation,
      }))}
    />
  );
}
