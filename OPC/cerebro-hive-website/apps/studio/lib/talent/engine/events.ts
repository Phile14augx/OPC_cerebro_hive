export type AssessmentEventType = 
  | "ASSESSMENT_STARTED"
  | "WIDGET_EXECUTED"
  | "CODE_COMPILED"
  | "TESTS_RUN"
  | "COMPILATION_ERROR"
  | "AI_REVIEW_REQUESTED"
  | "ASSESSMENT_SUBMITTED";

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: AssessmentEventType;
  candidateId: string;
  assessmentId: string;
  activityId?: string;
  payload: any;
}

export class EventBus {
  private listeners: Map<AssessmentEventType, Array<(event: TelemetryEvent) => void>> = new Map();

  subscribe(type: AssessmentEventType, callback: (event: TelemetryEvent) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  publish(type: AssessmentEventType, candidateId: string, assessmentId: string, payload: any, activityId?: string) {
    const event: TelemetryEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      candidateId,
      assessmentId,
      activityId,
      payload
    };

    console.log(`[EventBus] Published ${type}`, event);

    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach(h => {
        try { h(event); } catch (e) { console.error(`[EventBus] Handler error for ${type}:`, e); }
      });
    }
  }
}

export const GlobalEventBus = new EventBus();
