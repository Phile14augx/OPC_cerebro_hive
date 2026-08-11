export const trustCenter = {
  executiveScorecard: {
    trustScore: { value: "98%", trend: "+2%" },
    lastAudit: "3 Days Ago",
    compliance: "8/8",
    status: "Healthy"
  },
  capabilities: [
    {
      id: "architecture",
      title: "Enterprise Platform",
      subtitle: "Central Trust Layer",
      description: "The core orchestration layer where security, privacy, and compliance intersect.",
      metrics: "Orchestration Hub",
      color: "orange",
      icon: "hexagon",
      controls: ["Service Mesh", "Policy Engine", "Audit Logs"]
    },
    {
      id: "security",
      title: "Zero Trust",
      subtitle: "Always Verify",
      description: "Implicit trust is removed from all computing infrastructure.",
      metrics: "34 Controls",
      color: "emerald",
      icon: "shield",
      controls: ["Identity Access", "Network Micro-segmentation", "Encryption in Transit/Rest"]
    },
    {
      id: "privacy",
      title: "Privacy by Design",
      subtitle: "Data Minimization",
      description: "Rigorous data isolation and lifecycle management protocols.",
      metrics: "12 Policies",
      color: "blue",
      icon: "lock",
      controls: ["Tenant Isolation", "Anonymization Pipeline", "Automated Retention"]
    },
    {
      id: "responsible-ai",
      title: "Responsible AI",
      subtitle: "Continuous Evaluation",
      description: "Ethical modeling, safety alignment, and bias detection.",
      metrics: "42 Checks",
      color: "purple",
      icon: "scale",
      controls: ["Red Teaming", "Prompt Guardrails", "Toxicity Filtering"]
    },
    {
      id: "compliance",
      title: "Compliance",
      subtitle: "Global Standards",
      description: "Active alignment with international infosec and privacy standards.",
      metrics: "8 Frameworks",
      color: "gold",
      icon: "check-circle",
      controls: ["SOC 2 Type II", "ISO 27001", "HIPAA", "FedRAMP"]
    },
    {
      id: "monitoring",
      title: "Continuous Monitoring",
      subtitle: "Real-time Telemetry",
      description: "24/7 proactive threat hunting and anomaly detection.",
      metrics: "0 Incidents",
      color: "cyan",
      icon: "activity",
      controls: ["SIEM Integration", "Alert Triage", "Automated Response"]
    }
  ],
  pipeline: [
    { id: "design", label: "Design", description: "Architecture Review" },
    { id: "develop", label: "Develop", description: "Secure Coding" },
    { id: "validate", label: "Validate", description: "Red Teaming" },
    { id: "deploy", label: "Deploy", description: "Policy Gates" },
    { id: "monitor", label: "Monitor", description: "Telemetry" },
    { id: "govern", label: "Govern", description: "Audits" }
  ]
};
