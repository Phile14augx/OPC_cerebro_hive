// Content model for the dedicated AgentOS flagship page.
// Sourced from the "AgentOS Pyramid" specification: an Enterprise AI Operating
// System, not a single agent framework. Kept as plain data (icon names as
// strings) so it can be consumed by any client component without coupling
// this module to React.

export interface PyramidSubsystem {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
}

export interface PyramidTier {
  id: string;
  tier: string; // e.g. "Layer 1"
  name: string;
  description: string;
  icon: string;
  subsystems: PyramidSubsystem[];
}

export const pyramidTiers: PyramidTier[] = [
  {
    id: "applications",
    tier: "Layer 5",
    name: "Applications",
    description: "Industry AI solutions and marketplace-installed capability built on the platform below.",
    icon: "LayoutGrid",
    subsystems: [
      {
        id: "industry-solutions",
        name: "Industry Solution Layer",
        blurb: "Configurable solution packs that turn the platform into a business system for a specific industry, without changing the underlying architecture.",
        tags: ["Banking", "Healthcare", "Manufacturing", "Retail", "Insurance", "Logistics", "Legal", "HR", "Education", "Government"],
      },
      {
        id: "marketplace",
        name: "Marketplace",
        blurb: "Installable agents, skills, prompts, workflows, connectors, and models — distributed like VS Code extensions.",
        tags: ["Agents", "Skills", "Prompts", "Workflows", "Connectors", "Models"],
      },
      {
        id: "sdk",
        name: "SDK",
        blurb: "First-class SDKs so engineering teams can extend AgentOS in the language their stack already runs.",
        tags: ["Go", "Python", "TypeScript", "Java", ".NET"],
      },
    ],
  },
  {
    id: "agent-framework",
    tier: "Layer 4",
    name: "Agent Framework",
    description: "The multi-agent collaboration layer — how specialized agents discover each other, plan, and get a human in the loop when needed.",
    icon: "Users",
    subsystems: [
      {
        id: "multi-agent-system",
        name: "Multi-Agent System",
        blurb: "An enterprise OS should never rely on one agent. A supervisor chain (CEO → Planner → Research → Reasoning → Developer → Reviewer → Deployment) collaborates, votes, and reaches consensus.",
        tags: ["Agent Discovery", "Agent Registry", "Dynamic Spawning", "Collaboration", "Voting", "Negotiation", "Consensus", "Supervisor Agents"],
      },
      {
        id: "planning-engine",
        name: "Planning Engine",
        blurb: "Multiple planning strategies available at runtime — the planner chooses automatically based on task shape and confidence.",
        tags: ["ReAct", "Tree of Thoughts", "Graph of Thoughts", "Hierarchical Planning (HTN)", "Monte Carlo Search", "BFS", "DFS", "Beam Search"],
      },
      {
        id: "reasoning-engine",
        name: "Reasoning Engine",
        blurb: "Reasoning modes selected per-task so agents argue from the right kind of logic, not just next-token prediction.",
        tags: ["Deductive", "Inductive", "Abductive", "Probabilistic", "Causal", "Symbolic", "Mathematical", "Constraint Solving"],
      },
      {
        id: "human-in-the-loop",
        name: "Human-in-the-Loop",
        blurb: "Agents pause automatically when confidence is low: Approval → Review → Modify → Resume.",
        tags: ["Approval", "Review", "Modify", "Resume", "Confidence Thresholds"],
      },
    ],
  },
  {
    id: "runtime-kernel",
    tier: "Layer 3",
    name: "Agent Runtime Kernel",
    description: "The heart of AgentOS — the scheduler and orchestrator every agent, workflow, and event ultimately runs through.",
    icon: "Cpu",
    subsystems: [
      {
        id: "ai-kernel",
        name: "AI Kernel",
        blurb: "User Goal → Planner → Task Graph → Scheduler → Agents → Result. The core execution loop underneath every AgentOS process.",
        tags: ["Agent Runtime", "Task Scheduler", "Planner", "Goal Manager", "Event Loop", "Lifecycle Manager", "Workflow Engine", "Capability Registry", "State Manager"],
      },
      {
        id: "workflow-engine",
        name: "Workflow Engine",
        blurb: "A visual builder comparable to n8n, Temporal, Camunda, or LangGraph — but native to the agent runtime.",
        tags: ["Events", "Conditions", "Loops", "Retries", "Parallel Execution", "Approval", "Human Review", "Scheduling"],
      },
      {
        id: "event-platform",
        name: "Event Platform",
        blurb: "Event-driven backbone connecting every agent and tool call across the runtime.",
        tags: ["NATS", "Kafka", "RabbitMQ", "Redis Streams", "Pub/Sub", "Queues", "Event Sourcing", "CQRS", "Outbox"],
      },
      {
        id: "context-engine",
        name: "Context Engine",
        blurb: "Context is more than chat history — it's automatically assembled from every system of record the agent is authorized to see.",
        tags: ["Documents", "Memory", "User", "Organization", "Permissions", "Calendar", "Email", "CRM", "Prior Executions", "Policies"],
      },
    ],
  },
  {
    id: "intelligence-platform",
    tier: "Layer 2",
    name: "Intelligence Platform",
    description: "Memory, knowledge, models, prompts, and guardrails — the layer that makes agents knowledgeable and safe rather than just fast.",
    icon: "BrainCircuit",
    subsystems: [
      {
        id: "enterprise-memory",
        name: "Enterprise Memory",
        blurb: "Memory is first-class, not a context window trick — five tiers from live conversation to company-wide institutional knowledge.",
        tags: ["Working Memory", "Episodic Memory", "Semantic Memory (Knowledge Graph)", "Long-Term Memory (Vector DB)", "Organizational Memory (SOPs, ERP, Compliance)"],
      },
      {
        id: "knowledge-platform",
        name: "Knowledge Platform",
        blurb: "Built to rival enterprise search, not just answer a single RAG query.",
        tags: ["RAG", "GraphRAG", "Hybrid Search", "BM25", "Semantic Search", "Metadata Search", "SQL Search", "Knowledge Graph", "Citation Engine"],
      },
      {
        id: "llm-platform",
        name: "LLM Platform",
        blurb: "Provider abstraction with routing and cost/latency optimization, so no single model vendor is a single point of failure.",
        tags: ["OpenAI", "Anthropic", "Gemini", "Mistral", "Llama", "DeepSeek", "Qwen", "Local Ollama", "Routing", "Fallback", "Load Balancing", "Cost Optimization"],
      },
      {
        id: "prompt-platform",
        name: "Prompt Platform",
        blurb: "Prompts are managed assets, not hardcoded strings — versioned, tested, and rolled back like code.",
        tags: ["Templates", "Variables", "Versions", "A/B Tests", "Evaluations", "Rollback", "Approvals"],
      },
      {
        id: "guardrails",
        name: "Guardrails",
        blurb: "The enterprise requirement most agent frameworks skip — enforced at every step, not bolted on after.",
        tags: ["PII Detection", "Prompt Injection Defense", "Jailbreak Detection", "Toxicity", "Policy Engine", "Output Validation", "Schema Validation", "Content Filtering"],
      },
      {
        id: "evaluation-platform",
        name: "Evaluation Platform",
        blurb: "Every agent response is automatically scored, not just spot-checked.",
        tags: ["Accuracy", "Groundedness", "Hallucination", "Citations", "Latency", "Cost", "Reasoning Quality"],
      },
    ],
  },
  {
    id: "infrastructure-platform",
    tier: "Layer 1",
    name: "Infrastructure Platform",
    description: "Tools, deployment, observability, governance, and the live Digital Twin — the operational foundation that makes the rest of the stack trustworthy at scale.",
    icon: "Server",
    subsystems: [
      {
        id: "tool-execution-platform",
        name: "Tool Execution Platform",
        blurb: "Every tool is registered with a schema, permissions, versioning, health, and metrics — never an unaudited function call.",
        tags: ["Search", "Email", "Slack", "GitHub", "Database", "SQL", "SAP", "Salesforce", "Excel", "Python", "Browser", "Filesystem", "REST", "GraphQL"],
      },
      {
        id: "deployment-platform",
        name: "Deployment Platform",
        blurb: "The same runtime, wherever the workload needs to live.",
        tags: ["Local", "Docker", "Kubernetes", "Edge", "Cloud", "Multi-Region"],
      },
      {
        id: "observability",
        name: "Observability",
        blurb: "Every execution traceable, like distributed tracing for agents instead of microservices.",
        tags: ["Latency", "Tokens", "Cost", "Retries", "Failures", "Memory", "Tools", "LLM Calls", "Agent Timeline"],
      },
      {
        id: "governance",
        name: "Governance",
        blurb: "Enterprise governance controls that let security and compliance teams say yes.",
        tags: ["RBAC", "ABAC", "Tenants", "Workspaces", "Audit Logs", "Secrets", "Approvals", "Compliance"],
      },
      {
        id: "digital-twin",
        name: "Digital Twin",
        blurb: "One of the biggest differentiators: a live, animated view of every packet, agent, and event as it happens.",
        tags: ["User", "Gateway", "Planner", "Reasoner", "Memory", "Tool", "LLM", "Evaluator", "Response"],
      },
      {
        id: "control-center",
        name: "AI Control Center",
        blurb: "Mission control for the whole runtime — the operational cockpit for platform and SRE teams.",
        tags: ["Active Agents", "Running Workflows", "Queue Depth", "Memory Usage", "Token Usage", "Cost", "Health", "Alerts", "Live Logs", "Knowledge Sources"],
      },
    ],
  },
];

