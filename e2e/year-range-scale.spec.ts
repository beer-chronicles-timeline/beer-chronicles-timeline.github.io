import { expect, test } from "./fixtures";

for (const path of ["/", "/histogram"]) {
  test(`@journey nonlinear year range retains precision and stable positions: ${path}`, async ({ page }) => {
    await page.goto(path);
    const from = page.getByRole("textbox", { name: "Start year", exact: true });
    const to = page.getByRole("textbox", { name: "End year", exact: true });
    const start = page.getByRole("slider", { name: "Start year", exact: true });
    const end = page.getByRole("slider", { name: "End year", exact: true });
    const track = page.getByRole("group", { name: "Year range", exact: true });
    await from.fill("1500"); await from.press("Enter");
    await to.fill("1800"); await to.press("Enter");
    await track.scrollIntoViewIfNeeded();
    const bounds = (await track.boundingBox())!;
    const startBounds = (await start.boundingBox())!;
    const endBounds = (await end.boundingBox())!;
    const travel = bounds.width - 44;
    expect(startBounds.x + 22 - bounds.x).toBeCloseTo(22 + travel * 0.25, 0);
    expect(endBounds.x + 22 - bounds.x).toBeCloseTo(22 + travel * 0.5, 0);

    // A tenth of the track in the modern half covers about 45 years,
    // rather than roughly 1500 years on the former linear scale.
    await page.mouse.move(endBounds.x + 22, endBounds.y + 22);
    await page.mouse.down();
    await page.mouse.move(endBounds.x + 22 + travel * 0.1, endBounds.y + 22, { steps: 5 });
    await page.mouse.up();
    expect(Number(await to.inputValue())).toBeGreaterThanOrEqual(1844);
    expect(Number(await to.inputValue())).toBeLessThanOrEqual(1846);
    await expect(from).toHaveValue("1500");
    expect((await start.boundingBox())!.x).toBeCloseTo(startBounds.x, 0);

    await page.mouse.click(bounds.x + 22 + travel * 0.9, endBounds.y + 22);
    expect(Number(await to.inputValue())).toBeGreaterThanOrEqual(1980);
    expect(Number(await to.inputValue())).toBeLessThanOrEqual(1982);
    await expect(from).toHaveValue("1500");

    await to.fill("1913"); await to.press("Enter");
    await end.focus(); await page.keyboard.press("ArrowRight");
    await expect(to).toHaveValue("1914");
    await page.keyboard.press("Shift+ArrowLeft");
    await expect(to).toHaveValue("1904");
    await page.keyboard.press("PageUp");
    await expect(to).toHaveValue("1914");
    await expect(end).toHaveAttribute("aria-valuenow", "1913");
    await expect(end).toHaveAttribute("aria-valuetext", "1914 CE");
    const control = track.locator("..");
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const year of [1500, 1800]) {
        await start.focus(); await page.keyboard.press("Home");
        await to.fill(String(year)); await to.press("Enter");
        await from.fill(String(year)); await from.press("Enter");
        const tick = control.locator(`[data-year-marker="${year}"] > span`).first();
        const tickBounds = (await tick.boundingBox())!;
        for (const handle of [start, end]) {
          const handleBounds = (await handle.boundingBox())!;
          expect(Math.abs(handleBounds.x + handleBounds.width / 2 - tickBounds.x - tickBounds.width / 2)).toBeLessThan(1);
          await handle.click(); await expect(handle).toBeFocused();
        }
      }
      await control.screenshot({ path: test.info().outputPath(`equal-years-${width}.png`) });
      await from.fill("1500"); await from.press("Enter");
      await control.screenshot({ path: test.info().outputPath(`aligned-years-${width}.png`) });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await track.locator("..").screenshot({ path: test.info().outputPath("nonlinear-slider.png") });
  });
}
