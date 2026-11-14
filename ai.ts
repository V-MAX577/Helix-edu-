/**
 * HELIXEDU AI provider layer.
 *
 * Rules enforced by this file:
 *  - API keys are read only from server-side environment variables.
 *  - No key is ever sent to the browser.
 *  - A provider is used ONLY when one is explicitly configured AND
 *    HELIXEDU_AI_ENABLED is not "false".
 *  - When nothing is configured, callers fall back to the offline Helix
 *    Engine, and the UI says so plainly.
 */

export type ProviderId =
  | "helix-engine"
  | "openai"
  | "openrouter"
  | "groq"
  | "together"
  | "mistral"
  | "gemini"
  | "anthropic"
  | "custom";

export type ProviderInfo = {
  id: ProviderId;
  label: string;
  configured: boolean;
  freeTier: boolean;
  note: string;
};

const OPENAI_COMPATIBLE: Record<
  string,
  { label: string; base: string; model: string; envKey: string; envModel: string; freeTier: boolean; note: string }
> = {
  openai: {
    label: "OpenAI",
    base: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    envKey: "OPENAI_API_KEY",
    envModel: "OPENAI_MODEL",
    freeTier: false,
    note: "Paid API. Add credit to your OpenAI account to use it.",
  },
  openrouter: {
    label: "OpenRouter",
    base: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.1-8b-instruct",
    envKey: "OPENROUTER_API_KEY",
    envModel: "OPENROUTER_MODEL",
    freeTier: true,
    note: "Aggregator with several genuinely free models.",
  },
  groq: {
    label: "Groq",
    base: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    envKey: "GROQ_API_KEY",
    envModel: "GROQ_MODEL",
    freeTier: true,
    note: "Very fast free tier for open models.",
  },
  together: {
    label: "Together AI",
    base: "https://api.together.xyz/v1",
    model: "meta-llama/Llama-3-8b-chat-hf",
    envKey: "TOGETHER_API_KEY",
    envModel: "TOGETHER_MODEL",
    freeTier: true,
    note: "Free credits on signup for open models.",
  },
  mistral: {
    label: "Mistral",
    base: "https://api.mistral.ai/v1",
    model: "mistral-small-latest",
    envKey: "MISTRAL_API_KEY",
    envModel: "MISTRAL_MODEL",
    freeTier: true,
    note: "Free tier available for small models.",
  },
};

function aiEnabled(): boolean {
  return process.env.HELIXEDU_AI_ENABLED !== "false";
}

/** Lists every provider and whether it is currently connected. */
export function listProviders(): ProviderInfo[] {
  const out: ProviderInfo[] = [
    {
      id: "helix-engine",
      label: "Helix Offline Engine",
      configured: true,
      freeTier: true,
      note: "Built-in tutor: real step-by-step maths solver, 45+ topic knowledge base, question generator. Always available, zero cost, works with no internet.",
    },
  ];

  for (const [id, cfg] of Object.entries(OPENAI_COMPATIBLE)) {
    out.push({
      id: id as ProviderId,
      label: cfg.label,
      configured: Boolean(process.env[cfg.envKey]),
      freeTier: cfg.freeTier,
      note: cfg.note,
    });
  }

  out.push({
    id: "gemini",
    label: "Google Gemini",
    configured: Boolean(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY),
    freeTier: true,
    note: "Google AI Studio free tier (generous rate limits).",
  });
  out.push({
    id: "anthropic",
    label: "Anthropic Claude",
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
    freeTier: false,
    note: "Paid API. Very strong reasoning for exam-style explanations.",
  });
  out.push({
    id: "custom",
    label: "Custom OpenAI-compatible endpoint",
    configured: Boolean(process.env.HELIXEDU_AI_KEY && process.env.HELIXEDU_AI_BASE_URL),
    freeTier: true,
    note: "Point HELIXEDU at any OpenAI-compatible API, including a self-hosted model such as Ollama.",
  });

  return out;
}

export function activeProvider(): ProviderInfo | null {
  if (!aiEnabled()) return null;
  return listProviders().find((p) => p.id !== "helix-engine" && p.configured) ?? null;
}

/* ------------------------------------------------------------------ */
/*  Transport                                                          */
/* ------------------------------------------------------------------ */

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly provider: string,
  ) {
    super(message);
  }
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeoutMs = 45_000,
): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new ProviderError(`Provider returned a non-JSON response (HTTP ${res.status}).`, url);
    }
    if (!res.ok) {
      const message =
        (json.error as { message?: string } | undefined)?.message ??
        (json.message as string | undefined) ??
        `Provider returned HTTP ${res.status}.`;
      throw new ProviderError(message, url);
    }
    return json;
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    if ((err as Error).name === "AbortError")
      throw new ProviderError("The provider took too long to answer (timeout).", url);
    throw new ProviderError(`Could not reach the provider: ${(err as Error).message}`, url);
  } finally {
    clearTimeout(timer);
  }
}

