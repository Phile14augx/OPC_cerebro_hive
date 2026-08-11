# Product Specification: HiveForge™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Phase:** 2.5 — Enterprise Product Specifications

## 1. Product Overview

**HiveForge™** is the foundational developer environment for the CerebroHive Intelligence Mesh. It provides a comprehensive toolkit for AI Engineers, Data Scientists, and Developers to build, test, and deploy custom agents, fine-tune models, and define complex prompt templates.

* **Product Family**: Hive Platform
* **Category**: Developer Platform
* **Personas**: Developers, AI Engineers, System Integrators

---

## 2. Core Workflows & User Journeys

### 2.1 Agent Authoring & Configuration
- **The Journey**: An AI Engineer logs into HiveForge to create a new "Financial Analyst" agent.
- **Workflow**:
  1. Defines the agent's persona and system prompt using the *Prompt Studio*.
  2. Selects the underlying reasoning model from the *HiveOps Registry* (e.g., GPT-4o, Claude 3.5).
  3. Binds specific tools and APIs to the agent from the *Tool Registry* (e.g., Bloomberg API connector, internal SQL database connector).
  4. Configures the agent's memory window and access to specific RAG knowledge bases in `HiveData`.

### 2.2 Local Testing & Sandbox Evaluation
- **The Journey**: The developer tests the agent before pushing it to production.
- **Workflow**:
  1. Deploys the agent into an isolated sandboxed container.
  2. Runs a suite of automated evaluation scenarios (e.g., testing hallucination rates, tool execution accuracy).
  3. Views a step-by-step trace of the agent's reasoning process and memory recall.

### 2.3 Fine-Tuning Models
- **The Journey**: A Data Scientist fine-tunes a specialized open-weight model (e.g., Llama 3) on proprietary enterprise data.
- **Workflow**:
  1. Ingests a curated dataset from `HiveData`.
  2. Configures hyper-parameters for LoRA (Low-Rank Adaptation) fine-tuning.
  3. Initiates the training job on `HiveCompute` (allocating GPUs).
  4. Publishes the resulting adapter weights to the `HiveOps` Model Registry.

---

## 3. High-Level Architecture

HiveForge serves as the control plane for developer activities. It does not run production agents; it *orchestrates their creation*.

* **Frontend**: Next.js React application (The Forge Studio).
* **CLI**: A Rust-based CLI for local development (`hive CLI`).
* **Backend**: Node.js/GraphQL APIs that interface with `HiveCompute` for spinning up sandboxes.
* **Storage**: PostgreSQL for configuration state; Git integrations for version control.

---

## 4. Key Entities (Prisma Schema Impact)

HiveForge will require the following foundational entities in the backend schema:

* `AgentDefinition`: The configuration template for an agent.
  * `id`, `name`, `description`, `systemPrompt`, `modelId`
* `AgentToolBinding`: A mapping of tools an agent is authorized to use.
  * `agentId`, `toolId`, `permissions`
* `PromptTemplate`: Version-controlled prompts.
  * `id`, `version`, `content`, `variables`, `isProduction`
* `EvaluationRun`: Results of testing an agent in the sandbox.
  * `id`, `agentId`, `score`, `traceLogUrl`

---

## 5. Integrations & Dependencies

* **Upstream (Depends on)**:
  * `HiveIdentity`: For developer authentication and RBAC.
  * `HiveAPI`: All requests route through the gateway.
* **Downstream (Outputs to)**:
  * `HiveOps`: Pushes finalized models and agents to the production registry.
  * `CerebroAgent`: Provides the blueprints that the agent network instantiates.
* **External Integrations**:
  * GitHub/GitLab: Syncs agent configurations and prompts to standard source control.
  * VS Code / IntelliJ: Extensions for local development.

---

## 6. Security & Governance Constraints

* **Code Execution Sandbox**: Any custom Python or JS tools written in HiveForge must execute in strictly isolated, ephemeral Docker containers with no public internet access by default.
* **Credential Escrow**: Developers cannot hardcode API keys. They must use the `HiveIdentity` token escrow service.
* **Approval Gates**: Publishing an agent to production requires a manual sign-off step if the agent is bound to state-mutating tools (e.g., "Write to Database").
