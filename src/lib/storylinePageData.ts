import { cache } from "react";
import { getEventsForStoryline } from "@/lib/eventStorylines";
import { getHomeTimelineData } from "@/lib/homeTimelineData";
import {
  getStorylineBySlug,
  type Storyline,
} from "@/lib/storylines";
import type { TimelineEvent } from "@/lib/types";

export type StorylinePageData = {
  storyline: Storyline;
  events: TimelineEvent[];
};

const loadStorylineDataset = cache(getHomeTimelineData);

export async function getStorylinePageData(
  slug: string
): Promise<StorylinePageData | null> {
  const storyline = getStorylineBySlug(slug);

  if (!storyline) {
    return null;
  }

  const { events } = await loadStorylineDataset();

  return {
    storyline,
    events: getEventsForStoryline(events, storyline),
  };
}
