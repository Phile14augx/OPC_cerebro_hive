import { EnterpriseService } from "../types";
import { aiStrategyService } from "./ai-strategy";
import { intelligenceModernizationService } from "./intelligence-modernization";
import { autonomousTransformationService } from "./autonomous-transformation";
import { aiPlatformEngineeringService } from "./ai-platform-engineering";
import { knowledgeEngineeringService } from "./knowledge-engineering";
import { aiFactoryService } from "./ai-factory";
import { coeService } from "./coe";
import { aiGovernanceService } from "./ai-governance";
import { aiopsService } from "./aiops";
import { industryAcceleratorService } from "./industry-accelerator";

export const services: EnterpriseService[] = [
  aiStrategyService,
  intelligenceModernizationService,
  autonomousTransformationService,
  aiPlatformEngineeringService,
  knowledgeEngineeringService,
  aiFactoryService,
  coeService,
  aiGovernanceService,
  aiopsService,
  industryAcceleratorService
];

export const getServiceBySlug = (slug: string) => {
  return services.find(s => s.slug === slug);
};
