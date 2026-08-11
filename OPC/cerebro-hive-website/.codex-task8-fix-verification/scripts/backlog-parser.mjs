#!/usr/bin/env node
/**
 * scripts/backlog-parser.mjs
 *
 * Reads AGENT-RUNTIME-BACKLOG.md and extracts milestone metadata.
 * Each milestone section header carries an HTML comment: <!-- status: pending|in-progress|done -->
 *
 * CLI usage:
 *   node scripts/backlog-parser.mjs next          → JSON of the next pending milestone
 *   node scripts/backlog-parser.mjs list          → JSON array of all milestones + statuses
 *   node scripts/backlog-parser.mjs mark <id> <status>  → update a milestone's status in-place
 *
 * Programmatic usage (ESM import):
 *   import { parseBacklog, getNextTask, markMilestone } from "./backlog-parser.mjs"
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BACKLOG_PATH = path.resolve(__dirname, "..", "AGENT-RUNTIME-BACKLOG.md");

const VALID_STATUSES = ["pending", "in-progress", "done"];

// ─── Parser ────────────────────────────────────────────────────────────────

/**
 * Parse every milestone section from the backlog.
 * Returns an array of milestone objects, in document order.
 *
 * @returns {{ id: string, title: string, status: string, raw: string,
 *             objective: string, dependsOn: string[], concretFiles: string[],
 *             filesTouched: { claude: string[], gemini: string[] },
 *             definitionOfDone: string }[]}
 */
export function parseBacklog(content = fs.readFileSync(BACKLOG_PATH, "utf8")) {
  // Split on milestone headers — lines like "## M10.x — ..."
  const sectionRe = /^(## (M[\d.]+) — (.+?)(?:\s*<!--\s*status:\s*(\w[\w-]*)\s*-->)?)\s*$/m;
  const lines = content.split("\n");

  const milestones = [];
  let currentMs = null;
  let currentLines = [];

  function flush() {
    if (!currentMs) return;
    const body = currentLines.join("\n");
    currentMs.raw = body;
    currentMs.objective = extractSection(body, "Objective");
    currentMs.dependsOn = extractDependsOn(body);
    currentMs.concreteFiles = extractConcreteFiles(body);
    // Split files between agents: Claude gets odd-indexed, Gemini gets even-indexed (0-based)
    currentMs.filesTouched = splitFiles(currentMs.concreteFiles);
    currentMs.definitionOfDone = extractSection(body, "Definition of Done");
    milestones.push(currentMs);
    currentMs = null;
    currentLines = [];
  }

  for (const line of lines) {
    const m = line.match(/^## (M[\d.]+) — (.+?)(?:\s*<!--\s*status:\s*([\w-]+)\s*-->)?\s*$/);
    if (m) {
      flush();
      currentMs = {
        id: m[1],
        title: m[2].replace(/<!--.*?-->/, "").trim(),
        status: (m[3] || "pending").toLowerCase(),
      };
    } else if (currentMs) {
      currentLines.push(line);
    }
  }
  flush();

  return milestones;
}

function extractSection(body, heading) {
  // Looks for "**Heading:**" or "**Heading (anything):**" followed by lines until the next **bold:** section
  const re = new RegExp(
    `\\*\\*${heading}[^*]*?:\\*\\*([\\s\\S]*?)(?=\\n\\*\\*|\\n##|$)`,
    "i"
  );
  const m = body.match(re);
  return m ? m[1].trim() : "";
}

function extractDependsOn(body) {
  const section = extractSection(body, "Depends on");
  if (!section || section.toLowerCase().includes("nothing")) return [];
  // Extract M10.x references
  const refs = [];
  for (const match of section.matchAll(/M[\d.]+/g)) refs.push(match[0]);
  return refs;
}

/**
 * Extract the numbered list under "Concrete files to modify".
 * Returns an array of file path strings (the backtick-quoted path, or the whole item).
 */
function extractConcreteFiles(body) {
  const section = extractSection(body, "Concrete files to modify");
  if (!section) return [];

  const files = [];
  // Each item starts with a number + dot, e.g. "1. `path/to/file.ts` — description"
  for (const line of section.split("\n")) {
    const itemMatch = line.match(/^\d+\.\s+`([^`]+)`/);
    if (itemMatch) {
      files.push(itemMatch[1]);
    } else {
      // Continuation lines with additional backtick paths
      for (const m of line.matchAll(/`([^`]+\.(ts|tsx|js|mjs|json|prisma|md))`/g)) {
        if (!files.includes(m[1])) files.push(m[1]);
      }
    }
  }
  return files;
}

/**
 * Interleave files between Claude and Gemini so each gets roughly half the work.
 * Claude → odd positions (1, 3, 5…), Gemini → even positions (2, 4, 6…), 1-indexed.
 */
function splitFiles(files) {
  const claude = [];
  const gemini = [];
  files.forEach((f, i) => (i % 2 === 0 ? claude : gemini).push(f));
  return { claude, gemini };
}

// ─── Status mutation ───────────────────────────────────────────────────────

/**
 * Rewrite the <!-- status: X --> comment on the milestone header line.
 * Writes back to BACKLOG_PATH.
 */
export function markMilestone(id, newStatus, filePath = BACKLOG_PATH) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status "${newStatus}". Must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  let content = fs.readFileSync(filePath, "utf8");
  // Replace the status comment on the matching header line
  const re = new RegExp(
    `(^## ${id.replace(".", "\\.")} — [^\\n]+?)(?:\\s*<!--\\s*status:\\s*[\\w-]+\\s*-->)?\\s*$`,
    "m"
  );
  if (!re.test(content)) {
    throw new Error(`Milestone "${id}" not found in ${filePath}`);
  }
  content = content.replace(re, `$1 <!-- status: ${newStatus} -->`);
  fs.writeFileSync(filePath, content, "utf8");
}

// ─── Query helpers ─────────────────────────────────────────────────────────

/** Return the next milestone whose status is "pending". */
export function getNextTask() {
  const all = parseBacklog();
  return all.find((m) => m.status === "pending") ?? null;
}

// ─── CLI ───────────────────────────────────────────────────────────────────
// Only run when this file is the direct entry point (not when imported).
const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

const [, , command, ...rest] = process.argv;

if (isMain && command === "next") {
  const task = getNextTask();
  if (!task) {
    console.log(JSON.stringify({ done: true, message: "All milestones complete." }));
  } else {
    console.log(JSON.stringify(task, null, 2));
  }
} else if (isMain && command === "list") {
  console.log(JSON.stringify(parseBacklog(), null, 2));
} else if (isMain && command === "mark") {
  const [id, status] = rest;
  if (!id || !status) {
    console.error("Usage: node backlog-parser.mjs mark <id> <status>");
    process.exit(1);
  }
  markMilestone(id, status);
  console.log(`✓ ${id} marked as "${status}"`);
} else if (isMain && command) {
  console.error(`Unknown command: ${command}. Valid: next | list | mark <id> <status>`);
  process.exit(1);
}
