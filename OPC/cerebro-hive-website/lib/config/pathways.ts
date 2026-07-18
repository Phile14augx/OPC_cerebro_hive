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
      { label: "Schedule Executive Strategy Session", href: "#", primary: true },
      { label: "Request AI Transformation Roadmap", href: "#" }
    ]
  },
  {
    id: "tech",
    role: "Technology Leaders",
    actions: [
      { label: "Review Reference Architectures", href: "#", primary: true },
      { label: "Explore Integration Framework", href: "#" }
    ]
  },
  {
    id: "eng",
    role: "Engineering Teams",
    actions: [
      { label: "Launch Developer Sandbox", href: "#", primary: true },
      { label: "View Technical Documentation", href: "#" }
    ]
  },
  {
    id: "decision",
    role: "Decision Makers",
    actions: [
      { label: "Calculate Business ROI", href: "#", primary: true },
      { label: "Assess AI Readiness", href: "#" }
    ]
  }
];
