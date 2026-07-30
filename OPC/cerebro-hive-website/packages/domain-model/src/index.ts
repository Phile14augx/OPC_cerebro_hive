// Errors
export * from './errors/DomainModelError';

// Validation (zero-dependency runtime guards)
export * from './validation/guards';

// Identifiers
export * from './ids/Identifier';
export * from './ids/ids';

// Entities / Aggregate roots
export * from './entities/Entity';
export * from './entities/AggregateRoot';

// Value objects
export * from './value-objects/ValueObject';
export * from './value-objects/ResourceReference';

// Domain / Integration events (structure only) + event contracts (Slice 3
// — interfaces only, no concrete bus/store/serializer implementation; see
// packages/domain-model/README.md's Repository Integration Findings)
export * from './events/HiveDomainEvent';
export * from './events/HiveEventMetadata';
export * from './events/HiveEventEnvelope';
export * from './events/HiveEventPublisher';
export * from './events/HiveEventSubscriber';
export * from './events/HiveEventBus';
export * from './events/HiveEventStore';
export * from './events/HiveEventSerializer';
export * from './events/HiveEventDispatcher';

// Enums
export * from './enums/ResourceLifecycleState';
export * from './enums/HiveCapability';

// Capability contracts (Slice 2 — interfaces/types only, no implementations;
// see packages/domain-model/README.md for the naming-collision note against
// the unrelated, already-implemented @cerebro/capability-core package)
export * from './capability/HiveCapabilityVersion';
export * from './capability/HiveCapabilityMaturity';
export * from './capability/HiveCapabilityDependency';
export * from './capability/HiveCapabilityMetadata';
export * from './capability/HiveCapabilityDescriptor';
export * from './capability/HiveCapabilityFilter';
export * from './capability/HiveCapabilityDiscoveryResult';
export * from './capability/HiveCapabilityProvider';
export * from './capability/HiveCapabilityRegistry';
