/**
 * Device-local learner operations for HELIXEDU.
 * Curriculum is bundled separately; all personal progress is kept in IndexedDB.
 */
import {
  deleteDeviceRecord,
  getAllDeviceRecords,
  getDeviceRecord,
  putDeviceRecord,
  type DeviceRecord,
} from "./device-store";

export type LearnerSettings = DeviceRecord & {
  id: "profile";
  name: string;
  board: string;
  className: string;
  level: "beginner" | "intermediate" | "advanced";
  dailyGoalMinutes: number;
  avatar: string;
};

export type LocalNote = DeviceRecord & {
  id: string;
  title: string;
  body: string;
  subjectSlug?: string;
  chapterSlug?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LocalBookmark = DeviceRecord & {
  id: string;
  targetType: string;
  targetId: string;
  title: string;
  href: string;
  subtitle: string;
  createdAt: string;
};

export type LocalChatMessage = DeviceRecord & {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  provider: string;
  createdAt: string;
};

export const DEFAULT_LEARNER_SETTINGS: LearnerSettings = {
  id: "profile",
  name: "Explorer",
  board: "Maharashtra State Board",
  className: "Class 8",
  level: "intermediate",
  dailyGoalMinutes: 30,
  avatar: "🚀",
};

function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function getLearnerSettings(): Promise<LearnerSettings> {
  const saved = await getDeviceRecord<LearnerSettings>("settings", "profile");
  return { ...DEFAULT_LEARNER_SETTINGS, ...saved };
}

export async function saveLearnerSettings(
  values: Partial<Omit<LearnerSettings, "id">>,
): Promise<LearnerSettings> {
  const current = await getLearnerSettings();
  const next = { ...current, ...values, id: "profile" as const };
  await putDeviceRecord("settings", next);
  return next;
}

export async function recordStudy(minutes = 1): Promise<void> {
  const day = todayKey();
  const current = await getDeviceRecord<DeviceRecord & { day: string; minutes: number; actions: number }>("studyLog", day);
  await putDeviceRecord("studyLog", {
    id: day,
    day,
    minutes: (current?.minutes ?? 0) + Math.max(0, minutes),
    actions: (current?.actions ?? 0) + 1,
  });
}

export async function completeLesson(lessonId: string, minutes = 1): Promise<void> {
  const current = await getDeviceRecord<DeviceRecord & { seconds?: number }>("lessonProgress", lessonId);
  await putDeviceRecord("lessonProgress", {
    id: lessonId,
    lessonId,
    seconds: (current?.seconds ?? 0) + Math.max(1, minutes) * 60,
    completedAt: new Date().toISOString(),
  });
  await recordStudy(minutes);
}

export async function reviewFlashcard(cardId: string, correct: boolean) {
  const current = await getDeviceRecord<DeviceRecord & { box?: number; seen?: number; correct?: number }>("flashcardReviews", cardId);
  const box = correct ? Math.min(5, (current?.box ?? 0) + 1) : 1;
  const dueInDays = [0, 1, 2, 4, 8, 16][box];
  await putDeviceRecord("flashcardReviews", {
    id: cardId,
    flashcardId: cardId,
    box,
    seen: (current?.seen ?? 0) + 1,
    correct: (current?.correct ?? 0) + (correct ? 1 : 0),
    dueAt: new Date(Date.now() + dueInDays * 86_400_000).toISOString(),
    lastReviewedAt: new Date().toISOString(),
  });
  await recordStudy(1);
  return { box, dueInDays };
}

export async function submitLocalQuiz(
  quizId: string,
  questions: { id: string; prompt: string; options: string[]; answerIndex: number; explanation: string }[],
  answers: Record<string, number>,
  seconds: number,
) {
  const detail = questions.map((question) => ({
    ...question,
    chosen: answers[question.id] ?? -1,
    correct: answers[question.id] === question.answerIndex,
  }));
  const score = detail.filter((item) => item.correct).length;
  const id = makeId("attempt");
  await putDeviceRecord("quizAttempts", {
    id,
    quizId,
    answers,
    score,
    total: questions.length,
    seconds,
    createdAt: new Date().toISOString(),
  });
  await recordStudy(Math.max(1, Math.round(seconds / 60)));
  return {
    attemptId: id,
    score,
    total: questions.length,
    percent: questions.length ? Math.round((score / questions.length) * 100) : 0,
    detail,
  };
}

export async function saveLocalNote(input: Partial<LocalNote> & { title: string; body: string }): Promise<LocalNote> {
  const now = new Date().toISOString();
  const id = input.id ?? makeId("note");
  const existing = await getDeviceRecord<LocalNote>("notes", id);
  const note: LocalNote = {
    id,
    title: input.title.trim() || "Untitled note",
    body: input.body,
    subjectSlug: input.subjectSlug,
    chapterSlug: input.chapterSlug,
    pinned: input.pinned ?? existing?.pinned ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await putDeviceRecord("notes", note);
  await recordStudy(1);
  return note;
}

export async function deleteLocalNote(id: string) {
  await deleteDeviceRecord("notes", id);
}

export async function toggleLocalNotePin(id: string) {
  const note = await getDeviceRecord<LocalNote>("notes", id);
  if (!note) return;
  await putDeviceRecord("notes", { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() });
}

export async function toggleLocalBookmark(input: Omit<LocalBookmark, "id" | "createdAt">) {
  const rows = await getAllDeviceRecords<LocalBookmark>("bookmarks");
  const existing = rows.find((row) => row.targetType === input.targetType && row.targetId === input.targetId);
  if (existing) {
    await deleteDeviceRecord("bookmarks", existing.id);
    return false;
  }
  await putDeviceRecord("bookmarks", { ...input, id: makeId("bookmark"), createdAt: new Date().toISOString() });
  return true;
}

export async function saveChatMessage(input: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  provider: string;
}) {
  const row: LocalChatMessage = { ...input, id: makeId("message"), createdAt: new Date().toISOString() };
  await putDeviceRecord("chatMessages", row);
  return row;
}

export async function getLocalChatMessages(sessionId: string): Promise<LocalChatMessage[]> {
  const rows = await getAllDeviceRecords<LocalChatMessage>("chatMessages");
  return rows.filter((row) => row.sessionId === sessionId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getLearnerStats(dailyGoalMinutes?: number) {
  const [lessons, attempts, reviews, notes, messages, logs, settings] = await Promise.all([
    getAllDeviceRecords<DeviceRecord>("lessonProgress"),
    getAllDeviceRecords<DeviceRecord & { score?: number; total?: number }>("quizAttempts"),
    getAllDeviceRecords<DeviceRecord & { seen?: number; box?: number }>("flashcardReviews"),
    getAllDeviceRecords<DeviceRecord>("notes"),
    getAllDeviceRecords<LocalChatMessage>("chatMessages"),
    getAllDeviceRecords<DeviceRecord & { day: string; minutes: number }>("studyLog"),
    getLearnerSettings(),
  ]);
  const totalQuestions = attempts.reduce((sum, row) => sum + (row.total ?? 0), 0);
  const correctAnswers = attempts.reduce((sum, row) => sum + (row.score ?? 0), 0);
  const today = todayKey();
  const totalMinutes = logs.reduce((sum, row) => sum + row.minutes, 0);
  const todayMinutes = logs.find((row) => row.day === today)?.minutes ?? 0;
  return {
    lessonsCompleted: lessons.length,
    quizzesTaken: attempts.length,
    quizAccuracy: totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    flashcardsReviewed: reviews.reduce((sum, row) => sum + (row.seen ?? 0), 0),
    flashcardsMastered: reviews.filter((row) => (row.box ?? 0) >= 4).length,
    notesCount: notes.length,
    chatQuestions: messages.filter((row) => row.role === "user").length,
    totalMinutes,
    todayMinutes,
    dailyGoalMinutes: dailyGoalMinutes ?? settings.dailyGoalMinutes,
  };
}

export async function getStudyStreak() {
  const logs = await getAllDeviceRecords<DeviceRecord & { day: string; minutes: number }>("studyLog");
  const days = new Set(logs.filter((row) => row.minutes > 0).map((row) => row.day));
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let previous = "";
  for (const day of sorted) {
    const gap = previous ? (Date.parse(day) - Date.parse(previous)) / 86_400_000 : 0;
    run = !previous || gap !== 1 ? 1 : run + 1;
    longest = Math.max(longest, run);
    previous = day;
  }
  let cursor = new Date();
  if (!days.has(todayKey(cursor))) cursor = new Date(cursor.getTime() - 86_400_000);
  let current = 0;
  while (days.has(todayKey(cursor))) {
    current++;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return { current, longest, totalDays: days.size };
}
