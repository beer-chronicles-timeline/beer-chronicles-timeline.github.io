import { test, expect } from "./fixtures";

const homeCanonical = "https://beer-chronicles.org/";
const eventPath = "/events/fc252325-4204-4381-b718-234fa91110dc/the-bavarian-beer-regulation-of-1516-is-issued";
const storylinePath = "/storylines/yeast";
const homePaths = [
  "/",
  "/?tags=Carlsberg",
  "/?tags=Germany",
  "/?tags=Yeast",
  "/?tags=Modern%20Craft%20Beer",
  "/?from=2012&to=2016&string=Maisel+Friends",
  "/?category=Laws&from=1400&to=1900&tags=Yeast%2CCarlsberg&tagMode=any&string=beer&order=oldest&storyline=yeast",
];

test("static homepage HTML has one query-free canonical for every timeline state", async ({ request }) => {
  const homepage = await request.get("/");
  const homepageHtml = await homepage.text();

  for (const path of homePaths) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    expect(response.headers().location, path).toBeUndefined();
    const html = await response.text();
    expect(html, path).toBe(homepageHtml);
    const links = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/g) ?? [];
    expect(links, path).toHaveLength(1);
    expect(links[0], path).toContain(`href="${homeCanonical}"`);
    expect(html.split("</head>")[0], path).toContain(links[0]);
  }
});

for (const tag of ["Carlsberg", "Germany", "Yeast"]) {
  test(`homepage canonical preserves the ${tag} filter after hydration and reload`, async ({ page }) => {
    const path = `/?tags=${tag}`;
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    expect(response?.request().redirectedFrom()).toBeNull();
    for (let visit = 0; visit < 2; visit++) {
      if (visit) await page.reload();
      await expect(page.locator("[data-timeline-ready=true]")).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`\\/\\?tags=${tag}$`));
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", homeCanonical);
      await page.getByRole("button", { name: /^Tags/ }).click();
      await expect(page.getByRole("checkbox", { name: new RegExp(`^${tag} `) })).toBeChecked();
    }
  });
}

test("multi-filter URL restores dates and search without changing its canonical", async ({ page }) => {
  const response = await page.goto("/?from=2012&to=2016&string=Maisel+Friends");
  expect(response?.status()).toBe(200);
  expect(response?.request().redirectedFrom()).toBeNull();
  await expect(page.locator("[data-timeline-ready=true]")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Start year", exact: true })).toHaveValue("2012");
  await expect(page.getByRole("textbox", { name: "End year", exact: true })).toHaveValue("2016");
  await expect(page.getByRole("textbox", { name: "Search timeline" })).toHaveValue("Maisel Friends");
  await expect(page).toHaveURL(/\?from=2012&to=2016&string=Maisel\+Friends$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", homeCanonical);
});

for (const path of [eventPath, storylinePath, "/map", "/about", "/sources", "/editorial-principles"]) {
  test(`standalone canonical remains scoped to ${path}`, async ({ page, request }) => {
    const canonical = `https://beer-chronicles.org${path}`;
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    const html = await response.text();
    const links = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/g) ?? [];
    expect(links).toHaveLength(1);
    expect(links[0]).toContain(`href="${canonical}"`);
    expect(html.split("</head>")[0]).toContain(links[0]);
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", canonical);
  });
}

test("client navigation removes the homepage canonical on a Storyline and restores it on return", async ({ page }) => {
  await page.goto("/?tags=Yeast");
  await expect(page.locator("[data-timeline-ready=true]")).toBeVisible();
  await page.getByRole("link", { name: "Explore", exact: true }).click();
  await expect(page).toHaveURL(/\/storylines$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", "https://beer-chronicles.org/storylines");
  await page.locator(`a[href="${storylinePath}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`${storylinePath}$`));
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", `https://beer-chronicles.org${storylinePath}`);
  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(/\?tags=Yeast$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", homeCanonical);
});
