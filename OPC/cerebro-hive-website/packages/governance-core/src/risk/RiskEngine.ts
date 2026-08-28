export interface RiskScore {
  identityRisk: number;
  deviceRisk: number;
  credentialRisk: number;
  sessionRisk: number;
  executionRisk: number;
  
  overallRisk: number;
}

export type RevocationAction = 'ReduceTrust' | 'RequireReauth' | 'SuspendSession' | 'RevokeLease' | 'DisablePrincipal';

export interface TelemetryEvent {
  type: string;
  principalId: string;
  sessionId?: string;
  leaseId?: string;
  payload: Record<string, unknown>;
}

export class RiskEngine {
  private scores = new Map<string, RiskScore>();

  /**
   * Consumes a telemetry event and adjusts multidimensional risk.
   */
  processEvent(event: TelemetryEvent): void {
    let currentScore = this.scores.get(event.principalId) || {
      identityRisk: 0,
      deviceRisk: 0,
      credentialRisk: 0,
      sessionRisk: 0,
      executionRisk: 0,
      overallRisk: 0
    };

    // Very simplified risk evaluation logic for demonstration
    switch (event.type) {
      case 'PolicyDeny':
        currentScore.executionRisk += 10;
        break;
      case 'ImpossibleTravel':
        currentScore.identityRisk += 50;
        currentScore.sessionRisk += 30;
        break;
      case 'CredentialLeaseExpired':
        currentScore.credentialRisk += 5;
        break;
      case 'MfaFailed':
        currentScore.identityRisk += 25;
        break;
    }

    // Recalculate overall (e.g. weighted average)
    currentScore.overallRisk = Math.min(100, Math.max(
      currentScore.identityRisk,
      currentScore.deviceRisk,
      currentScore.credentialRisk,
      currentScore.sessionRisk,
      currentScore.executionRisk
    ));

    this.scores.set(event.principalId, currentScore);

    // Evaluate response
    this.evaluateResponse(event.principalId, currentScore);
  }

  private evaluateResponse(principalId: string, score: RiskScore): void {
    if (score.overallRisk >= 90) {
      this.executeAction(principalId, 'DisablePrincipal');
    } else if (score.overallRisk >= 75) {
      this.executeAction(principalId, 'RevokeLease');
    } else if (score.overallRisk >= 50) {
      this.executeAction(principalId, 'SuspendSession');
    } else if (score.overallRisk >= 25) {
      this.executeAction(principalId, 'RequireReauth');
    }
  }

  private executeAction(principalId: string, action: RevocationAction): void {
    console.log(`[RiskEngine] ⚠️ TRIGGERING ACTION: ${action} for Principal ${principalId}`);
    // In reality, this dispatches a command to the Identity OS or SecretsManager
  }
  
  getScore(principalId: string): RiskScore | undefined {
    return this.scores.get(principalId);
  }
}
