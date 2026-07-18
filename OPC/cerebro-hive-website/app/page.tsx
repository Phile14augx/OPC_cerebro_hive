import type { Metadata } from "next";

import { OsHero } from "@/components/home/v4-os/OsHero";
import { PlatformArchitecture } from "@/components/home/v4-os/PlatformArchitecture";
import { ExecutiveMetrics } from "@/components/home/v4-os/ExecutiveMetrics";
import { LivingEnterpriseBrain } from "@/components/home/v4-os/LivingEnterpriseBrain";

import { EnterpriseTransformation } from "@/components/home/v4-os/EnterpriseTransformation";
import { IntegrationIntelligence } from "@/components/home/v4-os/IntegrationIntelligence";
import { KnowledgePlatform } from "@/components/home/v4-os/KnowledgePlatform";

import { EnterpriseSecurity } from "@/components/home/v4-os/EnterpriseSecurity";
import { ProofOfImpact } from "@/components/home/v4-os/ProofOfImpact";

import { EnterpriseJourney } from "@/components/home/v4-os/EnterpriseJourney";
import { ExecutiveDecisionPlatform } from "@/components/home/v4-os/ExecutiveDecisionPlatform";

export const metadata: Metadata = {
  title: "CerebroHive — The Enterprise AI Operating System",
  description:
    "We architect enterprise AI systems, build production software, deploy intelligent agents, and transform businesses through AI-native engineering.",
};

// --- Homepage Configuration Engine ---
// Drives the rendering order of the homepage dynamically.
const homeSections = [
  // Phase 1
  { id: "hero", Component: OsHero },
  { id: "metrics", Component: ExecutiveMetrics },
  { id: "brain", Component: LivingEnterpriseBrain },
  { id: "architecture", Component: PlatformArchitecture },
  
  // Phase 2
  { id: "transformation", Component: EnterpriseTransformation },
  { id: "intelligence", Component: IntegrationIntelligence },
  { id: "knowledge", Component: KnowledgePlatform },
  
  // Phase 3
  { id: "security", Component: EnterpriseSecurity },
  { id: "impact", Component: ProofOfImpact },
  
  // Phase 4
  { id: "journey", Component: EnterpriseJourney },
  { id: "decision", Component: ExecutiveDecisionPlatform },
];

export default function HomePage() {
  return (
    <>
      {homeSections.map(({ id, Component }) => (
        <Component key={id} />
      ))}
    </>
  );
}
