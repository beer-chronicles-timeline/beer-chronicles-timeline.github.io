// app/submit/page.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import MainContentStart from "@/components/MainContentStart";
import Footer from "@/components/Footer";
import SubmissionEmailAlternative from "@/components/SubmissionEmailAlternative";
import { useHydrated } from "@/lib/useHydrated";
import { CONTACT_EMAIL } from "@/lib/contact";
import {
  buildSubmissionPayload,
  CHALLENGE_SUBMISSION_TYPE,
  getSubmissionContext,
  getSubmissionRequirements,
  selectSubmissionType,
  type SubmissionContext,
  type SubmissionType,
} from "@/lib/submissionContext";
import { getResearchChallenge, RESEARCH_CHALLENGES } from "@/lib/researchChallenges";

type DatePrecision = "date" | "month" | "year" | "decade" | "century";

const DATE_FIELD_CONFIG: Record<
  DatePrecision,
  {
    label: string;
    placeholder: string;
    helpText: string;
  }
> = {
  date: {
    label: "Exact date",
    placeholder: "e.g., April 23, 1516 or July 1, 449 BCE",
    helpText:
      "Include the day, month, and year only when all three are supported.",
  },
  month: {
    label: "Month and year",
    placeholder: "e.g., October 1990 or March 44 BCE",
    helpText:
      "Include the month and year when the exact day is not supported.",
  },
  year: {
    label: "Year",
    placeholder: "e.g., 1842 or 11000 BCE",
    helpText: "Include BCE or CE when needed.",
  },
  decade: {
    label: "Decade",
    placeholder: "e.g., 1990s or 11000s BCE",
    helpText: "Enter the decade as it should be understood historically.",
  },
  century: {
    label: "Century",
    placeholder: "e.g., 18th century or 110th century BCE",
    helpText: "Include BCE or CE when needed.",
  },
};

function subscribeToLocationSearch() {
  return () => {};
}

function FieldRequirement({ required }: { required: boolean }) {
  return (
    <span className="font-normal text-stone-500">
      {required ? "(required)" : "(optional)"}
    </span>
  );
}

