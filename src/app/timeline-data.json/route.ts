import { getHomeTimelineData } from "@/lib/homeTimelineData";
import { encodeTimelineData } from "@/lib/timelineTransport";

export const dynamic = "force-static";

export async function GET() {
  const timelineData = await getHomeTimelineData();

  return Response.json(encodeTimelineData(timelineData));
}
