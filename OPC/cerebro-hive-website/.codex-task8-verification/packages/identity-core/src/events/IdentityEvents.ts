export interface PrincipalAuthenticatedEventPayload {
  principalId: string;
  authenticationMethod: string;
}

export interface SessionStartedEventPayload {
  sessionId: string;
  sessionType: string;
}

export interface DelegationCreatedEventPayload {
  delegatorId: string;
  delegateeId: string;
  reason: string;
}

export interface PermissionDeniedEventPayload {
  capability: string;
  resourceUrn?: string;
  reason: string;
}