export interface DigitalTwinStep {
  id: string;
  label: string;
  icon: string;
  detail: string;
}

export const digitalTwinSteps: DigitalTwinStep[] = [
  { id: "user", label: "User", icon: "User", detail: "Goal submitted" },
  { id: "gateway", label: "Gateway", icon: "Server", detail: "Auth + rate limit" },
  { id: "planner", label: "Planner", icon: "Waypoints", detail: "Task graph built" },
  { id: "reasoner", label: "Reasoner", icon: "BrainCircuit", detail: "Strategy selected" },
  { id: "memory", label: "Memory", icon: "Database", detail: "Context assembled" },
  { id: "tool", label: "Tool", icon: "Wrench", detail: "Action executed" },
  { id: "llm", label: "LLM", icon: "Cpu", detail: "Inference call" },
  { id: "evaluator", label: "Evaluator", icon: "CheckCircle2", detail: "Output scored" },
  { id: "response", label: "Response", icon: "Send", detail: "Delivered to user" },
];

export interface ControlCenterWidget {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  variance: number; // jitter range for the "live" feel
}

export const controlCenterWidgets: ControlCenterWidget[] = [
  { id: "active-agents", label: "Active Agents", value: 342, unit: "", icon: "Bot", variance: 12 },
  { id: "running-workflows", label: "Running Workflows", value: 87, unit: "", icon: "Workflow", variance: 6 },
  { id: "queue-depth", label: "Queue Depth", value: 1240, unit: "", icon: "ListOrdered", variance: 150 },
  { id: "memory-usage", label: "Memory Usage", value: 68, unit: "%", icon: "Database", variance: 5 },
  { id: "token-usage", label: "Token Throughput", value: 18.4, unit: "k/s", icon: "Activity", variance: 2 },
  { id: "cost", label: "Live Spend", value: 214, unit: "/hr", icon: "DollarSign", variance: 18 },
  { id: "health", label: "Platform Health", value: 99.97, unit: "%", icon: "ShieldCheck", variance: 0.02 },
  { id: "alerts", label: "Open Alerts", value: 2, unit: "", icon: "AlertTriangle", variance: 1 },
];

