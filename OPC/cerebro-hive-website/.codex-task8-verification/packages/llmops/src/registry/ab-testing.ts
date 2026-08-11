/**
 * PromptOps — A/B Testing Engine
 * Splits traffic between prompt variants, collects metrics, and
 * computes statistical significance to auto-promote winners.
 */

import crypto from "node:crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PromptVariant {
  id:           string;
  name:         string;         // "control" | "treatment-A" | etc.
  promptName:   string;
  promptVersion: string;
  weight:       number;         // 0–1, traffic allocation
}

export interface ABExperiment {
  id:          string;
  name:        string;
  description: string;
  variants:    PromptVariant[];
  metrics:     ABMetrics;
  status:      "running" | "paused" | "concluded" | "draft";
  startedAt:   string;
  concludedAt?: string;
  winner?:     string;          // variant id
  config: {
    minSampleSize:    number;   // per variant before significance testing
    significanceLevel: number;  // α (default 0.05)
    minimumDetectableEffect: number;  // MDE for power calculation
    maxDurationMs:    number;
  };
}

export interface ABMetricRecord {
  variantId:   string;
  sessionId:   string;
  score:       number;          // 0–1 composite quality score
  latencyMs:   number;
  promptTokens: number;
  outputTokens: number;
  costUsd:      number;
  feedbackScore?: number;       // explicit user feedback (1–5)
  timestamp:   string;
}

export interface ABMetrics {
  [variantId: string]: {
    sampleSize:   number;
    avgScore:     number;
    avgLatencyMs: number;
    avgCostUsd:   number;
    avgFeedback:  number;
    scores:       number[];     // rolling window for stats
  };
}

export interface SignificanceResult {
  isSignificant:  boolean;
  pValue:         number;
  effectSize:     number;       // Cohen's d
  winner?:        string;       // variant id with higher mean
  powerAchieved:  number;       // statistical power at current N
  recommendation: string;
}

// ── A/B Experiment Store ──────────────────────────────────────────────────────

class ABTestingEngine {
  private readonly experiments = new Map<string, ABExperiment>();
  private readonly records     = new Map<string, ABMetricRecord[]>(); // expId → records

  // ── Create experiment ──────────────────────────────────────────────────────

  createExperiment(input: {
    name:        string;
    description: string;
    variants:    Omit<PromptVariant, "id">[];
    config?:     Partial<ABExperiment["config"]>;
  }): ABExperiment {
    // Validate weights sum to 1.0
    const totalWeight = input.variants.reduce((s, v) => s + v.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      throw new Error(`Variant weights must sum to 1.0 (got ${totalWeight})`);
    }

    const experiment: ABExperiment = {
      id:          crypto.randomUUID(),
      name:        input.name,
      description: input.description,
      variants:    input.variants.map((v) => ({ ...v, id: crypto.randomUUID() })),
      status:      "draft",
      startedAt:   new Date().toISOString(),
      metrics:     {},
      config: {
        minSampleSize:              100,
        significanceLevel:          0.05,
        minimumDetectableEffect:    0.05,
        maxDurationMs:    7 * 24 * 3600 * 1000,  // 7 days
        ...input.config,
      },
    };

    // Initialize metric buckets
    for (const v of experiment.variants) {
      experiment.metrics[v.id] = {
        sampleSize:   0,
        avgScore:     0,
        avgLatencyMs: 0,
        avgCostUsd:   0,
        avgFeedback:  0,
        scores:       [],
      };
    }

    this.experiments.set(experiment.id, experiment);
    this.records.set(experiment.id, []);
    return experiment;
  }

  // ── Assign variant for a session ──────────────────────────────────────────

  assignVariant(experimentId: string, sessionId: string): PromptVariant {
    const exp = this.getExperiment(experimentId);
    if (exp.status !== "running") {
      throw new Error(`Experiment '${exp.name}' is not running (status: ${exp.status})`);
    }

    // Deterministic assignment based on sessionId hash (sticky)
    const hash = crypto.createHash("sha256").update(`${experimentId}:${sessionId}`).digest("hex");
    const hashNum = parseInt(hash.slice(0, 8), 16) / 0xffffffff;

    let cumulative = 0;
    for (const variant of exp.variants) {
      cumulative += variant.weight;
      if (hashNum < cumulative) return variant;
    }
    return exp.variants[exp.variants.length - 1];
  }

  // ── Record a result ────────────────────────────────────────────────────────

  record(experimentId: string, record: ABMetricRecord): void {
    const exp = this.getExperiment(experimentId);
    const m = exp.metrics[record.variantId];
    if (!m) throw new Error(`Unknown variant '${record.variantId}' in experiment '${experimentId}'`);

    const n = m.sampleSize + 1;
    m.avgScore     = (m.avgScore     * m.sampleSize + record.score)     / n;
    m.avgLatencyMs = (m.avgLatencyMs * m.sampleSize + record.latencyMs) / n;
    m.avgCostUsd   = (m.avgCostUsd   * m.sampleSize + record.costUsd)   / n;
    if (record.feedbackScore !== undefined) {
      m.avgFeedback = (m.avgFeedback * m.sampleSize + record.feedbackScore) / n;
    }
    m.sampleSize = n;
    m.scores.push(record.score);

    // Rolling window — keep last 1000 per variant for stats
    if (m.scores.length > 1000) m.scores.shift();

    this.records.get(experimentId)!.push(record);

    // Auto-check for significance when we hit min sample size
    if (n >= exp.config.minSampleSize) {
      this.maybeAutoConclue(experimentId);
    }
  }

  // ── Statistical significance test (Welch's t-test) ────────────────────────

