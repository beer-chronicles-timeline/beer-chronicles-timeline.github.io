import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

async function openFirstModal(page: Page) {
  await page.goto("/");
  await expect(page.locator("[data-timeline-ready=true]")).toBeVisible();
  const opener = page.getByRole("link", { name: /Open event:/ }).first();
  await opener.focus();
  await opener.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return { dialog, opener, originalUrl: page.url() };
}

test("@journey related-entry navigation preserves keyboard focus", async ({ page, browserName }) => {
  const { dialog, opener, originalUrl } = await openFirstModal(page);
  const title = dialog.locator("#timeline-modal-title");
  const originalTitle = await title.innerText();
  const related = dialog.getByRole("heading", { name: "Continue Exploring", exact: true })
    .locator("..").getByRole("button").first();
  const relatedText = await related.innerText();

  await related.focus();
  await related.press("Enter");
  await expect(title).not.toHaveText(originalTitle);
  expect(relatedText).toContain(await title.innerText());
  await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  await expect(page).toHaveURL(originalUrl);

  // Safari on macOS uses Option+Tab to include links in keyboard traversal.
  const tabKey = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  await page.keyboard.press(tabKey);
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("@journey modal tag links leave modified clicks to the browser", async ({ page }) => {
  const { dialog, originalUrl } = await openFirstModal(page);
  const title = await dialog.locator("#timeline-modal-title").innerText();
  const tag = dialog.locator('a[href^="/?tags="]').first();

  for (const modifier of ["ctrlKey", "metaKey", "shiftKey", "altKey"] as const) {
    const intercepted = await tag.evaluate((anchor, key) => {
      let preventedBeforeTarget: boolean | null = null;
      // Observe the capture handler, then prevent the native action ourselves
      // so all modifiers can be checked without platform-specific windows.
      anchor.addEventListener("click", (event) => {
        preventedBeforeTarget = event.defaultPrevented;
        event.preventDefault();
      }, { once: true });
      anchor.dispatchEvent(new MouseEvent("click", {
        bubbles: true, cancelable: true, button: 0, [key]: true,
      }));
      return preventedBeforeTarget;
    }, modifier);

    expect(intercepted, `${modifier} must retain its native link action`).toBe(false);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#timeline-modal-title")).toHaveText(title);
    await expect(page).toHaveURL(originalUrl);
  }
});

test("@journey modal tag links open a new tab without changing the current entry", async ({ page, context }) => {
  const { dialog, originalUrl } = await openFirstModal(page);
  const tag = dialog.locator('a[href^="/?tags="]').first();
  const destination = new URL((await tag.getAttribute("href"))!, originalUrl);
  const [popup] = await Promise.all([
    context.waitForEvent("page", { timeout: 5_000 }),
    tag.click({ modifiers: ["ControlOrMeta"] }),
  ]);
  try {
    await expect.poll(() => {
      const url = new URL(popup.url());
      return { origin: url.origin, path: url.pathname, tags: url.searchParams.get("tags") };
    }).toEqual({
      origin: destination.origin, path: destination.pathname, tags: destination.searchParams.get("tags"),
    });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(originalUrl);
  } finally {
    await popup.close();
  }
});
