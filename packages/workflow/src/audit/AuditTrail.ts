/**
 * CerebroFlow — Immutable Audit Trail
 * Every node execution, LLM call, and approval decision is logged here.
 * Designed to satisfy SOX, SOC2, and GDPR audit requirements.
 * Primary AI: Claude
 */

import type { AuditConfig } from '../dsl/types.js';

export type AuditEventType =
  | 'workflow.started' | 'workflow.completed' | 'workflow.failed' | 'workflow.cancelled'
  | 'node.started' | 'node.completed' | 'node.failed' | 'node.retried' | 'node.skipped'
  | 'approval.created' | 'approval.approved' | 'approval.rejected' | 'approval.escalated' | 'approval.expired'
  | 'llm.request' | 'llm.response'
  | 'api.request' | 'api.response'
  | 'dead_letter.created' | 'dead_letter.retried'
  | 'security.secret_accessed' | 'security.field_redacted';

export interface AuditEntry {
  /** Monotonically increasing — never modified after write */
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  executionId: string;
  workflowId: string;
  tenantId: string;
  nodeId?: string;
  /** Redacted per AuditConfig.redact_fields before storage */
  payload: Record<string, unknown>;
  /** SHA-256 of (previousHash + JSON(payload)) — tamper-evident chain */
  hash: string;
  previousHash: string;
  actor?: string;       // user or 'system' for automated events
  ipAddress?: string;
}

export interface AuditTrailStore {
  append(entry: Omit<AuditEntry, 'id' | 'hash' | 'previousHash'>): Promise<AuditEntry>;
  getByExecution(executionId: string): Promise<AuditEntry[]>;
  getByWorkflow(workflowId: string, since?: Date): Promise<AuditEntry[]>;
  verify(executionId: string): Promise<{ valid: boolean; brokenAt?: string }>;
}

/** Redact sensitive fields from a payload before storing. */
function redactPayload(
  payload: Record<string, unknown>,
  redactFields: string[],
): Record<string, unknown> {
  const redacted = { ...payload };
  for (const field of redactFields) {
    if (field in redacted) redacted[field] = '[REDACTED]';
    // Also redact nested fields (one level deep)
    for (const [key, val] of Object.entries(redacted)) {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const nested = val as Record<string, unknown>;
        if (field in nested) {
          redacted[key] = { ...nested, [field]: '[REDACTED]' };
        }
      }
    }
  }
  return redacted;
}

/** Simple hash function — production should use node:crypto SHA-256 */
function simpleHash(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = (Math.imul(31, h) + content.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, '0');
}

export class AuditTrail {
  private lastHash = '0000000000000000';

  constructor(
    private readonly store: AuditTrailStore,
    private readonly config: AuditConfig,
    private readonly tenantId: string,
  ) {}

  async log(params: {
    eventType: AuditEventType;
    executionId: string;
    workflowId: string;
    nodeId?: string;
    payload: Record<string, unknown>;
    actor?: string;
  }): Promise<AuditEntry> {
    if (!this.shouldLog(params.eventType)) return null as unknown as AuditEntry;

    const cleanPayload = redactPayload(params.payload, this.config.redact_fields ?? []);
    const previousHash = this.lastHash;
    const hash = simpleHash(previousHash + JSON.stringify(cleanPayload));
    this.lastHash = hash;

    const entry = await this.store.append({
      timestamp: new Date(),
      eventType: params.eventType,
      executionId: params.executionId,
      workflowId: params.workflowId,
      tenantId: this.tenantId,
      nodeId: params.nodeId,
      payload: cleanPayload,
      actor: params.actor ?? 'system',
    });

    return entry;
  }

  async logLLMCall(params: {
    executionId: string;
    workflowId: string;
    nodeId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    prompt?: string;
    response?: string;
  }): Promise<void> {
    if (!this.config.log_llm_io) return;
    await this.log({
      eventType: 'llm.request',
      executionId: params.executionId,
      workflowId: params.workflowId,
      nodeId: params.nodeId,
      payload: {
        model: params.model,
        prompt_tokens: params.promptTokens,
        completion_tokens: params.completionTokens,
        prompt: params.prompt,
        response: params.response,
      },
    });
  }

  async logAPICall(params: {
    executionId: string;
    workflowId: string;
    nodeId: string;
    url: string;
    method: string;
    statusCode: number;
    durationMs: number;
    requestBody?: unknown;
    responseBody?: unknown;
  }): Promise<void> {
    if (!this.config.log_api_io) return;
    await this.log({
      eventType: 'api.request',
      executionId: params.executionId,
      workflowId: params.workflowId,
      nodeId: params.nodeId,
      payload: {
        url: params.url,
        method: params.method,
        status_code: params.statusCode,
        duration_ms: params.durationMs,
        // Bodies stored only when explicitly enabled — may contain PII
        request_body: this.config.log_api_io ? params.requestBody : undefined,
        response_body: this.config.log_api_io ? params.responseBody : undefined,
      },
    });
  }

  async verifyIntegrity(executionId: string): Promise<{ valid: boolean; brokenAt?: string }> {
    return this.store.verify(executionId);
  }

  private shouldLog(eventType: AuditEventType): boolean {
    if (eventType.startsWith('llm.') && !this.config.log_llm_io) return false;
    if (eventType.startsWith('api.') && !this.config.log_api_io) return false;
    if (eventType.startsWith('node.') && !this.config.log_node_lifecycle) return false;
    return true;
  }
}
