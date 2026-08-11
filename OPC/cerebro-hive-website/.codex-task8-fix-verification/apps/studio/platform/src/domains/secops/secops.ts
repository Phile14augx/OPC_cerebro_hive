import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro SecOps™ — DevSecOps (SAST/SCA/container/secret scanning, SBOM,
 * artifact signing, policy-as-code) fused with MLSecOps (model supply-chain
 * provenance, adversarial/red-team evaluation of models and agents). Mirrors
 * the security toolchain from both handbooks: Trivy, Gitleaks, Cosign,
 * OPA/Kyverno, plus ML-specific supply-chain and red-teaming practices.
 */

export type ScanKind = "sast" | "sca" | "container" | "secret" | "iac";
export type Severity = "low" | "medium" | "high" | "critical";

export interface ScanFinding { id: string; kind: ScanKind; severity: Severity; rule: string; location: string; description: string }

export interface ScanRun {
  id: string; organizationId: string; kind: ScanKind; target: string; commitSha?: string;
  findings: ScanFinding[]; status: "passed" | "failed"; scannedAt: string;
}

export interface SbomEntry {
  id: string; organizationId: string; artifact: string; version: string;
  components: { name: string; version: string; license: string; vulnerabilities: number }[];
  generatedAt: string;
}

export interface PolicyRule {
  id: string; name: string; description: string;
  /** Cedar/OPA-style predicate evaluated against an arbitrary resource bag. */
  evaluate(resource: Record<string, unknown>): { allowed: boolean; reason: string };
}

export interface PolicyEvaluation {
  id: string; organizationId: string; ruleName: string; resourceKind: string; allowed: boolean; reason: string; evaluatedAt: string;
}

export interface ArtifactSignature {
  id: string; organizationId: string; artifact: string; digest: string; signature: string; signer: string; signedAt: string;
}

export interface RedTeamResult {
  id: string; organizationId: string; targetKind: "model" | "agent" | "prompt"; targetId: string;
  attacksRun: number; attacksSucceeded: number; categories: { category: string; passed: number; failed: number }[]; runAt: string;
}

export interface SecOpsRepository {
  insertScan(s: ScanRun): Promise<void>;
  listScans(org: string, kind?: ScanKind): Promise<ScanRun[]>;
  insertSbom(s: SbomEntry): Promise<void>;
  listSboms(org: string): Promise<SbomEntry[]>;
  insertPolicyEval(p: PolicyEvaluation): Promise<void>;
  listPolicyEvals(org: string): Promise<PolicyEvaluation[]>;
  insertSignature(s: ArtifactSignature): Promise<void>;
  listSignatures(org: string): Promise<ArtifactSignature[]>;
  insertRedTeam(r: RedTeamResult): Promise<void>;
  listRedTeam(org: string): Promise<RedTeamResult[]>;
}

export class InMemorySecOpsRepository implements SecOpsRepository {
  scans: ScanRun[] = [];
  sboms: SbomEntry[] = [];
  policyEvals: PolicyEvaluation[] = [];
  signatures: ArtifactSignature[] = [];
  redTeamRuns: RedTeamResult[] = [];

  async insertScan(s: ScanRun) { this.scans.push(s); }
  async listScans(org: string, kind?: ScanKind) { return this.scans.filter(s => s.organizationId === org && (!kind || s.kind === kind)).reverse(); }
  async insertSbom(s: SbomEntry) { this.sboms.push(s); }
  async listSboms(org: string) { return this.sboms.filter(s => s.organizationId === org).reverse(); }
  async insertPolicyEval(p: PolicyEvaluation) { this.policyEvals.push(p); }
  async listPolicyEvals(org: string) { return this.policyEvals.filter(p => p.organizationId === org).reverse(); }
  async insertSignature(s: ArtifactSignature) { this.signatures.push(s); }
  async listSignatures(org: string) { return this.signatures.filter(s => s.organizationId === org).reverse(); }
  async insertRedTeam(r: RedTeamResult) { this.redTeamRuns.push(r); }
  async listRedTeam(org: string) { return this.redTeamRuns.filter(r => r.organizationId === org).reverse(); }
}

