
export * from './EventTypes';
export * from './EventBus';

// Outbox-relay-to-NATS pipeline (Phase 9e adoption — see
// hiveforge/adr/ADR-043-adopt-packages-events-for-execution-delivery.md).
// These existed in this package's src/ but were never exported from its own
// public barrel before Phase 9e — genuinely real code (a working NATS
// JetStream publisher, a real outbox-table poller) that nothing outside this
// package could actually import correctly. Exported now as the deliberately
// adopted foundation.
//
// NOT exported here, and NOT part of this adoption: `./workers/BaseWorker`
// (its own `start()` is a literal `console.log` scaffold — "Scaffold:
// Subscribe to NATS JetStream subject" is its own comment, not real
// subscription logic) and the `NotificationWorker`/`AiWorker` classes in
// `apps/platform-api/src/workers/` that extend it. Those remain separate,
// unreached scaffolding — flagged, not fixed, by this phase.
export * from './EventEnvelope';
export * from './RelayStrategy';
export * from './PollingRelayStrategy';
export * from './OutboxRelayWorker';
export * from './NatsPublisher';
