import { getResearchChallenge, type ResearchChallenge } from "./researchChallenges";

export const CORRECTION_SUBMISSION_TYPE = "Correction / additional source";
export const SOURCE_SUBMISSION_TYPE = "Additional source";
export const CHALLENGE_SUBMISSION_TYPE = "Research challenge finding";

export type SubmissionType = "entry" | "correction" | "source" | "challenge";

export type SubmissionContext =
  | { type: "entry" }
  | { type: "correction" | "source"; eventTitle: string; eventUrl: string }
  | { type: "challenge"; challenge: ResearchChallenge | null };

export type SubmissionFields = {
  name: string;
  email: string;
  title: string;
  description: string;
  eventDate: string;
  datePrecision: string;
  dateUncertainty: string;
  sources: string;
  eventUrl?: string;
};

function isCanonicalEventUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.origin === "https://beer-chronicles.org" &&
      url.pathname.startsWith("/events/")
    );
  } catch {
    return false;
  }
}

export function getSubmissionContext(search: string): SubmissionContext {
  const params = new URLSearchParams(search);

  if (params.get("submissionType") === "challenge") {
    const challenge = getResearchChallenge(params.get("challengeId")?.trim() ?? "");

    return { type: "challenge", challenge };
  }

  const type = params.get("submissionType");
  if (type === "correction" || type === "source") {
    const eventTitle = params.get("eventTitle")?.trim() ?? "";
    const eventUrl = params.get("eventUrl")?.trim() ?? "";

    return {
      type,
      eventTitle,
      eventUrl: isCanonicalEventUrl(eventUrl) ? eventUrl : "",
    };
  }

  return { type: "entry" };
}

export function selectSubmissionType(
  current: SubmissionContext,
  type: SubmissionType
): SubmissionContext {
  if (type === "challenge") {
    return current.type === "challenge"
      ? current
      : { type: "challenge", challenge: null };
  }

  if (type === "correction" || type === "source") {
    const hasEntry = current.type === "correction" || current.type === "source";
    return {
      type,
      eventTitle: hasEntry ? current.eventTitle : "",
      eventUrl: hasEntry ? current.eventUrl : "",
    };
  }

  return { type: "entry" };
}

export function getSubmissionRequirements(context: SubmissionContext) {
  return {
    date: context.type === "entry",
    sources: context.type !== "correction",
  };
}

export function buildSubmissionPayload(
  context: SubmissionContext,
  fields: SubmissionFields
) {
  const { eventUrl: enteredEventUrl, ...contribution } = fields;

  if (context.type === "challenge") {
    if (!context.challenge) {
      throw new Error("Please choose an open research challenge.");
    }

    return {
      ...contribution,
      submissionType: CHALLENGE_SUBMISSION_TYPE,
      challengeId: context.challenge.id,
      challengeTitle: context.challenge.title,
      challengeQuestion: context.challenge.question,
      challengeUrl: `https://beer-chronicles.org/challenges#${context.challenge.id}`,
      _subject: `Beer History Research Finding from ${fields.name}: ${context.challenge.title}`,
    };
  }

  if (context.type === "correction" || context.type === "source") {
    const eventUrl = (enteredEventUrl ?? context.eventUrl).trim();
    if (eventUrl && !isCanonicalEventUrl(eventUrl)) {
      throw new Error("Please use a Beer Chronicles entry URL, or leave the entry link blank and identify the entry in its title.");
    }

    return {
      ...contribution,
      submissionType: context.type === "source"
        ? SOURCE_SUBMISSION_TYPE
        : CORRECTION_SUBMISSION_TYPE,
      eventUrl,
      _subject: context.type === "source"
        ? `Beer History Additional Source from ${fields.name}`
        : `Beer History Correction Suggestion from ${fields.name}`,
    };
  }

  return {
    ...contribution,
    _subject: `New Beer History Entry Submission from ${fields.name}`,
  };
}
