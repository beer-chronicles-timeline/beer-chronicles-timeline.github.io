import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const eventPath = "/events/fc252325-4204-4381-b718-234fa91110dc/the-bavarian-beer-regulation-of-1516-is-issued";
const oldPath = "/events/1c650d85-7d10-4e17-a7af-76a7a8c4556e/balling-invents-the-saccharimeter";

test("@journey old event links retain query/fragment and resolve to the canonical entry", async ({ page, request }) => {
  for (const oldPath of [
    "/events/0a5a3946-30db-4a61-8d4d-bc36cbda6a7b/hofbrauhaus-sells-its-first-einbeck-style-beer",
    "/events/3df5535f-0f59-463a-8e3e-ff80ec998e3a/schwechat-brewery-becomes-a-major-industrial-lager-brewery",
    "/events/1c650d85-7d10-4e17-a7af-76a7a8c4556e/balling-invents-the-saccharimeter",
  ]) {
  const response = await request.get(oldPath);
  expect(response.status()).toBe(200);
  const html = await response.text();
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  expect(canonical).toBeTruthy();
  const destination = new URL(canonical!).pathname;
  expect(destination).not.toBe(oldPath);
  await page.goto(oldPath + "?ref=regression#main-content");
  await expect(page).toHaveURL(new RegExp(destination + "\\?ref=regression#main-content$"));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("@journey old event pages contain a usable link without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto(oldPath);
    const link = page.getByRole("link", { name: /^Continue to/ });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("This entry has a new address");
  } finally { await context.close(); }
});

test("@journey search, filters and Storyline scope survive reload and browser history", async ({ page }) => {
  await page.goto("/?category=Laws&from=1400&to=1900&string=beer");
  const input = page.getByRole("textbox", { name: "Search timeline" });
  await expect(input).toHaveValue("beer");
  await expect(page.getByRole("button", { name: "Laws", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("textbox", { name: "Start year", exact: true })).toHaveValue("1400");
  await page.reload();
  await expect(input).toHaveValue("beer");
  await page.goto("/storylines/british-ale-beyond-ipa");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goBack();
  await expect(input).toHaveValue("beer");
  await page.goForward();
  await expect(page).toHaveURL(/storylines\/british-ale-beyond-ipa$/);
  const timeline = page.locator('a[href*="storyline=british-ale-beyond-ipa"]').first();
  await timeline.click();
  await expect(page).toHaveURL(/storyline=british-ale-beyond-ipa/);
  await expect(page.locator("[data-timeline-ready=true]")).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/storyline=british-ale-beyond-ipa/);
});

test("@journey histogram supports keyboard selection, table and a shared range control", async ({ page }) => {
  await page.goto("/histogram");
  const start = page.getByRole("slider", { name: "Start year", exact: true });
  const end = page.getByRole("slider", { name: "End year", exact: true });
  for (const slider of [start, end]) {
    const box = await slider.boundingBox();
    // Fractional transforms can introduce subpixel bounding-box rounding.
    expect(box!.width).toBeGreaterThanOrEqual(43.99);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: test.info().outputPath("histogram.png"), fullPage: true });
  const a = (await start.boundingBox())!, b = (await end.boundingBox())!;
  expect(a.y).toBe(b.y);
  await expect(page.locator('[aria-label="Year range"]')).toHaveCount(1);
  const startValue = Number(await start.getAttribute("aria-valuenow"));
  await start.focus(); await page.keyboard.press("ArrowLeft");
  await expect(start).toHaveAttribute("aria-valuenow", String(startValue - 1));
  await page.getByRole("button", { name: "All history", exact: true }).click();
  const chart = page.getByRole("group", { name: "Histogram: use left and right arrow keys to inspect bins", exact: true });
  await chart.focus(); await page.keyboard.press("Home");
  await expect(chart).toBeFocused();
  await expect(page.locator("#histogram-selection")).not.toContainText("Select a bin");
  await page.keyboard.press("End");
  await expect(page.locator("#histogram-selection")).toContainText("2026");
  await page.locator("summary").filter({ hasText: "Entry counts as a table" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  // Same-year ranges remain independently operable, including crossing BCE/CE.
  await page.getByRole("textbox", { name: "Start year", exact: true }).fill("1 BC");
  await page.getByRole("textbox", { name: "End year", exact: true }).fill("1");
  await end.focus(); await page.keyboard.press("ArrowLeft");
  await expect(end).toHaveAttribute("aria-valuetext", "1 BCE");
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("@journey histogram keyboard selection survives stationary pointer events", async ({ page }) => {
  await page.goto("/histogram");
  const chart = page.getByRole("group", { name: "Histogram: use left and right arrow keys to inspect bins", exact: true });
  const svg = chart.locator("svg");
  const selection = page.locator("#histogram-selection");
  await chart.scrollIntoViewIfNeeded();
  const box = (await svg.boundingBox())!;
  const pointer = { pointerType: "mouse", clientX: box.x + box.width / 4, clientY: box.y + 100 };
  await svg.dispatchEvent("pointermove", pointer);
  const hovered = await selection.textContent();
  await chart.focus();
  await page.keyboard.press("End");
  const lastBin = await selection.textContent();
  expect(lastBin).not.toBe(hovered);
  // WebKit can emit a pointermove after layout/hit-target changes, even when
  // the mouse hasn't moved. It must not undo the latest keyboard selection.
  await svg.dispatchEvent("pointermove", pointer);
  await expect(selection).toHaveText(lastBin!);
  await svg.dispatchEvent("pointermove", { ...pointer, clientY: pointer.clientY + 1 });
  await expect(selection).toHaveText(hovered!);
  await page.keyboard.press("End");
  await svg.dispatchEvent("click", pointer);
  await expect(selection).toHaveText(hovered!);
});

test("@journey map search finds an accented place and reports an empty period", async ({ page }) => {
  await page.goto("/map");
  await page.getByLabel("Find a reviewed place").fill("Zatec");
  await page.getByRole("button", { name: "Show place", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "Selected map entry" })).toContainText("Žatec");
  await page.getByRole("combobox", { name: /^Period/ }).selectOption("before-1800");
  await expect(page.locator("#place-search-status")).toContainText("No entries match");
});

test("@journey sharing and correction submission recover from a server error", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => { document.documentElement.dataset.copied = text; } }, configurable: true });
  });
  await page.goto(eventPath);
  await page.getByRole("button", { name: /^Share / }).click();
  await expect(page.locator("html")).toHaveAttribute("data-copied", "https://beer-chronicles.org" + eventPath);
  await page.getByRole("link", { name: "Suggest a correction or additional source" }).click();
  await expect(page.locator("#title")).not.toHaveValue("");
  await page.locator("#name").fill("Offline fixture");
  await page.locator("#email").fill("fixture@example.invalid");
  await page.locator("#description").fill("Offline test - no message is delivered.");
  let calls = 0;
  await page.route("https://formspree.io/**", (route) => {
    calls++;
    return route.fulfill({ status: calls === 1 ? 503 : 200, json: calls === 1 ? { error: "fixture failure" } : { ok: true } });
  });
  await page.getByRole("button", { name: "Send Suggestion" }).click();
  await expect(page.getByText(/error|wrong|failed/i).last()).toBeVisible();
  await expect(page.locator("#description")).toHaveValue("Offline test - no message is delivered.");
  await page.getByRole("button", { name: "Send Suggestion" }).click();
  await expect(page.getByText(/Thank you/i).first()).toBeVisible();
  expect(calls).toBe(2);
});

