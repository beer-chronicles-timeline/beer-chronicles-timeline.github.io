// lib/storylines.ts

export type StorylineSectionId =
  | "foundations"
  | "styles-and-traditions"
  | "brewing-and-technology"
  | "industry-and-culture"
  | "modern-beer";

export type StorylineSection = {
  id: StorylineSectionId;
  title: string;
  description: string;
};

export type Storyline = {
  slug: string;
  sectionId: StorylineSectionId;
  title: string;
  description: string;
  tagNames: string[];
  tagMode?: "all" | "any";
  fromYear?: number;
  toYear?: number;
  featuredEventId: string;
};

export const STORYLINE_SECTIONS: StorylineSection[] = [
  {
    id: "foundations",
    title: "Foundations of Beer History",
    description:
      "The ingredients, discoveries, regulations, and early societies that shaped brewing across thousands of years.",
  },
  {
    id: "styles-and-traditions",
    title: "Beer Styles and Regional Traditions",
    description:
      "Distinctive beer families and local brewing cultures traced through their origins, transformations, and revivals.",
  },
  {
    id: "brewing-and-technology",
    title: "Brewing, Science, and Technology",
    description:
      "How measurement, microbiology, equipment, containers, and service systems changed the production and experience of beer.",
  },
  {
    id: "industry-and-culture",
    title: "Beer, Industry, and Public Culture",
    description:
      "The breweries, markets, laws, conflicts, identities, and public rituals that connected beer to wider society.",
  },
  {
    id: "modern-beer",
    title: "Modern and Contemporary Beer",
    description:
      "The movements, breweries, styles, and communities that have reshaped beer since the late twentieth century.",
  },
];

