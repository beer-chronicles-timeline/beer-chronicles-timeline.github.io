// app/sitemap.ts

import type { MetadataRoute } from "next";
import { getEventStaticParamSources } from "@/lib/eventPageData";
import { getEventUrl } from "@/lib/eventUrls";
import { getStorylineSitemapUrls } from "@/lib/storylines";

export const dynamic = "force-static";

const BASE_URL = "https://beer-chronicles.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEventStaticParamSources();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
    },
    {
      url: `${BASE_URL}/storylines`,
    },
    {
      url: `${BASE_URL}/about`,
    },
    {
      url: `${BASE_URL}/tastings`,
    },
    {
      url: `${BASE_URL}/editorial-principles`,
    },
    {
      url: `${BASE_URL}/sources`,
    },
    {
      url: `${BASE_URL}/challenges`,
    },
    {
      url: `${BASE_URL}/submit`,
    },
    {
      url: `${BASE_URL}/imprint`,
    },
  ];

  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: getEventUrl(event.id, event.title),
  }));

  const storylinePages: MetadataRoute.Sitemap =
    getStorylineSitemapUrls().map((url) => ({ url }));

  return [...staticPages, ...storylinePages, ...eventPages];
}
