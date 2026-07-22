export type CareerDomain = {
  id: string;
  domain: string;
  description: string;
  impact: string;
  problems: string[];
  technologies: string[];
  hiringStatus: string;
  statusType: "hiring" | "new" | "internship" | "leadership";
  openRoles: number;
  seniority: string;
  location: string;
  theme: "cyan" | "purple" | "blue" | "teal" | "orange";
  iconName: string;
  careerPath: string[];
};

export const careerDomains: CareerDomain[] = [
  {
    id: "ai-systems",
    domain: "AI Systems & Agents",
    description: "Building production-grade AI agents and enterprise intelligence architectures.",
    impact: "You'll build production AI systems that automate complex enterprise workflows across finance, healthcare, and manufacturing. No more prototypes—we ship resilient agents.",
    problems: [
      "Multi-agent orchestration",
      "LLM evaluation frameworks",
      "Retrieval-Augmented Generation at scale",
      "Secure model deployments"
    ],
    technologies: ["Python", "Rust", "PyTorch", "LangChain", "vLLM"],
    hiringStatus: "Actively Hiring",
    statusType: "hiring",
    openRoles: 5,
    seniority: "Mid / Senior / Staff",
    location: "Bangalore / Remote",
    theme: "cyan",
    iconName: "Network",
    careerPath: ["AI Engineer", "Senior AI Engineer", "Staff Engineer", "Principal AI Architect"]
  },
  {
    id: "research",
    domain: "Applied AI Research",
    description: "Pushing the boundaries of multimodal models and reasoning capabilities.",
    impact: "You'll bridge the gap between academic breakthroughs and enterprise reality. Your research will directly power the foundational models our clients rely on.",
    problems: [
      "Multimodal reasoning",
      "Model fine-tuning and quantization",
      "Reinforcement Learning from Human Feedback (RLHF)",
      "Explainable AI (XAI)"
    ],
    technologies: ["JAX", "CUDA", "TensorFlow", "HuggingFace"],
    hiringStatus: "New Fellowships",
    statusType: "new",
    openRoles: 3,
    seniority: "PhD / Research Fellow",
    location: "Global Remote",
    theme: "purple",
    iconName: "Atom",
    careerPath: ["Research Intern", "Research Scientist", "Senior Researcher", "Head of Labs"]
  },
  {
    id: "engineering",
    domain: "Core Engineering",
    description: "Architecting the distributed backends that support high-throughput AI operations.",
    impact: "You'll design zero-downtime, globally distributed systems capable of handling millions of inference requests with sub-second latency.",
    problems: [
      "High-concurrency API gateways",
      "Real-time data streaming",
      "Distributed caching",
      "Vector database optimization"
    ],
    technologies: ["Go", "Node.js", "PostgreSQL", "Redis", "Kafka"],
    hiringStatus: "Actively Hiring",
    statusType: "hiring",
    openRoles: 8,
    seniority: "Junior / Mid / Senior",
    location: "Bangalore / Hybrid",
    theme: "blue",
    iconName: "Cpu",
    careerPath: ["Software Engineer", "Senior Engineer", "Tech Lead", "Engineering Director"]
  },
  {
    id: "cloud-platform",
    domain: "Cloud Platform & DevOps",
    description: "Ensuring secure, scalable, and observable infrastructure for enterprise workloads.",
    impact: "You'll build the paved roads that allow our engineers and AI systems to deploy securely across AWS, Azure, and on-premise environments.",
    problems: [
      "GPU cluster orchestration",
      "Zero-trust security models",
      "Automated CI/CD pipelines",
      "Global observability"
    ],
    technologies: ["Kubernetes", "Terraform", "AWS", "Datadog", "Docker"],
    hiringStatus: "Leadership Hiring",
    statusType: "leadership",
    openRoles: 2,
    seniority: "Staff / Principal",
    location: "USA / Remote",
    theme: "teal",
    iconName: "Cloud",
    careerPath: ["Platform Engineer", "Senior DevOps Engineer", "Principal Architect", "VP of Engineering"]
  },
  {
    id: "design",
    domain: "Design & Experience",
    description: "Crafting intuitive, human-centric interfaces for complex intelligent systems.",
    impact: "You'll define how humans interact with non-deterministic systems. You'll make complex AI capabilities feel invisible, natural, and trustworthy.",
    problems: [
      "Agentic UI/UX patterns",
      "Data visualization",
      "Design systems for scale",
      "Accessibility in AI tooling"
    ],
    technologies: ["Figma", "React", "Framer Motion", "Tailwind CSS"],
    hiringStatus: "Internship Program",
    statusType: "internship",
    openRoles: 4,
    seniority: "Intern / Junior",
    location: "London / Hybrid",
    theme: "orange",
    iconName: "LayoutGrid",
    careerPath: ["Design Intern", "Product Designer", "Senior Designer", "Design Director"]
  }
];