# Product Specification: HiveCompute™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Infrastructure — Tier 1 (Base Layer)  
**Security Classification:** Tier 1 — Mission Critical

---

## 1. Product Overview

**HiveCompute™** is the elastic compute substrate for the CerebroHive Intelligence Mesh. It schedules, isolates, and optimizes every AI workload — from real-time inference to multi-day fine-tuning jobs — across heterogeneous hardware accelerators and cloud environments.

It is the lowest infrastructure layer that all other Hive services consume. No agent runs, no model infers, and no pipeline executes without compute resources allocated by HiveCompute.

---

## 2. Architectural Position

```
┌─────────────────────────────────────────────────────┐
│              Application Layer (Tier 4/5)           │
│         CerebroFlow, CerebroAgent, CerebroERP       │
├─────────────────────────────────────────────────────┤
│              AI Runtime Layer (Tier 3)              │
│      HiveAgents, HivePlanner, HiveReasoner          │
├─────────────────────────────────────────────────────┤
│             Platform Services (Tier 2)              │
│        HiveOps, HiveAPI, HiveForge                  │
├─────────────────────────────────────────────────────┤
│         ▶▶ HiveCompute (Tier 1) ◀◀                 │
│    GPU/CPU Scheduling • Isolation • FinOps          │
├─────────────────────────────────────────────────────┤
│             HiveNetwork (Tier 1)                    │
│        HiveStorage (Tier 1)                         │
│        HiveIdentity (Tier 0 — root)                 │
└─────────────────────────────────────────────────────┘
```

---

## 3. Core Workload Categories

HiveCompute schedules four distinct workload classes, each with different SLA requirements:

| Workload Class | Examples | SLA Requirement | Compute Type |
|---|---|---|---|
| **Real-time Inference** | Agent responses, CerebroAssist | <200ms P99 | GPU inference pods |
| **Batch Processing** | Pipeline runs, ETL, indexing | Minutes–hours | CPU/GPU workers |
| **Training & Fine-Tuning** | LoRA fine-tuning, model training | Hours–days | High-memory GPU clusters |
| **Sandbox Execution** | Agent sandboxes, test environments | Seconds | Isolated CPU containers |

---

## 4. Core Capabilities

### 4.1 Intelligent Workload Scheduling
The scheduler is a multi-objective optimizer that balances cost, latency, and fairness across all tenants.

- **Priority Queues**: Five priority levels (P0=emergency, P1=real-time, P2=interactive, P3=batch, P4=background). P0/P1 workloads preempt lower-priority jobs.
- **Bin Packing**: Maximizes hardware utilization through efficient task placement using a modified Best-Fit Decreasing (BFD) algorithm.
- **Spot Instance Integration**: P3/P4 workloads automatically route to spot/preemptible instances with transparent checkpoint-and-resume on preemption.
- **Gang Scheduling**: Multi-node distributed training jobs are scheduled atomically — all nodes start simultaneously or none do, preventing partial-allocation deadlocks.

### 4.2 Tenant Isolation
Every tenant's workloads run in hard-isolated compute namespaces:

- **Namespace Isolation**: Each tenant has a dedicated Kubernetes namespace with network policies preventing cross-tenant communication.
- **Resource Quotas**: Per-tenant CPU/GPU/memory quotas enforced at the namespace level. Quota breach returns HTTP 429 with retry-after header.
- **Node Affinity**: Enterprise Plus tenants can request dedicated node pools. Shared-tier tenants run on multi-tenant pools with strict cgroup limits.
- **GPU Partitioning**: NVIDIA MIG (Multi-Instance GPU) used on A100/H100 GPUs to partition a single physical GPU into up to 7 isolated instances for efficient sharing on inference workloads.

### 4.3 Auto-Scaling
- **Horizontal Pod Autoscaler (HPA)**: Scales inference pods based on GPU utilization and request queue depth.
- **Cluster Autoscaler**: Provisions new nodes from cloud provider in response to pending pod pressure, with configurable scale-out buffer.
- **Predictive Scaling**: ML model trained on historical workload patterns predicts burst demand 15 minutes ahead and pre-warms nodes, eliminating cold-start latency.
- **Scale-to-Zero**: Non-real-time workloads scale to zero after configurable idle timeout; HiveCompute maintains a pre-warmed pool for instant cold-start avoidance.

