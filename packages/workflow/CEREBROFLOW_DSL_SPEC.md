# CerebroFlow DSL Specification v1.0

**Product:** CerebroFlow™ — AI Workflow Automation & Orchestration Engine  
**Primary AI:** Claude | **Status:** Production  
**Schema version:** `1.0`

---

## Overview

CerebroFlow uses a declarative YAML-based DSL to define workflows as directed acyclic graphs (DAGs). Each workflow is a JSON/YAML document conforming to the `WorkflowDSL` interface. Workflows are versioned, audited, and executed by the CerebroFlow engine.

---

## Minimal Example

```yaml
version: "1.0"
id: wf_invoice_approval
name: Invoice Approval
description: Route invoices over $5,000 to finance director for approval.
category: finance
tags: [invoice, approval, finance]

trigger:
  type: file_uploaded
  event_topic: finance.invoice.received

nodes:
  - id: extract
    type: llm
    name: Extract Invoice Data
    config:
      kind: llm
      model: claude-sonnet-5
      system_prompt: Extract structured data from invoices with perfect accuracy.
      user_prompt_template: "Extract invoice data from: {{invoice.raw_text}}. Return JSON."
      output_variable: invoice_data

  - id: check_threshold
    type: condition
    name: Amount > $5,000?
    depends_on: [extract]
    config:
      kind: condition
      expression:
        left: "{{invoice_data.total}}"
        operator: gt
        right: 5000
      true_path: [approve]
      false_path: [auto_post]

  - id: approve
    type: human_approval
    name: Finance Director Approval
    config:
      kind: human_approval
      assignee_ref: role:finance_director
      task_title: "Invoice Approval: {{invoice_data.vendor}} — ${{invoice_data.total}}"
      task_description_template: "Review invoice from {{invoice_data.vendor}} for ${{invoice_data.total}}."
      timeout_hours: 24
      on_timeout: escalate

  - id: auto_post
    type: api
    name: Post to ERP
    config:
      kind: api
      url_template: https://api.internal/erp/invoices
      method: POST
      auth:
        type: bearer
        secret_ref: vault:erp_token   # ← Always a vault reference. Never inline secrets.
      body_template: '{"invoice": {{invoice_data}}}'
      output_variable: erp_result

edges:
  - { id: e1, source: extract, target: check_threshold }
  - { id: e2, source: check_threshold, target: approve, label: "true" }
  - { id: e3, source: check_threshold, target: auto_post, label: "false" }
  - { id: e4, source: approve, target: auto_post }

error_handling:
  default_on_error: dead_letter
  dead_letter_queue:
    enabled: true
    retention_days: 90
    auto_retry_after_hours: 24
  global_timeout_minutes: 1440

audit:
  log_node_lifecycle: true
  log_llm_io: true
  log_api_io: true
  redact_fields: [bank_account, routing_number, ssn]
  retention_days: 2555
  compliance_tags: [SOX, SOC2]

metadata:
  author: Claude
  created_at: "2026-08-07T00:00:00Z"
  updated_at: "2026-08-07T00:00:00Z"
  sla_minutes: 240
  compliance_tags: [SOX]
```

---

## Node Types

| Type | Purpose | Required config fields |
|------|---------|----------------------|
| `llm` | Call an LLM with a prompt template | `model`, `system_prompt`, `user_prompt_template`, `output_variable` |
| `api` | HTTP call to any external API | `url_template`, `method`, `output_variable` |
| `condition` | Branch execution based on a condition | `expression`, `true_path`, `false_path` |
| `transform` | Map/reshape context variables | `mappings`, `output_variable` |
| `human_approval` | Suspend execution for human decision | `assignee_ref`, `task_title`, `task_description_template`, `timeout_hours`, `on_timeout` |
| `notification` | Send email/Slack/SMS/Teams message | `channel`, `recipient_ref`, `body_template` |
| `delay` | Wait a fixed duration | `duration_seconds` |
| `loop` | Iterate over an array in context | `iterate_over`, `body_nodes` |
| `parallel` | Run branches concurrently | `branches`, `join_strategy` |
| `data_lookup` | Query database or cache | `source`, `query_template`, `output_variable` |
| `script` | Run inline TypeScript/Python | `runtime`, `code`, `output_variable` |

---

## Variable Interpolation

Use `{{variable}}` syntax anywhere in template strings. Variables are resolved from the execution context at runtime.

```yaml
user_prompt_template: "Summarise the contract for {{deal.company_name}} worth ${{deal.arr}} per year."
```

