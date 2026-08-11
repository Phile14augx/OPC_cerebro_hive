/**
 * scripts/lib/state-machine.mjs
 *
 * Persistent lifecycle state machine for one dispatch run.
 * State is serialised to .agents/state.json after every transition so a
 * crashed or cancelled runner can resume without re-running expensive steps.
 *
 * Lifecycle:
 *
 *   PENDING → WORKTREE_CREATED → LOCKED → HASHING → AGENTS_RUNNING
 *           → AGENTS_DONE → VALIDATING → PR_CREATED → WAITING_APPROVAL
 *           → MERGED → COMPLETED
 *
 *   Any state → FAILED → ROLLED_BACK (terminal)
 *
 * Usage:
 *   const sm = new StateMachine(traceId, milestoneId);
 *   sm.transition("WORKTREE_CREATED", { branch: "feat/..." });
 *   sm.set("prUrl", "https://github.com/...");
 *
 *   // Resume
 *   const sm = StateMachine.load();          // reads .agents/state.json
 *   if (sm.canResume()) { ... }
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const STATE_PATH = path.join(ROOT, ".agents", "state.json");

export const STATES = [
  "PENDING",
  "WORKTREE_CREATED",
  "LOCKED",
  "HASHING",
  "AGENTS_RUNNING",
  "AGENTS_DONE",
  "VALIDATING",
  "PR_CREATED",
  "WAITING_APPROVAL",
  "MERGED",
  "COMPLETED",
  "FAILED",
  "ROLLED_BACK",
];

const TERMINAL = new Set(["COMPLETED", "FAILED", "ROLLED_BACK"]);
const RESUMABLE_FROM = new Set([
  // These states are safe to re-enter after a crash
  "WORKTREE_CREATED",
  "LOCKED",
  "HASHING",
  "AGENTS_DONE",   // both agents finished; skip re-running them
  "VALIDATING",
  "PR_CREATED",
  "WAITING_APPROVAL",
]);

export class StateMachine {
  /**
   * @param {string} traceId
   * @param {string} milestoneId
   */
  constructor(traceId, milestoneId) {
    this.traceId = traceId;
    this.milestoneId = milestoneId;
    this.state = "PENDING";
    this.history = [];
    this.data = {};   // arbitrary key-value store for run context
    this._persist();
  }

  // ── Transitions ──────────────────────────────────────────────────────────

  /** Move to a new state, optionally merging extra context. */
  transition(newState, extra = {}) {
    if (!STATES.includes(newState)) {
      throw new Error(`Unknown state "${newState}". Valid: ${STATES.join(", ")}`);
    }
    const record = { from: this.state, to: newState, ts: new Date().toISOString(), ...extra };
    this.history.push(record);
    this.state = newState;
    Object.assign(this.data, extra);
    this._persist();
    return this;
  }

  /** Store an arbitrary value in the run context without changing state. */
  set(key, value) {
    this.data[key] = value;
    this._persist();
    return this;
  }

  /** Has the machine reached a terminal state? */
  get isTerminal() { return TERMINAL.has(this.state); }

  /** Is the current state one from which we can safely resume? */
  canResume() { return RESUMABLE_FROM.has(this.state); }

  /**
   * Check whether a given state has already been completed.
   * Useful for resume: skip phases whose target state appears in history.
   */
  hasReached(state) {
    return this.history.some((h) => h.to === state);
  }

  // ── Persistence ──────────────────────────────────────────────────────────

  _persist() {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(
      STATE_PATH,
      JSON.stringify({
        traceId: this.traceId,
        milestoneId: this.milestoneId,
        state: this.state,
        updatedAt: new Date().toISOString(),
        data: this.data,
        history: this.history,
      }, null, 2) + "\n",
      "utf8"
    );
  }

  // ── Static factory ───────────────────────────────────────────────────────

  /** Load an existing state file from .agents/state.json, or return null. */
  static load() {
    if (!fs.existsSync(STATE_PATH)) return null;
    try {
      const raw = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
      const sm = Object.create(StateMachine.prototype);
      sm.traceId = raw.traceId;
      sm.milestoneId = raw.milestoneId;
      sm.state = raw.state;
      sm.history = raw.history ?? [];
      sm.data = raw.data ?? {};
      return sm;
    } catch {
      return null;
    }
  }

  /** Remove the state file (called after COMPLETED or ROLLED_BACK). */
  static clear() {
    try { fs.unlinkSync(STATE_PATH); } catch { /* ignore */ }
  }

  /** Pretty-print current state for humans. */
  summary() {
    const last = this.history[this.history.length - 1];
    return [
      `  Trace   : ${this.traceId}`,
      `  Milestone: ${this.milestoneId}`,
      `  State   : ${this.state}`,
      `  Updated : ${last?.ts ?? "—"}`,
    ].join("\n");
  }
}
