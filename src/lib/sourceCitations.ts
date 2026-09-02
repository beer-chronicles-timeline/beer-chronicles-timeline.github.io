export type SourceCitation = {
  text: string[];
  urls: string[];
};

const sourceUrlRegex = /\b(?:https?:\/\/[^\s<>)]+|www\.[^\s<>)]+)/gi;

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
      const urls = [...line.matchAll(sourceUrlRegex)].map(
        (match) => match[0]
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
  const paragraphs = (sources ?? "")
    .replaceAll("\r\n", "\n")
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
