import type { DatePrecision, TimelineEvent } from "./types";

export const APPROXIMATE_DATE_PREFIX = "ca.";

type ReviewedEventDate = {
  eventId: string;
  timelineYear: number;
  descriptionPrefix: string;
  label: string;
};

// Display qualifications from the existing entry text, reviewed on 2026-11-15.
// The numeric date remains the sorting/filtering anchor. Require the reviewed
// precision, year and opening text so later editorial changes cannot silently
// retain an outdated qualification. Do not infer new labels from prose.
const REVIEWED_APPROXIMATE_DATES: readonly ReviewedEventDate[] = [
  {
    eventId: "2b7e5d25-f9d4-4e55-8bb4-6ab9bf83fa22",
    timelineYear: 2005,
    descriptionPrefix: "Around 2005,",
    label: "2005",
  },
  {
    eventId: "4ef65a2b-3d91-4c87-b026-7189e54ca631",
    timelineYear: 1965,
    descriptionPrefix: "Around 1965,",
    label: "1965",
  },
  {
    eventId: "64bc94a8-09c7-4551-9340-ce92eadbb26f",
    timelineYear: 1935,
    descriptionPrefix: "Around 1935,",
    label: "1935",
  },
  {
    eventId: "b70c5601-1045-4354-8d32-b64d2fb60cdc",
    timelineYear: 1800,
    descriptionPrefix: "Around 1800,",
    label: "1800",
  },
  {
    eventId: "0d6d02c8-e7df-444a-9e58-5811a08d2c3e",
    timelineYear: 1703,
    descriptionPrefix: "Around 1703,",
    label: "1703",
  },
  {
    eventId: "af0f72ef-5abc-4a27-80ea-26a9050158d3",
    timelineYear: 1450,
    descriptionPrefix: "Around 1450,",
    label: "1450",
  },
  {
    eventId: "4e43b51e-40f8-4464-9f28-ef856380d85c",
    timelineYear: 1300,
    descriptionPrefix: "Around 1300,",
    label: "1300",
  },
  {
    eventId: "c95ae2d3-9f58-46ce-8ce8-f99ab25d0a62",
    timelineYear: 1266,
    descriptionPrefix: "Around 1266,",
    label: "1266",
  },
  {
    eventId: "f39a12cb-5195-4e19-8bc3-acde6e5cb595",
    timelineYear: 900,
    descriptionPrefix: "Around 900 CE,",
    label: "900",
  },
  {
    eventId: "0d943876-63b0-431e-9423-f7be93bac315",
    timelineYear: 825,
    descriptionPrefix: "Around 825 CE,",
    label: "825",
  },
  {
    eventId: "4ebea445-15c4-4cb1-8df7-f58316cbac52",
    timelineYear: 800,
    descriptionPrefix: "Around 800 CE,",
    label: "800",
  },
  {
    eventId: "f8df3828-d10e-43d2-88bd-633f246d3027",
    timelineYear: 77,
    descriptionPrefix: "Around 77 CE,",
    label: "77",
  },
  {
    eventId: "2e2ea2c0-6cc8-4b49-85db-a29643e01fc7",
    timelineYear: -440,
    descriptionPrefix: "Around 440 BCE,",
    label: "440 BCE",
  },
  {
    eventId: "d88c67e8-ef4f-40e4-b108-78f5f7f43112",
    timelineYear: -500,
    descriptionPrefix: "Around 500 BCE,",
    label: "500 BCE",
  },
  {
    eventId: "a7d4a5ee-3fe2-4cb2-b983-8de737baef1c",
    timelineYear: -1750,
    descriptionPrefix: "Around 1750 BCE,",
    label: "1750 BCE",
  },
  {
    eventId: "26d3c1eb-65c7-4435-a093-62210d38b1dc",
    timelineYear: -2000,
    descriptionPrefix: "Around 2000 BCE,",
    label: "2000 BCE",
  },
  {
    eventId: "3f0ebacd-a676-4dc9-b446-b4df87ad7f21",
    timelineYear: -2600,
    descriptionPrefix: "Around 2600 BCE,",
    label: "2600 BCE",
  },
  {
    eventId: "2cbe5856-3fcb-46f8-90c0-8ce512e8c529",
    timelineYear: -3000,
    descriptionPrefix: "Around 3000 BCE,",
    label: "3000 BCE",
  },
  {
    eventId: "98b750d7-80a1-4758-a099-5287187d5c72",
    timelineYear: -3100,
    descriptionPrefix: "Around 3100 BCE,",
    label: "3100 BCE",
  },
  {
    eventId: "65c93b99-3ee9-4260-a48c-e7675b335658",
    timelineYear: -3400,
    descriptionPrefix: "Around 3400 BCE,",
    label: "3400 BCE",
  },
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

// These entries describe periods broader than their stored precision. Keep the
// reviewed range separate from the numeric year used to order and filter them.
const REVIEWED_PERIOD_DATES: readonly (ReviewedEventDate & {
  datePrecision: DatePrecision;
})[] = [
  {
    eventId: "51cfd1be-6bb3-4187-8004-6de627ded7fc",
    timelineYear: -8000,
    datePrecision: "century",
    descriptionPrefix: "Between approximately 8000 and 7000 BCE,",
    label: "ca. 8000–7000 BCE",
  },
  {
    eventId: "e466350c-db9b-4c1d-9e9e-8016c7377998",
    timelineYear: -3200,
    datePrecision: "century",
    descriptionPrefix: "Between approximately 3400 and 2900 BCE,",
    label: "ca. 3400–2900 BCE",
  },
  {
    eventId: "a4459550-4d30-4523-bc90-c4f67d9d1865",
    timelineYear: 750,
    datePrecision: "century",
    descriptionPrefix: "During the Late Classic period, approximately 600–900 CE,",
    label: "ca. 600–900 CE",
  },
  {
    eventId: "a4f60659-4ef1-47ee-b4db-96684c848acb",
    timelineYear: 1400,
    datePrecision: "year",
    descriptionPrefix: "During the fourteenth century,",
    label: "14th century",
  },
];

export function getReviewedEventDateLabel(
  event: Pick<TimelineEvent, "id" | "description" | "date_precision">,
  timelineYear: number | null
): string | undefined {
  const period = REVIEWED_PERIOD_DATES.find(
    (date) => date.eventId === event.id && date.timelineYear === timelineYear &&
      date.datePrecision === event.date_precision &&
      event.description?.trimStart().startsWith(date.descriptionPrefix)
  );
  if (period) return period.label;

  if (event.date_precision !== "year") return undefined;

  const reviewed = REVIEWED_APPROXIMATE_DATES.find(
    (date) => date.eventId === event.id && date.timelineYear === timelineYear &&
      event.description?.trimStart().startsWith(date.descriptionPrefix)
  );

  return reviewed ? `${APPROXIMATE_DATE_PREFIX} ${reviewed.label}` : undefined;
}
