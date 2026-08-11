export interface RelayStrategy {
  readEvents(limit: number): Promise<any[]>;
  ack(eventId: string): Promise<void>;
  nack(eventId: string, error: string): Promise<void>;
}
