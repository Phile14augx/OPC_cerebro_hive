import { ResearchProgram } from "../types";

export const researchPrograms: ResearchProgram[] = [
  {
    id: "agent-architectures",
    slug: "agent-architectures",
    title: "Agent Architectures",
    summary: "Next-generation multi-agent design patterns.",
    hero: {
      title: "Agent Architectures",
      subtitle: "CerebroHive Labs",
      description: "Pioneering new topologies for autonomous swarms."
    },
    iconName: "Network",
    category: "Research",
    status: "production",
    tags: ["Agents", "Architecture"],
    feedsPlatformCapabilities: ["agentos", "agent-mesh"],
    publications: ["The Future of Swarm Intelligence"],
    experiments: ["Dynamic Topology Scaling"],
    openSourceProjects: ["OpenSwarm"]
  },
  {
    id: "ai-safety",
    slug: "ai-safety",
    title: "AI Safety",
    summary: "Alignment, robustness, and failure-mode research.",
    hero: {
      title: "AI Safety",
      subtitle: "CerebroHive Labs",
      description: "Ensuring enterprise AI systems remain secure, aligned, and predictable."
    },
    iconName: "Shield",
    category: "Research",
    status: "production",
    tags: ["Safety", "Alignment"],
    feedsPlatformCapabilities: ["guard"],
    publications: ["Enterprise Alignment Frameworks"],
    experiments: ["Adversarial Prompt Injection Testing"],
    openSourceProjects: ["SafePrompt"]
  },
  {
    id: "memory-systems",
    slug: "memory-systems",
    title: "Memory Systems",
    summary: "Advances feeding directly into Memory Fabric™.",
    hero: {
      title: "Memory Systems",
      subtitle: "CerebroHive Labs",
      description: "Next-generation episodic and semantic memory architectures."
    },
    iconName: "Database",
    category: "Research",
    status: "production",
    tags: ["Memory", "Vector"],
    feedsPlatformCapabilities: ["memory-fabric"],
    publications: ["Infinite Context Horizons"],
    experiments: ["Long-term Episodic Retrieval"],
    openSourceProjects: ["MemGraph"]
  },
  {
    id: "planning-algorithms",
    slug: "planning-algorithms",
    title: "Planning Algorithms",
    summary: "Feeds the Reasoning Engine™'s strategy library.",
    hero: {
      title: "Planning Algorithms",
      subtitle: "CerebroHive Labs",
      description: "Developing novel approaches to complex task decomposition."
    },
    iconName: "Brain",
    category: "Research",
    status: "production",
    tags: ["Planning", "Reasoning"],
    feedsPlatformCapabilities: ["reasoning-engine"],
    publications: ["Beyond Chain-of-Thought"],
    experiments: ["Tree-of-Thoughts Optimization"],
    openSourceProjects: []
  },
  {
    id: "enterprise-rag",
    slug: "enterprise-rag",
    title: "Enterprise RAG",
    summary: "Retrieval quality, grounding, and citation research.",
    hero: {
      title: "Enterprise RAG",
      subtitle: "CerebroHive Labs",
      description: "Pushing the boundaries of retrieval-augmented generation accuracy."
    },
    iconName: "Search",
    category: "Research",
    status: "production",
    tags: ["RAG", "Retrieval"],
    feedsPlatformCapabilities: ["knowledge-fabric", "eval"],
    publications: ["Zero-Hallucination Retrieval"],
    experiments: ["Citation Veracity Scoring"],
    openSourceProjects: []
  },
  {
    id: "knowledge-graphs",
    slug: "knowledge-graphs",
    title: "Knowledge Graphs",
    summary: "Feeds Knowledge Fabric™.",
    hero: {
      title: "Knowledge Graphs",
      subtitle: "CerebroHive Labs",
      description: "Automated ontology generation and graph extraction."
    },
    iconName: "Share2",
    category: "Research",
    status: "production",
    tags: ["Graphs", "Ontology"],
    feedsPlatformCapabilities: ["knowledge-fabric"],
    publications: ["Dynamic Ontology Mapping"],
    experiments: ["Unstructured to Graph Conversion"],
    openSourceProjects: []
  },
  {
    id: "digital-twins",
    slug: "digital-twins",
    title: "Digital Twins",
    summary: "Feeds Simulator™.",
    hero: {
      title: "Digital Twins",
      subtitle: "CerebroHive Labs",
      description: "Modeling entire enterprise ecosystems in silico."
    },
    iconName: "Box",
    category: "Research",
    status: "production",
    tags: ["Simulation", "Twins"],
    feedsPlatformCapabilities: ["simulator"],
    publications: ["Enterprise Simulation at Scale"],
    experiments: ["Supply Chain Shock Simulation"],
    openSourceProjects: []
  },
  {
    id: "multimodal-systems",
    slug: "multimodal-systems",
    title: "Multimodal Systems",
    summary: "Cross-modal reasoning and retrieval.",
    hero: {
      title: "Multimodal Systems",
      subtitle: "CerebroHive Labs",
      description: "Unifying text, vision, audio, and sensor data in reasoning pipelines."
    },
    iconName: "Image",
    category: "Research",
    status: "production",
    tags: ["Multimodal", "Vision"],
    feedsPlatformCapabilities: ["context-engine", "reasoning-engine"],
    publications: ["Cross-modal Entity Resolution"],
    experiments: ["Vision-language alignment"],
    openSourceProjects: []
  },
  {
    id: "robotics",
    slug: "robotics",
    title: "Robotics",
    summary: "Physical-world agent execution.",
    hero: {
      title: "Robotics",
      subtitle: "CerebroHive Labs",
      description: "Translating agentic reasoning into physical action."
    },
    iconName: "Cpu",
    category: "Research",
    status: "concept",
    tags: ["Robotics", "Physical"],
    feedsPlatformCapabilities: [],
    publications: [],
    experiments: ["Sim-to-Real Transfer"],
    openSourceProjects: []
  },
  {
    id: "edge-ai",
    slug: "edge-ai",
    title: "Edge AI",
    summary: "Low-latency, on-device inference and agents.",
    hero: {
      title: "Edge AI",
      subtitle: "CerebroHive Labs",
      description: "Deploying autonomous agents to resource-constrained edge environments."
    },
    iconName: "Smartphone",
    category: "Research",
    status: "development",
    tags: ["Edge", "Inference"],
    feedsPlatformCapabilities: ["agentos"],
    publications: [],
    experiments: ["Model Quantization for Edge"],
    openSourceProjects: []
  }
];

export const getResearchBySlug = (slug: string) => {
  return researchPrograms.find(r => r.slug === slug);
};
