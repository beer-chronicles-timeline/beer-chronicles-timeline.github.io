import { expect, test } from "./fixtures";

test("@journey rapid timeline drags do not fetch routes or navigate", async ({ page }) => {
  const routeRequests: string[] = [];
  await page.route("**/index.txt*", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.has("from") || url.searchParams.has("to")) {
      routeRequests.push(url.href);
      // A local range change must work even if a route request would fail.
      await route.abort();
    } else await route.continue();
  });
  await page.goto("/?ref=range-test#main-content");
  await expect(page.locator("[data-timeline-ready=true]")).toBeVisible();
  const navigations: string[] = [];
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) navigations.push(request.url());
  });
  const from = page.getByRole("textbox", { name: "Start year", exact: true });
  const to = page.getByRole("textbox", { name: "End year", exact: true });
  const start = page.getByRole("slider", { name: "Start year", exact: true });
  const end = page.getByRole("slider", { name: "End year", exact: true });
  await from.fill("1800"); await from.press("Enter");
  await to.fill("1800"); await to.press("Enter");
  await start.scrollIntoViewIfNeeded();
  const box = (await start.boundingBox())!;
  const right = box.x + box.width;
  const y = box.y + box.height / 2;
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(right - 8, y); await page.mouse.down();
    await page.mouse.move(right - 80, y, { steps: 5 }); await page.mouse.up();
    expect(Number(await start.getAttribute("aria-valuenow"))).toBeLessThan(1799);
    const moved = (await start.boundingBox())!;
    await page.mouse.move(moved.x + 22, y); await page.mouse.down();
    await page.mouse.move(right + 25, y, { steps: 5 }); await page.mouse.up();
    await expect(start).toHaveAttribute("aria-valuetext", "1800 CE");
    await expect(end).toHaveAttribute("aria-valuetext", "1800 CE");
  }
  await expect.poll(() => new URL(page.url()).searchParams.get("from")).toBe("1800");
  expect(new URL(page.url()).searchParams.get("to")).toBe("1800");
  expect(new URL(page.url()).searchParams.get("ref")).toBe("range-test");
  expect(new URL(page.url()).hash).toBe("#main-content");
  expect(routeRequests).toEqual([]);
  expect(navigations).toEqual([]);
  await page.reload();
  await expect(from).toHaveValue("1800");
  await expect(to).toHaveValue("1800");
});

test("@journey modal filter links preserve local history and copied URLs", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async (value: string) => { Object.assign(window, { copiedFilterUrl: value }); },
    } });
  });
  await page.goto("/?category=Laws&ref=history-test#main-content");
  const laws = page.getByRole("button", { name: "Laws", exact: true });
  await expect(laws).toHaveAttribute("aria-pressed", "true");
  const originalUrl = page.url();
  const filterRequests: string[] = [];
  await page.route("**/index.txt*", (route) => {
    if (new URL(route.request().url()).searchParams.has("tags")) {
      filterRequests.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.getByRole("link", { name: /Open event:/ }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('a[href^="/?tags="]').first().click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/tags=/);
  const filteredUrl = page.url();
  await page.getByRole("button", { name: "Copy filtered view", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { copiedFilterUrl: string }).copiedFilterUrl)).toBe(filteredUrl);
  await page.goBack();
  await expect(page).toHaveURL(originalUrl);
  await expect(laws).toHaveAttribute("aria-pressed", "true");
  await page.goForward();
  await expect(page).toHaveURL(filteredUrl);
  await expect(laws).toHaveAttribute("aria-pressed", "false");
  expect(filterRequests).toEqual([]);
});

test("@journey mobile year handles remain reachable beside the random action", async ({ page, isMobile }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const from = page.getByRole("textbox", { name: "Start year", exact: true });
    const to = page.getByRole("textbox", { name: "End year", exact: true });
    const end = page.getByRole("slider", { name: "End year", exact: true });
    await from.fill("1800"); await from.press("Enter");
    for (const value of ["1800", "1800junk"]) {
      await from.fill(value); await to.focus();
      for (const scroll of [0, 100, 300]) {
        await page.evaluate((y) => window.scrollTo(0, y), scroll);
        for (const name of ["Start year", "End year"]) {
          const handle = page.getByRole("slider", { name, exact: true });
          await handle.scrollIntoViewIfNeeded();
          expect(await handle.evaluate((element) => {
            const r = element.getBoundingClientRect();
            return element.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
          })).toBe(true);
        }
      }
    }
    await end.scrollIntoViewIfNeeded();
    const r = (await end.boundingBox())!;
    const before = Number(await end.getAttribute("aria-valuenow"));
    if (isMobile) {
      const session = await page.context().newCDPSession(page);
      try {
        await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: r.x + 22, y: r.y + 22 }] });
        await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: r.x + 2, y: r.y + 22 }] });
        await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      } finally { await session.detach(); }
    } else {
      await page.mouse.move(r.x + 22, r.y + 22); await page.mouse.down();
      await page.mouse.move(r.x + 2, r.y + 22, { steps: 5 }); await page.mouse.up();
    }
    expect(Number(await end.getAttribute("aria-valuenow"))).toBeLessThan(before);
    await expect(page.getByRole("dialog")).toBeHidden();
    const random = page.getByRole("button", { name: "Open random event", exact: true });
    await expect(random).toHaveCSS("position", "static");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await random.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.screenshot({ path: test.info().outputPath(`mobile-controls-${width}.png`) });
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Open random event", exact: true })).toHaveCSS("position", "fixed");
  await page.screenshot({ path: test.info().outputPath("desktop-controls.png") });
});
