import { PackagedProduct } from "../types";

import { cerebroArchiveProduct } from "./cerebro-archive";
import { cerebroStudioProduct } from "./cerebro-studio";
import { cerebroFlowProduct } from "./cerebro-flow";
import { cerebroInsightProduct } from "./cerebro-insight";
import { cerebroCopilotProduct } from "./cerebro-copilot";
import { cerebroResearchProduct } from "./cerebro-research";
import { cerebroLearnProduct } from "./cerebro-learn";
import { hiveShieldProduct } from "./hive-shield";
import { hiveOpsProduct } from "./hive-ops";
import { cerebroSphereProduct } from "./cerebro-sphere";
import { hivepulseProduct } from "./hivepulse";
import { cerebroXProduct } from "./cerebro-x";

/**
 * CerebroHive — Enterprise AI Operating System
 * Product Ecosystem Hierarchy
 *
 * Tier 1 (OS): CerebroSphere™
 * Tier 2 (Orchestration): HivePulse™
 * Tier 3 (Business Modules): Archive, Studio, Flow, Insight, Copilot
 * Tier 4 (Enterprise Platform): HiveOps, HiveShield
 * Tier 5 (Foundation Services): Cerebro X (AI Gateway)
 */

/** All products — ordered by ecosystem layer */
export const products: PackagedProduct[] = [
  // OS Layer
  cerebroSphereProduct,

  // Orchestration Engine
  hivepulseProduct,

  // Business Intelligence Modules
  cerebroArchiveProduct,
  cerebroStudioProduct,
  cerebroFlowProduct,
  cerebroInsightProduct,
  cerebroCopilotProduct,

  // Enterprise Platform Services
  hiveOpsProduct,
  hiveShieldProduct,

  // Foundation Services (AI Gateway)
  cerebroXProduct,

  // Legacy / Absorbed (retained for backward compatibility)
  cerebroResearchProduct,
  cerebroLearnProduct,
];

/** Ecosystem module groups for the Products page UI */
export const ecosystemTiers = {
  os: products.filter(p => p.ecosystemLayer === "os"),
  orchestration: products.filter(p => p.ecosystemLayer === "orchestration"),
  intelligence: products.filter(p => p.ecosystemLayer === "intelligence"),
  business: products.filter(p => p.ecosystemLayer === "business"),
  enterprise: products.filter(p => p.ecosystemLayer === "enterprise"),
  platformFoundation: products.filter(p => p.ecosystemLayer === "platform-foundation"),
};

/** Featured ecosystem products (excludes deprecated/absorbed) */
export const featuredProducts: PackagedProduct[] = products.filter(
  p => !["cerebro-research", "cerebro-learn"].includes(p.id)
);

export const getProductBySlug = (slug: string) => {
  return products.find(p => p.slug === slug);
};
