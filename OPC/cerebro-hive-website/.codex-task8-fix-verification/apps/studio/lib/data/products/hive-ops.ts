import { PackagedProduct } from "../types";

export const hiveOpsProduct: PackagedProduct = {
  id: "hive-ops",
  slug: "hive-ops",
  title: "HiveOps™",
  summary: "The enterprise AI Operations Platform — Kubernetes management, MLOps, AI model deployment, CI/CD pipelines, infrastructure as code, GPU scheduling, and platform engineering for teams running AI at scale.",
  hero: {
    title: "HiveOps™",
    subtitle: "AI Operations Platform",
    description: "The operational backbone of the CerebroHive platform. HiveOps manages the entire infrastructure lifecycle — from Kubernetes cluster provisioning and AI model deployment to CI/CD pipelines, GPU scheduling, cost optimization, and platform observability — giving engineering teams the operational confidence to run AI at enterprise scale.",
    primaryCta: "Explore Operations Platform",
    secondaryCta: "View Infrastructure Docs",
  },
  iconName: "Server",
  category: "Platform",
  status: "production",
  maturity: "ga",
  tags: ["MLOps", "DevOps", "Kubernetes", "AI Deployment", "Infrastructure", "Platform Engineering", "GPU Scheduling"],

  // Ecosystem Positioning
  ecosystemLayer: "enterprise",
  moduleConnections: ["hive-shield", "cerebro-sphere", "hivepulse"],
  platformServices: ["infrastructure", "container-orchestration", "ci-cd", "monitoring", "cost-management"],
  providesCapabilities: ["infrastructure-management", "model-serving", "ci-cd-pipelines", "gpu-scheduling", "cost-optimization"],

  seo: {
    title: "HiveOps™ | Enterprise AI Operations Platform | CerebroHive",
    description: "HiveOps is an enterprise AI operations platform providing Kubernetes management, MLOps, AI model deployment, GPU scheduling, CI/CD pipelines, and infrastructure as code — the operational foundation for enterprise-scale AI.",
    keywords: [
      "enterprise MLOps platform",
      "AI model deployment platform",
      "Kubernetes AI management",
      "enterprise DevOps AI",
      "GPU cluster management",
      "AI infrastructure platform",
      "platform engineering AI",
      "AI operations management",
      "MLOps enterprise software",
      "CI/CD AI platform",
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
      "developer_experience",
      "faq",
      "cta",
    ],
  },

  businessProblems: [
    "AI model deployment is ad-hoc — no standardized process for moving models from development to production.",
    "GPU infrastructure is expensive and underutilized without intelligent scheduling and cost attribution.",
    "ML teams spend 40% of their time on infrastructure configuration instead of model development.",
    "There is no reproducible, auditable pipeline for training, evaluating, and deploying AI models at enterprise scale.",
    "Infrastructure drift and configuration inconsistencies create reliability issues across AI deployments.",
  ],

  targetPersonas: ["Platform Engineers", "MLOps Engineers", "DevOps Engineers", "CTO", "Infrastructure Architects", "AI/ML Teams"],
  industries: ["Technology", "Financial Services", "Healthcare", "Manufacturing", "Energy", "Research Institutions"],

  coreCapabilities: [
    {
      title: "Kubernetes Management",
      description: "Fully managed Kubernetes operations — cluster provisioning, scaling, upgrade management, namespace governance, and multi-cluster federation across cloud and on-premises environments.",
      icon: "Box",
    },
    {
      title: "AI Model Serving",
      description: "Production-grade model serving with auto-scaling, canary deployments, A/B traffic splitting, shadow mode testing, and rollback capabilities — optimized for LLMs and custom models.",
      icon: "Server",
    },
    {
      title: "MLOps Pipeline",
      description: "End-to-end ML pipeline management — data preparation, feature engineering, model training, evaluation, registry, and deployment in a reproducible, auditable workflow.",
      icon: "GitBranch",
    },
    {
      title: "GPU Scheduler",
      description: "Intelligent GPU resource allocation across training jobs, inference workloads, and development environments — with cost attribution, utilization analytics, and priority queuing.",
      icon: "Cpu",
    },
    {
      title: "CI/CD for AI",
      description: "AI-optimized CI/CD pipelines with automated model evaluation gates, performance regression detection, and policy compliance checks before any promotion to production.",
      icon: "GitMerge",
    },
    {
      title: "Infrastructure as Code",
      description: "Terraform and Pulumi-based IaC templates for CerebroHive platform components — provision entire AI environments reproducibly across AWS, GCP, Azure, and on-premises.",
      icon: "Code",
    },
    {
      title: "Platform Observability",
      description: "Unified monitoring across compute, networking, AI services, and application layers — with distributed tracing, log aggregation, alerting, and AI-generated incident summaries.",
      icon: "Activity",
    },
    {
      title: "Cost Intelligence",
      description: "Real-time infrastructure cost attribution by team, project, model, and workflow — with automated optimization recommendations, budget alerts, and reserved capacity planning.",
      icon: "DollarSign",
    },
  ],

  deploymentModels: ["AWS", "GCP", "Azure", "On-Premises Kubernetes", "Hybrid Multi-Cloud", "Air-Gapped Private Cloud"],
  securityFeatures: [
    "Workload Identity",
    "Network Policy Enforcement",
    "Secrets Management (Vault)",
    "Container Image Scanning",
    "Runtime Security Monitoring",
    "Compliance as Code",
    "SOC 2 Type II",
  ],

  integrations: [
    { system: "HiveShield™", type: "Security Policy Enforcement" },
    { system: "HivePulse™", type: "Agent Infrastructure Layer" },
    { system: "AWS / GCP / Azure", type: "Cloud Provider" },
    { system: "Terraform / Pulumi", type: "Infrastructure as Code" },
    { system: "Prometheus / Grafana", type: "Monitoring Stack" },
    { system: "GitHub Actions / ArgoCD", type: "CI/CD Integration" },
    { system: "HashiCorp Vault", type: "Secrets Management" },
  ],

  apiReference: "/developers/api/hive-ops",
  sdkLanguages: ["Python", "Go", "Terraform", "Helm"],
  platformCapabilities: ["kubernetes", "model-serving", "mlops", "observability", "cost-management"],
  relatedServices: ["platform-engineering", "ai-infrastructure", "cloud-architecture"],
  relatedResearch: ["mlops-patterns", "gpu-scheduling-algorithms"],

  faqs: [
    {
      question: "Does HiveOps require a specific cloud provider?",
      answer: "No. HiveOps is cloud-agnostic. It supports AWS, GCP, Azure, bare-metal on-premises Kubernetes, and hybrid multi-cloud configurations. CerebroHive provides validated IaC templates and deployment guides for each supported environment.",
    },
    {
      question: "How does HiveOps handle GPU resource management?",
      answer: "HiveOps uses an intelligent GPU scheduler that prioritizes training jobs, balances inference workloads, and allocates developer resources based on organizational priority policies. Cost attribution is tracked at the job level, enabling accurate chargeback to business units and projects.",
    },
  ],
};
