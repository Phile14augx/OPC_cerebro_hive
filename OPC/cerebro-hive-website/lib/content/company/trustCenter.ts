export const trustCenter = {
  pillars: [
    { id: "security", title: "Security", status: "Strong", description: "Zero-trust architecture protecting enterprise IP and client data." },
    { id: "privacy", title: "Privacy", status: "Strong", description: "Privacy by design with rigorous data isolation protocols." },
    { id: "compliance", title: "Compliance", status: "Roadmap", description: "Active alignment with international infosec standards." },
    { id: "operations", title: "Operations", status: "Enterprise Ready", description: "24/7 proactive monitoring and incident response." }
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
      stage: "Enterprise", 
      description: "Service Organization Controls", 
      impact: "Demonstrates operational maturity and continuous compliance for SaaS." 
    },
    { 
      id: "healthcare", 
      standard: "HIPAA", 
      stage: "Healthcare", 
      description: "Health Insurance Portability", 
      impact: "Enables secure processing of Protected Health Information (PHI)." 
    },
    { 
      id: "government", 
      standard: "FedRAMP", 
      stage: "Government", 
      description: "Federal Risk and Authorization", 
      impact: "Unlocks highly regulated public sector and defense deployments." 
    }
  ],
  aiGovernance: {
    title: "Responsible AI",
    status: "Active",
    areas: [
      "Model Evaluation",
      "Safety Alignment",
      "Bias & Fairness",
      "Human Oversight",
      "Data Provenance",
      "Continuous Monitoring"
    ]
  },
  readinessMetrics: {
    security: [
      { label: "Encryption", value: "AES-256 At Rest" },
      { label: "Identity", value: "SSO Required" },
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
