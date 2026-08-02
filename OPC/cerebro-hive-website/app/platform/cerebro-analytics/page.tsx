import type { Metadata } from "next";

import { ProductPage, type ProductPanel } from "@/components/platform/ProductPage";

export const metadata: Metadata = {
  title: "CerebroAnalytics — CerebroHive Platform",
  description: "CerebroAnalytics delivers predictive and prescriptive analytics over governed enterprise data, with feature attribution and confidence intervals on every estimate.",
};

const PANELS: ProductPanel[] = [
    {
      title: "Analysis types",
      description: "The question classes the product covers.",
      items: [
        "Descriptive — governed metrics with lineage",
        "Diagnostic — driver and contribution analysis",
        "Predictive — supervised models over feature sets",
        "Prescriptive — recommended action with expected lift",
        "Causal — uplift and difference-in-differences testing",
      ],
    },
    {
      title: "Modelling workflow",
      description: "From question to deployed model.",
      items: [
        "Feature definitions sourced from HiveSemantic",
        "Training runs tracked and versioned in HiveOps",
        "Backtesting against held-out historical windows",
        "Drift detection with automatic retraining triggers",
      ],
    },
    {
      title: "Explainability",
      description: "The constitution requires explainable decisions.",
      items: [
        "Per-prediction feature attribution",
        "Confidence intervals surfaced alongside every estimate",
        "Counterfactual view — what would change the outcome",
        "Model card and lineage attached to each deployment",
      ],
    },
    {
      title: "Delivery",
      description: "Where results land.",
      items: [
        "Embedded panels inside CerebroStudio",
        "Scheduled narrative briefings",
        "Alerting on threshold breach through HiveMonitor",
        "Write-back into CerebroFlow as a workflow trigger",
      ],
    },
];

export default function Page() {
  return (
    <ProductPage
      name={"CerebroAnalytics™"}
      tier={4}
      headline={"Predictive and prescriptive analytics over governed enterprise data"}
      summary={"CerebroAnalytics turns the governed data in HiveLake into decisions. Where CerebroInsight answers what happened, CerebroAnalytics answers what will happen and what to do about it — with the model, the features, and the confidence interval all exposed rather than hidden behind a number."}
      panels={PANELS}
    />
  );
}
