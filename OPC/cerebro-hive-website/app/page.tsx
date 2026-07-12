import HeroSection from "@/components/home/v2/HeroSection";
import TrustBar from "@/components/home/v2/TrustBar";
import WhyCerebroHive from "@/components/home/v2/WhyCerebroHive";
import Services from "@/components/home/v2/Services";
import Industries from "@/components/home/v2/Industries";
import AIAgentShowcase from "@/components/home/v2/AIAgentShowcase";
import ArchitectureSection from "@/components/home/v2/ArchitectureSection";
import ResearchSection from "@/components/home/v2/ResearchSection";
import CaseStudies from "@/components/home/v2/CaseStudies";
import TechStack from "@/components/home/v2/TechStack";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroHive — Engineering the Next Generation",
  description:
    "We architect enterprise AI systems, build production software, deploy intelligent agents, and transform businesses through AI-native engineering.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <WhyCerebroHive />
      <Services />
      <Industries />
      <AIAgentShowcase />
      <ArchitectureSection />
      <ResearchSection />
      <CaseStudies />
      <TechStack />
    </>
  );
}
