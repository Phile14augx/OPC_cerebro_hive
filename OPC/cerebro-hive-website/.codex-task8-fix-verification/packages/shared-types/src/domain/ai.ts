// ── AI provider + model domain types ─────────────────────────────────────────

export type AIProvider = "anthropic" | "openai" | "google" | "bedrock" | "cohere" | "mistral" | "groq";
export type ModalityType = "text" | "image" | "audio" | "video" | "embedding";

export interface ModelCapabilities {
  contextWindow:      number;       // max input tokens
  maxOutputTokens:    number;
  modalities:         ModalityType[];
  supportsStreaming:   boolean;
  supportsFunctionCalling: boolean;
  supportsVision:      boolean;
  supportsJsonMode:    boolean;
  fineTunable:         boolean;
}

export interface ModelDefinition {
  id:               string;         // e.g. "claude-sonnet-4-6"
  provider:         AIProvider;
  displayName:      string;
  description:      string;
  capabilities:     ModelCapabilities;
  inputPricePerMToken:  number;     // USD per million input tokens
  outputPricePerMToken: number;     // USD per million output tokens
  embeddingDimensions?: number;     // for embedding models
  deprecated:       boolean;
  releaseDate:      string;
}

export interface AIUsageRecord {
  id:             string;
  orgId:          string;
  workflowId:     string | null;
  executionId:    string | null;
  agentId:        string | null;
  userId:         string | null;
  provider:       AIProvider;
  model:          string;
  inputTokens:    number;
  outputTokens:   number;
  totalTokens:    number;
  costUsd:        number;
  durationMs:     number;
  ttftMs:         number | null;
  cached:         boolean;
  streamed:       boolean;
  error:          string | null;
  finishReason:   string | null;
  requestId:      string;
  traceId:        string | null;
  createdAt:      string;
}

// ── Model registry (canonical model list) ────────────────────────────────────

export const MODELS: Record<string, ModelDefinition> = {
  "claude-sonnet-4-6": {
    id:             "claude-sonnet-4-6",
    provider:       "anthropic",
    displayName:    "Claude Sonnet 4.6",
    description:    "Anthropic's latest balanced model — fast, intelligent, cost-effective",
    capabilities: {
      contextWindow:          200_000,
      maxOutputTokens:         8_192,
      modalities:              ["text", "image"],
      supportsStreaming:        true,
      supportsFunctionCalling: true,
      supportsVision:          true,
      supportsJsonMode:        true,
      fineTunable:             false,
    },
    inputPricePerMToken:   3.0,
    outputPricePerMToken: 15.0,
    deprecated:  false,
    releaseDate: "2025-10-01",
  },

  "claude-haiku-4-5-20251001": {
    id:             "claude-haiku-4-5-20251001",
    provider:       "anthropic",
    displayName:    "Claude Haiku 4.5",
    description:    "Anthropic's fastest model — ideal for high-volume classification and triage",
    capabilities: {
      contextWindow:          200_000,
      maxOutputTokens:         4_096,
      modalities:              ["text"],
      supportsStreaming:        true,
      supportsFunctionCalling: true,
      supportsVision:          false,
      supportsJsonMode:        true,
      fineTunable:             false,
    },
    inputPricePerMToken:   0.8,
    outputPricePerMToken:  4.0,
    deprecated:  false,
    releaseDate: "2025-10-01",
  },

  "gpt-4o": {
    id:             "gpt-4o",
    provider:       "openai",
    displayName:    "GPT-4o",
    description:    "OpenAI multimodal flagship",
    capabilities: {
      contextWindow:          128_000,
      maxOutputTokens:          4_096,
      modalities:               ["text", "image", "audio"],
      supportsStreaming:         true,
      supportsFunctionCalling:  true,
      supportsVision:           true,
      supportsJsonMode:         true,
      fineTunable:              true,
    },
    inputPricePerMToken:   5.0,
    outputPricePerMToken: 15.0,
    deprecated:  false,
    releaseDate: "2024-05-13",
  },

  "gpt-4o-mini": {
    id:             "gpt-4o-mini",
    provider:       "openai",
    displayName:    "GPT-4o Mini",
    description:    "Fast, affordable OpenAI model for simpler tasks",
    capabilities: {
      contextWindow:          128_000,
      maxOutputTokens:         16_384,
      modalities:              ["text", "image"],
      supportsStreaming:        true,
      supportsFunctionCalling: true,
      supportsVision:          true,
      supportsJsonMode:        true,
      fineTunable:             true,
    },
    inputPricePerMToken:   0.15,
    outputPricePerMToken:  0.60,
    deprecated:  false,
    releaseDate: "2024-07-18",
  },
};

export function getModelCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const model = MODELS[modelId];
  if (!model) return 0;
  return (
    (inputTokens  / 1_000_000) * model.inputPricePerMToken +
    (outputTokens / 1_000_000) * model.outputPricePerMToken
  );
}
