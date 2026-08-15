# Specification Governance Finding: Process Drift in `PRODUCT_SPECIFICATIONS/`

**Status:** Finding — for product/leadership review. Not a decision, not a fix; documents a pattern for others to act on.
**Scope:** `PRODUCT_SPECIFICATIONS/*.md` (47 files) and their relationship to `docs/ENTERPRISE-VISION.md`, `docs/products.md`, `docs/services.md`, `PRODUCT_REGISTRY.md`.
**Discovered during:** work on `HIVE_PLATFORM_MASTERPLAN.md` (see that document's blocking-decision banner for the specific case that surfaced this).

---

## 1. Finding

The specification process for `PRODUCT_SPECIFICATIONS/*.md` drifted from the incremental, evidence-gated approach the company's own governing vision document calls for, into rapid, uniform, broad-coverage generation — producing 47 documents marked with the same finished-and-approved status label, most describing products with no connection to the real, current business.

## 2. Evidence

**A. Every spec claims the same mature status, with zero variation.**
All 47 files in `PRODUCT_SPECIFICATIONS/` carry the identical header `**Status:** Canonical Version 1.0`. There is no draft, proposed, in-review, or provisional tier anywhere in the directory — every product, regardless of whether it's shipping today or was named for the first time in the same document that produced its spec, is marked with the same finished/approved language.

**B. Generation happened in three rapid, uniform bursts, not incrementally.**

| Burst | Files | Window | Rate |
|---|---|---|---|
| 1 | 5 | 2026-07-22, 17:37 (single minute) | Simultaneous |
| 2 | 18 | 2026-07-24, 22:53–23:29 (36 min) | ~1 file / 2 min |
| 3 | 24 | 2026-07-25, 04:07–04:19 (12 min) | ~1 file / 30 sec |

A 30-second-per-file cadence across 24 consecutive, structurally-identical, multi-thousand-word documents (each with its own architecture diagram, data model, API surface, SLA table, and roadmap) is not consistent with the kind of product-by-product validation `ENTERPRISE-VISION.md` calls for — see finding D below.

**C. The specs don't even track the real product roadmap they should prioritize.**
`docs/products.md` names exactly 5 real products: CerebroFlow (GA), CerebroAgent (Beta), CerebroLearn (Early Access), CerebroERP (Coming Soon), CerebroOS (Labs/Vision). Of these 5, only 3 (CerebroFlow, CerebroAgent, CerebroERP) have a corresponding file in `PRODUCT_SPECIFICATIONS/`. **CerebroLearn and CerebroOS — two of the five products that actually exist — have no spec at all**, while 44 other products that appear nowhere in `docs/products.md` or `docs/services.md` do. If the goal were to document the real roadmap, coverage would be inverted from what it is.

**D. The company's own governing document explicitly warned against exactly this.**
`docs/ENTERPRISE-VISION.md` (written 2026-07-22, the same day as `PRODUCT_REGISTRY.md` and the first spec burst) states directly:

> **Status: VISION, not current offering.** ... most items below are names and one-line positioning only, not specced, priced, or built.

and its own "Suggested next step" section says:

> Pick **one** family above that's closest to actually being built next... and spec that single product... — features, architecture, pricing tier, use cases — before expanding to others.

Bursts 2 and 3 (42 additional specs, in under an hour of wall-clock generation time total) are the direct opposite of that guidance.

## 3. Impact

- **Documentation authority is inverted.** A reader encountering `hivecompute_spec.md` — "Canonical Version 1.0," with SLAs, KPIs, and a 2027 roadmap — has no signal from the document itself that it describes something with zero implementation, zero product decision, and no connection to what CerebroHive currently sells. The same is true for all 44 non-real-product specs.
- **New work built on top of these specs inherits false confidence.** This finding exists *because* `HIVE_PLATFORM_MASTERPLAN.md` was written treating `PRODUCT_REGISTRY.md`'s 7 infrastructure entries as a stable foundation, then treated the 7 matching "Canonical" specs as a second, conflicting stable foundation — neither of which was actually vetted. Future work (PRDs, ADRs, architecture docs) referencing any of these 47 specs is exposed to the same risk.
- **Real, active products are under-documented relative to aspirational ones.** CerebroLearn and CerebroOS — live or near-live today — have no canonical spec, while dozens of unbuilt products do. Effort was not allocated toward what matters operationally right now.
- **The "Canonical" label has lost discriminating power.** With 100% of 47 documents carrying the same status, the label no longer distinguishes reviewed-and-approved content from generated-and-unreviewed content — its only remaining function is to look authoritative.

## 4. Root cause

`ENTERPRISE-VISION.md` established the register of 50 possible future products and explicitly fenced it off from being treated as real ("do not use... without an explicit review pass"), while separately recommending careful, one-at-a-time specification as the correct way to move any of them from vision to reality. What happened instead was a bulk pass that specced nearly the entire register in three sittings, using the same document template and the same "Canonical Version 1.0" status marker regardless of whether the underlying product had any real basis. The vision document and the specification process became decoupled — the register's own explicit boundary was not carried forward into the generation process that used it as a source list.

## 5. Recommendation

- **Introduce a real status ladder** for `PRODUCT_SPECIFICATIONS/*.md` (e.g., `Vision` → `Proposed` → `Reviewed` → `Canonical`), and re-classify all 47 existing files against it rather than leaving them uniformly at the top tier.
- **Gate "Canonical" status on a real product decision**, not on a document existing — at minimum, presence in `docs/products.md`/`docs/services.md` (the company's own "what we actually sell" ground truth) or an explicit, dated sign-off note in the spec itself.
- **Backfill the two real gaps first** (CerebroLearn, CerebroOS) before any further work on non-real-product specs — this is the cheapest, highest-value correction available and directly reverses finding C.
- **For everything else in the 44**: leave as-is content-wise (the work itself may still be useful reference material later), but downgrade the status marker to reflect what it actually is, and add a line pointing back to `ENTERPRISE-VISION.md`'s original caution so a future reader isn't misled the way this masterplan effort was.
- This finding does not itself decide anything about Hive Platform specifically — that remains tracked in `HIVE_PLATFORM_MASTERPLAN.md` §28, item 8. This finding is about the specification *process*, and applies regardless of how that specific decision resolves.

---

## 6. Related finding: the live production website disagrees with `docs/products.md` too

Discovered during follow-up work (backfilling `cerebrolearn_spec.md`). This is a distinct but same-shaped problem: it's not about the `PRODUCT_SPECIFICATIONS/` documents, it's about the actual deployed website's data layer (`apps/studio/lib/data/products/`, rendered live at `/products/[slug]`).

### 6.1 Evidence

`docs/products.md` states 5 real products. The live website's product catalog (`lib/data/products/index.ts`, 12 entries) only overlaps on 2 of them:

| Product | `docs/products.md` | Live website (`lib/data/products/`) |
|---|---|---|
| CerebroFlow | ✅ GA — Live | ✅ `status: "production"` — **agrees** |
| CerebroLearn | ✅ Early Access | ✅ `status: "production"` — **name matches, maturity claim doesn't** |
| CerebroAgent | ✅ Beta Access | ❌ not in live catalog |
| CerebroERP | ✅ Coming Soon | ❌ not in live catalog |
| CerebroOS | ✅ Labs/Vision | ❌ not in live catalog |
| CerebroArchive | ❌ not mentioned | ✅ `status: "production"` |
| CerebroStudio | ❌ not mentioned | ✅ `status: "production"` |
| CerebroInsight | ❌ not mentioned | ✅ `status: "production"` |
| CerebroCopilot | ❌ not mentioned | ✅ `status: "production"` |
| CerebroResearch | ❌ not mentioned | ✅ `status: "production"` |
| HiveShield | ❌ not mentioned | ✅ `status: "production"` |
| HiveOps | ❌ not mentioned | ✅ `status: "production"` |
| CerebroSphere | ❌ not mentioned | `status: "development"` |
| HivePulse | ❌ not mentioned | `status: "development"` |
| Cerebro X | ❌ not mentioned | ✅ `status: "production"` |

Additionally, the live catalog's own `EntityStatus` type (`lib/data/types.ts`) defines a real maturity ladder — `concept → development → alpha → beta → production → deprecated` — but **10 of 12 live entries are set to `"production"`**, the same "everything marked at the top tier" pattern as the 47 specs in §2. This is not a one-off; it's the same root cause (§4) showing up in a second, independent part of the repository — the difference is this one is customer-visible on the live site today, not just internal documentation.

### 6.2 Impact

Nobody reading `docs/products.md` in isolation would know 10 additional products are live and customer-facing right now. Nobody looking at the live website would know only 2 of its 12 "production" products are acknowledged in the company's own "what we actually sell" document. Neither source can currently be trusted alone.

### 6.3 Recommendation

Reconcile these two specifically (not the full 50-product registry — that's a separate, lower-priority pass once this baseline is stable): for each of the 15 products across both lists, confirm which is accurate, update the loser, and — separately — review the live catalog's `"production"` statuses against actual feature completeness the same way `docs/products.md`'s per-product status column already does (GA / Beta / Early Access / Coming Soon / Labs), rather than defaulting new entries to the top tier.

---

## 7. Decisions Required (Not Resolved by This Document)

This review stops at evidence and recommendation. The following require an owner outside architecture/documentation review to actually resolve:

| Decision | Owner |
|---|---|
| Which catalog (`docs/products.md` or the live website) is authoritative for current offerings? | Product Leadership |
| Should CerebroArchive, CerebroStudio, CerebroInsight, CerebroCopilot, CerebroResearch, HiveShield, HiveOps, CerebroSphere, HivePulse, and Cerebro X be marketed as real products today, pulled from the live site, or explicitly relabeled as preview/vision content? | Product Management |
| Are `Production`, `Early Access`, `Beta`, `Coming Soon`, and `Labs` formally defined lifecycle stages with agreed entry/exit criteria, or informal labels applied inconsistently? | Product + Engineering |
| Who approves a new entry's status when it's added to `PRODUCT_SPECIFICATIONS/` or `lib/data/products/` — is there a review gate today, and should there be one? | Architecture Governance |
| Does the Hive Platform scope question (`HIVE_PLATFORM_MASTERPLAN.md` §28, item 8) get resolved before or independently of this broader catalog question? | Product Leadership |

## 8. Non-Goals

This finding intentionally does not reconcile individual product entries, edit `docs/products.md`, or modify the live website's product catalog. Determining which catalog reflects the intended business offering — and what to do about the 13 mismatched entries in §6 — requires product ownership decisions beyond the evidence available during this review. The review stopped here because of that governance boundary, not because it was incomplete.

## Related Tracking

Tracked in `docs/ROADMAP.md` Section 5 (Future Work) — the 44 non-real-product specs and the 50-product `docs/product-registry.md` vision this finding documents are marked there as not roadmap-ready until a real product decision exists.
