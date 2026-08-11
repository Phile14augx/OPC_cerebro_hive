import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { WorldModel } from "../../ai/world/world.js";
import { seededRandom } from "../simulator/simulator.js";

/**
 * Cerebro Digital Twin™ — the Enterprise Digital Twin pillar: named,
 * business-recognizable scenario simulators (not generic load tests) that
 * write their outcome back into the Enterprise World Model, so "every
 * business process becomes simulatable" and the twin stays in sync with the
 * living graph of the organization. Deterministic seeded simulation — same
 * philosophy as Cerebro Simulator, DevOps, and SecOps.
 */

export type ScenarioKind =
  | "supply_chain" | "hiring" | "manufacturing" | "cyber_attack" | "cloud_migration"
  | "sales_pipeline" | "financial_forecast" | "merger" | "policy_change";

export interface TwinRun { id: string; organizationId: string; kind: ScenarioKind; input: Record<string, unknown>; result: Record<string, unknown>; createdAt: string }

export interface DigitalTwinRepository { insert(r: TwinRun): Promise<void>; list(org: string, kind?: ScenarioKind, limit?: number): Promise<TwinRun[]> }
export class InMemoryDigitalTwinRepository implements DigitalTwinRepository {
  rows: TwinRun[] = [];
  async insert(r: TwinRun) { this.rows.push(r); }
  async list(org: string, kind?: ScenarioKind, limit = 50) {
    return this.rows.filter(r => r.organizationId === org && (!kind || r.kind === kind)).slice(-limit).reverse();
  }
}

export class DigitalTwinService {
  constructor(
    private readonly repo: DigitalTwinRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly world: WorldModel,
  ) {}

  async supplyChain(ctx: RequestContext, input: { suppliers: number; disruptionProbability: number; avgLeadTimeDays: number; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "supply-chain");
    let disrupted = 0; let totalDelayDays = 0;
    for (let i = 0; i < input.suppliers; i++) {
      if (rand() < input.disruptionProbability) { disrupted++; totalDelayDays += Math.round(input.avgLeadTimeDays * (0.5 + rand() * 2)); }
    }
    const result = {
      suppliersDisrupted: disrupted, disruptionRate: Number((disrupted / Math.max(1, input.suppliers)).toFixed(3)),
      avgDelayDaysIfDisrupted: disrupted ? Math.round(totalDelayDays / disrupted) : 0,
      recommendation: disrupted / Math.max(1, input.suppliers) > 0.2 ? "Diversify supplier base — disruption exposure exceeds 20%." : "Supplier concentration risk within tolerance.",
    };
    return this.save(ctx, "supply_chain", input, result, `supply-chain-risk-${new Date().toISOString().slice(0, 10)}`);
  }

  async hiring(ctx: RequestContext, input: { openRoles: number; applicantsPerRole: number; conversionRate: number; avgTimeToHireDays: number; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "hiring");
    let filled = 0; let totalDays = 0;
    for (let i = 0; i < input.openRoles; i++) {
      const hires = Math.round(input.applicantsPerRole * input.conversionRate * (0.7 + rand() * 0.6));
      if (hires >= 1) { filled++; totalDays += Math.round(input.avgTimeToHireDays * (0.7 + rand() * 0.6)); }
    }
    const result = {
      rolesFilled: filled, rolesOpen: input.openRoles - filled,
      fillRate: Number((filled / Math.max(1, input.openRoles)).toFixed(3)),
      avgTimeToFillDays: filled ? Math.round(totalDays / filled) : null,
      recommendation: filled / Math.max(1, input.openRoles) < 0.6 ? "Pipeline conversion is below target — widen sourcing or raise applicantsPerRole." : "Hiring pipeline on track.",
    };
    return this.save(ctx, "hiring", input, result, "hiring-pipeline");
  }

