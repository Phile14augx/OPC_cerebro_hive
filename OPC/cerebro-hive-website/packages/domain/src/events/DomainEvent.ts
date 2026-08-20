export abstract class DomainEvent<TPayload = unknown> {
  public readonly eventId: string;
  public readonly timestamp: Date;
  
  constructor(
    public readonly aggregateType: string,
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly workspaceId: string | undefined,
    public readonly userId: string | undefined,
    public readonly correlationId: string | undefined,
    public readonly causationId: string | undefined,
    public readonly payload: TPayload
  ) {
    // Basic UUID fallback if crypto is unavailable
    this.eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.timestamp = new Date();
  }
}
