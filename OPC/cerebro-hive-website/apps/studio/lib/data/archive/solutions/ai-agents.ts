import { Solution } from "./types";

export const ai_agents: Solution = {
  name: "AI Agents & Digital Workforce",
  slug: "ai-agents",
  category: "AI & Generative AI",
  color: "#B300FF",
  
  tagline: "Autonomous Enterprise Operations",
  implementationWeeks: "6–10 Weeks",
  readiness: "Production Ready",
  difficulty: "Medium",
  deploymentModels: ["Cloud", "Private Cloud"],
  roiLevel: "Very High",
  industries: ["Customer Service", "IT Operations", "HR", "Logistics"],
  
  hero: {
    title: "AI Agents & Digital Workforce",
    subtitle: "AI & Generative AI",
    description: "Deploy autonomous digital workers that plan, execute, and collaborate to automate complex, multi-step enterprise workflows.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  
  overview: "Move beyond simple chatbots. Our AI Agent solutions deploy autonomous systems capable of reasoning, using tools, and executing complex workflows without human intervention. We build digital workforces that scale your operations exponentially.",
  
  businessProblems: [
    { 
      problem: "High Volume, Repetitive Tasks", 
      impact: "Human workers are bogged down in manual execution rather than strategy.",
      aiSolution: "Autonomous agents handle routine tasks end-to-end."
    },
    { 
      problem: "Fragmented Systems", 
      impact: "Processes require copying data across 5+ different SaaS tools.",
      aiSolution: "Agents integrate via APIs to execute actions across multiple systems."
    },
    { 
      problem: "Scalability Limits", 
      impact: "Scaling operations requires linear increases in headcount.",
      aiSolution: "Digital workers can be spun up instantly to handle demand spikes."
    }
  ],
  
  pipeline: [
    { id: "trigger", label: "Event Trigger", subLabels: ["Email", "API", "Schedule"] },
    { id: "planner", label: "Planning Agent", subLabels: ["Task Decomposition"] },
    { id: "orchestrator", label: "Agent Orchestrator", subLabels: ["Routing", "State Management"] },
    { id: "worker1", label: "Research Agent", subLabels: ["Web Search", "RAG"] },
    { id: "worker2", label: "Execution Agent", subLabels: ["API Calls", "Data Entry"] },
    { id: "validator", label: "QA / Supervisor Agent", subLabels: ["Verification"] },
    { id: "human", label: "Human-in-the-Loop", subLabels: ["Approval (if needed)"] }
  ],
  
  workflowSteps: [
    { step: 1, name: "Receive Goal", description: "Agent receives a high-level objective." },
    { step: 2, name: "Plan", description: "Agent breaks the objective into actionable steps." },
    { step: 3, name: "Use Tools", description: "Agent queries databases, calls APIs, or searches the web." },
    { step: 4, name: "Synthesize", description: "Agent analyzes the gathered information." },
    { step: 5, name: "Execute", description: "Agent performs the final action (e.g., sends email, updates ERP)." }
  ],
  
  capabilities: [
    { 
      name: "Tool Use & API Integration", 
      description: "Agents can interact with any system that has an API.",
      benefits: ["End-to-end automation", "System interoperability"],
      techUsed: ["Function Calling", "OpenAPI Specs"]
    },
    { 
      name: "Multi-Agent Orchestration", 
      description: "Multiple specialized agents collaborating to solve complex problems.",
      benefits: ["Higher accuracy", "Handles complexity"],
      techUsed: ["LangGraph", "AutoGen"]
    },
    { 
      name: "Human-in-the-Loop (HITL)", 
      description: "Agents pause for human approval before executing high-risk actions.",
      benefits: ["Safety", "Compliance", "Trust"],
      techUsed: ["Stateful Workflows"]
    }
  ],
  
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  
  techStack: [],
  techStackFlat: [
    { name: "LangGraph / AutoGen", role: "Agent Orchestration" },
    { name: "OpenAI GPT-4o", role: "Reasoning Engine" },
    { name: "AWS Step Functions", role: "State Management" },
    { name: "Redis", role: "Agent Memory" },
    { name: "FastAPI", role: "Tool Serving" }
  ],
  
  roi: [
    { metric: "82%", label: "Automation Rate", description: "Percentage of workflows handled without human intervention." },
    { metric: "24/7", label: "Availability", description: "Digital workforce operates continuously without fatigue." },
    { metric: "95%", label: "Accuracy", description: "Reduction in manual data entry errors." },
    { metric: "6 Wks", label: "Time to Value", description: "First agent deployed to production." }
  ],
  
  timeline: [
    { phase: "Workflow Mapping", week: "Weeks 1-2", description: "Identifying candidate processes and mapping decision trees." },
    { phase: "Agent Development", week: "Weeks 3-5", description: "Building agent prompts, tool integrations, and state machines." },
    { phase: "Testing & Guardrails", week: "Weeks 6-7", description: "Simulated runs, edge case handling, and supervisor setup." },
    { phase: "Staged Rollout", week: "Week 8", description: "Deploying in 'shadow mode' before full autonomy." }
  ],
  
  deliverables: [
    "Agent Architecture Design",
    "Deployed Agentic Workflows",
    "Custom Tool Definitions (APIs)",
    "Monitoring Dashboard",
    "Human-in-the-Loop Approval UI"
  ],
  
  engagementModels: [
    "Pilot Implementation",
    "Agent Factory (Scaled Development)",
    "Managed Digital Workforce"
  ],
  
  securityFeatures: [
    "Least Privilege Tool Access",
    "Strict Execution Boundaries",
    "Full Audit Logging of Agent Actions",
    "Mandatory HITL for critical functions"
  ],
  
  integrations: [
    "Jira / ServiceNow",
    "Salesforce / HubSpot",
    "Slack / Microsoft Teams",
    "Custom Enterprise APIs"
  ],
  
  featuredCaseStudy: {
    industry: "IT Operations",
    title: "L1 Support Automation",
    timeline: "8 Weeks",
    outcome: "Autonomous agents now resolve 65% of incoming IT tickets without human intervention, escalating only complex issues.",
    metric: "65% Deflection",
    description: "A Fortune 500 company deployed our IT Support Agent swarm to handle password resets, access requests, and basic troubleshooting.",
    savings: "42,000 Hours Saved"
  },
  
  caseStudy: {
    industry: "Enterprise",
    title: "Transformation Initiative",
    timeline: "12 Weeks",
    outcome: "Significant process improvement.",
    metric: "40% Faster"
  },
  
  resources: []
};
