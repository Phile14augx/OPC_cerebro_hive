import React from "react";
import { ServiceSectionId, EnterpriseService } from "@/lib/data/types";

// Import all sections
import { ServiceHero } from "../sections/ServiceHero";
import { ServiceBusinessChallenges } from "../sections/ServiceBusinessChallenges";
import { ServiceMethodology } from "../sections/ServiceMethodology";
import { ServiceArchitecture } from "../sections/ServiceArchitecture";
import { ServiceDeliverables } from "../sections/ServiceDeliverables";
import { ServiceROI } from "../sections/ServiceROI";
import { ServiceFAQ } from "../sections/ServiceFAQ";
import { ServiceCTA } from "../sections/ServiceCTA";

// Map section IDs to their React components
export const SectionRegistry: Record<ServiceSectionId, React.FC<{ service: EnterpriseService }>> = {
  hero: ServiceHero,
  executive_summary: () => null, // Merged into BusinessChallenges
  business_challenges: ServiceBusinessChallenges,
  methodology: ServiceMethodology,
  roadmap: () => null, // Merged into Methodology timeline
  architecture: ServiceArchitecture,
  products: () => null, // Handled inside Architecture
  deliverables: ServiceDeliverables,
  case_studies: () => null, // Stubbed for now, can be added later
  roi: ServiceROI,
  pricing: () => null, // Merged into Deliverables as Commercial Model
  faq: ServiceFAQ,
  cta: ServiceCTA
};
