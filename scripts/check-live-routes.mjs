// Public HTTP only. The expected manifest must come from this workflow's build.
import { readFile } from "node:fs/promises";
import { verifyRelease } from "./release-verification.mjs";

const manifest = JSON.parse(await readFile(process.argv[2] ?? ".cache/release-manifest.json", "utf8"));
if (process.env.GITHUB_SHA && manifest.publication.commit !== process.env.GITHUB_SHA) throw new Error("Expected release manifest belongs to a different commit");
await verifyRelease(manifest);
console.log(`Verified release ${manifest.publication.commit}: ${manifest.routes.length} route identities and publication marker.`);
