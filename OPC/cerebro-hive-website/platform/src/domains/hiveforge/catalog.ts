/**
 * HiveForge™ — Enterprise AI Cloud Marketplace product catalog.
 * Static data describing every category and line item in the platform's product
 * surface: AI development, models, agents, APIs, compute (VPS/GPU/Kubernetes/
 * containers/serverless), data (databases/storage/networking), DevOps, security,
 * governance, knowledge, automation, marketplace, developer tools, deployment,
 * domains, enterprise applications, and billing. Consumed by HiveForgeService
 * for browsing and by the provisioning engine as the source of provisionable
 * product kinds.
 */

export type CatalogCategoryId =
  | "ai-development" | "ai-models" | "ai-agents" | "apis-developer-platform"
  | "cloud-compute" | "kubernetes" | "containers" | "serverless" | "databases"
  | "storage" | "networking" | "devops" | "observability" | "security"
  | "ai-governance" | "data-platform" | "knowledge-platform" | "automation"
  | "marketplace" | "developer-tools" | "deployment-platform" | "domain-ssl"
  | "enterprise-applications" | "billing-marketplace";

export interface CatalogItem {
  id: string;
  name: string;
  /** Whether this item can be provisioned as a live (simulated) resource via HiveForgeService.provision(). */
  provisionable: boolean;
  /** Approximate hourly rate in USD used by the deterministic billing simulator, when provisionable. */
  hourlyRateUsd?: number;
}

export interface CatalogCategory {
  id: CatalogCategoryId;
  name: string;
  tagline: string;
  subgroups: { name: string; items: CatalogItem[] }[];
}

function items(names: string[], opts?: { provisionable?: boolean; baseRate?: number }): CatalogItem[] {
  return names.map((name, i) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name,
    provisionable: opts?.provisionable ?? false,
    hourlyRateUsd: opts?.provisionable ? Number(((opts.baseRate ?? 0.05) * (1 + i * 0.35)).toFixed(4)) : undefined,
  }));
}

