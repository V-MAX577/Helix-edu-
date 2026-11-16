/**
 * HELIXEDU "Helix Engine" — the offline educational brain.
 *
 * This is what makes the free mode genuinely useful: a real dispatcher that
 * routes a student's question to the right solver (maths engine, knowledge
 * base, question bank, planner) and formats the answer for the selected
 * learning mode. It never fabricates answers and never pretends to be a
 * connected AI service.
 */

import { KNOWLEDGE_BY_SUBJECT, searchTopics, type KnowledgeTopic } from "./knowledge";
import { looksLikeMath, MathError, trySolveMath, type Solution } from "./math";

export type EngineMode = "deep-think" | "quick-learn" | "exam-prep" | "creative" | "coding";
export type EngineLevel = "beginner" | "intermediate" | "advanced";

export type EngineInput = {
  message: string;
  mode: EngineMode;
  level: EngineLevel;
  className: string;
  board: string;
  /** Recent turns so follow-up questions ("explain it simpler") make sense. */
  history?: { role: "user" | "assistant"; content: string }[];
  /** Practice questions available in the database, keyed by subject slug. */
  questionBank?: Record<string, { prompt: string; options: string[]; answerIndex: number; explanation: string }[]>;
};

export type EngineReply = {
  text: string;
  topicId?: string;
  subject?: string;
  kind: "math" | "topic" | "practice" | "planner" | "greeting" | "help" | "hint" | "fallback";
  confidence: number;
};

const MODE_LABEL: Record<EngineMode, string> = {
  "deep-think": "Deep Think",
  "quick-learn": "Quick Learn",
  "exam-prep": "Exam Preparation",
  creative: "Creative Mode",
  coding: "Coding Mode",
};

/* ----------------------------- formatting ---------------------------- */

function md(text: string): string {
  return text.trim();
}

function bullets(items: string[], ordered = false): string {
  return items
    .map((item, i) => `${ordered ? `${i + 1}.` : "-"} ${item}`)
    .join("\n");
}

function mathSteps(solution: Solution, mode: EngineMode, level: EngineLevel): string {
  const parts: string[] = [];
  if (mode === "quick-learn" || level === "beginner") {
    parts.push("**Answer:** " + solution.answer, "", "Here is how I got there:", "");
    parts.push(bullets(solution.steps.slice(0, 3)));
  } else {
    parts.push("**Answer:** " + solution.answer, "", "**Working, step by step:**", "");
    parts.push(bullets(solution.steps, true));
  }
  parts.push("", "_Want a different problem? Just type the equation, e.g. `2x + 5 = 17`._");
  return md(parts.join("\n"));
}

function topicAnswer(
  topic: KnowledgeTopic,
  mode: EngineMode,
  level: EngineLevel,
  input: EngineInput,
): string {
  const parts: string[] = [];
  const effectiveLevel: EngineLevel = level;

  parts.push(`### ${topic.title}`);
  parts.push(`_${MODEL_LABEL(mode)} · Subject: ${prettySubject(topic.subject)}_`, "");

  if (mode === "quick-learn") {
    parts.push(topic.simple, "");
    parts.push("**Remember this:** " + topic.keyPoints[0]);
    return md(parts.join("\n"));
  }

  if (mode === "creative") {
    parts.push(topic.story ?? topic.simple, "");
    parts.push("**The science/maths behind the story:** " + topic.simple);
    if (topic.example) parts.push("", "**Example:** " + topic.example);
    return md(parts.join("\n"));
  }

  if (mode === "exam-prep") {
    parts.push("**One-line definition:** " + topic.simple, "");
    parts.push("**Key exam points:**", bullets(topic.keyPoints), "");
    if (topic.mistakes?.length) {
      parts.push("**Mistakes examiners look for:**", bullets(topic.mistakes), "");
    }
    parts.push("**Likely questions:**", bullets(topic.practice ?? []));
    parts.push("", `_Revise this with flashcards: open **Learning Centre → ${prettySubject(topic.subject)} → ${topic.title}**._`);
    return md(parts.join("\n"));
  }

  if (mode === "coding") {
    parts.push(topic.simple, "");
    if (topic.code) {
      parts.push("**Try this code:**", "", "```" + topic.code.lang, topic.code.code, "```", "");
      parts.push("**What it does:** " + topic.deep[0]);
    } else {
      parts.push("**Key ideas:**", bullets(topic.keyPoints), "");
      parts.push(
        "**Coding angle:** this concept maps directly onto programming — think of it as an algorithm with clear inputs, rules and outputs.",
      );
    }
    return md(parts.join("\n"));
  }

  // Deep Think (default)
  if (effectiveLevel === "beginner") {
    parts.push(topic.simple, "");
    parts.push("**Key points:**", bullets(topic.keyPoints));
    if (topic.example) parts.push("", "**Example:** " + topic.example);
    return md(parts.join("\n"));
  }

  parts.push(topic.simple, "");
  parts.push(...topic.deep.map((p) => p + "\n"));
  parts.push("**Key points to remember:**", bullets(topic.keyPoints), "");
  if (topic.example) parts.push("**Example:** " + topic.example, "");
  if (topic.mistakes?.length) parts.push("**Common mistakes to avoid:**", bullets(topic.mistakes), "");
  if (topic.practice?.length) parts.push("**Practise now:**", bullets(topic.practice));

  return md(parts.join("\n"));
}

