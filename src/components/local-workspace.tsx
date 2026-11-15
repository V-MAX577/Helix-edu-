"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Markdown, Panel } from "@/components/ui";
import { CURRICULUM, getAllFlashcards, getAllQuestions, type LessonBlock } from "@/lib/curriculum";
import { runEngine, type EngineMode } from "@/lib/engine";
import {
  completeLesson,
  deleteLocalNote,
  getLearnerSettings,
  getLearnerStats,
  getLocalChatMessages,
  getStudyStreak,
  reviewFlashcard,
  saveChatMessage,
  saveLearnerSettings,
  saveLocalNote,
  submitLocalQuiz,
  type LearnerSettings,
  type LocalChatMessage,
  type LocalNote,
} from "@/lib/learner-data";
import { getAllDeviceRecords, putDeviceRecord } from "@/lib/device-store";
import { DeviceBackupControls } from "./device-backup-controls";
import { LocalBookmarkButton, LocalBookmarksPanel } from "./local-bookmarks";
import { LocalAchievementsPanel } from "./local-achievements";
import { LocalReminderPanel } from "./local-reminders";

type Tab = "overview" | "learn" | "quiz" | "cards" | "notes" | "bookmarks" | "assistant" | "planner" | "reminders" | "settings";
type Stats = Awaited<ReturnType<typeof getLearnerStats>>;

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Home", icon: "🛰️" },
  { id: "learn", label: "Learn", icon: "📚" },
  { id: "quiz", label: "Quiz", icon: "📝" },
  { id: "cards", label: "Cards", icon: "🃏" },
  { id: "notes", label: "Notes", icon: "📒" },
  { id: "bookmarks", label: "Saved", icon: "🔖" },
  { id: "assistant", label: "AI Tutor", icon: "🧠" },
  { id: "planner", label: "Planner", icon: "🗓️" },
  { id: "reminders", label: "Reminders", icon: "⏰" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const MODES: { id: EngineMode; label: string }[] = [
  { id: "deep-think", label: "Deep Think" },
  { id: "quick-learn", label: "Quick Learn" },
  { id: "exam-prep", label: "Exam Prep" },
  { id: "creative", label: "Creative" },
  { id: "coding", label: "Coding" },
];

function Block({ block }: { block: LessonBlock }) {
  if (block.kind === "heading") return <h3 className="text-lg font-bold">{block.text}</h3>;
  if (block.kind === "paragraph") return <p className="text-sm leading-7 text-[var(--text-muted)]">{block.text}</p>;
  if (block.kind === "formula") return <div className="rounded-xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel)_75%,transparent)] p-4 text-center font-mono text-sm">{block.text}</div>;
  if (block.kind === "example") return <div className="rounded-xl border border-[var(--panel-border)] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{block.title ?? "Example"}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{block.text}</p></div>;
  if (block.kind === "tip") return <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm">💡 {block.text}</div>;
  if (block.kind === "code") return <pre className="overflow-x-auto rounded-xl bg-black/40 p-4 text-xs leading-6"><code>{block.code}</code></pre>;
  return <ul className={block.ordered ? "list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--text-muted)]" : "list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--text-muted)]"}>{block.items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}

export function LocalLearningWorkspace() {
  const [tab, setTab] = useState<Tab>("overview");
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<LearnerSettings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [streak, setStreak] = useState({ current: 0, longest: 0, totalDays: 0 });
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [subjectSlug, setSubjectSlug] = useState(CURRICULUM[0]?.slug ?? "");
  const [chapterSlug, setChapterSlug] = useState(CURRICULUM[0]?.chapters[0]?.slug ?? "");
  const [lessonSlug, setLessonSlug] = useState(CURRICULUM[0]?.chapters[0]?.lessons[0]?.slug ?? "");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; percent: number } | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardBack, setCardBack] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [assistantMode, setAssistantMode] = useState<EngineMode>("deep-think");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [planTitle, setPlanTitle] = useState("My study plan");
  const [planMinutes, setPlanMinutes] = useState(30);
  const [planMessage, setPlanMessage] = useState("");

  const subject = CURRICULUM.find((item) => item.slug === subjectSlug) ?? CURRICULUM[0];
  const chapter = subject?.chapters.find((item) => item.slug === chapterSlug) ?? subject?.chapters[0];
  const lesson = chapter?.lessons.find((item) => item.slug === lessonSlug) ?? chapter?.lessons[0];
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const allCards = useMemo(() => getAllFlashcards(), []);
  const questionBank = useMemo(
    () => Object.fromEntries(CURRICULUM.map((item) => [item.slug, item.chapters.flatMap((chapterItem) => chapterItem.questions)])),
    [],
  );
  const quizQuestions = useMemo(() => allQuestions.slice(0, 10), [allQuestions]);
  const currentQuestion = quizQuestions[questionIndex];
  const currentCard = allCards[cardIndex];

  const refreshProgress = useCallback(async () => {
    const [nextStats, nextStreak, completed, savedNotes] = await Promise.all([
      getLearnerStats(),
      getStudyStreak(),
      getAllDeviceRecords<{ id: string; lessonId?: string }>("lessonProgress"),
      getAllDeviceRecords<LocalNote>("notes"),
    ]);
    setStats(nextStats);
    setStreak(nextStreak);
    setCompletedIds(completed.map((row) => row.lessonId ?? row.id));
    setNotes(savedNotes.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [profile, savedMessages] = await Promise.all([
          getLearnerSettings(),
          getLocalChatMessages("local-assistant"),
        ]);
        if (cancelled) return;
        const params = new URLSearchParams(window.location.search);
        const requestedTab = params.get("tab");
        if (TABS.some((item) => item.id === requestedTab)) setTab(requestedTab as Tab);
        const requestedSubject = params.get("subject");
        const requestedChapter = params.get("chapter");
        const requestedLesson = params.get("lesson");
        const selectedSubject = CURRICULUM.find((item) => item.slug === requestedSubject);
        if (selectedSubject) {
          setSubjectSlug(selectedSubject.slug);
          const selectedChapter = selectedSubject.chapters.find((item) => item.slug === requestedChapter) ?? selectedSubject.chapters[0];
          if (selectedChapter) {
            setChapterSlug(selectedChapter.slug);
            const selectedLesson = selectedChapter.lessons.find((item) => item.slug === requestedLesson) ?? selectedChapter.lessons[0];
            if (selectedLesson) setLessonSlug(selectedLesson.slug);
          }
        }
        setSettings(profile);
        setMessages(savedMessages);
        await refreshProgress();
      } catch {
        // The interface remains usable and shows storage errors on save actions.
      }
      if (!cancelled) setReady(true);
    }
    void load();
    return () => { cancelled = true; };
  }, [refreshProgress]);

  async function markLessonComplete() {
    if (!lesson) return;
    await completeLesson(lesson.slug, lesson.minutes);
    await refreshProgress();
  }

  async function finishQuiz() {
    const result = await submitLocalQuiz(
      "helixedu-practice-set",
      quizQuestions.map((item) => ({ id: item.id, prompt: item.prompt, options: item.options, answerIndex: item.answerIndex, explanation: item.explanation })),
      answers,
      300,
    );
    setQuizResult(result);
    await refreshProgress();
  }

  async function saveNote(event: FormEvent) {
    event.preventDefault();
    const title = noteTitle.trim() || "Untitled note";
    if (!noteBody.trim()) return;
    await saveLocalNote({ title, body: noteBody });
    setNoteTitle("");
    setNoteBody("");
    await refreshProgress();
  }

  async function askAssistant(event: FormEvent) {
    event.preventDefault();
    const question = assistantInput.trim();
    if (!question || assistantBusy || !settings) return;
    setAssistantBusy(true);
    setAssistantInput("");
    const userMessage = await saveChatMessage({ sessionId: "local-assistant", role: "user", content: question, provider: "user" });
    const history = [...messages, userMessage].slice(-12).map((item) => ({ role: item.role, content: item.content })) as { role: "user" | "assistant"; content: string }[];
    const response = runEngine({
      message: question,
      mode: assistantMode,
      level: settings.level,
      className: settings.className,
      board: settings.board,
      history,
      questionBank,
    });
    const assistantMessage = await saveChatMessage({ sessionId: "local-assistant", role: "assistant", content: response.text, provider: "helix-engine" });
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setAssistantReply(response.text);
    setAssistantBusy(false);
    await refreshProgress();
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    const next = await saveLearnerSettings({
      name: settings.name.trim() || "Explorer",
      board: settings.board,
      className: settings.className,
      level: settings.level,
      dailyGoalMinutes: Math.max(10, Math.min(240, settings.dailyGoalMinutes)),
    });
    setSettings(next);
    await refreshProgress();
  }

  async function createStudyPlan(event: FormEvent) {
    event.preventDefault();
    const plan = {
      id: "active-plan",
      title: planTitle.trim() || "My study plan",
      minutesPerDay: Math.max(10, Math.min(240, planMinutes)),
      createdAt: new Date().toISOString(),
      tasks: [
        { id: "lesson", label: "Complete one lesson", done: false },
        { id: "quiz", label: "Attempt a practice quiz", done: false },
        { id: "cards", label: "Review five flashcards", done: false },
      ],
    };
    await putDeviceRecord("studyPlans", plan);
    setPlanMessage("Study plan saved on this device.");
  }

  if (!ready) return <main className="mx-auto max-w-6xl px-5 py-16"><Panel><p className="text-sm text-[var(--text-muted)]">Opening your local learning universe…</p></Panel></main>;

  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 lg:px-8">
        <Link href="/" className="text-gradient text-lg font-extrabold tracking-[0.16em]">HELIXEDU</Link>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="size-2 rounded-full bg-emerald-400" /> DEVICE-ONLY MODE
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <section className="panel relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 85% 10%, rgba(168,85,247,.25), transparent 42%), radial-gradient(circle at 10% 90%, rgba(34,211,238,.12), transparent 40%)" }} />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="chip chip-accent">🚀 YOUR LEARNING UNIVERSE</p>
              <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Welcome, {settings?.name || "Explorer"}.</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">Learn, practise and track your progress. Your personal learning data stays in this browser on this device. The curriculum and Helix Engine work offline.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold tabular-nums">{streak.current} 🔥</div>
              <div className="text-xs text-[var(--text-muted)]">day streak</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [String(CURRICULUM.length), "Subjects"],
              [String(stats?.lessonsCompleted ?? 0), "Lessons completed"],
              [String(stats?.quizzesTaken ?? 0), "Quizzes taken"],
              [String(stats?.todayMinutes ?? 0), "Minutes today"],
            ].map(([value, label]) => <div className="rounded-xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel)_75%,transparent)] p-3" key={label}><div className="text-2xl font-extrabold">{value}</div><div className="text-xs text-[var(--text-muted)]">{label}</div></div>)}
          </div>
        </section>

        <nav className="my-6 flex gap-2 overflow-x-auto pb-1" aria-label="HELIXEDU sections">
          {TABS.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`btn btn-sm shrink-0 ${tab === item.id ? "btn-primary" : "btn-ghost"}`}>{item.icon} {item.label}</button>)}
        </nav>

        {tab === "overview" && <section className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="text-xl font-bold">📚 Learning Centre</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Explore {CURRICULUM.length} subjects and their bundled lessons, quizzes and flashcards.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {CURRICULUM.map((item) => <button key={item.slug} type="button" onClick={() => { setSubjectSlug(item.slug); setChapterSlug(item.chapters[0]?.slug ?? ""); setLessonSlug(item.chapters[0]?.lessons[0]?.slug ?? ""); setTab("learn"); }} className="rounded-xl border border-[var(--panel-border)] p-3 text-left hover:border-violet-400"><span className="text-xl">{item.icon}</span><span className="ml-2 font-semibold">{item.name}</span><span className="mt-1 block text-xs text-[var(--text-muted)]">{item.chapters.length} chapters</span></button>)}
            </div>
          </Panel>
          <Panel>
            <h2 className="text-xl font-bold">📈 Your progress</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--panel)] p-3"><div className="text-2xl font-bold">{stats?.quizAccuracy ?? 0}%</div><div className="text-xs text-[var(--text-muted)]">Quiz accuracy</div></div>
              <div className="rounded-xl bg-[var(--panel)] p-3"><div className="text-2xl font-bold">{stats?.flashcardsReviewed ?? 0}</div><div className="text-xs text-[var(--text-muted)]">Card reviews</div></div>
              <div className="rounded-xl bg-[var(--panel)] p-3"><div className="text-2xl font-bold">{stats?.totalMinutes ?? 0}</div><div className="text-xs text-[var(--text-muted)]">Study minutes</div></div>
              <div className="rounded-xl bg-[var(--panel)] p-3"><div className="text-2xl font-bold">{streak.longest}</div><div className="text-xs text-[var(--text-muted)]">Longest streak</div></div>
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">Daily goal: {stats?.todayMinutes ?? 0}/{settings?.dailyGoalMinutes ?? 30} minutes</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--panel-border)]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${Math.min(100, ((stats?.todayMinutes ?? 0) / (settings?.dailyGoalMinutes ?? 30)) * 100)}%` }} /></div>
          </Panel>
          <LocalAchievementsPanel stats={stats} streak={streak} completedIds={completedIds} />
        </section>}

        {tab === "learn" && <section className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <Panel className="grid content-start gap-3">
            <h2 className="font-bold">Choose a lesson</h2>
            <label className="grid gap-1 text-xs text-[var(--text-muted)]">Subject<select className="field" value={subjectSlug} onChange={(event) => { const next = CURRICULUM.find((item) => item.slug === event.target.value); setSubjectSlug(event.target.value); setChapterSlug(next?.chapters[0]?.slug ?? ""); setLessonSlug(next?.chapters[0]?.lessons[0]?.slug ?? ""); }}>{CURRICULUM.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <label className="grid gap-1 text-xs text-[var(--text-muted)]">Chapter<select className="field" value={chapter?.slug ?? ""} onChange={(event) => { const next = subject?.chapters.find((item) => item.slug === event.target.value); setChapterSlug(event.target.value); setLessonSlug(next?.lessons[0]?.slug ?? ""); }}>{subject?.chapters.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label>
            <label className="grid gap-1 text-xs text-[var(--text-muted)]">Lesson<select className="field" value={lesson?.slug ?? ""} onChange={(event) => setLessonSlug(event.target.value)}>{chapter?.lessons.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label>
            <p className="text-xs text-[var(--text-muted)]">{completedIds.length} lessons completed</p>
          </Panel>
          <Panel>
            {lesson ? <><p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">{subject?.name} · {chapter?.title} · {lesson.minutes} min</p><h2 className="mt-2 text-2xl font-extrabold">{lesson.title}</h2><div className="mt-5 space-y-4">{lesson.blocks.map((block, index) => <Block block={block} key={index} />)}</div><div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => void markLessonComplete()} className="btn btn-primary btn-sm">{completedIds.includes(lesson.slug) ? "Mark complete again" : "✓ Mark lesson complete"}</button><LocalBookmarkButton targetId={lesson.slug} title={lesson.title} subtitle={(subject?.name ?? "") + " · " + (chapter?.title ?? "")} href={"/demo?tab=learn&subject=" + subjectSlug + "&chapter=" + chapterSlug + "&lesson=" + lesson.slug} /></div></> : <p>No lesson content in this chapter yet.</p>}
          </Panel>
        </section>}

        {tab === "quiz" && <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="chip chip-accent">PRACTICE SET</p><h2 className="mt-3 text-2xl font-bold">Question {questionIndex + 1} of {quizQuestions.length}</h2></div><span className="text-xs text-[var(--text-muted)]">Answers are marked on this device</span></div>
          {currentQuestion && !quizResult && <><h3 className="mt-5 text-lg font-semibold">{currentQuestion.prompt}</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{currentQuestion.options.map((option, index) => <button key={option} type="button" onClick={() => setAnswers((old) => ({ ...old, [currentQuestion.id]: index }))} className={`rounded-xl border p-4 text-left text-sm ${answers[currentQuestion.id] === index ? "border-violet-400 bg-violet-500/15" : "border-[var(--panel-border)]"}`}>{String.fromCharCode(65 + index)}. {option}</button>)}</div><div className="mt-5 flex flex-wrap gap-2"><button type="button" className="btn btn-ghost btn-sm" disabled={questionIndex === 0} onClick={() => setQuestionIndex((n) => n - 1)}>Previous</button><button type="button" className="btn btn-primary btn-sm" disabled={questionIndex === quizQuestions.length - 1} onClick={() => setQuestionIndex((n) => n + 1)}>Next</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => void finishQuiz()}>Submit quiz</button></div></>}
          {quizResult && <div className="mt-5 rounded-xl border border-[var(--panel-border)] p-4"><h3 className="text-xl font-bold">Score: {quizResult.score}/{quizResult.total} ({quizResult.percent}%)</h3><p className="mt-2 text-sm text-[var(--text-muted)]">Your result is saved locally.</p><button type="button" className="btn btn-primary btn-sm mt-4" onClick={() => { setAnswers({}); setQuizResult(null); setQuestionIndex(0); }}>Try again</button></div>}
        </Panel>}

        {tab === "cards" && <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="chip chip-accent">SPACED REPETITION</p><h2 className="mt-3 text-2xl font-bold">Flashcards</h2></div><span className="text-xs text-[var(--text-muted)]">{allCards.length ? cardIndex + 1 : 0}/{allCards.length}</span></div>
          {currentCard && <><button type="button" onClick={() => setCardBack((value) => !value)} className="mt-5 flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel)_75%,transparent)] p-6 text-center"><span className="text-xs tracking-widest text-[var(--text-muted)]">{cardBack ? "ANSWER" : "QUESTION"} · TAP TO FLIP</span><span className="mt-4 text-xl font-bold">{cardBack ? currentCard.back : currentCard.front}</span>{cardBack && currentCard.hint && <span className="mt-3 text-xs text-[var(--text-muted)]">{currentCard.hint}</span>}</button><div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCardIndex((n) => (n + allCards.length - 1) % allCards.length); setCardBack(false); }}>Previous</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCardIndex((n) => (n + 1) % allCards.length); setCardBack(false); }}>Next</button><button type="button" className="btn btn-primary btn-sm" onClick={async () => { await reviewFlashcard(currentCard.id, true); setCardIndex((n) => (n + 1) % allCards.length); setCardBack(false); await refreshProgress(); }}>I knew it</button><button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await reviewFlashcard(currentCard.id, false); setCardIndex((n) => (n + 1) % allCards.length); setCardBack(false); await refreshProgress(); }}>Review again</button></div></>}
        </Panel>}

        {tab === "notes" && <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel><h2 className="text-xl font-bold">📒 Create a note</h2><form className="mt-4 grid gap-3" onSubmit={saveNote}><input className="field" placeholder="Note title" value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} /><textarea className="field min-h-40" placeholder="Write your study notes…" value={noteBody} onChange={(event) => setNoteBody(event.target.value)} required /><button className="btn btn-primary btn-sm" type="submit">Save note on device</button></form></Panel>
          <Panel><h2 className="text-xl font-bold">Your notes ({notes.length})</h2><div className="mt-4 grid gap-2">{notes.map((note) => <article key={note.id} className="rounded-xl border border-[var(--panel-border)] p-3"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{note.title}</h3><button type="button" className="text-xs text-rose-300" onClick={async () => { await deleteLocalNote(note.id); await refreshProgress(); }}>Delete</button></div><p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{note.body}</p></article>)}{!notes.length && <p className="text-sm text-[var(--text-muted)]">No notes saved yet.</p>}</div></Panel>
        </section>}

        {tab === "bookmarks" && <LocalBookmarksPanel />}

        {tab === "assistant" && <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="chip chip-accent">NO API KEY · NO SERVER CHAT STORAGE</p><h2 className="mt-3 text-2xl font-bold">Helix Offline Engine</h2></div><span className="text-xs text-emerald-300">Runs in this browser</span></div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Ask questions, solve maths and revise topics. This built-in engine works without an account, paid API or network request.</p>
          <div className="mt-4 flex flex-wrap gap-2">{MODES.map((mode) => <button key={mode.id} type="button" onClick={() => setAssistantMode(mode.id)} className={`btn btn-sm ${assistantMode === mode.id ? "btn-primary" : "btn-ghost"}`}>{mode.label}</button>)}</div>
          <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={askAssistant}><input className="field flex-1" value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} maxLength={4000} placeholder="Ask Helix a question…" /><button type="submit" className="btn btn-primary btn-sm" disabled={assistantBusy || !assistantInput.trim()}>{assistantBusy ? "Thinking…" : "Ask Helix"}</button></form>
          {assistantReply && <div className="mt-5 rounded-xl border border-[var(--panel-border)] p-4"><Markdown content={assistantReply} /></div>}
          <div className="mt-5 grid gap-2">{messages.slice(-8).map((message) => <div key={message.id} className={`rounded-xl p-3 text-sm ${message.role === "user" ? "ml-6 bg-violet-500/10" : "mr-6 bg-[var(--panel)]"}`}><p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{message.role === "user" ? "You" : "Helix"}</p><div className="whitespace-pre-wrap">{message.content}</div></div>)}</div>
        </Panel>}

        {tab === "planner" && <Panel><h2 className="text-xl font-bold">🗓️ Study planner</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Create a simple daily target. The plan is stored locally and stays on this device.</p><form className="mt-4 grid gap-3 sm:max-w-md" onSubmit={createStudyPlan}><input className="field" value={planTitle} onChange={(event) => setPlanTitle(event.target.value)} aria-label="Plan title" /><label className="grid gap-1 text-sm">Minutes per day<input className="field" type="number" min={10} max={240} value={planMinutes} onChange={(event) => setPlanMinutes(Number(event.target.value))} /></label><button type="submit" className="btn btn-primary btn-sm">Save study plan</button></form>{planMessage && <p role="status" className="mt-3 text-sm text-emerald-300">{planMessage}</p>}</Panel>}

        {tab === "reminders" && <LocalReminderPanel />}

        {tab === "settings" && <section className="grid gap-4 lg:grid-cols-2">
          <Panel><h2 className="text-xl font-bold">⚙️ Learning preferences</h2>{settings && <form className="mt-4 grid gap-3" onSubmit={saveProfile}><label className="grid gap-1 text-sm">Display name<input className="field" value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} /></label><label className="grid gap-1 text-sm">Board<select className="field" value={settings.board} onChange={(event) => setSettings({ ...settings, board: event.target.value })}><option>Maharashtra State Board</option><option>CBSE</option><option>ICSE</option><option>IB / Cambridge</option></select></label><label className="grid gap-1 text-sm">Class<select className="field" value={settings.className} onChange={(event) => setSettings({ ...settings, className: event.target.value })}>{Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`).map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-1 text-sm">Learning level<select className="field" value={settings.level} onChange={(event) => setSettings({ ...settings, level: event.target.value as LearnerSettings["level"] })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label className="grid gap-1 text-sm">Daily goal (minutes)<input className="field" type="number" min={10} max={240} value={settings.dailyGoalMinutes} onChange={(event) => setSettings({ ...settings, dailyGoalMinutes: Number(event.target.value) })} /></label><button type="submit" className="btn btn-primary btn-sm">Save preferences</button></form>}</Panel>
          <div><DeviceBackupControls /><Panel className="mt-4"><h3 className="font-bold">Privacy & storage</h3><p className="mt-2 text-sm text-[var(--text-muted)]">Your profile, notes, quiz attempts, flashcard reviews, study plan and chat history are stored in IndexedDB in this browser. They are not uploaded or synced. Clearing browser data can erase them.</p></Panel></div>
        </section>}

        <footer className="mt-10 border-t border-[var(--panel-border)] pt-5 text-xs text-[var(--text-muted)]">HELIXEDU · Device-only learning · Bundled offline curriculum</footer>
      </div>
    </main>
  );
}