export const STORYLINES: Storyline[] = [
  {
    slug: "early-beer-history",
    sectionId: "foundations",
    title: "Early Beer History",
    description:
      "Follow brewing from prehistoric fermentation and ancient production sites to the written, administrative, and legal beer cultures of the ancient world.",
    tagNames: ["Early Beer History"],
    featuredEventId: "7b9ed8c2-2db7-4ad8-a067-9cc37d748e4b",
  },
  {
    slug: "hops",
    sectionId: "foundations",
    title: "Hops",
    description:
      "Trace how hops developed from a regional brewing ingredient into a foundation of preservation, trade, agricultural science, and modern beer aroma.",
    tagNames: ["Hops"],
    featuredEventId: "9d9bd659-d8bd-4990-950c-c4d83352e542",
  },
  {
    slug: "malt",
    sectionId: "foundations",
    title: "Malt",
    description:
      "Explore the changing techniques of malting, kilning, roasting, and grain selection that made new beer colors and styles possible.",
    tagNames: ["Malt"],
    featuredEventId: "d9d4cd53-f213-49c2-9a41-ecc0892ff8a7",
  },
  {
    slug: "yeast",
    sectionId: "foundations",
    title: "Yeast",
    description:
      "Follow the transformation of yeast from an invisible brewing agent into a cultivated microorganism central to modern brewing science.",
    tagNames: ["Yeast"],
    featuredEventId: "7d0c6cf2-7e19-4b83-bd52-6a5f273c8f1a",
  },
  {
    slug: "water",
    sectionId: "foundations",
    title: "Water",
    description:
      "See how local water chemistry, mineral adjustment, and scientific measurement helped define brewing centers and beer styles.",
    tagNames: ["Water"],
    featuredEventId: "3c8e5fb2-c25a-44dd-8bf3-b732189346c7",
  },
  {
    slug: "beer-laws-and-regulation",
    sectionId: "foundations",
    title: "Beer Laws and Regulation",
    description:
      "Explore the rules governing ingredients, prices, production, taxation, licensing, geographical identity, and access to brewing.",
    tagNames: ["Laws"],
    featuredEventId: "fc252325-4204-4381-b718-234fa91110dc",
  },

  {
    slug: "india-pale-ale",
    sectionId: "styles-and-traditions",
    title: "India Pale Ale",
    description:
      "Follow IPA from British export brewing and imperial trade through decline, American reinvention, and today’s diverse hop-driven interpretations.",
    tagNames: ["IPA"],
    featuredEventId: "1a6d26a3-0dc8-4b35-8e3d-32d7d8dd5d44",
  },
  {
    slug: "porter-stout-and-guinness",
    sectionId: "styles-and-traditions",
    title: "Porter, Stout, and Guinness",
    description:
      "Trace dark beer from London porter and industrial vat brewing to Guinness, imperial stout, nitrogen dispense, and modern craft reinterpretations.",
    tagNames: [
      "Porter",
      "Stout",
      "Guinness",
      "Imperial Stout",
      "Russian Imperial Stout",
    ],
    tagMode: "any",
    featuredEventId: "85ecfcf2-777b-433b-a089-c55366ff5061",
  },
  {
    slug: "british-ale-beyond-ipa",
    sectionId: "styles-and-traditions",
    title: "British Ale Beyond IPA",
    description:
      "Explore pale ale, mild, bitter, ESB, cask conditioning, and the pub traditions that shaped everyday British beer beyond export IPA.",
    tagNames: ["Bitter", "Mild", "Pale Ale", "Cask Beer"],
    tagMode: "any",
    featuredEventId: "7f774669-e8ba-42fe-a311-0457064be198",
  },
  {
    slug: "wheat-beer",
    sectionId: "styles-and-traditions",
    title: "Wheat Beer",
    description:
      "Follow wheat beer from ancient brewing and aristocratic privilege to Bavarian Weizen, Belgian witbier, and modern international interpretations.",
    tagNames: ["Wheat Beer"],
    featuredEventId: "65fc06c9-7499-4a3b-8c30-d0d761b95317",
  },
  {
    slug: "smoked-beer",
    sectionId: "styles-and-traditions",
    title: "Smoked Beer and Bamberg",
    description:
      "Discover how smoke-free kilning transformed brewing while Bamberg’s Schlenkerla and Spezial preserved a distinctive Rauchbier tradition.",
    tagNames: ["Smoked Beer"],
    featuredEventId: "64bc94a8-09c7-4551-9340-ce92eadbb26f",
  },
  {
    slug: "sour-beer-lambic-and-gueuze",
    sectionId: "styles-and-traditions",
    title: "Sour Beer, Lambic, and Gueuze",
    description:
      "Trace spontaneous fermentation, blending, regional protection, brewery survival, and the modern renewal of historic sour-beer traditions.",
    tagNames: ["Sour Beer", "Lambic", "Gueuze"],
    tagMode: "any",
    featuredEventId: "da934d5a-27d7-49ed-b6c0-542e15329775",
  },
  {
    slug: "gose",
    sectionId: "styles-and-traditions",
    title: "Gose",
    description:
      "Follow Gose from Goslar and Leipzig through disappearance, fragmented survival, and its late twentieth-century revival.",
    tagNames: ["Gose"],
    featuredEventId: "a6d1b2e8-5c47-4f91-9d63-3e0a7b8c1245",
  },
  {
    slug: "koelsch-and-altbier",
    sectionId: "styles-and-traditions",
    title: "Kölsch and Altbier",
    description:
      "Explore the neighboring top-fermented traditions of Cologne and Düsseldorf, their breweries, serving cultures, and protected regional identities.",
    tagNames: ["Kölsch", "Altbier"],
    tagMode: "any",
    featuredEventId: "4a6aa2a8-7418-4cf7-8e6c-b96c6747fd60",
  },
  {
    slug: "broyhan",
    sectionId: "styles-and-traditions",
    title: "Broyhan",
    description:
      "Reconstruct the story of Hannover’s once-famous Broyhan, from its sixteenth-century creation and guild culture to extinction and revival.",
    tagNames: ["Broyhan"],
    featuredEventId: "4510a8cc-4699-437c-85a4-64226dd6ea22",
  },
  {
    slug: "czech-beer-beyond-pilsner",
    sectionId: "styles-and-traditions",
    title: "Czech Beer Beyond Pilsner",
    description:
      "Explore Czech brewing beyond the invention of pale lager through historic breweries, brewing science, dark lager, pub culture, and modern renewal.",
    tagNames: ["Czech Republic"],
    featuredEventId: "e9732758-c7e4-4e11-9770-853fcb6a5db5",
  },
  {
    slug: "belgian-beer-beyond-trappists-and-lambic",
    sectionId: "styles-and-traditions",
    title: "Belgian Beer Beyond Trappists and Lambic",
    description:
      "Discover saison, witbier, strong golden ale, Spéciale Belge, influential secular breweries, and Belgium’s wider culture of beer diversity.",
    tagNames: ["Belgium"],
    featuredEventId: "6c6135b8-b146-4c7e-a48c-d0834b1e20ea",
  },
  {
    slug: "italian-beer",
    sectionId: "styles-and-traditions",
    title: "Italian Beer",
    description:
      "Follow Italian brewing from national lager producers to the independent breweries, glasses, festivals, and styles of the modern craft movement.",
    tagNames: ["Italy"],
    featuredEventId: "af607e05-c072-4b9b-8b98-4d8d44c337da",
  },

  {
    slug: "measurement-and-quality-control",
    sectionId: "brewing-and-technology",
    title: "Measurement and Quality Control",
    description:
      "See how thermometers, saccharometers, microbiology, pH, laboratory methods, and shared standards made brewing more measurable and reproducible.",
    tagNames: ["Quality Control"],
    featuredEventId: "ec40e7b8-e6b9-4890-9f6c-c698d3182171",
  },
  {
    slug: "packaging-dispense-and-supply",
    sectionId: "brewing-and-technology",
    title: "Packaging, Dispense, and the Beer Supply Chain",
    description:
      "Trace the containers, closures, transport systems, refrigeration, and dispense technologies that changed how beer reaches the drinker.",
    tagNames: ["Packaging", "Dispense", "Containers"],
    tagMode: "any",
    featuredEventId: "e4488256-fca0-49f3-ba7b-f72864c8480e",
  },
  {
    slug: "barrel-aging-and-wood",
    sectionId: "brewing-and-technology",
    title: "Barrel Aging, Wood, and Beer Containers",
    description:
      "Follow wooden vats and transport casks from essential brewery infrastructure to deliberate tools for maturation, blending, and flavor.",
    tagNames: ["Barrel Aging", "Containers"],
    tagMode: "any",
    featuredEventId: "50bcce10-e987-45d5-af97-3bd08f31f498",
  },
  {
    slug: "glassware-and-service-culture",
    sectionId: "brewing-and-technology",
    title: "Beer Glassware and Service Culture",
    description:
      "Explore how drinking vessels, pub equipment, branded glassware, and regional serving rituals shaped the sensory and social experience of beer.",
    tagNames: ["Glassware", "Service Culture"],
    tagMode: "any",
    featuredEventId: "d221ed67-04a9-4cdb-8f55-65e47d2c8da0",
  },

  {
    slug: "women-in-beer-history",
    sectionId: "industry-and-culture",
    title: "Women in Beer History",
    description:
      "Recover the roles of women as brewers, tavern keepers, agricultural workers, entrepreneurs, scientists, and leaders across beer history.",
    tagNames: ["Women in Beer History"],
    featuredEventId: "4e43b51e-40f8-4464-9f28-ef856380d85c",
  },
  {
    slug: "beer-and-war",
    sectionId: "industry-and-culture",
    title: "Beer, War, Crisis, and Reconstruction",
    description:
      "Explore how breweries and beer traditions endured destruction, shortages, occupation, siege, political crisis, and postwar rebuilding.",
    tagNames: ["Beer and War"],
    featuredEventId: "e4cf71f5-d58f-48a0-9942-c2871e8b9f63",
  },
  {
    slug: "advertising-branding-and-consumer-culture",
    sectionId: "industry-and-culture",
    title: "Advertising, Branding, and Consumer Culture",
    description:
      "Trace how labels, trademarks, campaigns, packaging, sponsorship, and mass media transformed beer into a modern branded consumer product.",
    tagNames: ["Advertising", "Branding", "Consumer Culture"],
    tagMode: "any",
    featuredEventId: "f5f7dbe8-0e67-4a7d-9f90-fcc8e6cb0d3a",
  },
  {
    slug: "festivals-and-public-beer-culture",
    sectionId: "industry-and-culture",
    title: "Beer Festivals and Public Beer Culture",
    description:
      "Follow beer festivals from civic celebrations and mass brewery tents to consumer advocacy, craft gatherings, and international tasting culture.",
    tagNames: ["Festivals"],
    featuredEventId: "fa916d67-995d-4d95-ab0d-ea5630de9371",
  },
  {
    slug: "competitions-judging-and-style-taxonomy",
    sectionId: "industry-and-culture",
    title: "Competitions, Judging, and Style Taxonomy",
    description:
      "Explore how competitions, judging organizations, writers, and formal guidelines created shared ways to classify and evaluate beer.",
    tagNames: [
      "Competitions",
      "Judging",
      "Style Guidelines",
      "Style Taxonomy",
    ],
    tagMode: "any",
    featuredEventId: "46a0a69a-9dc8-4d55-b193-174092b37a2a",
  },

  {
    slug: "homebrewing",
    sectionId: "modern-beer",
    title: "Homebrewing",
    description:
      "Follow homebrewing from legal reform and influential books to competitions, online communities, digital tools, and professional brewery founders.",
    tagNames: ["Homebrewing"],
    featuredEventId: "58aff98d-8060-4ea4-9be8-077105ace486",
  },
  {
    slug: "modern-craft-beer",
    sectionId: "modern-beer",
    title: "Modern Craft Beer",
    description:
      "Trace the breweries, people, beers, festivals, and ideas that built the modern independent-beer movement across several generations.",
    tagNames: ["Modern Craft Beer"],
    featuredEventId: "1a6d26a3-0dc8-4b35-8e3d-32d7d8dd5d44",
  },
  {
    slug: "modern-craft-beers-second-generation",
    sectionId: "modern-beer",
    title: "Modern Craft Beer’s Second Generation",
    description:
      "Explore the breweries and styles that expanded craft beer after its pioneering era through stronger flavors, new business models, and international exchange.",
    tagNames: ["Modern Craft Beer"],
    fromYear: 2000,
    featuredEventId: "d221ed67-04a9-4cdb-8f55-65e47d2c8da0",
  },
  {
    slug: "non-alcoholic-beer",
    sectionId: "modern-beer",
    title: "Non-Alcoholic Beer",
    description:
      "Follow alcohol-free beer from prohibition-era substitutes to purpose-brewed products, sports marketing, dedicated breweries, and global 0.0% brands.",
    tagNames: ["Non-Alcoholic Beer"],
    featuredEventId: "1f97be5e-e9b6-4c5e-858f-71bfbcb20c38",
  },
  {
    slug: "smoothie-and-pastry-sours",
    sectionId: "modern-beer",
    title: "Smoothie and Pastry Sours",
    description:
      "Trace the rise of heavily fruited, dessert-inspired sour beer through influential breweries, named series, and international expansion.",
    tagNames: ["Smoothie and Pastry Sour"],
    featuredEventId: "1f4d72e5-57e1-4cd4-950c-94752d630e96",
  },
];

export function getStorylineHref(storyline: Storyline): string {
  const params = new URLSearchParams();

  params.set("tags", storyline.tagNames.join(","));

  if (
    storyline.tagMode === "any" &&
    storyline.tagNames.length > 1
  ) {
    params.set("tagMode", "any");
  }

  if (storyline.fromYear !== undefined) {
    params.set("from", storyline.fromYear.toString());
  }

  if (storyline.toYear !== undefined) {
    params.set("to", storyline.toYear.toString());
  }

  return `/?${params.toString()}`;
}

export function getStorylinesForSection(
  sectionId: StorylineSectionId
): Storyline[] {
  return STORYLINES.filter(
    (storyline) => storyline.sectionId === sectionId
  );
}