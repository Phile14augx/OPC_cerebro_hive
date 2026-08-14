# Cerebro Nexarch Knowledge Base — Metadata Schema

**Version:** 1.1  
**Date:** 2026-08-14  
**Owner:** Chief AI Research Architect  
**Changes v1.1:** Added claim_provenance, repo_gap_tag, and §9 (Claim Provenance System). Incorporates Phil's constraint: no YouTube claim becomes architectural truth without provenance classification.

---

## 1. Video Metadata Object

```yaml
video_id: string                    # YouTube video ID (11 chars)
title: string
url: string                         # Full YouTube URL
publication_date: ISO-8601          # YYYY-MM-DD
duration: string                    # HH:MM:SS
channel: "AI Revolution"
channel_url: "https://www.youtube.com/@airevolutionx"
processed_date: ISO-8601
processed_by: string                # Agent/session ID

primary_topics: [string]
secondary_topics: [string]
companies: [string]
models: [string]
frameworks: [string]
research_papers: [string]           # arXiv IDs or paper titles
products: [string]
people: [string]
hardware: [string]
benchmarks: [string]
datasets: [string]
repositories: [string]              # GitHub URLs

potential_relevance: HIGH | MEDIUM | LOW | NONE
relevance_notes: string

verification_status: UNVERIFIED | IN_PROGRESS | VERIFIED | DISPUTED
knowledge_extraction_status: PENDING | PASS_A | PASS_B | COMPLETE | SKIPPED
skip_reason: string                 # Only if SKIPPED
```

---

## 2. Atomic Knowledge Object

```yaml
knowledge_id: "KN-[CATEGORY]-[NNNNNN]"   # e.g. KN-AGENT-000001
title: string
version: "1.0"

category: string                          # From taxonomy (§4)
subcategory: string

source_video:
  video_id: string
  title: string
  url: string
  publication_date: ISO-8601

primary_sources:
  - type: arxiv | github | docs | benchmark | blog | regulatory | conference
    url: string
    title: string
    authors: [string]
    date: ISO-8601
    accessed: ISO-8601

claim: string                             # Exact claim from video (quoted or close paraphrase)
claim_type: REPORTED | DEMONSTRATED | MEASURED | SPECULATIVE | VENDOR

# ── PROVENANCE (v1.1 — required on every knowledge object) ─────────────────
claim_provenance: SOURCE_CLAIM | INDEPENDENTLY_VERIFIED | REPO_OBSERVED | CEREBRO_RECOMMENDATION
# SOURCE_CLAIM       — taken directly from video; not yet verified against primary sources
# INDEPENDENTLY_VERIFIED — confirmed against peer-reviewed paper, official docs, or GitHub
# REPO_OBSERVED      — confirmed by direct inspection of the Cerebro Nexarch codebase
# CEREBRO_RECOMMENDATION — our own engineering inference, not present in the source material

repo_gap_tag: ALREADY_IMPLEMENTED | PARTIAL | SCAFFOLDED | MISSING | DUPLICATE | SUPERSEDED | RESEARCH_ONLY | REJECT | UNKNOWN
# ALREADY_IMPLEMENTED — the exact capability exists and is production-quality in the repo
# PARTIAL             — the capability is partially implemented; gaps documented below
# SCAFFOLDED          — the package/service skeleton exists but the capability is not yet functional
# MISSING             — no corresponding code exists; a full implementation is required
# DUPLICATE           — another KB object already covers this; merge and archive this one
# SUPERSEDED          — a newer technology in the KB renders this recommendation obsolete
# RESEARCH_ONLY       — interesting but no implementation path for Cerebro Nexarch at this time
# REJECT              — hype, irrelevant, incompatible, or insecure; archived not deleted
# UNKNOWN             — repo mapping not yet performed (default before Phase 4)

repo_mapping:
  packages: [string]      # e.g. ["packages/agent-sdk", "packages/memory-sdk"]
  services: [string]      # e.g. ["services/memory-service"]
  apps: [string]          # e.g. ["apps/twin-studio"]
  gap_detail: string      # What specifically is missing or partial

technical_mechanism: string               # How it works
problem_solved: string
architecture_pattern: string              # Optional

implementation_requirements:
  - requirement: string

advantages: [string]
limitations: [string]
risks: [string]

maturity: THEORETICAL | RESEARCH | EXPERIMENTAL | PRODUCTION
evidence_level: A | B | C | D | E | F    # See evidence grading

cerebro_relevance:
  products: [string]                      # CerebroHive products affected
  eios_layers: [integer]                  # 1–10 layers
  score: float                            # 0.0–10.0
  rationale: string

scoring:
  technical_value: float       # /10
  strategic_value: float       # /10
  customer_value: float        # /10
  revenue_potential: float     # /10
  engineering_leverage: float  # /10
  differentiation: float       # /10
  evidence_strength: float     # /10
  technical_maturity: float    # /10
  implementation_ease: float   # /10
  security_confidence: float   # /10
  cerebro_priority_score: float  # weighted /100

priority: P0 | P1 | P2 | P3 | P4
horizon: NOW | EXPERIMENT | WATCH | RESEARCH | REJECT

recommended_action: string
related_components: [string]   # Cerebro Nexarch components
related_knowledge: [string]    # Other KN IDs

discovered_at: ISO-8601
verified_at: ISO-8601
last_reviewed_at: ISO-8601
technology_version: string
supersedes: string             # KN ID
superseded_by: string          # KN ID

validity_status: CURRENT | DEPRECATED | SUPERSEDED | DISPUTED | UNVERIFIED | ARCHIVED
status: KNOWN | UNDERSTOOD | VERIFIED | RECOMMENDED | PLANNED | EXPERIMENTAL | IMPLEMENTED | PRODUCTION | REJECTED | SUPERSEDED
```

