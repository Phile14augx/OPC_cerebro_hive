# Perceptronic Enterprise Knowledge Graph

**Status:** FROZEN at L3 — 2026-08-15. No further Wave 0 spec or runtime work.  
**Ledger:** `KRN-015` (parent) · subordinate IDs `KRN-KG-001` … `KRN-KG-012`  
**Product surface:** `PROD-022` HiveKnowledge (does **not** add a 51st product)  
**ADR:** [`decisions/nexarch/0001-perceptronic-enterprise-knowledge-graph.md`](./decisions/nexarch/0001-perceptronic-enterprise-knowledge-graph.md)  
**Existing code:** `packages/knowledge-graph-core`, `packages/ontology-sdk`, `packages/domain-graph`, `services/knowledge-api`  
**Evidence today:** L3. Ontology typecheck is surface evidence only — not an integrated graph runtime. Next implementation window: Wave 1 after W0.3.

---

## 0. Architectural identity

**Perceptronic Knowledge Graph** is a Nexarch term, not a standard literature label. It names a living cognitive map of **knowledge + humans + organization + agents + models + tools + workflows + permissions**.

The useful distinction from a static entity/relationship database:

| Layer | Nodes carry | Edges carry |
|---|---|---|
| Structural | type, properties, identity | semantics, direction |
| Epistemic | confidence, provenance, verification state | inferred vs verified |
| Temporal | `validFrom` / `validUntil`, freshness | observation time, supersession |
| Runtime | activation, importance, authority, trust, embedding | strength, live activity |
| Governance | classification, tenant, workspace, purpose, risk | policy constraints on traversal |

A query does not merely return connected records. It **activates an authorized subgraph**.

**Invariant:** one ontology, many filtered projections. Do not build a separate employee graph, department graph, agent graph, model graph, and knowledge graph.

Personal OS and Enterprise Agentic OS consume the same identity, agent, memory, knowledge, policy, and evaluation primitives.

### Locked invariants (2026-08-15) — architecturally frozen

- **Authority:** PostgreSQL + immutable provenance is the only truth plane.
- **Derived infrastructure:** Neo4j, Qdrant, caches, embedding indexes, graph projections, and visualization indexes are disposable.
- **Illegal architecture test:** if deleting a projection destroys unrecoverable business truth, the implementation is non-compliant.
- **Ontology authority:** `packages/knowledge-graph-core/src/ontology/Ontology.ts` is the single canonical type surface. No parallel perceptronic ontology.
- **Backward compatibility:** literals such as `AIModel`, `BusinessService`, `ConfigurationItem`, and `Policy` remain stable; `familyOf` classifies without breaking callers.
- **Six families:** `KNOWLEDGE`, `ORGANIZATION`, `WORK`, `AI`, `SYSTEM`, `GOVERNANCE`.
- **Security ordering:** `KRN-KG-010` is a prerequisite for every graph capability that can expose or act on information — activation, reasoning, visualization, agent context, and audit — not merely the UI.
- **Activation never redacts afterward.** The perceptronic activation engine and graph reasoner operate only on an already authorized projection. Calculating activation over the unrestricted enterprise graph and then filtering is forbidden (hidden-node inference, relationship leakage, vector-neighbor leakage, agent traversal across boundaries).
- **Maturity:** `KRN-015 = L3`. Package typecheck is ontology-surface evidence, not evidence of an integrated graph runtime.
- **Execution boundary:** no graph runtime work belongs in Wave 0. Earliest implementation: Wave 1 after W0.3 durable persistence.
- `PROD-022` HiveKnowledge remains the product façade. `KRN-KG-001`…`KRN-KG-012` do not expand the 27-capability kernel. Personal OS and Enterprise Agentic OS consume this graph. CerebroEDA remains Postgres-backed under `eios-eda/0012`.

---

## 1. One graph, four planes

