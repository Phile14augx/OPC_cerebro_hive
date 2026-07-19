import { EnterpriseService } from "../types";

export const coeService: EnterpriseService = {
  id: "coe",
  slug: "coe",
  title: "AI Center of Excellence™",
  summary: "Enterprise enablement and internal capability building.",
  hero: {
    title: "AI Center of Excellence™",
    subtitle: "Enablement",
    description: "Establish internal standards, training, and best practices for AI to empower your own workforce to build safely."
  },
  iconName: "Building2",
  category: "Enablement",
  status: "production",
  tags: ["CoE", "Enablement", "Training", "Standards"],

  seo: {
    title: "AI Center of Excellence Setup | Enterprise AI CoE | CerebroHive",
    description: "CerebroHive builds and operationalizes AI Centers of Excellence — the governance, delivery, and enablement hub that scales enterprise AI capability from pilot to organization-wide adoption.",
    keywords: [
      "AI center of excellence", "enterprise AI CoE", "AI CoE setup consulting",
      "AI governance center", "enterprise AI capability building", "AI operating model",
      "AI enablement program", "AI standards and governance", "AI CoE structure",
    ],
  },

  config: {
    layout: "standard",
    sections: [
      "hero",
      "executive_summary",
      "business_challenges",
      "methodology",
      "roadmap",
      "deliverables",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Decentralized AI efforts lead to duplicated work, inconsistent architectures, and a lack of standardized training across the enterprise.",
  businessImpact: "Without a central authority for standards and training, the organization fails to build reusable components, slowing overall adoption and increasing risk.",

  businessChallenges: [
    {
      title: "Skills Gap",
      description: "Existing developers lack knowledge in prompt engineering, agent orchestration, and LLM behavior."
    },
    {
      title: "Fragmented Standards",
      description: "Different teams using different tools, models, and frameworks, leading to a maintenance nightmare."
    }
  ],

  targetPersonas: ["CIO", "Chief Innovation Officer", "VP of Engineering"],
  industries: ["Cross-Industry"],
  methodologyOverview: "We help you stand up an internal CoE that acts as the hub for AI governance, architecture standards, and corporate education.",

  timeline: [
    {
      title: "CoE Charter & Design",
      duration: "Weeks 1-2",
      activities: ["Define CoE Mandate", "Identify Key Personnel"]
    },
    {
      title: "Standards Development",
      duration: "Weeks 3-4",
      activities: ["Define Architecture Guidelines", "Select Approved Toolchains"]
    },
    {
      title: "Enablement Rollout",
      duration: "Weeks 5-8",
      activities: ["Launch Internal Training", "Establish Office Hours"]
    }
  ],

  successMetrics: [
    { metric: "Internal AI Projects Launched", value: "3x", timeframe: "Year 1" },
    { metric: "Certified Employees", value: "500+", timeframe: "Year 1" }
  ],

  products: ["cerebro-learn"],
  platformCapabilities: ["simulator"],
  relatedResearch: [],

  deliverables: [
    "CoE Charter & Operating Model",
    "Enterprise AI Architecture Standards",
    "Custom Training Curriculum"
  ],

  engagementModel: "Advisory Retainer",

  pricing: {
    type: "Retainer",
    description: "Ongoing advisory and training support billed monthly.",
  },

  faqs: [
    {
      question: "What is an AI Center of Excellence (CoE)?",
      answer: "An AI Center of Excellence (CoE) is a centralized or federated organizational unit responsible for governing, enabling, and scaling AI adoption across an enterprise. It defines AI standards, owns the AI technology stack, provides expertise and training to business units, governs AI risk and compliance, and drives the AI roadmap. An effective CoE is both a technical capability center and a change engine — it makes AI adoption faster, safer, and more consistent across the organization.",
    },
    {
      question: "What is the difference between a centralized AI CoE, a federated CoE, and a hybrid model?",
      answer: "A centralized CoE places all AI capability and decision-making in a single team that serves all business units. It ensures consistency and avoids duplication but can become a bottleneck. A federated CoE embeds AI specialists within each business unit, maximizing speed and domain fit but risking inconsistency. A hybrid model (recommended by CerebroHive) maintains a central CoE for standards, governance, and shared infrastructure while placing embedded AI champions in business units who operate within central guardrails.",
    },
    {
      question: "What does CerebroHive deliver in an AI CoE engagement?",
      answer: "CerebroHive delivers an operational AI CoE covering: CoE charter and organizational design (roles, governance structure, reporting lines); AI standards and playbooks (development standards, evaluation frameworks, deployment gates); training programs for internal AI practitioners; tooling and platform setup (MLflow, experiment tracking, model registry, evaluation tools); CoE metrics and reporting dashboards; and leadership advisory for the first 6–12 months of operation.",
    },
    {
      question: "How long does it take to set up an AI CoE?",
      answer: "CerebroHive's CoE setup follows a 3-phase program. Phase 1 (Foundation, 8–12 weeks): CoE charter, initial team hiring support, tooling setup, and first standards documentation. Phase 2 (Operationalization, 3–6 months): first CoE-delivered AI use cases, training rollout to business units, governance framework activation. Phase 3 (Scale, ongoing): ongoing advisory, quarterly standards reviews, and CoE maturity assessments. A functional CoE can be operational in 3–4 months.",
    },
    {
      question: "What roles should an enterprise AI CoE include?",
      answer: "A foundational enterprise AI CoE needs: Head of AI / Chief AI Officer (strategic leadership); AI Platform Engineer (infrastructure and tooling); AI/ML Scientists (model development and evaluation); AI Product Manager (use case intake and roadmap); AI Governance Lead (risk, compliance, ethics); Data Engineer (data pipelines and quality); and AI Trainer/Educator (internal capability building). CerebroHive supports hiring, role design, and can provide interim staff until permanent roles are filled.",
    },
    {
      question: "How does an AI CoE relate to an enterprise's existing IT and data teams?",
      answer: "The AI CoE doesn't replace IT or data teams — it sits at the intersection of both and extends their capability with AI-specific expertise. The CoE partners with IT for infrastructure, security, and deployment; with data teams for data pipelines, governance, and quality; and with business units for use case identification and adoption. CerebroHive designs the CoE operating model with clear interfaces to avoid overlap, turf conflict, and communication gaps.",
    },
    {
      question: "How do you build internal AI capability through the CoE?",
      answer: "CerebroHive's CoE capability building program includes: AI Literacy training for all employees (2-hour executive awareness workshops, half-day practitioner workshops); AI Practitioner certification tracks through CerebroHive Academy for data scientists, engineers, and product managers; AI Champion programs that identify and develop AI advocates in each business unit; hands-on project apprenticeships where internal staff co-build AI use cases with CerebroHive engineers; and Communities of Practice that maintain knowledge sharing after the engagement.",
    },
    {
      question: "What AI governance standards should a CoE enforce?",
      answer: "A mature AI CoE enforces standards across six governance dimensions: (1) Model development standards (code review, version control, documentation requirements); (2) Data governance (privacy, quality, lineage); (3) Evaluation standards (required benchmarks before production deployment); (4) Risk classification (which AI decisions require human review); (5) Compliance requirements (GDPR, HIPAA, AI Act, sector-specific regulations); and (6) Incident response (how to detect, escalate, and remediate AI failures in production).",
    },
    {
      question: "How do you measure AI CoE maturity?",
      answer: "CerebroHive uses the AI CoE Maturity Model — a 5-level framework assessing: Use Case Pipeline (number and quality of AI initiatives); Delivery Velocity (time-to-production per use case); Governance Maturity (standards adoption, audit compliance); Organizational Capability (internal AI practitioners, training completion); Technology Infrastructure (platform sophistication, automation level); and Business Impact (documented ROI from CoE-sponsored use cases). We run quarterly maturity assessments and produce executive scorecards.",
    },
    {
      question: "Can a small or mid-size enterprise benefit from an AI CoE?",
      answer: "Yes — the AI CoE model scales down for smaller organizations. A lightweight CoE for a 500-person company might be 2–3 people: one AI lead, one AI engineer, and one AI governance owner. The same principles apply (standards, governance, enablement) but with lighter-weight tooling and simpler governance. CerebroHive designs CoE models that match the organization's size, AI ambition, and budget — not one-size-fits-all enterprise frameworks.",
    },
    {
      question: "How does the AI CoE interact with external AI vendors and model providers?",
      answer: "The CoE acts as the enterprise's single point of contact for AI vendor relationships. It evaluates new AI tools and models against the enterprise stack; negotiates commercial agreements with LLM providers (OpenAI, Anthropic, Google); manages API costs and usage quotas; conducts vendor security reviews; and maintains a vendor registry with approved tools. This prevents individual business units from independently signing up for AI services without security and compliance review.",
    },
    {
      question: "What happens if the CoE loses momentum after initial launch?",
      answer: "CoE momentum loss is the most common failure mode — it happens when the CoE is set up as a project rather than a function with ongoing mandate and funding. CerebroHive mitigates this by: designing CoE success metrics tied to business outcomes (not just activities); securing executive sponsorship at the C-suite level before launch; structuring the first 6 months to produce visible business wins; creating CoE annual reporting processes; and providing ongoing advisory for 12 months post-launch to maintain momentum through organizational change cycles.",
    },
  ],
};
