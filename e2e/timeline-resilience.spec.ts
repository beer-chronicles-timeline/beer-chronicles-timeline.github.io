import { expect, test, type Page, type Route } from "@playwright/test";

const timelineData = {
  events: [
    {
      id: "resilience-event",
      title: "Resilient timeline event",
      description: "Timeline data loaded after the preview.",
      event_date: "2026-01-01",
      historical_year: null,
      image_url: null,
      created_at: null,
      category: "Events",
      date_precision: "date",
      sources: null,
      tags: [],
    },
  ],
  tags: [],
  visibleTags: [],
  minYear: 2026,
  maxYear: 2026,
};

function fulfillTimelineRequest(route: Route) {
  return route.fulfill({
    contentType: "application/json",
    body: JSON.stringify(timelineData),
  });
}

async function expectPreviewToRemainVisible(page: Page) {
  const preview = page.getByRole("region", {
    name: "Explore beer history",
  });

  await expect(preview).toBeVisible();
  await expect(preview.locator("article")).toHaveCount(6);
}

test("homepage preview remains visible until timeline data succeeds", async ({
  page,
}) => {
  let releaseRequest: (() => void) | undefined;
  const requestCanFinish = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });

  await page.route("**/timeline-data.json*", async (route) => {
    await requestCanFinish;
    await fulfillTimelineRequest(route);
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expectPreviewToRemainVisible(page);
  await expect(page.getByText("Loading the interactive timeline.")).toHaveCount(
    1
  );
  await expect(
    page.getByRole("region", { name: "Timeline exploration controls" })
  ).toHaveCount(0);

  releaseRequest?.();

  await expect(
    page.getByRole("region", { name: "Timeline exploration controls" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Open event: Resilient timeline event",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Explore beer history" })
  ).toHaveCount(0);
});

test("timeline failure keeps the preview and offers a working retry", async ({
  page,
}) => {
  let requestCount = 0;

  await page.route("**/timeline-data.json*", async (route) => {
    requestCount += 1;

    if (requestCount === 1) {
      await route.fulfill({ status: 503, body: "Unavailable" });
      return;
    }

    await fulfillTimelineRequest(route);
  });

  await page.goto("/");

  const failureMessage = page.getByRole("heading", {
    name: "Interactive timeline unavailable",
  });
  await expect(failureMessage).toBeVisible();
  await expectPreviewToRemainVisible(page);

  await page.getByRole("button", { name: "Try again" }).click();

  await expect(failureMessage).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Open event: Resilient timeline event",
    })
  ).toBeVisible();
  expect(requestCount).toBe(2);
});
