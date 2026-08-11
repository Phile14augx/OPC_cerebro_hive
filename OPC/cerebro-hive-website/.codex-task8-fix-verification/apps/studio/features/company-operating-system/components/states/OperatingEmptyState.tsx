import Link from "next/link";

export function OperatingEmptyState({ entity, actionHref }: { entity: string; actionHref: string }) {
  return <section className="p-6"><h1 className="font-space text-lg font-bold">No {entity} yet</h1><p className="mt-2 font-inter text-sm text-[var(--company-os-text-muted)]">Create an entity to begin mapping your operating system.</p><Link className="mt-4 inline-block border border-[var(--company-os-border-focus)] px-3 py-2 font-plex text-xs" href={actionHref}>Create an agent</Link></section>;
}
