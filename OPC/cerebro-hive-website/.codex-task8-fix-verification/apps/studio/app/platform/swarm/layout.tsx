import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroSwarm™ — Enterprise Cognitive Workforce | CerebroHive",
  description:
    "Nine named domain-expert agents — CEO, Strategy, Enterprise Architect, Project Planner, Research, Cloud, and more — coordinate as an executive council before work is built.",
  alternates: { canonical: "https://cerebropchive.org/platform/swarm" },
  openGraph: {
    title: "CerebroSwarm™ — Enterprise Cognitive Workforce | CerebroHive",
    description:
      "Nine named domain-expert agents coordinate as an executive council — CEO, Strategy, Enterprise Architect, Project Planner, Research, Cloud, and more.",
    url: "https://cerebropchive.org/platform/swarm",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroSwarm" }],
  },
};

export default function SwarmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
