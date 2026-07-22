import type { ResourceKind, SizeTier } from "./lib";

/**
 * Per-ResourceKind wizard shape. Every one of the 25 backend resource kinds gets its own
 * labels, size-tier descriptions, replica/node semantics, and add-on option set — so a GPU
 * item's wizard genuinely looks and reads differently from a database's, an AI model's, or a
 * DevOps tool's, even though all of them ultimately post the same {region, sizeTier, replicas,
 * options} shape the backend's specsFor() already keys off of (see hiveforge.ts). This mirrors
 * the real configuration surface of each kind rather than showing one generic form everywhere.
 */
export interface KindWizardConfig {
  subtitle: string;
  sizeLabel: string;
  sizeTiers: Record<SizeTier, { label: string; blurb: string }>;
  showReplicas: boolean;
  replicasLabel: string;
  replicasPlaceholder: string;
  optionsLabel: string;
  optionChoices: string[];
}

const DEFAULT_TIERS: Record<SizeTier, { label: string; blurb: string }> = {
  small: { label: "Small", blurb: "Dev/test workloads, lowest cost." },
  medium: { label: "Medium", blurb: "Standard production workloads." },
  large: { label: "Large", blurb: "High-throughput production workloads." },
  xlarge: { label: "X-Large", blurb: "Mission-critical, maximum headroom." },
};

