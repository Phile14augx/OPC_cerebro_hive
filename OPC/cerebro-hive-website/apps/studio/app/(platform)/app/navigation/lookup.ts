/**
 * Single shared registry path-to-entry resolver (D-08).
 *
 * Reused by the catch-all route and (later, plan 01-04) breadcrumbs/page
 * titles — one lookup, many consumers. Import-safe from both server and
 * client components: no client-only directive at the top of this file,
 * no React imports, no next/navigation imports.
 */

import { platformNavigation, type NavGroup, type NavItem } from "./index";

/**
 * All 14 navigation groups (including CerebroForge and HiveOps — see
 * navigation/index.ts's `platformNavigation` export, which already contains
 * every group). Do not re-add the CerebroForge group's export separately —
 * it is already a member of `platformNavigation`.
 */
export const allNavGroups: NavGroup[] = platformNavigation;

/**
 * Two groups declare a group-level `href` that no item shares:
 *   - securityNavigation.href = "/app/security" (items live under
 *     /app/trust/* and /app/security/*)
 *   - supportNavigation.href = "/app/support" (items live under
 *     /app/support/*)
 * Without the group-href fallback pass, hardcoded links to these group
 * roots (e.g. Topbar's /app/security, /app/support links) would fall
 * through to the "Unknown" branch.
 */
function findByGroupHref(pathname: string): { group: NavGroup; item: NavItem } | null {
  const group = allNavGroups.find((g) => g.href === pathname);
  if (!group) return null;
  return {
    group,
    item: { title: group.title, href: group.href as string, implementationStatus: "planned" },
  };
}

/**
 * Resolve a pathname to its registry group + item.
 * Two-pass resolution:
 *   1. Exact match on item.href across every group.
 *   2. Fallback: exact match on a group's own href (see findByGroupHref).
 */
export function findNavEntryByPath(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of allNavGroups) {
    const item = group.items.find((i) => i.href === pathname);
    if (item) return { group, item };
  }
  return findByGroupHref(pathname);
}

/**
 * Resolve a pathname to a breadcrumb trail: [{ label: group.title }, { label: item.title }].
 * Returns [] when no registry entry matches. Consumed by plan 01-04's
 * breadcrumbs and page titles.
 */
export function findNavTrailByPath(pathname: string): { label: string; href?: string }[] {
  const entry = findNavEntryByPath(pathname);
  if (!entry) return [];
  return [{ label: entry.group.title }, { label: entry.item.title }];
}
