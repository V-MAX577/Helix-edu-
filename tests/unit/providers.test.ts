import assert from "node:assert/strict";
import test from "node:test";
import { activeProvider, listProviders } from "../../src/lib/ai";

test("provider opt-out always selects the free offline engine", () => {
  const previousEnabled = process.env.HELIXEDU_AI_ENABLED;
  const previousOpenAI = process.env.OPENAI_API_KEY;
  const previousGroq = process.env.GROQ_API_KEY;

  try {
    process.env.HELIXEDU_AI_ENABLED = "false";
    delete process.env.OPENAI_API_KEY;
    delete process.env.GROQ_API_KEY;

    assert.equal(activeProvider(), null);
    assert.equal(listProviders()[0].id, "helix-engine");
    assert.equal(listProviders()[0].configured, true);
  } finally {
    if (previousEnabled === undefined) delete process.env.HELIXEDU_AI_ENABLED;
    else process.env.HELIXEDU_AI_ENABLED = previousEnabled;
    if (previousOpenAI === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousOpenAI;
    if (previousGroq === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = previousGroq;
  }
});

test("provider status exposes only whether a key exists, never its value", () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const marker = "HELIXEDU_TEST_SECRET_MUST_NOT_LEAK";

  try {
    process.env.HELIXEDU_AI_ENABLED = "true";
    process.env.OPENAI_API_KEY = marker;

    const providers = listProviders();
    const openAI = providers.find((provider) => provider.id === "openai");

    assert.equal(openAI?.configured, true);
    assert.equal(JSON.stringify(providers).includes(marker), false);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    delete process.env.HELIXEDU_AI_ENABLED;
  }
});
