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

export const products: PackagedProduct[] = [
  hivepulseProduct,
  cerebroXProduct,
  cerebroArchiveProduct,
  cerebroStudioProduct,
  cerebroFlowProduct,
  cerebroInsightProduct,
  cerebroCopilotProduct,
  cerebroResearchProduct,
  cerebroLearnProduct,
  hiveShieldProduct,
  hiveOpsProduct,
  cerebroSphereProduct,
];

export const getProductBySlug = (slug: string) => {
  return products.find(p => p.slug === slug);
};
