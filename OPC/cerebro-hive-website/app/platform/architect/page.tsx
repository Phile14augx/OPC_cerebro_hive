import type { Metadata } from "next";

import { ProductPage, type ProductPanel } from "@/components/platform/ProductPage";

export const metadata: Metadata = {
  title: "CerebroArchitect — CerebroHive Platform",
  description: "CerebroArchitect reads your live service topology to propose reference architectures, draft ADRs, and flag designs that violate CerebroHive platform standards.",
};

const PANELS: ProductPanel[] = [
    {
      title: "Estate awareness",
      description: "Design grounded in the real system.",
      items: [
        "Live service and dependency topology",
        "Data-flow mapping with classification labels",
        "Trust and tenancy boundary visualisation",
        "Drift detection between documented and actual architecture",
      ],
    },
    {
      title: "Design assistance",
      description: "What the assistant produces.",
      items: [
        "Reference architectures matched to the requirement",
        "Trade-off analysis across candidate designs",
        "ADR drafts with context, decision, and consequences",
        "Migration sequencing with dependency ordering",
      ],
    },
    {
      title: "Standards enforcement",
      description: "Catching violations at design time, not review time.",
      items: [
        "Checks a proposed design against the Required Standards",
        "Flags capability overlap against the Capability Matrix",
        "Validates placement in the Enterprise Layer Architecture",
        "Verifies the Product Dependency Graph is respected",
      ],
    },
    {
      title: "Review workflow",
      description: "Keeping humans the decision-makers.",
      items: [
        "Proposals routed to named architecture reviewers",
        "Comment threads retained against each decision",
        "Approved ADRs published to the documentation set",
        "Superseded decisions linked rather than deleted",
      ],
    },
];

export default function Page() {
  return (
    <ProductPage
      name={"CerebroArchitect™"}
      tier={4}
      headline={"Enterprise system design and architecture assistant"}
      summary={"CerebroArchitect is the design counterpart to HiveForge. It reads the estate as it actually exists — services, dependencies, data flows, and policy boundaries — and helps architects reason about change: proposing reference architectures, drafting ADRs, and flagging where a proposed design would violate the platform standards."}
      panels={PANELS}
    />
  );
}
