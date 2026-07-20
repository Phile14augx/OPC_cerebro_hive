/** The ten Core Consulting Capabilities — structured, machine-operable versions
 *  of the practice areas on cerebropchive.org/services. */
export interface ConsultingCapability {
  id: string;
  name: string;
  tagline: string;
  outcomes: string[];
  deliverables: string[];
  /** Which Enterprise AI OS capabilities power delivery. */
  poweredBy: string[];
  assessmentDimensions: string[];
}

export const ENGAGEMENT_PHASES = ["assess", "strategy", "architecture", "build", "govern", "scale"] as const;
export type EngagementPhase = typeof ENGAGEMENT_PHASES[number];

export const CONSULTING_CATALOG: ConsultingCapability[] = [
  {
    id: "cerebroai-strategy",
    name: "CerebroAI Strategy™",
    tagline: "Executive AI strategy and development-first roadmaps grounded in business value.",
    outcomes: ["Prioritized AI opportunity portfolio", "Executive alignment", "Value-chain mapping"],
    deliverables: ["Enterprise AI Readiness Assessment", "Prioritized Use-Case Portfolio", "Governance Framework", "90-Day Implementation Roadmap"],
    poweredBy: ["hub", "simulator", "knowledge", "sphere"],
    assessmentDimensions: ["strategy", "data", "platform", "talent", "governance"],
  },
  {
    id: "enterprise-intelligence-modernization",
    name: "Enterprise Intelligence Modernization™",
    tagline: "Turn fragmented data estates into governed, queryable enterprise intelligence.",
    outcomes: ["Unified data access", "Governed semantic layer", "Search over everything"],
    deliverables: ["Enterprise Data Ontology", "Automated ETL & RAG Pipelines", "Deployed Knowledge Graph", "Data Governance Framework"],
    poweredBy: ["knowledge", "memory", "connect", "guard"],
    assessmentDimensions: ["data", "platform", "governance"],
  },
  {
    id: "autonomous-enterprise-transformation",
    name: "Autonomous Enterprise Transformation™",
    tagline: "Move from pilots to an agentic operating model with humans on the loop.",
    outcomes: ["Autonomous workflows in production", "Human approval gates", "Playbook-driven scale"],
    deliverables: ["Agentic Operating Model", "Deployed Multi-Agent Squads", "Change Management Playbook", "Workforce Transition Plan"],
    poweredBy: ["runtime", "mesh", "flow", "governance"],
    assessmentDimensions: ["strategy", "platform", "talent"],
  },
  {
    id: "ai-platform-engineering",
    name: "AI Platform Engineering™",
    tagline: "Production-ready AI platform: infrastructure-as-code, secure by default.",
    outcomes: ["Reproducible environments", "CI/CD for models and agents", "Cost observability"],
    deliverables: ["Production-Ready AI Platform", "Infrastructure-as-Code Repositories", "CI/CD Pipelines", "Runbooks & Technical Documentation"],
    poweredBy: ["x-gateway", "observatory", "guard", "connect"],
    assessmentDimensions: ["platform", "data", "governance"],
  },
  {
    id: "knowledge-engineering",
    name: "Knowledge Engineering™",
    tagline: "GraphRAG, ontologies, and citation-grade retrieval over enterprise corpora.",
    outcomes: ["Grounded answers with citations", "Entity-linked corpus", "Hybrid search"],
    deliverables: ["Enterprise Knowledge Ontology", "Automated Graph Construction Pipeline", "Tuned GraphRAG API Endpoints"],
    poweredBy: ["knowledge", "context", "eval"],
    assessmentDimensions: ["data", "platform"],
  },
  {
    id: "ai-factory",
    name: "AI Factory™",
    tagline: "A repeatable production line for AI use cases: intake → build → evaluate → ship.",
    outcomes: ["Continuous stream of deployed AI solutions", "Standardized delivery", "Agent SLAs"],
    deliverables: ["AI Factory Operating Model", "Continuous Delivery Stream", "Standardized Agent Build Templates", "Agent SLAs"],
    poweredBy: ["runtime", "flow", "eval", "observatory"],
    assessmentDimensions: ["platform", "talent", "strategy"],
  },
  {
    id: "ai-center-of-excellence",
    name: "AI Center of Excellence™",
    tagline: "Institutionalize AI capability: standards, enablement, and reusable assets.",
    outcomes: ["Reusable pattern library", "Trained champions", "Standards adoption"],
    deliverables: ["CoE Charter & Operating Model", "Enterprise AI Architectural Standards", "Custom Training Curriculum"],
    poweredBy: ["sphere", "knowledge", "governance"],
    assessmentDimensions: ["talent", "strategy", "governance"],
  },
  {
    id: "ai-governance-trust",
    name: "AI Governance & Trust™",
    tagline: "Responsible AI: policy, risk controls, and audit-ready compliance.",
    outcomes: ["Audit-ready AI estate", "Policy enforcement in the runtime path", "Risk visibility"],
    deliverables: ["Comprehensive AI Risk Assessment", "Enterprise AI Policy Framework", "Automated Compliance Scorecards"],
    poweredBy: ["guard", "governance", "eval", "observatory"],
    assessmentDimensions: ["governance", "strategy"],
  },
  {
    id: "ai-operations-aiops",
    name: "AI Operations (AIOps)™",
    tagline: "Run the AI estate as a managed service: monitoring, optimization, incident response.",
    outcomes: ["24/7 monitored agents", "Cost optimization", "Fast incident response"],
    deliverables: ["24/7 Fleet Monitoring", "Monthly Optimization Reports", "Incident Response SLAs"],
    poweredBy: ["observatory", "simulator", "runtime"],
    assessmentDimensions: ["platform", "governance"],
  },
  {
    id: "industry-ai-accelerator",
    name: "Industry AI Accelerator™",
    tagline: "Vertical accelerators: pre-built ontologies, compliance maps, and agent squads per industry.",
    outcomes: ["Weeks-not-months vertical deployment", "Compliance alignment", "Domain agent library"],
    deliverables: ["Industry-Specific Knowledge Graph", "Pre-built Workflows & Integrations", "Domain-Tuned AI Agents"],
    poweredBy: ["knowledge", "flow", "mesh", "connect"],
    assessmentDimensions: ["data", "strategy", "platform"],
  },
];

export const MATURITY_LEVELS = ["Nascent", "Emerging", "Operational", "Scaled", "Transformative"] as const;
