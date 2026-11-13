import { test, expect } from "./fixtures";
import { decodeTimelineData } from "../src/lib/timelineTransport";
import { getEventSourcesPath } from "../src/lib/sourceTransport";
import { getEventPath } from "../src/lib/eventUrls";

test("the browser preloads the searchable index before scripts and does not request citations @journey", async ({ page }) => {
  let release = () => {};
  const scriptsReady = new Promise<void>((resolve) => { release = resolve; });
  let indexRequests = 0;
  const citations: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path === "/timeline-index.json") indexRequests++;
    if (/\/sources\/[a-f0-9]+\/data\.json$/.test(path)) citations.push(path);
  });
  await page.route("**/*.js*", async (route) => {
    if (route.request().resourceType() === "script") await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect.poll(() => indexRequests).toBe(1);
    await expect(page.locator('[data-timeline-ready="true"]')).toHaveCount(0);
    release();
    await expect(page.locator('[data-timeline-ready="true"]')).toBeVisible();
    await expect(page.getByRole("region", { name: "Timeline exploration controls" }).getByText(/\d+ events in total/)).toBeVisible();
    expect(indexRequests).toBe(1);
    expect(citations).toEqual([]);
  } finally { release(); }
});

test("modal citations load only on opening, show loading state, and stay cached @journey", async ({ page, request }) => {
  const data = decodeTimelineData(await (await request.get("/timeline-index.json")).json());
  let release = () => {};
  const ready = new Promise<void>((resolve) => { release = resolve; });
  let requests = 0;
  await page.route("**/sources/*/data.json", async (route) => {
    requests++;
    await ready;
    await route.continue();
  });
  try {
    await page.goto("/");
    const entry = page.getByRole("link", { name: /^Open event:/ }).first();
    const href = await entry.getAttribute("href");
    await entry.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("status")).toHaveText("Loading sources…");
    const event = data.events.find((event) => href === getEventPath(event.id, event.title))!;
    release();
    await expect(dialog.getByRole("status")).toHaveCount(0);
    await expect(dialog.getByRole("heading", { name: "Sources", exact: true })).toBeVisible();
    await expect(dialog.locator(`section[aria-labelledby="event-sources-${event.id}"] a`).first()).toHaveAttribute("href", /^https?:/);
    await page.keyboard.press("Escape");
    await entry.click();
    await expect(dialog.getByRole("heading", { name: "Sources", exact: true })).toBeVisible();
    await expect(dialog.getByRole("status")).toHaveCount(0);
    expect(requests).toBe(1);
  } finally { release(); }
});

test("citation failure retains the entry and permanent link and recovers on retry @journey", async ({ page }) => {
  let requests = 0;
  await page.route("**/sources/*/data.json", async (route) => {
    if (++requests === 1) await route.fulfill({ status: 503, body: "Unavailable" });
    else await route.continue();
  });
  await page.goto("/");
  const entry = page.getByRole("link", { name: /^Open event:/ }).first();
  const href = await entry.getAttribute("href");
  await entry.click();
  const dialog = page.getByRole("dialog");
  const title = await dialog.locator("#timeline-modal-title").textContent();
  await expect(dialog.getByRole("alert")).toContainText("We couldn't load these sources.");
  await expect(dialog.getByRole("link", { name: "Open full entry", exact: true })).toHaveAttribute("href", href!);
  await dialog.getByRole("button", { name: "Retry loading sources", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await expect(dialog.locator("#timeline-modal-title")).toHaveText(title!);
  await expect(dialog.locator('section[aria-labelledby^="event-sources-"] a').first()).toHaveAttribute("href", /^https?:/);
  expect(requests).toBe(2);
});

test("late citations from a previous entry cannot replace the current entry's sources @journey", async ({ page, request }) => {
  const data = decodeTimelineData(await (await request.get("/timeline-index.json")).json());
  let release = () => {};
  const ready = new Promise<void>((resolve) => { release = resolve; });
  let heldPath = "";
  await page.route("**/sources/*/data.json", async (route) => {
    if (!heldPath) {
      heldPath = new URL(route.request().url()).pathname;
      await ready;
    }
    await route.continue();
  });
  try {
    await page.goto("/");
    await page.getByRole("link", { name: /^Open event:/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("status")).toHaveText("Loading sources…");
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByRole("status")).toHaveCount(0);
    const href = await dialog.getByRole("link", { name: "Open full entry", exact: true }).getAttribute("href");
    const current = data.events.find((event) => getEventPath(event.id, event.title) === href)!;
    const sourcePath = getEventSourcesPath(current.id, data.sourceRevisions![current.id]);
    expect(sourcePath).not.toBe(heldPath);
    const expected = await (await request.get(sourcePath)).json();
    release();
    await expect(dialog.locator(`section[aria-labelledby="event-sources-${current.id}"]`)).toContainText(expected.sources.split("\n")[0]);
    const previous = data.events.find((event) => getEventSourcesPath(event.id, data.sourceRevisions![event.id]) === heldPath)!;
    await expect(dialog.locator(`section[aria-labelledby="event-sources-${previous.id}"]`)).toHaveCount(0);
  } finally { release(); }
});

test("permanent entry pages retain citations without JavaScript", async ({ browser, request, baseURL }) => {
  const data = decodeTimelineData(await (await request.get("/timeline-index.json")).json());
  const event = data.events[0];
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto(getEventPath(event.id, event.title));
    await expect(page.getByRole("heading", { name: "Sources", exact: true })).toBeVisible();
    await expect(page.locator(`section[aria-labelledby="event-sources-${event.id}"] a`).first()).toHaveAttribute("href", /^https?:/);
  } finally { await context.close(); }
});
