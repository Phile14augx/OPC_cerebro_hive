import HomeHero from "@/components/home/v3/HomeHero";
import EnterpriseDashboard from "@/components/home/v3/EnterpriseDashboard";
import BusinessChallenges from "@/components/home/v3/BusinessChallenges";
import EnterpriseSimulator from "@/components/home/v3/EnterpriseSimulator";
import LivingDigitalTwin from "@/components/home/v3/LivingDigitalTwin";
import LivingArchitecture from "@/components/home/v3/LivingArchitecture";
import IntegratedPlatform from "@/components/home/v3/IntegratedPlatform";
import ResearchHighlights from "@/components/home/v3/ResearchHighlights";
import HumanProof from "@/components/home/v3/HumanProof";
import EnterpriseReadiness from "@/components/home/v3/EnterpriseReadiness";
import TransformationRoadmap from "@/components/home/v3/TransformationRoadmap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroHive — The Enterprise AI Operating System",
  description:
    "We architect enterprise AI systems, build production software, deploy intelligent agents, and transform businesses through AI-native engineering.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <EnterpriseDashboard />
      <BusinessChallenges />
      <EnterpriseSimulator />
      <LivingDigitalTwin />
      <LivingArchitecture />
      <IntegratedPlatform />
      <ResearchHighlights />
      <HumanProof />
      <EnterpriseReadiness />
      <TransformationRoadmap />
    </>
  );
}
