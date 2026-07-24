/**
 * @cerebro/db — Comprehensive development seed
 *
 * Creates a full demo org with users, workflows, agents, knowledge collections,
 * AI usage records, and audit events — enough data to exercise every UI page.
 *
 * Usage: pnpm --filter @cerebro/db seed
 *        (also run automatically by `prisma db seed`)
 */

import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";

const prisma = new PrismaClient({ log: ["error"] });

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid()   { return randomBytes(6).toString("hex"); }
function past(d: number, h = 0, m = 0) {
  return new Date(Date.now() - d * 86_400_000 - h * 3_600_000 - m * 60_000);
}
function hashKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding CerebroHive demo data…");

  // ── Organisation ─────────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where:  { slug: "acme-corp" },
    update: {},
    create: {
      name:            "Acme Corp",
      slug:            "acme-corp",
      plan:            "pro",
      maxWorkflows:    50,
      maxExecutions:   10_000,
      maxAgents:       20,
      maxStorageBytes: BigInt(10 * 1024 * 1024 * 1024), // 10 GB
    },
  });
  console.log(`  ✓  Org: ${org.name} (${org.id})`);

  // ── Users ────────────────────────────────────────────────────────────────────
  const userSeeds = [
    { email: "admin@acme.com",     name: "Alex Admin",    role: "OWNER"     as const },
    { email: "dev@acme.com",       name: "Dana Developer", role: "DEVELOPER" as const },
    { email: "analyst@acme.com",   name: "Ana Analyst",   role: "ANALYST"   as const },
    { email: "viewer@acme.com",    name: "Val Viewer",    role: "VIEWER"    as const },
  ];

  const users: Awaited<ReturnType<typeof prisma.user.upsert>>[] = [];
  for (const seed of userSeeds) {
    const user = await prisma.user.upsert({
      where:  { email: seed.email },
      update: {},
      create: {
        email:       seed.email,
        displayName: seed.name,
        authType:    "OIDC",
        status:      "ACTIVE",
        memberships: {
          create: {
            orgId:     org.id,
            role:      seed.role,
            joinedAt:  past(30),
          },
        },
      },
    });
    users.push(user);
  }
  const adminUser = users[0]!;
  const devUser   = users[1]!;
  console.log(`  ✓  Users: ${users.length}`);

  // ── API Keys ──────────────────────────────────────────────────────────────────
  const rawSecret = `sk_${uid()}_${randomBytes(16).toString("base64url")}`;
  await prisma.apiKey.upsert({
    where:  { prefix: "ck_seed01" },
    update: {},
    create: {
      orgId:       org.id,
      userId:      adminUser.id,
      name:        "Seed Demo Key",
      prefix:      "ck_seed01",
      keyHash:     hashKey(rawSecret),
      permissions: ["workflows:read", "workflows:execute", "agents:read", "ai:chat"],
      expiresAt:   past(-365), // 1 year from now
    },
  });
  console.log(`  ✓  API key created (prefix: ck_seed01)`);

  // ── Workflows ─────────────────────────────────────────────────────────────────
  const workflowSeeds = [
    {
      name:        "Customer Support Auto-Triage",
      description: "Classifies incoming support tickets, routes to the right queue, and drafts initial responses",
      status:      "PUBLISHED" as const,
      version:     3,
      tags:        ["support", "classification", "automation"],
      definition: {
        steps: [
          { id: "classify",  type: "ai",   model: "claude-haiku-4-5-20251001", promptSlug: "customer-support-triage", dependsOn: [] },
          { id: "route",     type: "code", code: "return { queue: input.category, priority: input.priority };",        dependsOn: ["classify"] },
          { id: "draft",     type: "ai",   model: "claude-sonnet-5",           promptSlug: "support-draft-reply",       dependsOn: ["classify"] },
          { id: "notify",    type: "http", url: "{{env.SLACK_WEBHOOK_URL}}",    method: "POST",                         dependsOn: ["route", "draft"] },
        ],
      },
    },
    {
      name:        "Code Review Pipeline",
      description: "Automatically reviews pull requests for security issues, bugs, and style violations",
      status:      "PUBLISHED" as const,
      version:     2,
      tags:        ["engineering", "code-review", "security"],
      definition: {
        steps: [
          { id: "fetch-diff",   type: "http", url: "{{env.GITHUB_API}}/pulls/{{input.prNumber}}/files", dependsOn: [] },
          { id: "security-scan", type: "ai",  model: "claude-sonnet-5", promptSlug: "code-review-assistant", dependsOn: ["fetch-diff"] },
          { id: "post-comment",  type: "http", url: "{{env.GITHUB_API}}/pulls/{{input.prNumber}}/reviews", method: "POST", dependsOn: ["security-scan"] },
        ],
      },
    },
    {
      name:        "Document Ingestion Pipeline",
      description: "Processes uploaded documents: chunking, embedding, and indexing into pgvector",
      status:      "PUBLISHED" as const,
      version:     1,
      tags:        ["knowledge", "rag", "ingestion"],
      definition: {
        steps: [
          { id: "extract",  type: "code", code: "return extractText(input.document);",                   dependsOn: [] },
          { id: "chunk",    type: "code", code: "return chunk(input.text, { size: 512, overlap: 50 });", dependsOn: ["extract"] },
          { id: "embed",    type: "ai",   model: "text-embedding-3-small",                               dependsOn: ["chunk"] },
          { id: "store",    type: "code", code: "await pgvector.upsert(input.embeddings);",              dependsOn: ["embed"] },
          { id: "summarize", type: "ai",  model: "claude-haiku-4-5-20251001", promptSlug: "document-summarizer", dependsOn: ["extract"] },
        ],
      },
    },
    {
      name:        "AI Cost Anomaly Alert",
      description: "Monitors AI spend hourly; pages on-call if cost exceeds budget thresholds",
      status:      "PUBLISHED" as const,
      version:     1,
      tags:        ["finops", "monitoring", "aiops"],
      definition: {
        steps: [
          { id: "fetch-spend",   type: "http",  url: "{{env.PLATFORM_API}}/v1/ai/usage", dependsOn: [] },
          { id: "check-budget",  type: "code",  code: "return spend > threshold ? 'alert' : 'ok';",    dependsOn: ["fetch-spend"] },
          { id: "generate-explanation", type: "ai", model: "claude-sonnet-5", promptSlug: "anomaly-explanation", dependsOn: ["fetch-spend"] },
          { id: "page-oncall",   type: "http",  url: "{{env.PAGERDUTY_URL}}", condition: "$.status === 'alert'", dependsOn: ["check-budget", "generate-explanation"] },
        ],
      },
    },
    {
      name:        "Monthly Report Generator",
      description: "Generates executive AI usage and ROI reports, emails to stakeholders",
      status:      "DRAFT" as const,
      version:     1,
      tags:        ["reporting", "finops"],
      definition: {
        steps: [
          { id: "collect",  type: "http", url: "{{env.PLATFORM_API}}/v1/ai/usage", dependsOn: [] },
          { id: "render",   type: "ai",   model: "claude-opus-4-8", dependsOn: ["collect"] },
          { id: "email",    type: "http", url: "{{env.SENDGRID_URL}}", method: "POST", dependsOn: ["render"] },
        ],
      },
    },
  ];

  const workflows: Awaited<ReturnType<typeof prisma.workflow.create>>[] = [];
  for (const seed of workflowSeeds) {
    const wf = await prisma.workflow.create({
      data: {
        orgId:       org.id,
        name:        seed.name,
        description: seed.description,
        status:      seed.status,
        version:     seed.version,
        definition:  seed.definition,
        tags:        seed.tags,
        createdById: devUser.id,
        updatedById: devUser.id,
        publishedAt: seed.status === "PUBLISHED" ? past(Math.floor(Math.random() * 20) + 1) : null,
        createdAt:   past(30 + Math.floor(Math.random() * 30)),
        updatedAt:   past(Math.floor(Math.random() * 7)),
      },
    });
    workflows.push(wf);
  }
  console.log(`  ✓  Workflows: ${workflows.length}`);

  // ── Executions ────────────────────────────────────────────────────────────────
  const EXECUTION_STATUSES = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "FAILED", "RUNNING"] as const;
  let executionCount = 0;

  for (const wf of workflows.filter(w => w.status === "PUBLISHED")) {
    const runCount = Math.floor(Math.random() * 80) + 20;
    for (let i = 0; i < runCount; i++) {
      const status  = EXECUTION_STATUSES[Math.floor(Math.random() * EXECUTION_STATUSES.length)]!;
      const daysAgo = Math.floor(Math.random() * 14);
      const startedAt = past(daysAgo, Math.floor(Math.random() * 23), Math.floor(Math.random() * 59));
      const durationMs = status === "RUNNING" ? null : Math.floor(Math.random() * 8_000) + 200;

      await prisma.workflowExecution.create({
        data: {
          workflowId:      wf.id,
          orgId:           org.id,
          status,
          triggerType:     Math.random() > 0.3 ? "api" : "schedule",
          triggeredById:   devUser.id,
          input:           { ticket_content: `Demo ticket #${uid()}`, env: "production" },
          output:          status === "COMPLETED" ? { category: "technical", priority: "high", summary: "Resolved" } : null,
          testMode:        Math.random() < 0.1,
          startedAt,
          completedAt:     durationMs ? new Date(startedAt.getTime() + durationMs) : null,
          durationMs,
          totalTokensUsed: status === "COMPLETED" ? Math.floor(Math.random() * 3000) + 200 : null,
          totalCostUsd:    status === "COMPLETED" ? (Math.random() * 0.05).toFixed(6) : null,
          error:           status === "FAILED" ? { code: "STEP_FAILED", step: "classify", message: "Rate limit exceeded" } : null,
        },
      });
      executionCount++;
    }
  }
  console.log(`  ✓  Executions: ${executionCount}`);

  // ── Agents ────────────────────────────────────────────────────────────────────
  const agentSeeds = [
    {
      name:         "CerebroAssist",
      slug:         "cerebro-assist",
      description:  "General-purpose AI assistant with access to company knowledge base",
      modelId:      "claude-sonnet-5",
      status:       "ACTIVE" as const,
      instructions: "You are CerebroAssist, a helpful AI assistant for Acme Corp. You have access to our internal knowledge base, can search documentation, and help employees with their work. Always be professional and cite sources.",
      tools:        ["knowledge_search", "web_search", "code_interpreter"],
      maxTokens:    4096,
    },
    {
      name:         "SupportBot",
      slug:         "support-bot",
      description:  "Handles tier-1 customer support with automatic escalation",
      modelId:      "claude-haiku-4-5-20251001",
      status:       "ACTIVE" as const,
      instructions: "You are a tier-1 customer support agent for Acme Corp. Handle common issues, answer FAQ questions, and escalate complex issues to human agents.",
      tools:        ["knowledge_search", "ticket_system", "customer_lookup"],
      maxTokens:    2048,
    },
    {
      name:         "CodeReviewer",
      slug:         "code-reviewer",
      description:  "Automated code review agent integrated with GitHub",
      modelId:      "claude-sonnet-5",
      status:       "ACTIVE" as const,
      instructions: "You are an expert software engineer performing thorough code reviews. Focus on: security vulnerabilities, performance issues, maintainability, test coverage, and adherence to team coding standards.",
      tools:        ["github_api", "code_interpreter", "web_search"],
      maxTokens:    8192,
    },
    {
      name:         "DataAnalyst",
      slug:         "data-analyst",
      description:  "Business intelligence agent that queries data and generates reports",
      modelId:      "claude-opus-4-8",
      status:       "ACTIVE" as const,
      instructions: "You are a senior data analyst. Query the data warehouse, create visualizations, and generate insights. Always validate data quality before drawing conclusions.",
      tools:        ["sql_executor", "chart_generator", "data_warehouse"],
      maxTokens:    4096,
    },
    {
      name:         "SecOpsAgent",
      slug:         "secops-agent",
      description:  "Security monitoring agent that analyzes alerts and generates incident reports",
      modelId:      "claude-opus-4-8",
      status:       "DEPRECATED" as const,
      instructions: "You are a security operations specialist. Analyze security alerts, correlate events, assess severity, and generate detailed incident reports with recommended remediation steps.",
      tools:        ["siem_query", "threat_intel", "ticket_system"],
      maxTokens:    4096,
    },
  ];

  const agents: Awaited<ReturnType<typeof prisma.agent.create>>[] = [];
  for (const seed of agentSeeds) {
    const agent = await prisma.agent.create({
      data: {
        orgId:        org.id,
        name:         seed.name,
        slug:         `${seed.slug}-${uid()}`,
        description:  seed.description,
        modelId:      seed.modelId,
        status:       seed.status,
        version:      "1.0.0",
        instructions: seed.instructions,
        tools:        seed.tools,
        settings:     { maxTokens: seed.maxTokens, temperature: 0.7 },
        createdById:  devUser.id,
        totalRuns:    Math.floor(Math.random() * 5000),
        successfulRuns: Math.floor(Math.random() * 4800),
        failedRuns:   Math.floor(Math.random() * 200),
        avgDurationMs: Math.floor(Math.random() * 3000) + 500,
        avgCostUsd:    (Math.random() * 0.1).toFixed(6),
      },
    });
    agents.push(agent);
  }
  console.log(`  ✓  Agents: ${agents.length}`);

  // Agent runs
  let agentRunCount = 0;
  for (const agent of agents.filter(a => a.status === "ACTIVE")) {
    for (let i = 0; i < 15; i++) {
      const daysAgo    = Math.floor(Math.random() * 7);
      const startedAt  = past(daysAgo, Math.floor(Math.random() * 23));
      const durationMs = Math.floor(Math.random() * 4000) + 300;
      await prisma.agentRun.create({
        data: {
          agentId:      agent.id,
          orgId:        org.id,
          triggeredById: devUser.id,
          status:       Math.random() > 0.05 ? "COMPLETED" : "FAILED",
          input:        { message: "Help me with task #" + uid() },
          output:       { response: "Here is the answer to your question…", tokensUsed: Math.floor(Math.random() * 800) + 100 },
          modelId:      agent.modelId ?? "claude-sonnet-5",
          totalTokens:  Math.floor(Math.random() * 800) + 100,
          promptTokens: Math.floor(Math.random() * 400) + 50,
          completionTokens: Math.floor(Math.random() * 400) + 50,
          costUsd:      (Math.random() * 0.05).toFixed(8),
          startedAt,
          completedAt:  new Date(startedAt.getTime() + durationMs),
          durationMs,
        },
      });
      agentRunCount++;
    }
  }
  console.log(`  ✓  Agent runs: ${agentRunCount}`);

  // ── Knowledge Base ────────────────────────────────────────────────────────────
  const collectionSeeds = [
    {
      name:             "Product Documentation",
      description:      "Official product docs, API references, and user guides",
      embeddingModel:   "text-embedding-3-small",
      chunkingStrategy: "recursive_character",
      dimensions:       1536,
      docs: [
        { name: "Getting Started Guide",          mimeType: "text/markdown",  chunkCount: 24,  sizeBytes: 48_000 },
        { name: "API Reference v2.0",             mimeType: "text/html",      chunkCount: 142, sizeBytes: 284_000 },
        { name: "Authentication Guide",           mimeType: "text/markdown",  chunkCount: 18,  sizeBytes: 36_000 },
        { name: "Workflow Builder Tutorial",      mimeType: "text/markdown",  chunkCount: 32,  sizeBytes: 64_000 },
        { name: "SDK Reference — TypeScript",     mimeType: "text/markdown",  chunkCount: 88,  sizeBytes: 176_000 },
      ],
    },
    {
      name:             "Company Policies",
      description:      "HR policies, security procedures, and compliance documentation",
      embeddingModel:   "text-embedding-3-small",
      chunkingStrategy: "sentence",
      dimensions:       1536,
      docs: [
        { name: "Information Security Policy",   mimeType: "application/pdf", chunkCount: 45, sizeBytes: 180_000 },
        { name: "Remote Work Policy",            mimeType: "text/markdown",   chunkCount: 12, sizeBytes: 24_000 },
        { name: "AI Usage Guidelines",           mimeType: "application/pdf", chunkCount: 28, sizeBytes: 112_000 },
        { name: "Data Classification Policy",    mimeType: "application/pdf", chunkCount: 22, sizeBytes: 88_000 },
      ],
    },
    {
      name:             "Engineering Runbooks",
      description:      "Incident response procedures, SRE runbooks, and deployment guides",
      embeddingModel:   "text-embedding-3-large",
      chunkingStrategy: "markdown_header",
      dimensions:       3072,
      docs: [
        { name: "Incident Response Playbook",    mimeType: "text/markdown",  chunkCount: 56,  sizeBytes: 112_000 },
        { name: "Kubernetes Deployment Guide",   mimeType: "text/markdown",  chunkCount: 38,  sizeBytes: 76_000 },
        { name: "Database Failover Procedure",   mimeType: "text/markdown",  chunkCount: 22,  sizeBytes: 44_000 },
        { name: "Observability Setup Guide",     mimeType: "text/markdown",  chunkCount: 44,  sizeBytes: 88_000 },
      ],
    },
  ];

  let collectionCount = 0;
  let documentCount   = 0;

  for (const cSeed of collectionSeeds) {
    const totalDocCount = cSeed.docs.length;
    const col = await prisma.knowledgeCollection.create({
      data: {
        orgId:            org.id,
        name:             cSeed.name,
        description:      cSeed.description,
        embeddingModel:   cSeed.embeddingModel,
        chunkingStrategy: cSeed.chunkingStrategy,
        dimensions:       cSeed.dimensions,
        documentCount:    totalDocCount,
        createdById:      devUser.id,
      },
    });

    for (const dSeed of cSeed.docs) {
      await prisma.knowledgeDocument.create({
        data: {
          collectionId: col.id,
          orgId:        org.id,
          name:         dSeed.name,
          title:        dSeed.name,
          sourceType:   "upload",
          mimeType:     dSeed.mimeType,
          status:       "INDEXED",
          chunkCount:   dSeed.chunkCount,
          sizeBytes:    BigInt(dSeed.sizeBytes),
          indexedAt:    past(Math.floor(Math.random() * 14) + 1),
          uploadedById: devUser.id,
        },
      });
      documentCount++;
    }
    collectionCount++;
  }
  console.log(`  ✓  Knowledge collections: ${collectionCount}, documents: ${documentCount}`);

  // ── AI Usage records ──────────────────────────────────────────────────────────
  const AI_MODELS = [
    { modelId: "claude-sonnet-5",           provider: "anthropic", inputCost: 3.00,  outputCost: 15.00 },
    { modelId: "claude-haiku-4-5-20251001", provider: "anthropic", inputCost: 0.80,  outputCost: 4.00  },
    { modelId: "claude-opus-4-8",           provider: "anthropic", inputCost: 15.00, outputCost: 75.00 },
    { modelId: "gpt-4o",                    provider: "openai",    inputCost: 5.00,  outputCost: 15.00 },
    { modelId: "text-embedding-3-small",    provider: "openai",    inputCost: 0.02,  outputCost: 0     },
  ];

  let aiRecordCount = 0;
  for (let day = 0; day < 30; day++) {
    const recordsPerDay = Math.floor(Math.random() * 40) + 15;
    for (let r = 0; r < recordsPerDay; r++) {
      const model          = AI_MODELS[Math.floor(Math.random() * AI_MODELS.length)]!;
      const promptTokens   = Math.floor(Math.random() * 2000) + 100;
      const completionTokens = model.outputCost > 0 ? Math.floor(Math.random() * 1000) + 50 : 0;
      const costUsd        = (promptTokens / 1_000_000) * model.inputCost + (completionTokens / 1_000_000) * model.outputCost;

      await prisma.aIUsageRecord.create({
        data: {
          orgId:             org.id,
          workflowId:        Math.random() > 0.3 ? workflows[Math.floor(Math.random() * workflows.length)]!.id : null,
          agentId:           Math.random() > 0.5 ? agents[Math.floor(Math.random() * agents.length)]!.id : null,
          modelId:           model.modelId,
          provider:          model.provider,
          promptTokens,
          completionTokens,
          totalTokens:       promptTokens + completionTokens,
          costUsd:           costUsd.toFixed(8),
          latencyMs:         Math.floor(Math.random() * 3000) + 100,
          requestStatus:     Math.random() > 0.02 ? "success" : "error",
          cacheHit:          Math.random() < 0.15,
          timestamp:         past(day, Math.floor(Math.random() * 23), Math.floor(Math.random() * 59)),
        },
      });
      aiRecordCount++;
    }
  }
  console.log(`  ✓  AI usage records: ${aiRecordCount}`);

  // ── Audit log ─────────────────────────────────────────────────────────────────
  const AUDIT_EVENTS = [
    { eventType: "workflow.created",     resourceType: "workflow",   action: "create",  outcome: "success" as const },
    { eventType: "workflow.published",   resourceType: "workflow",   action: "publish", outcome: "success" as const },
    { eventType: "agent.created",        resourceType: "agent",      action: "create",  outcome: "success" as const },
    { eventType: "api_key.created",      resourceType: "api_key",    action: "create",  outcome: "success" as const },
    { eventType: "org.settings.updated", resourceType: "org",        action: "update",  outcome: "success" as const },
    { eventType: "user.login",           resourceType: "user",       action: "login",   outcome: "success" as const },
    { eventType: "user.login",           resourceType: "user",       action: "login",   outcome: "failure" as const },
  ];

  let auditCount = 0;
  for (let i = 0; i < 120; i++) {
    const evt = AUDIT_EVENTS[Math.floor(Math.random() * AUDIT_EVENTS.length)]!;
    const actor = users[Math.floor(Math.random() * users.length)]!;
    await prisma.auditLog.create({
      data: {
        orgId:        org.id,
        actorId:      actor.id,
        actorType:    "user",
        eventType:    evt.eventType,
        resourceType: evt.resourceType,
        resourceId:   uid(),
        action:       evt.action,
        outcome:      evt.outcome,
        ipAddress:    `10.0.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`,
        userAgent:    "Mozilla/5.0 CerebroHive Studio/1.0",
        metadata:     { requestId: uid(), environment: "production" },
        createdAt:    past(Math.floor(Math.random() * 30), Math.floor(Math.random() * 23)),
      },
    });
    auditCount++;
  }
  console.log(`  ✓  Audit events: ${auditCount}`);

  // ── Model Catalog ─────────────────────────────────────────────────────────────
  const modelSeeds = [
    {
      modelId:           "claude-sonnet-5",
      displayName:       "Claude Sonnet 5",
      provider:          "anthropic",
      description:       "Best combination of speed and intelligence for high-throughput tasks",
      contextWindow:     200_000,
      maxOutput:         64_000,
      inputPricePer1M:   "3.00",
      outputPricePer1M:  "15.00",
      capabilities:      ["vision", "function_call", "streaming", "json_mode"],
      status:            "ACTIVE" as const,
    },
    {
      modelId:           "claude-haiku-4-5-20251001",
      displayName:       "Claude Haiku 4.5",
      provider:          "anthropic",
      description:       "Fastest and most compact model for near-instant responsiveness",
      contextWindow:     200_000,
      maxOutput:         8_192,
      inputPricePer1M:   "0.80",
      outputPricePer1M:  "4.00",
      capabilities:      ["vision", "function_call", "streaming", "json_mode"],
      status:            "ACTIVE" as const,
    },
    {
      modelId:           "claude-opus-4-8",
      displayName:       "Claude Opus 4.8",
      provider:          "anthropic",
      description:       "Most capable model for highly complex tasks requiring deep reasoning",
      contextWindow:     200_000,
      maxOutput:         32_000,
      inputPricePer1M:   "15.00",
      outputPricePer1M:  "75.00",
      capabilities:      ["vision", "function_call", "streaming", "json_mode", "reasoning"],
      status:            "ACTIVE" as const,
    },
    {
      modelId:           "claude-fable-5",
      displayName:       "Claude Fable 5",
      provider:          "anthropic",
      description:       "Creative and narrative-focused model for content generation",
      contextWindow:     200_000,
      maxOutput:         32_000,
      inputPricePer1M:   "8.00",
      outputPricePer1M:  "40.00",
      capabilities:      ["vision", "function_call", "streaming", "json_mode"],
      status:            "ACTIVE" as const,
    },
    {
      modelId:           "gpt-4o",
      displayName:       "GPT-4o",
      provider:          "openai",
      description:       "OpenAI's flagship multimodal model with vision and tool use",
      contextWindow:     128_000,
      maxOutput:         16_384,
      inputPricePer1M:   "5.00",
      outputPricePer1M:  "15.00",
      capabilities:      ["vision", "function_call", "streaming", "json_mode"],
      status:            "ACTIVE" as const,
    },
    {
      modelId:           "gpt-4o-mini",
      displayName:       "GPT-4o Mini",
      provider:          "openai",
      description:       "Affordable and intelligent small model for lightweight tasks",
      contextWindow:     128_000,
      maxOutput:         16_384,
      inputPricePer1M:   "0.15",
      outputPricePer1M:  "0.60",
      capabilities:      ["vision", "function_call", "streaming", "json_mode"],
      status:            "ACTIVE" as const,
    },
    {
      modelId:           "text-embedding-3-small",
      displayName:       "text-embedding-3-small",
      provider:          "openai",
      description:       "High efficiency embedding model for semantic search and RAG",
      contextWindow:     8_191,
      maxOutput:         0,
      inputPricePer1M:   "0.02",
      outputPricePer1M:  "0.00",
      capabilities:      ["streaming"],
      status:            "ACTIVE" as const,
    },
    {
      modelId:           "text-embedding-3-large",
      displayName:       "text-embedding-3-large",
      provider:          "openai",
      description:       "Most capable embedding model for highest-accuracy retrieval",
      contextWindow:     8_191,
      maxOutput:         0,
      inputPricePer1M:   "0.13",
      outputPricePer1M:  "0.00",
      capabilities:      ["streaming"],
      status:            "ACTIVE" as const,
    },
  ];

  let modelCount = 0;
  for (const m of modelSeeds) {
    await prisma.modelEntry.upsert({
      where:  { modelId: m.modelId },
      update: { displayName: m.displayName, inputPricePer1M: m.inputPricePer1M, outputPricePer1M: m.outputPricePer1M, status: m.status },
      create: {
        orgId:            org.id,
        modelId:          m.modelId,
        displayName:      m.displayName,
        provider:         m.provider,
        description:      m.description,
        contextWindow:    m.contextWindow,
        maxOutput:        m.maxOutput,
        inputPricePer1M:  m.inputPricePer1M,
        outputPricePer1M: m.outputPricePer1M,
        capabilities:     m.capabilities,
        status:           m.status,
      },
    });
    modelCount++;
  }
  console.log(`  ✓  Model catalog: ${modelCount}`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n✅  Seed complete. Demo organisation:");
  console.log(`    • Org ID:         ${org.id}`);
  console.log(`    • Org slug:       ${org.slug}`);
  console.log(`    • Admin email:    admin@acme.com`);
  console.log(`    • API key prefix: ck_seed01`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
