import type { Storyline } from "@/lib/storylines";
import {
  getStorylinePageTitle,
  getStorylineUrl,
} from "@/lib/storylines";

export default function StorylineStructuredData({
  storyline,
}: {
  storyline: Storyline;
}) {
  const canonicalUrl = getStorylineUrl(storyline);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: getStorylinePageTitle(storyline),
    description: storyline.description,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Beer Chronicles",
      url: "https://beer-chronicles.org",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
