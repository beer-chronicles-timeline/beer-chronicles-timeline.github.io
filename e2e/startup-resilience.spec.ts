import { expect, test } from "./fixtures";

for (const path of ["/", "/map"]) {
  test(`@journey controls wait for their handlers during delayed startup: ${path}`, async ({ page }) => {
    let releaseScripts = () => {};
    const scriptsReady = new Promise<void>((resolve) => { releaseScripts = resolve; });
    await page.route("**/*.js*", async (route) => {
      if (route.request().resourceType() === "script") await scriptsReady;
      await route.continue();
    });
    try {
      await page.goto(path, { waitUntil: "commit" });
      if (path === "/map") {
        const search = page.getByLabel("Find a reviewed place");
        const submit = page.getByRole("button", { name: "Show place", exact: true });
        await expect(search).toBeDisabled();
        await expect(submit).toBeDisabled();
        await expect(page.getByRole("combobox", { name: /^Period/ })).toBeDisabled();
        releaseScripts();
        // Auto-wait on native enabled state, with no test-only readiness delay.
        await search.fill("Zatec");
        await submit.click();
        await expect(page.getByRole("complementary", { name: "Selected map entry" })).toContainText("Žatec");
        await page.getByRole("combobox", { name: /^Period/ }).selectOption("before-1800");
        await expect(page.locator("#place-search-status")).toContainText("No entries match");
      } else {
        const input = page.locator("#startYearInput");
        await expect(input).toBeDisabled();
        releaseScripts();
        await input.fill("1800");
        await input.press("Enter");
        const start = page.getByRole("slider", { name: "Start year", exact: true });
        await expect(start).toHaveAttribute("aria-valuetext", "1800 CE");
        await input.fill("1800junk");
        await page.getByRole("textbox", { name: "End year", exact: true }).focus();
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(start).toHaveAttribute("aria-valuetext", "1800 CE");
      }
    } finally {
      releaseScripts();
    }
  });
}

test("@journey timeline waits for initial URL restoration before accepting edits", async ({ page }) => {
  await page.addInitScript(() => {
    const requestFrame = window.requestAnimationFrame.bind(window);
    const cancelFrame = window.cancelAnimationFrame.bind(window);
    const frames = new Map<number, FrameRequestCallback>();
    let nextId = -1;
    window.requestAnimationFrame = (callback) => {
      const id = nextId--;
      frames.set(id, callback);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      if (!frames.delete(id)) cancelFrame(id);
    };
    Object.assign(window, {
      releaseStartupFrames: () => {
        window.requestAnimationFrame = requestFrame;
        window.cancelAnimationFrame = cancelFrame;
        frames.forEach((callback) => requestFrame(callback));
        frames.clear();
      },
    });
  });
  const detailsRequested = page.waitForRequest("**/timeline-data.json*");
  await page.goto("/?from=1700&to=1900");
  // The detail request starts in a mount effect, so hydration has happened;
  // initial URL restoration is still held behind the animation-frame gate.
  await detailsRequested;
  const controls = page.getByRole("region", { name: "Timeline exploration controls" });
  const input = page.locator("#startYearInput");
  await expect(controls).toHaveAttribute("data-timeline-ready", "false");
  await expect(input).toBeDisabled();
  await page.evaluate(() => (window as unknown as { releaseStartupFrames: () => void }).releaseStartupFrames());
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue("1700");
  await input.fill("1800");
  await input.press("Enter");
  await expect(page.getByRole("slider", { name: "Start year", exact: true })).toHaveAttribute("aria-valuetext", "1800 CE");
  await expect(page).toHaveURL(/from=1800/);
});
