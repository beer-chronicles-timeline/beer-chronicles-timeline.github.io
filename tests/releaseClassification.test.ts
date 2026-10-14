import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { classifyChanges, classifyRepository } from "../scripts/classify-release.mjs";

const map = `import { getEventPath } from "./eventUrls";
const MAP_PLACES = { city: { latitude: 1, longitude: -2, name: "City" } } satisfies Record<string, MapPlace>;
const MAP_LOCATION_ASSIGNMENTS = [{ eventId: "first", placeId: "city" }];
export function buildMapLocations() { return MAP_LOCATION_ASSIGNMENTS; }`;
const changedMap = map.replace('latitude: 1', 'latitude: 3').replace('eventId: "first"', 'eventId: "second"');
const id = "59bb2f61-3619-4458-8298-21c2a0262369";

test("literal map and URL data plus skill documentation use entry checks", () => {
  assert.equal(classifyChanges([
    { path: "src/lib/mapLocations.ts", before: map, after: changedMap },
    { path: "src/data/published-event-paths.json", before: "{}", after: JSON.stringify({ [id]: ["new-entry"] }) },
    { path: ".agents/skills/beer-entry/SKILL.md", before: "old", after: "new" },
  ]).fullChecks, false);
});

test("map function, import, type, and executable initializer changes require full checks", () => {
  for (const after of [
    map.replace('return MAP_LOCATION_ASSIGNMENTS', 'return []'),
    map.replace('./eventUrls', './other'),
    map.replace('Record<string, MapPlace>', 'Record<string, Other>'),
    map.replace('latitude: 1', 'latitude: getLatitude()'),
    map.replace('{ city:', '{ ...otherPlaces, city:'),
    map.replace('eventId: "first"', 'get eventId() { return "first"; }'),
  ]) assert.equal(classifyChanges([{ path: "src/lib/mapLocations.ts", before: map, after }]).fullChecks, true);
});

test("application/configuration changes, missing map data and invalid registries default to full checks", () => {
  for (const path of ["src/components/BeerMap.tsx", "package.json", ".github/workflows/deploy.yml", "scripts/classify-release.mjs", "tests/mapPlaceGroups.test.ts"]) {
    assert.equal(classifyChanges([{ path, before: "old", after: "new" }]).fullChecks, true);
  }
  assert.equal(classifyChanges([{ path: "src/lib/mapLocations.ts", before: null, after: map }]).fullChecks, true);
  for (const after of [null, "invalid", "[]", "null", JSON.stringify({ [id]: ["../unsafe"] })]) {
    assert.equal(classifyChanges([{ path: "src/data/published-event-paths.json", before: "{}", after }]).fullChecks, true);
  }
});

test("comparison includes earlier unpublished application changes, not only the latest push", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "beer-release-classification-"));
  const git = (...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  try {
    git("init", "-q");
    git("config", "user.email", "test@example.org");
    git("config", "user.name", "Release test");
    await mkdir(join(cwd, "src/lib"), { recursive: true });
    await writeFile(join(cwd, "src/lib/mapLocations.ts"), map);
    await writeFile(join(cwd, "src/lib/application.ts"), "export const ready = true;\n");
    git("add", "."); git("commit", "-qm", "Published application");
    const published = git("rev-parse", "HEAD");
    await writeFile(join(cwd, "src/lib/application.ts"), "export const ready = false;\n");
    git("add", "."); git("commit", "-qm", "Unpublished application change");
    const application = git("rev-parse", "HEAD");
    await writeFile(join(cwd, "src/lib/mapLocations.ts"), changedMap);
    git("add", "."); git("commit", "-qm", "Entry assignment");
    assert.equal((await classifyRepository({ cwd, fetchPublication: async () => ({ mode: "live", commit: published }) })).fullChecks, true);
    assert.equal((await classifyRepository({ cwd, fetchPublication: async () => ({ mode: "live", commit: application }) })).fullChecks, false);
    assert.equal((await classifyRepository({ cwd, fetchPublication: async () => ({ mode: "live", commit: git("rev-parse", "HEAD") }) })).fullChecks, false);
    assert.equal((await classifyRepository({ cwd, fetchPublication: async () => ({ mode: "live", commit: "a".repeat(40) }) })).fullChecks, true);
    await writeFile(join(cwd, "src/lib/mapLocations.ts"), changedMap + "\n// Uncommitted work\n");
    assert.equal((await classifyRepository({ cwd, fetchPublication: async () => ({ mode: "live", commit: git("rev-parse", "HEAD") }) })).fullChecks, true);
  } finally { await rm(cwd, { recursive: true, force: true }); }
});

test("unavailable publication and an explicit full-check request are conservative", async () => {
  assert.equal((await classifyRepository({ fetchPublication: async () => { throw new Error("offline"); } })).fullChecks, true);
  let fetched = false;
  assert.equal((await classifyRepository({ forceFull: true, fetchPublication: async () => { fetched = true; throw new Error("must not fetch"); } })).fullChecks, true);
  assert.equal(fetched, false);
});
