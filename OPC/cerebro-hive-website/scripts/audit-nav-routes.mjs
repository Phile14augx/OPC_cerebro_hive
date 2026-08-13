#!/usr/bin/env node
/**
 * scripts/audit-nav-routes.mjs
 *
 * Wave-0 verification harness for Phase 1 (Schema & Navigation Foundation).
 *
 * Static audit — no dev server, no build. Parses the navigation registry as
 * text and cross-checks it against the App Router filesystem tree.
 *
 * Assertions (each produces a named failure line + non-zero exit code):
 *   - MISSING_STATUS     every registry item has an implementationStatus value
 *   - INVALID_STATUS     every implementationStatus is active|planned|disabled
 *   - UNRESOLVED_ROUTE    every registry href (item + group-level) is backed by a
 *                        literal page.tsx OR covered by the root catch-all
 *   - ACTIVE_WITHOUT_PAGE no item marked "active" lacks a literal page.tsx
 *   - PINNED_ORPHAN      every Sidebar.tsx pinnedFavorites href is a registry href
 *   - SIDEBAR_HANDPICK   Sidebar.tsx contains zero hand-picked group lookups
 *                        (D-13 reachability gate, owned by plan 01-04)
 *
 * Usage: node scripts/audit-nav-routes.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const NAV_REGISTRY_PATH = path.join(
  ROOT,
  "apps/studio/app/(platform)/app/navigation/index.ts"
);
const APP_DIR = path.join(ROOT, "apps/studio/app/(platform)/app");
const SIDEBAR_PATH = path.join(
  ROOT,
  "apps/studio/app/(platform)/app/components/Sidebar.tsx"
);

const VALID_STATUSES = new Set(["active", "planned", "disabled"]);

// ── ANSI colour helpers ──────────────────────────────────────────────────
const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const failures = [];
function fail(code, message) {
  failures.push(`${code}: ${message}`);
}

// ── 1. Parse the navigation registry ─────────────────────────────────────

function parseRegistry(text) {
  const groups = [];
  const groupRegex = /export const (\w+): NavGroup = \{([\s\S]*?)\n\};/g;
  let m;
  while ((m = groupRegex.exec(text)) !== null) {
    const constName = m[1];
    const body = m[2];
    const itemsSplitIdx = body.indexOf("items:");
    const header = itemsSplitIdx >= 0 ? body.slice(0, itemsSplitIdx) : body;
    const itemsPart = itemsSplitIdx >= 0 ? body.slice(itemsSplitIdx) : "";

    const titleMatch = header.match(/title:\s*"([^"]*)"/);
    const hrefMatch = header.match(/href:\s*"([^"]*)"/);

    const items = [];
    const itemObjRegex = /\{([^{}]*)\}/g;
    let im;
    while ((im = itemObjRegex.exec(itemsPart)) !== null) {
      const content = im[1];
      const itemTitle = content.match(/title:\s*"([^"]*)"/)?.[1];
      const itemHref = content.match(/href:\s*"([^"]*)"/)?.[1];
      const itemStatus = content.match(/implementationStatus:\s*"([^"]*)"/)?.[1];
      if (itemTitle && itemHref) {
        items.push({ title: itemTitle, href: itemHref, implementationStatus: itemStatus });
      }
    }

    groups.push({
      constName,
      title: titleMatch?.[1] ?? constName,
      href: hrefMatch?.[1],
      items,
    });
  }
  return groups;
}

const registryText = fs.readFileSync(NAV_REGISTRY_PATH, "utf8");
const groups = parseRegistry(registryText);
const allItems = groups.flatMap((g) => g.items.map((item) => ({ group: g.title, ...item })));

// ── 2. Enumerate real routes from the App Router filesystem tree ────────

function collectRoutes(dir, basePath) {
  const routes = new Set();
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return routes;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === "api") continue;
      const isGroupFolder = entry.name.startsWith("(") && entry.name.endsWith(")");
      const nextBase = isGroupFolder ? basePath : `${basePath}/${entry.name}`;
      const sub = collectRoutes(path.join(dir, entry.name), nextBase);
      for (const r of sub) routes.add(r);
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      routes.add(basePath || "/");
    }
  }
  return routes;
}

const realRoutes = collectRoutes(APP_DIR, "/app");

let hasRootCatchAll = false;
try {
  const rootEntries = fs.readdirSync(APP_DIR, { withFileTypes: true });
  hasRootCatchAll = rootEntries.some((e) => e.isDirectory() && e.name.startsWith("[..."));
} catch {
  hasRootCatchAll = false;
}

// ── 3. Assertions ─────────────────────────────────────────────────────────

// MISSING_STATUS
const missingStatusItems = allItems.filter((i) => !i.implementationStatus);
const withStatusCount = allItems.length - missingStatusItems.length;
if (missingStatusItems.length > 0) {
  fail(
    "MISSING_STATUS",
    `${withStatusCount}/${allItems.length} items carry an implementationStatus. Missing on: ${missingStatusItems
      .map((i) => `${i.group} / ${i.title}`)
      .join(", ")}`
  );
}

// INVALID_STATUS
const invalidStatusItems = allItems.filter(
  (i) => i.implementationStatus && !VALID_STATUSES.has(i.implementationStatus)
);
if (invalidStatusItems.length > 0) {
  fail(
    "INVALID_STATUS",
    `Invalid implementationStatus on: ${invalidStatusItems
      .map((i) => `${i.group} / ${i.title} = "${i.implementationStatus}"`)
      .join(", ")}`
  );
}

// UNRESOLVED_ROUTE — item hrefs + group-level hrefs
const allHrefs = [
  ...allItems.map((i) => ({ label: `${i.group} / ${i.title}`, href: i.href })),
  ...groups.filter((g) => g.href).map((g) => ({ label: `${g.title} (group)`, href: g.href })),
];
const unresolved = allHrefs.filter(({ href }) => !realRoutes.has(href) && !hasRootCatchAll);
if (unresolved.length > 0) {
  fail(
    "UNRESOLVED_ROUTE",
    `${unresolved.length} href(s) have no literal page.tsx and no catch-all exists: ${unresolved
      .slice(0, 10)
      .map((u) => `${u.label} (${u.href})`)
      .join(", ")}${unresolved.length > 10 ? ", ..." : ""}`
  );
}

// ACTIVE_WITHOUT_PAGE
const activeWithoutPage = allItems.filter(
  (i) => i.implementationStatus === "active" && !realRoutes.has(i.href)
);
if (activeWithoutPage.length > 0) {
  fail(
    "ACTIVE_WITHOUT_PAGE",
    `Items marked active with no literal page.tsx: ${activeWithoutPage
      .map((i) => `${i.group} / ${i.title} (${i.href})`)
      .join(", ")}`
  );
}

// PINNED_ORPHAN + SIDEBAR_HANDPICK (both read Sidebar.tsx)
let sidebarText = "";
try {
  sidebarText = fs.readFileSync(SIDEBAR_PATH, "utf8");
} catch {
  sidebarText = "";
}

if (sidebarText) {
  const pinnedMatch = sidebarText.match(/pinnedFavorites\s*=\s*\[([\s\S]*?)\n\s*\];/);
  if (pinnedMatch) {
    const pinnedBlock = pinnedMatch[1];
    const hrefRegex = /href:\s*"([^"]+)"/g;
    const pinnedHrefs = [];
    let hm;
    while ((hm = hrefRegex.exec(pinnedBlock)) !== null) {
      pinnedHrefs.push(hm[1]);
    }
    const registryHrefSet = new Set([
      ...allItems.map((i) => i.href),
      ...groups.filter((g) => g.href).map((g) => g.href),
    ]);
    const orphans = pinnedHrefs.filter((h) => !registryHrefSet.has(h));
    if (orphans.length > 0) {
      fail("PINNED_ORPHAN", `Sidebar.tsx pinnedFavorites href(s) not in registry: ${orphans.join(", ")}`);
    }
  }

  const strippedForHandpick = sidebarText
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  if (strippedForHandpick.includes("platformNavigation.find(g => g.title ===")) {
    fail(
      "SIDEBAR_HANDPICK",
      "Sidebar.tsx still hand-picks nav groups by title match (D-13 reachability gate — owned by plan 01-04)"
    );
  }
} else {
  fail("PINNED_ORPHAN", `Could not read Sidebar.tsx at ${SIDEBAR_PATH}`);
}

// ── 4. Report ──────────────────────────────────────────────────────────

const passing = failures.length === 0 ? allItems.length : allItems.length - failures.length;
console.log(
  `audit-nav-routes: ${allItems.length} registry items, ${failures.length === 0 ? "6" : 6 - failures.length}/6 assertions passing, ${failures.length}/6 assertions failing`
);

if (failures.length > 0) {
  console.log(c.bold(c.red(`\n${failures.length} failure(s):`)));
  for (const f of failures) {
    console.log(c.red(`  ✗ ${f}`));
  }
  process.exit(1);
} else {
  console.log(c.green("\nAll assertions passed."));
  process.exit(0);
}