  async manufacturing(ctx: RequestContext, input: { lines: number; unitsPerHourPerLine: number; defectRate: number; demandUnits: number; hoursAvailable: number; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "manufacturing");
    const grossCapacity = input.lines * input.unitsPerHourPerLine * input.hoursAvailable;
    const defects = Math.round(grossCapacity * input.defectRate * (0.8 + rand() * 0.4));
    const goodUnits = grossCapacity - defects;
    const backlog = Math.max(0, input.demandUnits - goodUnits);
    const result = {
      grossCapacity, defects, goodUnits, backlogUnits: backlog,
      throughputVsDemand: Number((goodUnits / Math.max(1, input.demandUnits)).toFixed(3)),
      recommendation: backlog > 0 ? `Backlog of ${backlog} units — add capacity or extend hours to meet demand.` : "Capacity meets demand.",
    };
    return this.save(ctx, "manufacturing", input, result, "manufacturing-line");
  }

  async cyberAttack(ctx: RequestContext, input: { attackVector: string; assetCriticality: "low" | "medium" | "high" | "critical"; mttdHours: number; mttrHours: number; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "cyber");
    const criticalityWeight = { low: 0.2, medium: 0.45, high: 0.7, critical: 0.9 }[input.assetCriticality];
    const breachProbability = Number(Math.min(0.95, criticalityWeight * (0.5 + rand() * 0.6)).toFixed(3));
    const blastRadius = Math.round(criticalityWeight * (10 + rand() * 90));
    const estimatedCostUsd = Math.round((input.mttdHours + input.mttrHours) * 1500 * (1 + criticalityWeight));
    const result = {
      breachProbability, blastRadiusSystems: blastRadius, estimatedCostUsd,
      detectionWindowHours: input.mttdHours, containmentWindowHours: input.mttrHours,
      recommendation: breachProbability > 0.5 ? `High breach probability for ${input.attackVector} — prioritize MTTD/MTTR reduction on ${input.assetCriticality}-criticality assets.` : "Risk within acceptable bounds for current controls.",
    };
    return this.save(ctx, "cyber_attack", input, result, `cyber-risk-${input.attackVector}`);
  }

  async cloudMigration(ctx: RequestContext, input: { workloads: number; migrationWavesWeeks: number; riskTolerance: "low" | "medium" | "high"; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "migration");
    const toleranceFactor = { low: 1.4, medium: 1.0, high: 0.7 }[input.riskTolerance];
    let cutoverIssues = 0;
    for (let i = 0; i < input.workloads; i++) if (rand() < 0.08 * toleranceFactor) cutoverIssues++;
    const estimatedWeeks = Math.round(input.migrationWavesWeeks * (1 + cutoverIssues / Math.max(1, input.workloads)));
    const result = {
      cutoverIssuesExpected: cutoverIssues, estimatedTimelineWeeks: estimatedWeeks,
      slippageWeeks: estimatedWeeks - input.migrationWavesWeeks,
      recommendation: cutoverIssues > input.workloads * 0.15 ? "High cutover-issue rate — add a rollback wave and extend validation windows." : "Migration plan timeline looks achievable.",
    };
    return this.save(ctx, "cloud_migration", input, result, "cloud-migration-program");
  }

  async salesPipeline(ctx: RequestContext, input: { stages: { name: string; count: number; conversion: number }[]; avgDealSizeUsd: number; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "sales");
    let remaining = input.stages[0]?.count ?? 0;
    const stageOutcomes: { name: string; entering: number; advancing: number }[] = [];
    for (const stage of input.stages) {
      const entering = Math.max(remaining, stage.count);
      const advancing = Math.round(entering * stage.conversion * (0.85 + rand() * 0.3));
      stageOutcomes.push({ name: stage.name, entering, advancing });
      remaining = advancing;
    }
    const forecastedDeals = remaining;
    const result = { stageOutcomes, forecastedClosedDeals: forecastedDeals, forecastedRevenueUsd: forecastedDeals * input.avgDealSizeUsd };
    return this.save(ctx, "sales_pipeline", input, result, "sales-pipeline");
  }