export default function SubmitPage() {
  const isReady = useHydrated();
  const locationSearch = useSyncExternalStore(
    subscribeToLocationSearch,
    () => window.location.search,
    () => ""
  );
  const initialContext = useMemo(
    () => getSubmissionContext(locationSearch),
    [locationSearch]
  );
  const [selectedContext, setSelectedContext] = useState<SubmissionContext | null>(null);
  const submissionContext = selectedContext ?? initialContext;
  const isCorrection = submissionContext.type === "correction";
  const isAdditionalSource = submissionContext.type === "source";
  const isEntryFeedback = isCorrection || isAdditionalSource;
  const isFinding = submissionContext.type === "challenge";
  const requirements = getSubmissionRequirements(submissionContext);
  const challenge =
    submissionContext.type === "challenge" ? submissionContext.challenge : null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: null as string | null,
    description: "",
    eventDate: "",
    datePrecision: "" as DatePrecision | "",
    dateUncertainty: "",
    sources: "",
    eventUrl: null as string | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const submittedTitle =
    formData.title ??
    (isEntryFeedback ? submissionContext.eventTitle : challenge?.title ?? "");
  const eventUrl =
    formData.eventUrl ?? (isEntryFeedback ? submissionContext.eventUrl : "");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setValidationError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "datePrecision" ? { eventDate: "" } : {}),
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContext(
      selectSubmissionType(submissionContext, e.target.value as SubmissionType)
    );
    setValidationError(null);
    setSubmitStatus("idle");
  };

  const handleChallengeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContext({
      type: "challenge",
      challenge: getResearchChallenge(e.target.value),
    });
    setValidationError(null);
    setSubmitStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: ReturnType<typeof buildSubmissionPayload>;
    try {
      payload = buildSubmissionPayload(submissionContext, {
        ...formData,
        title: submittedTitle,
        eventUrl,
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Please check your submission details.");
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("https://formspree.io/f/mredvnge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          title: null,
          description: "",
          eventDate: "",
          datePrecision: "",
          dateUncertainty: "",
          sources: "",
          eventUrl: null,
        });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 p-4 md:p-10 flex flex-col">
      <header className="mb-8">
        {/* Mobile layout: menu and BEER on same line */}
        <div className="flex items-start justify-between gap-2 md:hidden">
          <p className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              BEER
            </Link>
          </p>
          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4">
          <div />
          <div className="text-center">
            <p className="whitespace-nowrap font-serif text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl">
              <Link href="/" className="hover:no-underline">
                BEER CHRONICLES
              </Link>
            </p>
            <p className="text-stone-600 mt-2 tracking-wide uppercase text-sm whitespace-nowrap">
              An Interactive Beer History Timeline
            </p>
          </div>
          <div className="flex min-w-0 justify-end">
            <HeaderMenu />
          </div>
        </div>

        {/* Subtitle - visible on both, but on mobile it appears below the BEER+menu line */}
        <div className="block md:hidden mt-2">
          <p className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            <Link href="/" className="hover:no-underline">
              CHRONICLES
            </Link>
          </p>
          <p className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            An Interactive Beer History Timeline
          </p>
        </div>
      </header>

      <MainContentStart />

      <section className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-semibold font-serif text-stone-900 mb-2">
          {isFinding
            ? challenge ? `Submit a Finding: ${challenge.title}` : "Submit a Finding"
            : isAdditionalSource
              ? "Suggest an Additional Source"
              : isCorrection
                ? "Suggest a Correction"
                : "Submit a New Beer History Entry"}
        </h1>

        <p className="text-gray-600 mb-4">
          {isFinding ? (
            <>
              Share what you have found and the sources that support it.
              Useful partial findings are welcome too; I&apos;ll review your
              evidence even if the question is not fully resolved.
            </>
          ) : isAdditionalSource ? (
            <>
              Have another source for an existing entry? Identify the entry
              below, share the reference, and explain what it supports or
              clarifies. I&apos;ll review your suggestion.
            </>
          ) : isCorrection ? (
            <>
              Spotted something that should be corrected in an existing
              entry? Share the details below and
              I&apos;ll review them.
            </>
          ) : (
            <>
              You have an important beer history event to share that I
              should include in the Beer Chronicles? Just fill out the
              form below and I&apos;ll review it for inclusion.
            </>
          )}
        </p>

        <SubmissionEmailAlternative />

        <p className="mb-4 text-sm text-stone-600">
          Fields marked &quot;required&quot; must be completed.
        </p>

        <div className="mb-6 space-y-5">
          <div>
            <label
              htmlFor="submissionType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Submission Type <FieldRequirement required />
            </label>
            <select
              id="submissionType"
              name="submissionType"
              form="contribution-form"
              required
              disabled={!isReady || isSubmitting}
              value={submissionContext.type}
              onChange={handleTypeChange}
              className="w-full min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            >
              <option value="entry">New entry</option>
              <option value="correction">Correction</option>
              <option value="source">Additional source</option>
              <option value="challenge">Research challenge finding</option>
            </select>
          </div>

          {isFinding && (
            <div>
              <label
                htmlFor="challengeId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Research Challenge <FieldRequirement required />
              </label>
              <select
                id="challengeId"
                name="challengeId"
                form="contribution-form"
                required
                disabled={!isReady || isSubmitting}
                value={challenge?.id ?? ""}
                onChange={handleChallengeChange}
                className="w-full min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              >
                <option value="">Choose an open research question</option>
                {RESEARCH_CHALLENGES.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {challenge && (
          <div className="mb-6 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700">
            <p>
              <span className="font-medium">Submission type:</span>{" "}
              {CHALLENGE_SUBMISSION_TYPE}
            </p>

            <p className="mt-2 font-medium">{challenge.question}</p>
            <p className="mt-2">{challenge.context}</p>

            <p className="mt-2">
              <Link
                href={`/challenges#${challenge.id}`}
                className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
              >
                View this challenge and its research starting points
              </Link>
            </p>
          </div>
        )}

        {isEntryFeedback && (
          <p className="mb-6 text-sm leading-relaxed text-stone-700">
            Identify the existing entry with its title below. You can also add
            its link.
          </p>
        )}

        <div className="mb-6 rounded-lg border border-stone-200 bg-stone-100 px-4 py-3 text-sm leading-relaxed text-stone-700">
          <p>
            Please include publicly accessible sources whenever possible, and
            only use exact dates when they are explicitly supported by those
            sources.
          </p>

          <p className="mt-2">
            {!requirements.date
              ? "Date information is optional. If your contribution supports a date, choose the precision supported by the evidence. Explain any date range, conflicting evidence, or other uncertainty in the dedicated note."
              : "Entries may also be dated only to a month, year, decade, or century. Prehistoric and BCE proposals are welcome. Choose the precision supported by the evidence and explain any uncertainty in the dedicated date note."}
          </p>

          <p className="mt-2">
            For more detail, see the{" "}
            <Link
              href="/editorial-principles"
              className="font-medium underline underline-offset-2 hover:no-underline"
            >
              Editorial Principles
            </Link>
            .
          </p>
        </div>

        <form id="contribution-form" onSubmit={handleSubmit} aria-busy={!isReady || isSubmitting}>
          <fieldset disabled={!isReady || isSubmitting} className="min-w-0 space-y-5">
            {validationError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                {validationError}
              </p>
            )}
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name <FieldRequirement required />
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                required
                aria-describedby="submission-privacy-notice"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                placeholder="e.g., John Smith"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Email <FieldRequirement required />
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                aria-describedby="submission-privacy-notice"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                placeholder="e.g., john@example.com"
              />
            </div>

            {isEntryFeedback && (
              <div>
                <label
                  htmlFor="eventUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Entry Link <FieldRequirement required={false} />
                </label>
                <input
                  id="eventUrl"
                  name="eventUrl"
                  type="url"
                  value={eventUrl}
                  onChange={handleChange}
                  aria-describedby="event-url-help"
                  placeholder="https://beer-chronicles.org/events/..."
                  pattern="https://beer-chronicles[.]org/events/.+"
                  title="Use a Beer Chronicles entry URL."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
                <p id="event-url-help" className="mt-1 text-xs text-stone-500">
                  Paste the Beer Chronicles entry URL if you have it, or
                  identify the entry in the title below.
                </p>
              </div>
            )}

            {/* Title Field */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {isEntryFeedback ? "Entry Title" : "Title"}{" "}
                <FieldRequirement required />
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={submittedTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                placeholder={
                  isEntryFeedback
                    ? "Title of the Beer Chronicles entry"
                    : isFinding
                      ? "A short title for your finding"
                      : "e.g., Reinheitsgebot enacted in Bavaria"
                }
              />
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {isFinding ? "Your Finding" : isAdditionalSource ? "How This Source Helps" : "Description"}{" "}
                <FieldRequirement required />
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                placeholder={
                  isFinding
                    ? "Explain what your source establishes, how it relates to the question, and what remains uncertain."
                    : isAdditionalSource
                      ? "Explain which part of the entry this source supports or clarifies."
                      : isCorrection
                        ? "Describe the issue and the correction you suggest."
                        : "Describe the event, its significance, and any relevant details..."
                }
              />
            </div>

            {/* Date Precision Field */}
            <div>
              <label
                htmlFor="datePrecision"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date Precision <FieldRequirement required={requirements.date} />
              </label>
              <select
                id="datePrecision"
                name="datePrecision"
                required={requirements.date}
                value={formData.datePrecision}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              >
                <option value="">
                  {isFinding
                    ? "No date established yet"
                    : isCorrection
                      ? "Not part of this correction"
                      : isAdditionalSource
                        ? "No date information to add"
                        : "Choose the supported precision"}
                </option>
                <option value="date">Full date (year-month-day)</option>
                <option value="month">Month (e.g., October 1990)</option>
                <option value="year">Year only</option>
                <option value="decade">Decade (e.g., 1990s)</option>
                <option value="century">Century (e.g., 18th century)</option>
              </select>
            </div>

            {/* Event Date Field */}
            {formData.datePrecision && (
              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {DATE_FIELD_CONFIG[formData.datePrecision].label}{" "}
                  <FieldRequirement required={requirements.date} />
                </label>
                <input
                  type="text"
                  id="eventDate"
                  name="eventDate"
                  required={requirements.date}
                  value={formData.eventDate}
                  onChange={handleChange}
                  placeholder={
                    DATE_FIELD_CONFIG[formData.datePrecision].placeholder
                  }
                  aria-describedby="event-date-help"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
                <p id="event-date-help" className="mt-1 text-xs text-stone-500">
                  {DATE_FIELD_CONFIG[formData.datePrecision].helpText}
                </p>
              </div>
            )}

            {/* Date Uncertainty Field */}
            <div>
              <label
                htmlFor="dateUncertainty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {!requirements.date
                  ? "Uncertainty or explanation"
                  : "Date uncertainty or explanation"}{" "}
                <FieldRequirement required={false} />
              </label>
              <textarea
                id="dateUncertainty"
                name="dateUncertainty"
                rows={2}
                value={formData.dateUncertainty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                placeholder={
                  !requirements.date
                    ? "Explain any conflicting evidence, uncertainty about what the source establishes, or the supported date range."
                    : "Explain an approximate date, conflicting sources, or the supported date range."
                }
              />
            </div>

            {/* Sources Field */}
            <div>
              <label
                htmlFor="sources"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {isFinding ? "Supporting Sources" : "Sources"}{" "}
                <FieldRequirement required={requirements.sources} />
              </label>
              <textarea
                id="sources"
                name="sources"
                required={requirements.sources}
                rows={3}
                value={formData.sources}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                placeholder={
                  isFinding
                    ? "URLs or archival references supporting your finding (one per line)"
                    : isCorrection
                      ? "Relevant URLs or references, if available (one per line)"
                      : isAdditionalSource
                        ? "URLs or references for the additional sources (one per line)"
                        : "URLs or references that support this entry (one per line)"
                }
              />

              {isCorrection && (
                <p className="mt-1 text-xs text-stone-500">
                  Reliable sources are encouraged when they are
                  relevant to the suggested change.
                </p>
              )}
            </div>

            {/* Submission privacy notice and button */}
            <div className="space-y-3">
              <div
                id="submission-privacy-notice"
                className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-stone-600"
              >
                <p>
                  Your name and email address are sent through Formspree so I
                  can clarify your submission and let you know if or when it is
                  published. Your email address will not be published.
                </p>

                <p className="mt-2">
                  I will only add your name—and, if you wish, a link—to the
                  acknowledgements on the Sources page after asking for and
                  receiving your consent. Read the site&apos;s{" "}
                  <Link
                    href="/privacy"
                    className="rounded-sm underline decoration-stone-300 underline-offset-2 transition hover:text-stone-900 hover:decoration-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                  >
                    privacy information
                  </Link>{" "}
                  and Formspree&apos;s{" "}
                  <a
                    href="https://formspree.io/security/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm underline decoration-stone-300 underline-offset-2 transition hover:text-stone-900 hover:decoration-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                  >
                    privacy and security information
                  </a>
                  .
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-stone-800 hover:bg-stone-900"
                }`}
              >
                {isSubmitting
                  ? "Sending..."
                  : isFinding
                    ? "Send Finding"
                    : isEntryFeedback
                      ? "Send Suggestion"
                      : "Send Entry"}
              </button>
            </div>

            {/* Status Messages */}
            {submitStatus === "success" && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="text-green-800">
                  {isFinding
                    ? "Thank you! Your finding has been submitted. I’ll review it and get back to you within a few days."
                    : isEntryFeedback
                      ? "Thank you! Your suggestion has been submitted. I’ll review it and get back to you within a few days."
                      : "Thank you! Your entry has been submitted. I’ll review it and get back to you within a few days."}
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-800">
                  Sorry, there was an error sending your submission. Please try
                  again or{" "}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="underline hover:no-underline"
                  >
                    email me directly
                  </a>
                  .
                </p>
              </div>
            )}
          </fieldset>
        </form>

        <div className="mt-8 pt-4 text-sm text-gray-600">
          <Link href="/" className="underline hover:no-underline">
            ← Back to the Beer History Timeline
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
