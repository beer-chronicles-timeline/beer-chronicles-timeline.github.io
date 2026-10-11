// A small, dependency-free tokenizer for the published HTML/XML audit. It skips
// comments and raw-text elements so Next.js scripts cannot create phantom links.
const entities: Record<string, string> = {
  amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ",
  colon: ":", sol: "/", num: "#", quest: "?", equals: "=", percnt: "%",
  period: ".", comma: ",", semi: ";", lpar: "(", rpar: ")", plus: "+",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (original, entity: string) => {
    if (!entity.startsWith("#")) return entities[entity] ?? entities[entity.toLowerCase()] ?? original;
    const code = entity[1].toLowerCase() === "x"
      ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
      ? String.fromCodePoint(code) : "\uFFFD";
  });
}

export type HtmlAuditData = {
  hrefs: string[];
  ids: Set<string>;
  title: string;
  heading: string;
  baseHref: string | null;
  publicationId: string | null;
  hasCloudflareEmailDecoder: boolean;
};

// Match the decoder actually injected into the published HTML. This only
// classifies the target scheme; it never sends mail or executes client code.
export function decodeCloudflareEmail(url: URL): string | null {
  if (url.pathname !== "/cdn-cgi/l/email-protection" || !/^#(?:[\da-f]{2}){2,}$/i.test(url.hash)) return null;
  const bytes = Buffer.from(url.hash.slice(1), "hex");
  const decoded = new TextDecoder().decode(bytes.subarray(1).map((byte) => byte ^ bytes[0]));
  return decoded.split("?")[0].includes("@") && !/[\r\n\0]/.test(decoded) ? `mailto:${decoded}` : null;
}

export function parseAuditHtml(html: string): HtmlAuditData {
  const data: HtmlAuditData = {
    hrefs: [], ids: new Set(), title: "", heading: "",
    baseHref: null, publicationId: null, hasCloudflareEmailDecoder: false,
  };
  const clean = html.replace(/<!--[\s\S]*?(?:-->|$)/g, "")
    .replace(/<(script|style|textarea)\b((?:[^>"']|"[^"]*"|'[^']*')*)>[\s\S]*?(?:<\/\1\s*>|$)/gi,
      (_match, name: string, attributes: string) => `<${name}${attributes}>`);
  const text = (tag: string) => decodeEntities(
    clean.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}\\s*>`, "i"))?.[1]
      .replace(/<[^>]*>/g, " ") ?? ""
  ).replace(/\s+/g, " ").trim();
  data.title = text("title");
  data.heading = text("h1");
  // Title text can itself contain angle brackets; it is not markup.
  const markup = clean.replace(/(<title\b[^>]*>)[\s\S]*?<\/title\s*>/gi, "$1");
  const tags = /<([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  for (const tag of markup.matchAll(tags)) {
    const name = tag[1].toLowerCase();
    const attributes: Record<string, string> = {};
    const attributePattern = /([^\s=\/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    for (const attribute of tag[2].matchAll(attributePattern)) {
      const key = attribute[1].toLowerCase();
      if (!(key in attributes)) attributes[key] = decodeEntities(attribute[2] ?? attribute[3] ?? attribute[4] ?? "");
    }
    if (attributes.id) data.ids.add(attributes.id);
    if (name === "a" && attributes.name) data.ids.add(attributes.name);
    if ((name === "a" || name === "area") && "href" in attributes) data.hrefs.push(attributes.href);
    if (name === "base" && "href" in attributes && data.baseHref === null) data.baseHref = attributes.href;
    if (name === "meta" && attributes.name === "bc-publication") data.publicationId = attributes.content ?? null;
    if (name === "script" && /\/cloudflare-static\/email-decode\.min\.js(?:[?#]|$)/.test(attributes.src ?? "")) data.hasCloudflareEmailDecoder = true;
  }
  return data;
}

export function parseSitemap(xml: string): { index: boolean; urls: string[] } {
  const clean = xml.replace(/<!--[\s\S]*?-->/g, "");
  if (!/<(?:[\w-]+:)?(?:urlset|sitemapindex)\b/i.test(clean)) throw new Error("Response is not a sitemap.");
  const urls = [...clean.matchAll(/<(?:[\w-]+:)?loc\b[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?loc\s*>/gi)]
    .map((match) => decodeEntities(match[1].replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").trim()));
  if (!urls.length) throw new Error("Sitemap contains no URLs.");
  return { index: /<(?:[\w-]+:)?sitemapindex\b/i.test(clean), urls };
}
