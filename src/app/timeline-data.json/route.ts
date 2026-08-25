import { getHomeTimelineData } from "@/lib/homeTimelineData";

export const dynamic = "force-static";

export async function GET() {
  const timelineData = await getHomeTimelineData();

  return Response.json(timelineData);
}
