/**
 * scripts/lib/file-hasher.mjs
 *
 * SHA-256 file hashing for deterministic conflict detection.
 *
 * Usage:
 *   const snapshot = hashFiles(root, [...claudeFiles, ...geminiFiles]);
 *   // ... agents run ...
 *   const { owned, foreign, missing } = diffSnapshots(snapshot, afterSnapshot, claudeFiles, geminiFiles);
 *
 * The diff tells you:
 *   owned   — files that changed and were assigned to an agent ✓
 *   foreign — files that changed but belonged to the other agent ✗
 *   missing — assigned files that were NOT modified at all (possible omission)
 *   rogue   — files outside any assignment that were modified ✗
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Compute SHA-256 of a file. Returns null if the file doesn't exist.
 * @param {string} absPath
 * @returns {string|null}
 */
function sha256(absPath) {
  try {
    const buf = fs.readFileSync(absPath);
    return crypto.createHash("sha256").update(buf).digest("hex");
  } catch {
    return null;
  }
}

/**
 * Hash a list of repo-relative file paths from a given root.
 *
 * @param {string} root  — absolute path to the worktree root
 * @param {string[]} files — repo-relative paths (as in the backlog)
 * @returns {Record<string, string|null>}  map from path → sha256 (or null if missing)
 */
export function hashFiles(root, files) {
  return Object.fromEntries(
    files.map((f) => [f, sha256(path.resolve(root, f))])
  );
}

/**
 * Compare before/after snapshots and classify each changed file.
 *
 * @param {Record<string,string|null>} before
 * @param {Record<string,string|null>} after
 * @param {string[]} claudeFiles
 * @param {string[]} geminiFiles
 * @returns {{
 *   changed: string[],
 *   owned:   string[],
 *   foreign: string[],
 *   rogue:   string[],
 *   missing: string[],
 * }}
 */
export function diffSnapshots(before, after, claudeFiles, geminiFiles) {
  const allTracked = new Set([...Object.keys(before), ...Object.keys(after)]);
  const claudeSet = new Set(claudeFiles);
  const geminiSet = new Set(geminiFiles);
  const assignedSet = new Set([...claudeFiles, ...geminiFiles]);

  const changed = [...allTracked].filter((f) => (before[f] ?? null) !== (after[f] ?? null));

  // Files that changed but were outside any agent's assignment
  const rogue = changed.filter((f) => !assignedSet.has(f));

  // Assigned files that changed AND belong to the right agent
  const owned = changed.filter((f) => assignedSet.has(f));

  // Files assigned to claude that appear in gemini's changed set (if tracked separately)
  // We use the simplest heuristic: a "foreign" file is one that changed but was
  // explicitly assigned to the OTHER agent — both agents touching the same file.
  const foreign = changed.filter((f) => claudeSet.has(f) && geminiSet.has(f));

  // Files that were assigned to an agent but NOT changed at all
  const allAssigned = [...claudeFiles, ...geminiFiles];
  const missing = allAssigned.filter((f) => !changed.includes(f));

  return { changed, owned, foreign, rogue, missing };
}

/**
 * Pretty-print a diff result for the log.
 * @param {{ changed: string[], owned: string[], foreign: string[], rogue: string[], missing: string[] }} diff
 */
export function formatDiff({ changed, foreign, rogue, missing }) {
  const lines = [`  Changed files (${changed.length}): ${changed.join(", ") || "none"}`];
  if (foreign.length) lines.push(`  ⚠ Foreign (both agents touched): ${foreign.join(", ")}`);
  if (rogue.length)   lines.push(`  ✗ Rogue (outside any assignment): ${rogue.join(", ")}`);
  if (missing.length) lines.push(`  ⚠ Unmodified (possible omission): ${missing.join(", ")}`);
  if (!foreign.length && !rogue.length) lines.push("  ✓ No conflicts detected");
  return lines.join("\n");
}
