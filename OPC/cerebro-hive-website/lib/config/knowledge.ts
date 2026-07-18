export interface KnowledgeItem {
  id: string;
  type: "Whitepaper" | "Playbook" | "Architecture Guide" | "Benchmark";
  title: string;
  description: string;
  date: string;
}

export const knowledgeHub: KnowledgeItem[] = [
  {
    id: "k1",
    type: "Architecture Guide",
    title: "Designing Provider-Agnostic LLM Orchestration",
    description: "Learn how to build AI services that seamlessly hot-swap between OpenAI, Anthropic, and Local Models without rewriting application logic.",
    date: "July 2026",
  },
  {
    id: "k2",
    type: "Playbook",
    title: "The Agentic Automation Playbook for Enterprises",
    description: "A step-by-step guide to replacing rigid RPA bots with autonomous, reasoning-capable AI agents in back-office operations.",
    date: "June 2026",
  },
  {
    id: "k3",
    type: "Benchmark",
    title: "RAG Retrieval Latency in Financial Knowledge Graphs",
    description: "Performance analysis of Vector vs. Graph databases when querying multi-hop relationships in SEC filings.",
    date: "May 2026",
  },
  {
    id: "k4",
    type: "Whitepaper",
    title: "Governing the Autonomous Enterprise",
    description: "Frameworks for securing, auditing, and restricting AI agents interacting with live production databases.",
    date: "April 2026",
  }
];
