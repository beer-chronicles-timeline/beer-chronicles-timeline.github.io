import { expect, test } from "./fixtures";

test.describe("Static content without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("@journey homepage structured data matches the rendered timeline cards", async ({ page }) => {
    await page.goto("/");
    const structuredData = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!
    );
    const itemList = structuredData["@graph"].find(
      (entity: { "@type": string }) => entity["@type"] === "ItemList"
    );
    const cards = page.getByRole("list", { name: "Beer history timeline" }).getByRole("listitem");
    await expect(cards).toHaveCount(60);
    const entries = await cards.evaluateAll((items) => items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.querySelector("h2")!.textContent,
      url: new URL(item.querySelector("a")!.getAttribute("href")!, "https://beer-chronicles.org").href,
    })));

    expect(itemList.numberOfItems).toBe(entries.length);
    expect(itemList.itemListElement).toEqual(entries);
  });

  test("@journey histogram exact counts are readable without JavaScript", async ({ page, request }) => {
    await page.goto("/histogram");
    await expect(page.locator("table")).toHaveCount(1);
    const summary = page.getByText("Entry counts as a table", { exact: true });
    await summary.focus();
    await page.keyboard.press("Enter");
    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    await expect(table.getByRole("columnheader")).toHaveText(["Years", "Entries"]);
    await expect(table.getByRole("rowheader").first()).toHaveText("1800–1809");

    const currentYear = Number(await page.locator("#endYearInput").inputValue());
    const { events } = await (await request.get("/timeline-index.json")).json();
    const expectedTotal = events.filter((event: { historical_year?: number; event_date?: string }) => {
      const year = event.historical_year ?? (
        event.event_date?.endsWith(" BC") ? -1 : Number(event.event_date?.split("-")[0])
      );
      return year >= 1800 && year <= currentYear;
    }).length;
    const counts = await table.locator("tbody td").allTextContents();
    expect(counts.reduce((total, count) => total + Number(count), 0)).toBe(expectedTotal);

    await summary.click();
    await expect(table).toBeHidden();
    await summary.click();
    await expect(table).toBeVisible();
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath("histogram-static-table.png"), fullPage: true });
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      const chart = page.getByRole("img", { name: /^Timeline entry counts/ });
      await expect(chart).toHaveCount(1);
      const axisLabel = await chart.locator("text").filter({ hasText: "Number of entries" }).boundingBox();
      expect(axisLabel!.height).toBeGreaterThan(10);
      const barHeight = await chart.locator("rect").evaluateAll((bars) => Math.max(...bars.map((bar) => bar.getBoundingClientRect().height)));
      expect(barHeight).toBeGreaterThan(150);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
});
