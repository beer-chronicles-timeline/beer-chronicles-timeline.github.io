import { expect, test, type Page } from "@playwright/test";

async function mockTimelineData(page: Page) {
  const events = Array.from({ length: 121 }, (_, index) => ({
    id: `event-${index}`,
    title: `Test event ${index}`,
    description: `Description for test event ${index}`,
    event_date: `${2026 - (index % 100)}-01-01`,
    historical_year: null,
    image_url: null,
    created_at: null,
    category: index % 2 === 0 ? "Laws" : "Breweries",
    date_precision: "date",
    sources: null,
    tags: [],
  }));

  await page.route("**/timeline-data.json*", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        events,
        tags: [],
        visibleTags: [],
        minYear: 1927,
        maxYear: 2026,
      }),
    })
  );
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
  await mockTimelineData(page);
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
  await mockTimelineData(page);
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
