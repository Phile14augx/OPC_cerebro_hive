export interface ExecutivePathway {
  id: string;
  role: "Executives" | "Technology Leaders" | "Engineering Teams" | "Decision Makers";
  actions: {
    label: string;
    href: string;
    primary?: boolean;
  }[];
}

export const executivePathways: ExecutivePathway[] = [
  {
    id: "exec",
    role: "Executives",
    actions: [
      { label: "Schedule Executive Strategy Session", href: "/contact", primary: true },
      { label: "Request AI Transformation Roadmap", href: "/tools/solution-finder" }
    ]
  },
  {
    id: "tech",
    role: "Technology Leaders",
    actions: [
      { label: "Review Reference Architectures", href: "/developers/architecture", primary: true },
      { label: "Explore Integration Framework", href: "/developers/api" }
    ]
  },
  {
    id: "eng",
    role: "Engineering Teams",
    actions: [
      { label: "Launch Developer Sandbox", href: "/platform/live-runtime", primary: true },
      { label: "View Technical Documentation", href: "/developers" }
    ]
  },
  {
    id: "decision",
    role: "Decision Makers",
    actions: [
      { label: "Calculate Business ROI", href: "/tools/solution-finder", primary: true },
      { label: "Assess AI Readiness", href: "/tools/ai-readiness" }
    ]
  }
];