function systemPrompt(mode: string, level: string, board: string, className: string): string {
  const modeGuide: Record<string, string> = {
    "deep-think":
      "Give a thorough, well-structured explanation with definitions, reasoning, worked examples and common mistakes. Use headings and bullet lists.",
    "quick-learn":
      "Answer in at most 6 short lines. Use plain language and one memorable line the student can recall in an exam.",
    "exam-prep":
      "Focus on exam technique: key points likely to be asked, definitions to memorise, likely short/long questions and quick revision notes.",
    creative:
      "Teach through a vivid short story, analogy or imagined scenario, then summarise the real concept underneath it.",
    coding:
      "Teach programming with runnable code examples, line-by-line explanation of what the code does, and one practice challenge. Always use a fenced code block with the language named.",
  };
  return [
    "You are HELIXEDU, the AI study assistant of a futuristic learning platform.",
    `The student is studying ${className} of the ${board}.`,
    `Adapt your explanation to a ${level} learner.`,
    "Be accurate, encouraging and concrete. Never invent facts. If you are unsure, say so.",
    "Never claim to be connected to a service you are not connected to.",
    "",
    "Response style for the current mode:",
    modeGuide[mode] ?? modeGuide["deep-think"],
  ].join("\n");
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function callProvider(
  input: { messages: ChatTurn[]; mode: string; level: string; board: string; className: string },
): Promise<{ text: string; provider: ProviderId; model: string }> {
  const provider = activeProvider();
  if (!provider)
    throw new ProviderError("No AI provider is connected.", "helix-engine");

  const sys = systemPrompt(input.mode, input.level, input.board, input.className);

  /* Generic override first */
  const customKey = process.env.HELIXEDU_AI_KEY;
  const customBase = process.env.HELIXEDU_AI_BASE_URL;
  if (customKey && customBase) {
    const json = await postJson(
      `${customBase.replace(/\/$/, "")}/chat/completions`,
      { authorization: `Bearer ${customKey}` },
      {
        model: process.env.HELIXEDU_AI_MODEL ?? "default",
        messages: [{ role: "system", content: sys }, ...input.messages],
        temperature: 0.4,
      },
    );
    return { text: extractOpenAI(json), provider: "custom", model: String(process.env.HELIXEDU_AI_MODEL ?? "default") };
  }

  if (provider.id in OPENAI_COMPATIBLE) {
    const cfg = OPENAI_COMPATIBLE[provider.id];
    const key = process.env[cfg.envKey] as string;
    const model = process.env[cfg.envModel] ?? cfg.model;
    const json = await postJson(
      `${cfg.base}/chat/completions`,
      { authorization: `Bearer ${key}` },
      {
        model,
        messages: [{ role: "system", content: sys }, ...input.messages],
        temperature: 0.4,
      },
    );
    return { text: extractOpenAI(json), provider: provider.id, model };
  }

  if (provider.id === "gemini") {
    const key = (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY) as string;
    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const contents = [
      { role: "user", parts: [{ text: sys }] },
      { role: "model", parts: [{ text: "Understood. I am ready to teach as HELIXEDU." }] },
      ...input.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];
    const json = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {},
      { contents, generationConfig: { temperature: 0.4 } },
    );
    const candidates = json.candidates as { content?: { parts?: { text?: string }[] } }[] | undefined;
    const text = candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n") ?? "";
    if (!text) throw new ProviderError("Gemini returned an empty answer.", "gemini");
    return { text, provider: "gemini", model };
  }

  if (provider.id === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY as string;
    const model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest";
    const json = await postJson(
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": key, "anthropic-version": "2023-06-01" },
      {
        model,
        max_tokens: 2048,
        system: sys,
        messages: input.messages,
      },
    );
    const content = json.content as { text?: string }[] | undefined;
    const text = content?.map((c) => c.text ?? "").join("\n") ?? "";
    if (!text) throw new ProviderError("Anthropic returned an empty answer.", "anthropic");
    return { text, provider: "anthropic", model };
  }

  throw new ProviderError("Unsupported provider.", provider.id);
}

function extractOpenAI(json: Record<string, unknown>): string {
  const choices = json.choices as { message?: { content?: string } }[] | undefined;
  const text = choices?.[0]?.message?.content ?? "";
  if (!text) throw new ProviderError("The provider returned an empty answer.", "openai-compatible");
  return text;
}
