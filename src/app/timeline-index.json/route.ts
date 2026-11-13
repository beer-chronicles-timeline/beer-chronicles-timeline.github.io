import { getHomeTimelineData } from "@/lib/homeTimelineData";
import { getEventSourceRevisions } from "@/lib/eventSources";
import { encodeTimelineData } from "@/lib/timelineTransport";

export const dynamic = "force-static";

export async function GET() {
  const data = await getHomeTimelineData();
  return Response.json(encodeTimelineData(data, getEventSourceRevisions(data.events)));
}
