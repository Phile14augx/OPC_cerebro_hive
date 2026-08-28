# P48 Consumed Contracts

## Model inference

P48 consumes model inference through a neutral `ModelInferencePort`. The repository does not currently contain an approved, pinned provider contract that authoritatively binds this port to P17, P45, or another product. P48 therefore owns only the port and its evaluation-facing semantics; it does not duplicate an upstream inference implementation or invent a transport contract.

The existing P48 documentation that names P45 as `ModelInferenceAPI` diverges from the portfolio ledger, where P45 has a different product identity. This integration remains deliberately unbound until the owning provider publishes an approved contract and the product-identifier conflict is resolved.

## MLOps and observability

P48 models MLOps and observability as external ports. Existing P48 event-subject declarations for P46 and P47 do not match the executable subjects currently published by those products, so this integration does not claim a production event-bus binding. Adapters may be added only after the relevant owning contracts are approved and pinned.

## Contract boundary

The P48 integration seam may define narrow request, response, telemetry, and lifecycle types needed by evaluation orchestration. Those types are P48-owned ports, not copies of external implementations. No HTTP, gRPC, message-bus, or provider-specific wire API is implied by this document.
