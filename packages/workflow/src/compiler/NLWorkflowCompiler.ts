/**
 * CerebroFlow — Natural Language → Workflow DSL Compiler
 * User describes a process in plain English; Claude generates a valid WorkflowDSL.
 * Primary AI: Claude
 */

import type { WorkflowDSL, WorkflowCategory, NodeType } from '../dsl/types.js';

// ─── Intent Detection ─────────────────────────────────────────────────────────

interface ParsedIntent {
  category: WorkflowCategory;
  trigger: { type: string; description: string };
  steps: ParsedStep[];
  hasApproval: boolean;
  hasConditions: boolean;
  hasLoops: boolean;
  hasNotifications: boolean;
}

interface ParsedStep {
  order: number;
  description: string;
  detectedType: NodeType;
  keywords: string[];
}

const CATEGORY_SIGNALS: Record<WorkflowCategory, string[]> = {
  hr: ['employee', 'onboard', 'offboard', 'leave', 'payroll', 'hire', 'recruit', 'performance', 'review'],
  finance: ['invoice', 'payment', 'expense', 'budget', 'vendor', 'purchase', 'po ', 'reimburs', 'approval', 'ap ', 'ar '],
  sales: ['lead', 'deal', 'crm', 'salesforce', 'opportunity', 'prospect', 'quote', 'contract', 'revenue'],
  legal: ['contract', 'legal', 'nda', 'compliance', 'policy', 'sign', 'esign', 'docusign', 'clause'],
  ops: ['incident', 'alert', 'deploy', 'rollback', 'ticket', 'sla', 'sre', 'monitor', 'escalat'],
  it: ['access', 'provision', 'account', 'vpn', 'device', 'software', 'license', 'helpdesk'],
  marketing: ['campaign', 'email', 'content', 'social', 'landing', 'ab test', 'publish', 'analytics'],
  procurement: ['supplier', 'rfq', 'rfp', 'purchase order', 'vendor', 'sourcing', 'bid'],
  compliance: ['audit', 'kyc', 'aml', 'gdpr', 'sox', 'hipaa', 'report', 'certif'],
  customer_success: ['churn', 'renewal', 'nps', 'ticket', 'support', 'onboard', 'health score'],
};

const NODE_TYPE_SIGNALS: Array<{ type: NodeType; signals: string[] }> = [
  { type: 'human_approval', signals: ['approv', 'review', 'sign off', 'authorize', 'confirm', 'validate'] },
  { type: 'condition', signals: ['if ', 'when ', 'check if', 'depending on', 'based on', 'greater than', 'less than'] },
  { type: 'notification', signals: ['notify', 'email', 'slack', 'alert', 'send message', 'inform'] },
  { type: 'api', signals: ['fetch', 'call api', 'integrate', 'salesforce', 'jira', 'zendesk', 'stripe', 'clearbit'] },
  { type: 'llm', signals: ['summarize', 'classify', 'extract', 'analyze', 'generate', 'draft', 'ai ', 'llm'] },
  { type: 'delay', signals: ['wait', 'delay', 'after n', 'hours later', 'days later', 'pause'] },
  { type: 'loop', signals: ['for each', 'all records', 'iterate', 'every item', 'batch'] },
  { type: 'transform', signals: ['map', 'transform', 'convert', 'format', 'reshape', 'parse'] },
];