```text
┌────────────────────────────────────────────────┐
│ P4 — PERCEPTION / REASONING                    │
│ activation, attention, inference, similarity   │
├────────────────────────────────────────────────┤
│ P3 — OPERATIONAL                               │
│ agents, models, workflows, tools, executions   │
├────────────────────────────────────────────────┤
│ P2 — SEMANTIC                                  │
│ concepts, facts, people, products, departments │
├────────────────────────────────────────────────┤
│ P1 — GOVERNANCE                                │
│ identity, access, policy, provenance, audit    │
└────────────────────────────────────────────────┘
```

**P1 constrains P2, P3, and P4.** Reasoning, retrieval, embeddings, visualization, and agents cannot bypass policy.

```text
                         CEREBRO PERCEPTRONIC GRAPH
┌───────────────────────────────────────────────────────────────────┐
│       KNOWLEDGE                         ORGANIZATION              │
│   Document ──contains──> Concept      Employee ──member_of──> Dept│
│      ├─supports─> Claim               ├─has_role──────────────┘   │
│      ├─source_of─> Fact               └─owns─────────────┐        │
│      └─mentions──────────────────────────────────────────┤        │
│                       PROJECT / DOMAIN / PROCESS / GOAL           │
│    Agent ─────uses──────> Model              Workflow             │
│      ├─uses────────────> Tool                                     │
│      ├─has_memory──────> Memory                                   │
│      ├─executes────────> Task                                     │
│      └─governed_by─────> Policy                                   │
│              AI / AGENTIC EXECUTION PLANE                         │
├───────────────────────────────────────────────────────────────────┤
│ Identity • Entitlement • Policy • Classification • Provenance     │
│ Approval • Audit • Tenant • Workspace • Purpose • Risk            │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Canonical node taxonomy

Six top-level families. Concrete types live *under* families. Properties stay on nodes. Relationships are first-class.

```text
KNOWLEDGE
ORGANIZATION
WORK
AI
SYSTEM
GOVERNANCE
```

| Family | Canonical types | Legacy CMDB/AI-ops kinds (string values unchanged) |
|---|---|---|
| Knowledge | Document, Page, Chunk, Concept, Fact, Claim, Decision, PolicyDocument, ResearchPaper, Dataset | `Dataset` |
| Organization | Person, Employee, Role, Team, Department, BusinessUnit, Organization | — |
| Work | Project, Product, Process, Workflow, Task, Goal, KPI | `BusinessService` (Service), `BusinessCapability` (Capability), `ChangeRequest`, `Incident` |
| AI | Agent, AgentVersion, ModelVersion, Prompt, Tool, Skill, Memory | `AIModel` (Model), `AIEvaluation` (Evaluation), `AIProvider` |
| System | Application, API, Database, Repository, Connector, DataSource | `ConfigurationItem`, `Deployment` |
| Governance | Tenant, Workspace, Permission, Classification, Approval, Control, AuditEvidence | `Policy`, `Risk` |

`familyOf(kind)` on `EnterpriseOntology` is the only family mapping. Do not persist a second type discriminator.

Do **not** turn attributes into nodes. `displayName`, `title`, `status`, `tenantId`, `workspaceId`, `securityClassification` are properties of `Employee`. `HAS_ROLE`, `MEMBER_OF`, `OWNS` are relationships.

Canonical surface: `packages/knowledge-graph-core/src/ontology/Ontology.ts`. Extend this file; do not create a parallel ontology package or enum.

---

## 3. Relationship ontology

Edges are where structural questions become traversable. Representative types:

```text
Employee ──MEMBER_OF──> Department
Employee ──REPORTS_TO──> Employee
Employee ──HAS_ROLE──> Role
Employee ──HAS_SKILL──> Skill
Employee ──OWNS──> Product
Employee ──AUTHORED──> Document
Employee ──SUPERVISES──> Agent

Department ──OWNS──> Process | Dataset
Department ──USES──> Application

