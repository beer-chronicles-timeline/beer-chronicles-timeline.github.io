import { copyFile, mkdir, readFile } from "node:fs/promises";

const packageRoot = new URL("../node_modules/maplibre-gl/", import.meta.url);
const { version } = JSON.parse(await readFile(new URL("package.json", packageRoot)));
const target = new URL(`../public/maplibre/${version}/`, import.meta.url);
await mkdir(target, { recursive: true });
for (const filename of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  await copyFile(new URL(`dist/${filename}`, packageRoot), new URL(filename, target));
}
await copyFile(new URL("LICENSE.txt", packageRoot), new URL("LICENSE.txt", target));
console.log(`Prepared MapLibre ${version} module worker and shared dependency.`);
