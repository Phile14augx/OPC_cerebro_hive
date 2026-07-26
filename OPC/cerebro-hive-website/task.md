# Task Tracker: Milestone 16 - Multi-Layered Memory System

## Phase 1: Memory Models & SDK (`packages/memory-sdk`)
- `[x]` Define Memory Type schemas (`WorkingMemory`, `ConversationMemory`, `TaskMemory`, `EpisodicMemory`)
- `[x]` Define the `MemoryConsolidator` interface for semantic extraction

## Phase 2: Memory Service Core (`services/memory-service`)
- `[x]` Scaffold `MemoryService` to handle creation and retrieval of distinct memory types
- `[x]` Implement `WorkingMemoryStore` (Ephemeral Redis-like KV logic)
- `[x]` Implement `EpisodicMemoryStore` (Persistent structured experience database)
- `[x]` Implement `MemoryRetrievalPipeline` (Query -> Retriever -> Ranker -> Context Builder)

## Phase 3: Runtime Integration (`services/swarm-runtime`)
- `[x]` Integrate `WorkingMemoryStore` with `ExecutionEngine`: create transient state during task execution
- `[x]` Implement Snapshotting: Trigger a snapshot to `EpisodicMemory` on task/workflow completion, then wipe `WorkingMemory`
- `[x]` Implement Consolidation Hook: Push structured episodes to `KnowledgeOps` for semantic fact extraction
