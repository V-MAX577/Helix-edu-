"use client";

import { useEffect } from "react";
import { Panel } from "@/components/ui";

/**
 * Safety net for the authenticated app. If anything throws during a render or
 * a server action (for example after the app is redeployed while a tab is
 * still open), show a clear recovery path instead of a blank screen.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("HELIXEDU app error", error);
  }, [error]);

  const isStaleAction = /server action|failed to find server action/i.test(error.message ?? "");

  return (
    <div className="mx-auto grid max-w-lg gap-4 py-16">
      <Panel className="grid gap-4 text-center">
        <div className="text-5xl" aria-hidden>
          🛰️
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {isStaleAction ? "This tab is out of date" : "Something went wrong"}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {isStaleAction
            ? "HELIXEDU was updated while this tab was open. Reloading the page will load the newest version — your progress is saved automatically."
            : "An unexpected error occurred. Your progress is safe. Try again, or reload the page."}
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-[var(--text-muted)]">Reference: {error.digest}</p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => window.location.reload()} className="btn btn-primary">
            Reload page
          </button>
          <button type="button" onClick={reset} className="btn btn-ghost">
            Try again
          </button>
        </div>
      </Panel>
    </div>
  );
}
