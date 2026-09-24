// Public HTTP checks only; no backend credentials, reads or writes.
const origin = "https://beer-chronicles.org";
const routes = [
  "/", "/map", "/histogram", "/storylines", "/submit",
  "/events/0a5a3946-30db-4a61-8d4d-bc36cbda6a7b/hofbrauhaus-sells-its-first-einbeck-style-beer",
  "/events/3df5535f-0f59-463a-8e3e-ff80ec998e3a/schwechat-brewery-becomes-a-major-industrial-lager-brewery",
  "/events/1c650d85-7d10-4e17-a7af-76a7a8c4556e/balling-invents-the-saccharimeter",
];
for (const path of routes) {
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${origin}${path}?release-check=${Date.now()}`, { signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      const html = await response.text();
      if (!html.includes("<h1") && path !== "/") throw new Error(`${path}: missing page heading`);
      const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
      if (!canonical || new URL(canonical).origin !== origin) throw new Error(`${path}: missing or foreign canonical`);
      if (path.startsWith("/events/")) {
        const destination = await fetch(canonical, { signal: AbortSignal.timeout(20_000) });
        if (!destination.ok) throw new Error(`${path}: canonical target HTTP ${destination.status}`);
      }
      failure = undefined;
      break;
    } catch (error) { failure = error; if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 10_000)); }
  }
  if (failure) throw failure;
  console.log(`PASS ${path}`);
}
