import { expect, test } from "./fixtures";
import { version } from "maplibre-gl/package.json";

test("@journey map modules are exported and the place index survives unavailable WebGL", async ({ page, request }) => {
  for (const file of ["maplibre-gl.mjs", "maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
    const response = await request.get(`/maplibre/${version}/${file}`);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain("MapLibre GL JS");
  }
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type, ...args) {
      if (String(type).includes("webgl")) return null;
      return original.apply(this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/map");
  await expect(page.getByRole("status").filter({ hasText: "Interactive map unavailable" })).toBeVisible();
  const index = page.getByRole("region", { name: "Browse reviewed places" });
  await expect(index).toBeVisible();
  await index.locator("summary").click();
  await expect(index.getByRole("link").first()).toHaveAttribute("href", /^\/events\//);
  expect(errors).toEqual([]);
});

test("@journey map search works while the engine module is delayed", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route(`**/maplibre/${version}/maplibre-gl.mjs`, async (route) => {
    await pending;
    await route.continue();
  });
  await page.goto("/map", { waitUntil: "domcontentloaded" });
  try {
    await expect(page.getByRole("status").filter({ hasText: "Loading interactive map" })).toBeVisible();
    await page.getByLabel("Find a reviewed place").fill("Zatec");
    await page.getByRole("button", { name: "Show place", exact: true }).click();
    await expect(page.getByRole("complementary", { name: "Selected map entry" })).toContainText("Žatec");
  } finally {
    release();
  }
  await expect(page.getByRole("status").filter({ hasText: "Loading interactive map" })).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "Selected map entry" })).toContainText("Žatec");
});

test("@journey a failed map engine leaves search and the place index usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(`**/maplibre/${version}/maplibre-gl.mjs`, (route) => route.abort());
  await page.goto("/map");
  await expect(page.getByRole("status").filter({ hasText: "Interactive map unavailable" })).toBeVisible();
  await page.getByLabel("Find a reviewed place").fill("Zatec");
  await page.getByRole("button", { name: "Show place", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "Selected map entry" })).toContainText("Žatec");
  const index = page.getByRole("region", { name: "Browse reviewed places" });
  await index.locator("summary").click();
  await expect(index.getByRole("link").first()).toHaveAttribute("href", /^\/events\//);
  expect(errors).toEqual([]);
});

test("@journey the map renderer initializes after the native module loads", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const engineResponse = page.waitForResponse((response) =>
    new URL(response.url()).pathname === `/maplibre/${version}/maplibre-gl.mjs`
  );
  await page.goto("/map");
  expect((await engineResponse).ok()).toBe(true);
  const supportsWebGL = await page.evaluate(() => {
    try { return Boolean(document.createElement("canvas").getContext("webgl2")); }
    catch { return false; }
  });
  if (supportsWebGL) {
    await expect(page.locator(".maplibregl-canvas")).toBeVisible();
    await expect(page.locator(".maplibregl-marker").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Zoom in", exact: true })).toBeEnabled();
  } else {
    await expect(page.getByRole("status").filter({ hasText: "Interactive map unavailable" })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("@journey leaving during module loading allows a clean return to the map", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route(`**/maplibre/${version}/maplibre-gl.mjs`, async (route) => {
    await pending;
    await route.continue();
  });
  await page.goto("/map", { waitUntil: "domcontentloaded" });
  try {
    await expect(page.getByLabel("Find a reviewed place")).toBeEnabled();
    await page.locator("footer").getByRole("link", { name: "About", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "About Beer Chronicles" })).toBeVisible();
  } finally {
    release();
  }
  await page.locator("footer").getByRole("link", { name: "Beer Map", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Beer Map" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Loading interactive map" })).toHaveCount(0);
  await page.getByLabel("Find a reviewed place").fill("Zatec");
  await page.getByRole("button", { name: "Show place", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "Selected map entry" })).toContainText("Žatec");
  expect(errors).toEqual([]);
});
