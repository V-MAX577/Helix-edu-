import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Cosmic background                                                  */
/* ------------------------------------------------------------------ */

export function Cosmos() {
  return (
    <div aria-hidden className="cosmos-bg">
      <div className="cosmos-stars" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Logo — a serpent coiled around a vertical cosmic staff             */
/* ------------------------------------------------------------------ */

export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  const gid = `helix-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="HELIXEDU logo: a serpent coiled around a cosmic staff"
    >
      <defs>
        <linearGradient id={`${gid}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="45%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id={`${gid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${gid}-halo)`} />
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke={`url(#${gid}-grad)`}
        strokeWidth="1.1"
        opacity="0.55"
        strokeDasharray="4 6"
      />
      {/* cosmic staff */}
      <line
        x1="32"
        y1="12"
        x2="32"
        y2="52"
        stroke={`url(#${gid}-grad)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="11" r="3.4" fill={`url(#${gid}-grad)`} />
      <circle cx="32" cy="11" r="6" fill="none" stroke="#22d3ee" strokeWidth="0.9" opacity="0.6" />
      {/* the serpent, coiled twice around the staff */}
      <path
        d="M32 17 C 45 21 45 29 32 33 C 19 37 19 45 32 49"
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M32 17 C 19 21 19 29 32 33 C 45 37 45 45 32 49"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2.7"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="32" cy="15.6" r="2.4" fill="#6ee7b7" />
      <circle cx="31.2" cy="15.1" r="0.7" fill="#052e2b" />
      <path d="M32 52 l-3 4 M32 52 l3 4" stroke={`url(#${gid}-grad)`} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo size={compact ? 30 : 36} />
      <span className="flex flex-col leading-none">
        <span className="text-gradient text-[1.05rem] font-extrabold tracking-[0.16em]">
          HELIXEDU
        </span>
        {!compact && (
          <span className="mt-1 text-[0.58rem] font-medium tracking-[0.22em] text-[var(--text-muted)] uppercase">
            Unlock Your Mind
          </span>
        )}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                  */
/* ------------------------------------------------------------------ */

export function Panel({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "form";
}) {
  return <Tag className={`panel p-5 ${className}`}>{children}</Tag>;
}

export function SectionTitle({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          {icon && <span aria-hidden>{icon}</span>}
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Chip({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "emerald" | "cyan" | "gold";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "chip",
    accent: "chip chip-accent",
    emerald: "chip chip-emerald",
    cyan: "chip chip-cyan",
    gold: "chip chip-gold",
  };
  return <span className={`${tones[tone]} ${className}`}>{children}</span>;
}

export function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>{label}</span>
          <span className="font-semibold text-[var(--text)]">{pct}%</span>
        </div>
      )}
      <div
        className="bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="60%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-[var(--text)] opacity-10"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${size})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-extrabold">{label ?? `${Math.round(value)}%`}</div>
        {sublabel && <div className="text-[0.6rem] tracking-wide text-[var(--text-muted)] uppercase">{sublabel}</div>}
      </div>
    </div>
  );
}

export function StatCard({
  icon,
  value,
  label,
  tone = "violet",
}: {
  icon: string;
  value: string | number;
  label: string;
  tone?: "violet" | "emerald" | "cyan" | "gold";
}) {
  const glow = {
    violet: "glow-violet",
    emerald: "glow-emerald",
    cyan: "glow-cyan",
    gold: "",
  }[tone];
  return (
    <div className={`panel flex items-center gap-3.5 p-4 ${glow}`}>
      <div
        aria-hidden
        className="grid size-11 shrink-0 place-items-center rounded-xl text-xl"
        style={{
          background:
            tone === "emerald"
              ? "rgba(16,185,129,0.16)"
              : tone === "cyan"
                ? "rgba(34,211,238,0.16)"
                : tone === "gold"
                  ? "rgba(251,191,36,0.16)"
                  : "rgba(168,85,247,0.16)",
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl leading-tight font-extrabold tabular-nums">{value}</div>
        <div className="truncate text-xs text-[var(--text-muted)]">{label}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "🌌",
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel grid place-items-center gap-3 px-6 py-12 text-center">
      <div className="text-4xl" aria-hidden>
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="max-w-md text-sm text-[var(--text-muted)]">{message}</p>
      {action}
    </div>
  );
}

export function Callout({
  tone = "accent",
  title,
  children,
}: {
  tone?: "accent" | "emerald" | "warn" | "info";
  title?: string;
  children: ReactNode;
}) {
  const map = {
    accent: { border: "var(--accent)", bg: "color-mix(in srgb, var(--accent) 12%, transparent)", icon: "✨" },
    emerald: { border: "var(--accent-3)", bg: "rgba(16,185,129,0.12)", icon: "✅" },
    warn: { border: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "⚠️" },
    info: { border: "var(--accent-2)", bg: "rgba(34,211,238,0.12)", icon: "💡" },
  }[tone];
  return (
    <div
      className="rounded-2xl border-l-[3px] p-4 text-sm"
      style={{ borderColor: map.border, background: map.bg }}
    >
      {title && <div className="mb-1 font-bold">{map.icon} {title}</div>}
      <div className="text-[var(--text-muted)]">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lightweight markdown renderer                                      */
/* ------------------------------------------------------------------ */

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "quote"; text: string };

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let code: { lang: string; lines: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: "list", ordered: list.ordered, items: list.items });
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("```")) {
      if (code) {
        blocks.push({ type: "code", lang: code.lang, code: code.lines.join("\n") });
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = { lang: line.slice(3).trim() || "text", lines: [] };
      }
      continue;
    }
    if (code) {
      code.lines.push(raw);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }
    const quote = line.match(/^>\s+(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: quote[1] });
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      flushParagraph();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1]);
      continue;
    }
    if (list) flushList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  if (code) blocks.push({ type: "code", lang: code.lang, code: code.lines.join("\n") });
  return blocks;
}

export function InlineMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-bold text-[var(--text)]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key++} className="font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <>{nodes}</>;
}

export function Markdown({ content, className = "" }: { content: string; className?: string }) {
  const blocks = parseMarkdown(content);
  return (
    <div className={`prose-cosmos ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const size =
              block.level <= 1
                ? "text-2xl"
                : block.level === 2
                  ? "text-xl"
                  : block.level === 3
                    ? "text-lg"
                    : "text-base";
            const Tag = (block.level <= 2 ? "h2" : "h3") as "h2" | "h3";
            return (
              <Tag key={i} className={`${size} font-bold tracking-tight`}>
                <InlineMarkdown text={block.text} />
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={i}>
                <InlineMarkdown text={block.text} />
              </p>
            );
          case "list":
            return block.ordered ? (
              <ol key={i} className="list-decimal space-y-1 pl-6">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineMarkdown text={item} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="list-disc space-y-1 pl-6">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineMarkdown text={item} />
                  </li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre key={i} className="prose-cosmos-pre">
                <code>{block.code}</code>
              </pre>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <InlineMarkdown text={block.text} />
              </blockquote>
            );
        }
      })}
    </div>
  );
}
