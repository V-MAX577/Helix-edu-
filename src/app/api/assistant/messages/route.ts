import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Chat history is intentionally never stored by the server.
 * The browser loads its own IndexedDB records directly.
 */
export async function GET() {
  return NextResponse.json({ messages: [], storage: "device-only" });
}
