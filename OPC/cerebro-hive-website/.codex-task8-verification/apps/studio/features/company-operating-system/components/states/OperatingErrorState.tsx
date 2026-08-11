"use client";

export function OperatingErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return <section className="p-6" role="alert"><h1 className="font-space text-lg font-bold">Unable to load company brain</h1><p className="mt-2 font-inter text-sm text-[var(--company-os-text-muted)]">{error.message}</p><button className="mt-4 border border-[var(--company-os-border-focus)] px-3 py-2 font-plex text-xs" onClick={onRetry} type="button">Retry</button></section>;
}