Agent ──USES_MODEL──> ModelVersion
Agent ──CAN_USE──> Tool
Agent ──RETRIEVES_FROM──> KnowledgeDomain
Agent ──HAS_MEMORY──> Memory
Agent ──EXECUTES──> Workflow
Agent ──ACTS_FOR──> Employee | Department
Agent ──GOVERNED_BY──> Policy

Model ──PROVIDED_BY──> Provider
Model ──HAS_VERSION──> ModelVersion
Model ──APPROVED_FOR──> UseCase | DataClassification
Model ──RESTRICTED_FOR──> DataClassification

Document ──CONTAINS──> Chunk
Document ──MENTIONS──> Entity
Document ──SUPPORTS──> Claim
Document ──SUPERSEDES──> Document
Document ──AUTHORED_BY──> Employee
Document ──GOVERNED_BY──> Policy
```

This answers questions ordinary RAG cannot:

> Which agents used by Finance have access to customer information and are currently configured with models that are not approved for Restricted data?

That is a **policy-pruned graph traversal**, not semantic document retrieval.

---

## 4. Perceptronic runtime state

Every node (and, where meaningful, every edge) carries runtime state:

```text
activation    confidence    importance    authority
freshness     sensitivity   trust         embedding
lastObservedAt  validFrom   validUntil    provenance
```

Activation is explainable. A conceptual score, computed **only on the authorized projection**:

```text
Activation =
    semantic relevance
  + graph proximity
  + task relevance
  + authority
  + recency
  + causal relevance
  - uncertainty
  - residual policy/risk penalty   // never a substitute for KRN-KG-010
```

The residual penalty may rank already-visible nodes. It must not be the mechanism that hides unauthorized nodes.

```text
WRONG
─────
Enterprise Graph
      ↓
Activation / Reasoning
      ↓
Policy Filter
      ↓
User / Agent

CORRECT
───────
Enterprise Graph
      ↓
Identity + Purpose + Policy
      ↓
Authorized Graph Projection
      ↓
Activation / Reasoning
      ↓
Visualization / Agent Context
```

Clicking an activated node must show the decomposition (why activated), not a black-box rank. Example query: “Why is Twin Studio delayed?” activates the project neighbourhood (open PRs, runtime core, visual tests, review gates) with per-node scores and provenance.

Current `SemanticNode` has `id`, `kind`, `labels`, `properties`, `version`, `provenance`. Perceptronic fields belong on the node (or a runtime overlay keyed by `nodeId + queryId`), not only in `properties` JSON.

---

## 5. Access control is part of the graph

Forbidden:

```text
User queries graph → Graph returns results → UI hides unauthorized results
```

That leaks existence, degree, and neighbourhood.

Required:

```text
Identity → Context → Policy Evaluation → AUTHORIZED SUBGRAPH
  → Graph traversal → Vector retrieval → Reasoning → Visualization
```

An unauthorized node must **not exist from that subject's perspective**. Policy filter occurs **before** model context construction.

Enforcement primitives already in the estate: application policy plane (`KRN-003` RBAC/ABAC, `KRN-004` policy engine), PostgreSQL RLS for the system of record, graph-store privileges if a native graph projection is later adopted. UI hiding is never the control.

---

## 6. Authorization is multi-dimensional

A single Level-1…Level-4 ladder is inadequate.

### Dimension A — organizational scope

`PRIVATE` · `TEAM` · `DEPARTMENT` · `BUSINESS_UNIT` · `ORGANIZATION` · `TENANT` · `FEDERATED` · `PUBLIC`

### Dimension B — classification

`PUBLIC` · `INTERNAL` · `CONFIDENTIAL` · `RESTRICTED` · `PRIVILEGED` · `REGULATED` · `SECRET`

### Dimension C — capability

```text
DISCOVER  READ  TRAVERSE  RETRIEVE  SUMMARIZE  WRITE  LINK  DELETE
INVOKE_AGENT  INVOKE_TOOL  USE_MODEL  EXECUTE_WORKFLOW
APPROVE  DELEGATE  EXPORT  TRAIN  ADMINISTER
```

These are independent. Example grant: Finance department scope, classification ≤ `CONFIDENTIAL`, actions `DISCOVER|READ|RETRIEVE`, model invocation permitted, export denied, agent delegation denied.

---

## 7. Purpose-based access (agents)

Agent access is not “Agent X can read Finance documents.” It is:

```text
Agent X CAN_ACCESS Finance documents ONLY IF
  task.department == FINANCE
  AND purpose == INVOICE_RECONCILIATION
  AND requester.hasPermission(FINANCE_OPERATIONS)
  AND model.classification >= CONFIDENTIAL
  AND environment == ENTERPRISE
  AND export == false
