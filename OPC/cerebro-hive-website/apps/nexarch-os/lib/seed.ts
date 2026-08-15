import type { NexarchDb } from "./db";
import type {
  Agent,
  Claim,
  CommsThread,
  ContentItem,
  Department,
  FunnelDeal,
  KnowledgeEdge,
  KnowledgeNode,
  LedgerEntry,
  PulseSnapshot,
  Skill,
  SocialAccount,
  Task,
  Workflow,
} from "./schemas";

const DEPARTMENTS: Department[] = [
  { id: "conductor", name: "Conductor", slug: "conductor", summary: "Nexarch routes work across the company of agents.", order: 0 },
  { id: "forge", name: "Forge", slug: "forge", summary: "Product factory. Spec, generate, review. Deep-links CerebroForge.", order: 1 },
  { id: "swarm", name: "Swarm", slug: "swarm", summary: "Workforce dispatch. Honest about what is not wired.", order: 2 },
  { id: "growth", name: "Growth", slug: "growth", summary: "Founder-led GTM for Cerebro Hive.", order: 3 },
  { id: "archive", name: "Archive", slug: "archive", summary: "Knowledge library. Markdown docs are the source of truth.", order: 4 },
  { id: "hiveops", name: "HiveOps", slug: "hiveops", summary: "Runtime, jobs, reliability. Never fakes SUCCEEDED.", order: 5 },
  { id: "comms", name: "Comms", slug: "comms", summary: "Unified inbox for the operator.", order: 6 },
  { id: "finance", name: "Finance", slug: "finance", summary: "Runway and spend for a bootstrapped AI platform.", order: 7 },
];

const AGENTS: Agent[] = [
  { id: "nexarch", name: "Nexarch", role: "Conductor", departmentId: "conductor", parentId: null, tier: "lead", status: "active", summary: "Routes work, broadcasts, writes the pulse for Philemon." },
  { id: "forge-lead", name: "Forge Lead", role: "Pillar", departmentId: "forge", parentId: "nexarch", tier: "lead", status: "active", summary: "Owns the product factory and CerebroForge deep links." },
  { id: "architect", name: "Architect", role: "Specialist", departmentId: "forge", parentId: "forge-lead", tier: "specialist", status: "active", summary: "Turns Hive architecture docs into claims and specs." },
  { id: "codegen", name: "Codegen", role: "Worker", departmentId: "forge", parentId: "forge-lead", tier: "worker", status: "active", summary: "Would invoke Forge codegen. Reports not_wired until the worker exists." },
  { id: "reviewer", name: "Reviewer", role: "Worker", departmentId: "forge", parentId: "forge-lead", tier: "worker", status: "active", summary: "Reads last runs and flags honesty gaps." },
  { id: "swarm-lead", name: "Swarm Lead", role: "Pillar", departmentId: "swarm", parentId: "nexarch", tier: "lead", status: "active", summary: "Workforce lead. Mirrors agent-dispatch policy in the UI." },
  { id: "dispatcher", name: "Dispatcher", role: "Worker", departmentId: "swarm", parentId: "swarm-lead", tier: "worker", status: "active", summary: "Queues PlatformJob or records not_wired honestly." },
  { id: "growth-lead", name: "Growth Lead", role: "Pillar", departmentId: "growth", parentId: "nexarch", tier: "lead", status: "active", summary: "Owns funnel, content, and social cadence." },
  { id: "funnel", name: "Funnel", role: "Worker", departmentId: "growth", parentId: "growth-lead", tier: "worker", status: "active", summary: "Stages: Signal, Conversation, Pilot, Hive workspace, Expansion." },
  { id: "content", name: "Content", role: "Worker", departmentId: "growth", parentId: "growth-lead", tier: "worker", status: "active", summary: "Hive product narrative and architecture notes." },
  { id: "social", name: "Social", role: "Worker", departmentId: "growth", parentId: "growth-lead", tier: "worker", status: "active", summary: "Cadence for accounts Philemon actually uses." },
  { id: "archive-lead", name: "Archive Lead", role: "Pillar", departmentId: "archive", parentId: "nexarch", tier: "lead", status: "active", summary: "Knowledge pillar. Docs under Hive docs/." },
  { id: "librarian", name: "Librarian", role: "Worker", departmentId: "archive", parentId: "archive-lead", tier: "worker", status: "active", summary: "Keyword search over markdown. Grep fallback, zero downtime." },
  { id: "memory-governor", name: "Memory Governor", role: "Worker", departmentId: "archive", parentId: "archive-lead", tier: "worker", status: "active", summary: "Promotion-gated facts. Agents write claims; Philemon approves." },
  { id: "hiveops-lead", name: "HiveOps Lead", role: "Pillar", departmentId: "hiveops", parentId: "nexarch", tier: "lead", status: "active", summary: "Runtime and job honesty. SUCCEEDED only if a worker recorded it." },
  { id: "comms-lead", name: "Comms Lead", role: "Pillar", departmentId: "comms", parentId: "nexarch", tier: "lead", status: "active", summary: "Unified inbox owner." },
  { id: "inbox", name: "Inbox", role: "Worker", departmentId: "comms", parentId: "comms-lead", tier: "worker", status: "active", summary: "Seeded threads. Live IMAP only if configured." },
  { id: "finance-lead", name: "Finance Lead", role: "Pillar", departmentId: "finance", parentId: "nexarch", tier: "lead", status: "active", summary: "Runway, compute, models, tooling, infra." },
];

