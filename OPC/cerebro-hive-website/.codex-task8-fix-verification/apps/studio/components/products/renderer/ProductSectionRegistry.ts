import React from "react";
import { ProductSectionId, PackagedProduct } from "@/lib/data/types";

import { ProductHero } from "../sections/ProductHero";
import { ProductExecutiveSummary } from "../sections/ProductExecutiveSummary";
import { ProductBusinessProblems } from "../sections/ProductBusinessProblems";
import { ProductCoreCapabilities } from "../sections/ProductCoreCapabilities";
import { ProductIntegrationEcosystem } from "../sections/ProductIntegrationEcosystem";
import { ProductDeveloperExperience } from "../sections/ProductDeveloperExperience";
import { ProductFAQ } from "../sections/ProductFAQ";
import { ProductCTA } from "../sections/ProductCTA";

// A null component for stubbed sections
const NullSection = () => null;

export const ProductSectionRegistry: Record<
  ProductSectionId,
  React.FC<{ product: PackagedProduct }>
> = {
  hero: ProductHero,
  executive_summary: ProductExecutiveSummary,
  business_problems: ProductBusinessProblems,
  core_capabilities: ProductCoreCapabilities,
  architecture_overview: NullSection, // Will be product-specific; stub for now
  feature_matrix: NullSection,        // Advanced bento grid — next iteration
  deployment_models: NullSection,     // Merged into DevXp & Executive Summary
  security_compliance: NullSection,   // Merged into DevXp
  integration_ecosystem: ProductIntegrationEcosystem,
  api_sdk: NullSection,               // Merged into DevXp
  developer_experience: ProductDeveloperExperience,
  ai_capabilities: NullSection,       // Future: AI-specific capability matrix
  platform_dependencies: NullSection, // Merged into Ecosystem
  performance_benchmarks: NullSection,
  roadmap: NullSection,
  case_studies: NullSection,
  industries: NullSection,            // Merged into Executive Summary
  related_services: NullSection,      // Merged into Ecosystem
  pricing: NullSection,               // Future: Pricing Tier component
  faq: ProductFAQ,
  cta: ProductCTA,
};
