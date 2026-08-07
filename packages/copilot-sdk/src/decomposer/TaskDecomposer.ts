/**
 * CerebroCopilot — Task Decomposer
 * Breaks complex multi-step requests into an ordered plan of sub-tasks,
 * each mapped to a specific AEOS product action.
 * Primary AI: Claude
 */

import type { ClassifiedIntent } from '../intent/IntentClassifier.js';

export interface DecomposedTask {
  id: string;
  stepNumber: number;
  description: string;
  product: string;
  action: string;
  inputs: Record<string, string>;
  dependsOn: string[];
  estimatedDurationSeconds: number;
  requiresHumanInput: boolean;
  humanInputPrompt?: string;
}

export interface DecompositionPlan {
  planId: string;
  originalRequest: string;
  steps: DecomposedTask[];
  totalEstimatedSeconds: number;
  requiresHumanGating: boolean;
  summary: string;
}

// ─── Multi-step pattern library ───────────────────────────────────────────────

interface CompositePattern {
  trigger: string[];
  steps: Omit<DecomposedTask, 'id' | 'stepNumber' | 'dependsOn'>[];
}

const COMPOSITE_PATTERNS: CompositePattern[] = [
  {
    trigger: ['draft a po', 'purchase order', 'vendor payment', 'pay vendor'],
    steps: [
      { description: 'Validate vendor in approved vendor list', product: 'hivefinance', action: 'vendor.validate', inputs: { vendor: '{{entities.vendor}}' }, estimatedDurationSeconds: 3, requiresHumanInput: false },
      { description: 'Draft purchase order with correct GL coding', product: 'hivefinance', action: 'po.draft', inputs: { vendor: '{{entities.vendor}}', amount: '{{entities.amount}}' }, estimatedDurationSeconds: 5, requiresHumanInput: false },
      { description: 'Route PO for approval', product: 'cerebroflow', action: 'workflow.trigger', inputs: { template: 'tpl_fin_001' }, estimatedDurationSeconds: 2, requiresHumanInput: true, humanInputPrompt: 'Please review the draft PO before I submit for approval.' },
    ],
  },
  {
    trigger: ['onboard employee', 'new hire', 'start onboarding', 'new employee'],
    steps: [
      { description: 'Create employee record in HRIS', product: 'hivehr', action: 'employee.create', inputs: { data: '{{entities.person}}' }, estimatedDurationSeconds: 4, requiresHumanInput: true, humanInputPrompt: 'Please confirm the employee details before I create the record.' },
      { description: 'Trigger onboarding workflow', product: 'cerebroflow', action: 'workflow.trigger', inputs: { template: 'tpl_hr_001', employee_id: '{{step_1.employee_id}}' }, estimatedDurationSeconds: 2, requiresHumanInput: false },
      { description: 'Schedule first-week check-in', product: 'hivehr', action: 'calendar.schedule', inputs: { with: '{{entities.person}}', type: 'onboarding_checkin' }, estimatedDurationSeconds: 3, requiresHumanInput: false },
    ],
  },
  {
    trigger: ['close the deal', 'deal closed', 'won the deal', 'mark opportunity won'],
    steps: [
      { description: 'Update opportunity stage to Closed Won in CRM', product: 'hivesales', action: 'opportunity.update', inputs: { stage: 'Closed Won' }, estimatedDurationSeconds: 2, requiresHumanInput: false },
      { description: 'Trigger contract generation workflow', product: 'cerebroflow', action: 'workflow.trigger', inputs: { template: 'tpl_sales_002' }, estimatedDurationSeconds: 2, requiresHumanInput: false },
      { description: 'Notify customer success for handoff', product: 'hivesales', action: 'notification.send', inputs: { channel: 'slack', recipient: 'team:customer_success' }, estimatedDurationSeconds: 1, requiresHumanInput: false },
    ],
  },
  {
    trigger: ['p1 incident', 'production down', 'outage', 'critical alert'],
    steps: [
      { description: 'Triage incident and identify likely cause', product: 'hiveops', action: 'incident.triage', inputs: { incident_id: '{{entities.record_id}}' }, estimatedDurationSeconds: 8, requiresHumanInput: false },
      { description: 'Page on-call engineer', product: 'hiveops', action: 'oncall.page', inputs: {}, estimatedDurationSeconds: 2, requiresHumanInput: true, humanInputPrompt: 'Confirm paging on-call — this will wake someone up.' },
      { description: 'Update status page', product: 'hiveops', action: 'statuspage.update', inputs: { status: 'investigating' }, estimatedDurationSeconds: 2, requiresHumanInput: false },
    ],
  },
];

export class TaskDecomposer {
  /**
   * Check if a request maps to a known composite pattern.
   * Returns a plan if matched, null if single-step.
   */
  decompose(intent: ClassifiedIntent): DecompositionPlan | null {
    const lower = intent.rawMessage.toLowerCase();
    const pattern = COMPOSITE_PATTERNS.find(p => p.trigger.some(t => lower.includes(t)));
    if (!pattern) return null;

    const steps: DecomposedTask[] = pattern.steps.map((step, idx) => ({
      ...step,
      id: `step_${idx + 1}`,
      stepNumber: idx + 1,
      dependsOn: idx > 0 ? [`step_${idx}`] : [],
    }));

    return {
      planId: `plan_${Date.now()}`,
      originalRequest: intent.rawMessage,
      steps,
      totalEstimatedSeconds: steps.reduce((s, t) => s + t.estimatedDurationSeconds, 0),
      requiresHumanGating: steps.some(s => s.requiresHumanInput),
      summary: this.buildSummary(steps),
    };
  }

  /** Format a plan as a numbered list for the Copilot response. */
  formatPlanForDisplay(plan: DecompositionPlan): string {
    const lines = [`Here's what I'll do:\n`];
    for (const step of plan.steps) {
      const icon = step.requiresHumanInput ? '⏸️' : '⚡';
      lines.push(`${icon} **Step ${step.stepNumber}:** ${step.description}`);
      if (step.humanInputPrompt) lines.push(`   *Pause for your confirmation: ${step.humanInputPrompt}*`);
    }
    lines.push(`\nEstimated time: ~${Math.round(plan.totalEstimatedSeconds / 60)} minute(s)`);
    if (plan.requiresHumanGating) lines.push(`\nI'll pause at each ⏸️ step for your confirmation.`);
    return lines.join('\n');
  }

  private buildSummary(steps: DecomposedTask[]): string {
    return steps.map(s => s.description).join(' → ');
  }
}
