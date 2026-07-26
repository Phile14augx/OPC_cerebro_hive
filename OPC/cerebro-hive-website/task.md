# Task Tracker: Milestone 15 - Autonomous Multi-Agent Intelligence

## Phase 1: Core System Agents (services/planner-service)
- `[x]` Scaffold `MissionPlanner`: Breaks high-level user goals into typed `ExecutionPlan` / Initial Workflow
- `[x]` Scaffold `AgentAllocator`: Queries an `AgentRegistry` to assign tasks to specialized agents
- `[x]` Scaffold `ReviewerAgent` & `CriticAgent`: Quality review and consensus strategies implemented as standard executable tasks

## Phase 2: Autonomous Engine Capabilities (services/swarm-runtime)
- `[x]` Implement `ReflectionEngine`: A separate layer outside the deterministic executor that evaluates results and decides to Continue or Replan
- `[x]` Implement Immutable Replanning: `Replan Request` creates a *new* Workflow Revision (linked to parent) rather than mutating the active DAG
- `[x]` Implement `AgentRegistry` Index: capability matching, latency, and reliability tracking

## Phase 3: Integration & Knowledge Persistence
- `[x]` Wire `DecisionEngine` into the Orchestrator loop
- `[x]` Persist `ImprovementRecord` to KnowledgeOps after Reflection runs
