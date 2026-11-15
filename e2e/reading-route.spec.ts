import { expect, test } from "./fixtures";

test("a newcomer can follow all six selected entries and return to the route @journey", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("region", { name: "Start here", exact: true });
  await card.getByRole("link", { name: "Start reading" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Beer history in six stops" })).toBeVisible();
  const stops = page.getByRole("list", { name: "Reading route stops" }).getByRole("listitem");
  await expect(stops).toHaveCount(6);
  const titles = await stops.getByRole("heading", { level: 3 }).allTextContents();
  const stopLinks = await stops.getByRole("heading", { level: 3 }).getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
  await page.getByRole("link", { name: "Begin with stop 1" }).click();

  for (let index = 0; index < titles.length; index++) {
    await expect(page.getByRole("heading", { level: 1, name: titles[index], exact: true })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`readingRoute=beer-history-in-six-stops`));
    const navigation = page.getByRole("navigation", { name: "Reading route", exact: true });
    await expect(navigation).toHaveCount(2);
    await expect(navigation.first().getByText(`Guided reading · Stop ${index + 1} of 6`)).toBeVisible();
    if (index > 0) {
      await expect(navigation.first().getByRole("link", { name: `Previous stop: ${titles[index - 1]}`, exact: true }))
        .toHaveAttribute("href", stopLinks[index - 1]);
    }
    if (index < titles.length - 1) {
      await navigation.last().getByRole("link", { name: `Next stop: ${titles[index + 1]}`, exact: true }).click();
    } else {
      await expect(navigation.last().getByRole("link", { name: "Keep exploring Storylines" })).toHaveAttribute("href", "/storylines");
      await navigation.last().getByRole("link", { name: "Back to route" }).click();
    }
  }
  await expect(stops).toHaveCount(6);
  // Opening an entry directly must not put an unrelated visitor into a route.
  await page.goto(stopLinks[0].split("?")[0]);
  await expect(page.getByRole("heading", { level: 1, name: titles[0], exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Reading route", exact: true })).toHaveCount(0);
});

test("the card, overview and reading controls fit a narrow phone @mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  const card = page.getByRole("region", { name: "Start here", exact: true });
  await expect(card).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("homepage-card.png") });
  await card.getByRole("link", { name: "Start reading" }).click();
  await expect(page.getByRole("button", { name: "Open navigation menu" }).filter({ visible: true })).toBeVisible();
  await expect(page.getByRole("list", { name: "Reading route stops" }).getByRole("listitem"))
    .toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("reading-route.png") });
  await page.getByRole("link", { name: "Begin with stop 1" }).click();
  const navigation = page.getByRole("navigation", { name: "Reading route", exact: true }).first();
  await expect(navigation).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("reading-stop.png") });
  await page.goto("/storylines");
  await expect(card.getByRole("link", { name: "Start reading" })).toBeVisible();
});

test("reviewed approximate dates agree on cards and entry dialogs @journey", async ({ page, request }) => {
  const data = await (await request.get("/timeline-index.json")).json();
  const reviewedDates = [
    {
      id: "9d9bd659-d8bd-4990-950c-c4d83352e542",
      event_date: "1158-01-01",
      description: "Between about 1151 and 1158, Hildegard compiled Physica.",
      label: "ca. 1151–1158",
    },
    {
      id: "7b9ed8c2-2db7-4ad8-a067-9cc37d748e4b",
      event_date: "1799-01-01 BC",
      description: "Around 1800 BCE, scribes copied the Hymn to Ninkasi.",
      label: "ca. 1800 BCE",
    },
  ];
  // Exercise the reviewed presentation in both synthetic and live builds.
  // All substitutions remain in this test's local HTTP response.
  data.events = reviewedDates.map(({ id, event_date, description }) => {
    const original = data.events.find((event: { id: string }) => event.id === id);
    expect(original).toBeDefined();
    return { ...original, event_date, description, historical_year: null, date_precision: "year" };
  });
  await page.route("**/timeline-index.json*", (route) => route.fulfill({ json: data }));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  const cards = page.getByRole("list", { name: "Beer history timeline" }).getByRole("listitem");
  await expect(cards).toHaveCount(2);

  for (const { id, label } of reviewedDates) {
    const title = data.events.find((event: { id: string }) => event.id === id).title;
    const link = page.getByRole("link", { name: `Open event: ${title}`, exact: true });
    await expect(cards.filter({ has: link }).getByText(label, { exact: true })).toBeVisible();
    await link.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(label, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (id === reviewedDates[0].id) {
      await page.screenshot({ path: test.info().outputPath("reviewed-date-labels.png") });
    }
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
  }
});
