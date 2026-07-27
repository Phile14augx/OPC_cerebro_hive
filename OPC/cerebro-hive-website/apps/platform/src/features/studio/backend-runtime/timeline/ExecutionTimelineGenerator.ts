
export interface TimelineEvent {
  stageId: string;
  nodeId: string;
  startTimeMs: number;
  durationMs: number;
  workerId: string;
}

export class ExecutionTimelineGenerator {
  private events: TimelineEvent[] = [];

  recordEvent(event: TimelineEvent) {
    this.events.push(event);
  }

  generateGanttData() {
    // Translates timeline events into UI-ready Gantt chart format
    return this.events;
  }
}
