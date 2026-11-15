import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Cosmos } from "@/components/ui";

export const metadata: Metadata = {
  title: {
    default: "HELIXEDU — Unlock Your Mind. Explore Infinity.",
    template: "%s · HELIXEDU",
  },
  description:
    "HELIXEDU is a free, AI-powered learning platform for students: lessons, flashcards, quizzes, a step-by-step maths solver and a study planner. Works on any phone, with or without internet.",
  applicationName: "HELIXEDU",
  manifest: "/manifest.webmanifest",
  keywords: [
    "HELIXEDU",
    "online learning",
    "AI study assistant",
    "Maharashtra State Board",
    "free education platform",
    "quizzes",
    "flashcards",
    "maths solver",
  ],
  authors: [{ name: "HELIXEDU" }],
  openGraph: {
    title: "HELIXEDU — Unlock Your Mind. Explore Infinity.",
    description:
      "A futuristic, AI-powered learning platform. Lessons, quizzes, flashcards and a real offline study engine. Free forever.",
    type: "website",
    siteName: "HELIXEDU",
  },
};

export const viewport: Viewport = {
  themeColor: "#05030f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Applies the saved theme and text size before first paint so there is no
 * flash of the wrong theme. Kept tiny and inline to avoid a network request.
 */
const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem("helixedu_theme") || "cosmos";
    var scale = localStorage.getItem("helixedu_font") || "100";
    var motion = localStorage.getItem("helixedu_motion") === "reduced";
    var root = document.documentElement;
    root.setAttribute("data-theme", theme === "light" ? "light" : "cosmos");
    root.style.setProperty("--font-scale", String(parseInt(scale, 10) / 100 || 1));
    if (motion) root.setAttribute("data-reduce-motion", "true");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="cosmos" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Cosmos />
        {children}
      </body>
    </html>
  );
}
