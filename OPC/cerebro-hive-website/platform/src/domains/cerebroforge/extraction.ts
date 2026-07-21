import { seededRandom } from "../simulator/simulator.js";

export interface ExtractedKnowledge {
  metadata: {
    title: string;
    authors: string[];
    published: string;
    venue: string;
    organization: string;
  };
  technical: {
    architecture: string;
    algorithms: string[];
    training_method: string;
    optimizer: string;
    attention: boolean;
    moe: boolean;
    rag: boolean;
    memory: boolean;
    planning: boolean;
    tool_use: boolean;
  };
  implementation: {
    github: string | null;
    framework: string;
    language: string;
    gpu: string;
    hardware: string;
    dataset: string;
    license: string;
  };
  business: {
    enterprise_usecase: string[];
    industry: string[];
    deployment: string;
    commercial_products: string[];
  };
  innovation: {
    novelty_score: number;
    breakthrough_area: string;
    limitations: string[];
    future_work: string[];
  };
  risk: {
    ethical: string;
    security: string;
    hallucination: string;
    privacy: string;
    bias: string;
  };
  ecosystem: string[];
}

export function extractKnowledge(text: string, title: string): ExtractedKnowledge {
  const seedStr = title + text.slice(0, 100);
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  let s = h;
  const rand = () => { s = Math.imul(1664525, s) + 1013904223 | 0; return (s >>> 0) / 4294967296; };

  const txt = text.toLowerCase();
  
  return {
    metadata: {
      title,
      authors: ["Dr. A. Scientist", "Dr. B. Engineer", "Dr. C. Researcher"],
      published: new Date().toISOString(),
      venue: rand() > 0.5 ? "arXiv" : "ICLR 2026",
      organization: txt.includes("google") ? "Google DeepMind" : txt.includes("meta") ? "Meta AI" : txt.includes("openai") ? "OpenAI" : "Independent Research Lab",
    },
    technical: {
      architecture: txt.includes("transformer") ? "Transformer" : txt.includes("diffusion") ? "Diffusion Model" : txt.includes("mamba") || txt.includes("ssm") ? "State Space Model (SSM)" : "Hybrid Neural Network",
      algorithms: ["AdamW", "FlashAttention", "Proximal Policy Optimization"].filter(() => rand() > 0.4),
      training_method: txt.includes("rlhf") ? "RLHF" : txt.includes("dpo") ? "DPO" : "Self-supervised pre-training",
      optimizer: "AdamW",
      attention: txt.includes("attention") || rand() > 0.2,
      moe: txt.includes("moe") || txt.includes("mixture") || rand() > 0.7,
      rag: txt.includes("rag") || txt.includes("retrieval") || rand() > 0.7,
      memory: txt.includes("memory") || rand() > 0.5,
      planning: txt.includes("planning") || txt.includes("agent") || rand() > 0.6,
      tool_use: txt.includes("tool") || txt.includes("function") || rand() > 0.5,
    },
    implementation: {
      github: rand() > 0.3 ? `https://github.com/org/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : null,
      framework: rand() > 0.5 ? "PyTorch" : "JAX",
      language: "Python",
      gpu: txt.includes("h100") ? "H100" : txt.includes("a100") ? "A100" : "H100",
      hardware: rand() > 0.5 ? "1x 8-GPU Node" : "128x GPU Cluster",
      dataset: rand() > 0.5 ? "FineWeb-Edu" : "Custom Proprietary Corpus",
      license: rand() > 0.5 ? "Apache 2.0" : "MIT",
    },
    business: {
      enterprise_usecase: ["Automated Customer Support", "Document Analysis", "Code Generation", "Predictive Analytics"].sort(() => rand() - 0.5).slice(0, 2),
      industry: ["Technology", "Financial Services", "Healthcare", "Retail"].sort(() => rand() - 0.5).slice(0, 2),
      deployment: rand() > 0.5 ? "Cloud Native (Kubernetes)" : "Serverless Edge",
      commercial_products: ["CerebroStudio", "Enterprise Copilot API"],
    },
    innovation: {
      novelty_score: Math.floor(60 + rand() * 40),
      breakthrough_area: "Context Window Efficiency",
      limitations: ["High memory footprint during inference", "Data contamination risks"],
      future_work: ["Scale to 10T parameters", "Improve multilinguality"],
    },
    risk: {
      ethical: "Moderate - Potential dual-use applications",
      security: txt.includes("jailbreak") ? "High - Vulnerable to prompt injection" : "Low - Standard mitigations apply",
      hallucination: "Moderate - Grounding required for factual queries",
      privacy: "Low - Trained on public data",
      bias: "Moderate - Inherits bias from web-scale pretraining",
    },
    ecosystem: ["HuggingFace", "LangChain", "vLLM"]
  };
}
