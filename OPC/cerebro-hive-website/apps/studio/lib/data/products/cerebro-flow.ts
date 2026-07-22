import { PackagedProduct } from "../types";

export const cerebroFlowProduct: PackagedProduct = {
  id: "cerebro-flow",
  slug: "cerebro-flow",
  title: "CerebroFlow™",
  summary: "The enterprise AI Automation Platform — event-driven workflow orchestration, AI-native automation, intelligent integrations, business process automation, and human-in-the-loop approvals at enterprise scale.",
  hero: {
    title: "CerebroFlow™",
    subtitle: "AI Automation Platform",
    description: "Automate complex enterprise workflows with AI at the core. CerebroFlow orchestrates multi-step, multi-agent processes across systems — from data pipelines and document workflows to customer journeys and compliance processes — with built-in human approvals, retry logic, and full audit trails.",
    primaryCta: "Explore Automation Platform",
    secondaryCta: "View Workflow Templates",
  },
  iconName: "Workflow",
  category: "Intelligence",
  status: "production",
  maturity: "ga",
  tags: ["Workflow Automation", "AI Orchestration", "Event-Driven", "Business Process", "Integrations", "Human-in-the-Loop"],

  // Ecosystem Positioning
  ecosystemLayer: "business",
  moduleConnections: ["cerebro-archive", "cerebro-studio", "cerebro-insight", "cerebro-copilot", "hivepulse", "hive-ops"],
  platformServices: ["event-bus", "ai-gateway", "identity", "audit", "storage"],
  providesCapabilities: ["workflow-execution", "automation-engine", "integration-layer", "scheduling"],

  seo: {
    title: "CerebroFlow™ | Enterprise AI Automation Platform | CerebroHive",
    description: "CerebroFlow is an enterprise AI automation platform providing event-driven workflow orchestration, AI-native business process automation, intelligent integrations, and human-in-the-loop approvals at enterprise scale.",
    keywords: [
      "enterprise AI automation platform",
      "AI workflow orchestration",
      "business process automation AI",
      "event-driven workflow platform",
      "AI integration platform",
      "enterprise automation software",
      "intelligent workflow automation",
      "AI process automation",
      "low-code automation platform enterprise",
      "agentic workflow automation",
    ],
  },

  config: {
    layout: "platform",
    sections: [
      "hero",
      "executive_summary",
      "business_problems",
      "core_capabilities",
      "architecture_overview",
      "integration_ecosystem",
      "deployment_models",
      "security_compliance",
      "faq",
      "cta",
    ],
  },

  businessProblems: [
    "Critical business processes still require manual handoffs, creating bottlenecks and error-prone operations.",
    "AI capabilities are isolated — they don't trigger real actions in connected enterprise systems.",
    "Workflow automation tools lack AI reasoning, requiring rigid rules that break on edge cases.",
    "Complex multi-step processes involving multiple systems have no reliable orchestration layer.",
    "Compliance and audit requirements demand traceable, documented workflow execution that current tools cannot provide.",
  ],

  targetPersonas: ["Operations Leaders", "Process Engineers", "AI/ML Engineers", "Enterprise Architects", "IT Leaders", "Compliance Teams"],
  industries: ["Financial Services", "Insurance", "Healthcare", "Manufacturing", "Retail", "Logistics", "Government"],

  coreCapabilities: [
    {
      title: "Event-Driven Orchestration",
      description: "Trigger complex multi-step workflows from any enterprise event — document uploads, API calls, database changes, scheduled jobs, or AI model outputs — with guaranteed delivery and retry logic.",
      icon: "Zap",
    },
    {
      title: "AI-Native Workflow Nodes",
      description: "First-class AI steps within every workflow — LLM reasoning, document extraction, classification, entity recognition, semantic routing, and summarization as native workflow primitives.",
      icon: "Brain",
    },
    {
      title: "Human-in-the-Loop Approvals",
      description: "Embed human review checkpoints in any automated workflow — route approval requests to the right person with full context, SLA tracking, and escalation paths.",
      icon: "CheckSquare",
    },
    {
      title: "Enterprise Integration Hub",
      description: "Native connectors for SAP, Salesforce, ServiceNow, Microsoft 365, Slack, Jira, and 200+ enterprise systems — plus a universal REST/GraphQL adapter for custom integrations.",
      icon: "Plug",
    },
    {
      title: "Intelligent Scheduling Engine",
      description: "Cron-based, interval-based, and AI-adaptive scheduling — workflows that learn from execution patterns and self-optimize trigger timing for peak efficiency.",
      icon: "Clock",
    },
    {
      title: "Business Process Modeling",
      description: "BPMN-compliant visual process designer with AI-assisted flow generation — model complex business processes with decision gateways, parallel branches, and sub-workflows.",
      icon: "GitMerge",
    },
    {
      title: "Workflow Analytics",
      description: "Real-time execution telemetry — throughput, latency, success rates, cost per run, bottleneck identification, and predictive SLA monitoring across all active workflows.",
      icon: "BarChart",
    },
    {
      title: "Low-Code Automation Builder",
      description: "Citizen developer-friendly workflow builder enabling business teams to create and modify automation logic without engineering support — governed by enterprise approval workflows.",
      icon: "Layout",
    },
  ],

  deploymentModels: ["SaaS (Cloud)", "Private Cloud (VPC)", "On-Premises", "Hybrid"],
  securityFeatures: [
    "End-to-End Workflow Encryption",
    "Secrets Vault Integration",
    "Role-Based Workflow Access",
    "Immutable Audit Trails",
    "SOC 2 Type II",
    "GDPR Compliant",
    "PII Masking in Logs",
  ],

  integrations: [
    { system: "CerebroArchive™", type: "Knowledge-Triggered Workflows" },
    { system: "CerebroInsight™", type: "Analytics on Workflow Data" },
    { system: "HivePulse™", type: "Agent Execution Layer" },
    { system: "SAP / Oracle / Workday", type: "ERP Connector" },
    { system: "Salesforce / HubSpot", type: "CRM Connector" },
    { system: "ServiceNow / Jira", type: "ITSM Connector" },
    { system: "Slack / Teams / Email", type: "Notification Channel" },
    { system: "NATS / Kafka / RabbitMQ", type: "Event Bus" },
  ],

  apiReference: "/developers/api/cerebro-flow",
  sdkLanguages: ["Python", "TypeScript", "Go"],
  platformCapabilities: ["workflow-engine", "event-bus", "scheduler", "integration-hub"],
  relatedServices: ["ai-automation", "process-engineering", "enterprise-integration"],
  relatedResearch: ["enterprise-automation-patterns", "agentic-workflows"],

  faqs: [
    {
      question: "How does CerebroFlow differ from traditional workflow automation tools like Zapier or n8n?",
      answer: "CerebroFlow is built for enterprise AI orchestration, not just API chaining. It provides first-class AI steps (LLM reasoning, document extraction, semantic routing), enterprise-grade audit trails, BPMN-compliant process modeling, human-in-the-loop approvals with SLA tracking, and deep integration with the CerebroHive platform. It is designed for complex, compliance-sensitive, high-volume enterprise operations.",
    },
    {
      question: "Can non-technical teams create workflows in CerebroFlow?",
      answer: "Yes. CerebroFlow includes a low-code automation builder designed for business analysts and operations teams. Business-created workflows are reviewed by engineering before production deployment, maintaining governance while enabling business agility. AI assistance helps teams describe workflows in plain language and generates the initial flow structure.",
    },
  ],
};
