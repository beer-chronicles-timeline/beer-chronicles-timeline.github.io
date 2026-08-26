export default function TimelineLoadingState() {
  return (
    <section
      className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-12"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white px-6 py-8 text-center shadow-sm">
        <div
          className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-600 motion-reduce:animate-none"
          aria-hidden="true"
        />

        <p className="mt-4 font-serif text-lg font-semibold text-stone-900">
          Loading the timeline
        </p>

        <p className="mt-1 text-sm text-stone-600">
          Gathering the events for you…
        </p>
      </div>
    </section>
  );
}
