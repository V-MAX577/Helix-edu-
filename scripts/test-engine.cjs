const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "helixedu-engine-"));

function compile(name) {
  const source = fs.readFileSync(path.join(root, name + ".ts"), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      strict: true,
    },
  }).outputText;
  fs.writeFileSync(path.join(temp, name + ".js"), output);
}

try {
  for (const name of ["math", "knowledge", "engine"]) compile(name);

  const math = require(path.join(temp, "math.js"));
  const engine = require(path.join(temp, "engine.js"));
  const input = (message) => ({
    message,
    mode: "deep-think",
    level: "intermediate",
    className: "Class 8",
    board: "Maharashtra State Board",
  });

  assert.equal(math.trySolveMath("245 + 378").answer, "623");
  assert.equal(math.trySolveMath("2x + 5 = 17").answer, "x = 6");
  assert.equal(math.trySolveMath("15% of 240").answer, "15% of 240 is 36");
  assert.equal(math.trySolveMath("1 kg to g").answer, "1 kg = 1000 g");
  assert.equal(math.trySolveMath("gcd of 48 and 36").answer, "GCD(48, 36) = 12");
  assert.throws(() => math.trySolveMath("1 kg to m"), math.MathError);
  assert.throws(() => math.trySolveMath("y + 2 = 5"), math.MathError);
  assert.equal(math.trySolveMath("lcm of 0 and 0"), null);
  assert.equal(math.trySolveMath("prime factors of 1"), null);

  assert.ok(knowledge.searchTopics("explain photosynthesis in simple words").length > 0);
  assert.equal(engine.runEngine(input("capital of France")).kind, "fallback");
  assert.equal(engine.runEngine(input("photosynthesis")).kind, "topic");

  process.stdout.write("HELIXEDU offline engine smoke tests passed.\n");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
