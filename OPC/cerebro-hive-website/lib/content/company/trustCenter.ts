export const trustCenter = {
  summary: [
    { label: "Security", status: "Operational", indicator: "good" },
    { label: "Privacy", status: "Operational", indicator: "good" },
    { label: "Responsible AI", status: "Continuous", indicator: "active" },
    { label: "Compliance", status: "Roadmap", indicator: "pending" },
    { label: "Operations", status: "Operational", indicator: "good" }
  ],
  pillars: [
    { 
      id: "security", 
      title: "Security", 
      status: "Operational", 
      description: "Zero-trust architecture protecting enterprise IP and client data.",
      controls: ["Zero Trust", "Encryption", "Monitoring", "Least Privilege"],
      orbState: "breathing-slow"
    },
    { 
      id: "privacy", 
      title: "Privacy", 
      status: "Operational", 
      description: "Privacy by design with rigorous data isolation protocols.",
      controls: ["Data Isolation", "Anonymization", "Retention Lifecycle", "Tenant Separation"],
      orbState: "breathing-slower"
    },
    { 
      id: "operations", 
      title: "Operations", 
      status: "Operational", 
      description: "24/7 proactive monitoring and incident response.",
      controls: ["24/7 SOC", "Incident Response", "Disaster Recovery", "High Availability"],
      orbState: "heartbeat"
    },
    { 
      id: "compliance", 
      title: "Compliance", 
      status: "Roadmap", 
      description: "Active alignment with international infosec standards.",
      controls: ["ISO 27001", "SOC 2", "HIPAA", "FedRAMP"],
      orbState: "rotating"
    }
  ],
  roadmap: [
    { 
      id: "foundation", 
      standard: "ISO 27001", 
      stage: "Foundation", 
      description: "Information Security Management", 
      impact: "Supports enterprise procurement and standardizes core security controls." 
    },
    { 
      id: "enterprise", 
      standard: "SOC 2 Type II", 
      stage: "Enterprise Readiness", 
      description: "Service Organization Controls", 
      impact: "Demonstrates operational maturity and continuous compliance for SaaS customers." 
    },
    { 
      id: "healthcare", 
      standard: "HIPAA", 
      stage: "Healthcare Expansion", 
      description: "Health Insurance Portability", 
      impact: "Enables secure processing of Protected Health Information (PHI)." 
    },
    { 
      id: "government", 
      standard: "FedRAMP", 
      stage: "Government Readiness", 
      description: "Federal Risk and Authorization", 
      impact: "Unlocks highly regulated public sector and defense deployments." 
    }
  ],
  aiGovernance: {
    title: "Responsible AI",
    status: "Continuous",
    description: "Ethical modeling and safety alignment are first-class citizens in our framework.",
    areas: [
      "Model Registry",
      "Evaluation",
      "Prompt Security",
      "Human Review",
      "Versioning",
      "Safety Guardrails"
    ],
    orbState: "active"
  },
  readinessMetrics: {
    security: [
      { label: "Encryption", value: "AES-256 At Rest" },
      { label: "Identity", value: "SSO & MFA Required" },
      { label: "Monitoring", value: "24/7 SOC" }
    ],
    privacy: [
      { label: "Data Handling", value: "Tenant Isolation" },
      { label: "Retention", value: "Automated Lifecycle" }
    ],
    ai: [
      { label: "Training Data", value: "Zero Customer Data" },
      { label: "Governance", value: "Red Teaming Standard" }
    ]
  }
};
