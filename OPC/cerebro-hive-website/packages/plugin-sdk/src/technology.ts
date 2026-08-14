export type TechnologyCategory =
  | "frontend"
  | "backend"
  | "database"
  | "cache"
  | "vector-database"
  | "search"
  | "messaging"
  | "runtime"
  | "cloud"
  | "deployment"
  | "observability"
  | "security"
  | "testing"
  | "mobile"
  | "desktop"
  | "ai"
  | "infrastructure";

export type SupportTier = 1 | 2 | 3;

export interface TechnologyDefinition {
  id: string;
  name: string;
  category: TechnologyCategory;
  language?: string;
  version?: string;
  capabilities: string[];
  supportTier: SupportTier;
  generator?: {
    supported: boolean;
    templateId?: string;
  };
  runtime?: {
    supported: boolean;
    containerImage?: string;
  };
  deploymentTargets?: string[];
}

const TECHNOLOGIES: TechnologyDefinition[] = [
  { id: "react", name: "React", category: "frontend", language: "TypeScript", capabilities: ["spa", "vite"], supportTier: 1, generator: { supported: false, templateId: "react-vite" }, runtime: { supported: false } },
  { id: "nextjs", name: "Next.js", category: "frontend", language: "TypeScript", capabilities: ["ssr", "app-router"], supportTier: 1, generator: { supported: false, templateId: "nextjs" }, runtime: { supported: false } },
  { id: "angular", name: "Angular", category: "frontend", language: "TypeScript", capabilities: ["spa"], supportTier: 2, generator: { supported: false, templateId: "angular" } },
  { id: "vue", name: "Vue", category: "frontend", language: "TypeScript", capabilities: ["spa"], supportTier: 2, generator: { supported: false, templateId: "vue" } },
  { id: "sveltekit", name: "SvelteKit", category: "frontend", language: "TypeScript", capabilities: ["ssr"], supportTier: 2, generator: { supported: false, templateId: "sveltekit" } },
  { id: "spring-boot", name: "Spring Boot", category: "backend", language: "Java", version: "21+", capabilities: ["rest", "jpa"], supportTier: 1, generator: { supported: false, templateId: "spring-boot" }, runtime: { supported: false, containerImage: "eclipse-temurin:21-jre" } },
  { id: "fastify", name: "Fastify", category: "backend", language: "TypeScript", capabilities: ["rest"], supportTier: 1, generator: { supported: false, templateId: "fastify" }, runtime: { supported: false } },
  { id: "nestjs", name: "NestJS", category: "backend", language: "TypeScript", capabilities: ["rest"], supportTier: 1, generator: { supported: false, templateId: "nestjs" } },
  { id: "go-fiber", name: "Go Fiber", category: "backend", language: "Go", capabilities: ["rest"], supportTier: 1, generator: { supported: false, templateId: "go-fiber" }, runtime: { supported: false } },
  { id: "rust-axum", name: "Axum", category: "backend", language: "Rust", capabilities: ["rest"], supportTier: 1, generator: { supported: false, templateId: "rust-axum" }, runtime: { supported: false } },
  { id: "dotnet", name: ".NET", category: "backend", language: "C#", capabilities: ["rest"], supportTier: 1, generator: { supported: false, templateId: "dotnet" }, runtime: { supported: false } },
  { id: "fastapi", name: "FastAPI", category: "backend", language: "Python", capabilities: ["rest"], supportTier: 1, generator: { supported: false, templateId: "fastapi" }, runtime: { supported: false } },
  { id: "cpp-drogon", name: "Drogon", category: "backend", language: "C++", capabilities: ["rest"], supportTier: 2, generator: { supported: false, templateId: "cpp-drogon" }, runtime: { supported: false } },
  { id: "postgres", name: "PostgreSQL", category: "database", capabilities: ["relational", "sql"], supportTier: 1, runtime: { supported: true, containerImage: "postgres:16" } },
  { id: "redis", name: "Redis", category: "cache", capabilities: ["kv", "cache"], supportTier: 1, runtime: { supported: true, containerImage: "redis:7" } },
  { id: "mongodb", name: "MongoDB", category: "database", capabilities: ["document"], supportTier: 1, runtime: { supported: true, containerImage: "mongo:7" } },
  { id: "qdrant", name: "Qdrant", category: "vector-database", capabilities: ["vector-search"], supportTier: 1, runtime: { supported: true, containerImage: "qdrant/qdrant" } },
  { id: "neo4j", name: "Neo4j", category: "database", capabilities: ["graph"], supportTier: 2, runtime: { supported: true, containerImage: "neo4j:5" } },
  { id: "timescaledb", name: "TimescaleDB", category: "database", capabilities: ["time-series"], supportTier: 2 },
  { id: "opensearch", name: "OpenSearch", category: "search", capabilities: ["full-text"], supportTier: 2 },
  { id: "elasticsearch", name: "Elasticsearch", category: "search", capabilities: ["full-text"], supportTier: 2 },
  { id: "pinecone", name: "Pinecone", category: "vector-database", capabilities: ["vector-search"], supportTier: 3, runtime: { supported: false } },
  { id: "docker", name: "Docker", category: "deployment", capabilities: ["containerize"], supportTier: 1 },
  { id: "kubernetes", name: "Kubernetes", category: "deployment", capabilities: ["orchestrate"], supportTier: 3 },
  { id: "vercel", name: "Vercel", category: "cloud", capabilities: ["deploy"], supportTier: 3 },
];

export class TechnologyRegistry {
  constructor(private readonly technologies: TechnologyDefinition[] = TECHNOLOGIES) {}

  list(): TechnologyDefinition[] {
    return [...this.technologies];
  }

  get(id: string): TechnologyDefinition | undefined {
    return this.technologies.find((item) => item.id === id);
  }

  byCategory(category: TechnologyCategory): TechnologyDefinition[] {
    return this.technologies.filter((item) => item.category === category);
  }

  byTier(tier: SupportTier): TechnologyDefinition[] {
    return this.technologies.filter((item) => item.supportTier === tier);
  }
}

export const technologyRegistry = new TechnologyRegistry();
