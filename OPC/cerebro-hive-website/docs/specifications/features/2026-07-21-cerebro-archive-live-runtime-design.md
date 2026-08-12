# CerebroArchive Live Runtime — Design
**Date:** 2026-07-21
**Status:** Approved
**Scope:** A real, interactive demo of CerebroArchive's core capabilities (semantic search, knowledge graph, document intelligence), following the pattern established by AgentOS's Live Runtime.

**Goals:**
- Demonstrate real computation — every result is genuinely derived from the input, not canned.
- Be completely deterministic — same input always produces the same output.
- Keep every result explainable — show *why*, not just the answer.
- Reuse one computational pipeline — search, graph, and document intelligence all derive from the same TF-IDF representation.
- Match AgentOS's established Live Runtime pattern.
- Avoid unnecessary abstraction — only build what a concrete, current feature needs (§7).

---

## 1. Context

`/products/cerebro-archive` already exists as a content/marketing page, rendered generically through `ProductRenderer` from data in `lib/data/products/cerebro-archive.ts` — same template most products use. The site's actual interactive-demo convention is **one shared hub, not per-product routes**: `/platform/live-runtime` is the single destination every "Run Live Demo" / "Launch Developer Sandbox" / "Architecture Playground" CTA across the entire site points to (home hero, platform architecture, executive decision platform, research dev resources, `lib/data/platform/capabilities.ts`, nav, sitemap). It currently offers a mode toggle between AgentOS's "In-Browser Kernel" (`lib/agentos/`, wired through Guard → Reasoning Engine → Planner → Scheduler → Memory Fabric → Eval via Next.js server actions, results computed live, session memory persisted to disk) and its "Full Backend" (a separate FastAPI service). Note: an older per-product route, `/products/agentos/live-runtime`, exists only as a deprecated redirect stub — it is not the pattern to follow.

This spec designs the equivalent runtime for CerebroArchive as a **third mode on that same shared hub** (`/platform/live-runtime`), letting visitors run real search, knowledge-graph construction, and document-intelligence analysis against a small in-app corpus, alongside the existing AgentOS modes.

---

## 2. Narrative

