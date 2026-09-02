export type SourceCitation = {
  text: string[];
  urls: string[];
};

const sourceUrlRegex = /\b(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
const trailingUrlPunctuationRegex = /[.,;:!?]+$/;

function trimTrailingUrlPunctuation(candidate: string): string {
  let url = candidate.replace(trailingUrlPunctuationRegex, "");

  while (url.endsWith(")")) {
    const openingParentheses = [...url].filter(
      (character) => character === "("
    ).length;
    const closingParentheses = [...url].filter(
      (character) => character === ")"
    ).length;

    if (closingParentheses <= openingParentheses) {
      break;
    }

    url = url.slice(0, -1).replace(trailingUrlPunctuationRegex, "");
  }

  return url;
}

type LegacyStructuredSource = {
  title: string;
  url: string;
};

function parseLegacyStructuredSources(
  sources: string
): SourceCitation[] | null {
  if (!sources.startsWith("[")) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(sources);

    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      !parsed.every(
        (source): source is LegacyStructuredSource =>
          typeof source === "object" &&
          source !== null &&
          typeof (source as LegacyStructuredSource).title === "string" &&
          (source as LegacyStructuredSource).title.trim() !== "" &&
          typeof (source as LegacyStructuredSource).url === "string" &&
          (source as LegacyStructuredSource).url.trim() !== ""
      )
    ) {
      return null;
    }

    return parsed.map((source) => ({
      text: [source.title.trim()],
      urls: [source.url.trim()],
    }));
  } catch {
    return null;
  }
}

function parseSourceParagraph(paragraph: string): SourceCitation[] {
  const citations: SourceCitation[] = [];
  let current: SourceCitation = { text: [], urls: [] };

  const flush = () => {
    if (current.text.length > 0 || current.urls.length > 0) {
      citations.push(current);
    }

    current = { text: [], urls: [] };
  };

  paragraph
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const urls = [...line.matchAll(sourceUrlRegex)].map((match) =>
        trimTrailingUrlPunctuation(match[0])
      );
      const text = line.replace(sourceUrlRegex, "").trim();

      if (text && current.urls.length > 0) {
        flush();
      }

      if (text) {
        current.text.push(text);
      }

      current.urls.push(...urls);
    });

  flush();
  return citations;
}

export function parseSourceCitations(
  sources: string | null | undefined
): SourceCitation[] {
  const normalizedSources = (sources ?? "")
    .replaceAll("\r\n", "\n")
    .trim();
  const legacyStructuredSources =
    parseLegacyStructuredSources(normalizedSources);

  if (legacyStructuredSources) {
    return legacyStructuredSources;
  }

  const paragraphs = normalizedSources
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap(parseSourceParagraph);

  const citations: SourceCitation[] = [];

  paragraphs.forEach((paragraph) => {
    const previous = citations.at(-1);

    if (
      paragraph.text.length === 0 &&
      paragraph.urls.length > 0 &&
      previous &&
      previous.text.length > 0 &&
      previous.urls.length === 0
    ) {
      previous.urls.push(...paragraph.urls);
      return;
    }

    citations.push(paragraph);
  });

  return citations;
}

export function normalizeSourceUrl(url: string): string {
  return /^www\./i.test(url) ? `https://${url}` : url;
}

export function getSourceLinkLabel(url: string): string {
  try {
    const hostname = new URL(normalizeSourceUrl(url)).hostname.replace(
      /^www\./i,
      ""
    );

    return `View source on ${hostname}`;
  } catch {
    return "View source";
  }
}
