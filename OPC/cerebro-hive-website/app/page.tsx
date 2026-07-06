import HeroSection from "@/components/home/HeroSection";
import SocialProofBar from "@/components/home/SocialProofBar";
import ServicesOverview from "@/components/home/ServicesOverview";
import SolutionsGrid from "@/components/home/SolutionsGrid";
import CaseStudiesPreview from "@/components/home/CaseStudiesPreview";
import SolutionRecommenderTeaser from "@/components/home/SolutionRecommenderTeaser";
import FinalCTA from "@/components/home/FinalCTA";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroHive — Intelligence. Connection. Impact.",
  description:
    "CerebroHive helps organizations automate workflows, deploy AI solutions, and build AI-ready teams. AI Consulting, AI Automation, and AI Education.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProofBar />
      <ServicesOverview />
      <SolutionsGrid />
      <CaseStudiesPreview />
      <SolutionRecommenderTeaser />
      <FinalCTA />
    </>
  );
}