```

Policy evaluates: **Subject, Resource, Action, Environment, Purpose, Delegation chain, Risk**.

This is RBAC + ABAC + relationship-based authorization + purpose-based control, on one engine (`KRN-004`).

---

## 8. One policy plane for humans and agents

Subjects: `Human` · `Agent` · `ServiceAccount` · `Application` · `Workflow` · `ModelRuntime`.

Delegation never automatically expands authority. Effective agent authority is an intersection:

```text
effective agent authority
  = requester authority
  ∩ agent authority
  ∩ task authority
  ∩ resource policy
  ∩ model policy
```

---

## 9. Models are governed graph entities

Model nodes carry provider, capabilities, context window, modalities, residency, cost profile, security tier, approved data classes, deployment environment.

```text
Task → data classification → policy graph → eligible models → model router → selected model
```

`KRN-010` Model Router queries this graph before routing. External models prohibited for customer PII; internal models approved for Restricted; and so on.

---

## 10. Provenance-aware knowledge

Never store a fact without provenance. Every fact (and claim) carries:

```text
source  sourceType  sourceURI  observedAt  validFrom  validUntil
confidence  verificationState  extractor  modelVersion
```

Edges include `ASSERTED_BY`, `EXTRACTED_FROM`, `VERIFIED_BY`, `SUPPORTED_BY`, `CONTRADICTED_BY`.

Current `Provenance` (`createdBy`, `sourceSystem`, `confidenceScore`, timestamps) is the seed. It is not yet claim/fact separated.

---

## 11. Separate observations, claims, and canonical facts

Epistemic states:

```text
OBSERVATION → CLAIM → (optional) PROPOSAL → CANONICAL_FACT
```

```text
Document A: "Product X has 20,000 customers."
        ↓ EXTRACTS
Claim #91823  value=20000  confidence=.97
        ↓ SUPPORTED_BY  Document A
        ↓ VERIFIED_AS
Canonical Fact: Product X customer count = 20000  validAt=2026-08-15
```

Conflicting documents coexist. Agents write observations and claims. Humans or validation agents promote canonical facts. Agents do not silently rewrite truth.

---

## 12. Graph + vector, not graph versus vector

| Mode | Good for |
|---|---|
| Graph retrieval | Who reports to whom; what depends on this; which agents have access; which model this agent uses; what caused this incident |
| Vector retrieval | Conceptual similarity; discussions; related policies under different terminology |
| Hybrid | Embed → candidate nodes → graph expansion → policy prune → authorized evidence subgraph → agent reasoning |

`KRN-KG-006` is the hybrid path. It **consumes** `KRN-016` Vector/Retrieval; it does not replace it.

---

## 13. Knowledge fabric (storage)

Do not force one database to do everything. Do not make the visualization graph the system of record.

```text
                    CEREBRO KNOWLEDGE FABRIC

                PostgreSQL  —  system of record
                RLS / transactions / CDC / domain events
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
  Graph projection           Vector projection
  (port; Postgres            (port; pgvector now;
   adjacency now;             Qdrant allowed later)
   native graph allowed
   later on measured trigger)
        └────────────┬────────────┘
                     ▼
              Knowledge Gateway
                     ▼
                Policy Engine
                     ▼
           Humans · Agents · Applications