const COMMS: CommsThread[] = [
  { id: "c1", lane: "email", fromName: "Priya Shah, Northwind Health", subject: "Pilot workspace for clinical ops copilot", preview: "We want a 6-week Hive Studio pilot. Who is the operator on your side?", status: "open", createdAt: "2026-08-12T09:14:00.000Z" },
  { id: "c2", lane: "github", fromName: "github/cerebro-hive-website", subject: "CI: forge-api typecheck drift", preview: "Workflow failure on main. Honest 401 on unauthenticated codegen is expected; type error is not.", status: "open", createdAt: "2026-08-14T16:02:00.000Z" },
  { id: "c3", lane: "email", fromName: "Marcus Chen, Mesh Manufacturing", subject: "Architecture review intro", preview: "Saw the control-plane vs execution-plane writeup. Can we talk next week?", status: "open", createdAt: "2026-08-11T13:40:00.000Z" },
  { id: "c4", lane: "notes", fromName: "Philemon", subject: "Do not fake Runtime SUCCEEDED", preview: "Day 1 honesty rule. HiveOps must refuse fabricated success.", status: "open", createdAt: "2026-08-13T08:00:00.000Z" },
  { id: "c5", lane: "github", fromName: "github/issues", subject: "Archive model/dataset routes were dead", preview: "Replaced with honest pages. Keep them honest.", status: "replied", createdAt: "2026-08-13T11:20:00.000Z" },
  { id: "c6", lane: "email", fromName: "Lina Okonkwo, Harbor Bank", subject: "Security questionnaire", preview: "Need SOC2 / data residency answers before a conversation stage.", status: "open", createdAt: "2026-08-10T07:55:00.000Z" },
  { id: "c7", lane: "slack", fromName: "system", subject: "Slack not configured", preview: "Connector reports not_configured. This thread is a seed reminder, not a live Slack message.", status: "open", createdAt: "2026-08-01T00:00:00.000Z" },
];

const DEALS: FunnelDeal[] = [
  { id: "d1", name: "Northwind Health", stage: "pilot", valueUsd: 48000, nextStep: "Send Studio workspace access checklist", ownerAgentId: "funnel" },
  { id: "d2", name: "Harbor Bank", stage: "conversation", valueUsd: 120000, nextStep: "Security questionnaire via Comms", ownerAgentId: "funnel" },
  { id: "d3", name: "Mesh Manufacturing", stage: "signal", valueUsd: 36000, nextStep: "Architecture call with Philemon", ownerAgentId: "growth-lead" },
  { id: "d4", name: "Cerebro Hive internal", stage: "workspace", valueUsd: 0, nextStep: "Keep operator OS and Studio honest", ownerAgentId: "nexarch" },
  { id: "d5", name: "River Retail", stage: "expansion", valueUsd: 18000, nextStep: "Archive datasets for demand sensing", ownerAgentId: "funnel" },
  { id: "d6", name: "Atlas Logistics", stage: "signal", valueUsd: 22000, nextStep: "Qualify whether they need Forge or Swarm first", ownerAgentId: "funnel" },
];

const CONTENT: ContentItem[] = [
  { id: "ct1", title: "Control plane vs execution plane", channel: "docs", status: "published", scheduledFor: "2026-08-13" },
  { id: "ct2", title: "Why Hive never fakes connected", channel: "linkedin", status: "scheduled", scheduledFor: "2026-08-16" },
  { id: "ct3", title: "Nexarch OS: one person, a company of agents", channel: "blog", status: "draft", scheduledFor: "2026-08-20" },
  { id: "ct4", title: "Forge 9 tools walkthrough", channel: "youtube", status: "idea", scheduledFor: "2026-08-27" },
  { id: "ct5", title: "Technology registry: generator.supported = false until it writes files", channel: "x", status: "scheduled", scheduledFor: "2026-08-18" },
];