  async financialForecast(ctx: RequestContext, input: { revenueUsd: number; expensesUsd: number; monthlyGrowthPct: number; horizonMonths: number; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "finance");
    const months: { month: number; revenue: number; expenses: number; netIncome: number }[] = [];
    let revenue = input.revenueUsd; let expenses = input.expensesUsd;
    for (let m = 1; m <= input.horizonMonths; m++) {
      revenue *= 1 + input.monthlyGrowthPct / 100 * (0.8 + rand() * 0.4);
      expenses *= 1 + (input.monthlyGrowthPct / 100) * 0.6;
      months.push({ month: m, revenue: Math.round(revenue), expenses: Math.round(expenses), netIncome: Math.round(revenue - expenses) });
    }
    const result = { months, breakEvenMonth: months.find(m => m.netIncome > 0)?.month ?? null, endingNetIncome: months.at(-1)?.netIncome ?? 0 };
    return this.save(ctx, "financial_forecast", input, result, "financial-forecast");
  }

  async merger(ctx: RequestContext, input: { acquirerHeadcount: number; targetHeadcount: number; overlapPct: number; synergyTargetPct: number; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "merger");
    const overlapRoles = Math.round(input.targetHeadcount * input.overlapPct);
    const realizedSynergyPct = Number((input.synergyTargetPct * (0.6 + rand() * 0.5)).toFixed(3));
    const combinedHeadcount = input.acquirerHeadcount + input.targetHeadcount - Math.round(overlapRoles * 0.5);
    const result = {
      overlapRoles, combinedHeadcount, realizedSynergyPct,
      synergyGapPct: Number((input.synergyTargetPct - realizedSynergyPct).toFixed(3)),
      recommendation: realizedSynergyPct < input.synergyTargetPct * 0.7 ? "Synergy realization tracking well below target — revisit integration plan." : "Synergy realization on track.",
    };
    return this.save(ctx, "merger", input, result, "ma-integration");
  }

  async policyChange(ctx: RequestContext, input: { affectedEmployees: number; complianceDeadlineDays: number; currentCompliancePct: number; trainingCapacityPerDay: number; seed?: string }): Promise<TwinRun> {
    const rand = seededRandom(input.seed ?? "policy");
    const remaining = Math.round(input.affectedEmployees * (1 - input.currentCompliancePct));
    const daysNeeded = Math.ceil(remaining / Math.max(1, input.trainingCapacityPerDay * (0.8 + rand() * 0.4)));
    const result = {
      employeesRemaining: remaining, daysNeededAtCurrentCapacity: daysNeeded,
      onTrack: daysNeeded <= input.complianceDeadlineDays,
      recommendation: daysNeeded > input.complianceDeadlineDays ? `Increase training capacity — projected ${daysNeeded}d vs. ${input.complianceDeadlineDays}d deadline.` : "On track to meet compliance deadline.",
    };
    return this.save(ctx, "policy_change", input, result, "policy-rollout");
  }

  list(ctx: RequestContext, kind?: ScenarioKind, limit?: number): Promise<TwinRun[]> {
    this.policy.assert(ctx.principal, "digitaltwin:read", { kind: "run", organizationId: ctx.principal.organizationId });
    return this.repo.list(ctx.principal.organizationId, kind, limit);
  }

  private async save(ctx: RequestContext, kind: ScenarioKind, input: Record<string, unknown>, result: Record<string, unknown>, worldRefId: string): Promise<TwinRun> {
    this.policy.assert(ctx.principal, "digitaltwin:write", { kind: "run", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const run: TwinRun = { id: newId("twin"), organizationId: org, kind, input, result, createdAt: new Date().toISOString() };
    await this.repo.insert(run);
    // Close the loop: the twin writes its outcome back into the living Enterprise World Model.
    await this.world.project(org, "process", worldRefId, kind.replace(/_/g, " "), { lastScenario: run.id, lastResult: result, simulatedAt: run.createdAt });
    await this.bus.publish(Subjects.digitaltwin.scenarioCompleted, { runId: run.id, kind }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return run;
  }
}
