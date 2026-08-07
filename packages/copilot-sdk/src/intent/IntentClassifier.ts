/**
 * CerebroCopilot — Intent Classifier
 * Routes user messages to the correct AEOS product and action.
 * Primary AI: Claude
 */

export type CopilotDomain =
  | 'workflow'      // CerebroFlow
  | 'analytics'     // CerebroInsight
  | 'knowledge'     // CerebroArchive
  | 'agents'        // CerebroStudio / HiveAgent
  | 'hr'            // HiveHR
  | 'finance'       // HiveFinance
  | 'sales'         // HiveSales
  | 'legal'         // HiveLegal
  | 'ops'           // HiveOps
  | 'security'      // HiveShield
  | 'identity'      // HiveIdentity
  | 'data'          // HiveData
  | 'marketplace'   // HiveMarketplace
  | 'conversation'  // Pure conversational — no product action
  | 'system';       // Meta — copilot self-reference

export type ActionVerb =
  | 'create' | 'read' | 'update' | 'delete'
  | 'search' | 'summarise' | 'analyse' | 'generate'
  | 'approve' | 'schedule' | 'trigger' | 'explain'
  | 'list' | 'compare' | 'forecast' | 'export';

export type AutonomyLevel =
  | 'inform'     // Copilot answers, no system changes
  | 'suggest'    // Copilot proposes, user approves before action
  | 'execute';   // Copilot acts directly (gated by safety guardrails)

export interface ClassifiedIntent {
  domain: CopilotDomain;
  action: ActionVerb;
  autonomyLevel: AutonomyLevel;
  confidence: number;          // 0–1
  entities: ExtractedEntity[];
  requiresContext: string[];   // context keys needed from CerebroArchive
  suggestedProducts: string[]; // AEOS product IDs to invoke
  rawMessage: string;
}

export interface ExtractedEntity {
  type: 'date' | 'person' | 'amount' | 'product' | 'vendor' | 'metric' | 'department' | 'record_id';
  value: string;
  normalized?: string;
}

// ─── Signal tables ────────────────────────────────────────────────────────────

const DOMAIN_SIGNALS: Record<CopilotDomain, string[]> = {
  workflow:     ['workflow', 'automate', 'trigger', 'pipeline', 'process', 'cerebroflow', 'run workflow'],
  analytics:    ['analytics', 'report', 'dashboard', 'kpi', 'metric', 'chart', 'trend', 'insight', 'forecast', 'revenue', 'ebitda'],
  knowledge:    ['find document', 'search knowledge', 'archive', 'policy', 'procedure', 'what does our', 'our sop'],
  agents:       ['agent', 'bot', 'autonomous', 'worker', 'deploy agent', 'create agent'],
  hr:           ['employee', 'onboard', 'leave', 'payroll', 'headcount', 'hire', 'recruit', 'performance review'],
  finance:      ['invoice', 'expense', 'budget', 'po ', 'purchase order', 'payment', 'vendor payment', 'cost'],
  sales:        ['lead', 'deal', 'opportunity', 'crm', 'prospect', 'close', 'pipeline', 'quota', 'revenue'],
  legal:        ['contract', 'nda', 'legal', 'compliance', 'clause', 'sign', 'agreement', 'liability'],
  ops:          ['incident', 'deploy', 'rollback', 'sla', 'uptime', 'alert', 'on-call', 'outage'],
  security:     ['security', 'access', 'permission', 'audit', 'threat', 'vulnerability', 'gdpr', 'breach'],
  identity:     ['user account', 'provision', 'sso', 'login', 'role', 'group', 'directory'],
  data:         ['data', 'database', 'schema', 'table', 'query', 'pipeline', 'etl', 'lake'],
  marketplace:  ['marketplace', 'plugin', 'extension', 'connector', 'integration', 'app store'],
  conversation: ['hello', 'hi ', 'thanks', 'what is', 'how do i', 'explain', 'help me understand', 'tell me about'],
  system:       ['copilot', 'cerebro', 'you', 'your capabilities', 'what can you do'],
};

const ACTION_SIGNALS: Record<ActionVerb, string[]> = {
  create:    ['create', 'new', 'draft', 'write', 'generate', 'build', 'add', 'make'],
  read:      ['show', 'get', 'find', 'fetch', 'retrieve', 'what is', 'what are', 'display'],
  update:    ['update', 'edit', 'change', 'modify', 'amend', 'fix', 'correct'],
  delete:    ['delete', 'remove', 'cancel', 'revoke'],
  search:    ['search', 'find', 'look for', 'where is', 'locate'],
  summarise: ['summarise', 'summarize', 'summary', 'brief', 'tldr', 'overview'],
  analyse:   ['analyse', 'analyze', 'breakdown', 'why is', 'what caused', 'diagnose'],
  generate:  ['generate', 'produce', 'compose', 'write up', 'draft'],
  approve:   ['approve', 'sign off', 'authorise', 'authorize'],
  schedule:  ['schedule', 'book', 'plan', 'set up a meeting', 'reminder'],
  trigger:   ['trigger', 'run', 'execute', 'kick off', 'start'],
  explain:   ['explain', 'how does', 'why does', 'what does', 'help me understand'],
  list:      ['list', 'show all', 'all the', 'give me all'],
  compare:   ['compare', 'vs', 'versus', 'difference between', 'which is better'],
  forecast:  ['forecast', 'predict', 'project', 'what will', 'next quarter'],
  export:    ['export', 'download', 'extract', 'csv', 'excel', 'pdf'],
};

