// =============================================================================
// CerebroForge™ — typed API client for forge-api service
// =============================================================================
import type { ForgePlan, ForgeRequirements, ForgeArchitecture } from '@cerebro/workflow';

const BASE = process.env.NEXT_PUBLIC_FORGE_API_URL ?? 'http://localhost:4005';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`forge-api ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Project types ────────────────────────────────────────────────────────────

export interface ForgeProject {
  id: string;
  name: string;
  prompt?: string | null;
  forgeStatus: string;
  forgePhase: string;
  frameworks: string[];
  totalModules: number;
  totalStories: number;
  totalApis: number;
  activeAgents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ForgeProjectDetail extends ForgeProject {
  modules: ForgeModule[];
  requirements: ForgeRequirement[];
  agentRuns: ForgeAgentRun[];
  artifacts: ForgeArtifact[];
}

export interface ForgeModule {
  id: string;
  name: string;
  description?: string | null;
  priority: string;
  storyCount: number;
  apiCount: number;
  status: string;
}

export interface ForgeRequirement {
  id: string;
  title: string;
  type: string;
  priority: string;
}

export interface ForgeAgentRun {
  id: string;
  agentType: string;
  phase: string;
  status: string;
  durationMs?: number | null;
  tokensIn: number;
  tokensOut: number;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface ForgeArtifact {
  id: string;
  filePath?: string | null;
  language?: string | null;
  lineCount: number;
  status: string;
  agentType?: string | null;
}

// ─── Testing types ────────────────────────────────────────────────────────────

export interface TestCase {
  name: string;
  status: 'passed' | 'failed' | 'pending';
  error?: string;
  file?: string;
}

export interface TestSuite {
  name: string;
  framework: string;
  totalTests: number;
  passingTests: number;
  failingTests: number;
  coverage: number;
  status: 'pending' | 'running' | 'passed' | 'failed';
  tests?: TestCase[];
}

export interface TestingResult {
  testSuites: TestSuite[];
  securityFindings: string[];
  overallCoverage: number;
  totalTests: number;
  passingTests: number;
}

// ─── Deploy types ─────────────────────────────────────────────────────────────

export interface DeploymentArtifact {
  type: 'dockerfile' | 'kubernetes' | 'terraform' | 'helm' | 'ci_pipeline';
  name: string;
  filePath: string;
  content: string;
}

export interface CIPipelineStep {
  stage: string;
  step: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  estimatedTime?: string;
}

export interface DeploymentResult {
  deploymentArtifacts: DeploymentArtifact[];
  ciPipelineSteps: CIPipelineStep[];
  infrastructureTargets: string[];
  environment: string;
}

// ─── Review types ─────────────────────────────────────────────────────────────

export interface ReviewFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface ReviewResult {
  overallScore: number;
  grade: string;
  categories: Record<string, number>;
  findings: ReviewFinding[];
  autoFixableCount: number;
}

// ─── Docs types ───────────────────────────────────────────────────────────────

export interface DocSection {
  type: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface DocsResult {
  sections: DocSection[];
  totalWordCount: number;
}

// ─── SSE codegen event ────────────────────────────────────────────────────────

export type CodegenEventType = 'agent_start' | 'chunk' | 'file_complete' | 'phase_complete' | 'error' | 'done';

export interface CodegenEvent {
  type: CodegenEventType;
  agentType?: string;
  filePath?: string;
  chunk?: string;
  error?: string;
}

// ─── Projects ────────────────────────────────────────────────────────────────

export const forgeApi = {
  projects: {
    list: (organizationId?: string) =>
      request<ForgeProject[]>(`/forge/projects${organizationId ? `?organizationId=${organizationId}` : ''}`),

    get: (id: string) => request<ForgeProjectDetail>(`/forge/projects/${id}`),

    create: (body: { name: string; prompt?: string; frameworks?: string[] }) =>
      request<ForgeProject>('/forge/projects', { method: 'POST', body: JSON.stringify(body) }),

    delete: (id: string) => request<ForgeProject>(`/forge/projects/${id}`, { method: 'DELETE' }),
  },

  // ─── AI agent endpoints ─────────────────────────────────────────────────

  planner: {
    run: (id: string, prompt: string) =>
      request<ForgePlan>(`/forge/projects/${id}/plan`, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }),
  },

  requirements: {
    generate: (id: string) =>
      request<ForgeRequirements>(`/forge/projects/${id}/requirements`, { method: 'POST' }),
  },

  architect: {
    design: (id: string) =>
      request<ForgeArchitecture>(`/forge/projects/${id}/architecture`, { method: 'POST' }),
  },

  testing: {
    generate: (id: string) =>
      request<TestingResult>(`/forge/projects/${id}/testing`, { method: 'POST' }),
  },

  deploy: {
    generate: (id: string, environment = 'production') =>
      request<DeploymentResult>(`/forge/projects/${id}/deploy?environment=${environment}`, { method: 'POST' }),
  },

  review: {
    run: (id: string) =>
      request<ReviewResult>(`/forge/projects/${id}/review`, { method: 'POST' }),
  },

  docs: {
    generate: (id: string) =>
      request<DocsResult>(`/forge/projects/${id}/docs`, { method: 'POST' }),
  },

  // ─── Streaming codegen ──────────────────────────────────────────────────

  codegen: {
    /**
     * Start code generation and stream SSE events.
     * @param id project ID
     * @param onEvent callback called for each parsed event
     * @returns cleanup function (aborts the stream)
     */
    start(id: string, onEvent: (e: CodegenEvent) => void): () => void {
      const controller = new AbortController();

      (async () => {
        const res = await fetch(`${BASE}/forge/projects/${id}/codegen/start`, {
          method: 'POST',
          signal: controller.signal,
        });
        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event: CodegenEvent = JSON.parse(line.slice(6));
                onEvent(event);
              } catch {
                // ignore malformed lines
              }
            }
          }
        }
      })().catch(() => {/* stream ended or aborted */});

      return () => controller.abort();
    },
  },
};
