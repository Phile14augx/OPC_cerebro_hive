import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroStudio™ — AI Development Workspace | CerebroHive",
  description:
    "The full IDE-style AI development workspace — build versioned prompts, configure agents, chain them into flows, prototype in cell-based notebooks, and attach datasets, all runnable end to end.",
  alternates: { canonical: "https://cerebropchive.org/platform/studio" },
  openGraph: {
    title: "CerebroStudio™ — AI Development Workspace | CerebroHive",
    description:
      "The full IDE-style AI development workspace — build versioned prompts, configure agents, chain them into flows, and prototype in cell-based notebooks.",
    url: "https://cerebropchive.org/platform/studio",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroStudio" }],
  },
};

export default function StudioHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
