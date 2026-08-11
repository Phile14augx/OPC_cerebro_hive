import { PolicyDecision } from '../engine/PolicyEngine';

export interface PolicyEvaluatedEventPayload {
  decision: PolicyDecision;
  enforcementPoint: string;
}

export interface PolicyViolationDetectedEventPayload {
  decision: PolicyDecision;
  enforcementPoint: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface PolicyCreatedEventPayload {
  policyId: string;
  version: string;
}

export interface PolicyUpdatedEventPayload {
  policyId: string;
  previousVersion: string;
  newVersion: string;
}
