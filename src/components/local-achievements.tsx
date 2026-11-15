import { ACHIEVEMENTS, CURRICULUM } from "@/lib/curriculum";

type Props = {
  stats: {
    lessonsCompleted: number;
    quizzesTaken: number;
    quizAccuracy: number;
    flashcardsReviewed: number;
    notesCount: number;
    chatQuestions: number;
  } | null;
  streak: { current: number };
  completedIds: string[];
};

export function LocalAchievementsPanel({ stats, streak, completedIds }: Props) {
  const subjectsStudied = CURRICULUM.filter((subject) =>
    subject.chapters.some((chapter) => chapter.lessons.some((lesson) => completedIds.includes(lesson.slug))),
  ).length;
  const chapterFinished = CURRICULUM.some((subject) =>
    subject.chapters.some((chapter) => chapter.lessons.length > 0 && chapter.lessons.every((lesson) => completedIds.includes(lesson.slug))),
  );

  function unlocked(code: string) {
    if (code === "first-steps") return (stats?.lessonsCompleted ?? 0) >= 1;
    if (code === "curious-mind") return (stats?.chatQuestions ?? 0) >= 10;
    if (code === "quiz-rookie") return (stats?.quizzesTaken ?? 0) >= 1;
    if (code === "sharp-shooter") return (stats?.quizzesTaken ?? 0) > 0 && stats?.quizAccuracy === 100;
    if (code === "streak-3") return streak.current >= 3;
    if (code === "streak-7") return streak.current >= 7;
    if (code === "streak-30") return streak.current >= 30;
    if (code === "flashcard-50") return (stats?.flashcardsReviewed ?? 0) >= 50;
    if (code === "note-taker") return (stats?.notesCount ?? 0) >= 5;
    if (code === "chapter-finisher") return chapterFinished;
    if (code === "explorer") return subjectsStudied >= 3;
    if (code === "scholar") return (stats?.lessonsCompleted ?? 0) >= 25;
    return false;
  }

  return (
    <section className="panel p-5 lg:col-span-2">
      <h2 className="text-xl font-bold">🏆 Achievements</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((item) => {
          const earned = unlocked(item.code);
          return (
            <div key={item.code} className="flex items-center gap-3 rounded-xl border border-[var(--panel-border)] p-3" data-unlocked={earned}>
              <span className="text-2xl">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{earned ? "Unlocked" : item.description}</p>
              </div>
              <span className="ml-auto text-xs">{earned ? "✓" : "🔒"}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
