// Errors & DTOs
export * from './src/errors/DomainError';
export * from './src/dto/Result';

// Metrics
export * from './src/metrics/DomainMetrics';

// Events
export * from './src/events/DomainEvent';
export * from './src/events/EventBus';
export * from './src/events/InMemoryEventBus';
export * from './src/events/OutboxPublisher';

// Transactions
export * from './src/transactions/UnitOfWork';

// Audit
export * from './src/audit/AuditLogger';

// Policies
export * from './src/policies/Decision';
export * from './src/policies/PolicyEngine';

// Specifications
export * from './src/specifications/AgentSpecifications';
export * from './src/specifications/WorkflowSpecifications';

// Validators
export * from './src/validators/AgentValidator';
export * from './src/validators/WorkflowValidator';

// Services
export * from './src/services/AgentApplicationService';
export * from './src/services/WorkflowApplicationService';
export * from './src/context/AgentExecutionContext';
export * from './src/agents/AgentRegistryErrors';
export * from './src/agents/AgentRegistryService';
export * from './src/agents/AgentDraftService';
export * from './src/agents/AgentPublicationService';
export * from './src/agents/AgentLifecycleService';

// Execution (Phase 9a — canonical Execution aggregate)
export * from './src/execution/ExecutionId';
export * from './src/execution/ExecutionStatus';
export * from './src/execution/Execution';
export * from './src/execution/ExecutionRepository';
export * from './src/execution/ExecutionEvents';
export * from './src/execution/ExecutionTransitions';
export * from './src/execution/ExecutionOrchestrator';
export * from './src/execution/ExecutionSnapshot';
export * from './src/execution/InMemoryExecutionRepository';
export * from './src/execution/ExecutionCheckpointStore';
export * from './src/execution/ExecutionReplay';
export * from './src/execution/ExecutionOutboxEventPublisher';
export * from './src/execution/OutboxRelayExecutionEventSink';

// Execution control semantics (Phase 9f-1 — authorization, cancellation, timeout)
export * from './src/execution/Clock';
export * from './src/execution/ExecutionCancellation';
export * from './src/execution/ExecutionAuthorizationPolicy';

// Execution reliability & ownership (Phase 9f-2 — idempotency, leases, retry policy, failure classification)
export * from './src/execution/ExecutionIdempotency';
export * from './src/execution/ExecutionLease';
export * from './src/execution/ExecutionFailureClassification';
export * from './src/execution/ExecutionRetryPolicy';

// Execution scheduling (Phase 9g-2 — standalone scheduler exercising leases/retry/timeout)
export * from './src/execution/ExecutionScheduleQueue';
export * from './src/execution/ExecutionScheduler';

// Execution workers (Phase 9g-3 — lease heartbeat + worker composition)
export * from './src/execution/Timer';
export * from './src/execution/ExecutionLeaseHeartbeat';
export * from './src/execution/ExecutionWorker';

// Execution event delivery (Phase 9g-4 — transactional outbox + relay; toExecutionIntegrationEvent already exported via ExecutionOutboxEventPublisher above)
export * from './src/execution/ExecutionEventOutbox';
export * from './src/execution/TransactionalOutboxExecutionEventSink';
export * from './src/execution/ExecutionEventRelay';

// Execution observability (Phase 9g-5 — tracing/metrics/logging contracts + in-memory adapters; real OTel/Prometheus/log-shipper adapters deferred, see ADR-050)
export * from './src/execution/Tracer';
export * from './src/execution/Meter';
export * from './src/execution/Logger';
export * from './src/execution/CorrelationContext';
export * from './src/execution/ExecutionTelemetry';
