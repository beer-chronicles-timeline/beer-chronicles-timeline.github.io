// app/submit/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import HeaderMenu from "@/components/HeaderMenu";

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    datePrecision: "date",
    sources: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          title: formData.title,
          description: formData.description,
          eventDate: formData.eventDate,
          datePrecision: formData.datePrecision,
          sources: formData.sources,
          _subject: "New Beer History Entry Submission",
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          title: "",
          description: "",
          eventDate: "",
          datePrecision: "date",
          sources: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
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
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            BEER
          </h1>
          <HeaderMenu />
        </div>

        {/* Desktop layout: centered title with menu on right */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
          <div className="w-1/3" />
          <div className="w-1/3 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif whitespace-nowrap">
              BEER CHRONICLES
            </h1>
            <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
              An Interactive Beer History Timeline
            </h2>
          </div>
          <div className="w-1/3 flex justify-end">
            <HeaderMenu />
          </div>
        </div>

        {/* Subtitle - visible on both, but on mobile it appears below the BEER+menu line */}
        <div className="block md:hidden mt-2">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 font-serif">
            CHRONICLES
          </h1>
          <h2 className="text-stone-600 mt-2 tracking-wide uppercase text-sm">
            An Interactive Beer History Timeline
          </h2>
        </div>
      </header>

      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold font-serif text-stone-900 mb-2">Submit a New Beer History Entry</h2>
        <p className="text-gray-600 mb-6">You have an important beer history event to share that I should include in the Beer Chronicles? Just fill out the form below and I'll review it for inclusion.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              placeholder="e.g., Reinheitsgebot enacted in Bavaria"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Event Date Field */}
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              required
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            />
          </div>

          {/* Date Precision Field */}
          <div>
            <label htmlFor="datePrecision" className="block text-sm font-medium text-gray-700 mb-1">
              Date Precision
            </label>
            <select
              id="datePrecision"
              name="datePrecision"
              required
              value={formData.datePrecision}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            >
              <option value="date">Full date (year-month-day)</option>
              <option value="year">Year only</option>
              <option value="decade">Decade (e.g., 1990s)</option>
            </select>
          </div>

          {/* Sources Field */}
          <div>
            <label htmlFor="sources" className="block text-sm font-medium text-gray-700 mb-1">
              Sources
            </label>
            <textarea
              id="sources"
              name="sources"
              required
              rows={3}
              value={formData.sources}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              placeholder="URLs or references that support this entry (one per line)"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-stone-800 hover:bg-stone-900"
              }`}
            >
              {isSubmitting ? "Sending..." : "Send Entry"}
            </button>
          </div>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">Thank you! Your entry has been submitted. I'll review it soon.</p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">Sorry, there was an error sending your submission. Please try again or email me directly.</p>
            </div>
          )}
        </form>

        <div className="mt-8 pt-4 text-sm text-gray-600">
          <Link href="/" className="underline hover:no-underline">
            ← Back to the Beer History Timeline
          </Link>
        </div>
      </section>
    </main>
  );
}