// High-autonomy verbs that can mutate state — require guardrail check
const EXECUTE_VERBS: ActionVerb[] = ['create', 'update', 'delete', 'approve', 'trigger'];
const SUGGEST_VERBS: ActionVerb[] = ['schedule', 'export', 'generate'];

export class IntentClassifier {
  classify(message: string, userRole?: string): ClassifiedIntent {
    const lower = message.toLowerCase();

    const domain = this.detectDomain(lower);
    const action = this.detectAction(lower);
    const autonomyLevel = this.determineAutonomy(action, domain, userRole);
    const entities = this.extractEntities(message);

    return {
      domain,
      action,
      autonomyLevel,
      confidence: this.scoreConfidence(lower, domain, action),
      entities,
      requiresContext: this.inferRequiredContext(domain, action),
      suggestedProducts: this.mapToProducts(domain),
      rawMessage: message,
    };
  }

  private detectDomain(text: string): CopilotDomain {
    let best: CopilotDomain = 'conversation';
    let maxScore = 0;
    for (const [domain, signals] of Object.entries(DOMAIN_SIGNALS) as [CopilotDomain, string[]][]) {
      const score = signals.filter(s => text.includes(s)).length;
      if (score > maxScore) { maxScore = score; best = domain; }
    }
    return best;
  }

  private detectAction(text: string): ActionVerb {
    let best: ActionVerb = 'read';
    let maxScore = 0;
    for (const [action, signals] of Object.entries(ACTION_SIGNALS) as [ActionVerb, string[]][]) {
      const score = signals.filter(s => text.includes(s)).length;
      if (score > maxScore) { maxScore = score; best = action; }
    }
    return best;
  }

  private determineAutonomy(action: ActionVerb, domain: CopilotDomain, userRole?: string): AutonomyLevel {
    // Always inform-only for certain sensitive domains
    if (domain === 'security' || domain === 'identity') return 'suggest';
    if (EXECUTE_VERBS.includes(action)) return 'execute';
    if (SUGGEST_VERBS.includes(action)) return 'suggest';
    return 'inform';
  }

  private extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    // Amounts
    const amounts = text.match(/\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|usd|inr|gbp|eur)/gi);
    for (const a of amounts ?? []) entities.push({ type: 'amount', value: a, normalized: a.replace(/[,$\s]/g, '') });
    // Dates
    const dates = text.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?|\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|q[1-4]\s*\d{4}/gi);
    for (const d of dates ?? []) entities.push({ type: 'date', value: d });
    // Departments
    const depts = ['engineering', 'sales', 'hr', 'finance', 'legal', 'marketing', 'operations', 'product'];
    for (const dept of depts) {
      if (text.toLowerCase().includes(dept)) entities.push({ type: 'department', value: dept });
    }
    return entities;
  }

  private scoreConfidence(text: string, domain: CopilotDomain, action: ActionVerb): number {
    const domainHits = DOMAIN_SIGNALS[domain].filter(s => text.includes(s)).length;
    const actionHits = ACTION_SIGNALS[action].filter(s => text.includes(s)).length;
    return Math.min(0.95, 0.4 + domainHits * 0.15 + actionHits * 0.15);
  }

  private inferRequiredContext(domain: CopilotDomain, action: ActionVerb): string[] {
    const ctx: string[] = ['user.profile', 'user.permissions'];
    if (domain === 'finance') ctx.push('user.finance_access', 'org.fiscal_year');
    if (domain === 'hr') ctx.push('user.direct_reports', 'org.hr_policies');
    if (domain === 'sales') ctx.push('user.crm_access', 'user.territory');
    if (domain === 'analytics') ctx.push('org.kpi_definitions', 'user.data_access');
    if (action === 'approve') ctx.push('user.approval_limits');
    return ctx;
  }

  private mapToProducts(domain: CopilotDomain): string[] {
    const mapping: Record<CopilotDomain, string[]> = {
      workflow:     ['cerebroflow'],
      analytics:    ['cerebroinsight'],
      knowledge:    ['cerebroarchive'],
      agents:       ['cerebrostudio', 'hiveagent'],
      hr:           ['hivehr'],
      finance:      ['hivefinance'],
      sales:        ['hivesales'],
      legal:        ['hivelegal'],
      ops:          ['hiveops'],
      security:     ['hiveshield'],
      identity:     ['hiveidentity'],
      data:         ['hivedata'],
      marketplace:  ['hivemarketplace'],
      conversation: [],
      system:       [],
    };
    return mapping[domain] ?? [];
  }
}
