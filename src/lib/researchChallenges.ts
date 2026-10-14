import { getEventPath } from "./eventUrls";

export type ResearchChallenge = {
  id: string;
  title: string;
  question: string;
  context: string;
  backgroundHref: string;
  storylineHref?: string;
};

const hodgsonBackgroundHref = getEventPath(
  "5a96e1c4-5c53-40d7-b8d4-ffbcb9d91d52",
  "George Hodgson Establishes Pale Ale Exports to India"
);

export const RESEARCH_CHALLENGES: readonly ResearchChallenge[] = [
  {
    id: "schieffer-end-of-brewing",
    title: "Schieffer Brewery in Trier, Germany",
    question: "When did beer production at Schieffer Brewery in Trier end?",
    context:
      "We are looking for evidence of when brewing ceased at the brewery. Please explain whether your source dates the end of beer production, the closure of the business, or the closure of the taproom. A supported year or date range is also useful.",
    backgroundHref: getEventPath(
      "171dbe67-9d39-4fbf-a382-a839017ce276",
      "Brauerei Hans Schieffer Is Founded in Trier"
    ),
  },
  {
    id: "george-hodgson-birth-date",
    title: "George Hodgson’s Birth Date",
    question:
      "When was George Hodgson, the brewer associated with Bow Brewery, born?",
    context:
      "Please provide a source that supports the date and clearly identifies the correct person. A reliably supported year is welcome. If you find a baptism record, distinguish the baptism date from the birth date.",
    backgroundHref: hodgsonBackgroundHref,
    storylineHref: "/storylines/india-pale-ale",
  },
  {
    id: "george-hodgson-death-date",
    title: "George Hodgson’s Death Date",
    question:
      "When did George Hodgson, the brewer associated with Bow Brewery, die?",
    context:
      "Please provide a source that supports the date and clearly identifies the correct person. Distinguish the date of death from a burial date or the publication date of a death notice. A supported year or date range is also useful.",
    backgroundHref: hodgsonBackgroundHref,
    storylineHref: "/storylines/india-pale-ale",
  },
];

export function getResearchChallenge(id: string): ResearchChallenge | null {
  return RESEARCH_CHALLENGES.find((challenge) => challenge.id === id) ?? null;
}

export function getChallengeSubmissionPath(id: string): string {
  const params = new URLSearchParams({
    submissionType: "challenge",
    challengeId: id,
  });

  return `/submit?${params.toString()}`;
}
