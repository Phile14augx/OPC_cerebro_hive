import { PlatformCapability } from "../types";

export const platformCapabilities: PlatformCapability[] = [
  {
    id: "agentos",
    slug: "agentos",
    title: "Cerebro AgentOS™",
    summary: "Multi-agent runtime, scheduler, and workflow engine. The flagship Kubernetes for AI agents.",
    hero: {
      title: "Cerebro AgentOS™",
      subtitle: "The Operating System for Enterprise AI",
      description: "Deploy, orchestrate, and govern multi-agent swarms at enterprise scale."
    },
    iconName: "Cpu",
    category: "AI Runtime",
    group: "AI Runtime",
    status: "production",
    tags: ["Orchestration", "Agents", "Runtime"],
    features: ["Multi-agent runtime", "Scheduler", "Planner", "Tool registry"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Run the Real Kernel — Live"
  },
  {
    id: "memory-fabric",
    slug: "memory-fabric",
    title: "Cerebro Memory Fabric™",
    summary: "Unified enterprise memory across documents, chats, ERP, and meetings.",
    hero: {
      title: "Cerebro Memory Fabric™",
      subtitle: "Enterprise Memory Layer",
      description: "Give your AI agents long-term, episodic, and semantic memory."
    },
    iconName: "Database",
    category: "Knowledge",
    group: "Knowledge",
    status: "production",
    tags: ["Memory", "Vector DB", "Context"],
    features: ["Episodic memory", "Semantic memory", "Organizational graph"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "See Memory Fabric persist live"
  },
  {
    id: "knowledge-fabric",
    slug: "knowledge-fabric",
    title: "Cerebro Knowledge Fabric™",
    summary: "Enterprise knowledge platform with GraphRAG and hybrid search.",
    hero: {
      title: "Cerebro Knowledge Fabric™",
      subtitle: "Enterprise Intelligence",
      description: "Connect all organizational knowledge into a coherent graph for AI."
    },
    iconName: "Share2",
    category: "Knowledge",
    group: "Knowledge",
    status: "production",
    tags: ["GraphRAG", "Search", "Knowledge Graph"],
    features: ["GraphRAG", "Hybrid Search", "Citation Engine"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Query the real knowledge search"
  },
  {
    id: "reasoning-engine",
    slug: "reasoning-engine",
    title: "Cerebro Reasoning Engine™",
    summary: "Adaptive orchestration layer selecting the right reasoning strategy per task.",
    hero: {
      title: "Cerebro Reasoning Engine™",
      subtitle: "Adaptive Intelligence",
      description: "Automatically select CoT, ToT, or ReAct based on task complexity."
    },
    iconName: "Brain",
    category: "AI Runtime",
    group: "AI Runtime",
    status: "production",
    tags: ["Reasoning", "Planning", "Execution"],
    features: ["Chain of Thought", "Tree of Thoughts", "Debate & Reflection"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Watch it pick a strategy live"
  },
  {
    id: "context-engine",
    slug: "context-engine",
    title: "Cerebro Context Engine™",
    summary: "Auto-assembles execution context from workspace, CRM, and policy.",
    hero: {
      title: "Cerebro Context Engine™",
      subtitle: "Dynamic Contextualization",
      description: "Replaces manual prompting with rich, auto-assembled context."
    },
    iconName: "Layers",
    category: "Knowledge",
    group: "Knowledge",
    status: "production",
    tags: ["Context", "Prompting"],
    features: ["Context Assembly", "Dynamic Prompting"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Preview an assembled context live"
  },
  {
    id: "agent-mesh",
    slug: "agent-mesh",
    title: "Cerebro Agent Mesh™",
    summary: "Multi-agent communication, discovery, and negotiation layer.",
    hero: {
      title: "Cerebro Agent Mesh™",
      subtitle: "Agent-to-Agent Communication",
      description: "Enable discovery, message routing, and consensus across swarms."
    },
    iconName: "Network",
    category: "AI Runtime",
    group: "AI Runtime",
    status: "production",
    tags: ["Communication", "Mesh", "Swarms"],
    features: ["Discovery", "Message Routing", "Consensus"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Run a real multi-agent vote"
  },
  {
    id: "flow",
    slug: "flow",
    title: "Cerebro Flow™",
    summary: "Visual AI workflow platform for pipelines and human-in-the-loop review.",
    hero: {
      title: "Cerebro Flow™",
      subtitle: "Visual Workflow Engine",
      description: "Build resilient AI pipelines with approvals, retries, and schedules."
    },
    iconName: "GitMerge",
    category: "AI Runtime",
    group: "AI Runtime",
    status: "production",
    tags: ["Workflows", "BPM", "Pipelines"],
    features: ["Visual Editor", "Human-in-the-loop", "Event Triggers"]
  },
  {
    id: "connect",
    slug: "connect",
    title: "Cerebro Connect™",
    summary: "Enterprise integration layer with hundreds of API connectors.",
    hero: {
      title: "Cerebro Connect™",
      subtitle: "Enterprise Integration",
      description: "Connect agents to SAP, Salesforce, Oracle, Snowflake, and more."
    },
    iconName: "Plug",
    category: "Infrastructure",
    group: "Infrastructure",
    status: "production",
    tags: ["Integrations", "APIs"],
    features: ["Hundreds of Connectors", "Custom Webhooks", "OAuth Management"]
  },
  {
    id: "guard",
    slug: "guard",
    title: "Cerebro Guard™",
    summary: "Enterprise AI security, PII protection, and policy enforcement.",
    hero: {
      title: "Cerebro Guard™",
      subtitle: "AI Safety & Security",
      description: "Protect your enterprise with prompt-injection detection and strict RBAC."
    },
    iconName: "Shield",
    category: "Infrastructure",
    group: "Infrastructure",
    status: "production",
    tags: ["Security", "RBAC", "Governance"],
    features: ["Prompt Injection Defense", "PII Redaction", "RBAC"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Try to break it — live Guard demo"
  },
  {
    id: "eval",
    slug: "eval",
    title: "Cerebro Eval™",
    summary: "Continuous evaluation for accuracy, hallucinations, and citation quality.",
    hero: {
      title: "Cerebro Eval™",
      subtitle: "Continuous Observability",
      description: "Measure accuracy, cost, and groundedness in real-time."
    },
    iconName: "Activity",
    category: "Infrastructure",
    group: "Infrastructure",
    status: "production",
    tags: ["Evaluation", "Metrics", "Testing"],
    features: ["Accuracy Scoring", "Hallucination Detection", "Cost Tracking"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "See a real Eval scorecard"
  },
  {
    id: "observatory",
    slug: "observatory",
    title: "Cerebro Observatory™",
    summary: "Distributed-tracing for agent systems and workflow graphs.",
    hero: {
      title: "Cerebro Observatory™",
      subtitle: "Deep Observability",
      description: "Trace every agent action, tool call, and token usage."
    },
    iconName: "Eye",
    category: "Infrastructure",
    group: "Infrastructure",
    status: "production",
    tags: ["Observability", "Tracing"],
    features: ["Distributed Tracing", "Workflow Graphs", "Token Usage"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Open the real Observatory dashboard"
  },
  {
    id: "cortex",
    slug: "cortex",
    title: "Cerebro Cortex™",
    summary: "Enterprise decision engine for optimization and forecasting.",
    hero: {
      title: "Cerebro Cortex™",
      subtitle: "Decision Engine",
      description: "Optimize supply chain, finance, and logistics with AI."
    },
    iconName: "Lightbulb",
    category: "AI Runtime",
    group: "AI Runtime",
    status: "production",
    tags: ["Decisions", "Optimization"],
    features: ["Forecasting", "Recommendations", "Simulation"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Run a real forecast & optimizer"
  },
  {
    id: "simulator",
    slug: "simulator",
    title: "Cerebro Simulator™",
    summary: "AI digital-twin platform for agents and physical networks.",
    hero: {
      title: "Cerebro Simulator™",
      subtitle: "Digital Twins",
      description: "Run 'what-if' analysis on your enterprise operations."
    },
    iconName: "Box",
    category: "Developer",
    group: "Developer",
    status: "production",
    tags: ["Simulation", "Digital Twin"],
    features: ["What-If Analysis", "Agent Simulation", "Network Modeling"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Run a real Monte Carlo simulation"
  },
  {
    id: "intelligence-hub",
    slug: "intelligence-hub",
    title: "Cerebro Intelligence Hub™",
    summary: "Unifies CRM, ERP, documents, and analytics into one intelligence layer.",
    hero: {
      title: "Cerebro Intelligence Hub™",
      subtitle: "Unified Intelligence",
      description: "The single pane of glass for all organizational data."
    },
    iconName: "Globe",
    category: "Knowledge",
    group: "Knowledge",
    status: "production",
    tags: ["Analytics", "Hub"],
    features: ["Unified Dashboards", "Cross-system Analytics"]
  },
  {
    id: "governance",
    slug: "governance",
    title: "Cerebro Governance™",
    summary: "Approvals, audit, and compliance (SOC 2, ISO, GDPR).",
    hero: {
      title: "Cerebro Governance™",
      subtitle: "Enterprise Compliance",
      description: "Maintain strict compliance across every layer of your AI stack."
    },
    iconName: "CheckSquare",
    category: "Infrastructure",
    group: "Infrastructure",
    status: "production",
    tags: ["Compliance", "Audit", "Governance"],
    features: ["SOC 2 Controls", "Audit Logs", "Policy Management"],
    liveDemoUrl: "/products/agentos/live-runtime",
    liveDemoLabel: "Create a real policy & see the audit log"
  }
];
