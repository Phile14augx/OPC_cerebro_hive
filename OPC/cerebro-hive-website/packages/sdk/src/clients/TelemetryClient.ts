export interface TelemetryOverview {
  rpm: number;
  avgLatencyMs: number;
  avgTtftMs: number;
  totalCostUsd: number;
  errorRate: number;
  cacheHitRate: number;
}

export interface TraceSummary {
  id: string;
  traceId: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  durationMs: number;
  tokens: { prompt: number; completion: number; total: number };
  costUsd: number;
  model: string;
  provider: string;
}

export interface TraceSpan {
  id: string;
  parentId: string | null;
  name: string;
  service: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'ok' | 'error';
  attributes: Record<string, string | number | boolean>;
}

export interface TraceDetails {
  summary: TraceSummary;
  spans: TraceSpan[];
}

export class TelemetryClient {
  constructor(private baseUrl: string, private headers?: Record<string, string>) {}

  async getOverview(): Promise<TelemetryOverview> {
    return {
      rpm: 742,
      avgLatencyMs: 612,
      avgTtftMs: 240,
      totalCostUsd: 145.20,
      errorRate: 0.005,
      cacheHitRate: 0.18,
    };
  }

  async listTraces(): Promise<TraceSummary[]> {
    return [
      {
        id: 'req-101',
        traceId: 'tr-abc-123',
        timestamp: new Date().toISOString(),
        endpoint: '/v1/chat/completions',
        method: 'POST',
        status: 200,
        durationMs: 840,
        tokens: { prompt: 150, completion: 45, total: 195 },
        costUsd: 0.002,
        model: 'gpt-4o',
        provider: 'openai',
      },
      {
        id: 'req-102',
        traceId: 'tr-abc-124',
        timestamp: new Date(Date.now() - 5000).toISOString(),
        endpoint: '/v1/agents/execute',
        method: 'POST',
        status: 200,
        durationMs: 4200,
        tokens: { prompt: 1500, completion: 300, total: 1800 },
        costUsd: 0.015,
        model: 'claude-3-5-sonnet',
        provider: 'anthropic',
      }
    ];
  }

  async getTraceDetails(traceId: string): Promise<TraceDetails> {
    const now = Date.now();
    return {
      summary: {
        id: 'req-102',
        traceId,
        timestamp: new Date(now - 5000).toISOString(),
        endpoint: '/v1/agents/execute',
        method: 'POST',
        status: 200,
        durationMs: 4200,
        tokens: { prompt: 1500, completion: 300, total: 1800 },
        costUsd: 0.015,
        model: 'claude-3-5-sonnet',
        provider: 'anthropic',
      },
      spans: [
        { id: 's-1', parentId: null, name: 'HTTP POST /v1/agents/execute', service: 'api-gateway', startTime: new Date(now - 5000).toISOString(), endTime: new Date(now - 800).toISOString(), durationMs: 4200, status: 'ok', attributes: { 'http.status': 200 } },
        { id: 's-2', parentId: 's-1', name: 'Authentication', service: 'auth', startTime: new Date(now - 4990).toISOString(), endTime: new Date(now - 4970).toISOString(), durationMs: 20, status: 'ok', attributes: {} },
        { id: 's-3', parentId: 's-1', name: 'Agent Runtime', service: 'agent-engine', startTime: new Date(now - 4960).toISOString(), endTime: new Date(now - 810).toISOString(), durationMs: 4150, status: 'ok', attributes: {} },
        { id: 's-4', parentId: 's-3', name: 'Memory Retrieval', service: 'memory-engine', startTime: new Date(now - 4950).toISOString(), endTime: new Date(now - 4800).toISOString(), durationMs: 150, status: 'ok', attributes: { 'db.query': 'SELECT * FROM memories' } },
        { id: 's-5', parentId: 's-3', name: 'LLM Generation', service: 'llm-gateway', startTime: new Date(now - 4750).toISOString(), endTime: new Date(now - 1200).toISOString(), durationMs: 3550, status: 'ok', attributes: { 'llm.model': 'claude-3-5-sonnet', 'llm.ttft': 400 } },
        { id: 's-6', parentId: 's-3', name: 'Tool Execution', service: 'tool-registry', startTime: new Date(now - 1100).toISOString(), endTime: new Date(now - 850).toISOString(), durationMs: 250, status: 'ok', attributes: { 'tool.name': 'jira_search' } },
      ]
    };
  }
}
