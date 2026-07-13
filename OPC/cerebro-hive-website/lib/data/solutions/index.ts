import { enterprise_ai } from "./enterprise-ai";
import { ai_agents } from "./ai-agents";
import { rag } from "./rag";
import { document_ai } from "./document-ai";
import { knowledge_management } from "./knowledge-management";
import { hyperautomation } from "./hyperautomation";
import { decision_intelligence } from "./decision-intelligence";
import { predictive_analytics } from "./predictive-analytics";
import { customer_experience } from "./customer-experience";
import { erp_modernization } from "./erp-modernization";
import { cloud_modernization } from "./cloud-modernization";
import { ai_governance } from "./ai-governance";

export const solutionsData = [
  enterprise_ai,
  ai_agents,
  rag,
  document_ai,
  knowledge_management,
  hyperautomation,
  decision_intelligence,
  predictive_analytics,
  customer_experience,
  erp_modernization,
  cloud_modernization,
  ai_governance
];

export const getSolutionBySlug = (slug: string) => {
  return solutionsData.find((sol) => sol.slug === slug);
};
