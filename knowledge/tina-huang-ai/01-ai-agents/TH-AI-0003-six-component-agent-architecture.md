# TH-AI-0003 — Six-Component Agent Architecture

**Knowledge Object ID:** TH-AI-0003  
**Classification:** E (AI Agents)  
**Priority:** P0  
**Status:** VERIFIED  
**Evidence Grade:** B (Consistent with Anthropic agent design documentation)  
**Source Videos:** VID-003, VID-011  
**First Extracted:** 2026-08-14  
**Last Verified:** 2026-08-14

---

## Core Concept

Every production AI agent must be designed against six components. Missing any component is a design defect that must be caught before implementation.

---

## The Six Components

### 1. Model (Core Reasoning LLM)
The LLM that performs reasoning, planning, and generation.

**Selection criteria:**
- Task type (coding → Claude Sonnet; math → o3-mini; extended context → Gemini 2.5 Pro)
- Privacy requirements (sensitive data → local model via Ollama)
- Cost ceiling per agent run
- Latency requirements

**Cerebro Implementation:** HiveModels (LLM gateway + routing)

### 2. Tools (External System Integrations)
Functions and APIs the agent can invoke to take actions in the world.

**Tool categories:**
- **Read tools:** web search, database queries, file reads, API GETs
- **Write tools:** database writes, file creation, API POSTs
- **Execute tools:** code execution, shell commands, browser automation
- **Communication tools:** email, Slack, calendar

**Security constraint:** Each agent MUST have only the tools it needs (see BP-SEC-0002, least-privilege tool access).

**Cerebro Implementation:** HiveAPI (tool registry), HiveShield (tool call gating)

### 3. Knowledge & Memory
Information the agent can access and persist.

**Four memory types (see TH-AI-0005):**
- Working memory → agent scratchpad (session)
- Episodic memory → task history (long-term)
- Semantic memory → knowledge graph
- Procedural memory → updated prompts and learned procedures

**Cerebro Implementation:** HiveMemory, HiveKnowledge, HiveVector, HiveSemantic

### 4. Audio/Speech (Multimodal — if needed)
Speech-to-text and text-to-speech for voice-capable agents.

**When required:** Customer-facing voice agents, accessibility features, voice-commanded automation.

**When to omit:** Most enterprise back-office agents. Include only if the use case requires it.

### 5. Guardrails (Safety and Constraint Mechanisms)
Controls that prevent agents from taking unsafe, incorrect, or out-of-scope actions.

**Types of guardrails:**
- **Input guardrails:** Validate and sanitize user inputs before processing
- **Output guardrails:** Validate agent outputs before delivery
- **Action guardrails:** Approve/reject tool calls before execution
- **Scope guardrails:** Prevent agents from exceeding their defined role
- **Injection detection:** Detect prompt injection in external content (BP-SEC-0001)

**Cerebro Implementation:** HiveShield, HiveGovern

### 6. Orchestration (Deployment, Monitoring, Improvement)
Infrastructure for running, observing, and improving the agent over time.

**Orchestration responsibilities:**
- Deployment pipeline (staging → production gates)
- Runtime monitoring (latency, cost, error rates)
- Evaluation loops (task completion, hallucination rate)
- Cost ceiling enforcement (see BP-PROD-0002)
- Agent improvement workflow (prompt updates, fine-tuning triggers)
- Human escalation routing

**Cerebro Implementation:** HiveOps, HiveObservatory, HiveEvaluation

---

## Architecture Review Checklist

Before any sprint planning for a new agent:

```
□ Model: LLM selected with routing rationale documented
□ Tools: Tool list defined, permissions scoped (least-privilege applied)
□ Knowledge & Memory: All four memory types addressed
□ Audio/Speech: Decision documented (include/exclude + rationale)
□ Guardrails: Input + output + action guardrails specified
□ Orchestration: Evaluation metrics defined, cost ceiling set
```

**This checklist must be signed off before sprint planning begins (BP-AI-0001).**

---

## Cerebro Nexarch Agent Design Template (YAML)

```yaml
agent:
  id: {AGENT_ID}
  name: "{Agent Name}"
  version: "1.0.0"
  
  model:
    primary: claude-sonnet-4-5
    routing_rule: "{routing decision}"
    cost_ceiling_usd: 0.50
    
  tools:
    - name: "{tool_name}"
      permission: read|write|execute
      justification: "{why this agent needs this tool}"
      
  memory:
    working: hive-memory-session
    episodic: hive-memory-long-term
    semantic: hive-knowledge
    procedural: prompt-registry
    
  audio_speech:
    enabled: false
    
  guardrails:
    input: hive-shield-input-validation
    output: hive-shield-output-validation
    injection_detection: enabled
    hitl_required:
      - operation: "{operation}"
        approval_mode: pre-execution|post-generation|transaction
        
  orchestration:
    evaluation:
      task_completion_rate_target: 0.90
      hallucination_rate_target: 0.05
      structured_output_validity_target: 0.98
    monitoring: hive-observatory
    cost_monitoring: hive-ops
```

---

## Applicable Systems

- ALL CerebroAgent implementations
- ALL HiveAgents (specialized agents within the Hive Platform)
- Any Cerebro product that embeds an agent

---

## Related Knowledge Objects

- TH-AI-0005 (Four-Type Agent Memory Architecture)
- TH-AI-0011 (Multi-Agent Topologies)
- TH-AI-0015 (Context Engineering — Memory component detail)

## Related Patterns

- AGENT-PATTERN-0001 (Hierarchical Multi-Agent)
- AGENT-PATTERN-0003 (MCP-Connected Agent)

## Related Best Practices

- BP-AI-0001 (Six-Component Architecture Checklist — P0 MANDATORY)
- BP-AI-0003 (HITL for High-Impact Actions)
- BP-AI-0004 (Evaluation Before Production)
- BP-SEC-0001 (Prompt Injection Defense)
- BP-SEC-0002 (Least-Privilege Tool Access)
