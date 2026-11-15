import { NextRequest, NextResponse } from "next/server";

const LEGACY_TABS: Record<string, string> = {
  "/dashboard": "overview",
  "/learn": "learn",
  "/quizzes": "quiz",
  "/flashcards": "cards",
  "/assistant": "assistant",
  "/achievements": "overview",
  "/progress": "overview",
  "/notes": "notes",
  "/planner": "planner",
  "/reminders": "planner",
  "/bookmarks": "bookmarks",
  "/search": "learn",
  "/settings": "settings",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = Object.entries(LEGACY_TABS).find(([path]) => pathname === path || pathname.startsWith(path + "/"));
  if (match) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/demo";
    destination.search = "";
    destination.searchParams.set("tab", match[1]);
    return NextResponse.redirect(destination);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
