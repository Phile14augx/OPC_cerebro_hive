import type { Metadata } from "next";

import { ProductPage, type ProductPanel } from "@/components/platform/ProductPage";

export const metadata: Metadata = {
  title: "HiveExchange — CerebroHive Platform",
  description: "HiveExchange is the CerebroHive marketplace for agents, models, workflows, connectors, and industry packs — every listing signed, scanned, and version-pinned.",
};

const PANELS: ProductPanel[] = [
    {
      title: "Listing categories",
      description: "The ten artifact families the exchange carries.",
      items: [
        "Agents — packaged, versioned autonomous workers",
        "Models — fine-tunes, adapters, and routing profiles",
        "Workflows — CerebroFlow pipeline definitions",
        "Templates — starter configurations per persona",
        "Connectors — authenticated system integrations",
        "Industry Packs — vertical ontologies and controls",
        "Datasets — governed, licence-tagged corpora",
        "Extensions — HiveForge plugins and custom tools",
        "Prompt Libraries — evaluated, version-controlled prompts",
        "Automation Packs — bundled multi-product playbooks",
      ],
    },
    {
      title: "Publisher lifecycle",
      description: "How an artifact reaches general availability.",
      items: [
        "Submit — manifest, semver, and licence declaration",
        "Scan — HiveShield static, dependency, and red-team checks",
        "Evaluate — HiveEvaluation scorecard against golden tasks",
        "Certify — signed provenance attestation attached",
        "List — published with tier and pricing metadata",
        "Monitor — post-publish telemetry and revocation hooks",
      ],
    },
    {
      title: "Consumer safeguards",
      description: "What a tenant gets on every install.",
      items: [
        "Signature and provenance verified before install",
        "Capability grants scoped through HiveIdentity",
        "Policy pre-flight against tenant HiveGovern rules",
        "Rollback to any previously installed version",
        "Per-artifact usage and cost attribution",
      ],
    },
    {
      title: "Monetization",
      description: "Revenue mechanics for publishers.",
      items: [
        "Revenue share settled through HiveBilling",
        "Usage-based, seat-based, and flat-rate pricing models",
        "Private listings scoped to named tenants",
        "Trial entitlements enforced by HiveLicense",
      ],
    },
];

export default function Page() {
  return (
    <ProductPage
      name={"HiveExchange™"}
      tier={5}
      headline={"The CerebroHive marketplace — agents, models, workflows, and connectors"}
      summary={"HiveExchange is the ecosystem layer defined in the constitution: a certified catalogue where internal teams and third-party developers publish, discover, and monetize the building blocks of the Intelligence Mesh. Every listing is signed, version-pinned, and scanned against HiveShield policy before it can be installed into a tenant."}
      panels={PANELS}
    />
  );
}
