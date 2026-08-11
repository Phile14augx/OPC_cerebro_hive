import { describe, expect, it } from 'vitest';
import { Entity } from '../entities/Entity';
import { AggregateRoot } from '../entities/AggregateRoot';
import type { HiveDomainEvent } from '../events/HiveDomainEvent';
import { WorkspaceId } from '../ids/ids';

class TestEntity extends Entity<string> {
  constructor(id: string) {
    super(id);
  }
}

interface WorkspaceCreatedPayload {
  readonly name: string;
}

class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }

  createWithEvent(name: string): void {
    const event: HiveDomainEvent<WorkspaceCreatedPayload> = {
      eventId: 'evt-1',
      eventType: 'WorkspaceCreated',
      occurredAt: new Date(),
      aggregateId: this.id,
      payload: { name },
    };
    this.raise(event);
  }
}

describe('Entity', () => {
  it('is equal to itself', () => {
    const e = new TestEntity('a');
    expect(e.equals(e)).toBe(true);
  });

  it('is equal to another entity with the same id', () => {
    const a = new TestEntity('shared-id');
    const b = new TestEntity('shared-id');
    expect(a.equals(b)).toBe(true);
  });

  it('is not equal to an entity with a different id', () => {
    const a = new TestEntity('a');
    const b = new TestEntity('b');
    expect(a.equals(b)).toBe(false);
  });

  it('is not equal to null/undefined', () => {
    const a = new TestEntity('a');
    expect(a.equals(null)).toBe(false);
    expect(a.equals(undefined)).toBe(false);
  });
});

describe('AggregateRoot', () => {
  it('starts with no domain events', () => {
    const id = WorkspaceId.of('ws-1');
    const agg = new TestAggregate(id);
    expect(agg.domainEvents).toHaveLength(0);
  });

  it('buffers raised domain events without publishing them anywhere', () => {
    const id = WorkspaceId.of('ws-1');
    const agg = new TestAggregate(id);
    agg.createWithEvent('production');

    expect(agg.domainEvents).toHaveLength(1);
    expect(agg.domainEvents[0]?.eventType).toBe('WorkspaceCreated');
    expect(agg.domainEvents[0]?.aggregateId).toBe(id);
  });

  it('clears buffered events', () => {
    const id = WorkspaceId.of('ws-1');
    const agg = new TestAggregate(id);
    agg.createWithEvent('production');
    agg.clearDomainEvents();
    expect(agg.domainEvents).toHaveLength(0);
  });
});
