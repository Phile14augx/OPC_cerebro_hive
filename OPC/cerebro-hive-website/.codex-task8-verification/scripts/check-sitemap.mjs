#!/usr/bin/env node
/**
 * Fails if app/sitemap.ts has drifted from the routes that actually exist.
 *
 * Two failure modes, both real and both silent without this check:
 *   1. A page exists but is not in the sitemap  → the page is invisible to search.
 *   2. The sitemap lists a slug with no page    → a 404 is submitted to search engines.
 *
 * Added by the 2026-08-02 audit, which found nine platform pages missing from
 * the sitemap (including /platform/security, which predated the audit).
 *
 * Usage: node scripts/check-sitemap.mjs
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITEMAP = path.join(ROOT, "app", "sitemap.ts");

/** Directories under app/ whose slugs are enumerated as arrays in sitemap.ts. */
const CHECKED = [
  { dir: "platform", constName: "PLATFORM_SLUGS" },
  { dir: "services", constName: null },
  { dir: "academy", constName: null },
];

/** Route groups `(name)` and dynamic segments `[slug]` are not literal slugs. */
const isLiteralSlug = (name) => !name.startsWith("(") && !name.startsWith("[");

function actualSlugs(dir) {
  const base = path.join(ROOT, "app", dir);
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && isLiteralSlug(e.name))
    .filter((e) => fs.existsSync(path.join(base, e.name, "page.tsx")))
    .map((e) => e.name)
    .sort();
}

function readSitemap() {
  if (!fs.existsSync(SITEMAP)) {
    console.error(`sitemap-check: ${path.relative(ROOT, SITEMAP)} not found`);
    process.exit(1);
  }
  return fs.readFileSync(SITEMAP, "utf8");
}

/** Slugs inside a named `const NAME = [ ... ]` array literal. */
function slugsInConst(src, name) {
  const start = src.indexOf(`const ${name}`);
  if (start === -1) return null;
  const open = src.indexOf("[", start);
  const close = src.indexOf("];", open);
  if (open === -1 || close === -1) return null;
  return [...src.slice(open, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

/** Slugs appearing as explicit `url("/dir/slug"...)` calls. */
function slugsInUrlCalls(src, dir) {
  const re = new RegExp(`url\\("/${dir}/([a-z0-9-]+)"`, "g");
  return [...src.matchAll(re)].map((m) => m[1]);
}

const src = readSitemap();
const problems = [];

for (const { dir, constName } of CHECKED) {
  const actual = actualSlugs(dir);
  const listed = new Set([
    ...(constName ? slugsInConst(src, constName) ?? [] : []),
    ...slugsInUrlCalls(src, dir),
  ]);

  for (const slug of actual) {
    if (!listed.has(slug)) problems.push(`missing from sitemap: /${dir}/${slug}`);
  }
  for (const slug of listed) {
    if (!actual.includes(slug)) problems.push(`in sitemap but no page exists: /${dir}/${slug}`);
  }
}

if (problems.length > 0) {
  console.error("sitemap-check FAILED\n");
  for (const p of problems.sort()) console.error(`  ${p}`);
  console.error(`\n${problems.length} problem(s). Update app/sitemap.ts.`);
  process.exit(1);
}

console.log(`sitemap-check OK — ${CHECKED.map((c) => c.dir).join(", ")} in sync`);