const SOCIAL: SocialAccount[] = [
  { id: "s1", platform: "linkedin", handle: "philemon / cerebro-nexarch", cadence: "3 posts / week", followersSeed: 0 },
  { id: "s2", platform: "x", handle: "@cerebronexarch", cadence: "daily notes", followersSeed: 0 },
  { id: "s3", platform: "github", handle: "cerebro-hive-website", cadence: "ship, don't announce", followersSeed: 0 },
];

const LEDGER: LedgerEntry[] = [
  { id: "l1", date: "2026-08-01", description: "Anthropic API", category: "models", amountUsd: 420, direction: "out" },
  { id: "l2", date: "2026-08-01", description: "OpenAI API", category: "models", amountUsd: 180, direction: "out" },
  { id: "l3", date: "2026-08-03", description: "Cursor seats", category: "tooling", amountUsd: 40, direction: "out" },
  { id: "l4", date: "2026-08-04", description: "Domain + email", category: "infra", amountUsd: 24, direction: "out" },
  { id: "l5", date: "2026-08-05", description: "AWS sandbox", category: "compute", amountUsd: 96, direction: "out" },
  { id: "l6", date: "2026-08-08", description: "Architecture advisory (Mesh intro)", category: "advisory", amountUsd: 2500, direction: "in" },
  { id: "l7", date: "2026-07-15", description: "GitHub Team", category: "tooling", amountUsd: 44, direction: "out" },
  { id: "l8", date: "2026-07-20", description: "Vercel hobby (studio preview)", category: "infra", amountUsd: 20, direction: "out" },
];

const NODES: KnowledgeNode[] = [
  { id: "k-platform", title: "Platform architecture", kind: "doc", path: "docs/architecture/PLATFORM-ARCHITECTURE.md", summary: "Control plane plus polyglot generation/execution plane." },
  { id: "k-exec", title: "Execution plane", kind: "doc", path: "docs/architecture/EXECUTION-PLANE.md", summary: "Job states. Do not display SUCCEEDED unless a worker recorded it." },
  { id: "k-plugin", title: "Plugin architecture", kind: "doc", path: "docs/architecture/PLUGIN-ARCHITECTURE.md", summary: "Manifest + template + adapter + tests." },
  { id: "k-tech", title: "Technology matrix", kind: "doc", path: "docs/technology/TECHNOLOGY-MATRIX.md", summary: "Registry vs what actually runs." },
  { id: "k-feat", title: "Feature matrix", kind: "doc", path: "docs/audits/FEATURE-MATRIX.md", summary: "Honest statuses for Studio, Forge, Runtime, Talent." },
  { id: "k-nexarch", title: "Nexarch OS", kind: "memory", path: null, summary: "Personal operator OS for Cerebro Nexarch. Larp-first, real-ready." },
];

const EDGES: KnowledgeEdge[] = [
  { id: "e1", fromId: "k-platform", toId: "k-exec", label: "jobs live here" },
  { id: "e2", fromId: "k-platform", toId: "k-plugin", label: "adapters register here" },
  { id: "e3", fromId: "k-exec", toId: "k-feat", label: "honesty in the matrix" },
  { id: "e4", fromId: "k-nexarch", toId: "k-platform", label: "deep links" },
  { id: "e5", fromId: "k-nexarch", toId: "k-exec", label: "never fake success" },
];

const CLAIMS: Claim[] = [
  { id: "cl1", sourceId: "k-exec", text: "Runtime dashboard must not show SUCCEEDED unless a worker recorded it.", status: "claim", createdBy: "architect", createdAt: "2026-08-13T12:00:00.000Z" },
  { id: "cl2", sourceId: "k-feat", text: "Talent assessments currently REFUSES; schema was dropped.", status: "claim", createdBy: "reviewer", createdAt: "2026-08-13T12:05:00.000Z" },
  { id: "cl3", sourceId: "k-platform", text: "Studio client talks to platform-api /api/v1.", status: "fact", createdBy: "architect", createdAt: "2026-08-13T12:10:00.000Z" },
];

