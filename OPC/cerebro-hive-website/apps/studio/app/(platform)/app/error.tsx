"use client";

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-lg font-semibold text-text-primary">This screen failed to load</h1>
      <p className="max-w-md text-sm text-text-secondary">{error.message || "An unexpected error occurred."}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-text-primary"
      >
        Try again
      </button>
    </div>
  );
}
