/**
 * LLMOps — Versioned Prompt Registry
 * Stores prompts with semver, content hashing, and A/B experiment metadata.
 * Backed by PostgreSQL (Prisma) in production, in-memory for tests.
 */

import crypto from "node:crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PromptRole = "system" | "user" | "assistant";

export interface PromptMessage {
  role: PromptRole;
  content: string;
}

export interface PromptVariables {
  [key: string]: string | number | boolean;
}

export interface PromptVersion {
  id:           string;        // UUID
  name:         string;        // e.g. "workflow-summarizer"
  version:      string;        // semver: "1.2.3"
  messages:     PromptMessage[];
  variables:    string[];      // required template variables
  model:        string;        // recommended model
  maxTokens:    number;
  temperature:  number;
  description:  string;
  changelog:    string;
  contentHash:  string;        // SHA-256 of messages JSON
  tags:         string[];
  isActive:     boolean;
  createdAt:    string;
  createdBy:    string;
  evalResults?: {
    version:    string;
    passRate:   number;
    avgScore:   number;
        date:   string;
  };
}

export interface PromptRenderContext {
  variables: PromptVariables;
  overrides?: Partial<Pick<PromptVersion, "model" | "maxTokens" | "temperature">>;
}

// ── In-memory store (swap for Prisma/DB in production) ────────────────────────

const store = new Map<string, PromptVersion[]>();  // key = name

export function registerPrompt(prompt: Omit<PromptVersion, "contentHash" | "createdAt">): PromptVersion {
  const contentHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(prompt.messages))
    .digest("hex");

  const full: PromptVersion = {
    ...prompt,
    contentHash,
    createdAt: new Date().toISOString(),
  };

  const versions = store.get(prompt.name) ?? [];

  // Enforce: version must not already exist
  if (versions.some((v) => v.version === prompt.version)) {
    throw new Error(
      `Prompt '${prompt.name}@${prompt.version}' already exists. Bump the version.`,
    );
  }

  // Enforce: content must differ from previous version
  if (versions.some((v) => v.contentHash === contentHash)) {
    throw new Error(
      `Prompt '${prompt.name}@${prompt.version}' has identical content to an existing version. ` +
      `Did you forget to make changes?`,
    );
  }

  versions.push(full);
  store.set(prompt.name, versions);
  return full;
}

export function getPrompt(name: string, version?: string): PromptVersion {
  const versions = store.get(name);
  if (!versions || versions.length === 0) {
    throw new Error(`Prompt '${name}' not found in registry`);
  }

  if (version) {
    const match = versions.find((v) => v.version === version);
    if (!match) throw new Error(`Prompt '${name}@${version}' not found`);
    return match;
  }

  // Return the latest active version
  const active = versions
    .filter((v) => v.isActive)
    .sort((a, b) => semverCompare(b.version, a.version));

  if (active.length === 0) {
    throw new Error(`No active version of prompt '${name}' found`);
  }
  return active[0];
}

export function listPrompts(): PromptVersion[] {
  const all: PromptVersion[] = [];
  for (const versions of store.values()) {
    all.push(...versions);
  }
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export function deactivatePrompt(name: string, version: string): void {
  const versions = store.get(name);
  if (!versions) throw new Error(`Prompt '${name}' not found`);
  const v = versions.find((p) => p.version === version);
  if (!v) throw new Error(`Prompt '${name}@${version}' not found`);
  v.isActive = false;
}

// ── Template rendering ────────────────────────────────────────────────────────

export function renderPrompt(
  prompt: PromptVersion,
  ctx: PromptRenderContext,
): {
  messages: PromptMessage[];
  model: string;
  maxTokens: number;
  temperature: number;
} {
  // Validate required variables are present
  const missing = prompt.variables.filter((v) => !(v in ctx.variables));
  if (missing.length > 0) {
    throw new Error(
      `Prompt '${prompt.name}@${prompt.version}' missing required variables: ${missing.join(", ")}`,
    );
  }

  // Interpolate {{variable}} placeholders
  const rendered = prompt.messages.map((msg) => ({
    ...msg,
    content: msg.content.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => String(ctx.variables[key] ?? `{{${key}}}`),
    ),
  }));

  return {
    messages:    rendered,
    model:       ctx.overrides?.model       ?? prompt.model,
    maxTokens:   ctx.overrides?.maxTokens   ?? prompt.maxTokens,
    temperature: ctx.overrides?.temperature ?? prompt.temperature,
  };
}

// ── Semver comparison (no deps) ───────────────────────────────────────────────

function semverCompare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
  }
  return 0;
}

// ── Built-in CerebroHive prompt definitions ───────────────────────────────────

export function loadDefaultPrompts(): void {
  registerPrompt({
    id:          "00000000-0000-0000-0000-000000000001",
    name:        "workflow-summarizer",
    version:     "1.0.0",
    model:       "claude-sonnet-4-6",
    maxTokens:   1024,
    temperature: 0.3,
    description: "Summarizes the result of a completed AI workflow run",
    changelog:   "Initial version",
    tags:        ["workflow", "summarization"],
    isActive:    true,
    createdBy:   "platform-team",
    variables:   ["workflow_name", "steps_completed", "output"],
    messages: [
      {
        role:    "system",
        content: "You are an expert at summarizing AI workflow results for enterprise users. " +
                 "Be concise, clear, and focus on what matters to the user.",
      },
      {
        role:    "user",
        content: "Summarize this completed workflow:\n\n" +
                 "Workflow: {{workflow_name}}\n" +
                 "Steps completed: {{steps_completed}}\n" +
                 "Output:\n{{output}}\n\n" +
                 "Provide a 2-3 sentence summary suitable for a business stakeholder.",
      },
    ],
  });

  registerPrompt({
    id:          "00000000-0000-0000-0000-000000000002",
    name:        "document-qa",
    version:     "1.0.0",
    model:       "claude-sonnet-4-6",
    maxTokens:   2048,
    temperature: 0.1,
    description: "Question answering over retrieved document chunks",
    changelog:   "Initial RAG QA prompt",
    tags:        ["rag", "qa", "knowledge"],
    isActive:    true,
    createdBy:   "platform-team",
    variables:   ["context_chunks", "question"],
    messages: [
      {
        role:    "system",
        content: "You are a precise, factual assistant. Answer questions using ONLY the provided " +
                 "context documents. If the answer is not in the context, say so explicitly. " +
                 "Cite the relevant section when possible.",
      },
      {
        role:    "user",
        content: "Context documents:\n\n{{context_chunks}}\n\n---\n\nQuestion: {{question}}",
      },
    ],
  });

  registerPrompt({
    id:          "00000000-0000-0000-0000-000000000003",
    name:        "code-reviewer",
    version:     "1.0.0",
    model:       "claude-sonnet-4-6",
    maxTokens:   4096,
    temperature: 0.2,
    description: "AI-powered code review for PRs",
    changelog:   "Initial code review prompt",
    tags:        ["code", "review", "devsecops"],
    isActive:    true,
    createdBy:   "platform-team",
    variables:   ["language", "diff", "pr_description"],
    messages: [
      {
        role:    "system",
        content: "You are an expert software engineer conducting a code review. Focus on: " +
                 "correctness, security, performance, maintainability, and test coverage. " +
                 "Be constructive and specific. Use the CerebroHive coding standards.",
      },
      {
        role:    "user",
        content: "Review this {{language}} code change:\n\nPR Description: {{pr_description}}\n\n" +
                 "Diff:\n```\n{{diff}}\n```\n\n" +
                 "Provide structured feedback with severity (critical/major/minor/nitpick).",
      },
    ],
  });
}
