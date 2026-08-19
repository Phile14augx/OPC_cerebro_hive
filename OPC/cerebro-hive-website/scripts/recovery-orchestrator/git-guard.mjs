import { spawn } from "node:child_process";
import { pathAllowed } from "./policy.mjs";

function run(exe, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(exe, args, { cwd, shell: false, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => resolve({ exitCode: -1, stdout, stderr: `${stderr}${error.message}` }));
    child.on("close", (code) => resolve({ exitCode: code ?? -1, stdout, stderr }));
  });
}

function parsePorcelainEntries(text) {
  return text.split(/\r?\n/).filter(Boolean).map((line) => ({
    raw: line,
    status: line.slice(0, 2),
    path: line.slice(3).trim(),
  })).filter((entry) => entry.path);
}

function changedEntryPaths(before, after) {
  const beforeByPath = new Map((before.statusEntries ?? []).map((entry) => [entry.path, entry.raw]));
  const afterByPath = new Map((after.statusEntries ?? []).map((entry) => [entry.path, entry.raw]));
  const paths = new Set([...beforeByPath.keys(), ...afterByPath.keys()]);
  return [...paths].filter((path) => beforeByPath.get(path) !== afterByPath.get(path));
}

export class GitGuard {
  constructor({ git = "git" } = {}) {
    this.git = git;
  }

  async capture(repository) {
    const [head, branch, status] = await Promise.all([
      run(this.git, ["rev-parse", "HEAD"], repository),
      run(this.git, ["branch", "--show-current"], repository),
      run(this.git, ["status", "--porcelain=v1"], repository),
    ]);
    if (head.exitCode !== 0 || branch.exitCode !== 0 || status.exitCode !== 0) {
      throw new Error(`GIT_GUARD_CAPTURE_FAILED\n${head.stderr}${branch.stderr}${status.stderr}`);
    }
    const statusEntries = parsePorcelainEntries(status.stdout);
    return {
      head: head.stdout.trim(),
      branch: branch.stdout.trim(),
      statusRaw: status.stdout,
      statusEntries,
      changedPaths: statusEntries.map((entry) => entry.path),
    };
  }

  verify(order, before, after) {
    const violations = [];
    if (order.mode === "READ_ONLY") {
      if (before.head !== after.head) violations.push("READ_ONLY_HEAD_CHANGED");
      if (before.branch !== after.branch) violations.push("READ_ONLY_BRANCH_CHANGED");
      if (before.statusRaw !== after.statusRaw) violations.push("READ_ONLY_STATUS_CHANGED");
    }

    if (["WRITE", "VERIFY"].includes(order.mode)) {
      if (before.branch !== after.branch) violations.push("BRANCH_CHANGED_DURING_BOUNDED_ACTION");
      if (order.mode === "VERIFY" && before.head !== after.head) violations.push("VERIFY_HEAD_CHANGED");

      // Scope only paths whose porcelain entry actually changed during the
      // bounded action. Pre-existing dirty paths are evidence and must not be
      // reclassified as executor mutations merely because they remain dirty.
      for (const path of changedEntryPaths(before, after)) {
        if (!pathAllowed(path, order.allowedPaths, order.forbiddenPaths)) {
          violations.push(`OUT_OF_SCOPE_PATH ${path}`);
        }
      }
    }

    return {
      ok: violations.length === 0,
      violations,
      classification: violations.length ? "EXECUTOR_INTEGRITY_VIOLATION" : "OK",
    };
  }
}
