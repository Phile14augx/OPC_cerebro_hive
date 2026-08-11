export type ResearchCategory = 
  | "papers"
  | "whitepapers"
  | "technical-reports"
  | "case-studies"
  | "reference-architectures"
  | "benchmarks"
  | "frameworks"
  | "engineering-guides"
  | "playbooks"
  | "research-notes"
  | "implementation-guides"
  | "videos"
  | "webinars"
  | "presentations";

export type ResearchDomain = 
  | "AI Foundations"
  | "Enterprise AI"
  | "Agentic AI"
  | "Knowledge Systems"
  | "LLMs"
  | "Computer Vision"
  | "Multimodal AI"
  | "Data Engineering"
  | "Software Engineering"
  | "Cloud & Infrastructure"
  | "Security"
  | "Governance"
  | "Optimization"
  | "Decision Intelligence"
  | "Robotics"
  | "Emerging AI";

export type DifficultyLevel = "Executive" | "Technical" | "Research";
export type PublicationStatus = "Published" | "Peer Review" | "Draft" | "Updated" | "Archived";

export interface Author {
  name: string;
  role: string;
  avatar?: string;
}

export interface Citation {
  apa: string;
  bibtex: string;
}

// Minimal placeholder for the React Flow blueprint layout
export interface ResearchArchitectureData {
  nodes: any[];
  edges: any[];
  figureNumber: string;
  version: string;
}

// Illustrative benchmark metrics structure
export interface BenchmarkMetric {
  name: string;
  score: number; // 0-100 percentage
}

export interface BenchmarkData {
  methodology: string;
  dataset: string;
  metrics: BenchmarkMetric[];
}

export interface ResearchPublication {
  id: string; // Used for unique keys
  slug: string;
  title: string;
  category: ResearchCategory;
  domain: ResearchDomain;
  publishDate: string; // ISO 8601 YYYY-MM-DD
  status: PublicationStatus;
  difficulty: DifficultyLevel;
  readingTimeMinutes: number;
  version?: string;
  
  abstract: string;
  executiveSummary?: string;
  authors: Author[];
  citations?: Citation;
  
  tags: string[];
  
  // Specific payload types depending on category
  architecture?: ResearchArchitectureData;
  benchmarkData?: BenchmarkData;
  
  // Mock Markdown body content
  content?: string; 
}
