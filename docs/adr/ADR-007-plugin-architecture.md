# ADR 007: Plugin Architecture

## Status
Accepted

## Context
The core durable execution engine provides the state machine and orchestration logic, but it must be extended with new capabilities (LLM providers, custom tools), custom domain events, and new reducers as the product evolves. Injecting these directly into the engine's source code violates the Open/Closed Principle.

## Decision
We utilize a unified `PluginRegistry`. During startup, plugins hook into the `onLoad` lifecycle to register their custom Capability Providers, Deterministic Reducers, Event Upcasters, and Sagas. Once the boot phase is complete, the `RegistryVerifier` executes, validating all contracts, generating the Boot Manifest, and structurally freezing (`isFrozen = true`) the registries to prevent runtime mutations.

## Consequences
- **Pros:** Highly extensible. New models or tools can be added via plugins without modifying the core. Registries are immutable at runtime, ensuring safety.
- **Cons:** Startup failure is possible if plugins conflict or provide incomplete registrations (e.g., an event without a reducer).
