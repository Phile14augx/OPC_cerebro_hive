
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
}

export class ReviewEvaluationStarted implements DomainEvent {
  readonly eventId = `evt-${Date.now()}`;
  readonly occurredAt = new Date();
  constructor(public readonly sessionId: string, public readonly proposedVersionId: string) {}
}

export class ReviewEvaluationCompleted implements DomainEvent {
  readonly eventId = `evt-${Date.now()}`;
  readonly occurredAt = new Date();
  constructor(public readonly reportId: string) {}
}

export class ReviewPublished implements DomainEvent {
  readonly eventId = `evt-${Date.now()}`;
  readonly occurredAt = new Date();
  constructor(public readonly reportId: string, public readonly verdict: string) {}
}

export class ReviewMarkedStale implements DomainEvent {
  readonly eventId = `evt-${Date.now()}`;
  readonly occurredAt = new Date();
  constructor(public readonly reportId: string, public readonly reason: string) {}
}
