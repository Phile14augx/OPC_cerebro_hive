/**
 * CerebroCopilot — Safety Guardrails
 * Defines what Copilot will and will not do autonomously.
 * Every execute-level action passes through here before invocation.
 * Primary AI: Claude
 */

import type { ClassifiedIntent, ActionVerb, CopilotDomain } from '../intent/IntentClassifier.js';

export interface GuardrailDecision {
  allowed: boolean;
  requiresConfirmation: boolean;
  reason?: string;
  /** Suggested safer alternative if blocked */
  alternative?: string;
  /** Risk level for audit */
  riskLevel: 'low' | 'medium' | 'high' | 'blocked';
}

export interface UserPermissions {
  userId: string;
  roles: string[];
  approvalLimit?: number;       // financial approval ceiling in USD
  canExecuteWorkflows: boolean;
  canModifyUsers: boolean;
  canAccessFinancials: boolean;
  canViewPII: boolean;
  dataClassificationAccess: ('public' | 'internal' | 'confidential' | 'restricted')[];
}

// ─── Hard blocks — never execute regardless of role ───────────────────────────

const HARD_BLOCKED_ACTIONS: Array<{ domain: CopilotDomain; action: ActionVerb; reason: string }> = [
  { domain: 'identity', action: 'delete', reason: 'User account deletion requires IT admin action via ITSM ticket, not Copilot.' },
  { domain: 'security', action: 'delete', reason: 'Security policy deletion requires CISO approval via HiveShield.' },
  { domain: 'finance', action: 'delete', reason: 'Financial record deletion is irreversible. Raise a correction request via HiveFinance.' },
  { domain: 'data', action: 'delete', reason: 'Data deletion triggers GDPR workflows. Use HiveData compliance delete flow.' },
];

// ─── Actions requiring explicit user confirmation ─────────────────────────────

const CONFIRM_REQUIRED: Array<{ domain: CopilotDomain; actions: ActionVerb[]; message: string }> = [
  { domain: 'finance', actions: ['create', 'approve', 'trigger'], message: 'This action will affect financial records. Please confirm before I proceed.' },
  { domain: 'workflow', actions: ['trigger'], message: 'This will start an automated workflow that may send emails and update records. Confirm?' },
  { domain: 'hr', actions: ['create', 'update'], message: 'Employee data changes are sensitive. Confirm this update?' },
  { domain: 'legal', actions: ['create', 'update', 'approve'], message: 'Legal document actions carry binding implications. Please confirm.' },
  { domain: 'security', actions: ['create', 'update'], message: 'Security configuration changes require confirmation.' },
];

// ─── PII-sensitive domains ────────────────────────────────────────────────────

const PII_DOMAINS: CopilotDomain[] = ['hr', 'identity', 'security'];