---

## 3. Technology Radar Entry

```yaml
technology: string
category: string                   # From taxonomy
radar_ring: ADOPT | TRIAL | ASSESS | HOLD
reason: string
evidence: string                   # Evidence grade + brief justification
use_case: string                   # Specific Cerebro use case
owner: string
review_date: ISO-8601
related_knowledge: [string]        # KN IDs
```

---

## 4. Implementation Backlog Item

```yaml
id: "IMP-[NNNN]"
title: string
source_knowledge: [string]         # KN IDs
problem: string
proposed_solution: string
business_value: string
technical_value: string
affected_components: [string]
dependencies: [string]
security_implications: string
estimated_complexity: LOW | MEDIUM | HIGH | VERY_HIGH
priority: P0 | P1 | P2 | P3 | P4
acceptance_criteria: [string]
tests_required: [string]
status: BACKLOG | PLANNED | IN_PROGRESS | DONE | REJECTED
```

---

## 5. Experiment Card

```yaml
id: "EXP-[NNNN]"
hypothesis: string
technology: string
source_knowledge: [string]         # KN IDs
business_reason: string
current_baseline: string
proposed_experiment: string
dataset_workload: string
benchmark: string
success_criteria: [string]
failure_criteria: [string]
cost_ceiling_usd: float
security_constraints: [string]
implementation: string
evaluation: string
recommendation: ADOPT | TRIAL | REJECT | EXTEND
status: PROPOSED | ACTIVE | COMPLETE | CANCELLED
```

---

## 6. Architecture Decision Record Candidate

```yaml
id: "ADR-XXXX"
title: string
status: PROPOSED | ACCEPTED | REJECTED | SUPERSEDED
context: string
decision: string
alternatives: [string]
evidence: string
advantages: [string]
consequences: [string]
security_implications: string
cost_implications: string
migration_strategy: string
rollback: string
sources: [string]                  # KN IDs, URLs
```

---

## 7. Evidence Grading  

```
A — Peer-reviewed / independently replicated
B — Strong primary-source technical evidence (official paper, model card, GitHub)
C — Official company demonstration or benchmark (unverified by third party)
D — Credible reporting without sufficient independent verification
E — Speculative claim
F — Hype / unsupported / marketing
```

**Rule:** Never present C–F evidence as established engineering fact in recommendations or ADRs.

---

## 8. Claim Provenance System

This system enforces Phil's constraint: **no YouTube-derived claim becomes architectural truth merely because it appears in a video.**

### The Four Provenance Levels

```
SOURCE_CLAIM
│
│  "The video states that X does Y"
│  Evidence grade typically D–E.
│  May inform WATCH ring or Research Watchlist.
│  MUST NOT appear in ADRs, best practices, or implementation backlog
│  without being elevated first.
│
├──► INDEPENDENTLY_VERIFIED
│    │
│    │  "Primary source (paper, GitHub, official docs) confirms X does Y"
│    │  Evidence grade A, B, or C.
│    │  May inform ASSESS/TRIAL ring, best practices (PROVISIONAL),
│    │  and implementation backlog (with evidence citation).
│    │
│    └──► CEREBRO_RECOMMENDATION
│         │
│         │  "Given that X does Y (verified), we should do Z in Cerebro Nexarch"
│         │  This is our own engineering judgment, not the source's claim.
│         │  Must be clearly attributed as Cerebro analysis, not external fact.
│         │  May appear in ADRs, P0/P1 backlog items, and best practices.
│         │
│         └──► REPO_OBSERVED
│
│              "We confirmed Z is already the case in the codebase"
│              Produced by direct repository inspection (Phase 4 mapping).
│              Highest confidence. May inform ADOPT ring and implementation
│              status updates. Requires a commit reference or file path.
```

### Provenance in Practice

| Provenance | Where it may appear |
|-----------|---------------------|
| SOURCE_CLAIM | Research Watchlist, WATCH ring only |
| INDEPENDENTLY_VERIFIED | ASSESS/TRIAL ring, PROVISIONAL best practices, P2–P3 backlog |
| CEREBRO_RECOMMENDATION | ADR candidates, P0–P1 backlog, formal best practices |
| REPO_OBSERVED | ADOPT ring, implementation status, gap analysis |

### What is Forbidden

- A `SOURCE_CLAIM` in an ADR without being elevated to `INDEPENDENTLY_VERIFIED` first
- A `CEREBRO_RECOMMENDATION` without an `INDEPENDENTLY_VERIFIED` parent claim
- Any engineering decision whose provenance chain cannot be traced to a primary source URL

---

## 9. RAG Metadata (per knowledge chunk)

```json
{
  "knowledge_id": "",
  "title": "",
  "category": "",
  "subcategory": "",
  "source_type": "youtube",
  "source_url": "",
  "publication_date": "",
  "verified_sources": [],
  "evidence_grade": "",
  "claim_provenance": "",
  "repo_gap_tag": "",
  "technology": [],
  "company": [],
  "cerebro_component": [],
  "eios_layer": [],
  "implementation_status": "",
  "priority": "",
  "horizon": "",
  "last_reviewed": "",
  "validity_status": ""
}
```
