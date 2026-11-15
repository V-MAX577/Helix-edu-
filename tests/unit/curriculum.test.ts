import assert from "node:assert/strict";
import test from "node:test";
import { CURRICULUM, getAllFlashcards, getAllQuestions } from "../../src/lib/curriculum";

test("bundled curriculum contains subjects, chapters and lessons", () => {
  assert.ok(CURRICULUM.length >= 8);
  assert.ok(CURRICULUM.every((subject) => subject.chapters.length > 0));
  assert.ok(CURRICULUM.every((subject) => subject.chapters.every((chapter) => chapter.lessons.length > 0)));
});

test("bundled quiz questions have valid answer indexes and unique ids", () => {
  const questions = getAllQuestions();
  assert.ok(questions.length > 20);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  for (const question of questions) {
    assert.ok(question.options.length > 1);
    assert.ok(question.answerIndex >= 0 && question.answerIndex < question.options.length);
  }
});

test("bundled flashcards have unique ids and both sides", () => {
  const cards = getAllFlashcards();
  assert.ok(cards.length > 20);
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length);
  assert.ok(cards.every((card) => card.front.trim() && card.back.trim()));
});
