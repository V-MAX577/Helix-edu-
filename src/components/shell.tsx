"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "./ui";

const NAV: { section: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    section: "Learn",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "🛰️" },
      { href: "/learn", label: "Learning Centre", icon: "📚" },
      { href: "/quizzes", label: "Quizzes & Tests", icon: "📝" },
      { href: "/flashcards", label: "Flashcards", icon: "🃏" },
    ],
  },
  {
    section: "AI",
    items: [
      { href: "/assistant", label: "AI Study Assistant", icon: "🧠" },
      { href: "/achievements", label: "Achievements", icon: "🏆" },
    ],
  },
  {
    section: "Plan",
    items: [
      { href: "/planner", label: "Study Planner", icon: "🗓️" },
      { href: "/progress", label: "Progress Tracker", icon: "📈" },
      { href: "/reminders", label: "Study Reminders", icon: "⏰" },
    ],
  },
  {
    section: "Library",
    items: [
      { href: "/notes", label: "Notes", icon: "📒" },
      { href: "/bookmarks", label: "Bookmarks", icon: "🔖" },
      { href: "/search", label: "Search Lessons", icon: "🔍" },
    ],
  },
];

const ALL_LINKS = NAV.flatMap((n) => n.items);

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ streak, name }: { streak: number; name: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-1 border-r border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel)_55%,transparent)] px-3 py-5 backdrop-blur-xl lg:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2.5 px-2">
        <Logo size={34} />
        <span className="text-gradient text-[1.05rem] font-extrabold tracking-[0.16em]">HELIXEDU</span>
      </Link>

      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--panel-solid)_45%,transparent)] px-3 py-2.5">
        <span className="text-xl" aria-hidden>
          🔥
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold tabular-nums">{streak}-day streak</div>
          <div className="truncate text-[0.68rem] text-[var(--text-muted)]">{name}</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="px-2 pb-1.5 text-[0.62rem] font-bold tracking-[0.2em] text-[var(--text-muted)] uppercase">
              {group.section}
            </div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                data-active={isActive(pathname, item.href)}
              >
                <span aria-hidden className="text-base">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <Link href="/settings" className="nav-link mt-2" data-active={isActive(pathname, "/settings")}>
        <span aria-hidden>⚙️</span>
        Settings
      </Link>
    </aside>
  );
}

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Home", icon: "🛰️" },
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/assistant", label: "AI Tutor", icon: "🧠" },
  { href: "/quizzes", label: "Quizzes", icon: "📝" },
  { href: "/settings", label: "More", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {BOTTOM_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.62rem] font-medium text-[var(--text-muted)]"
          data-active={isActive(pathname, item.href)}
          style={
            isActive(pathname, item.href)
              ? { color: "var(--accent)", textShadow: "0 0 12px color-mix(in srgb, var(--accent) 60%, transparent)" }
              : undefined
          }
        >
          <span className="text-lg" aria-hidden>
            {item.icon}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function TopBar({
  streak,
  todayMinutes,
  goalMinutes,
  providerLabel,
  providerConnected,
}: {
  streak: number;
  todayMinutes: number;
  goalMinutes: number;
  providerLabel: string;
  providerConnected: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = ALL_LINKS.find((l) => isActive(pathname, l.href));

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--panel-border)] bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] px-4 py-2.5 backdrop-blur-xl lg:px-6">
      <Link href="/dashboard" className="lg:hidden">
        <Logo size={30} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold lg:text-base">{current?.label ?? "HELIXEDU"}</div>
        <div className="hidden text-[0.68rem] text-[var(--text-muted)] sm:block">
          🔥 {streak}-day streak · {todayMinutes}/{goalMinutes} min today
        </div>
      </div>

      <span
        className="chip hidden sm:inline-flex"
        style={
          providerConnected
            ? { borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" }
            : undefined
        }
        title={
          providerConnected
            ? `Connected to ${providerLabel}. Requests may leave this server.`
            : "Offline Helix Engine — everything runs on this server, no paid API."
        }
      >
        <span className="size-1.5 rounded-full" style={{ background: providerConnected ? "#10b981" : "var(--accent-2)" }} />
        {providerConnected ? providerLabel : "Offline engine"}
      </span>

      <Link href="/search" className="btn btn-ghost btn-icon" aria-label="Search lessons">
        <span aria-hidden>🔍</span>
      </Link>

      <div className="relative">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
          aria-label="Quick menu"
        >
          <span aria-hidden>☰</span>
        </button>
        {open && (
          <div
            role="menu"
            className="panel absolute right-0 z-50 mt-2 grid w-56 gap-0.5 p-2"
          >
            {ALL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-[var(--panel-border)]" />
            <Link href="/settings" role="menuitem" className="nav-link" onClick={() => setOpen(false)}>
              <span aria-hidden>⚙️</span>
              Settings
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export function AppShell({
  children,
  streak,
  name,
  todayMinutes,
  goalMinutes,
  providerLabel,
  providerConnected,
}: {
  children: ReactNode;
  streak: number;
  name: string;
  todayMinutes: number;
  goalMinutes: number;
  providerLabel: string;
  providerConnected: boolean;
}) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar streak={streak} name={name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          streak={streak}
          todayMinutes={todayMinutes}
          goalMinutes={goalMinutes}
          providerLabel={providerLabel}
          providerConnected={providerConnected}
        />
        <main className="flex-1 px-4 pt-5 pb-24 lg:px-8 lg:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