const KIND_WIZARD_CONFIG: Record<ResourceKind, KindWizardConfig> = {
  vps: {
    subtitle: "Choose a region and instance size for your virtual server.",
    sizeLabel: "Instance size",
    sizeTiers: {
      small: { label: "1 vCPU · 2 GB", blurb: "Lightweight sites and dev boxes." },
      medium: { label: "2 vCPU · 4 GB", blurb: "Standard web apps and APIs." },
      large: { label: "4 vCPU · 8 GB", blurb: "Higher-traffic production apps." },
      xlarge: { label: "8 vCPU · 32 GB", blurb: "Heavy compute or many services." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Add-ons",
    optionChoices: ["backups-enabled", "private-networking", "ipv6", "monitoring-agent"],
  },
  gpu: {
    subtitle: "Pick the GPU class and how many cards you need.",
    sizeLabel: "GPU class",
    sizeTiers: {
      small: { label: "1× GPU", blurb: "Single-GPU inference or light fine-tuning." },
      medium: { label: "2× GPU", blurb: "Multi-GPU inference, small training jobs." },
      large: { label: "4× GPU", blurb: "Distributed training, high-throughput inference." },
      xlarge: { label: "8× GPU", blurb: "Full-node training clusters." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Interconnect & pricing",
    optionChoices: ["nvlink", "spot-pricing", "reserved-capacity", "infiniband"],
  },
  kubernetes: {
    subtitle: "Size the cluster's node pool and pick add-ons.",
    sizeLabel: "Cluster size",
    sizeTiers: {
      small: { label: "3 nodes", blurb: "Dev/staging clusters." },
      medium: { label: "6 nodes", blurb: "Standard production clusters." },
      large: { label: "12 nodes", blurb: "High-availability, multi-service clusters." },
      xlarge: { label: "24 nodes", blurb: "Large-scale multi-tenant clusters." },
    },
    showReplicas: true, replicasLabel: "Node count override", replicasPlaceholder: "Auto (based on cluster size)",
    optionsLabel: "Cluster add-ons",
    optionChoices: ["gpu-pool", "autoscaling", "service-mesh", "network-policies"],
  },
  container: {
    subtitle: "Set the replica count and runtime add-ons for this container service.",
    sizeLabel: "Instance size",
    sizeTiers: DEFAULT_TIERS,
    showReplicas: true, replicasLabel: "Replica count", replicasPlaceholder: "Auto (based on size)",
    optionsLabel: "Runtime add-ons",
    optionChoices: ["image-scanning", "auto-rollback", "canary-deploy", "resource-limits"],
  },
  serverless: {
    subtitle: "Pick the memory tier for your function/worker.",
    sizeLabel: "Memory tier",
    sizeTiers: {
      small: { label: "128 MB", blurb: "Lightweight, low-latency handlers." },
      medium: { label: "256 MB", blurb: "Typical API/webhook handlers." },
      large: { label: "512 MB", blurb: "Data processing, larger payloads." },
      xlarge: { label: "1024 MB", blurb: "Compute-heavy or ML inference functions." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Runtime add-ons",
    optionChoices: ["provisioned-concurrency", "vpc-attached", "scheduled-trigger", "dead-letter-queue"],
  },
  database: {
    subtitle: "Size storage and replication for this database.",
    sizeLabel: "Storage & compute tier",
    sizeTiers: {
      small: { label: "20 GB · 1 replica", blurb: "Dev/test databases." },
      medium: { label: "100 GB · 1 replica", blurb: "Standard production workloads." },
      large: { label: "500 GB · 2 replicas", blurb: "High-availability production." },
      xlarge: { label: "2 TB · 3 replicas", blurb: "Mission-critical, high-throughput." },
    },
    showReplicas: true, replicasLabel: "Read replicas", replicasPlaceholder: "Auto (based on tier)",
    optionsLabel: "Data protection",
    optionChoices: ["multi-az", "point-in-time-recovery", "encryption-at-rest", "automated-backups"],
  },
  storage: {
    subtitle: "Set capacity and redundancy for this storage volume.",
    sizeLabel: "Capacity tier",
    sizeTiers: {
      small: { label: "500 GB", blurb: "Small buckets and archives." },
      medium: { label: "1 TB", blurb: "Standard application storage." },
      large: { label: "5 TB", blurb: "Media, backups, large datasets." },
      xlarge: { label: "20 TB", blurb: "Data-lake scale storage." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Redundancy & lifecycle",
    optionChoices: ["multi-az", "versioning", "lifecycle-rules", "object-lock"],
  },
  network: {
    subtitle: "Choose bandwidth and protection add-ons.",
    sizeLabel: "Bandwidth tier",
    sizeTiers: {
      small: { label: "1 Gbps", blurb: "Low-traffic services." },
      medium: { label: "5 Gbps", blurb: "Standard production traffic." },
      large: { label: "10 Gbps", blurb: "High-traffic, latency-sensitive apps." },
      xlarge: { label: "25 Gbps", blurb: "Global-scale, high-throughput traffic." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Protection",
    optionChoices: ["ddos-protection", "waf-enabled", "geo-routing", "static-ip"],
  },
  domain: {
    subtitle: "Set renewal and DNS protection preferences.",
    sizeLabel: "Plan",
    sizeTiers: DEFAULT_TIERS,
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Domain protection",
    optionChoices: ["dnssec", "who-is-privacy", "transfer-lock", "no-auto-renew"],
  },
  deployment: {
    subtitle: "Choose the build/deploy tier for this app.",
    sizeLabel: "Build tier",
    sizeTiers: DEFAULT_TIERS,
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Deployment add-ons",
    optionChoices: ["preview-deployments", "custom-domain", "edge-caching", "zero-downtime"],
  },
  "ai-tool": {
    subtitle: "Pick a workspace plan for this development tool.",
    sizeLabel: "Plan",
    sizeTiers: {
      small: { label: "Solo", blurb: "1 seat, 1 workspace." },
      medium: { label: "Team", blurb: "Standard team plan." },
      large: { label: "Business", blurb: "Larger teams, more compute credits." },
      xlarge: { label: "Enterprise", blurb: "Org-wide rollout, maximum credits." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Workspace add-ons",
    optionChoices: ["sso", "audit-log", "private-templates", "priority-support"],
  },
  "ai-model": {
    subtitle: "Choose the model size and context window.",
    sizeLabel: "Model size",
    sizeTiers: {
      small: { label: "7B params · 8K context", blurb: "Fast, low-cost inference." },
      medium: { label: "34B params · 32K context", blurb: "Balanced quality and cost." },
      large: { label: "70B params · 128K context", blurb: "High-quality, long-context tasks." },
      xlarge: { label: "405B params · 200K context", blurb: "Frontier quality, maximum context." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Serving options",
    optionChoices: ["streaming", "function-calling", "batch-inference", "fine-tunable"],
  },
  "ai-agent": {
    subtitle: "Configure how autonomous this agent is allowed to be.",
    sizeLabel: "Autonomy tier",
    sizeTiers: {
      small: { label: "10 steps · 2 tools", blurb: "Narrow, supervised tasks." },
      medium: { label: "20 steps · 4 tools", blurb: "Standard task automation." },
      large: { label: "40 steps · 8 tools", blurb: "Multi-step workflows." },
      xlarge: { label: "80 steps · 16 tools", blurb: "Complex, long-running agent runs." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Agent behavior",
    optionChoices: ["no-memory", "human-in-the-loop", "tool-audit-log", "sandboxed-execution"],
  },
  "api-service": {
    subtitle: "Set rate limits and authentication for this API.",
    sizeLabel: "Rate limit tier",
    sizeTiers: {
      small: { label: "60 rpm", blurb: "Low-volume integrations." },
      medium: { label: "600 rpm", blurb: "Standard production traffic." },
      large: { label: "6,000 rpm", blurb: "High-volume production traffic." },
      xlarge: { label: "60,000 rpm", blurb: "Platform-scale traffic." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Auth & delivery",
    optionChoices: ["oauth2", "webhook-retries", "response-caching", "regional-failover"],
  },
  "devops-tool": {
    subtitle: "Size pipeline concurrency and included build minutes.",
    sizeLabel: "Plan",
    sizeTiers: {
      small: { label: "5 pipelines · 1,000 min", blurb: "Small teams / side projects." },
      medium: { label: "10 pipelines · 2,000 min", blurb: "Standard engineering teams." },
      large: { label: "20 pipelines · 4,000 min", blurb: "Larger orgs, more concurrency." },
      xlarge: { label: "40 pipelines · 8,000 min", blurb: "Platform-scale CI/CD." },
    },
    showReplicas: true, replicasLabel: "Concurrent runners", replicasPlaceholder: "Auto (based on plan)",
    optionsLabel: "Pipeline add-ons",
    optionChoices: ["self-hosted-runners", "matrix-builds", "artifact-caching", "required-approvals"],
  },
  "observability-tool": {
    subtitle: "Choose retention window and ingest volume.",
    sizeLabel: "Retention & ingest tier",
    sizeTiers: {
      small: { label: "7 days · 25 GB/day", blurb: "Lightweight monitoring." },
      medium: { label: "14 days · 50 GB/day", blurb: "Standard production monitoring." },
      large: { label: "30 days · 100 GB/day", blurb: "Compliance-grade retention." },
      xlarge: { label: "90 days · 200 GB/day", blurb: "Enterprise-scale telemetry." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Alerting & dashboards",
    optionChoices: ["custom-dashboards", "pagerduty-integration", "anomaly-detection", "long-term-archive"],
  },
  "security-tool": {
    subtitle: "Set protection level and enforcement policy.",
    sizeLabel: "Protection tier",
    sizeTiers: {
      small: { label: "50 users", blurb: "Small team protection." },
      medium: { label: "100 users", blurb: "Standard org protection." },
      large: { label: "200 users", blurb: "Larger org, more threat feeds." },
      xlarge: { label: "400 users", blurb: "Enterprise-wide protection." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Enforcement",
    optionChoices: ["no-mfa", "siem-integration", "just-in-time-access", "session-recording"],
  },
  "governance-tool": {
    subtitle: "Set how strictly policies are enforced.",
    sizeLabel: "Enforcement tier",
    sizeTiers: {
      small: { label: "3 policies · 24h SLA", blurb: "Light-touch governance." },
      medium: { label: "6 policies · 12h SLA", blurb: "Standard governance." },
      large: { label: "12 policies · 4h SLA", blurb: "Strict, fast-turnaround approvals." },
      xlarge: { label: "24 policies · 1h SLA", blurb: "Maximum rigor, near-real-time approvals." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Policy scope",
    optionChoices: ["human-approval-required", "auto-remediation", "bias-audits", "explainability-reports"],
  },
  "data-tool": {
    subtitle: "Size pipeline throughput and connector count.",
    sizeLabel: "Throughput tier",
    sizeTiers: {
      small: { label: "50 Mbps · 2 connectors", blurb: "Small data pipelines." },
      medium: { label: "100 Mbps · 4 connectors", blurb: "Standard data pipelines." },
      large: { label: "200 Mbps · 8 connectors", blurb: "High-volume pipelines." },
      xlarge: { label: "400 Mbps · 16 connectors", blurb: "Platform-scale data movement." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Pipeline add-ons",
    optionChoices: ["schema-validation", "cdc-enabled", "data-quality-checks", "lineage-tracking"],
  },
  "knowledge-tool": {
    subtitle: "Set index scale and embedding dimensionality.",
    sizeLabel: "Index scale",
    sizeTiers: {
      small: { label: "25K docs · 384-dim", blurb: "Small knowledge base." },
      medium: { label: "50K docs · 768-dim", blurb: "Standard knowledge base." },
      large: { label: "100K docs · 1536-dim", blurb: "Large enterprise knowledge base." },
      xlarge: { label: "200K docs · 3072-dim", blurb: "Massive, high-fidelity search." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Retrieval add-ons",
    optionChoices: ["citation-tracking", "hybrid-search", "reranking", "auto-refresh"],
  },
  "automation-tool": {
    subtitle: "Size active workflows and daily run volume.",
    sizeLabel: "Workflow tier",
    sizeTiers: {
      small: { label: "4 workflows · 250/day", blurb: "Small automation footprint." },
      medium: { label: "8 workflows · 500/day", blurb: "Standard automation footprint." },
      large: { label: "16 workflows · 1,000/day", blurb: "High-volume automation." },
      xlarge: { label: "32 workflows · 2,000/day", blurb: "Platform-scale automation." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Workflow add-ons",
    optionChoices: ["approval-steps", "retry-policies", "error-notifications", "audit-trail"],
  },
  "developer-tool": {
    subtitle: "Pick a seat plan for this developer tool.",
    sizeLabel: "Seat plan",
    sizeTiers: {
      small: { label: "5 seats", blurb: "Small team." },
      medium: { label: "10 seats", blurb: "Standard team." },
      large: { label: "20 seats", blurb: "Larger engineering org." },
      xlarge: { label: "40 seats", blurb: "Org-wide rollout." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Tool add-ons",
    optionChoices: ["sso", "offline-mode", "extension-marketplace", "usage-analytics"],
  },
  "enterprise-app": {
    subtitle: "Size active users and enabled modules.",
    sizeLabel: "Rollout tier",
    sizeTiers: {
      small: { label: "250 users · 1-2 modules", blurb: "Pilot rollout." },
      medium: { label: "500 users · 2-3 modules", blurb: "Departmental rollout." },
      large: { label: "1,000 users · 4-5 modules", blurb: "Company-wide rollout." },
      xlarge: { label: "2,000 users · 6+ modules", blurb: "Full enterprise deployment." },
    },
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Rollout add-ons",
    optionChoices: ["sso", "custom-branding", "dedicated-support", "data-residency"],
  },
  "marketplace-item": {
    subtitle: "Choose install scope for this marketplace item.",
    sizeLabel: "Plan",
    sizeTiers: DEFAULT_TIERS,
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Install options",
    optionChoices: ["workspace-scope", "auto-update", "pin-version"],
  },
  "billing-tool": {
    subtitle: "Choose the billing cycle for this feature.",
    sizeLabel: "Plan",
    sizeTiers: DEFAULT_TIERS,
    showReplicas: false, replicasLabel: "", replicasPlaceholder: "",
    optionsLabel: "Billing options",
    optionChoices: ["usage-based", "annual-prepay", "auto-invoicing"],
  },
};

const FALLBACK_CONFIG: KindWizardConfig = {
  subtitle: "Configure this resource before provisioning.",
  sizeLabel: "Size tier",
  sizeTiers: DEFAULT_TIERS,
  showReplicas: true, replicasLabel: "Replicas / nodes", replicasPlaceholder: "Auto",
  optionsLabel: "Add-on options",
  optionChoices: ["multi-az", "high-availability", "auto-scaling", "encryption-at-rest"],
};

export function wizardConfigForKind(kind: ResourceKind | undefined): KindWizardConfig {
  return (kind && KIND_WIZARD_CONFIG[kind]) || FALLBACK_CONFIG;
}
