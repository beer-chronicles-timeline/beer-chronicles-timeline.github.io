import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const seriousViolations = results.violations.filter(
    ({ impact }) => impact === "critical" || impact === "serious"
  );

  expect(
    seriousViolations,
    seriousViolations
      .map(
        ({ id, help, nodes }) =>
          `${id}: ${help} (${nodes.length} affected node${nodes.length === 1 ? "" : "s"})`
      )
      .join("\n")
  ).toEqual([]);
}

test("skip link moves focus past the repeated site header", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", {
    name: "Skip to main content",
  });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");

  const contentStart = page.locator("#main-content");
  await expect(contentStart).toBeFocused();
  await expect(contentStart).toHaveText("Main content");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const header = document.querySelector("main > header");
        const target = document.querySelector("#main-content");

        return Boolean(
          header &&
            target &&
            header.compareDocumentPosition(target) &
              Node.DOCUMENT_POSITION_FOLLOWING
        );
      })
    )
    .toBe(true);
});

test("timeline announces one debounced filtered result update", async ({
  page,
}) => {
  await page.goto("/");

  const controls = page.getByRole("region", {
    name: "Timeline exploration controls",
  });
  const resultsStatus = controls.getByRole("status");

  await expect(controls.getByRole("button", { name: "Laws" })).toBeVisible();
  await expect(resultsStatus).toBeEmpty();
  await controls.getByRole("button", { name: "Laws" }).click();
  await expect(resultsStatus).toHaveText(
    /Showing \d+ of \d+ events\./,
    { timeout: 2_000 }
  );
});

test("timeline exposes incrementally rendered events as an ordered list", async ({
  page,
}) => {
  await page.addInitScript(() => {
    class InertIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }

    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: InertIntersectionObserver,
    });
  });
  await page.goto("/");

  const timeline = page.getByRole("list", {
    name: "Beer history timeline",
  });
  await expect(timeline).toBeVisible();
  await expect(timeline.getByRole("listitem")).toHaveCount(60);

  await page.getByRole("button", { name: /Show more events/ }).click();
  await expect(timeline.getByRole("listitem")).toHaveCount(120);
});

test("scroll to top avoids smooth scrolling when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/storylines.html");

  const menuButton = page.getByRole("button", {
    name: "Open navigation menu",
  });
  await menuButton.click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" })
  ).toBeVisible();
  await page.keyboard.press("Escape");

  const scrollButton = page.getByRole("button", {
    name: "Scroll to top",
  });
  await expect
    .poll(async () => {
      await page.evaluate(() => {
        window.scrollTo(0, 1_000);
        window.dispatchEvent(new Event("scroll"));
      });

      return scrollButton.count();
    })
    .toBe(1);
  await expect(scrollButton).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: (options: ScrollToOptions) => {
        document.documentElement.dataset.scrollBehavior = String(
          options.behavior
        );
      },
    });
  });
  await scrollButton.click();

  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.dataset.scrollBehavior
      )
    )
    .toBe("auto");
});

test("tag filters support a complete keyboard interaction", async ({
  page,
}) => {
  await page.goto("/");

  const tagsButton = page.getByRole("button", { name: /^Tags/ });
  await tagsButton.focus();
  await page.keyboard.press("Enter");
  await expect(tagsButton).toHaveAttribute("aria-expanded", "true");

  const firstTag = page.getByRole("checkbox").first();
  await firstTag.focus();
  await expect(firstTag).toBeFocused();
  await page.keyboard.press("Space");
  await expect(firstTag).toBeChecked();

  await page.keyboard.press("Escape");
  await expect(tagsButton).toHaveAttribute("aria-expanded", "false");
  await expect(tagsButton).toBeFocused();
});

test("event modal contains focus and restores it after closing", async ({
  page,
}) => {
  await page.goto("/");

  const activatingLink = page.getByRole("link", { name: /Open event:/ }).first();
  await activatingLink.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  const closeButton = dialog.getByRole("button", { name: "Close" });
  await expect(dialog).toBeVisible();
  await expect(closeButton).toBeFocused();

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() =>
        dialog.evaluate(
          (element) =>
            document.activeElement !== null &&
            element.contains(document.activeElement)
        )
      )
      .toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(activatingLink).toBeFocused();
});

test("@a11y-scan representative pages have no serious axe violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Timeline exploration controls" })
  ).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto("/storylines.html");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto(
    "/events/fc252325-4204-4381-b718-234fa91110dc/the-bavarian-beer-regulation-of-1516-is-issued.html"
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("@mobile timeline reflows at a 320 CSS-pixel viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Timeline exploration controls" })
  ).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    )
    .toBe(true);
  await expect(page.getByRole("link", { name: /Open event:/ }).first()).toBeVisible();
});

test("@webkit core timeline controls and modal work", async ({ page }) => {
  await page.goto("/");

  const lawsFilter = page.getByRole("button", { name: "Laws" });
  await lawsFilter.click();
  await expect(lawsFilter).toHaveAttribute("aria-pressed", "true");

  const eventLink = page.getByRole("link", { name: /Open event:/ }).first();
  await eventLink.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