```

**Now (evidence-aligned):** Postgres remains SoR. `knowledge-graph-core` exposes a port; the current adapter is in-memory. `KRN-016` is pgvector. CerebroEDA’s design graph stays on PostgreSQL adjacency tables per [`eios-eda/0012`](./decisions/eios-eda/0012-eda-knowledge-graph-store.md) until that ADR’s measured swap triggers fire.

**Target projections:** a native graph store (Neo4j is the named candidate) and a dedicated vector store (Qdrant is the named candidate) may sit *behind the same ports* as projections of Postgres. They are not a second source of truth.

**Reconstructibility (hard rule):** every derived graph store, vector index, cache, and visualization index is disposable. It must be rebuildable from PostgreSQL plus immutable source/provenance records. If a projection cannot be dropped and reconstructed without data loss, it has become an illegal truth plane and must be demoted.

**Wave-1 acceptance test (preserve; do not implement in Wave 0):**

```text
1. Seed authoritative PostgreSQL records + provenance
2. Build graph/vector projections
3. Record deterministic verification hashes/counts
4. Drop Neo4j/Qdrant/projection stores completely
5. Recreate empty stores
6. Rebuild exclusively from authoritative records
7. Compare semantic entity/edge/vector inventories
8. Confirm zero unrecoverable state
```

Failure means the projection has accidentally become a second system of record. This test is a Wave-1 gate for `KRN-KG-006` and any later native-store adapter.

---

## 14. Visual lenses (not the whole enterprise hairball)

Projections, not dumps:

| Lens | Shows |
|---|---|
| Organization | reporting lines, teams, department agents |
| Knowledge | concept maps, claims, documents |
| Agent | model, tools, knowledge domains, policy |
| Access | subject → role → capabilities → resources |
| Model | consumers, approvals, denials, cost center, provider |
| Risk | high-sensitivity data, powerful tools, external models, broad delegation, excessive human privilege |

`KRN-KG-010` Policy-Aware Graph Projection is a **hard dependency** of `KRN-KG-007` activation, `KRN-KG-008` reasoning, and `KRN-KG-009` visualization. Do not ship an attractive UI that later has to be redesigned for enterprise access control.

---

## 15. Visual semantics

| Channel | Encodes |
|---|---|
| Shape | type (human, department, agent, model, document, tool, concept, policy) |
| Size | importance / centrality |
| Halo | current activation |
| Opacity | confidence / freshness |
| Border | classification |
| Edge thickness | relationship strength |
| Dashed vs solid | inferred vs verified |
| Animated edge | live agent/tool/data activity |

The graph is an operational interface, not a topology poster.

---

## 16. Query execution order

Example: “Show me everything related to Project Atlas and which agents can help me.”

```text
 1. Authenticate subject
 2. Build authorization context
 3. Resolve "Project Atlas"
 4. Retrieve semantic candidates
 5. Traverse graph
 6. Apply node + edge policies
 7. Remove inaccessible vectors/chunks
 8. Find eligible agents
 9. Check model/tool permissions
10. Rank activated subgraph
11. Render graph
12. Answer with provenance
13. Audit complete traversal
```

Steps 1–2 and 6–7 are not optional post-filters.

---

## 17. Temporal graph

Relationships support `validFrom`, `validUntil`, `observedAt`, `supersededAt`. Current `SemanticEdge` already has `validFrom` / `validUntil`.

Required questions: “Who owned this system when the incident occurred?” A timeline control must replay topology, not only today’s snapshot.

---

## 18. Shared kernel, two OS profiles

```text
              PERCEPTRONIC GRAPH
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    PEOPLE        KNOWLEDGE       AI
                     │
                     ▼
             ENTERPRISE CONTEXT
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   Personal OS   Enterprise OS   Products
                     │
                     ▼
              ACTION / DECISION
                     │
              AUDIT + LEARNING ──► GRAPH