Dot-notation traverses nested objects: `{{invoice_data.vendor.name}}`

Special variables always available:
- `{{execution.id}}` — current execution ID
- `{{execution.started_at}}` — ISO timestamp
- `{{trigger.type}}` — what triggered this run
- `{{loop.item}}` — current item inside a `loop` node
- `{{loop.index}}` — zero-based loop index

---

## Condition Operators

| Operator | Meaning |
|----------|---------|
| `eq` | Equal |
| `neq` | Not equal |
| `gt` / `gte` | Greater than / or equal |
| `lt` / `lte` | Less than / or equal |
| `contains` | String contains |
| `not_contains` | String does not contain |
| `starts_with` | String starts with |
| `is_null` | Value is null/empty |
| `is_not_null` | Value is present |
| `in` | Value in comma-separated list |
| `not_in` | Value not in list |

Compound conditions via `and` / `or` arrays on the expression object.

---

## Secrets & Security

**Never** store raw credentials in workflow definitions. Always use vault references:

```yaml
auth:
  type: bearer
  secret_ref: vault:my_api_token   # resolved by HiveShield vault at runtime
```

Redact PII from audit logs via `audit.redact_fields`.

---

## Error Handling

Three global strategies via `error_handling.default_on_error`:

| Strategy | Behaviour |
|----------|-----------|
| `fail` | Stop execution immediately, mark as failed |
| `dead_letter` | Route to DLQ for inspection and manual retry |
| `escalate` | Trigger escalation chain (requires `escalation` config) |

Override per node with `on_error` field.

---

## Escalation Tiers

```yaml
error_handling:
  escalation:
    tiers:
      - level: 1
        assignee_ref: role:manager
        sla_minutes: 60
        notification_channels: [email, slack]
        message_template: "Action required on {{workflow.name}} — {{elapsed_minutes}} mins elapsed."
      - level: 2
        assignee_ref: role:director
        sla_minutes: 240
        notification_channels: [email, slack, sms]
        message_template: "ESCALATED L2: {{workflow.name}} — {{elapsed_minutes}} mins elapsed."
    always_notify: [compliance@cerebrohive.com]
```

---

## Human Approval `on_timeout` Options

| Value | Behaviour |
|-------|-----------|
| `escalate` | Move to next escalation tier |
| `auto_approve` | Approve automatically (use only for low-risk flows) |
| `auto_reject` | Reject automatically |
| `dead_letter` | Route to DLQ |

---

## Compliance & Audit

Set `audit.compliance_tags` to activate framework-specific retention and controls:

| Tag | Retention minimum | Extra controls |
|-----|------------------|---------------|
| `SOX` | 7 years (2555 days) | Immutable log chain, change approval |
| `SOC2` | 1 year (365 days) | Encrypted storage, access logging |
| `GDPR` | Data minimisation — redact PII | `redact_fields` mandatory for personal data |
| `HIPAA` | 6 years | PHI field redaction mandatory |

---

## NL Compiler

Use `NLWorkflowCompiler.compile(description)` to generate a workflow skeleton from plain English:

```typescript
const compiler = new NLWorkflowCompiler();
const workflow = compiler.compile(
  'When a new invoice is uploaded, extract the data using AI, ' +
  'check if it exceeds $5,000, and if so route to the finance director for approval.'
);
// Returns a complete WorkflowDSL — review before deploying
```

---

## Templates

20 production-ready templates are bundled in `@cerebro/workflow`:

| ID | Name | Category |
|----|------|---------|
| `tpl_hr_001` | Employee Onboarding Automation | HR |
| `tpl_hr_002` | Leave Request Approval | HR |
| `tpl_fin_001` | Invoice Processing & Approval | Finance |
| `tpl_fin_002` | Expense Reimbursement | Finance |
| `tpl_sales_001` | Lead Enrichment & Routing | Sales |
| `tpl_sales_002` | Contract Generation & eSign | Sales |
| `tpl_legal_001` | NDA Review & Execution | Legal |
| `tpl_ops_001` | P1 Incident Response | Ops |
| `tpl_ops_002` | Vendor Onboarding & Security Review | Ops |
| `tpl_ops_003` | Scheduled Compliance Report | Compliance |

```typescript
import { getTemplateById, searchTemplates } from '@cerebro/workflow';
const template = getTemplateById('tpl_hr_001');
const hrTemplates = searchTemplates('onboarding');
```
