"use client";

import { useParams } from "next/navigation";
import { findNavEntryByPath } from "../navigation/lookup";
import { PlaceholderModule } from "../components/ui/PlaceholderModule";

/**
 * Registry-driven catch-all route covering every /app/* path without a
 * literal page.tsx (D-01/D-05/D-06). Deliberately never renders Next.js's
 * built-in "page not found" fallback — D-01 mandates zero 404s phase-wide,
 * including unregistered/stale links (D-14).
 */
export default function CatchAllPage() {
  const params = useParams<{ segments: string[] }>();
  const path = "/app/" + (params.segments ?? []).join("/");

  const entry = findNavEntryByPath(path);

  if (entry) {
    const { group, item } = entry;
    // An "active" item reaching the catch-all means its real page is
    // missing — treat it as planned rather than surfacing "Status: Active"
    // for a page that does not actually exist.
    const status = item.implementationStatus === "disabled" ? "disabled" : "planned";
    return <PlaceholderModule group={group.title} title={item.title} status={status} />;
  }

  // Unregistered path (e.g. a stale hardcoded link) — per D-01/D-14, never a
  // bare Next.js 404. Eyebrow format matches the Copywriting Contract:
  // "Unknown / {path}".
  return <PlaceholderModule group="Unknown" title={path} status="planned" />;
}
