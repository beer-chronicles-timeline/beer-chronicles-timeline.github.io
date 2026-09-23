import { expect, test } from "@playwright/test";
import { version } from "maplibre-gl/package.json";

test("map worker assets are exported and the place index survives unavailable WebGL", async ({ page, request }) => {
  for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
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
  // Python's fixture server does not resolve Pages-style extensionless URLs.
  // Next also emits a /map/ directory containing RSC files, not an index.html.
  await page.goto("/map.html");
  await expect(page.getByRole("status").filter({ hasText: "Interactive map unavailable" })).toBeVisible();
  const index = page.getByRole("region", { name: "Browse reviewed places" });
  await expect(index).toBeVisible();
  await index.locator("summary").click();
  await expect(index.getByRole("link").first()).toHaveAttribute("href", /^\/events\//);
  expect(errors).toEqual([]);
});
