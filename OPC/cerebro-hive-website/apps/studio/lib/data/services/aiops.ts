import { EnterpriseService } from "../types";

export const aiopsService: EnterpriseService = {
  id: "aiops",
  slug: "aiops",
  title: "AI Operations (AIOps)™",
  summary: "Full-lifecycle operation and managed services for enterprise AI systems.",
  hero: {
    title: "AI Operations (AIOps)™",
    subtitle: "Managed Services",
    description: "Let us monitor, maintain, and optimize your AI deployments in production 24/7."
  },
  iconName: "Activity",
  category: "Operations",
  status: "production",
  tags: ["Managed Services", "Ops", "Monitoring", "SRE"],

  seo: {
    title: "AIOps & AI Operations Management | Enterprise AI Managed Services | CerebroHive",
    description: "CerebroHive provides AIOps managed services — AI-powered IT operations, model performance monitoring, MLOps automation, and SRE practices for enterprise AI systems in production.",
    keywords: [
      "AIOps managed services", "AI operations management", "MLOps managed services",
      "AI system monitoring", "AI model performance monitoring", "AI SRE",
      "enterprise AI operations", "AI infrastructure management", "AI observability",
    ],
  },

  config: {
    layout: "standard",
    sections: [
      "hero",
      "executive_summary",
      "architecture",
      "products",
      "roi",
      "cta"
    ]
  },

  executiveProblem: "Once AI models and agents hit production, traditional IT ops teams lack the specialized tooling and skills to monitor for drift, hallucinations, and token latency.",
  businessImpact: "Unmonitored AI systems degrade over time, leading to poor user experiences and escalating cloud costs.",

  businessChallenges: [
    {
      title: "Model Degradation",
      description: "Without continuous evaluation, models drift from their baseline accuracy."
    },
    {
      title: "Unpredictable Costs",
      description: "Runaway agent loops can consume massive amounts of token budget overnight."
    }
  ],

  targetPersonas: ["VP of Operations", "CIO", "Head of SRE"],
  industries: ["Cross-Industry"],
  methodologyOverview: "We provide 24/7 managed services using HiveOps and CerebroSphere to monitor your entire AI fleet, ensuring high availability and cost efficiency.",

  timeline: [
    {
      title: "Onboarding & Instrumentation",
      duration: "Weeks 1-2",
      activities: ["Deploy Observability Agents", "Establish Baseline Metrics"]
    },
    {
      title: "Active Management",
      duration: "Ongoing",
      activities: ["24/7 Incident Response", "Cost Optimization"]
    }
  ],

  successMetrics: [
    { metric: "MTTR", value: "< 15 Mins", timeframe: "SLA" },
    { metric: "Uptime", value: "99.99%", timeframe: "SLA" }
  ],

  products: ["hive-ops", "cerebro-sphere"],
  platformCapabilities: ["observatory", "eval"],
  relatedResearch: [],

  deliverables: [
    "24/7 Fleet Monitoring",
    "Monthly Optimization Reports",
    "Incident Response SLAs"
  ],

  engagementModel: "Managed Services Retainer",

  pricing: {
    type: "Tiered Managed Services",
    description: "Billed monthly based on the size of the deployed AI fleet.",
  },

  faqs: [
    {
      question: "What is AIOps?",
      answer: "AIOps (Artificial Intelligence for IT Operations) refers to using AI and machine learning to automate and enhance IT operations — including event correlation, anomaly detection, root cause analysis, capacity planning, and incident remediation. CerebroHive's AIOps service extends this to cover AI system operations specifically: monitoring the health and performance of AI models in production, automating MLOps workflows, and applying AI-driven intelligence to infrastructure management.",
    },
    {
      question: "How does CerebroHive monitor AI models in production?",
      answer: "Our AI model monitoring covers: data drift detection (alerting when incoming data distribution shifts from training distribution); concept drift detection (alerting when model predictions become less accurate over time); latency and throughput monitoring (ensuring models meet SLA requirements); error rate tracking (hallucination rates, refusal rates, output validation failures); and cost monitoring (token consumption, inference costs per use case). We instrument models with OpenTelemetry and visualize in Grafana dashboards with automated alerting via PagerDuty or Opsgenie.",
    },
    {
      question: "What does model drift mean and how do you handle it?",
      answer: "Model drift occurs when an AI model's performance degrades over time because the real-world data it processes has changed from the data it was trained on. Data drift (input distribution shift) can cause the model to operate outside its training domain; concept drift (relationship between inputs and outputs shifts) causes predictions to become unreliable. CerebroHive handles drift through continuous monitoring with statistical drift detectors (KS test, Population Stability Index, Jensen-Shannon divergence), automated alerts, and triggering retraining pipelines when drift exceeds defined thresholds.",
    },
    {
      question: "What is an MLOps pipeline and how do you build one?",
      answer: "An MLOps pipeline automates the ML lifecycle: data validation → feature engineering → model training → evaluation → deployment → monitoring → retraining. CerebroHive builds MLOps pipelines using: Kubeflow Pipelines or MLflow Pipelines for workflow orchestration; DVC for data and model versioning; MLflow for experiment tracking and model registry; Seldon Core or BentoML for model serving; and Prometheus + Grafana for monitoring. The result is a system where model updates are tested, validated, and deployed without manual intervention.",
    },
    {
      question: "How do you handle incident response for AI systems?",
      answer: "CerebroHive's AI incident response follows a structured runbook: detection (automated monitoring alerts or user reports); triage (on-call engineer assesses severity within defined SLA: P1 15 min, P2 1 hour, P3 4 hours); containment (traffic rerouting, feature flags to disable AI, fallback to non-AI paths); root cause investigation (reviewing model logs, inference traces, input data samples); remediation (hotfix, model rollback, or retraining); post-mortem documentation; and preventive measures to avoid recurrence.",
    },
    {
      question: "What SLAs do you offer for AI system uptime and performance?",
      answer: "CerebroHive's managed AIOps service tiers offer: Standard (99.5% uptime, 4-hour incident response, business hours support); Professional (99.9% uptime, 1-hour incident response, 24/7 on-call); Enterprise (99.95% uptime, 15-minute incident response, dedicated SRE team). All tiers include: monthly performance reports, quarterly model health reviews, automated alerting, and a dedicated Slack channel for rapid communication during incidents.",
    },
    {
      question: "How do you manage the cost of AI inference at enterprise scale?",
      answer: "AI inference costs can grow rapidly at enterprise scale. CerebroHive implements cost optimization through: prompt compression (reducing token count without losing meaning); intelligent caching (storing and reusing responses for common queries); model routing (directing simple queries to cheaper models, complex queries to powerful models); batch processing (aggregating non-time-sensitive requests); and usage dashboards that attribute costs to specific teams and use cases for accountability. We typically achieve 30–50% inference cost reduction without performance degradation.",
    },
    {
      question: "What is model versioning and why is it important for AI operations?",
      answer: "Model versioning means tracking every trained model as a distinct, immutable artifact with metadata including: training data version, hyperparameters, evaluation metrics, and deployment history. Without versioning, it's impossible to roll back a bad model update, reproduce results, or audit what version was used for a specific decision. CerebroHive implements model registries using MLflow Model Registry, DVC, or Hugging Face Hub — ensuring every production model is tracked, staged, and promotable through controlled deployment gates.",
    },
    {
      question: "Can you manage AI systems across multiple cloud providers?",
      answer: "Yes — CerebroHive's AIOps service is multi-cloud capable, managing AI systems running on AWS (SageMaker, Bedrock), Azure (Azure ML, Azure OpenAI), Google Cloud (Vertex AI), and on-premises (private GPU clusters). We use cloud-agnostic monitoring (OpenTelemetry, Grafana), Kubernetes for workload portability, and centralized model registries that span providers. This gives enterprises flexibility to use the best infrastructure for each use case without operational fragmentation.",
    },
    {
      question: "How do you automate retraining when model performance degrades?",
      answer: "CerebroHive builds automated retraining triggers that activate when: performance metrics fall below defined thresholds; data drift exceeds acceptable levels; new labeled data accumulates beyond a set volume; or scheduled retraining windows trigger. The retraining pipeline runs automatically: data validation → training → evaluation against holdout set → comparison against current production model → promotion to production if improvement is confirmed. Human approval gates can be inserted before production promotion for high-risk systems.",
    },
    {
      question: "What observability tools do you use for AI systems?",
      answer: "Our AI observability stack includes: Prometheus for metrics collection; Grafana for dashboards and alerting; Jaeger for distributed tracing of multi-step AI workflows; OpenTelemetry for instrumentation (capturing spans across LLM calls, retrievals, tool calls); Langfuse or LangSmith for LLM-specific observability (prompt/response logging, latency per model call, cost tracking); and custom dashboards for business-level KPIs (task completion rate, user satisfaction, cost per outcome). Every AI system we manage is fully instrumented before going live.",
    },
    {
      question: "How do you ensure AI systems comply with data retention and privacy requirements in operations?",
      answer: "CerebroHive implements operational data controls that enforce: retention policies on all logged AI interactions (configurable per use case, respecting GDPR right-to-erasure and HIPAA requirements); PII masking in monitoring logs (replacing sensitive data with anonymized tokens); data residency enforcement (ensuring all telemetry data stays within required geographic boundaries); access control on operational dashboards (only authorized personnel can view inference logs); and automated deletion workflows that purge logs past retention windows.",
    },
  ],
};
