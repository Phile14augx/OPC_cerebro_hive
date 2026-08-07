/**
 * CerebroCopilot — Proactive Insight Engine
 * Monitors enterprise context signals and surfaces insights without being asked.
 * Opt-in per user. Runs on a background cadence defined per signal type.
 * Primary AI: Claude
 */

export type InsightCategory =
  | 'anomaly'       // Metric outside normal range
  | 'opportunity'   // Positive signal (deal stage, upsell, etc.)
  | 'risk'          // Potential problem ahead
  | 'deadline'      // Upcoming date with action required
  | 'recommendation'; // Efficiency suggestion

export type InsightUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface ProactiveInsight {
  id: string;
  category: InsightCategory;
  urgency: InsightUrgency;
  title: string;
  summary: string;
  detail: string;
  /** Which AEOS product can act on this */
  actionableVia: string[];
  suggestedAction?: string;
  /** If true, Copilot will surface this unprompted in the chat panel */
  pushToUser: boolean;
  expiresAt?: Date;
  sourceSignal: SignalSource;
  generatedAt: Date;
}

export interface SignalSource {
  product: string;
  metricName: string;
  currentValue: unknown;
  baselineValue?: unknown;
  threshold?: unknown;
}

// ─── Signal monitoring rules ──────────────────────────────────────────────────

export interface SignalRule {
  id: string;
  name: string;
  product: string;
  metricPath: string;
  checkFn: (current: unknown, baseline: unknown) => boolean;
  buildInsight: (current: unknown, baseline: unknown, context: Record<string, unknown>) => Omit<ProactiveInsight, 'id' | 'generatedAt' | 'sourceSignal'>;
}

const BUILT_IN_RULES: SignalRule[] = [
  {
    id: 'revenue_drop',
    name: 'Revenue Drop Alert',
    product: 'cerebroinsight',
    metricPath: 'finance.revenue.wow_change_pct',
    checkFn: (cur) => typeof cur === 'number' && cur < -10,
    buildInsight: (cur, base, ctx) => ({
      category: 'risk',
      urgency: (cur as number) < -20 ? 'critical' : 'high',
      title: `Revenue down ${Math.abs(cur as number).toFixed(1)}% week-on-week`,
      summary: `Revenue has dropped ${Math.abs(cur as number).toFixed(1)}% compared to last week.`,
      detail: `Current: $${ctx.current_revenue?.toLocaleString()} vs prior week: $${ctx.prior_revenue?.toLocaleString()}. Top contributing segment: ${ctx.top_declining_segment}. Check CerebroInsight for a full breakdown.`,
      actionableVia: ['cerebroinsight', 'hivesales'],
      suggestedAction: 'Open CerebroInsight revenue drill-down',
      pushToUser: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }),
  },
  {
    id: 'pending_approvals',
    name: 'Pending Approvals Reminder',
    product: 'cerebroflow',
    metricPath: 'approvals.pending_count',
    checkFn: (cur) => typeof cur === 'number' && cur > 0,
    buildInsight: (cur, _base, ctx) => ({
      category: 'deadline',
      urgency: (cur as number) > 5 ? 'high' : 'medium',
      title: `${cur} approval${(cur as number) !== 1 ? 's' : ''} waiting for your action`,
      summary: `You have ${cur} pending approval${(cur as number) !== 1 ? 's' : ''} in CerebroFlow.`,
      detail: `Oldest: ${ctx.oldest_approval_title} (waiting ${ctx.oldest_wait_hours}h). Approving now keeps your team unblocked.`,
      actionableVia: ['cerebroflow'],
      suggestedAction: 'Show my pending approvals',
      pushToUser: true,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    }),
  },
  {
    id: 'deal_at_risk',
    name: 'Deal at Risk',
    product: 'hivesales',
    metricPath: 'crm.deals.at_risk_count',
    checkFn: (cur) => typeof cur === 'number' && cur > 0,
    buildInsight: (cur, _base, ctx) => ({
      category: 'risk',
      urgency: 'high',
      title: `${cur} deal${(cur as number) !== 1 ? 's' : ''} flagged at-risk`,
      summary: `${cur} deal${(cur as number) !== 1 ? 's' : ''} in your pipeline ${(cur as number) !== 1 ? 'are' : 'is'} showing at-risk signals.`,
      detail: `Top at-risk deal: ${ctx.top_at_risk_deal} ($${ctx.top_at_risk_value?.toLocaleString()}). Last contact: ${ctx.days_since_contact} days ago. Recommended: schedule a call this week.`,
      actionableVia: ['hivesales'],
      suggestedAction: 'Show at-risk deals',
      pushToUser: true,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    }),
  },
  {
    id: 'infra_cost_spike',
    name: 'Infrastructure Cost Spike',
    product: 'hiveops',
    metricPath: 'cloud.cost.mom_change_pct',
    checkFn: (cur) => typeof cur === 'number' && cur > 15,
    buildInsight: (cur, _base, ctx) => ({
      category: 'anomaly',
      urgency: 'medium',
      title: `Cloud costs up ${(cur as number).toFixed(1)}% this month`,
      summary: `Infrastructure spend has increased ${(cur as number).toFixed(1)}% month-over-month.`,
      detail: `Top cost driver: ${ctx.top_cost_service} (+$${ctx.top_cost_delta?.toLocaleString()}). Check HiveOps FinOps dashboard for rightsizing recommendations.`,
      actionableVia: ['hiveops'],
      suggestedAction: 'Open FinOps cost breakdown',
      pushToUser: false,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    }),
  },
  {
    id: 'compliance_gap',
    name: 'Compliance Control Gap',
    product: 'hiveshield',
    metricPath: 'compliance.failing_controls_count',
    checkFn: (cur) => typeof cur === 'number' && cur > 0,
    buildInsight: (cur, _base, ctx) => ({
      category: 'risk',
      urgency: (cur as number) > 3 ? 'critical' : 'high',
      title: `${cur} compliance control${(cur as number) !== 1 ? 's' : ''} failing`,
      summary: `${cur} SOC2/GDPR control${(cur as number) !== 1 ? 's are' : ' is'} currently failing.`,
      detail: `Most critical: ${ctx.most_critical_control}. Remediation owner: ${ctx.remediation_owner}. Next audit: ${ctx.next_audit_date}.`,
      actionableVia: ['hiveshield'],
      suggestedAction: 'Open compliance dashboard',
      pushToUser: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }),
  },
];

