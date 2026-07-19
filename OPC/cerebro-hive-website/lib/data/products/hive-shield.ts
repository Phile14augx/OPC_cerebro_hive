import { PackagedProduct } from "../types";

export const hiveShieldProduct: PackagedProduct = {
  id: "hive-shield",
  slug: "hive-shield",
  title: "HiveShield™",
  summary: "Security Platform for threat detection, governance, and AI safety.",
  hero: {
    title: "HiveShield™",
    subtitle: "Security Platform",
    description: "Secure your AI deployments with enterprise-grade guardrails and real-time threat detection."
  },
  iconName: "ShieldAlert",
  category: "Security",
  status: "production",
  maturity: "ga",
  tags: ["Security", "Governance", "Guardrails"],

  seo: {
    title: "HiveShield™ | Enterprise AI Security & Governance Platform | CerebroHive",
    description: "HiveShield protects enterprise AI deployments with real-time threat detection, automatic PII masking, and AI guardrails — defending against prompt injections, jailbreaks, and data exfiltration at production scale.",
    keywords: ["AI security platform", "enterprise AI governance software", "LLM security tool", "AI guardrails software", "prompt injection detection", "AI safety platform", "enterprise AI compliance", "AI threat detection"],
  },

  config: {
    layout: "infrastructure",
    sections: [
      "hero",
      "executive_summary",
      "core_capabilities",
      "architecture_overview",
      "integration_ecosystem",
      "cta"
    ]
  },

  businessProblems: [
    "Prompt injections and jailbreaks threaten production AI systems.",
    "Data exfiltration risks through uncontrolled LLM outputs."
  ],

  targetPersonas: ["CISO", "IT Security"],
  industries: ["Finance", "Healthcare", "Government"],

  coreCapabilities: [
    {
      title: "Threat Detection",
      description: "Real-time scanning of all inputs and outputs for malicious payloads.",
      icon: "ShieldAlert"
    },
    {
      title: "Data Masking",
      description: "Automatically redacts PII before it reaches external models.",
      icon: "EyeOff"
    }
  ],

  deploymentModels: ["Private Cloud", "On-Premises"],
  securityFeatures: ["FIPS 140-2", "End-to-End Encryption"],
  integrations: [
    { system: "Splunk", type: "SIEM Integration" }
  ],

  apiReference: "/developers/api/shield",
  sdkLanguages: ["Python", "Go"],

  platformCapabilities: ["guard", "governance"],
  relatedServices: ["ai-governance"],
  relatedResearch: ["ai-safety"]
};
