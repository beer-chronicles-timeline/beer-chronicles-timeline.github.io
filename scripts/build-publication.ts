import { prepareReleaseManifest } from "./prepare-release-manifest";
import { spawnSync } from "node:child_process";
import { preparePublication } from "./prepare-publication";
import { checkPublicationExport } from "./check-publication-export";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function exportSize(directory: string): Promise<{ files: number; bytes: number }> {
  let files = 0, bytes = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      const child = await exportSize(path);
      files += child.files; bytes += child.bytes;
    } else if (entry.isFile()) {
      files++; bytes += (await stat(path)).size;
    }
  }
  return { files, bytes };
}

async function main() {
  const started = Date.now();
  await preparePublication(process.argv.slice(2));
  const prepared = Date.now();
  const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit" });
  const built = Date.now();
  if (result.status !== 0) throw new Error(`Next build failed (${result.status ?? result.signal})`);
  await checkPublicationExport();
  await prepareReleaseManifest();
  const publication = JSON.parse(await readFile("out/publication-status.json", "utf8"));
  await mkdir("artifacts/performance", { recursive: true });
  await writeFile("artifacts/performance/build.json", JSON.stringify({
    ...publication, nodeVersion: process.version,
    preparationMs: prepared - started, nextBuildMs: built - prepared,
    export: await exportSize("out"),
  }, null, 2) + "\n");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
