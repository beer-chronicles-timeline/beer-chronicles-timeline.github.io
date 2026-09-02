// app/submit/page.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";

const CORRECTION_SUBMISSION_TYPE =
  "Correction / additional source";

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

type CorrectionContext = {
  eventTitle: string;
  eventUrl: string;
};

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

function getCorrectionContext(search: string): CorrectionContext | null {
  const searchParams = new URLSearchParams(search);
  const eventTitle = searchParams.get("eventTitle")?.trim() ?? "";
  const eventUrl = searchParams.get("eventUrl")?.trim() ?? "";

  if (
    searchParams.get("submissionType") !== "correction" ||
    eventTitle === "" ||
    !isCanonicalEventUrl(eventUrl)
  ) {
    return null;
  }

  return { eventTitle, eventUrl };
}

function subscribeToLocationSearch() {
  return () => {};
}

export default function SubmitPage() {
  const locationSearch = useSyncExternalStore(
    subscribeToLocationSearch,
    () => window.location.search,
    () => ""
  );
  const correctionContext = useMemo(
    () => getCorrectionContext(locationSearch),
    [locationSearch]
  );
  const isCorrection = correctionContext !== null;
  const eventUrl = correctionContext?.eventUrl ?? "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: null as string | null,
    description: "",
    eventDate: "",
    datePrecision: "" as DatePrecision | "",
    dateUncertainty: "",
    sources: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const submittedTitle =
    formData.title ?? correctionContext?.eventTitle ?? "";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "datePrecision" ? { eventDate: "" } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("https://formspree.io/f/mredvnge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          title: submittedTitle,
          description: formData.description,
          eventDate: formData.eventDate,
          datePrecision: formData.datePrecision,
          dateUncertainty: formData.dateUncertainty,
          sources: formData.sources,
          ...(isCorrection
            ? {
                submissionType: CORRECTION_SUBMISSION_TYPE,
                eventUrl,
              }
            : {}),
          _subject: isCorrection
            ? `Beer History Correction Suggestion from ${formData.name}`
            : `New Beer History Entry Submission from ${formData.name}`,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          title: "",
          description: "",
          eventDate: "",
          datePrecision: "",
          dateUncertainty: "",
          sources: "",
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

      <section className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold font-serif text-stone-900 mb-2">
          {isCorrection
            ? "Suggest a Correction or Additional Source"
            : "Submit a New Beer History Entry"}
        </h1>

        <p className="text-gray-600 mb-4">
          {isCorrection ? (
            <>
              Spotted something that should be corrected or have an
              additional source to suggest? Share the details below and
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

        {isCorrection && (
          <div className="mb-6 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700">
            <p>
              <span className="font-medium">Submission type:</span>{" "}
              {CORRECTION_SUBMISSION_TYPE}
            </p>

            <p className="mt-2 break-words">
              <span className="font-medium">Event:</span> {eventUrl}
            </p>
          </div>
        )}

        <div className="mb-6 rounded-lg border border-stone-200 bg-stone-100 px-4 py-3 text-sm leading-relaxed text-stone-700">
          <p>
            Please include publicly accessible sources whenever possible, and
            only use exact dates when they are explicitly supported by those
            sources.
          </p>

          <p className="mt-2">
            Entries may also be dated only to a month, year, decade, or
            century. Prehistoric and BCE proposals are welcome. Choose the
            precision supported by the evidence and explain any uncertainty in
            the dedicated date note.
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
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
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              aria-describedby="submission-privacy-notice"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              placeholder="e.g., john@example.com"
            />
          </div>

          {/* Title Field */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={submittedTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              placeholder="e.g., Reinheitsgebot enacted in Bavaria"
            />
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              placeholder="Describe the event, its significance, and any relevant details..."
            />
          </div>

          {/* Date Precision Field */}
          <div>
            <label
              htmlFor="datePrecision"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date Precision
            </label>
            <select
              id="datePrecision"
              name="datePrecision"
              required={!isCorrection}
              value={formData.datePrecision}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            >
              <option value="">
                {isCorrection
                  ? "Not part of this correction"
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
                {DATE_FIELD_CONFIG[formData.datePrecision].label}
              </label>
              <input
                type="text"
                id="eventDate"
                name="eventDate"
                required={!isCorrection}
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
              Date uncertainty or explanation{" "}
              <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <textarea
              id="dateUncertainty"
              name="dateUncertainty"
              rows={2}
              value={formData.dateUncertainty}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              placeholder="Explain an approximate date, conflicting sources, or the supported date range."
            />
          </div>

          {/* Sources Field */}
          <div>
            <label
              htmlFor="sources"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sources
            </label>
            <textarea
              id="sources"
              name="sources"
              required={!isCorrection}
              rows={3}
              value={formData.sources}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              placeholder={
                isCorrection
                  ? "Relevant URLs or references, if available (one per line)"
                  : "URLs or references that support this entry (one per line)"
              }
            />

            {isCorrection && (
              <p className="mt-1 text-xs text-stone-500">
                Optional. Reliable sources are encouraged when they are
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
                : isCorrection
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
                {isCorrection
                  ? "Thank you! Your suggestion has been submitted. I’ll review it soon."
                  : "Thank you! Your entry has been submitted. I’ll review it soon."}
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
                again or email me directly.
              </p>
            </div>
          )}
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
