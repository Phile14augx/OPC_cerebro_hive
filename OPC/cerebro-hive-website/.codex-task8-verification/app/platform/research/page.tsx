import type { Metadata } from "next";

import { ProductPage, type ProductPanel } from "@/components/platform/ProductPage";

export const metadata: Metadata = {
  title: "CerebroResearch — CerebroHive Platform",
  description: "CerebroResearch runs deep research with graded sources and inline citations on every claim, feeding findings into the enterprise knowledge graph.",
};

const PANELS: ProductPanel[] = [
    {
      title: "Research loop",
      description: "The cycle the agent executes.",
      items: [
        "Decompose the brief into answerable sub-questions",
        "Gather across HiveKnowledge and approved external sources",
        "Grade each source for authority, recency, and independence",
        "Synthesise with inline citation on every claim",
        "Critique its own draft and re-open weak conclusions",
      ],
    },
    {
      title: "Source discipline",
      description: "How trust is assigned rather than assumed.",
      items: [
        "Provenance recorded for every retrieved passage",
        "Primary sources preferred and marked as such",
        "Conflicting evidence surfaced, not silently resolved",
        "Confidence stated per finding, not per report",
        "Unverifiable claims labelled rather than dropped",
      ],
    },
    {
      title: "Outputs",
      description: "What the product produces.",
      items: [
        "Cited briefings with an executive summary",
        "Comparative landscape and vendor matrices",
        "Trend-detection digests on a schedule",
        "Evidence packs exportable to CerebroArchive",
      ],
    },
    {
      title: "Feeding the innovation loop",
      description: "Research as an input to the roadmap.",
      items: [
        "Trend signals routed to CerebroArchitect",
        "Findings promoted into the enterprise knowledge graph",
        "Open questions tracked until they are closed",
        "Re-run on a cadence to detect what has changed",
      ],
    },
];

export default function Page() {
  return (
    <ProductPage
      name={"CerebroResearch™"}
      tier={4}
      headline={"Deep intelligence gathering and synthesis with graded sources"}
      summary={"CerebroResearch runs long-horizon research the way an analyst would: decompose the question, gather from internal and external corpora, grade each source, and synthesise a briefing where every claim carries a citation. Findings feed the Innovation Lifecycle rather than sitting in a document nobody re-reads."}
      panels={PANELS}
    />
  );
}
