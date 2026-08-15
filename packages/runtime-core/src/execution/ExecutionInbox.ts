export interface InboxMessage {
  readonly eventId: string;
  readonly executionId: string;
  readonly type: string;
  readonly payload: Record<string, any>;
  readonly status: 'PROCESSED' | 'FAILED';
}

export interface ExecutionInbox {
  /**
   * Records an incoming event.
   * Ensures idempotency: if the `eventId` has already been processed, this 
   * will either return `false` or throw an IdempotencyError, preventing duplicate processing.
   */
  receive(eventId: string, executionId: string, type: string, payload: Record<string, any>): Promise<boolean>;

  /**
   * Marks a received event as failed, optionally allowing it to be retried later.
   */
  markFailed(eventId: string, error: string): Promise<void>;
}
