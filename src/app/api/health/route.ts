export const dynamic = "force-dynamic";

/** A health check that does not require a database or external service. */
export async function GET() {
  return Response.json({ ok: true, storage: "device-only" });
}