```

`OS-P-005` Knowledge and the Enterprise OS knowledge primitive are projections of this graph, not separate implementations.

---

## 19. Kernel capability decomposition

Parent ledger row remains **`KRN-015` Knowledge Graph** (one of the 27). Subordinate IDs do **not** increase the kernel count.

```text
KRN-KG-001  Ontology
      ↓
KRN-KG-002  Entity Resolution
      ↓
KRN-KG-003  Knowledge Ingestion
      ↓
KRN-KG-004  Provenance / Claims
      ↓
KRN-KG-005  Temporal Graph
      ↓
KRN-KG-006  Hybrid Retrieval Ports
      ↓
KRN-KG-010  Policy-Aware Projection
      ↓
      ├───────────────┐
      ▼               ▼
KRN-KG-007        KRN-KG-008
Activation        Graph Reasoning
      └───────┬───────┘
              ↓
KRN-KG-009  Visualization
              ↓
KRN-KG-011  Agent Graph Interface
              ↓
KRN-KG-012  Audit / Explainability
```

`KRN-KG-007` and `KRN-KG-008` may proceed in parallel after `KRN-KG-010`. Both must consume the authorized projection only. Agent interface and audit follow visualization.

This architecture is **frozen at L3**. Do not extend the spec, ontology, or graph runtime during Wave 0 to make it more “complete.” Wave-1 work opens after W0.3 durable persistence.

| ID | Capability | Depends on | Sequencing note |
|---|---|---|---|
| KRN-KG-001 | Graph Ontology | W0.3 then Wave 1 / KRN-015 | Six families in `Ontology.ts`; no fork |
| KRN-KG-002 | Entity Resolution | KRN-KG-001 | Before ingestion quality |
| KRN-KG-003 | Knowledge Ingestion | KRN-KG-002 | Documents, HR, agents, models, tools |
| KRN-KG-004 | Provenance & Claims | KRN-KG-003 | Observation / claim / canonical fact |
| KRN-KG-005 | Temporal Graph | KRN-KG-004 | Extend existing edge validity |
| KRN-KG-006 | Hybrid Graph/Vector Retrieval | KRN-KG-005, KRN-016 | Ports over reconstructible projections |
| KRN-KG-010 | Policy-Aware Graph Projection | KRN-KG-006, KRN-003, KRN-004 | Hard gate for 007–012 |
| KRN-KG-007 | Perceptronic Activation Engine | KRN-KG-010 | Explainable scores on authorized subgraph |
| KRN-KG-008 | Graph Reasoning | KRN-KG-010 | Bounded inference; existing `ReasoningEngine` |
| KRN-KG-009 | Graph Visualization | KRN-KG-007, KRN-KG-008 | Lenses; never before 010 |
| KRN-KG-011 | Agent Graph Interface | KRN-KG-009 | Same policy plane; intersection authority |
| KRN-KG-012 | Graph Audit & Explainability | KRN-KG-011, KRN-018 | Traversal audit + why-activated |

Implementation of runtime/persistence is **not** Wave 0 work. Wave 1 after W0.3. HiveKnowledge (`PROD-022`) is the product façade over this kernel, alongside HiveSemantic (`PROD-023`) and HiveVector (`PROD-024`).

---

## 20. Target experience

Organizational chart + knowledge map + agent control plane + model registry + IAM explorer + lineage system + live neural activation map — all derived from the same governed graph.

---

## References

- Ji, Pan, et al. [A Survey on Knowledge Graphs: Representation, Acquisition and Applications](https://arxiv.org/abs/2002.00388) (arXiv:2002.00388).
- Neo4j operations: graph privileges / subgraph access (enforcement primitive, not a SoR decision).
- Neo4j Cypher vector indexes; Qdrant payload filtering (projection-store candidates).
- In-repo: `knowledge/07-knowledge-graphs/KN-KG-000001.md` (GraphRAG), `eios-eda/0012` (EDA Postgres graph), `eios-eda/0002` (relational graph modelling preference).
