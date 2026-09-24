import { getPublicationSnapshot } from "@/lib/publicationSnapshot";

export const dynamic = "force-static";

export function GET() {
  const snapshot = getPublicationSnapshot();
  return Response.json({ mode: snapshot.mode, eventCount: snapshot.events.length, generatedAt: snapshot.generatedAt });
}
