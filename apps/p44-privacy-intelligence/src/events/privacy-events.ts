export interface PrivacyPiiDetectedEvent {
  event_id: string;
  timestamp: string;
  payload: {
    source_system: string;
    entity_type: string;
    confidence_score: number;
    action_taken: string;
  };
}

export interface PrivacyConsentGrantedEvent {
  event_id: string;
  timestamp: string;
  payload: {
    user_id: string;
    lawful_basis: string;
    purpose: string;
  };
}

export interface FlRoundCompletedEvent {
  event_id: string;
  timestamp: string;
  payload: {
    round_id: string;
    model_id: string;
    status: string;
    participants_aggregated: number;
  };
}

export interface GovernancePolicyUpdatedEvent {
  event_id: string;
  timestamp: string;
  payload: any;
}
