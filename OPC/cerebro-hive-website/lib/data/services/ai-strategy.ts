import { EnterpriseService } from "../types";

export const aiStrategyService: EnterpriseService = {
  id: "ai-strategy",
  slug: "ai-strategy",
  title: "CerebroAI Strategy™",
  summary: "Executive AI strategy and roadmap development to engineer intelligent enterprises.",
  hero: {
    title: "CerebroAI Strategy™",
    subtitle: "Executive Advisory",
    description: "Map your enterprise AI transformation journey with our principal architects. Move beyond pilots and build a scalable, defensible AI moat."
  },
  iconName: "Compass",
  category: "Strategy",
  status: "production",
  tags: ["Strategy", "Roadmap", "Advisory", "C-Suite"],

  seo: {
    title: "Enterprise AI Strategy & Roadmap | CerebroHive",
    description: "CerebroHive's CerebroAI Strategy™ service delivers board-ready AI roadmaps, use case prioritization, and target operating models for enterprises in 45 days.",
    keywords: [
      "enterprise AI strategy", "AI roadmap consulting", "AI transformation roadmap",
      "AI use case prioritization", "enterprise AI advisory", "AI strategy consultant",
      "CIO AI strategy", "AI governance framework", "AI maturity assessment",
    ],
  },

  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "business_challenges",
      "methodology",
      "roadmap",
      "deliverables",
      "products",
      "roi",
      "faq",
      "cta"
    ]
  },

  executiveProblem: "Organizations struggle to identify high-ROI AI use cases amidst vendor hype, resulting in fragmented shadow AI, disconnected pilots, and unscalable point solutions.",
  businessImpact: "Without a unified strategy, enterprises risk competitive obsolescence, technical debt, and compliance violations as AI adoption scales uncontrollably.",

  businessChallenges: [
    {
      title: "Pilot Purgatory",
      description: "Getting stuck in endless proofs of concept that never reach production due to missing infrastructure or security."
    },
    {
      title: "Shadow AI Risks",
      description: "Employees independently adopting unsafe public LLMs, exposing proprietary data and intellectual property."
    },
    {
      title: "Vendor Lock-in",
      description: "Over-reliance on closed-source model providers leading to skyrocketing inference costs and rigid architectures."
    }
  ],

  targetPersonas: ["CIO", "CDO", "VP of Innovation", "CEO"],
  industries: ["Finance", "Healthcare", "Manufacturing", "Retail"],
  methodologyOverview: "Our strategy engagement follows a rigorous 3-phase methodology: Assessment, Architecture, and Acceleration, designed to deliver board-ready roadmaps within 45 days.",

  timeline: [
    {
      title: "Discovery & Assessment",
      duration: "Week 1-2",
      activities: ["Executive Stakeholder Interviews", "Current State Architecture Review", "Data Maturity Scoring"]
    },
    {
      title: "Use Case Prioritization",
      duration: "Week 3-4",
      activities: ["Feasibility Analysis", "ROI Modeling", "Capability Mapping against Cerebro Platform"]
    },
    {
      title: "Roadmap Formulation",
      duration: "Week 5-6",
      activities: ["Target Operating Model Design", "90-Day Execution Plan", "Board Presentation Delivery"]
    }
  ],

  successMetrics: [
    { metric: "Time-to-Production", value: "-60%", timeframe: "Within 6 Months" },
    { metric: "AI Use Case ROI", value: "3x", timeframe: "Year 1" },
    { metric: "Security Compliance", value: "100%", timeframe: "Day 1" }
  ],

  // Graph Connections
  products: ["cerebro-insight", "cerebro-sphere"],
  platformCapabilities: ["governance", "eval", "observatory"],
  relatedResearch: ["ai-safety", "agent-architectures"],

  deliverables: [
    "Enterprise AI Readiness Assessment",
    "Prioritized Use Case Backlog",
    "Target Platform Architecture",
    "Security & Governance Framework",
    "90-Day Implementation Roadmap"
  ],

  engagementModel: "Fixed Scope Workshop & Advisory Retainer",

  pricing: {
    type: "Fixed Scope Engagement",
    description: "A comprehensive 6-week strategy engagement led by a Principal AI Architect.",
    startingAt: "$45,000"
  },

  faqs: [
    {
      question: "What is an enterprise AI strategy?",
      answer: "An enterprise AI strategy is a structured plan that defines how an organization will adopt, deploy, and scale artificial intelligence across its operations. It covers AI use case identification, technology architecture choices, governance frameworks, talent requirements, and a phased roadmap — typically over 12–36 months. CerebroHive delivers board-ready AI strategies that align AI investments with measurable business outcomes.",
    },
    {
      question: "How long does a CerebroHive AI Strategy engagement take?",
      answer: "Our CerebroAI Strategy™ engagement follows a 6-week structured process: 2 weeks for discovery and assessment, 2 weeks for use case prioritization and ROI modeling, and 2 weeks for roadmap formulation and executive presentation delivery. This results in a board-ready strategy with a 90-day execution plan.",
    },
    {
      question: "What deliverables do we receive from the AI Strategy engagement?",
      answer: "You receive five core deliverables: (1) Enterprise AI Readiness Assessment scoring your data, infrastructure, and talent maturity; (2) Prioritized Use Case Backlog with ROI projections; (3) Target Platform Architecture aligned to your existing tech stack; (4) Security & Governance Framework covering compliance and risk; and (5) a 90-Day Implementation Roadmap with resource requirements.",
    },
    {
      question: "Who should participate from our organization?",
      answer: "We require active participation from IT leadership (CIO/CDO), line-of-business owners from 2–3 priority functions, and executive sponsorship at the C-suite level. The strategy engagement is most effective when business context and technical constraints are both represented from day one.",
    },
    {
      question: "Do you only recommend CerebroHive products in the strategy?",
      answer: "No — our architectural recommendations are vendor-agnostic and built on open standards. We recommend the best tools for your specific context: cloud providers, model providers, vector databases, orchestration frameworks, and governance tools. Where CerebroHive products (like HivePulse or Cerebro X) are the right fit, we include them; otherwise we recommend alternatives.",
    },
    {
      question: "What is an AI readiness assessment and why do we need one?",
      answer: "An AI readiness assessment evaluates your organization's current state across five dimensions: data maturity, infrastructure readiness, talent capability, governance posture, and business process digitization. It's the foundation of a sound AI strategy because it reveals where you are on the maturity curve and what investments are needed before scaling AI. Without it, organizations typically waste 6–18 months on pilots that can't scale.",
    },
    {
      question: "How do you prioritize AI use cases?",
      answer: "We score AI use cases across four axes: business value (revenue impact, cost savings, risk reduction), technical feasibility (data availability, model maturity, integration complexity), strategic alignment (fit with company direction), and time-to-value (speed of implementation). Use cases are plotted on a value-feasibility matrix and sequenced into a phased roadmap — quick wins first, transformational initiatives later.",
    },
    {
      question: "What is an AI Target Operating Model?",
      answer: "An AI Target Operating Model (TOM) defines how AI will be built, deployed, governed, and scaled within your organization. It specifies the roles and teams responsible for AI (centralized CoE, federated, or hybrid), the governance structure, the technology platform choices, the data ownership model, and the processes for AI evaluation and deployment. CerebroHive delivers a bespoke TOM as part of the strategy engagement.",
    },
    {
      question: "How does CerebroHive handle AI governance in the strategy?",
      answer: "Every CerebroAI Strategy™ engagement includes an AI Governance Framework covering: model explainability requirements, data privacy and security controls, regulatory compliance mapping (GDPR, HIPAA, SOC 2 as applicable), AI risk categorization, bias assessment processes, and human-in-the-loop protocols. Governance is not bolted on — it is architected in from the start.",
    },
    {
      question: "What industries do you have AI strategy experience in?",
      answer: "CerebroHive has delivered AI strategies for organizations in Financial Services, Healthcare, Manufacturing, Retail, Logistics, Legal & Compliance, Government, Technology, Energy, and Education. Each strategy is tailored to the regulatory environment, data landscape, and competitive dynamics of the specific industry.",
    },
    {
      question: "What happens after the strategy engagement ends?",
      answer: "After the strategy delivery, clients typically move into one of three paths: (1) Advisory Retainer — ongoing monthly access to CerebroHive architects during implementation; (2) Platform Engineering — we build the technical foundation defined in the strategy; or (3) Self-execution with documentation — for organizations with strong internal teams who need a plan but not ongoing support. We design the handoff to match your capability.",
    },
    {
      question: "How do you measure ROI from an AI strategy investment?",
      answer: "We measure AI strategy ROI across three time horizons. Immediate (0–90 days): reduced time to identify the right use cases, avoided spend on low-value pilots. Medium-term (6–12 months): faster time-to-production on prioritized use cases, measured as weeks saved. Long-term (12–36 months): revenue uplift, cost reduction, and productivity gains from scaled AI initiatives. Our engagements include an ROI tracking framework tied to the roadmap milestones.",
    },
  ],
};
