import assert from "node:assert/strict";
import test from "node:test";
import { formatEventDate, getEventChronologicalSortValue, getEventTimelineYear } from "../src/components/timelineUtils.ts";
import type { TimelineEvent } from "../src/lib/types.ts";

// The twenty additional labels reviewed against the published text on 2026-11-15.
const reviewedCases = [
  ["2b7e5d25-f9d4-4e55-8bb4-6ab9bf83fa22", "2005-01-01", "Around 2005,", "ca. 2005"],
  ["4ef65a2b-3d91-4c87-b026-7189e54ca631", "1965-01-01", "Around 1965,", "ca. 1965"],
  ["64bc94a8-09c7-4551-9340-ce92eadbb26f", "1935-01-01", "Around 1935,", "ca. 1935"],
  ["b70c5601-1045-4354-8d32-b64d2fb60cdc", "1800-01-01", "Around 1800,", "ca. 1800"],
  ["0d6d02c8-e7df-444a-9e58-5811a08d2c3e", "1703-01-01", "Around 1703,", "ca. 1703"],
  ["af0f72ef-5abc-4a27-80ea-26a9050158d3", "1450-01-01", "Around 1450,", "ca. 1450"],
  ["4e43b51e-40f8-4464-9f28-ef856380d85c", "1300-01-01", "Around 1300,", "ca. 1300"],
  ["c95ae2d3-9f58-46ce-8ce8-f99ab25d0a62", "1266-01-01", "Around 1266,", "ca. 1266"],
  ["f39a12cb-5195-4e19-8bc3-acde6e5cb595", "0900-01-01", "Around 900 CE,", "ca. 900"],
  ["0d943876-63b0-431e-9423-f7be93bac315", "0825-01-01", "Around 825 CE,", "ca. 825"],
  ["4ebea445-15c4-4cb1-8df7-f58316cbac52", "0800-01-01", "Around 800 CE,", "ca. 800"],
  ["f8df3828-d10e-43d2-88bd-633f246d3027", "0077-01-01", "Around 77 CE,", "ca. 77"],
  ["2e2ea2c0-6cc8-4b49-85db-a29643e01fc7", "0439-01-01 BC", "Around 440 BCE,", "ca. 440 BCE"],
  ["d88c67e8-ef4f-40e4-b108-78f5f7f43112", "0499-01-01 BC", "Around 500 BCE,", "ca. 500 BCE"],
  ["a7d4a5ee-3fe2-4cb2-b983-8de737baef1c", "1749-01-01 BC", "Around 1750 BCE,", "ca. 1750 BCE"],
  ["26d3c1eb-65c7-4435-a093-62210d38b1dc", "1999-01-01 BC", "Around 2000 BCE,", "ca. 2000 BCE"],
  ["3f0ebacd-a676-4dc9-b446-b4df87ad7f21", "2599-01-01 BC", "Around 2600 BCE,", "ca. 2600 BCE"],
  ["2cbe5856-3fcb-46f8-90c0-8ce512e8c529", "2999-01-01 BC", "Around 3000 BCE,", "ca. 3000 BCE"],
  ["98b750d7-80a1-4758-a099-5287187d5c72", "3099-01-01 BC", "Around 3100 BCE,", "ca. 3100 BCE"],
  ["65c93b99-3ee9-4260-a48c-e7675b335658", "3399-01-01 BC", "Around 3400 BCE,", "ca. 3400 BCE"],
] as const;

test("all twenty reviewed year labels retain their uncertainty and chronology", () => {
  for (const [id, event_date, description, expected] of reviewedCases) {
    const event: TimelineEvent = {
      id, title: id, event_date, description, date_precision: "year",
      historical_year: null, image_url: null, created_at: null, sources: null,
    };
    const unqualified = { ...event, id: "unreviewed-comparison" };
    assert.equal(formatEventDate(event), expected, id);
    assert.equal(getEventTimelineYear(event), getEventTimelineYear(unqualified), id);
    assert.equal(getEventChronologicalSortValue(event), getEventChronologicalSortValue(unqualified), id);
    assert.equal(formatEventDate({ ...event, description: "Revised wording." }), formatEventDate(unqualified), id);
  }
});
