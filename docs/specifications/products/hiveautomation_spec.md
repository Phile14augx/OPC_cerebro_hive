# Product Specification: HiveAutomation™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 3 — AI Runtime  
**Security Classification:** Tier 2 — Business Critical

---

## 1. Product Overview

**HiveAutomation™** is the durable workflow automation engine — the platform for building, deploying, and operating long-running business process automations that span hours, days, or weeks across multiple systems and human participants. Where HiveAgents handles autonomous AI tasks (minutes), HiveAutomation handles business workflows (days).

The key technology: Temporal durable workflow engine. Workflows survive process crashes, infrastructure restarts, and even cloud region failures — they always resume exactly where they left off.

---

## 2. Core Concepts

### Workflows vs. Agent Tasks

| Dimension | HiveAgents (Agent Tasks) | HiveAutomation (Workflows) |
|---|---|---|
| Duration | Seconds to minutes | Minutes to weeks |
| Paradigm | Autonomous AI reasoning loop | Deterministic business process |
| Human involvement | Optional approval gates | First-class orchestration step |
| State management | LangGraph state machine | Temporal durable execution |
| Trigger | API call, user request | Event, schedule, API, webhook |
| Failure handling | Agent decides how to handle | Explicit retry/compensation logic |

### Temporal Durable Execution
Temporal ensures workflow durability:
- Workflow code is just regular Python or TypeScript functions with `@workflow.defn` decorator.
- Temporal records every event (activity completion, signal received, timer fired) to a durable event history.
- If the workflow worker crashes, Temporal replays the event history to reconstruct exact workflow state — execution continues transparently.
- Workflows can sleep for days (`await workflow.sleep(days=30)`) without consuming resources.

---

## 3. Core Capabilities

### 3.1 Workflow Definition
```python
@workflow.defn
class InvoiceApprovalWorkflow:
    @workflow.run
    async def run(self, invoice_id: str) -> WorkflowResult:
        
        # Step 1: Extract invoice data (activity — can retry)
        invoice = await workflow.execute_activity(
            extract_invoice_data,
            invoice_id,
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(max_attempts=3)
        )
        
        # Step 2: AI validation (agent task)
        validation = await workflow.execute_activity(
            run_ai_validation,
            invoice,
            start_to_close_timeout=timedelta(minutes=10)
        )
        
        # Step 3: Route for approval (human task)
        if invoice.amount > 10000:
            approval = await workflow.execute_activity(
                request_human_approval,
                ApprovalRequest(
                    assignee=invoice.approver,
                    deadline=timedelta(days=2),
                    context=validation
                )
            )
            if not approval.approved:
                return WorkflowResult(status="rejected", reason=approval.reason)
        
        # Step 4: Post to ERP (activity)
        await workflow.execute_activity(
            post_to_erp,
            invoice,
            start_to_close_timeout=timedelta(minutes=5)
        )
        
        return WorkflowResult(status="completed")
```

### 3.2 No-Code Workflow Builder
For non-engineers: a visual workflow builder in HiveConsole:
- Drag-and-drop workflow nodes (trigger, condition, action, human task, agent task, wait, loop).
- Pre-built action library: send email, create record in CerebroERP/CRM, call API, run agent task, post to Slack.
- Condition builder: visual rule editor for branching logic.
- Generated workflows are compiled to Temporal workflow definitions (Python) — inspectable by engineers.

### 3.3 Trigger Types
| Trigger | Description |
|---|---|
| API | POST to `/v1/automation/workflows/{workflow_id}/start` |
| Schedule | Cron expression (e.g., `0 9 * * MON` — every Monday at 9am) |
| Event | Subscribe to a platform event (HiveData quality drop, agent task complete, ERP record created) |
| Webhook | External system triggers workflow via webhook |
| Human | User initiates workflow from CerebroHive app |

### 3.4 Human Task Management
Human tasks in workflows are first-class:

- Human tasks delivered to assignees via: HiveConsole task inbox, Slack, email, mobile push.
- Task forms: configurable input forms (approve/reject, select option, enter value, upload document).
- Delegation: reassign task to another user, with full audit trail.
- Escalation: if not completed within SLA, auto-escalates to manager.
- Reminders: configurable reminder schedule (e.g., remind after 24h, escalate after 48h).
- Task history: full audit of who completed each task, when, and what they entered.

### 3.5 Pre-Built Workflow Library
HiveAutomation ships with pre-built workflows for common enterprise processes:

**Finance**
- Invoice approval (3-way match → AI validation → manager approval → ERP posting)
- Expense report approval
- Budget exception approval
- Vendor payment run

**HR**
- Employee onboarding (IT provisioning → desk setup → training assignment → 30-day check-in)
- Offboarding (access revocation → equipment return → exit interview → final pay)
- Performance review cycle management
- Job requisition approval

**Procurement**
- Purchase requisition → PO approval → vendor order → receipt confirmation → invoice match
- Vendor onboarding and qualification
- Contract renewal management

**AI Operations**
- Model deployment pipeline (evaluate → stage → canary → production)
- Compliance evidence collection (triggered monthly)
- Data quality remediation (triggered by HiveData quality alert)

### 3.6 Workflow Observability
Every workflow run is observable in HiveConsole:
- Execution timeline: visual representation of each step, its status, duration, and output.
- Current state: exactly which step is executing or waiting.
- Event history: complete Temporal event log for the workflow run.
- Error details: activity failures with stack traces and retry history.
- Human task status: pending, completed, escalated — for every human step.

### 3.7 Sub-Workflows & Composition
- Complex processes decompose into reusable sub-workflows.
- Parent workflow calls child workflow and waits for completion.
- Child workflow can run in parallel with other activities in the parent.
- Shared workflow library: platform-level and tenant-level libraries of reusable sub-workflows.

---

## 4. Integration Connectors
Pre-built activity implementations for common systems:

| System | Available Actions |
|---|---|
| CerebroERP | Read/write GL, AP, AR, inventory, orders |
| CerebroCRM | Read/write accounts, contacts, opportunities |
| CerebroHR | Read employees, submit onboarding tasks |
| HiveStorage | Read/write files |
| HiveData | Trigger pipelines, read datasets |
| HiveAgents | Spawn agent tasks, await completion |
| Slack | Send messages, create channels, post blocks |
| Email | Send templated emails, await reply |
| DocuSign | Send for signature, await completion |
| Jira / Linear | Create issues, update status |
| External REST APIs | Generic HTTP activity (configurable) |
| Webhooks | Send and receive |

---

## 5. Technology Stack

| Component | Technology |
|---|---|
| Workflow Engine | Temporal (durable workflow runtime) |
| Workflow Language | Python (primary) + TypeScript (supported) |
| Visual Builder | React + React Flow (node-based workflow editor) |
| Human Task Delivery | Custom service (Slack integration, email, HiveConsole inbox) |
| Activity Workers | Python Temporal workers on HiveCompute |
| Workflow Storage | Temporal Server (Cassandra backend for event history) |
| API | FastAPI (workflow management API, wraps Temporal SDK) |

---

## 6. SLAs

| Metric | Target |
|---|---|
| Workflow start latency | <5 seconds |
| Activity retry recovery time | <30 seconds after transient failure |
| Workflow durability (survive any single component failure) | 100% (Temporal design guarantee) |
| Human task delivery latency | <60 seconds |
| Workflow history retention | 90 days after completion |
| Temporal server availability | 99.9% |

---

## 7. Roadmap

| Milestone | Timeline |
|---|---|
| AI-generated workflow drafts (describe process in plain language → generated workflow) | Q4 2026 |
| Process mining (analyze historical task logs to discover and document undocumented processes) | Q1 2027 |
| Workflow simulation (test workflow against synthetic inputs before deploying to production) | Q1 2027 |
| Cross-tenant workflow federation (workflows that span multiple tenant boundaries with governance) | Q2 2027 |