function hash32(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Deterministic rule sets mirroring common SAST/SCA/secret/IaC scanner findings, keyed off a seed so runs are reproducible offline. */
const RULES: Record<ScanKind, { rule: string; severity: Severity; description: string }[]> = {
  sast: [
    { rule: "no-eval", severity: "high", description: "Use of eval()/Function() constructor" },
    { rule: "sql-injection", severity: "critical", description: "String-concatenated SQL query" },
    { rule: "hardcoded-secret", severity: "critical", description: "Hardcoded credential in source" },
  ],
  sca: [
    { rule: "known-cve", severity: "high", description: "Dependency has a known published CVE" },
    { rule: "outdated-major", severity: "medium", description: "Dependency is >2 major versions behind" },
    { rule: "unmaintained", severity: "low", description: "Dependency has had no release in 2+ years" },
  ],
  container: [
    { rule: "root-user", severity: "medium", description: "Container runs as root" },
    { rule: "base-image-cve", severity: "high", description: "Base image has known CVEs" },
    { rule: "no-healthcheck", severity: "low", description: "Missing HEALTHCHECK instruction" },
  ],
  secret: [
    { rule: "aws-key", severity: "critical", description: "AWS access key pattern detected" },
    { rule: "private-key", severity: "critical", description: "PEM private key block detected" },
    { rule: "generic-token", severity: "medium", description: "High-entropy token-like string" },
  ],
  iac: [
    { rule: "open-security-group", severity: "critical", description: "Security group open to 0.0.0.0/0" },
    { rule: "unencrypted-storage", severity: "high", description: "Storage bucket/volume without encryption at rest" },
    { rule: "public-bucket", severity: "high", description: "Object storage bucket is publicly readable" },
  ],
};

const DEFAULT_POLICY_RULES: PolicyRule[] = [
  {
    id: "no-critical-vulns", name: "no-critical-vulns", description: "Deployments must not carry unresolved critical vulnerabilities",
    evaluate: r => {
      const critical = (r.criticalFindings as number) ?? 0;
      return critical > 0 ? { allowed: false, reason: `${critical} unresolved critical finding(s)` } : { allowed: true, reason: "no critical findings" };
    },
  },
  {
    id: "signed-artifacts-only", name: "signed-artifacts-only", description: "Production deployments must use a signed, provenance-attested artifact",
    evaluate: r => {
      const env = r.environmentTier as string | undefined;
      const signed = (r.signed as boolean) ?? false;
      if (env === "production" && !signed) return { allowed: false, reason: "production deploy of an unsigned artifact" };
      return { allowed: true, reason: "artifact signing requirement satisfied" };
    },
  },
  {
    id: "model-red-team-required", name: "model-red-team-required", description: "Models promoted to production must have passed red-team evaluation",
    evaluate: r => {
      const stage = r.targetStage as string | undefined;
      const redTeamPassRate = r.redTeamPassRate as number | undefined;
      if (stage === "production" && (redTeamPassRate === undefined || redTeamPassRate < 0.9)) {
        return { allowed: false, reason: `red-team pass rate ${redTeamPassRate ?? "unknown"} below 0.90 threshold` };
      }
      return { allowed: true, reason: "red-team requirement satisfied" };
    },
  },
];

const REDTEAM_CATEGORIES = ["prompt_injection", "jailbreak", "pii_leakage", "data_exfiltration", "toxicity", "bias"];

export class SecOpsService {
  private policyRules: PolicyRule[] = [...DEFAULT_POLICY_RULES];

  constructor(
    private readonly repo: SecOpsRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  addPolicyRule(rule: PolicyRule): void { this.policyRules.push(rule); }
  listPolicyRules(): { id: string; name: string; description: string }[] {
    return this.policyRules.map(r => ({ id: r.id, name: r.name, description: r.description }));
  }

  /** Runs a deterministic offline scan (no external scanner dependency) — same seeded-simulation philosophy as the Cerebro X mock provider. */
  async runScan(ctx: RequestContext, input: { kind: ScanKind; target: string; commitSha?: string }): Promise<ScanRun> {
    this.policy.assert(ctx.principal, "secops:write", { kind: "scan", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const seed = hash32(`${input.target}:${input.commitSha ?? ""}:${input.kind}`);
    const candidates = RULES[input.kind];
    const findings: ScanFinding[] = candidates
      .filter((_, i) => (seed >> i) % 5 === 0)
      .map((c, i) => ({ id: newId("finding"), kind: input.kind, severity: c.severity, rule: c.rule, location: `${input.target}#${i}`, description: c.description }));
    const run: ScanRun = {
      id: newId("scan"), organizationId: org, kind: input.kind, target: input.target, commitSha: input.commitSha,
      findings, status: findings.some(f => f.severity === "critical" || f.severity === "high") ? "failed" : "passed",
      scannedAt: new Date().toISOString(),
    };
    await this.repo.insertScan(run);
    await this.bus.publish(Subjects.secops.scanCompleted, { scanId: run.id, kind: run.kind, status: run.status, findingCount: findings.length }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    for (const f of findings.filter(f => f.rule.includes("secret") || f.kind === "secret")) {
      await this.bus.publish(Subjects.secops.secretFound, { scanId: run.id, rule: f.rule, location: f.location }, { organizationId: org, traceId: ctx.traceId });
    }
    for (const f of findings.filter(f => f.severity === "critical" || f.severity === "high")) {
      await this.bus.publish(Subjects.secops.vulnerabilityFound, { scanId: run.id, rule: f.rule, severity: f.severity }, { organizationId: org, traceId: ctx.traceId });
    }
    return run;
  }

  async listScans(ctx: RequestContext, kind?: ScanKind): Promise<ScanRun[]> {
    this.policy.assert(ctx.principal, "secops:read", { kind: "scan", organizationId: ctx.principal.organizationId });
    return this.repo.listScans(ctx.principal.organizationId, kind);
  }

  async generateSbom(ctx: RequestContext, input: { artifact: string; version: string; components: { name: string; version: string; license: string }[] }): Promise<SbomEntry> {
    this.policy.assert(ctx.principal, "secops:write", { kind: "sbom", organizationId: ctx.principal.organizationId });
    const sbom: SbomEntry = {
      id: newId("sbom"), organizationId: ctx.principal.organizationId, artifact: input.artifact, version: input.version,
      components: input.components.map(c => ({ ...c, vulnerabilities: hash32(`${c.name}:${c.version}`) % 4 })),
      generatedAt: new Date().toISOString(),
    };
    await this.repo.insertSbom(sbom);
    return sbom;
  }

  async listSboms(ctx: RequestContext): Promise<SbomEntry[]> {
    this.policy.assert(ctx.principal, "secops:read", { kind: "sbom", organizationId: ctx.principal.organizationId });
    return this.repo.listSboms(ctx.principal.organizationId);
  }

  /** Cosign-style detached signing: deterministic digest+signature derivation, no external key material required offline. */
  async signArtifact(ctx: RequestContext, artifact: string, digest: string): Promise<ArtifactSignature> {
    this.policy.assert(ctx.principal, "secops:write", { kind: "signature", organizationId: ctx.principal.organizationId });
    const signature: ArtifactSignature = {
      id: newId("sig"), organizationId: ctx.principal.organizationId, artifact, digest,
      signature: hash32(`${digest}:${ctx.principal.userId}`).toString(16).padStart(8, "0"),
      signer: ctx.principal.userId, signedAt: new Date().toISOString(),
    };
    await this.repo.insertSignature(signature);
    await this.bus.publish(Subjects.secops.artifactSigned, { artifact, digest }, { organizationId: ctx.principal.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return signature;
  }

  async listSignatures(ctx: RequestContext): Promise<ArtifactSignature[]> {
    this.policy.assert(ctx.principal, "secops:read", { kind: "signature", organizationId: ctx.principal.organizationId });
    return this.repo.listSignatures(ctx.principal.organizationId);
  }

  /** Policy-as-code evaluation (OPA/Cedar-style) against an arbitrary resource bag; all registered rules must allow. */
  async evaluatePolicy(ctx: RequestContext, resourceKind: string, resource: Record<string, unknown>): Promise<{ allowed: boolean; evaluations: PolicyEvaluation[] }> {
    this.policy.assert(ctx.principal, "secops:read", { kind: "policy", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const evaluations: PolicyEvaluation[] = [];
    for (const rule of this.policyRules) {
      const verdict = rule.evaluate(resource);
      const evaluation: PolicyEvaluation = {
        id: newId("policyeval"), organizationId: org, ruleName: rule.name, resourceKind, allowed: verdict.allowed, reason: verdict.reason, evaluatedAt: new Date().toISOString(),
      };
      evaluations.push(evaluation);
      await this.repo.insertPolicyEval(evaluation);
      await this.bus.publish(Subjects.secops.policyEvaluated, { ruleName: rule.name, resourceKind, allowed: verdict.allowed }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      if (!verdict.allowed) {
        await this.bus.publish(Subjects.secops.policyViolation, { ruleName: rule.name, resourceKind, reason: verdict.reason }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      }
    }
    return { allowed: evaluations.every(e => e.allowed), evaluations };
  }

  async listPolicyEvals(ctx: RequestContext): Promise<PolicyEvaluation[]> {
    this.policy.assert(ctx.principal, "secops:read", { kind: "policy", organizationId: ctx.principal.organizationId });
    return this.repo.listPolicyEvals(ctx.principal.organizationId);
  }

  /** MLSecOps: deterministic red-team sweep across standard adversarial categories against a model/agent/prompt target. */
  async runRedTeam(ctx: RequestContext, input: { targetKind: RedTeamResult["targetKind"]; targetId: string; attacksPerCategory?: number }): Promise<RedTeamResult> {
    this.policy.assert(ctx.principal, "secops:write", { kind: "redteam", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const perCategory = input.attacksPerCategory ?? 10;
    const categories = REDTEAM_CATEGORIES.map(category => {
      const seed = hash32(`${input.targetId}:${category}`);
      const failed = seed % perCategory; // deterministic "successful attack" count out of perCategory attempts
      return { category, passed: perCategory - failed, failed };
    });
    const attacksRun = categories.length * perCategory;
    const attacksSucceeded = categories.reduce((sum, c) => sum + c.failed, 0);
    const result: RedTeamResult = {
      id: newId("redteam"), organizationId: org, targetKind: input.targetKind, targetId: input.targetId,
      attacksRun, attacksSucceeded, categories, runAt: new Date().toISOString(),
    };
    await this.repo.insertRedTeam(result);
    await this.bus.publish(Subjects.secops.redTeamCompleted, { targetKind: input.targetKind, targetId: input.targetId, attacksRun, attacksSucceeded }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return result;
  }

  async listRedTeam(ctx: RequestContext): Promise<RedTeamResult[]> {
    this.policy.assert(ctx.principal, "secops:read", { kind: "redteam", organizationId: ctx.principal.organizationId });
    return this.repo.listRedTeam(ctx.principal.organizationId);
  }
}
