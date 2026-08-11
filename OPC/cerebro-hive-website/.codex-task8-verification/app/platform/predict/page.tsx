import type { Metadata } from "next";

import { ProductPage, type ProductPanel } from "@/components/platform/ProductPage";

export const metadata: Metadata = {
  title: "CerebroPredict — CerebroHive Platform",
  description: "CerebroPredict produces probabilistic forecasts for supply chain, revenue, and capacity — P10/P50/P90 bands, scenario simulation, and scored forecast accuracy.",
};

const PANELS: ProductPanel[] = [
    {
      title: "Forecast domains",
      description: "What the engine is calibrated for.",
      items: [
        "Demand and inventory across the supply chain",
        "Revenue and pipeline conversion",
        "Workforce capacity and hiring lead time",
        "Compute and storage capacity planning",
        "Cash-flow and working-capital projection",
      ],
    },
    {
      title: "Method selection",
      description: "Model chosen per series, not per organisation.",
      items: [
        "Seasonal decomposition with holiday regressors",
        "Gradient-boosted models over exogenous features",
        "Hierarchical reconciliation across roll-up levels",
        "Ensemble blending with per-horizon weighting",
      ],
    },
    {
      title: "Scenario simulation",
      description: "Planning against uncertainty rather than a single number.",
      items: [
        "What-if scenarios with adjustable drivers",
        "P10 / P50 / P90 bands on every horizon",
        "Sensitivity ranking across input assumptions",
        "Scenario comparison saved and shared to a workspace",
      ],
    },
    {
      title: "Forecast accountability",
      description: "Closing the loop on forecast quality.",
      items: [
        "Every forecast versioned and immutable once issued",
        "MAPE and pinball loss scored as actuals arrive",
        "Accuracy trend published per domain and per owner",
        "Regression alerts when a series degrades",
      ],
    },
];

export default function Page() {
  return (
    <ProductPage
      name={"CerebroPredict™"}
      tier={4}
      headline={"Forecasting for supply chain, revenue, and capacity"}
      summary={"CerebroPredict is the forecasting engine for the operational plan. It produces probabilistic forecasts — not point estimates — across demand, revenue, headcount, and infrastructure capacity, and keeps a scored history so the organisation can see whether its forecasts are actually getting better."}
      panels={PANELS}
    />
  );
}
