import { Injectable } from '@nestjs/common';

export interface DriftAlert {
  eventId: string;
  modelId: string;
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
  featureName: string;
}

export interface ObservabilityEvent {
  subject: 'observability.drift.detected';
  payload: DriftAlert;
}

@Injectable()
export class AlertService {
  public alerts: DriftAlert[] = [];
  public events: ObservabilityEvent[] = [];

  async createDriftAlert(modelId: string, psiValue: number, threshold: number, featureName: string): Promise<DriftAlert> {
    const alert: DriftAlert = {
      eventId: Math.random().toString(36).substring(7),
      modelId,
      timestamp: new Date().toISOString(),
      metric: 'PSI',
      value: psiValue,
      threshold,
      featureName
    };
    
    this.alerts.push(alert);
    this.emitEvent('observability.drift.detected', alert);
    return alert;
  }

  private emitEvent(subject: ObservabilityEvent['subject'], payload: DriftAlert): void {
    this.events.push({ subject, payload });
  }
}
