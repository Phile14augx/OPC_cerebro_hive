export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${KEY}`, ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function checkOnline(): Promise<boolean> {
  try { return await fetch(`${API}/health`).then(r => r.ok); } catch { return false; }
}

export interface OsPillar {
  slug: string;
  name: string;
  group: string;
  tagline: string;
}

/** Every pillar/subsystem added to the Enterprise Cognitive OS, each with its own dedicated page under /platform/os/<slug>. */
export const osPillars: OsPillar[] = [
  { slug: "governance", name: "AI Governance™", group: "Governance & Trust", tagline: "Model/Prompt/Agent/Policy/Risk/Evidence registries + 8-pillar ethics scoring." },
  { slug: "web3", name: "Cerebro Chain™", group: "Governance & Trust", tagline: "Blockchain & Web3: chain registry, DeFi catalog, account & compliance lookups." },
  { slug: "zero-trust", name: "Zero Trust™", group: "Governance & Trust", tagline: "Deny-by-default tool grants, MCP server risk review, scoped capability tokens." },
  { slug: "devops", name: "DevOps™", group: "Operations", tagline: "CI/CD pipelines, environments, deployments, GitOps drift detection." },
  { slug: "mlops", name: "MLOps™", group: "Operations", tagline: "Experiments, model lineage, feature store, serving, drift detection." },
  { slug: "secops", name: "DevSecOps / MLSecOps™", group: "Operations", tagline: "Security scanning, SBOM, policy-as-code, model supply-chain, red-teaming." },
  { slug: "aiops", name: "AIOps™", group: "Operations", tagline: "Anomaly detection, incident management, alert correlation." },
  { slug: "agent-executor", name: "Agent Executor™", group: "Reasoning & Orchestration", tagline: "LangChain/LangGraph-style ReAct loop over the runtime tool registry." },
  { slug: "router", name: "Cerebro Router™", group: "Reasoning & Orchestration", tagline: "Intelligent multi-model routing by intent, complexity, privacy, and cost." },
  { slug: "compiler", name: "Cerebro Compiler™", group: "Reasoning & Orchestration", tagline: "Natural language → goal → plan → workflow → running execution graph." },
  { slug: "swarm", name: "Cerebro Swarm™", group: "Reasoning & Orchestration", tagline: "Planner → Coordinator → Specialists → Critics → Judge → Consensus → Auditor." },
  { slug: "actions", name: "Cerebro Actions™", group: "Reasoning & Orchestration", tagline: "Governed autonomous execution against real enterprise systems." },
  { slug: "world-model", name: "Enterprise World Model™", group: "Knowledge & Simulation", tagline: "A living graph of the enterprise — entities, relationships, state." },
  { slug: "digital-twin", name: "Digital Twin™", group: "Knowledge & Simulation", tagline: "Named, deterministic enterprise scenario simulations that write back to the graph." },
  { slug: "research", name: "Research Platform™", group: "Knowledge & Simulation", tagline: "Prompt/agent versioning, A/B testing, experiment provenance, leaderboards." },
  { slug: "data-platform", name: "Data Platform™", group: "Knowledge & Simulation", tagline: "Governed data-asset catalog, lineage graph, semantic metric layer." },
  { slug: "sdk", name: "Developer SDK™", group: "Developer Platform", tagline: "A typed TypeScript client over the entire platform API surface." },
];
