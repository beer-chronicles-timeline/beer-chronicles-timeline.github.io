import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve("out");
const mime = { ".html": "text/html", ".txt": "text/plain", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".wasm": "application/wasm" };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const base = resolve(root, "." + pathname);
    if (base !== root && !base.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    // Match Pages extensionless HTML before Next's same-named RSC directories.
    for (const candidate of [`${base}.html`, base, resolve(base, "index.html")]) {
      const info = await stat(candidate).catch(() => null);
      if (!info?.isFile()) continue;
      const body = await readFile(candidate);
      const gzip = process.env.PERFORMANCE_GZIP === "1" && request.headers["accept-encoding"]?.includes("gzip");
      response.writeHead(200, { "Content-Type": mime[extname(candidate)] ?? "application/octet-stream", "Cache-Control": "no-store", ...(gzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}) });
      response.end(request.method === "HEAD" ? undefined : gzip ? gzipSync(body) : body);
      return;
    }
    response.writeHead(404, { "Content-Type": "text/html" }).end(await readFile(resolve(root, "404.html")));
  } catch { response.writeHead(400).end("Invalid request"); }
}).listen(Number(process.argv[2] ?? 4173), "127.0.0.1");
