import assert from "node:assert/strict";
import test from "node:test";
import { runEngine, prettySubject } from "../../src/lib/engine";

const base = {
  mode: "deep-think" as const,
  level: "intermediate" as const,
  className: "Class 8",
  board: "Maharashtra State Board",
};

test("offline engine solves a linear equation", () => {
  const result = runEngine({ ...base, message: "solve 2x + 5 = 17" });

  assert.equal(result.kind, "math");
  assert.match(result.text, /6/);
  assert.ok(result.confidence >= 0.9);
});

test("offline engine responds to a short greeting", () => {
  const result = runEngine({ ...base, message: "yo" });

  assert.equal(result.kind, "greeting");
  assert.match(result.text, /HELIXEDU|explore|knowledge/i);
});

test("offline engine explains its capabilities without an external provider", () => {
  const result = runEngine({ ...base, message: "what can you do" });

  assert.equal(result.kind, "help");
  assert.match(result.text, /offline Helix Engine/i);
});

test("subject labels are readable and unknown slugs remain intact", () => {
  assert.equal(prettySubject("mathematics"), "Mathematics");
  assert.equal(prettySubject("custom-subject"), "custom-subject");
});
