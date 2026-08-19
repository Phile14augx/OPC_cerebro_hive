const ALWAYS_BLOCKED = [
  ["git", ["reset"]],
  ["git", ["clean"]],
  ["git", ["rebase"]],
  ["git", ["checkout"]],
  ["git", ["switch"]],
  ["git", ["branch", "-D"]],
  ["git", ["push", "--force"]],
  ["git", ["push", "-f"]],
  ["git", ["worktree", "remove"]],
  ["git", ["worktree", "prune"]],
];

const READ_ONLY_GIT = new Set([
  "status", "rev-parse", "branch", "show", "log", "diff", "cat-file", "ls-tree",
  "merge-base", "rev-list", "remote", "tag", "describe", "name-rev", "for-each-ref",
]);

function matchesPrefix(args, prefix) {
  return prefix.every((item, i) => args[i] === item);
}

function isBlocked(command) {
  const exe = command.exe.toLowerCase();
  return ALWAYS_BLOCKED.some(([blockedExe, prefix]) => exe.endsWith(blockedExe) && matchesPrefix(command.args, prefix));
}

function mutatesGit(command) {
  const exe = command.exe.toLowerCase();
  if (!exe.endsWith("git")) return false;
  const sub = command.args[0] ?? "";
  return !READ_ONLY_GIT.has(sub);
}

function isShell(command) {
  const name = command.exe.toLowerCase().replace(/\\/g, "/").split("/").pop();
  return ["sh", "bash", "zsh", "cmd", "cmd.exe", "powershell", "powershell.exe", "pwsh", "pwsh.exe"].includes(name);
}

export class RecoveryPolicyEngine {
  constructor({ allowPush = false, allowShell = false } = {}) {
    this.allowPush = allowPush;
    this.allowShell = allowShell;
  }

  evaluate(order) {
    const violations = [];

    for (const command of order.commands) {
      if (isBlocked(command)) violations.push(`PROHIBITED_COMMAND ${command.exe} ${command.args.join(" ")}`);
      if (!this.allowShell && isShell(command)) violations.push(`SHELL_EXECUTION_BLOCKED ${command.exe}`);
      if (order.mode === "READ_ONLY" && mutatesGit(command)) {
        violations.push(`READ_ONLY_GIT_MUTATION ${command.exe} ${command.args.join(" ")}`);
      }
      if (order.mode !== "PUSH" && command.exe.toLowerCase().endsWith("git") && command.args[0] === "push") {
        violations.push("PUSH_OUTSIDE_PUSH_MODE");
      }
      if (order.mode === "PUSH" && !this.allowPush) violations.push("PUSH_REQUIRES_HUMAN_APPROVAL");
    }

    return {
      allowed: violations.length === 0,
      violations,
      reason: violations[0] ?? "ALLOWED",
    };
  }
}

export function pathAllowed(path, allowedPaths = [], forbiddenPaths = []) {
  const normalized = path.replaceAll("\\", "/");
  if (forbiddenPaths.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix.replace(/\/$/, "")}/`))) {
    return false;
  }
  if (allowedPaths.length === 0) return true;
  return allowedPaths.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix.replace(/\/$/, "")}/`));
}
