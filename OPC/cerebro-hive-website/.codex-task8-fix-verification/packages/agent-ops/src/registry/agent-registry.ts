/**
 * AgentOps — Agent Registry
 * Centralized catalog of AI agents with capability discovery,
 * health tracking, and invocation routing.
 */

import crypto from "node:crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AgentStatus = "active" | "inactive" | "deprecated" | "beta";
export type AgentCapability =
  | "text-generation"
  | "code-generation"
  | "document-qa"
  | "web-search"
  | "data-analysis"
  | "image-understanding"
  | "tool-use"
  | "multi-step-reasoning"
  | "summarization"
  | "translation"
  | "classification"
  | "extraction";

export interface AgentTool {
  name:        string;
  description: string;
  schema:      Record<string, unknown>;  // JSON Schema
}

export interface AgentDefinition {
  id:             string;
  name:           string;
  version:        string;
  description:    string;
  capabilities:   AgentCapability[];
  tools:          AgentTool[];
  model:          string;
  systemPrompt:   string;
  maxIterations:  number;
  timeoutMs:      number;
  status:         AgentStatus;
  tags:           string[];
  createdAt:      string;
  updatedAt:      string;
  owner:          string;
  metrics?: {
    successRate:  number;
    avgLatencyMs: number;
    totalRuns:    number;
    lastRunAt:    string;
  };
}

export interface AgentRegistration extends Omit<AgentDefinition,
  "id" | "createdAt" | "updatedAt" | "metrics"> {}

// ── Registry ──────────────────────────────────────────────────────────────────

class AgentRegistry {
  private readonly agents = new Map<string, AgentDefinition>();

  register(def: AgentRegistration): AgentDefinition {
    const existing = this.findByNameVersion(def.name, def.version);
    if (existing) {
      throw new Error(`Agent '${def.name}@${def.version}' is already registered`);
    }

    // Validate all tool schemas have required fields
    for (const tool of def.tools) {
      if (!tool.name || !tool.description || !tool.schema) {
        throw new Error(
          `Agent '${def.name}': tool '${tool.name}' must have name, description, and schema`,
        );
      }
    }

    const agent: AgentDefinition = {
      ...def,
      id:        crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  get(id: string): AgentDefinition {
    const agent = this.agents.get(id);
    if (!agent) throw new Error(`Agent '${id}' not found`);
    return agent;
  }

  getByName(name: string, version?: string): AgentDefinition {
    if (version) {
      const found = this.findByNameVersion(name, version);
      if (!found) throw new Error(`Agent '${name}@${version}' not found`);
      return found;
    }

    // Return latest active version
    const matches = [...this.agents.values()]
      .filter((a) => a.name === name && a.status === "active")
      .sort((a, b) => b.version.localeCompare(a.version));

    if (matches.length === 0) {
      throw new Error(`No active agent named '${name}' found`);
    }
    return matches[0];
  }

  discover(options: {
    capabilities?: AgentCapability[];
    tags?: string[];
    status?: AgentStatus;
    model?: string;
  } = {}): AgentDefinition[] {
    return [...this.agents.values()].filter((agent) => {
      if (options.status && agent.status !== options.status) return false;
      if (options.model && agent.model !== options.model) return false;

      if (options.capabilities?.length) {
        const hasAll = options.capabilities.every((c) =>
          agent.capabilities.includes(c),
        );
        if (!hasAll) return false;
      }

      if (options.tags?.length) {
        const hasAny = options.tags.some((t) => agent.tags.includes(t));
        if (!hasAny) return false;
      }

      return true;
    });
  }

  recordRun(
    id: string,
    result: { success: boolean; latencyMs: number },
  ): void {
    const agent = this.agents.get(id);
    if (!agent) return;

    const m = agent.metrics ?? { successRate: 0, avgLatencyMs: 0, totalRuns: 0, lastRunAt: "" };
    const runs = m.totalRuns + 1;
    const prevSuccesses = Math.round(m.successRate * m.totalRuns);

    agent.metrics = {
      totalRuns:    runs,
      successRate:  (prevSuccesses + (result.success ? 1 : 0)) / runs,
      avgLatencyMs: (m.avgLatencyMs * m.totalRuns + result.latencyMs) / runs,
      lastRunAt:    new Date().toISOString(),
    };
    agent.updatedAt = new Date().toISOString();
  }

  deprecate(id: string): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status    = "deprecated";
      agent.updatedAt = new Date().toISOString();
    }
  }

