import { PackagedProduct } from "../types";

export const cerebroCopilotProduct: PackagedProduct = {
  id: "cerebro-copilot",
  slug: "cerebro-copilot",
  title: "CerebroCopilot™",
  summary: "The universal enterprise AI assistant — cross-platform conversational intelligence that operates across every CerebroHive module, enabling executives, developers, analysts, and operators to interact with the entire platform through natural language.",
  hero: {
    title: "CerebroCopilot™",
    subtitle: "Enterprise AI Assistant Platform",
    description: "Your organization's universal AI assistant. CerebroCopilot operates across every CerebroHive module — retrieving knowledge from Archive, triggering workflows in Flow, generating code in Studio, explaining analytics from Insight, and executing commands across the platform through a single conversational interface.",
    primaryCta: "Meet CerebroCopilot",
    secondaryCta: "View Copilot Capabilities",
  },
  iconName: "MessageSquare",
  category: "Intelligence",
  status: "production",
  maturity: "ga",
  tags: ["AI Assistant", "Conversational AI", "Cross-Platform", "Enterprise Copilot", "NLP", "Knowledge Retrieval"],

  // Ecosystem Positioning
  ecosystemLayer: "business",
  moduleConnections: ["cerebro-archive", "cerebro-flow", "cerebro-insight", "cerebro-studio", "cerebro-sphere"],
  platformServices: ["ai-gateway", "knowledge-graph", "vector-search", "identity", "event-bus"],
  providesCapabilities: ["conversational-ai", "cross-product-search", "workflow-execution-via-chat", "document-qa"],

  seo: {
    title: "CerebroCopilot™ | Enterprise AI Assistant Platform | CerebroHive",
    description: "CerebroCopilot is an enterprise AI assistant platform that operates across every CerebroHive module — providing cross-platform knowledge retrieval, workflow execution, analytics explanations, code generation, and executive briefings through conversational AI.",
    keywords: [
      "enterprise AI assistant",
      "enterprise copilot software",
      "AI workplace assistant",
      "conversational enterprise AI",
      "cross-platform AI assistant",
      "enterprise chatbot platform",
      "AI knowledge retrieval assistant",
      "executive AI briefing tool",
      "enterprise AI copilot",
      "knowledge base chatbot enterprise",
    ],
  },

  config: {
    layout: "platform",
    sections: [
      "hero",
      "executive_summary",
      "business_problems",
      "core_capabilities",
      "integration_ecosystem",
      "deployment_models",
      "security_compliance",
      "faq",
      "cta",
    ],
  },

  businessProblems: [
    "Employees spend significant time searching for information across disconnected systems, wikis, and databases.",
    "Executives need briefings, summaries, and strategic insights that currently require manual preparation from analysts.",
    "AI tools are fragmented — each tool requires different interfaces, logins, and mental models.",
    "Knowledge locked in documents, meeting notes, and data systems is inaccessible without manual effort.",
    "Development teams lack an AI pair programmer integrated with their organization's own codebase and standards.",
  ],

  targetPersonas: ["All Enterprise Users", "Executives", "Developers", "Analysts", "Operations Teams", "HR Leaders", "Sales Teams"],
  industries: ["Financial Services", "Technology", "Healthcare", "Professional Services", "Manufacturing", "Retail"],

  coreCapabilities: [
    {
      title: "Cross-Platform Knowledge Retrieval",
      description: "Ask any question across the entire enterprise knowledge base — CerebroCopilot retrieves the most relevant context from CerebroArchive, documents, databases, and connected systems in real time.",
      icon: "Search",
    },
    {
      title: "Document Q&A",
      description: "Conversationally interrogate any document, report, contract, or dataset — 'Summarize clause 7 of this agreement', 'What are the risks in this financial report?'",
      icon: "FileText",
    },
    {
      title: "Workflow Execution via Chat",
      description: "Trigger CerebroFlow workflows, initiate agent tasks, and execute business processes through natural language — 'Send the Q3 report to the board', 'Initiate supplier onboarding for Acme Corp'.",
      icon: "Play",
    },
    {
      title: "Analytics Explanations",
      description: "Ask CerebroInsight questions in plain English and receive AI-generated explanations with visualizations — 'Why did our margin drop in Q3?' or 'Which products drove growth last month?'",
      icon: "BarChart",
    },
    {
      title: "Executive Briefings",
      description: "AI-generated daily, weekly, and on-demand executive briefings synthesizing key metrics, risk indicators, team updates, market signals, and strategic recommendations.",
      icon: "Briefcase",
    },
    {
      title: "Code Generation & Review",
      description: "Enterprise-aware code generation integrated with your codebase, standards, and architecture — generate, explain, review, and debug code with full context of your technical environment.",
      icon: "Code",
    },
    {
      title: "Meeting Intelligence",
      description: "Automatic meeting summaries, action item extraction, decision tracking, and follow-up scheduling — connected to calendar and project management systems.",
      icon: "Calendar",
    },
    {
      title: "Organization Knowledge Retrieval",
      description: "Find any colleague, team, process, system, or expertise within the organization — 'Who owns the API gateway?', 'Which team handles enterprise onboarding in Southeast Asia?'",
      icon: "Users",
    },
  ],

  deploymentModels: ["SaaS (Cloud)", "Private Cloud (VPC)", "On-Premises"],
  securityFeatures: [
    "Grounded Responses (No Hallucinated Facts)",
    "Role-Based Response Scoping",
    "PII Detection & Masking",
    "Full Conversation Audit Logging",
    "Data Residency Controls",
    "SOC 2 Type II",
  ],

  integrations: [
    { system: "CerebroArchive™", type: "Knowledge Source" },
    { system: "CerebroInsight™", type: "Analytics Layer" },
    { system: "CerebroFlow™", type: "Workflow Executor" },
    { system: "Slack / Microsoft Teams", type: "Chat Interface" },
    { system: "Microsoft 365 / Google Workspace", type: "Document & Calendar Access" },
    { system: "Jira / Confluence", type: "Project & Wiki Integration" },
    { system: "GitHub / GitLab", type: "Code Repository" },
  ],

  apiReference: "/developers/api/cerebro-copilot",
  sdkLanguages: ["Python", "TypeScript"],
  platformCapabilities: ["conversational-ai", "rag", "workflow-trigger", "cross-module-access"],
  relatedServices: ["ai-strategy", "enterprise-automation", "workforce-ai"],
  relatedResearch: ["enterprise-rag", "conversational-ai-patterns"],

  faqs: [
    {
      question: "How does CerebroCopilot differ from ChatGPT or Microsoft Copilot?",
      answer: "CerebroCopilot is grounded in your organization's own knowledge base, systems, and data — not general internet training data. It retrieves accurate, current information from CerebroArchive, can execute real actions in CerebroFlow, explains your actual analytics from CerebroInsight, and respects your organization's access controls. It is enterprise-aware, not general-purpose.",
    },
    {
      question: "Can CerebroCopilot actually take actions, or does it only answer questions?",
      answer: "CerebroCopilot can take actions. It integrates with CerebroFlow to trigger workflows, initiate processes, send notifications, and schedule tasks through natural language commands — subject to the same authorization policies that govern direct workflow execution. Action taking requires explicit user authorization.",
    },
    {
      question: "Is CerebroCopilot available in Slack and Teams?",
      answer: "Yes. CerebroCopilot is available as a native bot in Slack and Microsoft Teams, enabling employees to interact with organizational knowledge, trigger workflows, and receive briefings directly within the collaboration tools they already use.",
    },
  ],
};