export class NLWorkflowCompiler {
  /**
   * Parse a plain-English workflow description and return a WorkflowDSL skeleton.
   * The skeleton should be reviewed and refined before production deployment.
   */
  compile(description: string, overrides?: Partial<WorkflowDSL>): WorkflowDSL {
    const lower = description.toLowerCase();
    const intent = this.parseIntent(lower);
    const id = `wf_${Date.now()}`;

    const workflow: WorkflowDSL = {
      version: '1.0',
      id,
      name: this.inferName(description),
      description: description.slice(0, 500),
      category: intent.category,
      tags: this.inferTags(intent),
      trigger: this.buildTrigger(intent),
      nodes: this.buildNodes(intent, id),
      edges: [],
      error_handling: {
        default_on_error: intent.hasApproval ? 'escalate' : 'dead_letter',
        dead_letter_queue: { enabled: true, retention_days: 30, auto_retry_after_hours: 24 },
        escalation: intent.hasApproval ? {
          tiers: [
            { level: 1, assignee_ref: 'role:manager', sla_minutes: 60, notification_channels: ['email', 'slack'], message_template: 'Action required: {{workflow.name}} needs your approval.' },
            { level: 2, assignee_ref: 'role:director', sla_minutes: 240, notification_channels: ['email', 'slack', 'sms'], message_template: 'ESCALATED: {{workflow.name}} has been waiting {{elapsed_minutes}} minutes.' },
          ],
        } : undefined,
        global_timeout_minutes: 1440,
      },
      audit: {
        log_node_lifecycle: true,
        log_llm_io: true,
        log_api_io: true,
        redact_fields: ['password', 'secret', 'token', 'key', 'ssn', 'credit_card'],
        retention_days: 90,
        compliance_tags: this.inferComplianceTags(intent.category),
      },
      metadata: {
        author: 'CerebroFlow NL Compiler',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sla_minutes: this.inferSLA(intent.category),
      },
      ...overrides,
    };

    // Wire edges from node dependencies
    workflow.edges = this.buildEdges(workflow.nodes);

    return workflow;
  }

  private parseIntent(description: string): ParsedIntent {
    const category = this.detectCategory(description);
    const steps = this.extractSteps(description);
    return {
      category,
      trigger: this.detectTrigger(description),
      steps,
      hasApproval: steps.some(s => s.detectedType === 'human_approval'),
      hasConditions: steps.some(s => s.detectedType === 'condition'),
      hasLoops: steps.some(s => s.detectedType === 'loop'),
      hasNotifications: steps.some(s => s.detectedType === 'notification'),
    };
  }

  private detectCategory(text: string): WorkflowCategory {
    let best: WorkflowCategory = 'ops';
    let maxScore = 0;
    for (const [cat, signals] of Object.entries(CATEGORY_SIGNALS) as [WorkflowCategory, string[]][]) {
      const score = signals.filter(s => text.includes(s)).length;
      if (score > maxScore) { maxScore = score; best = cat; }
    }
    return best;
  }

  private detectTrigger(text: string): { type: string; description: string } {
    if (text.includes('webhook') || text.includes('api call')) return { type: 'webhook', description: 'HTTP webhook trigger' };
    if (text.includes('schedule') || text.includes('daily') || text.includes('weekly') || text.includes('every day')) return { type: 'schedule', description: 'Scheduled trigger' };
    if (text.includes('new record') || text.includes('created') || text.includes('submitted')) return { type: 'record_created', description: 'Record created event' };
    if (text.includes('file') || text.includes('upload')) return { type: 'file_uploaded', description: 'File upload trigger' };
    return { type: 'manual', description: 'Manual trigger' };
  }

  private extractSteps(text: string): ParsedStep[] {
    const sentences = text.split(/[.\n]/).filter(s => s.trim().length > 5);
    return sentences.slice(0, 10).map((sentence, idx) => {
      const lower = sentence.toLowerCase();
      let detectedType: NodeType = 'transform';
      for (const { type, signals } of NODE_TYPE_SIGNALS) {
        if (signals.some(s => lower.includes(s))) { detectedType = type; break; }
      }
      return { order: idx + 1, description: sentence.trim(), detectedType, keywords: [] };
    });
  }

  private buildTrigger(intent: ParsedIntent): WorkflowDSL['trigger'] {
    const t = intent.trigger;
    if (t.type === 'webhook') return { type: 'webhook', webhook: { path: '/trigger', method: 'POST' } };
    if (t.type === 'schedule') return { type: 'schedule', cron: '0 9 * * 1-5' };
    if (t.type === 'record_created') return { type: 'record_created', event_topic: 'records.created' };
    if (t.type === 'file_uploaded') return { type: 'file_uploaded', event_topic: 'files.uploaded' };
    return { type: 'manual' };
  }

