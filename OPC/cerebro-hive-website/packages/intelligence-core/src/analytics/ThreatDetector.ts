import { IdentityTimeline } from '../timeline/IdentityTimeline';

export interface ThreatAlert {
  id: string;
  principalId: string;
  threatType: 'BruteForce' | 'ImpossibleTravel' | 'PrivilegeEscalation';
  severity: 'Medium' | 'High' | 'Critical';
  description: string;
  timestamp: Date;
}

export class ThreatDetector {
  /**
   * Evaluates a recent timeline window for deterministic threat patterns.
   */
  evaluate(timeline: IdentityTimeline): ThreatAlert[] {
    const alerts: ThreatAlert[] = [];
    const recentEvents = timeline.getEventsSince(new Date(Date.now() - 5 * 60 * 1000)); // Last 5 minutes

    let denies = 0;
    let mfaFailures = 0;

    for (const e of recentEvents) {
      if (e.eventType === 'PolicyDeny') denies++;
      if (e.eventType === 'MfaFailed') mfaFailures++;
    }

    // Rule: 5+ Denies + 1+ MFA failure in 5 mins = Brute Force / Credential Stuffing
    if (denies >= 5 && mfaFailures >= 1) {
      alerts.push({
        id: `alert-${Date.now()}`,
        principalId: timeline.principalId,
        threatType: 'BruteForce',
        severity: 'Critical',
        description: 'Detected high volume of policy denies followed by MFA failure.',
        timestamp: new Date()
      });
    }

    return alerts;
  }
}
