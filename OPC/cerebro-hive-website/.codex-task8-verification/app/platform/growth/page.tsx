import type { Metadata } from "next";

import { ProductPage, type ProductPanel } from "@/components/platform/ProductPage";

export const metadata: Metadata = {
  title: "CerebroGrowth — CerebroHive Platform",
  description: "CerebroGrowth unifies campaign, pipeline, and customer signal into one attributed revenue model, with agent-assisted execution under human approval.",
};

const PANELS: ProductPanel[] = [
    {
      title: "Pipeline intelligence",
      description: "A forecast the sales leader can defend.",
      items: [
        "Deal scoring from engagement and firmographic signal",
        "Stage-conversion modelling with cohort baselines",
        "At-risk deal detection with named risk drivers",
        "Territory and quota coverage analysis",
      ],
    },
    {
      title: "Attribution",
      description: "Where revenue actually comes from.",
      items: [
        "Multi-touch attribution across the full journey",
        "Incrementality testing with holdout cohorts",
        "Channel-level CAC and payback period",
        "Content and campaign contribution ranking",
      ],
    },
    {
      title: "Agent-assisted execution",
      description: "Work agents do, with a human in the loop.",
      items: [
        "Lead routing and enrichment on arrival",
        "Outbound sequence drafting held for approval",
        "Next-best-action recommendation per account",
        "Automated CRM hygiene and duplicate resolution",
      ],
    },
    {
      title: "Guardrails",
      description: "Growth automation that stays compliant.",
      items: [
        "Consent and suppression enforced before every send",
        "Region-specific outreach rules applied per contact",
        "All agent-sent communication logged immutably",
        "Human approval required on any external message",
      ],
    },
];

export default function Page() {
  return (
    <ProductPage
      name={"CerebroGrowth™"}
      tier={4}
      headline={"Marketing, sales pipeline, and revenue optimization"}
      summary={"CerebroGrowth is the revenue-side application of the Intelligence Mesh. It unifies campaign, pipeline, and customer signal into one attributed model of how revenue is actually created, and lets agents act on it — routing leads, drafting sequences, and flagging at-risk deals under human approval."}
      panels={PANELS}
    />
  );
}