Header framing (adapted from AgentOS's "Live Runtime — Real Execution" pattern, worded around reproducibility rather than implying expensive computation):

> **Live Runtime — Real Execution**
> Every search, graph connection, ranking, entity detection, and document analysis shown here is computed by the runtime currently executing in this application. Seed documents and anything you paste in pass through the identical indexing and retrieval pipeline. Results come from live computation, not pre-recorded responses.

Two modes, presented as tabs: **Search & Graph** and **Document Intelligence**. No additional tabs are added speculatively — a third mode is a five-minute addition if a future need arises.

---

## 3. Data Model

```typescript
interface ArchiveDocument {
  id: string;
  title: string;
  text: string;
  source: "seed" | "user";
  tags: string[];       // empty until this doc is analyzed in the Document Intelligence tab;
                         // populated from classification.category (§5) once it is, so the
                         // Search & Graph results list can show a category badge without
                         // re-running classification. No badge is shown for un-analyzed docs.
}

interface SearchResult {
  doc: ArchiveDocument;
  score: number;
  matchedTerms: { term: string; contribution: number }[]; // sorted by contribution desc
}

interface GraphNode {
  docId: string;
  title: string;
}

interface GraphEdge {
  from: string;          // docId
  to: string;            // docId
  weight: number;         // cosine similarity, drives visual edge weight
  sharedTerms: string[];  // top shared TF-IDF terms — the edge's stated "why"
}

interface DocIntelligenceResult {
  keyConcepts: { term: string; weight: number }[];
  summary: string;                 // merged top-ranked sentences, original order
  detectedEntities: string[];      // heuristic — labeled as such in the UI, never "Named Entities"
  classification: { category: string; matchedTerms: string[] };
}
```

Fields deliberately **not** included, and why: `language` and a generic `metadata` bag (no consumer exists for either); `updatedAt` (documents are immutable once added — no edit feature); `properties` on edges (no consumer). These are left out on the same principle that governs the rest of this design (§6): only introduce a field, abstraction, or UI element when a concrete, current feature needs it.

**Seed corpus:** 10 short (~150–300 word) documents, deliberately engineered — not left to chance — so their topics form a connected, cyclic graph out of the box:
```
Knowledge Graphs → Entity Linking → RAG → Vector Databases → Embeddings
→ AI Governance → Agent Memory → (back to) Knowledge Graphs
```
Each document's text is written so it naturally shares 2–4 significant terms with at least one neighbor in this chain, guaranteeing the demo graph is connected rather than a scatter of isolated nodes.

**User-added documents:** a "paste your own" form (title + text, minimum ~50 characters) adds a document tagged `source: "user"`. It is tokenized, indexed, searched, graphed, and analyzed through the exact same functions as seed documents — no branching, no separate "demo path."

---

## 4. Session Model

```typescript
// lib/cerebro-archive/session.ts
interface ArchiveSession {
  documents: ArchiveDocument[];  // seed docs (shared reference) + this session's user docs
}

const sessions = new Map<string, ArchiveSession>(); // in-memory, per server process
```

- **Session-only persistence.** Unlike AgentOS's memory (which persists to a shared disk file, growing across all visitors forever), CerebroArchive's session store is in-memory only, scoped to that session ID, and never written to disk. This is a deliberate deviation from the AgentOS precedent: AgentOS's memory entries are short task descriptions; CerebroArchive would accept longer, arbitrary pasted text as "documents," and persisting unmoderated public text indefinitely on a shared server is a real exposure this project doesn't need to take on for a demo feature. Session ID uses the same `localStorage`-generated-id pattern as AgentOS's `getSessionId()`.
- **The seed corpus's TF-IDF index is computed once at module load** (shared, immutable — the 10 seed documents never change), not recomputed per session or per request. A session's user-added documents are indexed incrementally, one at a time, as they're added. Search and graph computation merge the seed index with the session's user-doc index at query time — cheap, since a session typically holds at most a handful of extra documents.
- The session record is intentionally flat (`{ documents }` — index and graph are *derived* values computed by pure functions over `documents`, not stored, redundant, separately-synced state). No `Store` class hierarchy, no `analytics`/`settings`/`searchCache` fields: nothing here is solved by them. The current requirements are a small in-memory corpus processed synchronously with a single retrieval algorithm; that's fully served by one flat record and pure functions, so additional structure is deferred until a concrete feature needs it.

---

## 5. Algorithms

All deterministic, real computation — no LLM calls, no external APIs, no randomness. Same principle as `lib/agentos`: the UI shows *why* a result came out the way it did, not just the result.

**Tokenization** (identical for seed and user documents): lowercase → strip punctuation → normalize repeated whitespace → split on whitespace → drop empty tokens → remove a small (~30 word) English stopword list.

**Indexing:** term-frequency map per document. TF-IDF weight per term = (term frequency in doc) × log(N / (1 + docs containing term)), where N and the document-frequency counts are computed over the current merged corpus (seed + that session's user docs) at query time.

**Search (TF-IDF + cosine similarity):** the query is tokenized and vectorized the same way as documents. Results are ranked by cosine similarity between the query vector and each document's TF-IDF vector. The UI shows the score and the matched terms, **sorted by their contribution to the score** (highest first) — not alphabetically — so it's visible *why* a document ranked where it did.

**Knowledge graph:** reuses the same TF-IDF vectors computed for search — no second similarity algorithm. For every document pair, cosine similarity above `GRAPH_EDGE_THRESHOLD` (a named constant, `0.10`, not an inline magic number) draws an edge. Edge `weight` is that similarity score (drives visual line weight/opacity). Each edge also carries `sharedTerms`: the intersection of the two documents' top-weighted terms — so an edge is always labeled with a stated reason ("linked via: knowledge graph, retrieval"), never an unexplained line.

**Document Intelligence**, computed per selected/pasted document:
- *Key concepts* — the document's own top-N TF-IDF terms. No separate algorithm; this is already-computed indexing data, just surfaced.
- *Extractive summary* — split into sentences, score each by summing its terms' TF-IDF weights, take the top 2–3 by score, restore original order. If two of the selected sentences are adjacent in the source text, present them merged as one continuous span rather than two disjoint bullets.
- *Detected entities (heuristic)* — a regex heuristic for capitalized multi-word sequences (e.g., "Knowledge Graph," "Vector Database"), filtered to exclude sentence-initial common words. Labeled explicitly as a heuristic in the UI — never called "Named Entities" — so it doesn't imply a real NER model.
- *Classification* — the document's top terms matched against a small curated category→keyword map (categories drawn from the seed corpus's own topic chain: "Knowledge & Retrieval," "Governance & Security," "Infrastructure," "Agents & Automation"). Highest keyword-overlap count wins; the UI states which matched terms drove the classification.

**What's explicitly not built:** a pluggable `RankingStrategy` interface for swapping in BM25/hybrid/semantic search later. There is exactly one ranking algorithm in this design. That abstraction earns its place the day a second algorithm actually needs to be swapped in — not before.

---

## 6. Architecture

**Guiding principle** (kept consistent across every section above): only introduce an abstraction, storage layer, or UI element when a concrete, current feature needs it. Every deferred idea in this spec — a `Store` class hierarchy, search caching, a pluggable ranking strategy, extra placeholder tabs, a persistent diagnostics footer, a computation-trace panel — was considered and declined because nothing in the current scope is solved by it, not because it's a bad idea in the abstract. The current requirements are: a small in-memory corpus, processed synchronously, with one retrieval algorithm, one graph-construction method, and one intelligence layer, all derived from a single shared TF-IDF representation.

**File layout**, mirroring `lib/agentos/`:
```
lib/cerebro-archive/
  types.ts          — ArchiveDocument, SearchResult, GraphNode/Edge, DocIntelligenceResult
  corpus.ts         — the 10 seed documents (engineered topology, §3)
  tokenize.ts       — shared tokenization/normalization
  vectorize.ts      — TF-IDF vector computation; seed index built once at module load
  search.ts         — cosine similarity ranking
  graph.ts          — edge construction from shared vectors
  intelligence.ts   — summary, entity detection, classification
  session.ts        — in-memory Map<sessionId, ArchiveSession>
  index.ts          — composed entry point (see below)
```
`lib/cerebro-archive/index.ts` mirrors `lib/agentos/index.ts`'s actual role: it's the composed entry point (`runSearch`, `runDocumentIntelligence`, `ingestDocument`), each internally wiring tokenize → vectorize → search/graph/intelligence into one call — not a bare `export * from` convenience barrel.

```
app/actions/cerebro-archive-runtime.ts
  — server actions: ingestDocument, runSearch, runDocumentIntelligence, resetSession
```

**Components**, alongside the existing `components/platform/live-runtime/`:
```
components/platform/live-runtime/cerebro-archive/
  ArchiveLiveRuntime.tsx          — top-level: session id, tab state, "paste a document" form
  SearchGraphPanel.tsx            — search box + ranked results + graph visualization
  DocumentIntelligencePanel.tsx   — document picker + summary/entities/classification display
```
`app/platform/live-runtime/page.tsx` (existing file) gains a third `Mode` value, `"cerebro-archive"`, alongside the existing `"kernel"` / `"backend"`, rendering `ArchiveLiveRuntime` when selected — extending the existing `useState<Mode>` + ternary, not introducing a registry/plugin abstraction for what is still a small, fixed, first-party set of modes. The page also reads an optional `?mode=` search param on load (via `useSearchParams`) to select the initial mode, defaulting to `"kernel"` if absent or unrecognized — this is what lets the CerebroArchive product page deep-link straight into the right mode.

**UI layout:** header badge + narrative copy (§2) → tab switcher (Search & Graph / Document Intelligence) → mode-specific panel, inside the existing `section-pad`/`container-wide` shell used sitewide (no new layout primitives).

- *Search & Graph:* search input + example queries (same example-chip pattern as `AgentOSLiveRuntime`) on top; ranked results (title, score, matched terms by contribution) on the left; graph visualization on the right, reusing the existing `components/ui/visualization/Node.tsx` / `Edge.tsx` primitives in the same radial "constellation" layout already used by `IntegrationIntelligence.tsx` (manually computed positions, not a graph layout library). Running a search highlights the matching node(s) and their edges in place, rather than replacing the graph — preserves visual context between searches.
- *Document Intelligence:* a document picker (seed docs + this session's own) or a "paste new text" box; selecting/submitting shows four small cards — Key Concepts, Summary, Detected Entities (heuristic), Classification — using the same `Panel`-style card component AgentOS's runtime uses.

**Error handling:** empty query → disable the search button, no error state needed. Pasted document under ~50 characters → inline validation message, no server round trip. Server action failures (no I/O beyond the in-memory Map, so should be rare) → caught and surfaced as a dismissible inline banner, same pattern as `AgentOSLiveRuntime`'s `res.error` handling.

**Testing:** the computational modules under `lib/cerebro-archive/` (tokenize, vectorize, search, graph, intelligence) are intentionally pure functions, making them straightforward to unit test whenever this project has a unit-test framework in place. Today it doesn't (verified: no jest/vitest, no test files under `lib/` or `components/`, `lib/agentos/` itself has zero tests) — only Playwright E2E (`npm run test:e2e`) is configured. Introducing a unit-test framework is a separate engineering decision, independent of this feature. Testing for this feature is therefore a small Playwright E2E spec against `/platform/live-runtime?mode=cerebro-archive`: running an example search produces ranked results, and selecting a document in the Document Intelligence tab produces non-empty summary/entities/classification output. If a unit-test framework is adopted later, the pure functions here need no rework to be covered by it.

**Integration with the existing product page:** `/products/cerebro-archive`'s existing hero CTA ("Explore Knowledge Platform") is left as-is per its current data; a new secondary CTA linking to `/platform/live-runtime?mode=cerebro-archive` is added, matching how the site's other product/platform pages link into the shared live-runtime hub.

---

## 7. Explicitly Out of Scope

Recorded here so they aren't silently reconsidered later without a concrete need surfacing:
- A `SessionStore` → `DocumentStore` → `IndexStore` → `GraphStore` class hierarchy.
- `searchCache`, `analytics`, `settings` fields on the session.
- Extra `Documents` / `Insights` tabs added preemptively.
- A pluggable `RankingStrategy` abstraction (TF-IDF is the only algorithm).
- Disk persistence of user-pasted documents.
- A collapsible "Computation Trace" or "Developer Diagnostics" panel — the per-result explainability already in §5/§6 (matched terms, edge labels, classification reasons) covers this; a separate panel would mostly re-list the same numbers in a different shape.
- Any comparison to or reuse of patterns from `platform/src/domains/hiveforge/` — that's unreviewed, in-progress code in a separate Node service, not an established precedent for this Next.js demo layer.
- A `RuntimeRegistry`/plugin abstraction for `/platform/live-runtime`'s mode switcher. Going from two modes to three is one more union member and one more ternary branch; a registry solves dynamic/third-party extensibility, which doesn't apply here — every mode is a known, first-party component.
