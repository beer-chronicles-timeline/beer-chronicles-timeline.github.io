import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

test("@journey BJCP navigation, style counts, filters, and expandable entry tables", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/bjcp-coverage");
  await expect(page.getByRole("heading", { level: 1, name: "BJCP Coverage" })).toBeVisible();
  await expect(page.locator("details")).toHaveCount(128);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://beer-chronicles.org/bjcp-coverage");

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const links = await navigation.getByRole("link").allTextContents();
  const mapIndex = links.indexOf("Beer Map");
  expect(links.slice(mapIndex, mapIndex + 3)).toEqual(["Beer Map", "BJCP Coverage", "Histogram"]);
  await page.screenshot({ path: test.info().outputPath("bjcp-coverage-navigation.png") });
  await page.keyboard.press("Escape");

  const search = page.getByRole("searchbox", { name: "Find a style" });
  await search.fill("12B");
  await expect(page.locator("details")).toHaveCount(1);
  await expect(page.locator("summary")).toContainText("Australian Sparkling Ale");
  await search.fill("kolsch");
  await expect(page.locator("details")).toHaveCount(1);
  await expect(page.locator("summary")).toContainText("Kölsch");
  await search.fill("there is no style with this name");
  await expect(page.getByText("No styles match these filters.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("details")).toHaveCount(128);

  const filter = page.getByRole("combobox", { name: "Coverage" });
  await filter.selectOption("uncovered");
  const zero = page.locator("details").first();
  await zero.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(zero).toHaveAttribute("open", "");
  await expect(zero.getByText("No entries are tagged for this style yet.")).toBeVisible();
  await filter.selectOption("covered");

  const count = await page.locator("details").count();
  // Synthetic builds can have no related style tags. Real public-data fixtures
  // additionally exercise the entry table and its permanent event links.
  if (count > 0) {
    const style = page.locator("details").first();
    const summary = style.locator("summary");
    const countLabel = await summary.locator("span.sr-only").innerText();
    const numericCount = Number((await summary.locator("span").last().evaluate(el => el.parentElement?.textContent))?.match(/^\d+/)?.[0]);
    expect(countLabel).toMatch(/related entr/);
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(style.getByRole("table")).toBeVisible();
    await expect(style.locator("tbody tr")).toHaveCount(numericCount);
    await expect(style.getByRole("link", { name: /BJCP 2021 description/ })).toHaveAttribute("href", /^https:\/\/www\.bjcp\.org\//);
    const entryLink = style.locator("tbody a").first();
    const title = await entryLink.innerText();
    await expect(entryLink).toHaveAttribute("href", /^\/events\/[a-f\d-]+\/[a-z\d-]+$/);
    await entryLink.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  }
  expect(errors).toEqual([]);
});

test("@mobile @a11y-scan BJCP coverage reflows and its expanded list remains accessible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/bjcp-coverage");
  await page.getByRole("combobox", { name: "Coverage" }).selectOption("covered");
  if (await page.locator("details").count()) await page.locator("summary").first().click();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("bjcp-coverage-320.png") });
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(scan.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
});