// ─── Engine ───────────────────────────────────────────────────────────────────

export interface InsightEngineOptions {
  fetchSignal: (product: string, metricPath: string) => Promise<{ current: unknown; baseline: unknown; context: Record<string, unknown> }>;
  onInsight: (insight: ProactiveInsight) => Promise<void>;
  userRoles?: string[];
  enabledRuleIds?: string[];  // if undefined, all rules run
}

export class ProactiveInsightEngine {
  private rules: SignalRule[];

  constructor(private readonly opts: InsightEngineOptions) {
    this.rules = opts.enabledRuleIds
      ? BUILT_IN_RULES.filter(r => opts.enabledRuleIds!.includes(r.id))
      : BUILT_IN_RULES;
  }

  /** Run all rules. Call this on a schedule (e.g. every 15 minutes). */
  async runAll(): Promise<ProactiveInsight[]> {
    const insights: ProactiveInsight[] = [];
    for (const rule of this.rules) {
      try {
        const signal = await this.opts.fetchSignal(rule.product, rule.metricPath);
        if (rule.checkFn(signal.current, signal.baseline)) {
          const partial = rule.buildInsight(signal.current, signal.baseline, signal.context);
          const insight: ProactiveInsight = {
            ...partial,
            id: `insight_${rule.id}_${Date.now()}`,
            generatedAt: new Date(),
            sourceSignal: { product: rule.product, metricName: rule.metricPath, currentValue: signal.current, baselineValue: signal.baseline },
          };
          insights.push(insight);
          if (insight.pushToUser) await this.opts.onInsight(insight);
        }
      } catch {
        // Signal fetch failure is non-fatal — skip this rule
      }
    }
    return insights;
  }

  /** Format an insight for inline Copilot display. */
  static formatForChat(insight: ProactiveInsight): string {
    const urgencyIcon: Record<InsightUrgency, string> = { low: 'ℹ️', medium: '⚠️', high: '🔴', critical: '🚨' };
    return [
      `${urgencyIcon[insight.urgency]} **${insight.title}**`,
      ``,
      insight.detail,
      insight.suggestedAction ? `\n**Suggested action:** ${insight.suggestedAction}` : '',
    ].join('\n').trim();
  }
}
