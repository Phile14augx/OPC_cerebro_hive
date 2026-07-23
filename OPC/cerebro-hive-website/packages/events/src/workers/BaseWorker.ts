export abstract class BaseWorker<TPayload> {
  constructor(protected subject: string, protected natsConnection: any) {}

  abstract handle(payload: TPayload, headers?: Record<string, string>): Promise<void>;

  async start() {
    // Scaffold: Subscribe to NATS JetStream subject
    // Setup dead-letter handling, retry policies, and telemetry wrapping
    console.log(`[Worker] Started listening on ${this.subject}`);
  }

  protected async sendToDeadLetterQueue(payload: TPayload, error: Error) {
    // Scaffold: Publish to DLQ
    console.error(`[Worker] Sent to DLQ on ${this.subject}: ${error.message}`);
  }
}
