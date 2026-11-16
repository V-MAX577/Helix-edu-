/**
 * HELIXEDU Local Learning Core.
 *
 * Browser-safe helpers for lessons, quiz results and study time. This module
 * stores progress on the current device and never requires an AI provider.
 */
import { runEngine, type EngineInput, type EngineReply } from "./engine";

const STORAGE_KEY = "helixedu:offline-progress:v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type OfflineQuizAttempt = {
  id: string;
  score: number;
  total: number;
  completedAt: string;
};

export type OfflineProgress = {
  version: 1;
  completedLessonIds: string[];
  quizAttempts: OfflineQuizAttempt[];
  studyMinutes: number;
  lastActivityAt: string | null;
};

const EMPTY_PROGRESS: OfflineProgress = {
  version: 1,
  completedLessonIds: [],
  quizAttempts: [],
  studyMinutes: 0,
  lastActivityAt: null,
};

function getStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normaliseProgress(value: unknown): OfflineProgress {
  if (!value || typeof value !== "object") return { ...EMPTY_PROGRESS };
  const candidate = value as Partial<OfflineProgress>;
  return {
    version: 1,
    completedLessonIds: Array.isArray(candidate.completedLessonIds)
      ? [...new Set(candidate.completedLessonIds.filter((id): id is string => typeof id === "string"))]
      : [],
    quizAttempts: Array.isArray(candidate.quizAttempts)
      ? candidate.quizAttempts.filter(
          (attempt): attempt is OfflineQuizAttempt =>
            Boolean(attempt) &&
            typeof attempt.id === "string" &&
            Number.isFinite(attempt.score) &&
            Number.isFinite(attempt.total) &&
            attempt.total > 0 &&
            typeof attempt.completedAt === "string",
        ).slice(-100)
      : [],
    studyMinutes:
      Number.isFinite(candidate.studyMinutes) && Number(candidate.studyMinutes) >= 0
        ? Math.floor(Number(candidate.studyMinutes))
        : 0,
    lastActivityAt:
      typeof candidate.lastActivityAt === "string" ? candidate.lastActivityAt : null,
  };
}

export function loadOfflineProgress(storage?: StorageLike): OfflineProgress {
  const target = getStorage(storage);
  if (!target) return { ...EMPTY_PROGRESS };
  try {
    const raw = target.getItem(STORAGE_KEY);
    return raw ? normaliseProgress(JSON.parse(raw)) : { ...EMPTY_PROGRESS };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveOfflineProgress(
  progress: OfflineProgress,
  storage?: StorageLike,
): boolean {
  const target = getStorage(storage);
  if (!target) return false;
  try {
    target.setItem(STORAGE_KEY, JSON.stringify(normaliseProgress(progress)));
    return true;
  } catch {
    return false;
  }
}

export function markLessonCompleted(
  lessonId: string,
  storage?: StorageLike,
): OfflineProgress {
  const id = lessonId.trim();
  const current = loadOfflineProgress(storage);
  if (!id) return current;
  const next = normaliseProgress({
    ...current,
    completedLessonIds: [...current.completedLessonIds, id],
    lastActivityAt: new Date().toISOString(),
  });
  saveOfflineProgress(next, storage);
  return next;
}

export function recordOfflineQuizAttempt(
  score: number,
  total: number,
  storage?: StorageLike,
): OfflineProgress {
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || score < 0 || score > total) {
    throw new Error("Quiz score must be between zero and the total number of questions.");
  }
  const current = loadOfflineProgress(storage);
  const now = new Date().toISOString();
  const attempt: OfflineQuizAttempt = {
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    score,
    total,
    completedAt: now,
  };
  const next = normaliseProgress({
    ...current,
    quizAttempts: [...current.quizAttempts, attempt],
    lastActivityAt: now,
  });
  saveOfflineProgress(next, storage);
  return next;
}

export function addOfflineStudyMinutes(
  minutes: number,
  storage?: StorageLike,
): OfflineProgress {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error("Study time must be a positive number of minutes.");
  }
  const current = loadOfflineProgress(storage);
  const next = normaliseProgress({
    ...current,
    studyMinutes: current.studyMinutes + Math.floor(minutes),
    lastActivityAt: new Date().toISOString(),
  });
  saveOfflineProgress(next, storage);
  return next;
}

export function getOfflineProgressSummary(progress = loadOfflineProgress()) {
  const attempts = progress.quizAttempts;
  const questionsAnswered = attempts.reduce((sum, attempt) => sum + attempt.total, 0);
  const correctAnswers = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return {
    completedLessons: progress.completedLessonIds.length,
    quizAttempts: attempts.length,
    questionsAnswered,
    correctAnswers,
    accuracyPercent: questionsAnswered
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0,
    studyMinutes: progress.studyMinutes,
    lastActivityAt: progress.lastActivityAt,
  };
}

/** Run the curated tutor locally, without a network request or AI API. */
export function answerOfflineQuestion(input: EngineInput): EngineReply {
  return runEngine(input);
}