export const catalog: CatalogCategory[] = [
  {
    id: "ai-development", name: "AI Development", tagline: "Build agents, prompts, and flows end to end.",
    subgroups: [{ name: "Studio", items: items(["Cerebro Studio™", "Prompt Studio", "Agent Studio", "Flow Designer", "AI Playground", "Notebook", "Canvas", "Experiment Tracker", "Prompt Library", "Dataset Builder", "AI SDK", "AI CLI"]) }],
  },
  {
    id: "ai-models", name: "AI Models", tagline: "Foundation, open-source, and fine-tuned models.",
    subgroups: [{ name: "Catalog", items: items(["Foundation Models", "Open Source Models", "Enterprise Models", "Vision Models", "Audio Models", "Speech Models", "Embedding Models", "Fine-tuned Models", "Private Models", "Model Marketplace"]) }],
  },
  {
    id: "ai-agents", name: "AI Agents", tagline: "Pre-built departmental and custom agents.",
    subgroups: [{ name: "Agent Library", items: items(["Customer Support", "Sales", "HR", "Legal", "Finance", "Procurement", "Research", "Coding", "Security", "Executive Assistant", "Marketing", "Healthcare", "Manufacturing", "Operations", "Custom Agents"]) }],
  },
  {
    id: "apis-developer-platform", name: "APIs & Developer Platform", tagline: "Gateway, AI APIs, and backend services.",
    subgroups: [
      { name: "API Gateway", items: items(["API Management", "API Gateway", "Rate Limiting", "Authentication", "Versioning", "API Analytics", "API Keys", "API Marketplace"]) },
      { name: "AI APIs", items: items(["Chat API", "Embedding API", "Vision API", "OCR API", "Speech-to-Text", "Text-to-Speech", "Translation", "Image Generation", "Video Generation", "Code Generation", "Document Intelligence", "Search API"]) },
      { name: "Backend Services", items: items(["Authentication API", "Notification API", "Email API", "SMS API", "Webhook Engine", "Event API", "Billing API", "Payment API", "User Management API"]) },
    ],
  },
  {
    id: "cloud-compute", name: "Cloud Compute", tagline: "A full compute portfolio — VPS, GPU, inference, training.",
    subgroups: [
      { name: "VPS Cloud", items: items(["Shared VPS", "Premium VPS", "Enterprise VPS", "Managed VPS", "Bare Metal VPS"], { provisionable: true, baseRate: 0.02 }) },
      { name: "GPU Types", items: items(["NVIDIA L4", "NVIDIA L40S", "NVIDIA A100", "NVIDIA H100", "NVIDIA H200", "NVIDIA RTX 6000 Ada", "AMD MI300X (future)"], { provisionable: true, baseRate: 0.9 }) },
      { name: "GPU Services", items: items(["Single GPU", "Multi-GPU", "Dedicated GPU", "Shared GPU", "GPU Cluster", "Auto Scaling GPU", "Spot GPU", "Reserved GPU"], { provisionable: true, baseRate: 0.9 }) },
      { name: "AI Inference", items: items(["vLLM Hosting", "Ollama Hosting", "TensorRT-LLM", "Triton Inference Server", "OpenAI Compatible Endpoint"], { provisionable: true, baseRate: 0.4 }) },
      { name: "Training", items: items(["Fine-tuning Cluster", "Distributed Training", "LoRA Training", "RLHF Infrastructure", "Synthetic Data Generation"], { provisionable: true, baseRate: 1.2 }) },
    ],
  },
  {
    id: "kubernetes", name: "Kubernetes", tagline: "Managed, GPU-aware, serverless Kubernetes.",
    subgroups: [{ name: "Kubernetes", items: items(["Managed Kubernetes", "GPU Kubernetes", "AI Kubernetes", "Serverless Kubernetes", "Multi-cluster Management", "Autoscaling", "Service Mesh"], { provisionable: true, baseRate: 0.15 }) }],
  },
  {
    id: "containers", name: "Containers", tagline: "Registry, build, and runtime security.",
    subgroups: [{ name: "Containers", items: items(["Docker Registry", "OCI Registry", "Build Service", "Container Scanner", "Image Signing", "Runtime Protection"]) }],
  },
  {
    id: "serverless", name: "Serverless", tagline: "Functions, edge, workers, and scheduled jobs.",
    subgroups: [{ name: "Serverless", items: items(["Serverless Functions", "AI Functions", "Edge Functions", "Background Workers", "Scheduled Jobs", "Cron Jobs"], { provisionable: true, baseRate: 0.01 }) }],
  },
  {
    id: "databases", name: "Databases", tagline: "SQL, NoSQL, cache, search, vector, and graph.",
    subgroups: [
      { name: "SQL", items: items(["PostgreSQL", "MySQL", "MariaDB", "SQL Server"], { provisionable: true, baseRate: 0.08 }) },
      { name: "NoSQL", items: items(["MongoDB", "Cassandra", "Dynamo Compatible"], { provisionable: true, baseRate: 0.08 }) },
      { name: "Cache", items: items(["Redis", "Valkey", "Memcached"], { provisionable: true, baseRate: 0.04 }) },
      { name: "Search", items: items(["OpenSearch", "Elasticsearch"], { provisionable: true, baseRate: 0.1 }) },
      { name: "Vector", items: items(["pgvector", "Milvus", "Qdrant", "Weaviate"], { provisionable: true, baseRate: 0.12 }) },
      { name: "Graph", items: items(["Neo4j", "JanusGraph"], { provisionable: true, baseRate: 0.12 }) },
    ],
  },
  {
    id: "storage", name: "Storage", tagline: "Object, block, file, archive, and backup.",
    subgroups: [{ name: "Storage", items: items(["Object Storage", "Block Storage", "File Storage", "Archive Storage", "Backup Vault", "Snapshot Manager"], { provisionable: true, baseRate: 0.01 }) }],
  },
  {
    id: "networking", name: "Networking", tagline: "VPC, DNS, CDN, load balancing, WAF.",
    subgroups: [{ name: "Networking", items: items(["Virtual Networks", "Private Networking", "VPN", "DNS", "CDN", "Global Accelerator", "Static IP", "Load Balancer", "API Load Balancer", "Web Application Firewall"], { provisionable: true, baseRate: 0.03 }) }],
  },
  {
    id: "devops", name: "DevOps", tagline: "CI/CD, IaC, GitOps, registries, secrets, feature flags.",
    subgroups: [
      { name: "CI/CD", items: items(["Git Hosting", "Pipelines", "Build Runner", "Release Management", "Deployment Automation"]) },
      { name: "Infrastructure as Code", items: items(["Terraform Registry", "Pulumi", "Cloud Templates"]) },
      { name: "GitOps", items: items(["ArgoCD", "FluxCD"]) },
      { name: "Package Registry", items: items(["NPM", "PyPI", "Maven", "Docker Registry", "Helm Charts"]) },
      { name: "Secrets", items: items(["Vault", "Secrets Manager", "Key Management"]) },
      { name: "Feature Flags", items: items(["Progressive Rollouts", "Canary Releases", "Blue Green Deployment"]) },
    ],
  },
  {
    id: "observability", name: "Observability", tagline: "Metrics, logs, traces, AI/GPU/API telemetry.",
    subgroups: [{ name: "Observability", items: items(["Metrics", "Logging", "Tracing", "AI Telemetry", "Agent Monitoring", "GPU Monitoring", "API Monitoring", "Infrastructure Monitoring", "Synthetic Monitoring"]) }],
  },
  {
    id: "security", name: "Security", tagline: "IAM, SSO, RBAC, MFA, secrets, threat detection.",
    subgroups: [{ name: "Security", items: items(["IAM", "SSO", "RBAC", "MFA", "Secrets", "Key Vault", "Encryption", "Threat Detection", "Compliance", "Audit Logs"]) }],
  },
  {
    id: "ai-governance", name: "AI Governance", tagline: "Policies, approvals, safety, explainability, risk.",
    subgroups: [{ name: "Governance", items: items(["AI Policies", "Prompt Governance", "Model Governance", "Human Approval", "Safety Policies", "Explainability", "Bias Detection", "Hallucination Detection", "Compliance", "Risk Assessment"]) }],
  },
  {
    id: "data-platform", name: "Data Platform", tagline: "ETL/ELT, streaming, lake/warehouse, catalog, lineage.",
    subgroups: [{ name: "Data Platform", items: items(["ETL", "ELT", "Reverse ETL", "Streaming", "Data Lake", "Data Warehouse", "Data Catalog", "Data Lineage", "Master Data", "Data Contracts"]) }],
  },
  {
    id: "knowledge-platform", name: "Knowledge Platform", tagline: "Enterprise search, RAG, document intelligence.",
    subgroups: [{ name: "Knowledge", items: items(["CerebroArchive™", "Knowledge Graph", "Enterprise Search", "Semantic Search", "OCR", "Document AI", "RAG Studio", "Citation Engine", "Ontology Builder"]) }],
  },
  {
    id: "automation", name: "Automation", tagline: "Workflow, rules, events, queues, approvals.",
    subgroups: [{ name: "Automation", items: items(["Workflow Builder", "Agent Flow", "Business Rules", "Event Bus", "Queue Service", "Scheduler", "Approval Engine", "Integration Flow"]) }],
  },
  {
    id: "marketplace", name: "Marketplace", tagline: "Models, agents, prompts, workflows, templates, connectors.",
    subgroups: [{ name: "Marketplace", items: items(["AI Models", "AI Agents", "Prompt Packs", "Workflows", "Dashboards", "Templates", "SDKs", "Extensions", "Connectors", "Industry Packs"], { provisionable: true, baseRate: 0 }) }],
  },
  {
    id: "developer-tools", name: "Developer Tools", tagline: "Browser IDE, CLI, SDKs, templates.",
    subgroups: [
      { name: "IDE", items: items(["Browser IDE", "VS Code in Browser", "Monaco Editor"]) },
      { name: "SDKs", items: items(["Python SDK", "TypeScript SDK", "Go SDK", "Java SDK", "C# SDK", "Rust SDK"]) },
      { name: "Templates", items: items(["Next.js", "React", "FastAPI", "Spring Boot", "Django", "Node.js", "Go Fiber", "Express", "NestJS"]) },
    ],
  },
  {
    id: "deployment-platform", name: "Deployment Platform", tagline: "Static, web apps, APIs, AI apps, workers, edge.",
    subgroups: [{ name: "Deployment", items: items(["Static Sites", "Web Apps", "APIs", "AI Apps", "Containers", "Functions", "Cron Jobs", "Worker Services", "Edge Apps"], { provisionable: true, baseRate: 0.02 }) }],
  },
  {
    id: "domain-ssl", name: "Domain & SSL", tagline: "Registration, DNS, certificates, edge routing.",
    subgroups: [{ name: "Domain & SSL", items: items(["Domain Registration", "DNS", "SSL Certificates", "Wildcard SSL", "CDN", "Edge Routing"], { provisionable: true, baseRate: 0.005 }) }],
  },
  {
    id: "enterprise-applications", name: "Enterprise Applications", tagline: "First-class HiveOS modules.",
    subgroups: [{ name: "HiveOS Modules", items: items(["HivePulse™", "HiveOps™", "HiveShield™", "TalentOS™", "CerebroStudio™", "CerebroArchive™", "CerebroFlow™", "CerebroInsight™", "HiveMind™", "HiveSim™", "HiveTwin™", "HiveGovern™", "HiveDeploy™", "HiveCloud™", "HiveConnect™"]) }],
  },
  {
    id: "billing-marketplace", name: "Billing & Marketplace", tagline: "Usage, invoices, budgets, cost explorer.",
    subgroups: [{ name: "Billing", items: items(["Subscription Management", "Pay-as-you-go", "GPU Hour Billing", "API Token Billing", "Usage Analytics", "Organization Budgets", "Cost Explorer", "Invoices", "Marketplace Purchases"]) }],
  },
];

export function allCatalogItems(): { category: CatalogCategoryId; subgroup: string; item: CatalogItem }[] {
  return catalog.flatMap(c => c.subgroups.flatMap(sg => sg.items.map(item => ({ category: c.id, subgroup: sg.name, item }))));
}

export function findCatalogItem(itemId: string): { category: CatalogCategoryId; subgroup: string; item: CatalogItem } | undefined {
  return allCatalogItems().find(x => x.item.id === itemId);
}
