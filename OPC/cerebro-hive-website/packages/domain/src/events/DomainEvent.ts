export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly timestamp: Date;
  
  constructor(
    public readonly aggregateType: string,
    public readonly aggregateId: string,
    public readonly tenantId: string,
    public readonly workspaceId?: string,
    public readonly userId?: string,
    public readonly correlationId?: string,
    public readonly causationId?: string,
    public readonly payload?: any
  ) {
    // Basic UUID fallback if crypto is unavailable
    this.eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.timestamp = new Date();
  }
}
