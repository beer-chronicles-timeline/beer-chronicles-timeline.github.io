import { CONTACT_EMAIL } from "@/lib/contact";

// Only the fixed public contact address is interpolated here. Cloudflare's
// documented HTML comments keep this fallback usable without its email decoder.
const emailLinkHtml = `<!--email_off--><a href="mailto:${CONTACT_EMAIL}?subject=Beer%20Chronicles%20contribution" class="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2">${CONTACT_EMAIL}</a><!--/email_off-->`;

export default function SubmissionEmailAlternative() {
  return (
    <div className="mb-6 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700">
      <p>
        You can also email your contribution directly to{" "}
        <span dangerouslySetInnerHTML={{ __html: emailLinkHtml }} />.
      </p>

      <p className="mt-2">
        Include your proposed entry or finding, any relevant entry link or
        challenge question, and supporting sources.
      </p>

      <noscript>
        <p className="mt-2">
          The form needs JavaScript. You can send your entry, correction,
          additional source, or challenge finding by email instead.
        </p>
      </noscript>
    </div>
  );
}
