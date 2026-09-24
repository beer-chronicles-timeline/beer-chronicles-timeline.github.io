import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ offlineGuard: void }>({
  offlineGuard: [async ({ context, baseURL }, use) => {
    const backendRequests: string[] = [];
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.hostname.endsWith(".supabase.co")) backendRequests.push(url.pathname);
      if (url.origin !== new URL(baseURL!).origin) return route.abort();
      return route.continue();
    });
    await use();
    expect(backendRequests, "Browser tests must never access Supabase").toEqual([]);
  }, { auto: true }],
});
export { expect };
