import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CerebroCopilot™ | CerebroHive Platform",
  description:
    "A conversational assistant grounded in your platform's live state. CerebroCopilot answers questions strictly from the Context Engine and Intelligence Hub — no hallucinated answers.",
  alternates: { canonical: "https://cerebropchive.org/platform/copilot" },
  openGraph: {
    title: "CerebroCopilot™ | CerebroHive Platform",
    description: "A conversational assistant grounded in your platform's live state.",
    url: "https://cerebropchive.org/platform/copilot",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CerebroCopilot" }],
  },
};

export default function CopilotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