  private buildNodes(intent: ParsedIntent, workflowId: string): WorkflowDSL['nodes'] {
    const nodes: WorkflowDSL['nodes'] = [];
    const prev: string[] = [];

    for (const step of intent.steps) {
      const nodeId = `node_${step.order}`;
      const base = { id: nodeId, name: `Step ${step.order}`, description: step.description, depends_on: [...prev] };

      if (step.detectedType === 'llm') {
        nodes.push({ ...base, type: 'llm', config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are a helpful enterprise AI assistant.', user_prompt_template: step.description + '\n\nContext: {{context}}', output_variable: `step_${step.order}_output` }, on_error: 'dead_letter' });
      } else if (step.detectedType === 'human_approval') {
        nodes.push({ ...base, type: 'human_approval', config: { kind: 'human_approval', assignee_ref: 'role:manager', task_title: step.description.slice(0, 80), task_description_template: step.description + '\n\nDetails: {{context}}', timeout_hours: 24, on_timeout: 'escalate', escalation_assignee_ref: 'role:director' } });
      } else if (step.detectedType === 'api') {
        nodes.push({ ...base, type: 'api', config: { kind: 'api', url_template: 'https://api.example.com/endpoint', method: 'POST', body_template: '{"data": "{{context}}"}', auth: { type: 'bearer', secret_ref: 'vault:api_token' }, output_variable: `step_${step.order}_output` }, retry: { max_attempts: 3, strategy: 'exponential', delay_seconds: 5, retry_on_status: [429, 502, 503] }, on_error: 'dead_letter' });
      } else if (step.detectedType === 'notification') {
        nodes.push({ ...base, type: 'notification', config: { kind: 'notification', channel: 'email', recipient_ref: 'trigger.initiator', subject_template: 'Update: ' + step.description.slice(0, 60), body_template: step.description + '\n\nStatus: {{status}}\nTime: {{timestamp}}' } });
      } else if (step.detectedType === 'condition') {
        nodes.push({ ...base, type: 'condition', config: { kind: 'condition', expression: { left: '{{amount}}', operator: 'gt', right: 1000 }, true_path: [], false_path: [] } });
      } else if (step.detectedType === 'delay') {
        nodes.push({ ...base, type: 'delay', config: { kind: 'delay', duration_seconds: 3600 } });
      } else {
        nodes.push({ ...base, type: 'transform', config: { kind: 'transform', mappings: { output: '{{input}}' }, output_variable: `step_${step.order}_output` } });
      }
      prev.push(nodeId);
    }
    return nodes;
  }

  private buildEdges(nodes: WorkflowDSL['nodes']): WorkflowDSL['edges'] {
    const edges: WorkflowDSL['edges'] = [];
    for (const node of nodes) {
      for (const dep of node.depends_on ?? []) {
        edges.push({ id: `edge_${dep}_${node.id}`, source: dep, target: node.id });
      }
    }
    return edges;
  }

  private inferName(description: string): string {
    const firstSentence = description.split(/[.!?\n]/)[0] ?? description;
    return firstSentence.slice(0, 80).trim();
  }

  private inferTags(intent: ParsedIntent): string[] {
    const tags: string[] = [intent.category];
    if (intent.hasApproval) tags.push('approval-required');
    if (intent.hasConditions) tags.push('conditional');
    if (intent.hasLoops) tags.push('batch');
    if (intent.hasNotifications) tags.push('notifications');
    return tags;
  }

  private inferSLA(category: WorkflowCategory): number {
    const slas: Record<WorkflowCategory, number> = {
      finance: 240, legal: 480, hr: 1440, sales: 60, ops: 15,
      it: 60, marketing: 480, procurement: 2880, compliance: 1440, customer_success: 120,
    };
    return slas[category] ?? 240;
  }

  private inferComplianceTags(category: WorkflowCategory): string[] {
    const tags: Record<WorkflowCategory, string[]> = {
      finance: ['SOX', 'SOC2'], legal: ['GDPR', 'SOC2'], hr: ['GDPR'],
      sales: [], ops: ['SOC2'], it: ['SOC2'], marketing: ['GDPR'],
      procurement: ['SOX'], compliance: ['SOC2', 'GDPR', 'SOX'],
      customer_success: ['GDPR'],
    };
    return tags[category] ?? [];
  }
}
