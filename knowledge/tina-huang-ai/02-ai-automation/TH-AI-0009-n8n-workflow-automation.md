# TH-AI-0009 — n8n Workflow Automation for AI Pipelines

**Knowledge Object ID:** TH-AI-0009  
**Classification:** D (AI Automation)  
**Priority:** P1  
**Status:** VERIFIED  
**Evidence Grade:** C (Official n8n documentation + practitioner demonstrations)  
**Source Videos:** VID-004, VID-005  
**First Extracted:** 2026-08-14  
**Last Verified:** 2026-08-14

---

## Core Concept

**n8n** is an open-source, self-hostable workflow automation platform with native AI node support. For Cerebro Nexarch, n8n is the **prototyping environment for CerebroFlow** — workflow logic is proven in n8n before production implementation.

> "n8n is where you prove the workflow works before you commit to production infrastructure." — BP-AUTO-0001

---

## Why n8n for CerebroFlow Prototyping

| Criterion | n8n Advantage |
|---|---|
| Speed | Visual workflow builder — no code for basic automations |
| AI integration | Native LLM nodes (OpenAI, Anthropic, Google) |
| Self-hostable | Data stays within Cerebro infrastructure |
| Cost | Open-source; no per-workflow pricing in self-hosted mode |
| Production path | Export to API → reimplement in CerebroFlow production runtime |
| Debugging | Visual execution trace per node |

---

## Key n8n AI Capabilities

### AI Agent Node
- Connect any LLM as an agent backbone
- Add tools (HTTP requests, databases, code execution)
- Memory integration (in-context or vector store)
- Chain multiple AI agent nodes in one workflow

### RAG Pipeline Support
- Document loaders (PDF, web, database)
- Text splitters with configurable chunk size
- Vector store connectors (Pinecone, Supabase, Weaviate, Qdrant)
- Retrieval chains for LLM-augmented responses

### Trigger Types
```
Event-triggered:  Webhook, email received, Slack message, calendar event
Scheduled:        Cron-based (daily, hourly, custom)
Human-triggered:  Manual execution, form submission
Agent-triggered:  HTTP call from another agent or workflow
```

---

## CerebroFlow Prototyping Workflow

```
Step 1: Define workflow in YAML schema (BP-AUTO-0002)
  - Trigger type declared
  - Human approval required: yes/no/conditional
  - Failure handling: retry/escalate/abort
  - Maximum cost per execution

Step 2: Build in n8n
  - Visual workflow construction
  - Test with real data (not synthetic)
  - Validate all edge cases and error paths

Step 3: Document production requirements
  - Which n8n nodes map to which CerebroFlow components
  - Performance requirements (latency, throughput)
  - Security requirements beyond n8n defaults

Step 4: Production implementation in CerebroFlow
  - Re-implement proven logic in production runtime
  - n8n prototype remains as reference documentation
```

---

## Workflow YAML Declaration Template (BP-AUTO-0002)

Every workflow must declare before building:

```yaml
workflow:
  id: "{WORKFLOW_ID}"
  name: "{Workflow Name}"
  version: "1.0.0"
  
  trigger:
    type: event-driven | scheduled | human-triggered | agent-triggered
    config:
      # event: "webhook" | "email" | "slack_message" | etc.
      # schedule: "0 9 * * 1-5"  # cron expression
      
  approval:
    required: "yes" | "no" | "conditional"
    condition: "{condition if conditional}"
    approver: "{role or agent}"
    
  failure_handling:
    strategy: retry | escalate | abort
    retry_count: 3
    escalation_target: "{team or agent}"
    
  cost:
    max_cost_usd_per_execution: 0.10
    alert_threshold_usd: 0.08
    
  security:
    data_classification: internal | confidential | restricted
    tenant_isolation: required | not-required
```

---

## Top n8n Automation Patterns for Cerebro

### Pattern: AI-Powered Email Triage
```
Gmail Trigger → AI Classify (urgency/category) → 
  Route: urgent → Slack alert + calendar block
  Route: standard → Add to task queue
  Route: newsletter → Archive + extract insights
```

### Pattern: Competitor Intelligence Aggregation  
```
Cron (daily 6am) → [Parallel] Web scrape competitors
→ AI summarize changes → Diff vs yesterday
→ IF significant change: Slack alert to team
→ Append to intelligence database
```

### Pattern: Document Processing Pipeline
```
Google Drive trigger (new file) → 
PDF extract → Chunk → Embed → Store in HiveVector
→ AI generate summary → Store metadata
→ Slack notify: "New document indexed: {title}"
```

---

## Technology Radar Status

**Status:** ADOPT  
**Quadrant:** Platforms & Tools  
**Rationale:** Proven for workflow prototyping. Self-hostable maintains data sovereignty. Native AI nodes reduce integration effort. Production promotion path is clear.

**Limitation:** n8n is NOT the production CerebroFlow runtime. It is the prototyping sandbox only.

---

## Related Knowledge Objects

- TH-AI-0018 (Workflow Automation Patterns)
- TH-AI-0019 (No-Code AI Builders — Lovable / Bolt)

## Related Patterns

- WORKFLOW-PATTERN-0004 (No-Code Trigger-Action Agent)
- AUTOMATION-PATTERN-0001 (n8n Prototyping Lifecycle)

## Related Best Practices

- BP-AUTO-0001 (Prototype in n8n Before Production — P1)
- BP-AUTO-0002 (Declare Workflow Type Before Building)
- BP-PROD-0001 (Never Confuse Demo/Prototype with Production)
