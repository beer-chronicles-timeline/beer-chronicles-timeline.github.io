import { expect, test } from "./fixtures";

test("tag search matches accents and preserves selected filters @journey", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Timeline exploration controls" }))
    .toHaveAttribute("data-timeline-ready", "true");
  const tagsButton = page.getByRole("button", { name: /^Tags/ });
  await tagsButton.click();
  const search = page.getByRole("searchbox", { name: "Search tags" });
  const initialUrl = page.url();
  await search.fill("  KOLSCH  ");
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  const kolsch = page.getByRole("checkbox", { name: /Kölsch/ });
  await expect(kolsch).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "1 matching tag" })).toBeVisible();
  expect(page.url()).toBe(initialUrl);
  await expect(page.getByRole("textbox", { name: "Search timeline" })).toHaveValue("");

  await kolsch.check();
  await expect(page).toHaveURL(/tags=/);
  const selectedUrl = page.url();
  await search.fill("BC_NO_MATCHING_TAG");
  await expect(page.getByText("No tags match your search.")).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Clear tags", exact: true })).toBeVisible();
  expect(page.url()).toBe(selectedUrl);
  await search.fill("");
  await expect(kolsch).toBeChecked();

  await search.fill("kolsch");
  await search.press("Escape");
  await expect(search).toHaveCount(0);
  await expect(tagsButton).toBeFocused();
  await tagsButton.click();
  await expect(search).toHaveValue("");
  await expect(kolsch).toBeChecked();
  expect(await page.getByRole("checkbox").count()).toBeGreaterThan(1);
  await search.fill("BC_NO_MATCHING_TAG");
  await page.getByRole("button", { name: "Clear tags", exact: true }).click();
  await search.fill("kolsch");
  await expect(kolsch).not.toBeChecked();
});

test("long Storylines have working date links and retain all milestones @journey", async ({ page, request }) => {
  const response = await request.get("/storylines/modern-craft-beer");
  expect(await response.text()).toContain('aria-label="Storyline date ranges"');
  await page.goto("/storylines/modern-craft-beer");
  const navigation = page.getByRole("navigation", { name: "Storyline date ranges" });
  const links = navigation.getByRole("link");
  expect(await links.count()).toBeGreaterThan(1);
  const milestoneLists = page.locator("article ol");
  const counts = await milestoneLists.evaluateAll((lists) => lists.map((list) => list.children.length));
  const expectedStarts = counts.map((_, i) => 1 + counts.slice(0, i).reduce((sum, count) => sum + count, 0));
  expect(await milestoneLists.evaluateAll((lists) => lists.map((list) => Number(list.getAttribute("start")))))
    .toEqual(expectedStarts);
  const eventLinks = page.locator('article ol a[href^="/events/"]');
  expect(await eventLinks.count()).toBe(counts.reduce((sum, count) => sum + count, 0));
  const hrefs = await eventLinks.evaluateAll((items) => items.map((item) => item.getAttribute("href")));
  expect(new Set(hrefs).size).toBe(hrefs.length);

  const destination = await links.nth(1).getAttribute("href");
  await links.nth(1).focus();
  await links.nth(1).press("Enter");
  const heading = page.locator(destination!);
  await expect(heading).toBeInViewport();
  await expect(heading).toBeFocused();
  const backLink = page.locator(`${destination} ~ ol + a`);
  await backLink.focus();
  await backLink.press("Enter");
  await expect(navigation).toBeInViewport();
  await expect(navigation).toBeFocused();

  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto("/storylines/smoothie-and-pastry-sours");
  await expect(page.getByRole("navigation", { name: "Storyline date ranges" })).toHaveCount(0);
  await expect(page.locator("article ol h3").first()).toBeVisible();
});

test.describe("Storyline date navigation without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("date links work in the static HTML", async ({ page }) => {
    await page.goto("/storylines/modern-craft-beer");
    const navigation = page.getByRole("navigation", { name: "Storyline date ranges" });
    const lastLink = navigation.getByRole("link").last();
    const destination = await lastLink.getAttribute("href");
    await lastLink.click();
    await expect(page.locator(destination!)).toBeInViewport();
    await expect(page.locator(destination!)).toBeFocused();
  });
});
