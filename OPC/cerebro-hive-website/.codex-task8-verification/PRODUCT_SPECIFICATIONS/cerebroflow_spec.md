# Product Specification: CerebroFlow™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Phase:** 2.5 — Enterprise Product Specifications

## 1. Product Overview

**CerebroFlow™** is the AI automation suite of the CerebroHive Intelligence Mesh. It provides a visual, drag-and-drop canvas for building recursive, fault-tolerant pipelines that connect LLM decision nodes, data sources, and external APIs.

* **Product Family**: Cerebro Applications
* **Category**: Enterprise Automation
* **Personas**: Technical (DevOps, IT), Business (Ops Managers, RevOps)

---

## 2. Core Workflows & User Journeys

### 2.1 Visual Pipeline Construction
- **The Journey**: A RevOps manager automates lead enrichment.
- **Workflow**:
  1. Opens the Flow Canvas and adds a webhook trigger for "New Lead Created in Salesforce".
  2. Drags in a reasoning node (LLM) to extract the lead's company domain.
  3. Connects an API node (Clearbit/LinkedIn) to fetch company data.
  4. Adds a conditional routing node: If company size > 1000, route to Enterprise Sales agent; else, route to automated email sequence.

### 2.2 Human-in-the-Loop Escalation
- **The Journey**: An automated invoice processing pipeline encounters an anomaly.
- **Workflow**:
  1. The pipeline parses an invoice using `CerebroSearch` vision capabilities.
  2. The extracted amount exceeds the vendor's historical average by 400%.
  3. The pipeline suspends execution and routes an approval card to a human manager in `CerebroStudio`.
  4. Upon human approval, the pipeline resumes and submits the payment to the ERP.

### 2.3 Recursive Fault Tolerance
- **The Journey**: An external API rate-limits the pipeline.
- **Workflow**:
  1. The API node fails with a 429 status code.
  2. CerebroFlow's LangGraph engine automatically catches the error.
  3. It executes a predefined fallback path (e.g., waiting 5 minutes with exponential backoff) or routes the payload to a dead-letter queue for later processing.

---

## 3. High-Level Architecture

CerebroFlow translates visual graphs into executable state machines.

* **Frontend**: Next.js with React Flow for the visual canvas builder.
* **Execution Engine**: Python-based LangGraph running in Celery/BullMQ workers for stateful, long-running processes.
* **Storage**: PostgreSQL for pipeline definitions and execution history state.

---

## 4. Key Entities (Prisma Schema Impact)

CerebroFlow requires the following foundational entities in the backend schema:

* `PipelineDefinition`: The structural graph of the workflow.
  * `id`, `name`, `triggerType`, `graphJson`
* `NodeConfig`: Configuration for individual steps within a pipeline.
  * `id`, `pipelineId`, `nodeType` (e.g., LLM, API, Condition), `parameters`
* `ExecutionRun`: A specific instance of a pipeline running.
  * `id`, `pipelineId`, `status` (Running, Suspended, Completed, Failed), `stateBlob`
* `DeadLetterQueue`: Failed executions awaiting manual retry or inspection.
  * `id`, `executionId`, `errorReason`, `payload`

---

## 5. Integrations & Dependencies

* **Upstream (Depends on)**:
  * `HiveAPI` & `HiveOps`: For all LLM routing and token tracking.
  * `HiveIdentity`: For authorization to execute pipelines.
* **Downstream (Outputs to)**:
  * `CerebroStudio`: Pushing human-in-the-loop approval cards.
* **External Integrations**:
  * 150+ SaaS APIs (Salesforce, Zendesk, Jira, Stripe) via the Tool Registry.

---

## 6. Security & Governance Constraints

* **API Key Vault**: CerebroFlow must never store raw API keys in the `NodeConfig`. It must reference secure secret IDs held in `HiveShield` or a secure vault.
* **Audit Trails**: Every execution step, particularly the inputs and outputs of LLM reasoning nodes, must be logged immutably for compliance.
