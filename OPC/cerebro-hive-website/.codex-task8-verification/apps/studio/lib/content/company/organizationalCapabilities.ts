export const organizationalCapabilities = {
  metadata: {
    section: "09",
    title: "Organizational Capabilities",
    version: "Corporate Handbook"
  },
  departments: [
    {
      id: "executive",
      theme: "gold",
      title: "Executive Leadership",
      subtitle: "Leading CerebroHive's strategic direction.",
      portrait: {
        name: "Philemon V Nath",
        role: "Founder & CEO",
        image: "/images/leadership/philemon.png"
      },
      philosophy: {
        quote: "Technology doesn't transform businesses. Disciplined execution does.",
        framework: [
          { label: "01", title: "Engineering First" },
          { label: "02", title: "Business Outcomes" },
          { label: "03", title: "Responsible AI" },
          { label: "04", title: "Long-term Partnerships" }
        ]
      },
      priorities: [
        "Enterprise AI",
        "Agentic Systems",
        "Platform Engineering",
        "Governance"
      ],
      commitments: [
        "Technical Honesty",
        "Executive Accountability",
        "Engineering Excellence",
        "Long-term Partnership"
      ]
    },
    {
      id: "engineering",
      theme: "cyan",
      title: "Engineering Organization",
      subtitle: "Building production-grade AI systems.",
      portrait: {
        name: "Marcus Thorne",
        role: "Chief Technology Officer",
        image: "/images/leadership/marcus.png"
      },
      philosophy: {
        quote: "Every deployment must be Observable, Secure, Scalable, and Maintainable.",
        framework: [
          { label: "01", title: "Discover" },
          { label: "02", title: "Architect" },
          { label: "03", title: "Engineer" },
          { label: "04", title: "Validate" },
          { label: "05", title: "Deploy" },
          { label: "06", title: "Optimize" }
        ]
      },
      priorities: [
        "Platform Architecture",
        "Agent Frameworks",
        "Observability",
        "Security",
        "Governance"
      ],
      metrics: [
        { label: "Production Ready", value: "SOC2", status: "success" },
        { label: "Observability", value: "100%", status: "success" },
        { label: "CI/CD", value: "Automated", status: "success" }
      ]
    },
    {
      id: "research",
      theme: "purple",
      title: "Research Labs",
      subtitle: "Exploring the future of enterprise intelligence.",
      portrait: {
        name: "Elena Rodriguez",
        role: "VP of Research & Labs",
        image: "/images/leadership/elena.png"
      },
      philosophy: {
        quote: "Innovation without validation is experimentation. Innovation with validation becomes enterprise capability.",
        framework: [
          { label: "01", title: "Explore" },
          { label: "02", title: "Experiment" },
          { label: "03", title: "Validate" },
          { label: "04", title: "Publish" }
        ]
      },
      priorities: [
        "Enterprise Agents",
        "Reasoning Systems",
        "Evaluation",
        "Responsible AI",
        "Model Optimization"
      ],
      metrics: [
        { label: "Evaluation Frameworks", value: "Active", status: "neutral" },
        { label: "Reference Architectures", value: "Deployed", status: "success" },
        { label: "Internal Experiments", value: "Ongoing", status: "warning" }
      ]
    }
  ]
};
