import ts from "typescript";
import { execFileSync } from "node:child_process";
import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const mapDataNames = new Set(["MAP_PLACES", "MAP_LOCATION_ASSIGNMENTS"]);
const printer = ts.createPrinter({ removeComments: true });

function isLiteral(node) {
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node) ||
      [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(node.kind)) return true;
  if (ts.isPrefixUnaryExpression(node)) return [ts.SyntaxKind.MinusToken, ts.SyntaxKind.PlusToken].includes(node.operator) && ts.isNumericLiteral(node.operand);
  if (ts.isArrayLiteralExpression(node)) return node.elements.every(isLiteral);
  if (ts.isObjectLiteralExpression(node)) return node.properties.every(property =>
    ts.isPropertyAssignment(property) &&
    (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) || ts.isNumericLiteral(property.name)) &&
    isLiteral(property.initializer));
  return false;
}

// Remove only literal data, preserving imports, types, functions, and wrappers.
// A change to map code or a callable initializer must take the full path.
function mapCode(source) {
  const file = ts.createSourceFile("mapLocations.ts", source, ts.ScriptTarget.Latest, true);
  if (file.parseDiagnostics.length) return null;
  const ranges = [];
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement) || !(statement.declarationList.flags & ts.NodeFlags.Const)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !mapDataNames.has(declaration.name.text)) continue;
      let data = declaration.initializer;
      while (data && (ts.isSatisfiesExpression(data) || ts.isAsExpression(data) || ts.isParenthesizedExpression(data))) data = data.expression;
      if (!data || !isLiteral(data)) return null;
      ranges.push({ name: declaration.name.text, start: data.getStart(file), end: data.end });
    }
  }
  if (ranges.length !== 2 || new Set(ranges.map(range => range.name)).size !== 2) return null;
  for (const range of ranges.sort((a, b) => b.start - a.start)) source = source.slice(0, range.start) + "__ENTRY_DATA__" + source.slice(range.end);
  return printer.printFile(ts.createSourceFile("mapLocations.ts", source, ts.ScriptTarget.Latest, true));
}

export function classifyChanges(changes) {
  for (const { path, before, after } of changes) {
    if (path === "src/lib/mapLocations.ts") {
      const previous = before == null ? null : mapCode(before);
      if (previous === null || after == null || previous !== mapCode(after)) return { fullChecks: true, reason: "Map implementation changed" };
    } else if (path === "src/data/published-event-paths.json") {
      try {
        for (const text of [before, after]) {
          const data = JSON.parse(text);
          if (!data || Array.isArray(data) || typeof data !== "object" ||
              !Object.entries(data).every(([id, paths]) => /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(id) && Array.isArray(paths) && paths.length > 0 && paths.every(path => typeof path === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)))) throw new Error("Invalid registry");
        }
      } catch { return { fullChecks: true, reason: "Event path registry is unavailable or invalid" }; }
    } else if (!/^(?:AGENTS\.md|README\.md|docs\/.*\.md|\.agents\/skills\/.*\.(?:md|yaml|yml|py))$/.test(path)) {
      return { fullChecks: true, reason: `Application or configuration change: ${path}` };
    }
  }
  return { fullChecks: false, reason: "Only entry data or documentation changed since the published release" };
}

export async function classifyRepository({ cwd = process.cwd(), event = process.env.GITHUB_EVENT_NAME, forceFull = process.env.FORCE_FULL_CHECKS === "true", fetchPublication = async () => {
  const response = await fetch("https://beer-chronicles.org/publication-status.json", { redirect: "error", signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Publication marker HTTP ${response.status}`);
  return response.json();
} } = {}) {
  if (forceFull || event === "schedule") return { fullChecks: true, reason: "Full checks requested" };
  const git = args => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  try {
    if (git(["status", "--porcelain", "--untracked-files=no"]).trim()) return { fullChecks: true, reason: "Tracked working files differ from the release commit" };
    const publication = await fetchPublication();
    if (publication.mode !== "live" || !/^[a-f0-9]{40}$/.test(publication.commit)) throw new Error("Invalid publication marker");
    git(["merge-base", "--is-ancestor", publication.commit, "HEAD"]);
    const paths = git(["diff", "--name-only", "--no-renames", "-z", publication.commit, "HEAD"]).split("\0").filter(Boolean);
    const content = (ref, path) => { try { return git(["show", `${ref}:${path}`]); } catch { return null; } };
    return { ...classifyChanges(paths.map(path => ({ path, before: content(publication.commit, path), after: content("HEAD", path) }))), publishedCommit: publication.commit };
  } catch {
    return { fullChecks: true, reason: "Published release could not be compared; using full checks" };
  }
}

async function main() {
  const result = await classifyRepository();
  console.log(JSON.stringify(result));
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `full_checks=${result.fullChecks}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `Release checks: **${result.fullChecks ? "full" : "entry"}**. ${result.reason}.\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error); process.exitCode = 1; });
