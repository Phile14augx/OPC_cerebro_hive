export interface OutboxMessage {
  readonly id: string;
  readonly executionId: string;
  readonly type: string;
  readonly payload: Record<string, any>;
  readonly status: 'PENDING' | 'SENT' | 'FAILED';
  readonly retries: number;
  readonly nextRetryAt?: Date;
}

export interface ExecutionOutbox {
  /** Enqueues a message for reliable delivery to external systems (e.g. workers, webhooks) */
  publish(executionId: string, type: string, payload: Record<string, any>): Promise<void>;

  /** Retrieves pending messages for processing */
  fetchPending(limit?: number): Promise<OutboxMessage[]>;

  /** Marks a message as successfully delivered */
  markSent(messageId: string): Promise<void>;

  /** Records a failure, optionally scheduling a retry */
  markFailed(messageId: string, error: string, scheduleRetryAt?: Date): Promise<void>;
}
