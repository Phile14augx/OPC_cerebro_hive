import { ThreatAlert } from '@cerebro/intelligence-core';
import { EvidenceLocker } from '../evidence/EvidenceLocker';

export type CaseState = 'Detected' | 'Open' | 'Investigating' | 'Contained' | 'Recovering' | 'Resolved' | 'Closed' | 'Reopened';

export interface IncidentCase {
  id: string;
  title: string;
  state: CaseState;
  severity: 'Informational' | 'Warning' | 'High' | 'Critical' | 'Emergency';
  
  // Correlation dimensions
  principals: string[];
  threatCampaigns: string[];
  
  alerts: ThreatAlert[];
  
  createdAt: Date;
  updatedAt: Date;
  timeline: CaseTimelineEvent[];
}

export interface CaseTimelineEvent {
  timestamp: Date;
  actor: string;
  action: string;
  details?: string;
}

export class CaseManager {
  private cases = new Map<string, IncidentCase>();

  constructor(private evidenceLocker: EvidenceLocker) {}

  /**
   * Evaluates an incoming Threat Alert and either correlates it to an existing case or creates a new one.
   */
  async handleAlert(alert: ThreatAlert): Promise<IncidentCase> {
    // Basic Correlation: Check if an open case exists for this principal
    let activeCase = Array.from(this.cases.values()).find(
      c => c.principals.includes(alert.principalId) && !['Closed', 'Resolved'].includes(c.state)
    );

    if (activeCase) {
      activeCase.alerts.push(alert);
      activeCase.updatedAt = new Date();
      this.appendTimeline(activeCase.id, 'system', 'Alert Correlated', `Correlated alert ${alert.id} (${alert.threatType})`);
      console.log(`[CaseManager] 🔗 Correlated alert ${alert.id} to Case ${activeCase.id}`);
      return activeCase;
    }

    // Create a new Case
    const newCase: IncidentCase = {
      id: `case-${Date.now()}`,
      title: `${alert.threatType} on ${alert.principalId}`,
      state: 'Detected',
      severity: this.mapSeverity(alert.severity),
      principals: [alert.principalId],
      threatCampaigns: [],
      alerts: [alert],
      createdAt: new Date(),
      updatedAt: new Date(),
      timeline: []
    };

    this.cases.set(newCase.id, newCase);
    this.appendTimeline(newCase.id, 'system', 'Case Created', `Generated from alert ${alert.id}`);
    
    // Auto-transition to Open
    await this.transitionState(newCase.id, 'Open', 'system', 'Initial Triage');

    return newCase;
  }

  async transitionState(caseId: string, newState: CaseState, actor: string, reason: string): Promise<void> {
    const c = this.cases.get(caseId);
    if (!c) throw new Error('Case not found');

    const validTransitions: Record<CaseState, CaseState[]> = {
      Detected: ['Open'],
      Open: ['Investigating', 'Closed'],
      Investigating: ['Contained', 'Resolved'],
      Contained: ['Recovering', 'Resolved'],
      Recovering: ['Resolved'],
      Resolved: ['Closed', 'Reopened'],
      Closed: ['Reopened'],
      Reopened: ['Investigating', 'Contained']
    };

    if (!validTransitions[c.state].includes(newState)) {
      throw new Error(`Invalid state transition from ${c.state} to ${newState}`);
    }

    c.state = newState;
    c.updatedAt = new Date();
    this.appendTimeline(c.id, actor, `State Changed: ${newState}`, reason);
    console.log(`[CaseManager] 📁 Case ${c.id} transitioned to ${newState}`);
  }

  private appendTimeline(caseId: string, actor: string, action: string, details?: string) {
    const c = this.cases.get(caseId);
    if (c) {
      c.timeline.push({ timestamp: new Date(), actor, action, details });
    }
  }

  getCase(id: string): IncidentCase | undefined {
    return this.cases.get(id);
  }

  private mapSeverity(intelSeverity: string): IncidentCase['severity'] {
    if (intelSeverity === 'Critical') return 'Emergency';
    if (intelSeverity === 'High') return 'Critical';
    if (intelSeverity === 'Medium') return 'High';
    return 'Informational';
  }
}
