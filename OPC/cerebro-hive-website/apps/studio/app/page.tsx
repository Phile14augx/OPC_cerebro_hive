import type { Metadata } from "next";

import { OsHero } from "@/components/home/v4-os/OsHero";
import { PlatformArchitecture } from "@/components/home/v4-os/PlatformArchitecture";
import { EnterprisePlatformCTA } from "@/components/home/v4-os/EnterprisePlatformCTA";
import { ExecutiveMetrics } from "@/components/home/v4-os/ExecutiveMetrics";
import { LivingEnterpriseBrain } from "@/components/home/v4-os/LivingEnterpriseBrain";
import { EnterpriseTransformation } from "@/components/home/v4-os/EnterpriseTransformation";
import { IntegrationIntelligence } from "@/components/home/v4-os/IntegrationIntelligence";
import { KnowledgePlatform } from "@/components/home/v4-os/KnowledgePlatform";
import { EnterpriseSecurity } from "@/components/home/v4-os/EnterpriseSecurity";
import { ProofOfImpact } from "@/components/home/v4-os/ProofOfImpact";
import { EnterpriseJourney } from "@/components/home/v4-os/EnterpriseJourney";
import { ExecutiveDecisionPlatform } from "@/components/home/v4-os/ExecutiveDecisionPlatform";
import { HomeFaq } from "@/components/home/HomeFaq";

export const metadata: Metadata = {
  title: "CerebroHive — Enterprise AI Systems & Transformation",
  description:
    "CerebroHive architects enterprise AI systems — AI Strategy, Platform Engineering, AI Agents, RAG, Knowledge Engineering, AI Governance, and AI Education. Serving 16+ industries worldwide.",
  keywords: [
    "enterprise AI", "AI transformation", "AI consulting", "AI agents",
    "retrieval augmented generation", "RAG", "LLM", "MLOps", "AI governance",
    "HivePulse", "Cerebro X", "knowledge engineering", "AI platform",
    "AI strategy", "multi-agent systems", "MCP", "AI education",
  ],
  alternates: { canonical: "https://cerebropchive.org" },
  openGraph: {
    title: "CerebroHive — Enterprise AI Systems & Transformation",
    description: "Enterprise AI systems that transform how organizations operate, learn, and grow.",
    url: "https://cerebropchive.org",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroHive — Enterprise AI Systems" }],
  },
};

const homeSections = [
  { id: "hero", Component: OsHero },
  { id: "metrics", Component: ExecutiveMetrics },
  { id: "brain", Component: LivingEnterpriseBrain },
  { id: "architecture", Component: PlatformArchitecture },
  { id: "enterprise-platform-cta", Component: EnterprisePlatformCTA },
  { id: "transformation", Component: EnterpriseTransformation },
  { id: "intelligence", Component: IntegrationIntelligence },
  { id: "knowledge", Component: KnowledgePlatform },
  { id: "security", Component: EnterpriseSecurity },
  { id: "impact", Component: ProofOfImpact },
  { id: "journey", Component: EnterpriseJourney },
  { id: "decision", Component: ExecutiveDecisionPlatform },
];

export default function HomePage() {
  return (
    <>
      {homeSections.map(({ id, Component }) => (
        <Component key={id} />
      ))}
      <HomeFaq />
    </>
  );
}
