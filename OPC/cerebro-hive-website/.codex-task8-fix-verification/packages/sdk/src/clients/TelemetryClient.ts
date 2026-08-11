import { BaseClient } from './BaseClient';

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

export class TelemetryClient extends BaseClient {
  constructor(baseUrl: string, headers?: Record<string, string>) {
    super(baseUrl, headers);
  }

  async getOverview(): Promise<TelemetryOverview> {
    const res = await this.fetchJson<{ success: boolean; data: TelemetryOverview }>('/api/v1/telemetry/overview');
    return res.data;
  }

  async listTraces(): Promise<TraceSummary[]> {
    const res = await this.fetchJson<{ success: boolean; data: TraceSummary[] }>('/api/v1/telemetry/traces');
    return res.data;
  }

  async getTraceDetails(traceId: string): Promise<TraceDetails> {
    const res = await this.fetchJson<{ success: boolean; data: TraceDetails }>(`/api/v1/telemetry/traces/${traceId}`);
    return res.data;
  }
}
