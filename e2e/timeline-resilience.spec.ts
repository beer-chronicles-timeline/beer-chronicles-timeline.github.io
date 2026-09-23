import { expect, test } from "@playwright/test";

test("server HTML exposes the real timeline before JavaScript runs", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/");
  const noJavaScriptNotice = page.getByRole("region", {
    name: "Explore the timeline without JavaScript",
  });
  await expect(noJavaScriptNotice).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Timeline exploration controls" })
  ).toBeHidden();
  await expect(
    page.getByRole("list", { name: "Beer history timeline" }).getByRole("listitem")
  ).toHaveCount(60);
  await expect(noJavaScriptNotice.getByText(/events in total/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Show more events/ })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open random event" })).toBeHidden();
  await expect(page.getByRole("link", { name: "Beer Storylines" })).toHaveAttribute(
    "href",
    "/storylines"
  );

  const firstEventLink = page.getByRole("link", { name: /Open event:/ }).first();
  await expect(firstEventLink).toHaveAttribute("href", /^\/events\//);
  await context.close();
});

test("timeline remains interactive while complete details preload", async ({ page }) => {
  let releaseRequest: (() => void) | undefined;
  const requestCanFinish = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });

  await page.route("**/timeline-data.json*", async (route) => {
    await requestCanFinish;
    await route.continue();
  });
  await page.goto("/");

  const controls = page.getByRole("region", {
    name: "Timeline exploration controls",
  });
  await expect(controls).toHaveAttribute("data-timeline-ready", "true");
  await controls.getByRole("button", { name: "Laws" }).click();
  await expect(controls.getByText(/Showing \d+ of \d+ events/)).toBeVisible();
  releaseRequest?.();
});

test("a failed optional detail request follows the permanent event link", async ({ page }) => {
  await page.route("**/timeline-data.json*", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" })
  );
  await page.goto("/");

  const firstEventLink = page.getByRole("link", { name: /Open event:/ }).first();
  const href = await firstEventLink.getAttribute("href");
  expect(href).toMatch(/^\/events\//);
  await firstEventLink.click();
  await expect(page).toHaveURL(new RegExp(`${href}/?$`));
});

for (const initiallyFails of [false, true]) {
  test(`full-text search reports ${initiallyFails ? "failure and recovers on retry" : "loading before body-only matches arrive"}`, async ({ page, request }) => {
    const response = await request.get("/timeline-data.json");
    const data = await response.json();
    const marker = "BC_BODY_ONLY_TEST_TOKEN";
    const title = data.events[0].title;
    data.events[0].description = "Fixture summary. ".repeat(20) + marker;
    let releaseRequest: () => void = () => {};
    const ready = new Promise<void>((resolve) => { releaseRequest = resolve; });
    let requests = 0;
    await page.route("**/timeline-data.json*", async (route) => {
      requests++;
      if (initiallyFails && requests === 1) {
        await route.fulfill({ status: 503, body: "Unavailable" });
        return;
      }
      await ready;
      await route.fulfill({ json: data });
    });
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Timeline exploration controls" }))
      .toHaveAttribute("data-timeline-ready", "true");
    await page.getByRole("textbox", { name: "Search timeline" }).fill(marker);
    await expect(page.getByText("No matches in the loaded summaries.")).toBeVisible();
    await expect(page.getByText("No events match your filters.", { exact: true })).toHaveCount(0);
    if (initiallyFails) {
      await expect(page.getByRole("status").filter({ hasText: "Full-text search is unavailable" })).toBeVisible();
      await page.getByRole("button", { name: "Retry full-text search" }).click();
    }
    await expect(page.getByRole("status").filter({ hasText: "Loading full-text search" })).toBeVisible();
    releaseRequest();
    await expect(page.getByRole("link", { name: `Open event: ${title}`, exact: true })).toBeVisible();
    await expect(page.getByText("Loading full-text search. Results may be incomplete.", { exact: true })).toHaveCount(0);
    // The same completed request must now produce an honest definitive empty state.
    await page.getByRole("textbox", { name: "Search timeline" }).fill("BC_ABSENT_TEST_TOKEN");
    await expect(page.getByText("No events match your filters.", { exact: true }).last()).toBeVisible();
    expect(requests).toBe(initiallyFails ? 2 : 1);
  });
}
