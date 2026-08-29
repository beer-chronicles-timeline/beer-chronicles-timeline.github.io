"use client";

import { useEffect, useRef, useState } from "react";
import { shareEvent } from "@/lib/shareEvent";

type EventShareButtonProps = {
  title: string;
  canonicalUrl: string;
};

async function copyCanonicalUrl(url: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Continue to the lightweight legacy fallback.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

export default function EventShareButton({
  title,
  canonicalUrl,
}: EventShareButtonProps) {
  const [feedback, setFeedback] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    },
    []
  );

  async function handleShare() {
    const result = await shareEvent(
      {
        title,
        text: `Explore ${title} on Beer Chronicles.`,
        url: canonicalUrl,
      },
      {
        share:
          typeof navigator.share === "function"
            ? (data) => navigator.share(data)
            : undefined,
        copy: copyCanonicalUrl,
      }
    );

    if (result !== "copied" && result !== "failed") {
      return;
    }

    setFeedback(result === "copied" ? "Link copied" : "Unable to copy link");
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    resetTimer.current = setTimeout(() => setFeedback(""), 2500);
  }

  return (
    <div className="flex min-h-10 items-center gap-3">
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Share ${title}`}
        className="inline-flex min-h-10 items-center rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-600 transition hover:border-stone-400 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
      >
        Share
      </button>
      <span aria-live="polite" className="text-sm text-stone-500">
        {feedback}
      </span>
    </div>
  );
}
