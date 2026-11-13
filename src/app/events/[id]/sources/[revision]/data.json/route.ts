import { getPublicationSnapshot } from "@/lib/publicationSnapshot";
import { encodeEventSources } from "@/lib/eventSources";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getPublicationSnapshot().events.map((event) => ({
    id: event.id,
    revision: encodeEventSources(event).revision,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; revision: string }> }
) {
  const { id, revision } = await params;
  const event = getPublicationSnapshot().events.find((event) => event.id === id);
  const data = event ? encodeEventSources(event) : null;
  if (!data || data.revision !== revision) {
    return Response.json({ error: "Sources not found" }, { status: 404 });
  }
  return Response.json(data);
}
