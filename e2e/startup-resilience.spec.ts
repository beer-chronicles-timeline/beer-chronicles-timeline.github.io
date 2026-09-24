import { expect, test } from "./fixtures";

const correctionPath = "/submit?submissionType=correction&eventTitle=Correction%20fixture&eventUrl=https%3A%2F%2Fbeer-chronicles.org%2Fevents%2Ffixture%2Ffixture";

for (const path of ["/", "/map", "/histogram", "/submit", correctionPath]) {
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
      } else if (path.startsWith("/submit")) {
        const name = page.locator("#name");
        await expect(name).toBeDisabled();
        await expect(page.locator('button[type="submit"]')).toBeDisabled();
        releaseScripts();
        await name.fill("Startup test");
        await page.locator("#email").fill("startup@example.invalid");
        if (path === correctionPath) {
          await expect(page.locator("#title")).toHaveValue("Correction fixture");
        } else {
          await page.locator("#title").fill("Offline test fixture");
          await page.locator("#datePrecision").selectOption("year");
          await page.locator("#eventDate").fill("1900");
          await page.locator("#sources").fill("https://example.invalid/test");
        }
        await page.locator("#description").fill("Offline browser test; never submitted to a service.");
        let submissions = 0;
        await page.route("https://formspree.io/**", async (route) => {
          const body = route.request().postDataJSON();
          expect(body.name).toBe("Startup test");
          if (path === correctionPath) expect(body.title).toBe("Correction fixture");
          submissions++;
          await route.fulfill({ status: submissions === 1 ? 503 : 200, json: { ok: submissions > 1 } });
        });
        const submit = page.getByRole("button", { name: path === correctionPath ? "Send Suggestion" : "Send Entry", exact: true });
        await submit.click();
        await expect(page.getByRole("alert").filter({ hasText: "Sorry, there was an error" })).toBeVisible();
        await expect(name).toHaveValue("Startup test");
        await submit.click();
        await expect(page.getByRole("status")).toContainText("Thank you");
        expect(submissions).toBe(2);
      } else {
        const input = page.locator("#startYearInput");
        await expect(input).toBeDisabled();
        if (path === "/histogram") {
          await expect(page.locator("#histogram-bin-size")).toBeDisabled();
          await expect(page.getByRole("group", { name: /^Histogram:/ })).toBeDisabled();
          await expect(page.locator("details")).toHaveAttribute("inert", "");
        }
        releaseScripts();
        const committedYear = path === "/histogram" ? "1900" : "1800";
        await input.fill(committedYear);
        await input.press("Enter");
        const start = page.getByRole("slider", { name: "Start year", exact: true });
        await expect(start).toHaveAttribute("aria-valuetext", `${committedYear} CE`);
        await input.fill(`${committedYear}junk`);
        await page.getByRole("textbox", { name: "End year", exact: true }).focus();
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(start).toHaveAttribute("aria-valuetext", `${committedYear} CE`);
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
