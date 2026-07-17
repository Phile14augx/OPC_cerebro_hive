import { SoftwarePlatform } from "./types";

export const quantiva_erp: SoftwarePlatform = {
  type: "software",
  slug: "quantiva-erp",
  name: "Quantiva ERP",
  tagline: "AI-Native Enterprise Platform",
  description: "CerebroHive's Quantiva ERP transforms operations by integrating AI directly into core enterprise workflows.",
  color: "#00F57A",
  modules: ["Finance", "HR", "CRM", "Inventory", "Manufacturing"],
  features: ["Enterprise Copilot", "Workflow Automation", "AI Agents", "Knowledge Graph"],
  deploymentOptions: [
    { name: "Cloud", icon: "Cloud", description: "AWS, Azure, GCP" },
    { name: "Hybrid", icon: "CloudSnow", description: "Edge + Cloud" }
  ],
  comparisons: {
    featuresList: ["AI Copilot", "Multi-Agent Workflows", "API First", "Cloud Deployment", "On-Premise"],
    cerebro: { "AI Copilot": "yes", "Multi-Agent Workflows": "yes", "API First": "yes", "Cloud Deployment": "yes", "On-Premise": "yes" },
    competitors: [
      {
        competitor: "SAP",
        features: { "AI Copilot": "yes", "Multi-Agent Workflows": "limited", "API First": "yes", "Cloud Deployment": "yes", "On-Premise": "yes" }
      },
      {
        competitor: "Oracle",
        features: { "AI Copilot": "yes", "Multi-Agent Workflows": "limited", "API First": "yes", "Cloud Deployment": "yes", "On-Premise": "limited" }
      }
    ]
  },
  integrations: ["Microsoft", "SAP", "Oracle", "Salesforce", "AWS", "Stripe"],
  architecture: { nodes: [], edges: [] }
};
