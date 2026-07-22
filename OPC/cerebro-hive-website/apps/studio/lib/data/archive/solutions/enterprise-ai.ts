import { Solution } from "./types";

export const enterprise_ai: Solution = {
  name: "Enterprise AI Platform",
  slug: "enterprise-ai",
  category: "AI & Generative AI",
  color: "#00E5FF",
  
  tagline: "Centralized AI Intelligence Layer",
  implementationWeeks: "12–16 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "High",
  deploymentModels: ["Private Cloud", "Hybrid", "On-Premises"],
  roiLevel: "Very High",
  industries: ["Finance", "Telecommunications", "Government", "Manufacturing"],
  
  hero: {
    title: "Enterprise AI Platform for Scale",
    subtitle: "AI & Generative AI",
    description: "A centralized, governed, and scalable platform to build, deploy, and manage AI models across your entire organization.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  
  overview: "Our Enterprise AI Platform acts as the nervous system for your organization's AI initiatives. It provides a secure, unified environment to manage data, train models, deploy applications, and monitor performance, eliminating shadow AI and establishing robust governance.",
  
  businessProblems: [
    { 
      problem: "Shadow AI & Fragmented Tools", 
      impact: "Inconsistent security, duplicated costs, and compliance risks.",
      aiSolution: "Centralized AI platform with unified governance and cost tracking."
    },
    { 
      problem: "Slow Time-to-Market", 
      impact: "AI initiatives take months to move from PoC to production.",
      aiSolution: "Standardized CI/CD pipelines for AI (MLOps/LLMOps)."
    },
    { 
      problem: "Model Drift & Degradation", 
      impact: "AI performance degrades over time, causing business errors.",
      aiSolution: "Continuous monitoring, evaluation, and automated retraining."
    }
  ],
  
  pipeline: [
    { id: "data", label: "Enterprise Data Lake", subLabels: ["Structured", "Unstructured"] },
    { id: "catalog", label: "Feature Store / Data Catalog", subLabels: ["Governance"] },
    { id: "train", label: "Model Training & Fine-Tuning", subLabels: ["GPUs", "Distributed"] },
    { id: "registry", label: "Model Registry", subLabels: ["Versioning", "Approval"] },
    { id: "deploy", label: "Serving Infrastructure", subLabels: ["APIs", "Scaling"] },
    { id: "monitor", label: "Observability & Guardrails", subLabels: ["Drift", "Toxicity"] },
    { id: "apps", label: "Enterprise Applications", subLabels: ["Consuming APIs"] }
  ],
  
  workflowSteps: [
    { step: 1, name: "Data Integration", description: "Connect to enterprise data sources securely." },
    { step: 2, name: "Model Development", description: "Use collaborative notebooks and managed compute." },
    { step: 3, name: "Governance Review", description: "Automated checks for bias, security, and performance." },
    { step: 4, name: "Deployment", description: "One-click deployment to scalable API endpoints." },
    { step: 5, name: "Monitoring", description: "Track drift, latency, and cost in real-time." }
  ],
  
  capabilities: [
    { 
      name: "Unified MLOps/LLMOps", 
      description: "End-to-end lifecycle management for both traditional ML and Generative AI.",
      benefits: ["Faster deployment", "Reproducibility", "Scalability"],
      techUsed: ["MLflow", "Kubeflow"]
    },
    { 
      name: "Enterprise Guardrails", 
      description: "Policy-driven filters to prevent PII leakage, toxicity, and unauthorized access.",
      benefits: ["Compliance", "Security", "Brand Protection"],
      techUsed: ["NeMo Guardrails", "Custom Policies"]
    },
    { 
      name: "Cost Management", 
      description: "Track compute and token usage across teams and projects.",
      benefits: ["Cost control", "Visibility", "Chargebacks"],
      techUsed: ["FinOps Dashboards"]
    }
  ],
  
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  
  techStack: [],
  techStackFlat: [
    { name: "Databricks / Snowflake", role: "Data Platform" },
    { name: "Kubernetes", role: "Compute Orchestration" },
    { name: "MLflow", role: "Model Registry" },
    { name: "NVIDIA Triton", role: "Inference Serving" },
    { name: "Prometheus / Grafana", role: "Observability" }
  ],
  
  roi: [
    { metric: "5x", label: "Faster Deployment", description: "Reduction in time from model creation to production." },
    { metric: "100%", label: "Compliance", description: "Full auditability and governance for all AI models." },
    { metric: "35%", label: "Cost Savings", description: "Reduction in compute and API costs through centralized management." },
    { metric: "12 Wks", label: "Time to Value", description: "Initial platform deployment and first model migrated." }
  ],
  
  timeline: [
    { phase: "Architecture Design", week: "Weeks 1-3", description: "Infrastructure planning, security reviews, and networking." },
    { phase: "Platform Deployment", week: "Weeks 4-7", description: "Provisioning compute, networking, and core platform services." },
    { phase: "Governance Setup", week: "Weeks 8-9", description: "Configuring IAM, guardrails, and model registries." },
    { phase: "First Workload Migration", week: "Weeks 10-12", description: "Moving the first AI model into production on the new platform." }
  ],
  
  deliverables: [
    "Enterprise AI Architecture Blueprint",
    "Deployed Platform Infrastructure (IaC)",
    "Governance Framework Document",
    "CI/CD Pipelines for AI",
    "Platform Operations Manual"
  ],
  
  engagementModels: [
    "Platform Implementation",
    "Architecture Advisory",
    "AI Center of Excellence (CoE) Setup"
  ],
  
  securityFeatures: [
    "VPC / Private Link Deployment",
    "Granular RBAC & IAM Integration",
    "Automated Vulnerability Scanning",
    "PII Masking & DLP"
  ],
  
  integrations: [
    "Active Directory / Okta",
    "Splunk / Datadog",
    "GitHub / GitLab",
    "AWS / Azure / GCP native services"
  ],
  
  featuredCaseStudy: {
    industry: "Financial Services",
    title: "Global Bank AI Platform",
    timeline: "16 Weeks",
    outcome: "Standardized AI development across 400+ data scientists, ensuring strict regulatory compliance.",
    metric: "400+ Models",
    description: "A top-tier global bank struggled with shadow AI. We designed and deployed a centralized platform that accelerated model deployment while satisfying regulators.",
    savings: "$8M Annual Savings"
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
