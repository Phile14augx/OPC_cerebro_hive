import { Injectable } from '@nestjs/common';

export interface Span {
  traceId: string;
  modelId: string;
  latencyMs: number;
  timestamp: Date;
}

export interface HallucinationFeedback {
  modelId: string;
  traceId: string;
  hallucinated: boolean;
}

@Injectable()
export class TelemetryService {
  public spans: Span[] = [];
  public feedback: HallucinationFeedback[] = [];

  async ingestTraces(payload: any): Promise<void> {
    if (payload && Array.isArray(payload.spans)) {
      for (const span of payload.spans) {
        this.spans.push({
          traceId: span.traceId,
          modelId: span.modelId,
          latencyMs: span.latencyMs,
          timestamp: new Date(span.timestamp || Date.now())
        });
      }
    } else if (payload && payload.modelId && payload.latencyMs) {
      this.spans.push({
        traceId: payload.traceId || 'unknown',
        modelId: payload.modelId,
        latencyMs: payload.latencyMs,
        timestamp: new Date(payload.timestamp || Date.now())
      });
    }
  }

  async hallucinationFeedback(payload: HallucinationFeedback): Promise<void> {
    this.feedback.push(payload);
  }

  async getMetrics(modelId: string, timeWindowMs: number = 3600000): Promise<any> {
    const now = Date.now();
    const relevantSpans = this.spans.filter(s => 
      s.modelId === modelId && (now - s.timestamp.getTime() <= timeWindowMs)
    );

    if (relevantSpans.length === 0) {
      return { latency_p50: 0, latency_p95: 0, latency_p99: 0, status: 'NO_DATA' };
    }

    const latencies = relevantSpans.map(s => s.latencyMs).sort((a, b) => a - b);
    
    const p50 = latencies[Math.floor((latencies.length - 1) * 0.50)];
    const p95 = latencies[Math.floor((latencies.length - 1) * 0.95)];
    const p99 = latencies[Math.floor((latencies.length - 1) * 0.99)];

    return {
      latency_p50: p50,
      latency_p95: p95,
      latency_p99: p99,
      status: 'HEALTHY'
    };
  }
}