  list(): AgentDefinition[] {
    return [...this.agents.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  private findByNameVersion(name: string, version: string): AgentDefinition | undefined {
    return [...this.agents.values()].find(
      (a) => a.name === name && a.version === version,
    );
  }
}

export const agentRegistry = new AgentRegistry();

// ── Pre-register CerebroHive built-in agents ──────────────────────────────────

export function registerBuiltinAgents(): void {
  agentRegistry.register({
    name:          "workflow-orchestrator",
    version:       "1.0.0",
    description:   "Orchestrates multi-step AI workflows, delegates sub-tasks to specialist agents",
    capabilities:  ["multi-step-reasoning", "tool-use", "text-generation"],
    model:         "claude-sonnet-4-6",
    status:        "active",
    owner:         "platform-team",
    tags:          ["orchestration", "workflow", "core"],
    maxIterations: 20,
    timeoutMs:     120_000,
    systemPrompt:
      "You are an expert workflow orchestrator for CerebroHive. You break down complex tasks " +
      "into steps, delegate to specialist agents, and synthesize results into coherent outputs. " +
      "Always validate intermediate results before proceeding.",
    tools: [
      {
        name:        "delegate_to_agent",
        description: "Delegate a sub-task to a specialist agent by name",
        schema: {
          type:       "object",
          required:   ["agent_name", "task", "context"],
          properties: {
            agent_name: { type: "string", description: "Name of the agent to delegate to" },
            task:       { type: "string", description: "The task to perform" },
            context:    { type: "string", description: "Relevant context for the sub-task" },
          },
        },
      },
      {
        name:        "query_knowledge_base",
        description: "Search the knowledge base for relevant documents",
        schema: {
          type:       "object",
          required:   ["query"],
          properties: {
            query:    { type: "string" },
            top_k:    { type: "number", default: 5 },
            filter:   { type: "object", description: "Metadata filters" },
          },
        },
      },
    ],
  });

  agentRegistry.register({
    name:          "code-reviewer",
    version:       "1.0.0",
    description:   "Reviews code changes for correctness, security, and best practices",
    capabilities:  ["code-generation", "text-generation", "multi-step-reasoning"],
    model:         "claude-sonnet-4-6",
    status:        "active",
    owner:         "platform-team",
    tags:          ["code", "review", "devsecops"],
    maxIterations: 5,
    timeoutMs:     60_000,
    systemPrompt:
      "You are an expert code reviewer specialising in TypeScript, Node.js, and cloud-native " +
      "applications. Review code for correctness, security vulnerabilities, performance, and " +
      "adherence to CerebroHive coding standards.",
    tools: [
      {
        name:        "search_codebase",
        description: "Search the codebase for related patterns or similar code",
        schema: {
          type:       "object",
          required:   ["query"],
          properties: {
            query:    { type: "string" },
            file_glob: { type: "string", description: "File pattern e.g. '**/*.ts'" },
          },
        },
      },
    ],
  });

  agentRegistry.register({
    name:          "data-analyst",
    version:       "1.0.0",
    description:   "Analyses platform metrics and generates insights from data",
    capabilities:  ["data-analysis", "text-generation", "summarization"],
    model:         "claude-sonnet-4-6",
    status:        "active",
    owner:         "platform-team",
    tags:          ["analytics", "metrics", "dataops"],
    maxIterations: 10,
    timeoutMs:     90_000,
    systemPrompt:
      "You are a senior data analyst for CerebroHive. You interpret platform metrics, " +
      "identify trends, detect anomalies, and produce actionable insights for engineering " +
      "and business stakeholders.",
    tools: [
      {
        name:        "query_prometheus",
        description: "Execute a PromQL query against the metrics store",
        schema: {
          type:       "object",
          required:   ["query"],
          properties: {
            query:  { type: "string", description: "PromQL expression" },
            range:  { type: "string", description: "Time range e.g. '24h', '7d'", default: "1h" },
            step:   { type: "string", description: "Resolution step e.g. '1m', '5m'", default: "5m" },
          },
        },
      },
      {
        name:        "query_database",
        description: "Run a read-only SQL query on the platform analytics database",
        schema: {
          type:       "object",
          required:   ["sql"],
          properties: {
            sql:     { type: "string", description: "Read-only SQL query" },
            timeout: { type: "number", description: "Query timeout in milliseconds", default: 10000 },
          },
        },
      },
    ],
  });
}
