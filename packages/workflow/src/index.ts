/**
 * CerebroFlow — Package Exports
 * @module @cerebro/workflow
 */

// DSL Types
export * from './dsl/types.js';

// Execution Engine
export { WorkflowEngine } from './engine/WorkflowEngine.js';
export type { WorkflowEngineOptions, AuditEvent, NodeRunner } from './engine/WorkflowEngine.js';

// NL Compiler
export { NLWorkflowCompiler } from './compiler/NLWorkflowCompiler.js';

// Escalation
export { EscalationManager } from './escalation/EscalationManager.js';
export type { ApprovalTask, NotificationPayload, EscalationManagerOptions } from './escalation/EscalationManager.js';

// Audit Trail
export { AuditTrail } from './audit/AuditTrail.js';
export type { AuditEntry, AuditEventType, AuditTrailStore } from './audit/AuditTrail.js';

// Workflow Templates
export { WORKFLOW_TEMPLATES, TEMPLATE_COUNT, getTemplateById, getTemplatesByCategory, searchTemplates } from './templates/index.js';

// Legacy (keep backward compat with existing consumers)
export type { DAGNode, WorkflowGraph } from './types/workflow.js';
