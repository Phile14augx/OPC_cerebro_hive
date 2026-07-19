import { EnterpriseService } from "../types";

export const aiFactoryService: EnterpriseService = {
  id: "ai-factory",
  slug: "ai-factory",
  title: "AI Factory™",
  summary: "Rapid, repeatable delivery model for AI use cases.",
  hero: {
    title: "AI Factory™",
    subtitle: "Use Case Delivery",
    description: "A scaled delivery model to churn out AI solutions rapidly across departments using a standardized assembly line."
  },
  iconName: "Factory",
  category: "Delivery",
  status: "production",
  tags: ["Scale", "Delivery", "Agile", "Factory Model"],

  seo: {
    title: "AI Factory | Scale Enterprise AI Delivery | CerebroHive",
    description: "CerebroHive's AI Factory model delivers AI use cases at speed and scale — dedicated AI engineering pods that build, deploy, and iterate production AI systems on a continuous delivery model.",
    keywords: [
      "AI factory model", "enterprise AI delivery", "AI engineering team",
      "AI at scale deployment", "AI use case factory", "enterprise AI pod",
      "AI production delivery", "AI continuous delivery", "AI center of excellence factory",
    ],
  },

  config: {
    layout: "enterprise",
    sections: [
      "hero",
      "executive_summary",
      "methodology",
      "architecture",
      "deliverables",
      "products",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Departments have dozens of viable AI use cases, but IT cannot deliver them fast enough, creating a massive backlog and shadow IT.",
  businessImpact: "Slow time-to-market for AI solutions results in lost productivity gains and falling behind more agile competitors.",

  businessChallenges: [
    {
      title: "Delivery Bottlenecks",
      description: "Central IT lacks the capacity to service the AI demands of every business unit."
    },
    {
      title: "Inconsistent Standards",
      description: "Custom-building every solution leads to inconsistent UI, security, and maintenance overhead."
    }
  ],

  targetPersonas: ["CIO", "VP of Application Development", "Head of AI Delivery"],
  industries: ["Financial Services", "Retail", "Manufacturing", "Healthcare"],
  methodologyOverview: "We establish a dedicated 'Factory' team that ingests business requirements, utilizes CerebroStudio to rapidly assemble agents, and deploys them into a standardized environment.",

  timeline: [
    {
      title: "Factory Setup",
      duration: "Weeks 1-2",
      activities: ["Toolchain Configuration", "Intake Process Design"]
    },
    {
      title: "First Wave Execution",
      duration: "Weeks 3-6",
      activities: ["Top 3 Use Cases Delivered", "User Acceptance Testing"]
    },
    {
      title: "Continuous Delivery",
      duration: "Ongoing",
      activities: ["Bi-weekly Sprints", "Continuous Deployment of Agents"]
    }
  ],

  successMetrics: [
    { metric: "Use Case Delivery Time", value: "2 Weeks", timeframe: "Per sprint" },
    { metric: "Development Cost", value: "-60%", timeframe: "Compared to custom builds" }
  ],

  products: ["cerebro-studio", "cerebro-flow"],
  platformCapabilities: ["agentos", "flow", "connect"],
  relatedResearch: [],

  deliverables: [
    "AI Factory Operating Model",
    "Continuous Stream of Deployed AI Solutions",
    "Standardized Agent UI/UX Templates"
  ],

  engagementModel: "Capacity Retainer",

  pricing: {
    type: "Capacity Retainer",
    description: "Dedicated pod of AI Engineers, Designers, and Product Managers billed monthly.",
  },

  faqs: [
    {
      question: "What is an AI Factory model?",
      answer: "An AI Factory is an industrialized model for producing AI use cases at speed and scale. Rather than running isolated AI projects, an AI Factory operates as a continuous delivery engine: a dedicated team of AI engineers, data scientists, product managers, and governance specialists work in parallel sprints to build, test, deploy, and iterate AI solutions across the organization. The factory model eliminates the startup overhead of each new AI project and maintains institutional learning across use cases.",
    },
    {
      question: "How is the AI Factory different from hiring an internal AI team?",
      answer: "Building an internal AI team from scratch takes 12–18 months and requires significant recruitment, onboarding, and tooling investment. The AI Factory model gives you an immediately productive, fully equipped AI engineering pod with proven methodologies, pre-built infrastructure components, and cross-industry experience — all operational within 4–6 weeks. As your internal capability grows, the Factory can transfer knowledge and tools to your team, creating a hybrid model.",
    },
    {
      question: "Who is in a CerebroHive AI Factory pod?",
      answer: "A standard AI Factory pod includes: 1 AI Product Manager (translates business needs into AI requirements); 2–3 AI Engineers (LLM integration, agent development, platform work); 1 Data Engineer (data pipelines, feature engineering); 1 AI/ML Specialist (model evaluation, fine-tuning, optimization); 1 AI Governance Analyst (compliance, ethics, risk); and a CerebroHive Principal Architect (strategic oversight and quality review). Pod composition scales based on use case volume.",
    },
    {
      question: "How many AI use cases can an AI Factory deliver per quarter?",
      answer: "A fully operational AI Factory pod with 5–7 specialists can deliver 4–8 production AI use cases per quarter, depending on complexity. Simple automation use cases (document extraction, routing, summarization) can be shipped in 2–3 weeks. Complex AI systems (multi-agent workflows, fine-tuned models, real-time ML systems) take 6–12 weeks. The factory model maintains a queue and prioritization backlog so there are always 2–3 use cases in parallel stages of development.",
    },
    {
      question: "How do you prioritize which AI use cases the Factory builds?",
      answer: "We run a monthly use case prioritization session with your product and business stakeholders. Candidates are scored on: business value (revenue impact, cost savings, risk reduction); technical feasibility (data readiness, integration complexity); strategic alignment; and time-to-value. The top-ranked use cases enter the sprint queue. We also maintain a fast-track lane for urgent business opportunities that bypass normal prioritization.",
    },
    {
      question: "How does the AI Factory manage reuse across different use cases?",
      answer: "The AI Factory builds a shared asset library that grows with each use case: reusable agent tools and tool definitions; pre-integrated data connectors for your enterprise systems; shared evaluation frameworks; common prompt libraries; and deployment templates. This means each new use case is built faster than the last — by the 5th use case, the foundational work is already done and the team focuses purely on business logic and integration.",
    },
    {
      question: "Can the AI Factory also handle model fine-tuning and custom model training?",
      answer: "Yes — fine-tuning and domain adaptation are included in the Factory capability. When pre-trained models are insufficient for specialized domains (legal reasoning, medical terminology, proprietary product knowledge), the Factory team runs fine-tuning workflows using LoRA or full fine-tuning on your domain data. We use MLflow for experiment tracking, DVC for dataset versioning, and automated evaluation benchmarks to ensure fine-tuned models outperform base models on your specific tasks.",
    },
    {
      question: "What governance controls does the AI Factory apply to every use case?",
      answer: "Every AI Factory use case goes through a standard governance gate: bias evaluation against representative test sets; safety testing (adversarial prompt testing, output boundary testing); compliance review (GDPR data handling, HIPAA for healthcare use cases, sector-specific regulations); explainability documentation; human-in-the-loop checkpoint design; and incident response runbook creation. No use case ships without passing the governance gate.",
    },
    {
      question: "How does the Factory handle AI systems that aren't performing as expected after launch?",
      answer: "Post-launch performance monitoring is built into every Factory delivery. We instrument each AI system with: quality dashboards (user satisfaction, task completion rates, error rates); automated regression detection (alerts when performance drops below baseline); feedback collection loops (thumbs up/down on AI outputs fed back into evaluation); and scheduled model evaluation reports. When performance degrades, the Factory triggers an improvement sprint within the current capacity allocation.",
    },
    {
      question: "How do we measure the ROI of the AI Factory model?",
      answer: "We establish ROI measurement during the factory setup: defining business KPIs for each use case (time saved, error reduction, revenue generated), setting baseline measurements before AI deployment, and tracking actuals monthly. Typical AI Factory clients see: 3–6× more AI use cases in production compared to project-based delivery; 40–60% lower per-use-case delivery cost due to shared infrastructure and methodology; and measurable business impact on 80%+ of deployed use cases within 90 days of launch.",
    },
    {
      question: "Can the AI Factory be co-located with our team or is it fully remote?",
      answer: "The AI Factory operates in a hybrid model that fits your organization. We support fully remote engagements with structured daily stand-ups, weekly stakeholder demos, and monthly executive reviews. For enterprises that prefer co-location, we can embed factory team members on-site for specific phases (discovery, launch, handover). For regulated industries, we can operate entirely within your secure environment with no data leaving your perimeter.",
    },
    {
      question: "What happens when we want to internalize AI development after using the Factory?",
      answer: "The AI Factory is designed with internalization in mind. We document all architectural decisions, build internal training programs for your staff, create runbooks for all deployed systems, and design the infrastructure for easy knowledge transfer. We offer a structured transition program: 3–6 months of parallel operation where your internal team shadows the Factory, then gradual responsibility transfer with CerebroHive maintaining an advisory role. The goal is to make ourselves optional — not permanent.",
    },
  ],
};
