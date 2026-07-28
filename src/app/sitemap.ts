// app/sitemap.ts

import type { MetadataRoute } from "next";
import { getEventStaticParamSources } from "@/lib/eventPageData";
import { getEventUrl } from "@/lib/eventUrls";

export const dynamic = "force-static";

const BASE_URL = "https://beer-chronicles.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const events = await getEventStaticParamSources();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/storylines`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tastings`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/editorial-principles`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/sources`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/challenges`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/imprint`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: getEventUrl(event.id, event.title),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...eventPages];
}