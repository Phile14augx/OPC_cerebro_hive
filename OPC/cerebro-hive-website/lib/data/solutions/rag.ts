import { Solution } from "./types";

export const rag: Solution = {
  name: "Retrieval-Augmented Generation (RAG)",
  slug: "rag",
  category: "AI & Generative AI",
  color: "#00F57A",
  
  tagline: "Enterprise Knowledge Platform",
  implementationWeeks: "8–12 Weeks",
  readiness: "Enterprise Ready",
  difficulty: "Medium",
  deploymentModels: ["Cloud", "Virtual Private Cloud", "On-Premises"],
  roiLevel: "High",
  industries: ["Healthcare", "Finance", "Manufacturing", "Legal"],
  
  hero: {
    title: "Retrieval-Augmented Generation (RAG) for Enterprise Scale",
    subtitle: "AI & Generative AI",
    description: "Transform unstructured corporate data into actionable intelligence with high-precision, hallucination-free generation.",
    primaryCta: "Book Strategy Session",
    secondaryCta: "Download Architecture Guide"
  },
  
  overview: "Our Retrieval-Augmented Generation (RAG) solution replaces manual, fragmented knowledge retrieval with a secure, scalable, and intelligent system designed to deliver measurable business outcomes.",
  
  businessProblems: [
    { 
      problem: "Knowledge Silos", 
      impact: "Employees spend 20% of their time searching for internal information.",
      aiSolution: "Unified semantic search across all enterprise data sources."
    },
    { 
      problem: "Inaccurate Generative AI", 
      impact: "Off-the-shelf LLMs hallucinate and lack proprietary context.",
      aiSolution: "Grounds responses in your specific enterprise documents."
    },
    { 
      problem: "Compliance & Security", 
      impact: "Public LLMs risk exposing sensitive IP.",
      aiSolution: "Zero-trust boundaries with role-based access control (RBAC)."
    }
  ],
  
  pipeline: [
    { id: "docs", label: "Enterprise Documents", subLabels: ["PDFs", "Confluence", "SharePoint"] },
    { id: "ocr", label: "OCR & Extraction", subLabels: ["Tables", "Images", "Text"] },
    { id: "chunk", label: "Semantic Chunking", subLabels: ["Metadata Tagging"] },
    { id: "embed", label: "Embeddings Model", subLabels: ["High-Dimensional Vectors"] },
    { id: "vdb", label: "Vector Database", subLabels: ["ANN Search"] },
    { id: "llm", label: "Large Language Model", subLabels: ["Synthesized Answers"] },
    { id: "user", label: "Enterprise UI", subLabels: ["Chat", "Dashboards"] }
  ],
  
  workflowSteps: [
    { step: 1, name: "Connect Data", description: "Securely integrate with enterprise data silos." },
    { step: 2, name: "Process & Index", description: "Parse, chunk, and embed documents into a vector database." },
    { step: 3, name: "Retrieve Context", description: "Fetch highly relevant chunks based on user queries." },
    { step: 4, name: "Generate Response", description: "Synthesize answers using an LLM grounded in facts." },
    { step: 5, name: "Validate", description: "Provide citations and confidence scores for human verification." }
  ],
  
  capabilities: [
    { 
      name: "Semantic Search", 
      description: "Search by meaning rather than exact keywords.",
      benefits: ["Higher relevance", "Understands context", "Multi-lingual"],
      techUsed: ["Embeddings", "Vector DB"]
    },
    { 
      name: "Source Citation", 
      description: "Every generated answer links back to the exact source document.",
      benefits: ["Prevents hallucinations", "Builds trust", "Verifiable"],
      techUsed: ["LLM", "Metadata Tracking"]
    },
    { 
      name: "Role-Based Access", 
      description: "Users only get answers from documents they are authorized to see.",
      benefits: ["Security", "Compliance", "Privacy"],
      techUsed: ["IAM Integration", "Access Filtering"]
    }
  ],
  
  architecture: { nodes: [], edges: [] },
  workflows: { nodes: [], edges: [] },
  agents: [],
  
  techStack: [],
  techStackFlat: [
    { name: "OpenAI / Claude", role: "Foundational LLM" },
    { name: "Milvus / Pinecone", role: "Vector Database" },
    { name: "LangChain", role: "Orchestration Framework" },
    { name: "LlamaIndex", role: "Data Framework" },
    { name: "Kubernetes", role: "Container Orchestration" }
  ],
  
  roi: [
    { metric: "65%", label: "Faster Search", description: "Reduction in time spent searching for information." },
    { metric: "99.9%", label: "Accuracy", description: "Grounded in enterprise truth, eliminating hallucinations." },
    { metric: "3.2x", label: "ROI", description: "Average return on investment over 12 months." },
    { metric: "8 Wks", label: "Time to Value", description: "From kick-off to first production deployment." }
  ],
  
  timeline: [
    { phase: "Assessment & Architecture", week: "Weeks 1-2", description: "Data audit, security review, and system design." },
    { phase: "Data Pipeline", week: "Weeks 3-5", description: "Ingestion, chunking, and embedding setup." },
    { phase: "LLM Integration", week: "Weeks 6-7", description: "Prompt engineering, routing, and guardrails." },
    { phase: "Pilot & Go-Live", week: "Week 8", description: "User acceptance testing and production rollout." }
  ],
  
  deliverables: [
    "Reference Architecture Document",
    "Automated Data Pipelines",
    "Deployed Vector Database",
    "Enterprise Chat Interface",
    "Security & Compliance Audit"
  ],
  
  engagementModels: [
    "Proof of Concept (PoC)",
    "Production Implementation",
    "Managed RAG Service"
  ],
  
  securityFeatures: [
    "Data Encryption in Transit & Rest",
    "SOC2 / ISO27001 Compliant Architecture",
    "Zero-Data Retention with LLM Providers",
    "Document-Level Access Control"
  ],
  
  integrations: [
    "Microsoft SharePoint",
    "Confluence",
    "Google Workspace",
    "Salesforce",
    "ServiceNow"
  ],
  
  featuredCaseStudy: {
    industry: "Healthcare",
    title: "Clinical Knowledge Assistant",
    timeline: "10 Weeks",
    outcome: "Reduced time to find clinical guidelines, improving patient care speed.",
    metric: "68% Faster",
    description: "A major hospital network deployed our RAG solution across 12 facilities to give clinicians instant access to medical protocols.",
    savings: "$2.4M Annual Savings"
  },
  
  caseStudy: {
    industry: "Enterprise",
    title: "Transformation Initiative",
    timeline: "12 Weeks",
    outcome: "Significant process improvement.",
    metric: "40% Faster"
  },
  
  resources: []
};
