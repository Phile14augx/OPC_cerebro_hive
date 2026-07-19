import { PackagedProduct } from "../types";

export const hiveShieldProduct: PackagedProduct = {
  id: "hive-shield",
  slug: "hive-shield",
  title: "HiveShield™",
  summary: "The enterprise AI security and governance platform — Identity & Access Management, AI safety guardrails, compliance automation, secrets management, audit trails, policy engine, and threat detection for AI-native organizations.",
  hero: {
    title: "HiveShield™",
    subtitle: "Enterprise Security & Governance Platform",
    description: "The trust layer of the CerebroHive platform. HiveShield enforces security, governance, and compliance across every module — from AI output guardrails and identity management to secrets vaulting, threat detection, risk scoring, and regulatory compliance automation. Enterprise AI cannot scale without trust.",
    primaryCta: "Explore Security Platform",
    secondaryCta: "View Compliance Docs",
  },
  iconName: "Shield",
  category: "Platform",
  status: "production",
  maturity: "ga",
  tags: ["IAM", "AI Governance", "Compliance", "Security", "AI Safety", "Risk Management", "Zero Trust", "Audit"],

  // Ecosystem Positioning
  ecosystemLayer: "enterprise",
  moduleConnections: ["hive-ops", "cerebro-sphere", "hivepulse", "cerebro-archive", "cerebro-flow"],
  platformServices: ["identity", "secrets-management", "audit", "policy-engine", "threat-detection"],
  providesCapabilities: ["identity-management", "ai-safety-guardrails", "compliance-automation", "threat-detection", "policy-engine"],

  seo: {
    title: "HiveShield™ | Enterprise AI Security & Governance Platform | CerebroHive",
    description: "HiveShield is an enterprise AI security and governance platform providing Identity & Access Management, AI safety guardrails, compliance automation, secrets management, audit trails, and threat detection for AI-native organizations.",
    keywords: [
      "enterprise AI security platform",
      "AI governance software",
      "AI safety guardrails",
      "enterprise IAM platform",
      "AI compliance automation",
      "AI risk management platform",
      "enterprise security AI",
      "AI policy engine",
      "zero trust AI security",
      "AI audit trail software",
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
      "security_compliance",
      "deployment_models",
      "faq",
      "cta",
    ],
  },

  businessProblems: [
    "AI systems make decisions with business and compliance consequences but there is no governance layer enforcing boundaries.",
    "Enterprise AI deployments expose sensitive data to models without adequate access controls or output filtering.",
    "Regulatory requirements (GDPR, HIPAA, SOC 2) are applied inconsistently across AI workloads.",
    "There is no single system of record for who accessed what data, which model made which decision, and when.",
    "Security teams cannot audit AI agent behavior, prompt interactions, or model outputs at enterprise scale.",
  ],

  targetPersonas: ["CISO", "CRO", "Compliance Officers", "Security Architects", "Legal & Privacy Teams", "AI Governance Teams", "CTO"],
  industries: ["Financial Services", "Healthcare", "Government", "Legal", "Insurance", "Energy", "Defense"],

  coreCapabilities: [
    {
      title: "Identity & Access Management",
      description: "Enterprise SSO, SAML 2.0, OIDC, and MFA across all CerebroHive modules — unified identity fabric supporting role-based and attribute-based access control with organizational hierarchies.",
      icon: "Key",
    },
    {
      title: "AI Safety Guardrails",
      description: "Configurable output filters, content moderation, PII detection and masking, prompt injection protection, and jailbreak prevention — enforced at the AI Gateway layer before any response reaches users.",
      icon: "Shield",
    },
    {
      title: "Policy Engine",
      description: "Declarative policy framework for AI governance — define rules for model usage, data access, response content, cost limits, and geographic data residency — enforced organization-wide.",
      icon: "FileText",
    },
    {
      title: "Compliance Automation",
      description: "Automated compliance mapping and evidence collection for SOC 2, HIPAA, GDPR, ISO 27001, NIST AI RMF, and EU AI Act — with continuous monitoring and gap identification.",
      icon: "CheckSquare",
    },
    {
      title: "Secrets Management",
      description: "Centralized secrets vault for API keys, credentials, certificates, and sensitive configuration — with rotation policies, access logging, and integration with Kubernetes workloads.",
      icon: "Lock",
    },
    {
      title: "Immutable Audit Trail",
      description: "Tamper-proof, cryptographically signed audit logs of every user action, AI model interaction, data access, and workflow execution — queryable, exportable, and retained per regulatory requirements.",
      icon: "FileSearch",
    },
    {
      title: "Risk Scoring Engine",
      description: "Continuous risk assessment across AI deployments — model risk scores, data exposure indicators, compliance gap severity, and vendor risk ratings with automated escalation.",
      icon: "AlertTriangle",
    },
    {
      title: "Threat Detection",
      description: "AI-powered anomaly detection identifying suspicious access patterns, prompt injection attempts, data exfiltration indicators, and insider threat signals across platform telemetry.",
      icon: "Radar",
    },
  ],

  deploymentModels: ["SaaS (Cloud)", "Private Cloud (VPC)", "On-Premises", "Air-Gapped Enterprise"],
  securityFeatures: [
    "Zero-Trust Architecture",
    "FIPS 140-2 Compliant Encryption",
    "SOC 2 Type II Certified",
    "HIPAA Compliant",
    "GDPR Compliant",
    "EU AI Act Ready",
    "NIST AI RMF Aligned",
    "ISO 27001 Aligned",
    "Penetration Tested",
  ],

  integrations: [
    { system: "HiveOps™", type: "Infrastructure Security Layer" },
    { system: "CerebroSphere™", type: "Governance Dashboard" },
    { system: "Okta / Azure AD / Ping", type: "Identity Provider" },
    { system: "HashiCorp Vault", type: "Secrets Backend" },
    { system: "SIEM Systems (Splunk, Sentinel)", type: "Security Event Export" },
    { system: "CrowdStrike / SentinelOne", type: "Endpoint Security" },
    { system: "AWS IAM / GCP IAM / Azure IAD", type: "Cloud IAM Integration" },
  ],

  apiReference: "/developers/api/hive-shield",
  sdkLanguages: ["Python", "Go", "TypeScript"],
  platformCapabilities: ["iam", "guardrails", "policy-engine", "audit-log", "secrets-vault"],
  relatedServices: ["ai-governance", "enterprise-security", "compliance-advisory"],
  relatedResearch: ["ai-safety-architecture", "enterprise-governance-patterns"],

  faqs: [
    {
      question: "What AI-specific security capabilities does HiveShield provide?",
      answer: "HiveShield provides AI-specific protections not found in traditional security platforms: prompt injection detection, AI output filtering and content moderation, PII masking in model responses, jailbreak attempt blocking, model decision audit trails, AI usage cost governance, and alignment with emerging AI regulatory frameworks like the EU AI Act and NIST AI RMF.",
    },
    {
      question: "How does HiveShield support compliance certification?",
      answer: "HiveShield automates compliance evidence collection for SOC 2, HIPAA, GDPR, ISO 27001, and NIST frameworks. It maintains continuous control monitoring, generates audit-ready reports, maps AI-specific risks to regulatory requirements, and identifies gaps before they become findings during formal audits.",
    },
  ],
};