### 4.4 Cost Management (FinOps)
- **Cost Allocation Tags**: Every compute resource is tagged with tenant, product, workflow-id, and team for precise cost attribution.
- **Spot Savings Tracker**: Calculates realized savings from spot instance usage vs. on-demand baseline.
- **Budget Alerts**: Tenant administrators configure spend thresholds; alerts fire at 80% and 100% of budget.
- **Reserved Capacity**: Enterprise customers pre-purchase GPU-hours at discounted rates; HiveCompute guarantees capacity SLA for reserved pools.
- **Cost-vs-Latency Optimizer**: For batch workloads, surfaces the cost difference between different execution configurations and lets administrators choose their trade-off.

### 4.5 Job Management
- **Job Queue**: All submitted jobs enter a persistent queue (backed by PostgreSQL for durability). Jobs are never silently dropped.
- **Job Dependencies**: DAG-based job dependency management — downstream jobs only start after all upstream dependencies complete successfully.
- **Checkpointing**: Long-running training jobs checkpoint state to HiveStorage every N minutes (configurable). Preempted or failed jobs resume from the last checkpoint.
- **Resource Requests & Limits**: Every job specifies resource requests (guaranteed) and limits (maximum). Overcommit ratios are configurable per workload class.

---

## 5. AI-Native Capabilities

### 5.1 Demand Prediction Engine
A time-series ML model (Prophet + LSTM ensemble) trained on per-tenant workload history:
- Predicts compute demand at 15-minute, 1-hour, and 24-hour horizons.
- Triggers pre-warming of GPU nodes ahead of predicted demand spikes.
- Adjusts predictions based on calendar events (end-of-month reporting runs, Monday morning peaks).

### 5.2 Cost-Latency Trade-off Optimizer
For batch jobs, exposes an optimization API:
- Input: job spec + cost budget + deadline.
- Output: recommended configuration (instance type, spot vs. on-demand, parallelism level).
- Uses a Pareto frontier solver to present the cost-latency trade-off curve.

