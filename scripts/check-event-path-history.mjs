import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const file = "src/data/published-event-paths.json";
const current = JSON.parse(readFileSync(file, "utf8"));
const base = process.argv[2];
if (!base || !/^[a-f0-9]{40}$/.test(base)) throw new Error("Pass the base commit SHA to check route history");
// The initial introduction has no registry to compare. A missing base commit,
// however, is an error: CI must fetch history rather than silently skip checks.
execFileSync("git", ["cat-file", "-e", `${base}^{commit}`]);
const files = execFileSync("git", ["ls-tree", "--name-only", base, "--", file], { encoding: "utf8" });
if (files.trim()) {
  const previous = JSON.parse(execFileSync("git", ["show", `${base}:${file}`], { encoding: "utf8" }));
  for (const [id, slugs] of Object.entries(previous)) {
    for (const slug of slugs) {
      if (!current[id]?.includes(slug)) throw new Error(`Published URL removed: /events/${id}/${slug}`);
    }
  }
}
for (const [id, slugs] of Object.entries(current)) {
  if (!/^[a-zA-Z0-9-]+$/.test(id) || !Array.isArray(slugs) || !slugs.length || new Set(slugs).size !== slugs.length || slugs.some((slug) => typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) throw new Error(`Invalid route registry record: ${id}`);
}
console.log("Published URL registry is valid and preserves the base revision's paths.");
