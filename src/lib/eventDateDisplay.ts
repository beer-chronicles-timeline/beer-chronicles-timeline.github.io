import type { TimelineEvent } from "./types";

export const APPROXIMATE_DATE_PREFIX = "ca.";

type ReviewedApproximateDate = {
  eventId: string;
  timelineYear: number;
  descriptionPrefix: string;
  label: string;
};

// Display qualifications from the existing entry text, reviewed on 2026-11-15.
// The numeric date remains the sorting/filtering anchor. Require the reviewed
// precision, year and opening text so later editorial changes cannot silently
// retain an outdated qualification. Do not infer new labels from prose.
const REVIEWED_APPROXIMATE_DATES: readonly ReviewedApproximateDate[] = [
  {
    eventId: "9d9bd659-d8bd-4990-950c-c4d83352e542",
    timelineYear: 1158,
    descriptionPrefix: "Between about 1151 and 1158,",
    label: "1151–1158",
  },
  {
    eventId: "7b9ed8c2-2db7-4ad8-a067-9cc37d748e4b",
    timelineYear: -1800,
    descriptionPrefix: "Around 1800 BCE,",
    label: "1800 BCE",
  },
];

export function getReviewedEventDateLabel(
  event: Pick<TimelineEvent, "id" | "description" | "date_precision">,
  timelineYear: number | null
): string | undefined {
  if (event.date_precision !== "year") return undefined;

  const reviewed = REVIEWED_APPROXIMATE_DATES.find(
    (date) => date.eventId === event.id && date.timelineYear === timelineYear &&
      event.description?.trimStart().startsWith(date.descriptionPrefix)
  );

  return reviewed ? `${APPROXIMATE_DATE_PREFIX} ${reviewed.label}` : undefined;
}