for (const path of ["/map", "/histogram", "/submit"]) {
  test(`@a11y-scan WCAG 2.2 page and reflow: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
}

test("@a11y-scan timeline open filters and event modal", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Tags/ }).click();
  const scan = async () => {
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  };
  await scan();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: /Open event:/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await scan();
});

for (const path of ["/", "/histogram"]) {
  test(`@journey date drafts and dependent slider limits: ${path}`, async ({ page }) => {
    await page.goto(path);
    const input = page.getByRole("textbox", { name: "Start year", exact: true });
    const endInput = page.getByRole("textbox", { name: "End year", exact: true });
    const start = page.getByRole("slider", { name: "Start year", exact: true });
    const end = page.getByRole("slider", { name: "End year", exact: true });
    await input.fill("1800"); await input.press("Enter");
    for (const invalid of ["1,800", "1800junk", "1800.5", "0", "9007199254740992"]) {
      await input.fill("");
      await input.pressSequentially(invalid);
      await endInput.focus();
      await expect(input).toHaveValue(invalid);
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(start).toHaveAttribute("aria-valuetext", "1800 CE");
    }
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // The full timeline can exceed WebKit's 32767-pixel screenshot limit.
    await input.scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath("invalid-year.png") });
    await input.fill("1800"); await input.press("Enter");
    await endInput.fill("1900"); await input.focus();
    await expect(input).toHaveAttribute("aria-invalid", "false");
    await expect(start).toHaveAttribute("aria-valuemax", "1899");
    await expect(end).toHaveAttribute("aria-valuemin", "1799");
    await start.focus(); await page.keyboard.press("End");
    await expect(start).toHaveAttribute("aria-valuetext", "1900 CE");
    await expect(end).toHaveAttribute("aria-valuemin", "1899");
    await end.focus(); await page.keyboard.press("Home");
    await expect(end).toHaveAttribute("aria-valuetext", "1900 CE");
    await input.fill("1 BCE"); await endInput.fill("1"); await end.focus();
    await expect(start).toHaveAttribute("aria-valuemax", "0");
    await expect(end).toHaveAttribute("aria-valuemin", "-1");
    await page.keyboard.press("ArrowLeft");
    await expect(end).toHaveAttribute("aria-valuetext", "1 BCE");
    await expect(start).toHaveAttribute("aria-valuemax", "-1");
  });
}

for (const path of ["/", "/histogram"]) {
  test(`@journey shared year range pointer selection and fixed endpoints: ${path}`, async ({ page, isMobile }) => {
    await page.goto(path);
    const from = page.getByRole("textbox", { name: "Start year", exact: true });
    const to = page.getByRole("textbox", { name: "End year", exact: true });
    const start = page.getByRole("slider", { name: "Start year", exact: true });
    const end = page.getByRole("slider", { name: "End year", exact: true });
    await from.fill("1800"); await from.press("Enter");
    await to.fill("1800"); await to.press("Enter");
    if (isMobile) {
      await start.tap(); await expect(start).toBeFocused();
      await end.tap(); await expect(end).toBeFocused();
    } else {
      await start.click(); await expect(start).toBeFocused();
      await end.click(); await expect(end).toBeFocused();
    }
    const box = (await start.boundingBox())!;
    const endBox = (await end.boundingBox())!;
    expect(box.x).toBeCloseTo(endBox.x, 0);
    expect(endBox.y - box.y).toBeGreaterThan(22);
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const dragTo = async (fromX: number, toX: number, y: number) => {
      if (isMobile) {
        const session = await page.context().newCDPSession(page);
        try {
          await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: fromX, y }] });
          for (let i = 1; i <= 5; i++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: fromX + (toX - fromX) * i / 5, y }] });
          await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        } finally { await session.detach(); }
      } else {
        await page.mouse.move(fromX, y); await page.mouse.down();
        await page.mouse.move(toX, y, { steps: 5 }); await page.mouse.up();
      }
    };
    // Dragging To past From must stop at From without moving it or swapping roles.
    await dragTo(center.x, center.x - 80, endBox.y + endBox.height / 2);
    await expect(start).toHaveAttribute("aria-valuetext", "1800 CE");
    await expect(end).toHaveAttribute("aria-valuetext", "1800 CE");
    // From can expand left, while To remains fixed.
    await dragTo(center.x, center.x - 80, center.y);
    expect(Number(await start.getAttribute("aria-valuenow"))).toBeLessThan(1799);
    await expect(end).toHaveAttribute("aria-valuetext", "1800 CE");
    // Drag From through To: both stop at 1800; the end must not jump forward.
    const moved = (await start.boundingBox())!;
    await dragTo(moved.x + 22, center.x + 25, moved.y + moved.height / 2);
    await expect(start).toHaveAttribute("aria-valuetext", "1800 CE");
    await expect(end).toHaveAttribute("aria-valuetext", "1800 CE");
    await start.focus(); await page.keyboard.press("Tab"); await expect(end).toBeFocused();
  });
}
