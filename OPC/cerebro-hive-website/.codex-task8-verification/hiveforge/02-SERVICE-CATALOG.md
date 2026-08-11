# HiveForge Masterplan — Phase 2: Service Catalog

**Status:** Proposed, per Phase 1 completion. Every service below is a `Resource` type (per `01-DOMAIN-MODEL.md`) provisioned through one of the eight capabilities (Phase 0 §3, amended to include `HiveDatabase`) via `ProviderExecutor` (`ADR-020`, amended Phase 4 — see `04-PROVIDER-FRAMEWORK.md`), following the shared lifecycle state machine (ADR-022) rather than reinventing one per service. **All rows are Planned, not Verified** — this catalog describes intended scope, not built services.

**Pricing model note:** per Phase 0 §8, pricing strategy is an explicitly deferred, non-blocking business decision. Every service below has its pricing model marked `Deferred (Phase 0 §8)` rather than invented figures. What *is* fixed here is the metering mechanism each service uses (per `ADR-025`) — the number that eventually gets a price attached, not the price itself.

## HiveCompute

| Service | API surface (illustrative) | Lifecycle | Quotas | Pricing | Key metrics | Security requirements |
|---|---|---|---|---|---|---|
| Virtual Machines | `provision(vmSpec)`, `resize()`, `snapshot()` | ADR-022 standard | vCPU/RAM caps per Project (default) | Deferred; metered by vCPU-hours (ADR-025) | CPU/mem utilization, uptime | Escrowed per-VM SSH/management credentials (ADR-023); no shared base images with embedded secrets |
| Bare Metal | `provision(hardwareSpec)`, `reboot()`, `reimage()` | ADR-022 standard, plus a `Provisioning` phase that can be materially longer (physical hardware) — no new states, just different expected durations | Node-count caps per Project | Deferred; metered by node-hours | Hardware health telemetry (vendor-dependent) | Full disk encryption at provisioning; secure wipe on `Deleting` |
| GPU Compute | `provision(gpuSpec)`, `resize()` | ADR-022 standard | GPU-count caps, likely the tightest-quota service given cost/scarcity | Deferred; metered by GPU-hours, expected highest per-unit cost | GPU utilization, memory, temperature | Same escrow model as VMs; additional consideration for multi-tenant GPU sharing isolation (open question, Phase 6) |
| Kubernetes Clusters | `provision(clusterSpec)`, `scaleNodePool()`, `upgrade()` | ADR-022 standard at the cluster-Resource level; individual nodes are child Resources with their own lifecycle | Node-count and cluster-count caps per Project | Deferred; metered by control-plane-hours + node-hours | Node health, pod scheduling failures, API server latency | Cluster API access via HiveIdentity-issued short-lived kubeconfig, not static credentials |
| Serverless Functions | `deploy(functionSpec)`, `invoke()`, `delete()` | ADR-022 standard, `Active` state effectively "deployed and invocable" rather than "always running" | Invocation-rate and concurrency caps | Deferred; metered by invocation-count + execution-duration | Invocation count, cold-start latency, error rate | Per-function escrowed execution role, scoped narrower than the general per-Operation credential where the underlying provider supports it |

## HiveStorage

| Service | API surface (illustrative) | Lifecycle | Quotas | Pricing | Key metrics | Security requirements |
|---|---|---|---|---|---|---|
| Object Storage | `createBucket()`, `putObject()`, `getObject()`, `deleteObject()` | ADR-022 standard at the bucket-Resource level | Storage-volume and request-rate caps | Deferred; metered by GB-stored + request-count (ADR-025) | Storage volume, request latency, error rate | Encryption at rest by default; no public-bucket default (must be explicit Policy override) |
| Block Storage | `createVolume()`, `attach()`, `detach()`, `resize()` | ADR-022 standard | Volume-count and total-size caps | Deferred; metered by GB-provisioned-hours | IOPS, throughput, attachment state | Encrypted at rest by default; attach/detach are Operations requiring the owning Resource's Workspace-scoped authorization |
| File Storage | `createShare()`, `mount()`, `unmount()` | ADR-022 standard | Share-count and total-size caps | Deferred; metered by GB-stored | Throughput, mount count | Same encryption-at-rest default as Object/Block |
| Snapshots | `createSnapshot(resourceId)`, `restore()` | Modeled as a Resource with a lineage reference to its source (per `01-PLATFORM-ARCHITECTURE.md` §9), not a separate entity type | Snapshot-count and retention-period caps | Deferred; metered by GB-stored, likely lower per-GB rate than live storage | Snapshot age, restore success rate | Snapshot access requires the same authorization as its source Resource — a snapshot must not be a privilege-escalation path around Workspace scoping |
| Backups | Same shape as Snapshots, with scheduled/automated creation | Same as Snapshots | Retention-policy caps (count and duration) | Deferred; metered by GB-stored | Backup success rate, restore-test success rate | Same as Snapshots; backup retention policy is itself a `Policy` attachment (domain model §2) |

## HiveNetwork

