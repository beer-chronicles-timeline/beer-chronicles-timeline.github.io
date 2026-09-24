export const PUBLIC_ORIGIN = "https://beer-chronicles.org";

export function pageIdentity(html) {
  return {
    publicationId: html.match(/<meta\b[^>]*name="bc-publication"[^>]*content="([^"]+)"/)?.[1],
    canonical: html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
    heading: html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(),
  };
}

export function assertPublication(expected, actual) {
  for (const key of ["commit", "mode", "eventCount", "generatedAt"]) {
    if (actual?.[key] !== expected[key]) throw new Error(`Publication ${key}: expected ${expected[key]}, observed ${actual?.[key]}`);
  }
}

export function assertRoute(route, html) {
  const actual = pageIdentity(html);
  if (actual.publicationId !== route.publicationId) throw new Error(`${route.path}: expected publication ${route.publicationId}, observed ${actual.publicationId}`);
  if (actual.canonical !== route.canonical || actual.heading !== route.heading) {
    throw new Error(`${route.path}: expected canonical ${route.canonical} and H1 ${route.heading}; observed ${actual.canonical} / ${actual.heading}`);
  }
  if (route.continueTo && !html.includes(`href="${route.continueTo}"`)) throw new Error(`${route.path}: missing continuation link to ${route.continueTo}`);
}

export async function verifyRelease(manifest, { fetchPage = fetch, attempts = 6, delayMs = 10_000, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  const expected = manifest.publication;
  if (manifest.schemaVersion !== 1 || expected?.mode !== "live" || !/^[a-f0-9]{40}$/.test(expected.commit) || !expected.generatedAt || !(expected.eventCount > 0) || !manifest.routes?.length) throw new Error("Invalid expected live release manifest");
  for (const route of manifest.routes) {
    if (route.publicationId !== `${expected.commit}:${expected.generatedAt}`) throw new Error("Route manifest belongs to a different publication");
    if (!route.path.startsWith("/") || route.path.startsWith("//") || (!route.canonical.startsWith(PUBLIC_ORIGIN + "/") && route.canonical !== PUBLIC_ORIGIN) || !route.heading) throw new Error("Invalid expected route identity");
  }
  const get = async (path) => fetchPage(`${PUBLIC_ORIGIN}${path}?release-check=${Date.now()}`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
  const status = async () => {
    const response = await get("/publication-status.json");
    if (!response.ok) throw new Error(`Publication marker: HTTP ${response.status}`);
    assertPublication(expected, await response.json());
  };
  let failure;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      await status();
      for (const route of manifest.routes) {
        const response = await get(route.path);
        if (!response.ok) throw new Error(`${route.path}: HTTP ${response.status}`);
        assertRoute(route, await response.text());
      }
      // Detect a release switch while inspecting the routes.
      await status();
      return;
    } catch (error) {
      failure = error;
      if (attempt + 1 < attempts) await sleep(delayMs);
    }
  }
  throw new Error(`Release ${expected.commit} (${expected.generatedAt}) was not verified after ${attempts} attempts: ${failure?.message}`);
}
