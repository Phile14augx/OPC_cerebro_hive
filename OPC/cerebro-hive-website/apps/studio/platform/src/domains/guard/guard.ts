import { createHash } from "node:crypto";
import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { Telemetry } from "../../kernel/telemetry/telemetry.js";

export interface GuardFinding { type: "pii" | "secret" | "prompt-injection" | "jailbreak" | "policy"; label: string; match: string; owasp?: string }
export interface GuardReport { direction: "input" | "output"; redacted: string; findings: GuardFinding[]; riskScore: number; blocked: boolean }

interface Pattern { type: GuardFinding["type"]; label: string; regex: RegExp; weight: number; redactWith?: string; owasp?: string }

const PATTERNS: Pattern[] = [
  // Order matters: most specific redactions first so e.g. card numbers are not
  // partially consumed by the greedier phone pattern.
  { type: "secret", label: "private-key", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g, weight: 50, redactWith: "[PRIVATE-KEY]", owasp: "LLM06" },
  { type: "secret", label: "api-key", regex: /\b(sk-[a-zA-Z0-9]{16,}|ghp_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[bap]-[a-zA-Z0-9-]{10,})\b/g, weight: 40, redactWith: "[SECRET]", owasp: "LLM06" },
  { type: "pii", label: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g, weight: 30, redactWith: "[SSN]" },
  { type: "pii", label: "credit-card", regex: /\b(?:\d[ -]?){13,16}\b/g, weight: 25, redactWith: "[CARD]" },
  { type: "pii", label: "email", regex: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, weight: 12, redactWith: "[EMAIL]" },
  { type: "pii", label: "phone", regex: /(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]\d{3}[\s-]?\d{4}\b/g, weight: 8, redactWith: "[PHONE]" },
  { type: "prompt-injection", label: "ignore-instructions", regex: /\b(ignore|disregard|forget)\b.{0,30}\b(previous|prior|above|all)\b.{0,30}\b(instructions?|prompts?|rules?)\b/gi, weight: 45, owasp: "LLM01" },
  { type: "prompt-injection", label: "system-prompt-exfiltration", regex: /\b(reveal|show|print|repeat)\b.{0,30}\b(system prompt|hidden instructions?|initial prompt)\b/gi, weight: 40, owasp: "LLM01" },
  { type: "prompt-injection", label: "role-override", regex: /\byou are now\b|\bact as (?:an? )?(?:unrestricted|jailbroken|dan)\b/gi, weight: 40, owasp: "LLM01" },
  { type: "jailbreak", label: "dan-style", regex: /\b(DAN|do anything now|developer mode|no restrictions apply)\b/gi, weight: 35, owasp: "LLM01" },
  { type: "jailbreak", label: "encoding-evasion", regex: /\b(base64|rot13|hex)\b.{0,40}\b(decode|execute|run)\b/gi, weight: 25, owasp: "LLM01" },
];

export interface GuardEventRepository {
  append(e: { id: string; organizationId: string; direction: string; riskScore: number; blocked: boolean; findings: GuardFinding[]; contentHash: string; createdAt: string }): Promise<void>;
  recent(organizationId: string, limit?: number): Promise<{ id: string; direction: string; riskScore: number; blocked: boolean; findings: GuardFinding[]; createdAt: string }[]>;
}

export class InMemoryGuardEventRepository implements GuardEventRepository {
  rows: { id: string; organizationId: string; direction: string; riskScore: number; blocked: boolean; findings: GuardFinding[]; contentHash: string; createdAt: string }[] = [];
  async append(e: typeof this.rows[number]): Promise<void> { this.rows.push(e); }
  async recent(org: string, limit = 50) {
    return this.rows.filter(r => r.organizationId === org).slice(-limit).reverse();
  }
}

/** Sliding-window in-memory rate limiter (per org+route). */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  check(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const arr = (this.hits.get(key) ?? []).filter(t => now - t < windowMs);
    if (arr.length >= limit) { this.hits.set(key, arr); return { allowed: false, remaining: 0 }; }
    arr.push(now);
    this.hits.set(key, arr);
    return { allowed: true, remaining: limit - arr.length };
  }
}

/**
 * Cerebro Guard™ — prompt firewall, PII/secret detection, jailbreak heuristics,
 * output filtering, rate limiting, and risk scoring with OWASP LLM mappings.
 */
export class GuardService {
  readonly rateLimiter = new RateLimiter();
  private blockThreshold: number;

  constructor(
    private readonly repo: GuardEventRepository,
    private readonly bus: EventBus,
    private readonly telemetry: Telemetry,
    opts?: { blockThreshold?: number },
  ) {
    this.blockThreshold = opts?.blockThreshold ?? 60;
  }

  async inspectInput(ctx: RequestContext, content: string): Promise<GuardReport & { redacted: string; riskScore: number }> {
    return this.inspect(ctx, content, "input");
  }
  async inspectOutput(ctx: RequestContext, content: string): Promise<GuardReport> {
    return this.inspect(ctx, content, "output");
  }

  private async inspect(ctx: RequestContext, content: string, direction: "input" | "output"): Promise<GuardReport> {
    const findings: GuardFinding[] = [];
    let redacted = content;
    let risk = 0;
    for (const p of PATTERNS) {
      // Injection/jailbreak patterns only threaten the INPUT side.
      if (direction === "output" && (p.type === "prompt-injection" || p.type === "jailbreak")) continue;
      // Match progressively against the already-redacted text so earlier, more
      // specific patterns consume their spans exactly once.
      const matches = [...redacted.matchAll(p.regex)];
      for (const m of matches.slice(0, 5)) {
        findings.push({ type: p.type, label: p.label, match: m[0]!.slice(0, 60), owasp: p.owasp });
        risk += p.weight;
      }
      if (matches.length && p.redactWith) redacted = redacted.replace(p.regex, p.redactWith);
    }
    const riskScore = Math.min(100, risk);
    const blocked = direction === "input" && riskScore >= this.blockThreshold;
    const report: GuardReport = { direction, redacted, findings, riskScore, blocked };

    if (findings.length) {
      this.telemetry.metrics.increment("guard.findings", findings.length, { direction });
      await this.repo.append({
        id: newId("grd"), organizationId: ctx.principal.organizationId, direction, riskScore, blocked,
        findings, contentHash: createHash("sha256").update(content).digest("hex").slice(0, 16),
        createdAt: new Date().toISOString(),
      });
      await this.bus.publish(blocked ? Subjects.security.guardBlocked : Subjects.security.guardFlagged, {
        direction, riskScore, findings: findings.map(f => `${f.type}:${f.label}`),
      }, { organizationId: ctx.principal.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    }
    return report;
  }

  async recentEvents(ctx: RequestContext, limit = 50) {
    return this.repo.recent(ctx.principal.organizationId, limit);
  }

  async enforceRateLimit(ctx: RequestContext, route: string, limit = 60, windowMs = 60_000): Promise<boolean> {
    const res = this.rateLimiter.check(`${ctx.principal.organizationId}:${route}`, limit, windowMs);
    if (!res.allowed) {
      this.telemetry.metrics.increment("guard.rate_limited", 1, { route });
      await this.bus.publish(Subjects.security.rateLimited, { route }, { organizationId: ctx.principal.organizationId, traceId: ctx.traceId });
    }
    return res.allowed;
  }
}
