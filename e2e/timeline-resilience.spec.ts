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
