import { Target, Zap, ShieldCheck, Handshake, Lightbulb, Scale } from "lucide-react";

export const coreValues = [
  { 
    id: "engineering-excellence", 
    metadata: "CORE PRINCIPLE 01",
    title: "Engineering Excellence", 
    statement: "Build production systems, not prototypes.",
    description: "We build for production, not for pilot. Our code is secure, scalable, and built to survive enterprise reality.", 
    icon: Zap, 
    color: "#00F57A", // Green
    pattern: "circuit",
    metrics: [
      { label: "Performance", value: "99.99%", sub: "Uptime" },
      { label: "Latency", value: "<12ms", sub: "P99" },
      { label: "Coverage", value: "100%", sub: "Tested" }
    ],
    bottomTag: "Production Ready"
  },
  { 
    id: "outcome-obsession", 
    metadata: "CORE PRINCIPLE 02",
    title: "Outcome Obsession", 
    statement: "Business value over model complexity.",
    description: "We measure success by business value delivered—revenue gained, cost removed, or risk reduced. Technology is just the lever.", 
    icon: Target, 
    color: "#00E5FF", // Cyan
    pattern: "bar-chart",
    metrics: [
      { label: "Revenue", value: "+28%", sub: "Avg Lift", type: "up" as const },
      { label: "Costs", value: "-18%", sub: "Avg Drop", type: "down" as const },
      { label: "Risk", value: "Low", sub: "Exposure", type: "down" as const }
    ],
    bottomTag: "Business First"
  },
  { 
    id: "intellectual-honesty", 
    metadata: "CORE PRINCIPLE 03",
    title: "Intellectual Honesty", 
    statement: "The truth about AI limitations.",
    description: "No hype, no vaporware. If a rule-based system is better, we will build that. We don't force AI where it doesn't belong.", 
    icon: ShieldCheck, 
    color: "#FF3366", // Red
    pattern: "geometric",
    metrics: [
      { label: "Transparency", value: "100%", sub: "Explainable" },
      { label: "Hype", value: "0%", sub: "Zero Tolerance" }
    ],
    bottomTag: "Radical Candor"
  },
  { 
    id: "client-partnership", 
    metadata: "CORE PRINCIPLE 04",
    title: "Client Partnership", 
    statement: "We don't throw models over the wall.",
    description: "We embed with our clients, transfer knowledge, and build internal capability. Your success is our only metric.", 
    icon: Handshake, 
    color: "#FFB000", // Orange
    pattern: "nodes",
    metrics: [
      { label: "Knowledge Transfer", value: "Full", sub: "IP Handoff" },
      { label: "Integration", value: "Deep", sub: "Embedded" }
    ],
    bottomTag: "Shared Success"
  },
  { 
    id: "continuous-innovation", 
    metadata: "CORE PRINCIPLE 05",
    title: "Continuous Innovation", 
    statement: "Filtering signal from noise.",
    description: "Our dedicated Labs division ensures we are always testing the edge, bringing only battle-tested research to our enterprise clients.", 
    icon: Lightbulb, 
    color: "#9D00FF", // Purple
    pattern: "particles",
    metrics: [
      { label: "R&D", value: "20%", sub: "Time Allocation" },
      { label: "Labs", value: "Active", sub: "Research" }
    ],
    bottomTag: "Future Proof"
  },
  { 
    id: "responsible-ai", 
    metadata: "CORE PRINCIPLE 06",
    title: "Responsible AI", 
    statement: "Governance by default, not afterthought.",
    description: "We embed governance, auditability, and bias mitigation into every architecture. Safety is a feature, not a bug.", 
    icon: Scale, 
    color: "#3B82F6", // Blue (Changed from duplicate Cyan)
    pattern: "shield-grid",
    metrics: [
      { label: "Bias", value: "Zero", sub: "Tolerance" },
      { label: "Audits", value: "Rigorous", sub: "Continuous" }
    ],
    bottomTag: "Ethical Core"
  }
];