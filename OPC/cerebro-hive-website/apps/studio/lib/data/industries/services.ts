import { Industry } from "./types";

export const services: Industry = {
  name: "Professional Services",
  slug: "services",
  color: "#10B981", // Emerald
  engineConfig: {
    heroTheme: "services",
    backgroundAnimation: "transaction-network",
    primaryColor: "#10B981", // Emerald
    secondaryColor: "#1E3A8A", // Navy
    accentColor: "#EAB308" // Gold
  },
  hero: {
    title: "AI for Knowledge-Driven Enterprises",
    subtitle: "CONSULTING & LEGAL AI",
    description: "Break down knowledge silos, automate proposal generation, and accelerate project delivery with enterprise AI.",
    primaryCta: "Explore Services AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 72,
    currentChallengesSummary: "Trapped institutional knowledge and manual document drafting.",
    opportunitySummary: "AI-driven knowledge graphs and automated proposal generation.",
    statistics: [
      { metric: "40%", label: "Faster Proposals" },
      { metric: "25%", label: "Billable Hour Boost" },
      { metric: "100%", label: "Knowledge Search" }
    ]
  },
  segments: ["Management Consulting", "Legal Services", "Accounting", "Architecture", "Engineering", "Marketing Agencies"],
  challenges: [
    {
      title: "Knowledge Silos",
      pain: "Consultants re-inventing the wheel because past work is hidden in disjointed drives.",
      cost: "Wasted billable hours and lower quality deliverables",
      businessImpact: "Margin Compression",
      priority: "Critical",
      category: "Operations",
      problems: ["Trapped Data", "SharePoint Mazes", "High Turnover Loss", "Redundant Work"],
      solutions: ["Enterprise Knowledge Graph", "Semantic Search", "RAG Systems", "AI Research Assistant"],
      outcomes: ["↑ Consultant Efficiency", "↓ Research Time", "↑ IP Reusability"],
      techStack: ["Neo4j", "Pinecone", "LangChain", "Azure OpenAI"],
      aiAgent: "Research Agent",
      readiness: { implementation: "10 Weeks", complexity: "Medium", roi: "Very High" }
    },
    {
      title: "Proposal Creation",
      pain: "Manual drafting of RFPs takes valuable time away from client delivery.",
      cost: "Lost bids and high business development costs",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Operations",
      problems: ["Slow Response Times", "Inconsistent Branding", "Manual Copy-Pasting", "Missed Deadlines"],
      solutions: ["Proposal AI Agent", "Generative Drafting", "Past Performance Matching", "Automated Formatting"],
      outcomes: ["↑ Win Rate", "↓ BD Costs", "↑ Proposal Volume"],
      techStack: ["Anthropic", "ElasticSearch", "React", "Node.js"],
      aiAgent: "Proposal Agent",
      readiness: { implementation: "8 Weeks", complexity: "Low", roi: "High" }
    },
    {
      title: "Decision Support",
      pain: "Partners lack real-time visibility into project health and margins.",
      cost: "Project overruns and poor resource allocation",
      businessImpact: "Operational Friction",
      priority: "High",
      category: "Risk",
      problems: ["Stale Dashboards", "Resource Clashes", "Scope Creep", "Margin Erosion"],
      solutions: ["Executive Intelligence AI", "Predictive Analytics", "Automated Status Reporting", "Resource Optimization"],
      outcomes: ["↑ Project Margins", "↑ Resource Utilization", "↓ Scope Creep"],
      techStack: ["Databricks", "Tableau", "AWS", "Python"],
      aiAgent: "Executive Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Consulting Copilot", description: "AI companion assisting in daily client deliverables.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "consultant", position: { x: 0, y: 150 }, data: { label: "Consultant", type: "client" } },
      { id: "portal", position: { x: 200, y: 150 }, data: { label: "Intranet", type: "gateway", status: "Healthy" } },
      { id: "kg", position: { x: 400, y: 150 }, data: { label: "Knowledge Graph", type: "database" } },
      { id: "ai", position: { x: 600, y: 150 }, data: { label: "Services AI", type: "ai", status: "Active" } }
    ],
    edges: []
  },
  agents: [
    { name: "Research Agent", description: "Synthesizes past deliverables.", capabilities: ["Semantic Search"] },
    { name: "Proposal Agent", description: "Drafts client proposals.", capabilities: ["Generation"] }
  ],
  erpIntegration: ["PSA", "Finance", "CRM"],
  techStack: [{ layer: "Knowledge", technologies: ["Vector DB", "Graph DB"] }],
  outcomes: [],
  caseStudy: { client: "Global Consultancy", title: "AI Knowledge Base", timeline: "6 Months", architecture: "Services AI", outcome: "Success", metric: "40%" },
  roadmap: [],
  compliance: [{ badge: "ISO 27001", description: "Information Security Management" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: [],

  seo: {
    title: "Professional Services AI | AI for Consulting, Legal & Advisory Firms | CerebroHive",
    description: "CerebroHive deploys AI for professional services firms — consulting AI, knowledge management, proposal automation, research synthesis, and AI-powered service delivery for law firms, consultancies, and advisory practices.",
    keywords: ["professional services AI", "consulting AI", "legal AI", "AI for law firms", "knowledge management AI", "proposal automation AI", "advisory AI", "AI for consultants", "professional services automation"],
  },

  faqs: [
    { question: "How is AI transforming professional services firms?", answer: "Professional services AI transforms how firms deliver expertise: knowledge management (AI makes the firm's accumulated knowledge instantly searchable and queryable — finding relevant past engagements, methodologies, and frameworks in seconds); research synthesis (AI aggregates and summarizes relevant information from multiple sources for client briefs and market analyses); proposal automation (AI generates first-draft proposals and engagement letters from client requirements and past proposal libraries); delivery efficiency (AI assists with data analysis, presentation drafting, and report generation); and client intelligence (AI analyzes client relationship data to identify growth opportunities, risk signals, and next-best-action recommendations)." },
    { question: "How does AI help consulting firms deliver better client work?", answer: "Consulting firm AI: research assistance (AI synthesizes client materials, industry data, and proprietary knowledge base into structured briefs faster than any human analyst); hypothesis generation (AI draws connections across the firm's knowledge base to suggest analytical frameworks relevant to the client's situation); data analysis (AI accelerates quantitative analysis, identifying patterns and outliers for consultant interpretation); presentation drafting (AI generates structured slide outlines and first drafts from analytical findings); and knowledge transfer (AI captures insights from each engagement into the firm's knowledge base, making them retrievable for future teams)." },
    { question: "How do law firms use AI?", answer: "Law firm AI applications: contract review (AI extracts key terms, identifies non-standard clauses, and flags potential risks across large document sets in due diligence); legal research (AI finds relevant cases, statutes, and regulations faster than traditional research tools by understanding legal concepts, not just keywords); document drafting (AI generates first drafts of agreements, motions, and legal memos from templates and prior work product); discovery (AI classifies and prioritizes documents for relevance in litigation discovery); regulatory monitoring (AI tracks regulatory changes relevant to client industries and surfaces implications for counsel to address); and billing optimization (AI analyzes billing records for write-down patterns and identifies billing efficiency opportunities)." },
    { question: "What is knowledge management AI for professional services?", answer: "Knowledge management AI for professional services firms: makes accumulated engagement knowledge (past work product, methodologies, case studies) instantly searchable through semantic understanding; surfaces relevant prior work when practitioners start new engagements; extracts and structures knowledge from unstructured documents (reports, presentations, emails) into a queryable knowledge base; identifies expertise within the firm ('who has done this kind of work before?'); and surfaces connections between client situations and previous engagement learnings that might not be apparent to individual practitioners." },
    { question: "How does AI help with proposal and pitch automation?", answer: "Proposal AI accelerates the pitch process by: extracting relevant case studies and credentials from past proposals that match the prospect's industry, challenge type, and scale; generating tailored proposal sections that combine standard methodology with client-specific context; personalizing credentials presentations to highlight the most relevant prior work; researching the prospect company from public sources to enrich the proposal with company-specific insights; and tracking proposal versions and outcomes to continuously improve proposal effectiveness through AI-assisted learning." },
    { question: "What are the risks of AI in legal and consulting contexts?", answer: "Professional services AI risks: attorney-client privilege (AI systems must be designed to protect privileged communications from unauthorized disclosure, including vendor AI training on client data); confidentiality (client information used with AI must comply with professional confidentiality obligations and engagement letters); accuracy (AI outputs require professional review — the professional remains responsible for advice accuracy regardless of AI assistance); attribution (AI-generated work product must be reviewed and owned by the professional); and conflict of interest (AI-powered knowledge bases must include conflict checking to prevent inadvertent disclosure of one client's information to another)." },
    { question: "How does AI assist professional services firms with client relationship management?", answer: "CRM AI for professional services: relationship intelligence (AI aggregates email, meeting, and engagement history to surface relationship depth and recency across client contacts); opportunity identification (AI analyzes client relationship patterns, industry news, and engagement history to identify potential next engagements); at-risk signal detection (AI monitors relationship health indicators and flags accounts where engagement frequency or sentiment suggests dissatisfaction); pipeline management (AI assists with opportunity qualification, proposal tracking, and win-loss analysis); and contact enrichment (AI enriches client contact records with LinkedIn data, role changes, and public news to keep CRM current)." },
    { question: "How do professional services firms implement AI without compromising client confidentiality?", answer: "Confidentiality-respecting AI implementation requires: data isolation (each client's data is isolated from other clients in the AI system architecture); restricted training (AI models used for client work must not be trained on other clients' confidential data — this typically means using API access to commercial LLMs rather than fine-tuning on client materials); access control (AI responses about one client are never exposed to another client's engagement team); vendor contracts (AI vendors must agree to data processing terms consistent with professional obligations — no training on client data, appropriate security controls); and audit trails (all AI interactions with client data are logged for professional liability protection)." },
    { question: "What is the ROI of AI for professional services firms?", answer: "Professional services AI ROI: research and analysis tasks that previously took 4–8 hours per analyst can be completed in 1–2 hours with AI assistance (50–75% productivity improvement); proposal preparation time reduced 40–60% through AI-assisted drafting and case study retrieval; billable work per engagement increased through better leveraging of junior staff for more complex tasks; new business win rates improved through more tailored, compelling proposals; and knowledge reuse increased (new engagements benefit from past work product that would previously remain siloed)." },
    { question: "How should professional services firms govern AI use?", answer: "Professional services AI governance should cover: acceptable use policies (which tasks may use AI assistance, what client data can be input to AI tools); quality review requirements (all AI-generated work product requires professional review before delivery to clients); vendor approval process (only approved AI tools with appropriate confidentiality protections may be used for client work); disclosure standards (whether and when to disclose AI assistance to clients — some clients require disclosure, some prohibit AI use); and training requirements (all professionals using AI in client work must complete training on appropriate use, quality review, and ethical obligations)." },
  ],
};
