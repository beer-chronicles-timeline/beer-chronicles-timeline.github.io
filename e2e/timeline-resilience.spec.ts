import { expect, test } from "./fixtures";

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
  await expect(controls.getByText(/Found so far \d+ of \d+ events/)).toBeVisible();
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
    await expect(page.getByText("No matches in the loaded entries.")).toBeVisible();
    await expect(page.getByText("No events match your filters.", { exact: true })).toHaveCount(0);
    if (initiallyFails) {
      await expect(page.getByRole("status").filter({ hasText: "The full timeline could not load" })).toBeVisible();
      await page.getByRole("button", { name: "Retry loading timeline" }).click();
    }
    await expect(page.getByRole("status").filter({ hasText: "Loading the full timeline" })).toBeVisible();
    releaseRequest();
    await expect(page.getByRole("link", { name: `Open event: ${title}`, exact: true })).toBeVisible();
    await expect(page.getByText("Loading the full timeline. Results may be incomplete.", { exact: true })).toHaveCount(0);
    // The same completed request must now produce an honest definitive empty state.
    await page.getByRole("textbox", { name: "Search timeline" }).fill("BC_ABSENT_TEST_TOKEN");
    await expect(page.getByText("No events match your filters.", { exact: true }).last()).toBeVisible();
    expect(requests).toBe(initiallyFails ? 2 : 1);
  });
}

for (const query of ["to=1700", "category=Science", "tags=Broyhan", "storyline=early-beer-history"]) {
  test(`${query} results stay provisional until the full timeline loads`, async ({ page }) => {
    let release = () => {};
    const ready = new Promise<void>((resolve) => { release = resolve; });
    await page.route("**/timeline-data.json*", async (route) => {
      await ready;
      await route.continue();
    });
    try {
      await page.goto(`/?${query}`);
      const controls = page.getByRole("region", { name: "Timeline exploration controls" });
      await expect(controls.getByText(/Found so far \d+ of \d+ events/)).toBeVisible();
      await expect(page.getByRole("status").filter({ hasText: "Loading the full timeline" })).toBeVisible();
      await expect(page.getByText("No events match your filters.", { exact: true })).toHaveCount(0);
      if (query === "to=1700") {
        await expect(page.getByText("No matches in the loaded entries.")).toBeVisible();
      }
      release();
      await expect(controls.getByText(/Showing \d+ of \d+ events/)).toBeVisible();
      await expect(page.getByText("Loading the full timeline. Results may be incomplete.", { exact: true })).toHaveCount(0);
      if (query === "to=1700") {
        await expect(page.getByRole("link", { name: /^Open event:/ }).first()).toBeVisible();
      }
    } finally { release(); }
  });
}

test("@journey incomplete date results recover after a failed timeline request", async ({ page }) => {
  let requests = 0;
  await page.route("**/timeline-data.json*", async (route) => {
    if (++requests === 1) await route.fulfill({ status: 503, body: "Unavailable" });
    else await route.continue();
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/?to=1700");
  await expect(page.getByRole("status").filter({ hasText: "The full timeline could not load" })).toBeVisible();
  await expect(page.getByText("No matches in the loaded entries.")).toBeVisible();
  await expect(page.getByText("No events match your filters.", { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Retry loading timeline" }).click();
  await expect(page.getByRole("link", { name: /^Open event:/ }).first()).toBeVisible();
  expect(requests).toBe(2);
});

test("tag counts appear only after the full collection loads", async ({ page }) => {
  let release = () => {};
  const ready = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/timeline-data.json*", async (route) => {
    await ready;
    await route.continue();
  });
  try {
    await page.goto("/");
    await page.getByRole("button", { name: /^Tags/ }).click();
    await page.getByRole("checkbox", { name: "Broyhan", exact: true }).check();
    release();
    await expect(page.getByRole("checkbox", { name: /^Broyhan \d+$/ })).toBeChecked();
  } finally { release(); }
});

test("@journey a clicked preview keeps its identity when loading changes the order", async ({ page }) => {
  let release = () => {};
  const ready = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/timeline-data.json*", async (route) => {
    await ready;
    await route.continue();
  });
  try {
    await page.goto("/?order=oldest");
    await expect(page.locator("[data-timeline-ready=true]")).toBeVisible();
    const link = page.getByRole("link", { name: /^Open event:/ }).first();
    const href = await link.getAttribute("href");
    const title = (await link.getAttribute("aria-label"))!.replace(/^Open event: /, "");
    await link.click();
    release();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("#timeline-modal-title")).toHaveText(title);
    await expect(dialog.getByRole("link", { name: "Open full entry", exact: true })).toHaveAttribute("href", href!);
    await expect(page.locator('ol[aria-label="Beer history timeline"] a').first()).not.toHaveAttribute("href", href!);
    await page.keyboard.press("ArrowRight");
    await expect(dialog.locator("#timeline-modal-title")).not.toHaveText(title);
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.locator("#timeline-modal-title")).toHaveText(title);
  } finally { release(); }
});

test("@journey browser history can remove the selected entry from the results safely", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?string=BC_SELECTION_ABSENT_TOKEN");
  await expect(page.getByText("No events match your filters.", { exact: true }).last()).toBeVisible();
  await page.evaluate(() => {
    window.history.pushState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await page.getByRole("link", { name: /^Open event:/ }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const title = await dialog.locator("#timeline-modal-title").textContent();
  await page.goBack();
  await expect(page).toHaveURL(/string=BC_SELECTION_ABSENT_TOKEN/);
  await expect(dialog.locator("#timeline-modal-title")).toHaveText(title!);
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("#timeline-modal-title")).toHaveText(title!);
  expect(errors).toEqual([]);
});