const TASKS: Task[] = [
  { id: "t1", title: "Ship Nexarch OS walking skeleton", status: "doing", agentId: "nexarch", createdAt: "2026-08-15T00:00:00.000Z" },
  { id: "t2", title: "Keep Forge Auto-fix disabled", status: "done", agentId: "forge-lead", createdAt: "2026-08-13T00:00:00.000Z" },
  { id: "t3", title: "Reply to Northwind Health pilot", status: "backlog", agentId: "inbox", createdAt: "2026-08-12T00:00:00.000Z" },
  { id: "t4", title: "Ingest PLATFORM-ARCHITECTURE into brain", status: "doing", agentId: "librarian", createdAt: "2026-08-14T00:00:00.000Z" },
  { id: "t5", title: "Harbor Bank security questionnaire", status: "backlog", agentId: "comms-lead", createdAt: "2026-08-10T00:00:00.000Z" },
  { id: "t6", title: "Document Prisma cutover for agent_runs", status: "backlog", agentId: "hiveops-lead", createdAt: "2026-08-15T00:00:00.000Z" },
  { id: "t7", title: "LinkedIn post: never fake connected", status: "doing", agentId: "content", createdAt: "2026-08-15T00:00:00.000Z" },
  { id: "t8", title: "Qualify Atlas Logistics", status: "backlog", agentId: "funnel", createdAt: "2026-08-14T00:00:00.000Z" },
];

const SKILLS: Skill[] = [
  { id: "sk1", slug: "morning-pulse", name: "Morning pulse", description: "Conductor writes agents/jobs/inbox/runway into pulse history.", agentId: "nexarch" },
  { id: "sk2", slug: "inbox-triage", name: "Inbox triage", description: "Inbox agent summarises open threads by lane.", agentId: "inbox" },
  { id: "sk3", slug: "forge-status", name: "Forge status", description: "Forge Lead reports honest tool status, never fabricated success.", agentId: "forge-lead" },
  { id: "sk4", slug: "docs-sweep", name: "Docs sweep", description: "Librarian greps Hive docs for a query.", agentId: "librarian" },
];

const WORKFLOWS: Workflow[] = [
  { id: "wf-morning", name: "Morning brief", stepsJson: JSON.stringify(["nexarch", "inbox", "hiveops-lead", "finance-lead"]), lastRunAt: null, lastSummary: null },
  { id: "wf-gtm", name: "Weekly GTM", stepsJson: JSON.stringify(["growth-lead", "funnel", "content", "social"]), lastRunAt: null, lastSummary: null },
  { id: "wf-brain", name: "Docs to brain ingest", stepsJson: JSON.stringify(["librarian", "memory-governor", "archive-lead"]), lastRunAt: null, lastSummary: null },
];

const PULSE: PulseSnapshot[] = [
  { id: "p1", capturedAt: "2026-08-09T08:00:00.000Z", agentsActive: 16, openComms: 8, openTasks: 9, runwayMonths: 9.2 },
  { id: "p2", capturedAt: "2026-08-11T08:00:00.000Z", agentsActive: 17, openComms: 7, openTasks: 8, runwayMonths: 8.8 },
  { id: "p3", capturedAt: "2026-08-13T08:00:00.000Z", agentsActive: 18, openComms: 6, openTasks: 8, runwayMonths: 8.6 },
  { id: "p4", capturedAt: "2026-08-15T08:00:00.000Z", agentsActive: 18, openComms: 6, openTasks: 7, runwayMonths: 8.4 },
];

export const NEXARCH_AGENT_IDS = AGENTS.map((a) => a.id);

export function seedNexarch(db: NexarchDb, options: { force?: boolean } = {}): void {
  if (!options.force && db.meta.get("seeded") === "1") return;

  for (const row of DEPARTMENTS) db.departments.upsert(row);
  for (const row of AGENTS) db.agents.upsert(row);
  for (const row of COMMS) db.comms.upsert(row);
  for (const row of DEALS) db.funnel.upsert(row);
  for (const row of CONTENT) db.content.upsert(row);
  for (const row of SOCIAL) db.social.upsert(row);
  for (const row of LEDGER) db.ledger.upsert(row);
  for (const row of NODES) db.knowledge.upsertNode(row);
  for (const row of EDGES) db.knowledge.upsertEdge(row);
  for (const row of CLAIMS) db.claims.upsert(row);
  for (const row of TASKS) db.tasks.upsert(row);
  for (const row of SKILLS) db.skills.upsert(row);
  for (const row of WORKFLOWS) db.workflows.upsert(row);
  for (const row of PULSE) db.pulse.upsert(row);

  db.meta.set("seeded", "1");
  db.meta.set("company", "Cerebro Nexarch");
  db.meta.set("operator", "Philemon");
}

export { AGENTS as SEEDED_AGENTS };
