import type { PluginMetadata } from "./Plugin";
import type { TechnologyDefinition } from "./technology";

export interface ConnectionResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

export interface DatabaseSchema {
  provider: string;
  objects: Array<{ name: string; kind: string; metadata?: Record<string, unknown> }>;
}

export interface QueryRequest {
  statement: string;
  readOnly: boolean;
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
}

export interface DatabaseConnection {
  id: string;
  provider: string;
  config: Record<string, unknown>;
}

export interface DatabaseProvider {
  id: string;
  testConnection(config: DatabaseConnection): Promise<ConnectionResult>;
  introspect(config: DatabaseConnection): Promise<DatabaseSchema>;
  execute(config: DatabaseConnection, query: QueryRequest): Promise<QueryResult>;
}

export interface GeneratorAdapter {
  id: string;
  technologyIds: string[];
  generate(spec: unknown): Promise<{ files: Array<{ path: string; contents: string }> }>;
}

export interface RuntimeAdapter {
  id: string;
  technologyIds: string[];
  start(projectPath: string): Promise<{ jobId: string }>;
}

export interface DeploymentAdapter {
  id: string;
  target: string;
  requiresCredentials: boolean;
  deploy(projectPath: string): Promise<{ jobId: string }>;
}

export interface TestAdapter {
  id: string;
  command: string;
  run(projectPath: string): Promise<{ jobId: string }>;
}

export interface PluginManifest {
  metadata: PluginMetadata;
  technologies?: TechnologyDefinition[];
}

export interface CerebroCapabilityPlugin {
  manifest: PluginManifest;
  generators?: GeneratorAdapter[];
  runtimes?: RuntimeAdapter[];
  databases?: DatabaseProvider[];
  deployers?: DeploymentAdapter[];
  testers?: TestAdapter[];
}