  testSignificance(experimentId: string): SignificanceResult {
    const exp = this.getExperiment(experimentId);
    const variants = exp.variants;

    if (variants.length < 2) {
      return {
        isSignificant: false,
        pValue:        1.0,
        effectSize:    0,
        powerAchieved: 0,
        recommendation: "Experiment needs at least 2 variants",
      };
    }

    // Compare first two variants (extend for multi-armed later)
    const [va, vb] = [variants[0], variants[1]];
    const ma = exp.metrics[va.id];
    const mb = exp.metrics[vb.id];

    const na = ma.scores.length;
    const nb = mb.scores.length;

    if (na < 30 || nb < 30) {
      return {
        isSignificant: false,
        pValue:        1.0,
        effectSize:    0,
        powerAchieved: 0,
        recommendation: `Need more data. Variant A: ${na}/30 min, Variant B: ${nb}/30 min.`,
      };
    }

    const varA = variance(ma.scores);
    const varB = variance(mb.scores);
    const meanA = ma.avgScore;
    const meanB = mb.avgScore;

    // Welch's t-test
    const se = Math.sqrt(varA / na + varB / nb);
    const t  = se > 0 ? Math.abs(meanA - meanB) / se : 0;

    // Degrees of freedom (Welch–Satterthwaite)
    const df = se > 0
      ? Math.pow(varA / na + varB / nb, 2) /
        (Math.pow(varA / na, 2) / (na - 1) + Math.pow(varB / nb, 2) / (nb - 1))
      : 1;

    const pValue = approximatePValue(t, df);
    const effectSize = se > 0 ? (meanA - meanB) / Math.sqrt((varA + varB) / 2) : 0;  // Cohen's d
    const powerAchieved = approximatePower(Math.abs(effectSize), na, nb, exp.config.significanceLevel);

    const isSignificant = pValue < exp.config.significanceLevel;
    const winner = isSignificant ? (meanA > meanB ? va.id : vb.id) : undefined;
    const winnerName = winner ? variants.find((v) => v.id === winner)?.name : undefined;

    return {
      isSignificant,
      pValue:  Math.round(pValue * 10000) / 10000,
      effectSize: Math.round(effectSize * 1000) / 1000,
      winner,
      powerAchieved: Math.round(powerAchieved * 100) / 100,
      recommendation: isSignificant
        ? `Statistically significant (p=${pValue.toFixed(4)}). Winner: ${winnerName}. Promote to production.`
        : powerAchieved < 0.8
          ? `Insufficient power (${(powerAchieved * 100).toFixed(0)}%). Collect more data.`
          : `No significant difference detected (p=${pValue.toFixed(4)}). Continue running or conclude as inconclusive.`,
    };
  }

  // ── Start / pause / conclude ───────────────────────────────────────────────

  start(experimentId: string):  void { this.setStatus(experimentId, "running"); }
  pause(experimentId: string):  void { this.setStatus(experimentId, "paused"); }

  conclude(experimentId: string, winnerId?: string): void {
    const exp = this.getExperiment(experimentId);
    exp.status      = "concluded";
    exp.concludedAt = new Date().toISOString();
    exp.winner      = winnerId;
    this.experiments.set(experimentId, exp);
  }

  getExperiment(id: string): ABExperiment {
    const exp = this.experiments.get(id);
    if (!exp) throw new Error(`Experiment '${id}' not found`);
    return exp;
  }

  listExperiments(status?: ABExperiment["status"]): ABExperiment[] {
    return [...this.experiments.values()]
      .filter((e) => !status || e.status === status)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  private setStatus(id: string, status: ABExperiment["status"]): void {
    const exp = this.getExperiment(id);
    exp.status = status;
    this.experiments.set(id, exp);
  }

  private maybeAutoConclue(experimentId: string): void {
    const exp = this.getExperiment(experimentId);
    if (exp.status !== "running") return;

    const sig = this.testSignificance(experimentId);
    if (sig.isSignificant && sig.powerAchieved >= 0.8) {
      this.conclude(experimentId, sig.winner);
    }

    // Also auto-conclude if max duration exceeded
    const elapsed = Date.now() - new Date(exp.startedAt).getTime();
    if (elapsed >= exp.config.maxDurationMs) {
      const sig2 = this.testSignificance(experimentId);
      this.conclude(experimentId, sig2.winner);
    }
  }
}

// ── Stats helpers ─────────────────────────────────────────────────────────────

function variance(xs: number[]): number {
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
  return xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1);
}

// Approximation of t-distribution p-value using Wilson–Hilferty
function approximatePValue(t: number, df: number): number {
  const x = df / (df + t * t);
  // Incomplete beta approximation — sufficient for p-value direction
  const p = regularizedIncompleteBeta(df / 2, 0.5, x);
  return Math.min(1, Math.max(0, p));
}

function regularizedIncompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // Lanczos approximation (simplified)
  let sum = 0;
  for (let k = 0; k < 100; k++) {
    const term = (Math.pow(x, k) * Math.exp(-x) * Math.pow(a, k)) / factorial(k);
    sum += term;
    if (term < 1e-10) break;
  }
  return Math.min(1, sum);
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function approximatePower(effectSize: number, n1: number, n2: number, alpha: number): number {
  const zAlpha = alpha < 0.01 ? 2.576 : alpha < 0.05 ? 1.96 : 1.645;
  const pooledN = 2 / (1 / n1 + 1 / n2);
  const ncp = effectSize * Math.sqrt(pooledN / 2);
  const zBeta = ncp - zAlpha;
  // Standard normal CDF approximation
  return 0.5 * (1 + Math.tanh(zBeta * 0.7978845608));
}

// ── Singleton export ──────────────────────────────────────────────────────────
export const abTestingEngine = new ABTestingEngine();
