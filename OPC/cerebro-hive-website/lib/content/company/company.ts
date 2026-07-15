export const visionMission = {
  sectionMetadata: {
    number: "03",
    label: "Enterprise Operating Philosophy",
    preamble: "The principles guiding every AI transformation."
  },
  
  // 1. PURPOSE (Why we exist)
  purpose: {
    headline: "Building Production AI, Not PowerPoint AI.",
    description: "We close the execution gap between an executive's AI vision and a working AI system in production.",
    evidence: {
      framework: [
        { id: "vision", label: "Executive Vision", details: ["Board Alignment", "Strategic Goals"] },
        { id: "strategy", label: "AI Strategy", details: ["Data Readiness", "ROI Mapping"] },
        { id: "engineering", label: "Engineering", details: ["Secure Architecture", "AI Agents", "MLOps", "Governance"] },
        { id: "deployment", label: "Deployment", details: ["Integration", "Change Management"] },
        { id: "value", label: "Business Value", details: ["Revenue Lift", "Cost Reduction"] }
      ]
    }
  },

  // 2. VISION (Where we are going)
  vision: {
    content: {
      headline: "Build the world's most trusted AI-native transformation company.",
      focusAreas: [
        "Enterprise AI",
        "Responsible AI",
        "Applied Research",
        "Platform Engineering"
      ],
      roadmap: [
        { year: "2026", milestone: "Foundation" },
        { year: "2027", milestone: "Platform Expansion" },
        { year: "2028", milestone: "Global Enterprise" },
        { year: "2030", milestone: "Industry Leadership" }
      ]
    },
    presentation: {
      theme: "blue",
      icon: "globe"
    }
  },

  // 3. MISSION (How we get there)
  mission: {
    content: {
      headline: "Make enterprise AI predictable, measurable, and profitable.",
      principles: [
        {
          id: "enterprise",
          title: "Enterprise",
          description: "Designed for regulated organizations.",
          hoverDescription: "Built for complex environments with stringent compliance, security, and integration requirements.",
          metric: "18 Industries",
          presentation: { theme: "emerald", icon: "building" }
        },
        {
          id: "predictable",
          title: "Predictable",
          description: "Repeatable delivery framework.",
          hoverDescription: "We eliminate R&D guesswork by deploying battle-tested architectures and standardized MLOps pipelines.",
          metric: "Zero Surprises",
          presentation: { theme: "blue", icon: "trending-up" }
        },
        {
          id: "measurable",
          title: "Measurable",
          description: "Every outcome quantified.",
          hoverDescription: "From latency and token costs to operational ROI, every metric is tracked in real-time.",
          metric: "Real-time ROI",
          presentation: { theme: "purple", icon: "bar-chart" }
        },
        {
          id: "profitable",
          title: "Profitable",
          description: "ROI-first transformation.",
          hoverDescription: "We prioritize use cases that drive immediate top-line revenue or massive bottom-line efficiency.",
          metric: "Business Value",
          presentation: { theme: "gold", icon: "coins" }
        }
      ]
    }
  },

  // 4. METRICS & OUTCOMES
  microMetrics: [
    { value: "18", label: "Industries" },
    { value: "12", label: "Countries" },
    { value: "150+", label: "Deployments" },
    { value: "24/7", label: "Operations" }
  ],
  
  expectedOutcome: {
    headline: "Expected Outcome",
    traits: [
      "Enterprise AI",
      "Predictable",
      "Measurable",
      "Governable",
      "Profitable"
    ]
  },

  // Legacy fallback
  pillars: [
    { title: "Outcome Driven", variant: "cyan" },
    { title: "Engineering First", variant: "green" },
    { title: "Governed by Design", variant: "blue" },
    { title: "Research Powered", variant: "purple" }
  ]
};