export class SafetyGuardrails {
  /**
   * Evaluate whether an intent is safe to execute.
   * Call this before every action with autonomyLevel === 'execute'.
   */
  evaluate(intent: ClassifiedIntent, permissions: UserPermissions): GuardrailDecision {
    // 1. Hard block check
    const hardBlock = HARD_BLOCKED_ACTIONS.find(
      b => b.domain === intent.domain && b.action === intent.action,
    );
    if (hardBlock) {
      return { allowed: false, requiresConfirmation: false, reason: hardBlock.reason, riskLevel: 'blocked' };
    }

    // 2. Permission checks
    const permissionResult = this.checkPermissions(intent, permissions);
    if (!permissionResult.allowed) return permissionResult;

    // 3. Financial approval limit check
    if (intent.domain === 'finance') {
      const amountEntity = intent.entities.find(e => e.type === 'amount');
      if (amountEntity && permissions.approvalLimit != null) {
        const amount = parseFloat(amountEntity.normalized ?? '0');
        if (amount > permissions.approvalLimit) {
          return {
            allowed: false,
            requiresConfirmation: false,
            reason: `This action involves $${amount.toLocaleString()} which exceeds your approval limit of $${permissions.approvalLimit.toLocaleString()}.`,
            alternative: `I can draft the approval request for your finance director instead.`,
            riskLevel: 'blocked',
          };
        }
      }
    }

    // 4. PII access check
    if (PII_DOMAINS.includes(intent.domain) && !permissions.canViewPII) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: 'This action involves personal data. Your current role does not have PII access.',
        riskLevel: 'blocked',
      };
    }

    // 5. Confirmation required check
    const confirmRule = CONFIRM_REQUIRED.find(
      r => r.domain === intent.domain && r.actions.includes(intent.action),
    );
    if (confirmRule) {
      return { allowed: true, requiresConfirmation: true, reason: confirmRule.message, riskLevel: 'medium' };
    }

    // 6. Low confidence — suggest instead of execute
    if (intent.confidence < 0.6) {
      return {
        allowed: true,
        requiresConfirmation: true,
        reason: `I'm not fully certain I understood the request correctly. Let me confirm before I act.`,
        riskLevel: 'low',
      };
    }

    return { allowed: true, requiresConfirmation: false, riskLevel: 'low' };
  }

  /** Generate a refusal message that is helpful, not preachy. */
  buildRefusalMessage(decision: GuardrailDecision, intent: ClassifiedIntent): string {
    const lines: string[] = [];
    lines.push(`I can't do that directly — ${decision.reason}`);
    if (decision.alternative) lines.push(`\n**What I can do instead:** ${decision.alternative}`);
    if (intent.suggestedProducts.length) {
      lines.push(`\nThe right place to action this is **${intent.suggestedProducts.join(' or ')}**.`);
    }
    return lines.join('');
  }

  /** What CerebroCopilot WILL do — product-facing summary for the onboarding experience. */
  static capabilities(): string[] {
    return [
      'Answer questions about your business data, KPIs, and processes',
      'Search and summarise documents in CerebroArchive',
      'Draft contracts, emails, reports, and analyses',
      'Trigger CerebroFlow workflows (with your confirmation)',
      'Generate and explain data insights from CerebroInsight',
      'Create and route approval requests across HiveFinance, HiveHR, and HiveLegal',
      'Analyse incidents and draft post-mortems for HiveOps',
      'Explain your compliance posture across SOC2, GDPR, and ISO27001',
      'Find the right agent or workflow template for any business process',
      'Surface proactive insights before you ask (opt-in)',
    ];
  }

  /** What CerebroCopilot will NOT do — guardrail transparency. */
  static limitations(): string[] {
    return [
      'Delete financial, HR, or legal records (requires dedicated workflow + human approval)',
      'Approve transactions above your personal approval limit',
      'Access data outside your role\'s classification level',
      'Execute irreversible system changes without explicit confirmation',
      'Access personal data (PII) without the appropriate data access role',
      'Send external communications on your behalf without confirmation',
      'Make legal or financial commitments without the correct authorisation chain',
    ];
  }

  private checkPermissions(intent: ClassifiedIntent, permissions: UserPermissions): GuardrailDecision {
    if (intent.domain === 'identity' && !permissions.canModifyUsers) {
      return { allowed: false, requiresConfirmation: false, reason: 'You do not have user management permissions.', riskLevel: 'blocked' };
    }
    if (intent.domain === 'finance' && !permissions.canAccessFinancials && intent.action !== 'read') {
      return { allowed: false, requiresConfirmation: false, reason: 'Financial write access is required for this action.', riskLevel: 'blocked' };
    }
    if (intent.domain === 'workflow' && !permissions.canExecuteWorkflows && intent.action === 'trigger') {
      return { allowed: false, requiresConfirmation: false, reason: 'You do not have permission to trigger workflows.', alternative: 'I can show you the workflow and you can trigger it yourself.', riskLevel: 'blocked' };
    }
    return { allowed: true, requiresConfirmation: false, riskLevel: 'low' };
  }
}