export interface IndustryRow {
  industry: string;
  systems: string[];
}

export const industrySolutionLayer: IndustryRow[] = [
  { industry: "Banking", systems: ["Loan Underwriting", "Fraud Detection", "AML Investigator", "Customer Service"] },
  { industry: "Healthcare", systems: ["Clinical Copilot", "Patient Triage", "Medical Coding", "Hospital Operations"] },
  { industry: "Manufacturing", systems: ["Predictive Maintenance", "Quality Control", "Production Planning"] },
  { industry: "Retail", systems: ["Inventory Optimization", "Demand Forecasting", "Customer Assistant"] },
  { industry: "Insurance", systems: ["Claims Processing", "Underwriting", "Risk Assessment"] },
  { industry: "Logistics", systems: ["Fleet Optimization", "Route Planning", "Warehouse Intelligence"] },
  { industry: "Legal", systems: ["Contract Review", "Legal Research", "Compliance Monitoring"] },
  { industry: "HR", systems: ["Recruitment", "Employee Onboarding", "HR Knowledge Assistant"] },
  { industry: "Education", systems: ["Personalized Learning", "Assessment", "Student Success"] },
  { industry: "Government", systems: ["Citizen Services", "Case Management", "Policy Assistant"] },
];

export interface ArchitectureBand {
  id: string;
  label: string;
}

// Top to bottom, mirroring the full-stack architecture diagram.
export const architectureStackBands: ArchitectureBand[] = [
  { id: "applications", label: "AI Applications" },
  { id: "solutions", label: "Industry Solutions · AI Agents · Workflows" },
  { id: "runtime", label: "Planner · Reasoner · Multi-Agent Runtime" },
  { id: "memory", label: "Memory · Knowledge Graph · Vector Search" },
  { id: "tools", label: "Tool Registry · Connectors · Event Bus" },
  { id: "models", label: "LLM Gateway · Prompt Platform · Guardrails" },
  { id: "trust", label: "Observability · Evaluation · Governance" },
  { id: "infra", label: "Kubernetes · Storage · Database · Messaging" },
];
