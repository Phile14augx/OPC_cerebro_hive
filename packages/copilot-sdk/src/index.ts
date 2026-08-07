/**
 * CerebroCopilot SDK
 * @module @cerebro/copilot-sdk
 */

export { CopilotEngine } from './CopilotEngine.js';
export type { CopilotRequest, CopilotEngineOptions, ConversationMessage, LLMProvider, ProductCallHandler } from './CopilotEngine.js';

export { IntentClassifier } from './intent/IntentClassifier.js';
export type { ClassifiedIntent, ExtractedEntity, CopilotDomain, ActionVerb, AutonomyLevel } from './intent/IntentClassifier.js';

export { SafetyGuardrails } from './guardrails/SafetyGuardrails.js';
export type { GuardrailDecision, UserPermissions } from './guardrails/SafetyGuardrails.js';

export { TaskDecomposer } from './decomposer/TaskDecomposer.js';
export type { DecomposedTask, DecompositionPlan } from './decomposer/TaskDecomposer.js';

export { ProactiveInsightEngine } from './insights/ProactiveInsightEngine.js';
export type { ProactiveInsight, InsightCategory, InsightUrgency, SignalRule } from './insights/ProactiveInsightEngine.js';

export { encodeSSE, decodeSSE, tokenEvent, toolCallEvent, doneEvent, confirmationEvent } from './streaming/StreamingProtocol.js';
export type { StreamEvent, StreamEventType } from './streaming/StreamingProtocol.js';

export { DEFAULT_PERSONA, buildSystemPrompt } from './persona/PersonaConfig.js';
export type { PersonaConfig, CopilotTone } from './persona/PersonaConfig.js';