### 5.3 Anomaly Detection
- Detects workloads exhibiting abnormal resource consumption (e.g., a job consuming 10x its declared memory limit).
- Flags suspicious patterns (e.g., a tenant's compute usage spiking 500% in an hour) for security review via HiveShield.

---

## 6. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     HiveCompute Control Plane                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │   Scheduler  │  │  Autoscaler  │  │  Demand Predictor  │ │
│  │  (Go binary) │  │  (Go binary) │  │  (Python/ML)       │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────┘ │
│         │                 │                                   │
│  ┌──────▼─────────────────▼──────────────────────────────┐  │
│  │             Kubernetes API Server (EKS/GKE/AKS)        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬────────────────────────────┘
                                  │
           ┌──────────────────────┼─────────────────────────┐
           │                      │                         │
   ┌───────▼───────┐    ┌─────────▼──────┐    ┌────────────▼──┐
   │  GPU Node Pool │    │ CPU Node Pool  │    │  Spot Pool    │
   │ (NVIDIA A100  │    │ (C5/E-series)  │    │ (auto-managed)│
   │  MIG-enabled) │    │                │    │               │
   └───────────────┘    └────────────────┘    └───────────────┘
```

### Technology Stack
| Component | Technology |
|---|---|
| Orchestration | Kubernetes (EKS / GKE / AKS) |
| Scheduler | Custom Go binary (on top of kube-scheduler extender API) |
| GPU Management | NVIDIA GPU Operator, NVIDIA MIG Manager |
| Autoscaling | KEDA (event-driven) + Cluster Autoscaler |
| Observability | Prometheus, Grafana, OpenTelemetry |
| Job Queue | PostgreSQL-backed (durable) + Redis (fast path) |
| Cost Attribution | OpenCost (extended with custom tagging) |
| Demand Prediction | Python (Prophet + LSTM) |

---

## 7. Key Entities (Data Model)

```typescript
// Core entities managed by HiveCompute

ComputeJob {
  id: uuid
  tenantId: uuid
  workloadClass: "inference" | "batch" | "training" | "sandbox"
  priority: 0 | 1 | 2 | 3 | 4
  resourceRequest: { cpu: string, memory: string, gpu?: string }
  resourceLimit: { cpu: string, memory: string, gpu?: string }
  status: "pending" | "scheduled" | "running" | "completed" | "failed" | "preempted"
  checkpointPath?: string           // HiveStorage path
  costAllocated?: float             // USD, calculated at completion
  startedAt?: datetime
  completedAt?: datetime
  tags: Record<string, string>      // for cost attribution
}

ComputePool {
  id: uuid
  tenantId?: uuid                   // null = shared pool
  poolType: "dedicated" | "shared" | "spot"
  instanceType: string              // e.g. "p4d.24xlarge"
  gpuCount: integer
  currentUtilization: float         // 0.0–1.0
  reservedCapacityGpuHours?: float
}

ComputeQuota {
  tenantId: uuid
  cpuLimitCores: integer
  memoryLimitGiB: integer
  gpuLimitCount: integer
  monthlyBudgetUsd?: float
  currentUsage: { cpu, memory, gpu }
}
```

---

## 8. API Surface

### Submit Job
```http
POST /v1/compute/jobs
Authorization: Bearer {hive_token}

{
  "workload_class": "batch",
  "priority": 3,
  "image": "registry.hive.internal/pipeline-worker:v2.1",
  "resource_request": { "cpu": "4", "memory": "16Gi", "gpu": "1" },
  "resource_limit": { "cpu": "8", "memory": "32Gi", "gpu": "1" },
  "env": { "PIPELINE_ID": "pipe_abc123" },
  "tags": { "product": "cerebroflow", "team": "revenue-ops" }
}

→ 202 Accepted
{ "job_id": "job_xyz789", "estimated_start_at": "2026-07-24T10:15:00Z" }
```

### Get Job Status
```http
GET /v1/compute/jobs/{job_id}
→ { "status": "running", "started_at": "...", "gpu_utilization": 0.87, "cost_so_far_usd": 1.24 }
```

### Get Quota
```http
GET /v1/compute/quota
→ { "cpu_used": 24, "cpu_limit": 128, "gpu_used": 3, "gpu_limit": 8, "budget_used_usd": 1420.50 }
```

---

## 9. Security Model

- **Authentication**: All job submissions require a valid HiveIdentity JWT. Job ownership is cryptographically bound to the submitting identity.
- **Namespace Isolation**: Kubernetes network policies block all cross-namespace pod-to-pod communication.
- **Secrets Management**: Environment variables containing secrets are injected from HiveIdentity's secret vault, never stored in job specs.
- **Container Image Signing**: Only images signed by the HiveCompute image signing authority are schedulable. Third-party images must pass a vulnerability scan gate.
- **Audit Log**: Every job submission, preemption, and termination is logged to the immutable HiveGovern audit log.

---

## 10. SLAs & Operational Targets

| Metric | Target |
|---|---|
| Inference workload scheduling latency (P1) | <2 seconds from submission to pod start |
| Batch workload scheduling latency (P3) | <60 seconds from submission to pod start |
| GPU utilization (shared pools) | >75% average |
| Compute availability | 99.9% per region |
| Spot preemption checkpoint-resume time | <3 minutes |
| Cost attribution accuracy | >99.9% |

---

## 11. Roadmap

| Milestone | Timeline | Description |
|---|---|---|
| TPU & Gaudi Support | Q4 2026 | Add Google TPU v4 and Intel Gaudi accelerator support for training workloads |
| Federated Compute | Q1 2027 | Multi-region active-active compute federation with intelligent job placement across regions |
| WASM Sandbox | Q1 2027 | WebAssembly-based lightweight sandbox for ultra-fast agent execution (<50ms cold start) |
| Carbon-Aware Scheduling | Q2 2027 | Route non-urgent batch jobs to the cloud region with lowest carbon intensity at the time of submission |
| Serverless Inference | Q2 2027 | Sub-100ms cold start for inference workloads using pre-warmed micro-VMs (Firecracker) |

---

## 12. Success KPIs

| KPI | Target | Measurement Frequency |
|---|---|---|
| GPU utilization (shared pools) | ≥75% | Hourly |
| Job queue latency — P1 workloads | ≤2 sec | Real-time |
| Cost per inference (normalized) | <$0.001/req | Monthly |
| Spot preemption impact rate | <0.1% of jobs | Weekly |
| Tenant quota breach incidents | 0 per month | Real-time |
| Demand prediction accuracy (MAPE) | <10% | Weekly |