function MODEL_LABEL(mode: EngineMode): string {
  return MODE_LABEL[mode];
}

export function prettySubject(slug: string): string {
  const names: Record<string, string> = {
    mathematics: "Mathematics",
    science: "Science",
    english: "English",
    history: "History",
    geography: "Geography",
    "computer-science": "Computer Science",
    languages: "Languages",
    "general-knowledge": "General Knowledge",
  };
  return names[slug] ?? slug;
}

/* ------------------------------- helpers ------------------------------ */

const GREETINGS = /^(hi|hey|hello|yo|namaste|helix|helixedu|good (morning|afternoon|evening)|start)\b/i;

const HELP_WORDS = /(what can you do|help me|who are you|your features|capabilities|how do you work)/i;

const PRACTICE_WORDS = /(practice question|practise question|test me|quiz me|give me questions|mcq|multiple choice|sample questions?|more questions?)/i;

const HINT_WORDS = /(hint|clue|nudge|stuck|don't know|dont know|help me solve|where do i start)/i;

const PLAN_WORDS = /(study plan|study planner|revision plan|timetable|schedule|plan my (study|revision))/i;

const SIMPLER_WORDS = /(explain (it )?(again )?(more )?simpl|simpler|like i'?m (five|10|ten)|in simple words|eli5|easier)/i;

function stripFiller(message: string): string {
  return message
    .replace(/^(hey|hi|hello|please|pls|can you|could you|kindly)\b[,:\s]*/i, "")
    .replace(/\b(please|for me|thanks|thank you)\b/gi, "")
    .trim();
}

/* ------------------------------ dispatcher ---------------------------- */

export function runEngine(input: EngineInput): EngineReply {
  const raw = input.message.trim();
  const message = stripFiller(raw);

  if (!raw) {
    return {
      kind: "greeting",
      text: md(
        [
          "### 👋 Hello, explorer!",
          "",
          "I am the **HELIXEDU study engine**. I run completely offline on this device, so I work even with no internet and cost nothing.",
          "",
          "Here is what I can do right now:",
          bullets([
            "**Explain any topic** — try `explain photosynthesis` or `what is the Pythagorean theorem`",
            "**Solve maths step by step** — try `2x + 5 = 17`, `15% of 240`, `x² - 5x + 6 = 0`",
            "**Generate practice questions** — try `practice questions on fractions`",
            "**Give you a hint** — try `give me a hint for this equation: 3x + 4 = 19`",
            "**Build a study plan** — try `make a 7 day revision plan for science and maths`",
          ]),
          "",
          "Switch learning modes in the panel above: **Deep Think**, **Quick Learn**, **Exam Preparation**, **Creative** and **Coding**.",
        ].join("\n"),
      ),
      confidence: 1,
    };
  }

  if (GREETINGS.test(message) && message.split(/\s+/).length <= 4) {
    return {
      kind: "greeting",
      text: md(
        [
          "### 👋 Welcome aboard!",
          "",
          "Ready to explore knowledge? Ask me to explain a topic, solve an equation, or generate practice questions.",
          "",
          "**Try one of these:**",
          bullets([
            "`explain newton's laws of motion`",
            "`solve 3x + 7 = 22`",
            "`practice questions on trigonometry`",
            "`make a 5 day exam revision plan`",
          ]),
        ].join("\n"),
      ),
      confidence: 1,
    };
  }

  if (HELP_WORDS.test(message)) {
    return {
      kind: "help",
      text: md(
        [
          "### 🧠 What I can do",
          "",
          bullets([
            "**Explain topics** across Mathematics, Science, English, History, Geography, Computer Science, Languages and General Knowledge.",
            "**Solve mathematics step by step**: linear equations, quadratics, percentages, averages, GCD/LCM, prime factors, unit conversions and arithmetic.",
            "**Generate practice questions** from the question bank.",
            "**Give hints** when you are stuck, instead of full answers.",
            "**Create study plans** and revision timetables.",
            "**Teach programming** with real, runnable code examples in Coding Mode.",
          ]),
          "",
          "I am the **offline Helix Engine**. If an external AI provider is connected on this server, I will tell you before I use it — otherwise everything you see here is generated locally.",
        ].join("\n"),
      ),
      confidence: 1,
    };
  }

  /* 1. Mathematics — the most deterministic path, handled first. */
  if (looksLikeMath(message)) {
    try {
      const solution = trySolveMath(message);
      if (solution) {
        return {
          kind: "math",
          text: mathSteps(solution, input.mode, input.level),
          confidence: 0.95,
        };
      }
    } catch (err) {
      if (err instanceof MathError) {
        return {
          kind: "math",
          text: md(
            [
              "### 🧮 I could not read that equation",
              "",
              err.message,
              "",
              "**Formats I understand:**",
              bullets([
                "`2x + 5 = 17` — linear equations",
                "`x² - 5x + 6 = 0` — quadratics (use `x^2` if you cannot type ²)",
                "`15% of 240` — percentages",
                "`average of 4, 8, 15` — averages",
                "`gcd of 48 and 36` — number theory",
                "`5 km to m` — unit conversion",
              ]),
            ].join("\n"),
          ),
          confidence: 0.7,
        };
      }
    }
  }

  /* 2. Follow-up "explain it simpler" */
  if (SIMPLER_WORDS.test(message) && input.history?.length) {
    const previous = input.history.filter((h) => h.role === "assistant").slice(-1)[0];
    if (previous) {
      const simplified = simplifyMarkdown(previous.content);
      return {
        kind: "topic",
        text: md(
          [
            "### 🪐 Simpler version",
            "",
            simplified,
            "",
            "_Still too fast? Switch the mode to **Quick Learn** for short answers._",
          ].join("\n"),
        ),
        confidence: 0.6,
      };
    }
  }

  /* 3. Study planning */
  if (PLAN_WORDS.test(message)) {
    return { kind: "planner", text: plannerReply(input), confidence: 0.8 };
  }

  /* 4. Hints */
  if (HINT_WORDS.test(message)) {
    const eq = message.match(/[^:]\s*([0-9a-zA-Z+\-*/^(). ]+=[0-9a-zA-Z+\-*/^(). ]+)/);
    if (eq) {
      try {
        const solution = trySolveMath(eq[1].trim());
        if (solution && solution.kind === "linear") {
          return {
            kind: "hint",
            text: md(
              [
                "### 💡 Hint (not the full answer)",
                "",
                "Your equation is in the form **ax + b = c**.",
                "",
                bullets([
                  "Step 1: move the plain number to the other side (do the opposite operation).",
                  "Step 2: you now have **ax = something** — divide both sides by the number multiplying x.",
                  "Step 3: always substitute your answer back in to check.",
                ]),
                "",
                "_Tell me when you want the full worked solution._",
              ].join("\n"),
            ),
            confidence: 0.8,
          };
        }
      } catch {
        /* fall through to topic handling */
      }
    }
    return {
      kind: "hint",
      text: md(
        [
          "### 💡 Let me give you a hint",
          "",
          "I will not just hand over the answer — that is how learning sticks.",
          "",
          bullets([
            "**Read the question twice** and write down exactly what is given and what is asked.",
            "**Name the concept**: is it a formula, a definition, a comparison or a calculation?",
            "**Write one small step** you are sure about, even if it looks tiny.",
            "**Check units and signs** — most mistakes in maths are sign or unit errors.",
          ]),
          "",
          "Paste the exact question and I will give you a targeted hint.",
        ].join("\n"),
      ),
      confidence: 0.6,
    };
  }

  /* 5. Practice questions from the database bank */
  if (PRACTICE_WORDS.test(message)) {
    const practice = buildPractice(input);
    return {
      kind: "practice",
      subject: practice.subject,
      text: practice.text,
      confidence: 0.85,
    };
  }

  /* 6. Knowledge base */
  const hits = searchTopics(message);
  if (hits.length) {
    const best = hits[0];
    // A weak match only counts if the query is clearly about a topic.
    const unambiguous = hits.length === 1 || best.score - hits[1].score >= 3;
    if (best.score >= 6 && unambiguous) {
      return {
        kind: "topic",
        subject: best.topic.subject,
        topicId: best.topic.id,
        text: topicAnswer(best.topic, input.mode, input.level, input),
        confidence: Math.min(0.95, best.score / 12),
      };
    }
  }

  /* 7. Subject overview */
  const subjectOverview = subjectOverviewReply(message);
  if (subjectOverview) return subjectOverview;

  /* 8. Honest fallback */
  const suggestions = KNOWLEDGE_BY_SUBJECT[Object.keys(KNOWLEDGE_BY_SUBJECT)[0]] ?? [];
  return {
    kind: "fallback",
    text: md(
      [
        "### 🔭 I do not have that one yet",
        "",
        `I searched my ${countTopics()} offline topics and could not find a confident match for **"${truncate(message, 80)}"**.`,
        "",
        "I will not invent an answer — that would be worse than useless for your exams.",
        "",
        "**Try instead:**",
        bullets([
          "Rephrase with the exact chapter or topic name from your textbook.",
          "Ask about one of these: " + suggestions.slice(0, 5).map((t) => `\`${t.title}\``).join(", "),
          "Type `what can you do` to see everything I cover.",
        ]),
        "",
        "_If an external AI provider is connected on this server, this question is forwarded to it instead._",
      ].join("\n"),
    ),
    confidence: 0.2,
  };
}

function countTopics(): number {
  return Object.values(KNOWLEDGE_BY_SUBJECT).reduce((n, list) => n + list.length, 0);
}

function truncate(text: string, n: number): string {
  return text.length <= n ? text : text.slice(0, n - 1) + "…";
}

function simplifyMarkdown(md: string): string {
  // Keep the first few content lines and strip deep-dive detail.
  const lines = md.split("\n").filter((l) => l.trim().length > 0);
  const kept: string[] = [];
  for (const line of lines) {
    if (line.startsWith("###")) continue;
    if (line.startsWith("_")) continue;
    kept.push(line);
    if (kept.length >= 6) break;
  }
  const text = kept.join("\n");
  const firstSentence = text.split(/(?<=[.!?])\s/)[0];
  return firstSentence ? firstSentence + "\n\n" + kept.slice(1).join("\n") : text;
}

/* --------------------------- practice builder ------------------------- */

function buildPractice(input: EngineInput): { text: string; subject?: string } {
  const hits = searchTopics(input.message);
  const subject = hits[0]?.topic.subject;

  if (subject && input.questionBank?.[subject]?.length) {
    const bank = input.questionBank[subject].slice(0, 4);
    return {
      subject,
      text: md(
        [
          `### 📝 Practice questions — ${prettySubject(subject)}`,
          "",
          ...bank.flatMap((q, i) => [
            `**Q${i + 1}.** ${q.prompt}`,
            bullets(q.options.map((o, oi) => `${String.fromCharCode(65 + oi)}) ${o}`)),
            "",
          ]),
          "_Answers are checked when you submit. Open the **Quizzes** page to take a timed test with scoring._",
        ].join("\n"),
      ),
    };
  }

  const topic = hits[0]?.topic;
  if (topic?.practice?.length) {
    return {
      subject: topic.subject,
      text: md(
        [
          `### 📝 Practice questions — ${topic.title}`,
          "",
          bullets(topic.practice),
          "",
          "_Type your answer and I will check your reasoning. Or open the **Quizzes** page for auto-marked MCQs._",
        ].join("\n"),
      ),
    };
  }

  const bank = input.questionBank ? Object.entries(input.questionBank) : [];
  if (bank.length) {
    const [subj, questions] = bank[0];
    return {
      subject: subj,
      text: md(
        [
          `### 📝 Practice questions — ${prettySubject(subj)}`,
          "",
          ...questions.slice(0, 4).flatMap((q, i) => [
            `**Q${i + 1}.** ${q.prompt}`,
            bullets(q.options.map((o, oi) => `${String.fromCharCode(65 + oi)}) ${o}`)),
            "",
          ]),
        ].join("\n"),
      ),
    };
  }

  return {
    text: md(
      [
        "### 📝 Practice questions",
        "",
        "Name a subject and I will pull questions from the question bank, for example:",
        bullets(["`practice questions on algebra`", "`test me on photosynthesis`", "`quiz me on computer networks`"]),
      ].join("\n"),
    ),
  };
}

/* ----------------------------- planner reply -------------------------- */

function plannerReply(input: EngineInput): string {
  const daysMatch = input.message.match(/(\d+)\s*(day|week|month)/i);
  const count = daysMatch ? Number(daysMatch[1]) : 7;
  const subjects = Object.keys(KNOWLEDGE_BY_SUBJECT).filter((s) =>
    input.message.toLowerCase().includes(prettySubject(s).toLowerCase()) ||
    input.message.toLowerCase().includes(s),
  );
  const chosen = subjects.length ? subjects : ["mathematics", "science"];
  const plan: string[] = [];
  for (let i = 0; i < Math.min(count, 14); i++) {
    const subject = chosen[i % chosen.length];
    const topics = KNOWLEDGE_BY_SUBJECT[subject] ?? [];
    const topic = topics[(i * 3) % Math.max(topics.length, 1)];
    plan.push(
      `**Day ${i + 1} — ${prettySubject(subject)}:** ${topic ? topic.title : "Revision"}. Read the lesson, make 5 flashcards, then answer 10 MCQs.`,
    );
  }
  return md(
    [
      `### 🗓️ ${count}-day study plan`,
      "",
      ...plan,
      "",
      "**How to use it:**",
      bullets([
        "Study in 25-minute focused blocks with 5-minute breaks (the Pomodoro technique).",
        "Finish each session by writing 3 lines of summary in your own words — that is active recall.",
        "Open the **Study Planner** page to save this plan and track it daily.",
      ]),
    ].join("\n"),
  );
}

/* --------------------------- subject overview ------------------------- */

function subjectOverviewReply(message: string): EngineReply | null {
  const m = message.match(/\b(mathematics|maths|math|science|english|history|geography|computer science|computers|languages|general knowledge|gk)\b/i);
  if (!m) return null;
  const slug = m[1].toLowerCase();
  const map: Record<string, string> = {
    maths: "mathematics",
    math: "mathematics",
    computers: "computer-science",
    "computer science": "computer-science",
    gk: "general-knowledge",
  };
  const subject = map[slug] ?? slug;
  const topics = KNOWLEDGE_BY_SUBJECT[subject];
  if (!topics) return null;
  return {
    kind: "topic",
    subject,
    text: md(
      [
        `### ${prettySubject(subject)} — topics I can teach`,
        "",
        bullets(topics.map((t) => `**${t.title}** — ${t.simple.split(". ")[0]}.`)),
        "",
        `_Open **Learning Centre → ${prettySubject(subject)}** for full lessons, flashcards and quizzes._`,
      ].join("\n"),
    ),
    confidence: 0.75,
  };
}
