import { quantiva_erp } from "./quantiva-erp";
import { cerebro_ai_enterprise } from "./cerebro-ai-enterprise";
import { agentos } from "./agentos";
import { automation_studio } from "./automation-studio";
import { knowledge_hub } from "./knowledge-hub";
import { cerebro_analytics } from "./cerebro-analytics";
import { cerebrosphere } from "./cerebrosphere";
import { hivematrix } from "./hivematrix";
import { neuroflow } from "./neuroflow";
import { synapsex } from "./synapsex";
import { agentforge } from "./agentforge";
import { quantiva_integration_framework } from "./quantiva-integration-framework";
import { cortexops } from "./cortexops";
import { hivescore } from "./hivescore";
import { decisiondna } from "./decisiondna";
import { ai_value_canvas } from "./ai-value-canvas";

export const softwarePlatformsData = [
  quantiva_erp,
  cerebro_ai_enterprise,
  agentos,
  automation_studio,
  knowledge_hub,
  cerebro_analytics
];

export const proprietaryFrameworksData = [
  cerebrosphere,
  hivematrix,
  neuroflow,
  synapsex,
  agentforge,
  quantiva_integration_framework,
  cortexops,
  hivescore,
  decisiondna,
  ai_value_canvas
];

export const allProductsData = [...softwarePlatformsData, ...proprietaryFrameworksData];

export const getProductBySlug = (slug: string) => {
  return allProductsData.find((p) => p.slug === slug);
};