| Service | API surface (illustrative) | Lifecycle | Quotas | Pricing | Key metrics | Security requirements |
|---|---|---|---|---|---|---|
| VPC | `createVpc()`, `deleteVpc()` | ADR-022 standard | VPC-count cap per Project | Deferred; likely bundled/no direct metering (cost typically attaches to traffic/attached resources, not the VPC construct itself) | N/A directly; observed via attached resources | Default-deny between Workspaces unless a Policy explicitly permits peering |
| Subnets | `createSubnet(vpcId, cidr)` | ADR-022 standard, child of a VPC Resource | Subnet-count per VPC | Deferred | N/A directly | CIDR allocation must not overlap across Workspaces sharing infrastructure-level isolation (interacts with `ADR-026`'s open question) |
| Load Balancers | `createLoadBalancer()`, `attachTarget()`, `detachTarget()` | ADR-022 standard | LB-count, target-count per LB | Deferred; metered by hours-provisioned + data-processed | Request rate, latency, error rate, healthy-target count | TLS termination credentials escrowed the same as any other credential (ADR-023), not stored as static certs in configuration |
| DNS | `createZone()`, `createRecord()` | ADR-022 standard | Zone-count, record-count per zone | Deferred; metered by query-count + zone-count | Query volume, resolution latency | Zone delegation requires explicit Policy authorization — DNS misconfiguration is a common real-world security incident class, worth calling out even at this planning stage |
| VPN | `createConnection()`, `terminate()` | ADR-022 standard | Connection-count cap | Deferred; metered by connection-hours + data transferred | Connection uptime, throughput | Escrowed pre-shared keys/certificates, same discipline as ADR-023 generally |
| Firewalls | `createRuleSet()`, `attachToResource()` | Attached to Resources/Subnets rather than independently lifecycled | Rule-count caps | Deferred; likely bundled, not separately metered | Denied-request count (security-relevant metric, feeds HiveShield SecurityEvents) | Default-deny posture; explicit allow-rules only, consistent with Zero Trust (Phase 0 principle #4) |

## HiveDatabase

**Resolved, 2026-07-29 (Phase 0 Amendment 1):** `HiveDatabase` is an approved eighth platform capability — databases are a distinct service domain (HA, replication, failover, backup/restore, connection management, version upgrades — not just compute execution or storage persistence), not a sub-category of HiveCompute or HiveStorage. Internal structure, separating service families so each can split into an independent capability later if warranted without disturbing the others:

```
HiveDatabase
│
├── RelationalService   — PostgreSQL, MySQL (MariaDB, SQL Server: future)
├── CacheService         — Redis (Valkey: future)
├── StreamingService     — Kafka (candidate to split into a future HiveMessaging capability if messaging scope grows beyond one service)
└── SearchService        — OpenSearch (candidate to split into a future HiveSearch capability under the same condition)
```

Rollout sequencing (illustrative, a Phase 8 Roadmap decision, not fixed here): RelationalService (PostgreSQL, MySQL) first, then CacheService/StreamingService/SearchService, with HA clusters/geo-replication/read replicas as a later maturity layer once the base services exist.

| Service | API surface (illustrative) | Lifecycle | Quotas | Pricing | Key metrics | Security requirements |
|---|---|---|---|---|---|---|
| PostgreSQL | `provision(dbSpec)`, `backup()`, `restore()`, `scale()` | ADR-022 standard | Instance-count, storage-size caps | Deferred; metered by instance-hours + storage-GB | Connection count, query latency, replication lag | Escrowed connection credentials, rotated per ADR-023; encryption at rest and in transit by default |
| MySQL | Same shape as PostgreSQL | ADR-022 standard | Same shape | Deferred; same metering shape | Same shape | Same as PostgreSQL |
| Redis | `provision(cacheSpec)`, `flush()`, `scale()` | ADR-022 standard | Memory-size caps | Deferred; metered by instance-hours + memory-GB | Hit rate, eviction rate, memory usage | Same escrow model; in-memory data classified per Policy if it may contain sensitive cached data |
| Kafka | `provision(clusterSpec)`, `createTopic()`, `scale()` | ADR-022 standard at cluster level; topics as child Resources | Topic-count, partition-count, retention caps | Deferred; metered by broker-hours + storage-GB + throughput | Consumer lag, throughput, partition count | Topic-level ACLs map onto Workspace-scoped RBAC (ADR-023), not a separate parallel permission system |
| OpenSearch | `provision(clusterSpec)`, `createIndex()`, `scale()` | ADR-022 standard | Index-count, storage-size caps | Deferred; metered by node-hours + storage-GB | Query latency, indexing rate, cluster health | Same escrow model; index-level access control maps onto Workspace scoping |

## Cross-cutting notes

- Every service's "Lifecycle" column says "ADR-022 standard" deliberately — this catalog does not introduce per-service state machines. Where a service's `Degraded` state means something specific (e.g., a database replication lag threshold vs. a VM failing a health check), that detail belongs in that service's own implementation spec when it's actually built, not invented speculatively here.
- No service in this catalog has a Verified implementation. This entire document is Planned scope, per the Phase 0 evidence-status discipline — a future pass, once any service is actually built, should update its row to Verified with a reference to the real code, the same way `packages/engineering-review`'s components graduated from Planned to Verified over the M26.1–M26.3 work.
- The HiveDatabase capability question is resolved (Phase 0 Amendment 1, above) — Phase 3 (Control Plane) can now assume `HiveDatabase` as a fixed capability boundary.
