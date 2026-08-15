import { EventTimelineRecord } from '../governance/GovernanceRule.js';

export interface TimelineAnalytics {
  totalEvents: number;
  anomalies: string[];
  executionSpans: Record<string, { start: Date; end?: Date; durationMs?: number }>;
}

export class TimelineAnalyzer {
  public analyze(timeline: EventTimelineRecord[]): TimelineAnalytics {
    const anomalies: string[] = [];
    const executionSpans: Record<string, { start: Date; end?: Date; durationMs?: number }> = {};
    
    // Sort timeline chronologically
    const sorted = [...timeline].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    sorted.forEach(event => {
      if (event.type === 'RuleStarted') {
        if (executionSpans[event.ruleId]) {
          anomalies.push(`Rule \${event.ruleId} started more than once.`);
        }
        executionSpans[event.ruleId] = { start: event.timestamp };
      } else if (['RulePassed', 'RuleFailed', 'RuleSkipped'].includes(event.type)) {
        const span = executionSpans[event.ruleId];
        if (!span) {
          anomalies.push(`Rule \${event.ruleId} completed without starting.`);
        } else {
          const end = event.timestamp;
          span.end = end;
          span.durationMs = end.getTime() - span.start.getTime();
        }
      }
    });

    return {
      totalEvents: timeline.length,
      anomalies,
      executionSpans
    };
  }
}
