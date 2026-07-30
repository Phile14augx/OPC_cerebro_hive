import { Entity } from './Entity';
import type { HiveDomainEvent } from '../events/HiveDomainEvent';

/**
 * Base for an aggregate root (per hiveforge/01-DOMAIN-MODEL.md's aggregate
 * hierarchy — Organization, Tenant, Project, Workspace, Deployment,
 * Resource, Operation, plus the cross-cutting aggregates). Collects raised
 * domain events in memory only; this package does not publish them anywhere
 * (no HiveEventBus dependency, no transport) — publishing is an
 * infrastructure concern, out of scope for this domain package regardless
 * of which slice adds the contracts for it.
 */
export abstract class AggregateRoot<TId extends string> extends Entity<TId> {
  private domainEventBuffer: HiveDomainEvent[] = [];

  protected raise(event: HiveDomainEvent): void {
    this.domainEventBuffer.push(event);
  }

  get domainEvents(): readonly HiveDomainEvent[] {
    return this.domainEventBuffer;
  }

  clearDomainEvents(): void {
    this.domainEventBuffer = [];
  }
}
