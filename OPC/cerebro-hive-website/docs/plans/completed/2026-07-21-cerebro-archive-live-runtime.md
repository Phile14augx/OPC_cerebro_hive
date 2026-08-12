# CerebroArchive Live Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real, interactive CerebroArchive runtime (semantic search, knowledge graph, document intelligence) as a third mode on the site's existing shared `/platform/live-runtime` hub, alongside AgentOS's kernel/backend modes.

**Architecture:** Deterministic TF-IDF + cosine-similarity algorithms (no LLM calls) live in `lib/cerebro-archive/` as pure functions, composed by `lib/cerebro-archive/index.ts` and called from thin, rate-limited Next.js server actions in `app/actions/cerebro-archive-runtime.ts`. A `useState<Mode>` + ternary on the existing `/platform/live-runtime` page grows a third branch rendering the new `ArchiveLiveRuntime` client component tree. Session state (seed corpus + user-pasted documents) lives in an in-memory `Map<sessionId, ArchiveSession>`, never written to disk.

**Tech Stack:** Next.js (App Router, Server Actions), React (client components), TypeScript, Tailwind CSS, Framer Motion, `node:test` + `node:assert` run via `npx tsx --test` for the pure-function modules (no new dependency — `tsx` is already resolvable in this repo via the existing `npm run audit:enterprise` script; `node:test` is a Node.js runtime built-in, not an added framework).

## Global Constraints

- No LLM calls, no external APIs, no randomness anywhere in `lib/cerebro-archive/` — every result must be deterministic and explainable (spec §5).
- No disk persistence of session documents — the session store is in-memory only, per session ID (spec §4).
- `GRAPH_EDGE_THRESHOLD` must be a named constant (`0.10`), never an inline magic number (spec §5).
- Detected entities must be labeled "Detected entities (heuristic)" in the UI — never "Named Entities" (spec §5).
- Matched search terms are shown sorted by contribution score descending, never alphabetically (spec §5).
- `/platform/live-runtime` gains a third `Mode` value via one more union member and one more ternary branch — no `RuntimeRegistry`/plugin abstraction (spec §6, §7).
- Pasted documents require a minimum 50 characters (spec §3).
- Do not widen `playwright.config.ts`'s `testDir` beyond `./tests/visual` — `tests/e2e/platform.test.ts` is pre-existing dead code (Jest-style globals, not a Playwright test) that would break the suite if picked up. Out of scope for this feature.
- Reference spec: `docs/superpowers/specs/2026-07-21-cerebro-archive-live-runtime-design.md`

---

### Task 1: Core types and seed corpus

**Files:**
- Create: `lib/cerebro-archive/types.ts`
- Create: `lib/cerebro-archive/corpus.ts`
- Test: `lib/cerebro-archive/corpus.test.ts`

**Interfaces:**
- Produces: `ArchiveDocument`, `SearchResult`, `GraphNode`, `GraphEdge`, `DocIntelligenceResult`, `ArchiveSession` (all exported from `types.ts`); `seedCorpus: ArchiveDocument[]` (exported from `corpus.ts`)

- [ ] **Step 1: Write `types.ts`**

```typescript
// lib/cerebro-archive/types.ts
// Core types for the CerebroArchive Live Runtime — a real, deterministic
// TF-IDF based search/graph/document-intelligence demo. No LLM calls.

export interface ArchiveDocument {
  id: string;
  title: string;
  text: string;
  source: "seed" | "user";
  tags: string[]; // empty until analyzed in the Document Intelligence tab;
                   // populated from classification.category once it is.
}

export interface SearchResult {
  doc: ArchiveDocument;
  score: number;
  matchedTerms: { term: string; contribution: number }[]; // sorted by contribution desc
}

export interface GraphNode {
  docId: string;
  title: string;
}

export interface GraphEdge {
  from: string; // docId
  to: string; // docId
  weight: number; // cosine similarity, drives visual edge weight
  sharedTerms: string[]; // top shared TF-IDF terms — the edge's stated "why"
}

export interface DocIntelligenceResult {
  keyConcepts: { term: string; weight: number }[];
  summary: string;
  detectedEntities: string[]; // heuristic — UI must label this "Detected entities (heuristic)"
  classification: { category: string; matchedTerms: string[] };
}

export interface ArchiveSession {
  documents: ArchiveDocument[];
}
```

- [ ] **Step 2: Write `corpus.ts`**

Ten seed documents, deliberately written so their topics form a connected, cyclic graph (spec §3): Knowledge Graphs → Entity Linking → RAG → Vector Databases → Embeddings → AI Governance → Agent Memory → back to Knowledge Graphs, plus three more (Semantic Search, Document Intelligence, Knowledge Workspaces) that each cross-link into that chain so the graph has multiple cycles, not just one.

```typescript
// lib/cerebro-archive/corpus.ts
// The CerebroArchive Live Runtime's seed corpus — ten short documents whose
// topics deliberately overlap so the demo knowledge graph is connected out
// of the box, rather than a scatter of isolated nodes. Every document here
// is real prose (not placeholder text) and is tokenized, indexed, searched,
// and graphed through the exact same pipeline as anything a visitor pastes in.

import { ArchiveDocument } from "./types";

export const seedCorpus: ArchiveDocument[] = [
  {
    id: "kg",
    title: "Knowledge Graphs",
    source: "seed",
    tags: [],
    text: "A knowledge graph represents an enterprise's entities and the relationships between them as a connected structure, rather than as isolated rows in a table. Documents, people, systems, and concepts become nodes; a semantic search can then traverse relationships instead of just matching keywords. Enterprise knowledge graphs are typically built by extracting entities from unstructured documents and linking them to a shared ontology, so that a retrieval system can pull in not just a matching document but its surrounding context. This structure feeds directly into retrieval and agent memory: an agent reasoning over a task can consult the graph to recall related decisions instead of treating every request as brand new.",
  },
  {
    id: "entity-linking",
    title: "Entity Linking",
    source: "seed",
    tags: [],
    text: "Entity linking is the process of recognizing a mention of a person, product, or concept in raw text and connecting it to a canonical entry in a knowledge graph, resolving ambiguity along the way — the same surface text can refer to different entities depending on context. This is a foundational step in document intelligence: before a system can classify or summarize a document well, it needs to know which entities the document actually discusses. Reliable entity linking turns a pile of unstructured documents into a structured, queryable knowledge graph, and it directly improves the quality of anything built on top of that graph, from search ranking to automated tagging.",
  },
  {
    id: "rag",
    title: "Retrieval-Augmented Generation",
    source: "seed",
    tags: [],
    text: "Retrieval-augmented generation combines a semantic search step with a generation step: instead of relying purely on a model's training data, the system first retrieves relevant passages from a vector database or knowledge graph, then reasons over that retrieved evidence to produce an answer. The quality of the retrieval step — how well the embeddings capture meaning, how the ranking scores documents — determines the ceiling on the whole pipeline's accuracy. A well-built RAG system treats retrieval as a first-class problem, not an afterthought bolted onto generation, and grounds every answer in retrieved, citable evidence rather than unstated assumptions.",
  },
  {
    id: "vector-db",
    title: "Vector Databases",
    source: "seed",
    tags: [],
    text: "A vector database stores documents as high-dimensional embeddings and answers queries by finding the nearest vectors under cosine similarity, rather than matching exact keywords. This is what makes semantic search possible at scale: a query about a concept can retrieve documents that never use the same words, because their embeddings sit close together in the vector space. Vector databases are a core piece of infrastructure behind retrieval-augmented generation — every RAG pipeline needs somewhere to look up the nearest relevant passages quickly, and the choice of indexing structure directly affects both retrieval latency and ranking quality.",
  },
  {
    id: "embeddings",
    title: "Embeddings",
    source: "seed",
    tags: [],
    text: "An embedding maps a piece of text to a vector of numbers such that texts with similar meaning end up close together in that vector space, which is what powers semantic search and vector databases. Embeddings are typically produced by a model trained on large amounts of text, and their quality directly determines how well downstream retrieval performs. Because embeddings encode whatever patterns exist in their training data, AI governance programs increasingly require documented evaluation of embedding models for bias and drift before they're deployed against enterprise knowledge graphs, particularly in regulated industries where retrieval results influence real decisions.",
  },
  {
    id: "governance",
    title: "AI Governance",
    source: "seed",
    tags: [],
    text: "AI governance is the set of policies, audit trails, and compliance controls that ensure an organization's AI systems — including embedding models, retrieval pipelines, and autonomous agents — behave predictably and can be held accountable when they don't. This includes documenting which models are deployed, what data trained them, and how their outputs are monitored over time. Governance extends naturally to agent memory and knowledge graphs: if an agent's decisions are shaped by what it recalls from memory, an auditor needs a way to inspect what was stored, why, and whether that memory itself introduced bias or risk into downstream recommendations.",
  },
  {
    id: "agent-memory",
    title: "Agent Memory",
    source: "seed",
    tags: [],
    text: "Agent memory is the mechanism by which an autonomous agent retains information across interactions instead of treating every request as isolated, typically organized into short-term, episodic, and semantic tiers. A well-designed memory system lets an agent recall a prior decision, connect it back to the enterprise's knowledge graph, and avoid repeating mistakes. Because agent memory accumulates over time and directly shapes future behavior, it falls squarely under AI governance: organizations need visibility into what an agent remembers and why, especially inside a shared knowledge workspace where multiple agents and people draw on the same memory.",
  },
  {
    id: "semantic-search",
    title: "Semantic Search",
    source: "seed",
    tags: [],
    text: "Semantic search ranks documents by meaning rather than exact keyword overlap, typically by comparing query and document embeddings stored in a vector database and scoring their similarity. This is the retrieval half of retrieval-augmented generation: a good semantic search layer surfaces the passages a generation step actually needs, even when the query and the relevant document use completely different words. Ranking quality in semantic search depends heavily on embedding quality, and a search system that also understands entity relationships from a knowledge graph can go further, retrieving documents connected to a concept even when the query never mentions it directly.",
  },
  {
    id: "doc-intelligence",
    title: "Document Intelligence",
    source: "seed",
    tags: [],
    text: "Document intelligence covers the automated extraction, classification, and summarization of unstructured documents — contracts, reports, and internal wikis — turning them into structured, queryable data. It relies on entity linking to identify what a document is actually about, and on the same underlying indexing used for semantic search to produce accurate summaries and classifications. A mature document intelligence pipeline feeds its output back into an enterprise's knowledge graph, so that insights extracted from one document become available context for every future query about related entities.",
  },
  {
    id: "knowledge-workspaces",
    title: "Knowledge Workspaces",
    source: "seed",
    tags: [],
    text: "A knowledge workspace is a project-scoped environment where a team's documents, agent memory, and knowledge graph connections are shared and collaboratively maintained, rather than scattered across individual tools. Workspaces let a team's collective document intelligence output — extracted entities, summaries, classifications — accumulate in one place that both people and agents can query. Because a workspace's content directly feeds agent memory and shapes what agents recall in that context, workspace-level access controls are also where AI governance policies for a given team or project actually get enforced.",
  },
];
```

- [ ] **Step 3: Write the failing test**

```typescript
// lib/cerebro-archive/corpus.test.ts
import { test } from "node:test";
import assert from "node:assert";
import { seedCorpus } from "./corpus";

test("seed corpus has exactly 10 documents", () => {
  assert.strictEqual(seedCorpus.length, 10);
});

test("seed corpus document ids are unique", () => {
  const ids = seedCorpus.map((d) => d.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test("every seed document is tagged as source: seed with empty tags", () => {
  for (const doc of seedCorpus) {
    assert.strictEqual(doc.source, "seed");
    assert.deepStrictEqual(doc.tags, []);
  }
});

test("the corpus is connected: every document shares a significant word with at least one other", () => {
  const wordSets = seedCorpus.map((d) => new Set(d.text.toLowerCase().match(/[a-z]{5,}/g) ?? []));
  for (let i = 0; i < wordSets.length; i++) {
    const hasOverlap = wordSets.some((other, j) => {
      if (i === j) return false;
      let shared = 0;
      for (const w of wordSets[i]) if (other.has(w)) shared++;
      return shared >= 2;
    });
    assert.ok(hasOverlap, `Document "${seedCorpus[i].id}" shares no significant overlap with any other document`);
  }
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx tsx --test lib/cerebro-archive/corpus.test.ts`
Expected: FAIL — `Cannot find module './corpus'` (files don't exist yet if you write the test before the implementation; if you wrote `corpus.ts` first per Step 2, skip to Step 5 and confirm it PASSES instead).

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx tsx --test lib/cerebro-archive/corpus.test.ts`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 6: Commit**

```bash
git add lib/cerebro-archive/types.ts lib/cerebro-archive/corpus.ts lib/cerebro-archive/corpus.test.ts
git commit -m "feat(cerebro-archive): add core types and engineered seed corpus"
```

---

### Task 2: Tokenizer

**Files:**
- Create: `lib/cerebro-archive/tokenize.ts`
- Test: `lib/cerebro-archive/tokenize.test.ts`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces: `tokenize(text: string): string[]`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/cerebro-archive/tokenize.test.ts
import { test } from "node:test";
import assert from "node:assert";
import { tokenize } from "./tokenize";

test("lowercases and splits on whitespace", () => {
  assert.deepStrictEqual(tokenize("Knowledge Graph"), ["knowledge", "graph"]);
});

test("strips punctuation", () => {
  assert.deepStrictEqual(tokenize("Hello, world!"), ["hello", "world"]);
});

test("normalizes repeated whitespace and trims empty tokens", () => {
  assert.deepStrictEqual(tokenize("  hello   world  "), ["hello", "world"]);
});

test("removes stopwords", () => {
  assert.deepStrictEqual(tokenize("the knowledge graph is a structure"), ["knowledge", "graph", "structure"]);
});

test("returns an empty array for empty input", () => {
  assert.deepStrictEqual(tokenize(""), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cerebro-archive/tokenize.test.ts`
Expected: FAIL with `Cannot find module './tokenize'`

- [ ] **Step 3: Write `tokenize.ts`**

```typescript
// lib/cerebro-archive/tokenize.ts
// Shared tokenization for the CerebroArchive runtime — applied identically
// to seed documents, user-pasted documents, and search queries. No branching
// based on document source.

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at", "for",
  "with", "by", "is", "are", "was", "were", "be", "been", "being", "this",
  "that", "these", "those", "it", "its", "as", "from", "into", "than", "then",
  "so", "such", "not", "no", "can", "will", "would", "should", "could", "may",
  "might", "also", "which", "their", "them", "have", "has", "had",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/cerebro-archive/tokenize.test.ts`
Expected: `# pass 5`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/cerebro-archive/tokenize.ts lib/cerebro-archive/tokenize.test.ts
git commit -m "feat(cerebro-archive): add shared tokenizer"
```

---

### Task 3: TF-IDF vectorization

**Files:**
- Create: `lib/cerebro-archive/vectorize.ts`
- Test: `lib/cerebro-archive/vectorize.test.ts`

**Interfaces:**
- Consumes: `tokenize` from `./tokenize` (Task 2); `ArchiveDocument` from `./types` (Task 1)
- Produces: `DocVector { docId: string; tokens: string[]; termFreq: Map<string, number> }`; `computeTermFrequency(text: string): { tokens: string[]; termFreq: Map<string, number> }`; `vectorizeDocument(doc: ArchiveDocument): DocVector`; `computeIdf(vectors: DocVector[]): Map<string, number>`; `tfidfVector(vector: DocVector, idf: Map<string, number>): Map<string, number>`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/cerebro-archive/vectorize.test.ts
import { test } from "node:test";
import assert from "node:assert";
import { computeTermFrequency, vectorizeDocument, computeIdf, tfidfVector } from "./vectorize";
import { ArchiveDocument } from "./types";

test("computeTermFrequency normalizes counts by document length", () => {
  const { termFreq } = computeTermFrequency("graph graph knowledge");
  assert.strictEqual(termFreq.get("graph"), 2 / 3);
  assert.strictEqual(termFreq.get("knowledge"), 1 / 3);
});

test("vectorizeDocument attaches the document id", () => {
  const doc: ArchiveDocument = { id: "d1", title: "T", text: "knowledge graph", source: "seed", tags: [] };
  const vector = vectorizeDocument(doc);
  assert.strictEqual(vector.docId, "d1");
  assert.ok(vector.termFreq.has("knowledge"));
});

test("computeIdf gives a term appearing in every document a score of 0", () => {
  const docs: ArchiveDocument[] = [
    { id: "a", title: "A", text: "knowledge graph", source: "seed", tags: [] },
    { id: "b", title: "B", text: "knowledge base", source: "seed", tags: [] },
  ];
  const vectors = docs.map(vectorizeDocument);
  const idf = computeIdf(vectors);
  // "knowledge" appears in both of 2 docs: log(2 / (1 + 2)) < 0
  assert.ok((idf.get("knowledge") ?? 0) < (idf.get("graph") ?? 0));
});

test("tfidfVector weights a rare term higher than a common one", () => {
  const docs: ArchiveDocument[] = [
    { id: "a", title: "A", text: "knowledge graph retrieval", source: "seed", tags: [] },
    { id: "b", title: "B", text: "knowledge base storage", source: "seed", tags: [] },
    { id: "c", title: "C", text: "knowledge index search", source: "seed", tags: [] },
  ];
  const vectors = docs.map(vectorizeDocument);
  const idf = computeIdf(vectors);
  const vecA = tfidfVector(vectors[0], idf);
  // "retrieval" only appears in doc A; "knowledge" appears in all three.
  assert.ok((vecA.get("retrieval") ?? 0) > (vecA.get("knowledge") ?? 0));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cerebro-archive/vectorize.test.ts`
Expected: FAIL with `Cannot find module './vectorize'`

- [ ] **Step 3: Write `vectorize.ts`**

```typescript
// lib/cerebro-archive/vectorize.ts
// TF-IDF vector computation, shared by search.ts and graph.ts so both
// features reuse one representation instead of computing similarity twice.

import { ArchiveDocument } from "./types";
import { tokenize } from "./tokenize";

export interface DocVector {
  docId: string;
  tokens: string[];
  termFreq: Map<string, number>; // normalized: count / total tokens in doc
}

export function computeTermFrequency(text: string): { tokens: string[]; termFreq: Map<string, number> } {
  const tokens = tokenize(text);
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);

  const termFreq = new Map<string, number>();
  for (const [term, count] of counts) termFreq.set(term, count / tokens.length);

  return { tokens, termFreq };
}

export function vectorizeDocument(doc: ArchiveDocument): DocVector {
  const { tokens, termFreq } = computeTermFrequency(doc.text);
  return { docId: doc.id, tokens, termFreq };
}

/** IDF computed over whatever set of vectors is passed in — the caller merges
 * the seed corpus with a session's user documents before calling this. */
export function computeIdf(vectors: DocVector[]): Map<string, number> {
  const documentFrequency = new Map<string, number>();
  for (const vector of vectors) {
    for (const term of vector.termFreq.keys()) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  const totalDocs = vectors.length;
  for (const [term, count] of documentFrequency) {
    idf.set(term, Math.log(totalDocs / (1 + count)));
  }
  return idf;
}

export function tfidfVector(vector: DocVector, idf: Map<string, number>): Map<string, number> {
  const tfidf = new Map<string, number>();
  for (const [term, tf] of vector.termFreq) {
    tfidf.set(term, tf * (idf.get(term) ?? 0));
  }
  return tfidf;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/cerebro-archive/vectorize.test.ts`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/cerebro-archive/vectorize.ts lib/cerebro-archive/vectorize.test.ts
git commit -m "feat(cerebro-archive): add TF-IDF vectorization"
```

---

### Task 4: Search (cosine similarity ranking)

**Files:**
- Create: `lib/cerebro-archive/search.ts`
- Test: `lib/cerebro-archive/search.test.ts`

**Interfaces:**
- Consumes: `DocVector`, `computeTermFrequency`, `computeIdf`, `tfidfVector` from `./vectorize` (Task 3); `ArchiveDocument`, `SearchResult` from `./types` (Task 1)
- Produces: `search(query: string, documents: ArchiveDocument[], vectors: DocVector[]): SearchResult[]`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/cerebro-archive/search.test.ts
import { test } from "node:test";
import assert from "node:assert";
import { search } from "./search";
import { vectorizeDocument } from "./vectorize";
import { ArchiveDocument } from "./types";

const docs: ArchiveDocument[] = [
  { id: "kg", title: "Knowledge Graphs", text: "A knowledge graph connects entities and relationships for retrieval.", source: "seed", tags: [] },
  { id: "vdb", title: "Vector Databases", text: "A vector database stores embeddings for semantic search and similarity.", source: "seed", tags: [] },
  { id: "unrelated", title: "Unrelated", text: "Bananas are a good source of potassium and fiber.", source: "seed", tags: [] },
];
const vectors = docs.map(vectorizeDocument);

test("ranks the most relevant document first", () => {
  const results = search("knowledge graph entities", docs, vectors);
  assert.strictEqual(results[0].doc.id, "kg");
});

test("excludes documents with zero similarity", () => {
  const results = search("knowledge graph entities", docs, vectors);
  assert.ok(!results.some((r) => r.doc.id === "unrelated"));
});

test("sorts matchedTerms by contribution, not alphabetically", () => {
  const results = search("knowledge graph entities relationships", docs, vectors);
  const kgResult = results.find((r) => r.doc.id === "kg")!;
  for (let i = 1; i < kgResult.matchedTerms.length; i++) {
    assert.ok(kgResult.matchedTerms[i - 1].contribution >= kgResult.matchedTerms[i].contribution);
  }
});

test("returns an empty array when nothing matches", () => {
  const results = search("xyzabc123", docs, vectors);
  assert.strictEqual(results.length, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cerebro-archive/search.test.ts`
Expected: FAIL with `Cannot find module './search'`

- [ ] **Step 3: Write `search.ts`**

```typescript
// lib/cerebro-archive/search.ts
// TF-IDF + cosine similarity ranking. The query is tokenized and vectorized
// through the same functions as any document — no special-cased query path.

import { ArchiveDocument, SearchResult } from "./types";
import { DocVector, computeTermFrequency, computeIdf, tfidfVector } from "./vectorize";

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const value of a.values()) magA += value * value;
  for (const value of b.values()) magB += value * value;
  for (const [term, valueA] of a) {
    const valueB = b.get(term);
    if (valueB) dot += valueA * valueB;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function search(query: string, documents: ArchiveDocument[], vectors: DocVector[]): SearchResult[] {
  const idf = computeIdf(vectors);

  const docTfidfs = new Map<string, Map<string, number>>();
  for (const vector of vectors) docTfidfs.set(vector.docId, tfidfVector(vector, idf));

  const { termFreq: queryTf } = computeTermFrequency(query);
  const queryTfidf = new Map<string, number>();
  for (const [term, tf] of queryTf) queryTfidf.set(term, tf * (idf.get(term) ?? 0));

  const results: SearchResult[] = [];
  for (const doc of documents) {
    const docVector = docTfidfs.get(doc.id);
    if (!docVector) continue;

    const score = cosineSimilarity(queryTfidf, docVector);
    if (score <= 0) continue;

    const matchedTerms = [...queryTfidf.keys()]
      .filter((term) => docVector.has(term))
      .map((term) => ({ term, contribution: queryTfidf.get(term)! * docVector.get(term)! }))
      .sort((a, b) => b.contribution - a.contribution);

    results.push({ doc, score, matchedTerms });
  }

  return results.sort((a, b) => b.score - a.score);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/cerebro-archive/search.test.ts`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/cerebro-archive/search.ts lib/cerebro-archive/search.test.ts
git commit -m "feat(cerebro-archive): add TF-IDF cosine similarity search"
```

---

### Task 5: Knowledge graph construction

**Files:**
- Create: `lib/cerebro-archive/graph.ts`
- Test: `lib/cerebro-archive/graph.test.ts`

**Interfaces:**
- Consumes: `DocVector`, `computeIdf`, `tfidfVector` from `./vectorize` (Task 3); `ArchiveDocument`, `GraphNode`, `GraphEdge` from `./types` (Task 1)
- Produces: `GRAPH_EDGE_THRESHOLD: number`; `buildGraph(documents: ArchiveDocument[], vectors: DocVector[]): { nodes: GraphNode[]; edges: GraphEdge[] }`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/cerebro-archive/graph.test.ts
import { test } from "node:test";
import assert from "node:assert";
import { buildGraph, GRAPH_EDGE_THRESHOLD } from "./graph";
import { vectorizeDocument } from "./vectorize";
import { ArchiveDocument } from "./types";

const docs: ArchiveDocument[] = [
  { id: "kg", title: "Knowledge Graphs", text: "A knowledge graph connects entities and relationships for retrieval and semantic search.", source: "seed", tags: [] },
  { id: "vdb", title: "Vector Databases", text: "A vector database enables semantic search and retrieval using embeddings.", source: "seed", tags: [] },
  { id: "unrelated", title: "Unrelated", text: "Bananas are a good source of potassium and fiber.", source: "seed", tags: [] },
];
const vectors = docs.map(vectorizeDocument);

test("produces one node per document", () => {
  const { nodes } = buildGraph(docs, vectors);
  assert.strictEqual(nodes.length, 3);
});

test("connects documents with real overlapping vocabulary above threshold", () => {
  const { edges } = buildGraph(docs, vectors);
  const kgToVdb = edges.find((e) => (e.from === "kg" && e.to === "vdb") || (e.from === "vdb" && e.to === "kg"));
  assert.ok(kgToVdb, "expected an edge between kg and vdb");
  assert.ok(kgToVdb!.weight > GRAPH_EDGE_THRESHOLD);
});

test("does not connect unrelated documents", () => {
  const { edges } = buildGraph(docs, vectors);
  const hasUnrelatedEdge = edges.some((e) => e.from === "unrelated" || e.to === "unrelated");
  assert.strictEqual(hasUnrelatedEdge, false);
});

test("every edge carries a non-empty reason (sharedTerms) when weight exceeds threshold", () => {
  const { edges } = buildGraph(docs, vectors);
  for (const edge of edges) {
    assert.ok(edge.sharedTerms.length > 0, `edge ${edge.from}->${edge.to} has no stated reason`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cerebro-archive/graph.test.ts`
Expected: FAIL with `Cannot find module './graph'`

- [ ] **Step 3: Write `graph.ts`**

```typescript
// lib/cerebro-archive/graph.ts
// Knowledge graph edges reuse the same TF-IDF vectors computed for search —
// no second similarity algorithm. Every edge carries the shared top terms
// that produced it, so a connection is always a stated reason, not just a line.

import { ArchiveDocument, GraphEdge, GraphNode } from "./types";
import { DocVector, computeIdf, tfidfVector } from "./vectorize";

export const GRAPH_EDGE_THRESHOLD = 0.10;
const TOP_TERMS_FOR_LABEL = 5;

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const value of a.values()) magA += value * value;
  for (const value of b.values()) magB += value * value;
  for (const [term, valueA] of a) {
    const valueB = b.get(term);
    if (valueB) dot += valueA * valueB;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function topTerms(vector: Map<string, number>, n: number): Set<string> {
  return new Set([...vector.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([term]) => term));
}

export function buildGraph(
  documents: ArchiveDocument[],
  vectors: DocVector[]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const idf = computeIdf(vectors);

  const tfidfs = new Map<string, Map<string, number>>();
  for (const vector of vectors) tfidfs.set(vector.docId, tfidfVector(vector, idf));

  const nodes: GraphNode[] = documents.map((doc) => ({ docId: doc.id, title: doc.title }));
  const edges: GraphEdge[] = [];

  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      const vecA = tfidfs.get(documents[i].id);
      const vecB = tfidfs.get(documents[j].id);
      if (!vecA || !vecB) continue;

      const weight = cosineSimilarity(vecA, vecB);
      if (weight <= GRAPH_EDGE_THRESHOLD) continue;

      const topA = topTerms(vecA, TOP_TERMS_FOR_LABEL);
      const topB = topTerms(vecB, TOP_TERMS_FOR_LABEL);
      const sharedTerms = [...topA].filter((term) => topB.has(term));

      edges.push({ from: documents[i].id, to: documents[j].id, weight, sharedTerms });
    }
  }

  return { nodes, edges };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/cerebro-archive/graph.test.ts`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/cerebro-archive/graph.ts lib/cerebro-archive/graph.test.ts
git commit -m "feat(cerebro-archive): add knowledge graph construction"
```

---

### Task 6: Document intelligence (summary, entities, classification)

**Files:**
- Create: `lib/cerebro-archive/intelligence.ts`
- Test: `lib/cerebro-archive/intelligence.test.ts`

**Interfaces:**
- Consumes: `tokenize` from `./tokenize` (Task 2); `DocVector`, `computeIdf`, `tfidfVector` from `./vectorize` (Task 3); `ArchiveDocument`, `DocIntelligenceResult` from `./types` (Task 1)
- Produces: `keyConcepts(tfidf: Map<string, number>): { term: string; weight: number }[]`; `extractiveSummary(text: string, tfidf: Map<string, number>): string`; `detectEntities(text: string): string[]`; `classify(concepts: { term: string; weight: number }[]): { category: string; matchedTerms: string[] }`; `analyzeDocument(doc: ArchiveDocument, vectors: DocVector[]): DocIntelligenceResult`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/cerebro-archive/intelligence.test.ts
import { test } from "node:test";
import assert from "node:assert";
import { keyConcepts, extractiveSummary, detectEntities, classify, analyzeDocument } from "./intelligence";
import { vectorizeDocument } from "./vectorize";
import { ArchiveDocument } from "./types";

test("keyConcepts returns terms sorted by weight descending", () => {
  const tfidf = new Map([["low", 0.1], ["high", 0.9], ["mid", 0.5]]);
  const result = keyConcepts(tfidf);
  assert.strictEqual(result[0].term, "high");
  assert.strictEqual(result[result.length - 1].term, "low");
});

test("extractiveSummary merges adjacent top sentences into one span", () => {
  const text = "Knowledge graphs connect entities. Retrieval depends on that structure. Bananas are yellow.";
  const tfidf = new Map([["knowledge", 1], ["graphs", 1], ["entities", 1], ["retrieval", 1], ["structure", 1]]);
  const summary = extractiveSummary(text, tfidf);
  assert.ok(summary.includes("Knowledge graphs connect entities."));
  assert.ok(!summary.includes("Bananas"));
});

test("detectEntities finds multi-word capitalized sequences", () => {
  const entities = detectEntities("The Knowledge Graph connects to the Vector Database for retrieval.");
  assert.ok(entities.includes("Knowledge Graph"));
  assert.ok(entities.includes("Vector Database"));
});

test("detectEntities excludes a lone sentence-initial common word", () => {
  const entities = detectEntities("The system works well.");
  assert.ok(!entities.includes("The"));
});

test("classify picks the category with the most matched keywords", () => {
  const concepts = [
    { term: "governance", weight: 0.9 },
    { term: "compliance", weight: 0.8 },
    { term: "audit", weight: 0.7 },
  ];
  const result = classify(concepts);
  assert.strictEqual(result.category, "Governance & Security");
  assert.ok(result.matchedTerms.length >= 2);
});

test("analyzeDocument returns a full result for a real document", () => {
  const doc: ArchiveDocument = {
    id: "d1",
    title: "Test Doc",
    text: "The Knowledge Graph connects entities for retrieval. Governance requires an audit trail.",
    source: "seed",
    tags: [],
  };
  const vectors = [doc].map(vectorizeDocument);
  const result = analyzeDocument(doc, vectors);
  assert.ok(result.keyConcepts.length > 0);
  assert.ok(result.summary.length > 0);
  assert.ok(Array.isArray(result.detectedEntities));
  assert.ok(result.classification.category.length > 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cerebro-archive/intelligence.test.ts`
Expected: FAIL with `Cannot find module './intelligence'`

- [ ] **Step 3: Write `intelligence.ts`**

```typescript
// lib/cerebro-archive/intelligence.ts
// Document intelligence: key concepts (already-computed TF-IDF data, just
// surfaced), extractive summary, a heuristic entity detector (never called
// "Named Entities" in the UI — it's a regex, not a real NER model), and
// keyword-based classification.

import { ArchiveDocument, DocIntelligenceResult } from "./types";
import { tokenize } from "./tokenize";
import { DocVector, computeIdf, tfidfVector } from "./vectorize";

const KEY_CONCEPT_COUNT = 6;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Knowledge & Retrieval": ["knowledge", "graph", "retrieval", "search", "semantic", "embeddings", "vector"],
  "Governance & Security": ["governance", "compliance", "audit", "policy", "risk", "security"],
  "Infrastructure": ["database", "storage", "infrastructure", "pipeline", "index", "indexing"],
  "Agents & Automation": ["agent", "memory", "automation", "workflow", "workspace"],
};

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function scoreSentence(sentence: string, tfidf: Map<string, number>): number {
  return tokenize(sentence).reduce((sum, term) => sum + (tfidf.get(term) ?? 0), 0);
}

export function keyConcepts(tfidf: Map<string, number>): { term: string; weight: number }[] {
  return [...tfidf.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, KEY_CONCEPT_COUNT)
    .map(([term, weight]) => ({ term, weight }));
}

export function extractiveSummary(text: string, tfidf: Map<string, number>): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return "";

  const scored = sentences.map((sentence, index) => ({ index, sentence, score: scoreSentence(sentence, tfidf) }));
  const topCount = Math.min(3, sentences.length);
  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, topCount);
  const sortedIndexes = [...new Set(top.map((t) => t.index))].sort((a, b) => a - b);

  // Merge sentences that are adjacent in the source text into one continuous span.
  const spans: string[] = [];
  let current: string[] = [];
  let lastIndex = -2;
  for (const index of sortedIndexes) {
    if (index === lastIndex + 1) {
      current.push(sentences[index]);
    } else {
      if (current.length > 0) spans.push(current.join(" "));
      current = [sentences[index]];
    }
    lastIndex = index;
  }
  if (current.length > 0) spans.push(current.join(" "));

  return spans.join(" ");
}

const SENTENCE_START_WORDS = new Set(["the", "this", "that", "these", "those", "a", "an", "it"]);

export function detectEntities(text: string): string[] {
  const candidates = text.match(/\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b/g) ?? [];
  const seen = new Set<string>();
  const entities: string[] = [];

  for (const candidate of candidates) {
    const isSingleWord = !candidate.includes(" ");
    const firstWord = candidate.split(" ")[0].toLowerCase();
    if (isSingleWord && SENTENCE_START_WORDS.has(firstWord)) continue;
    if (candidate.length < 3) continue;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    entities.push(candidate);
  }

  return entities;
}

export function classify(concepts: { term: string; weight: number }[]): { category: string; matchedTerms: string[] } {
  const conceptTerms = new Set(concepts.map((c) => c.term));
  let bestCategory = "Uncategorized";
  let bestMatches: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter((keyword) => conceptTerms.has(keyword));
    if (matches.length > bestMatches.length) {
      bestCategory = category;
      bestMatches = matches;
    }
  }

  return { category: bestCategory, matchedTerms: bestMatches };
}

export function analyzeDocument(doc: ArchiveDocument, vectors: DocVector[]): DocIntelligenceResult {
  const idf = computeIdf(vectors);
  const vector = vectors.find((v) => v.docId === doc.id);
  const tfidf = vector ? tfidfVector(vector, idf) : new Map<string, number>();

  const concepts = keyConcepts(tfidf);
  return {
    keyConcepts: concepts,
    summary: extractiveSummary(doc.text, tfidf),
    detectedEntities: detectEntities(doc.text),
    classification: classify(concepts),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/cerebro-archive/intelligence.test.ts`
Expected: `# pass 6`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/cerebro-archive/intelligence.ts lib/cerebro-archive/intelligence.test.ts
git commit -m "feat(cerebro-archive): add document intelligence (summary, entities, classification)"
```

---

### Task 7: Session store

**Files:**
- Create: `lib/cerebro-archive/session.ts`
- Test: `lib/cerebro-archive/session.test.ts`

**Interfaces:**
- Consumes: `seedCorpus` from `./corpus` (Task 1); `ArchiveDocument`, `ArchiveSession` from `./types` (Task 1)
- Produces: `getSession(sessionId: string): ArchiveSession`; `addDocument(sessionId: string, doc: ArchiveDocument): ArchiveSession`; `updateDocumentTags(sessionId: string, docId: string, tags: string[]): void`; `resetSession(sessionId: string): void`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/cerebro-archive/session.test.ts
import { test } from "node:test";
import assert from "node:assert";
import { getSession, addDocument, updateDocumentTags, resetSession } from "./session";
import { seedCorpus } from "./corpus";

test("a new session starts with the seed corpus", () => {
  const session = getSession("test-session-1");
  assert.strictEqual(session.documents.length, seedCorpus.length);
});

test("adding a document only affects that session", () => {
  addDocument("test-session-2", { id: "u1", title: "Mine", text: "some user text here that is long enough", source: "user", tags: [] });
  const sessionWithDoc = getSession("test-session-2");
  const otherSession = getSession("test-session-3");
  assert.strictEqual(sessionWithDoc.documents.length, seedCorpus.length + 1);
  assert.strictEqual(otherSession.documents.length, seedCorpus.length);
});

test("updateDocumentTags updates only the targeted document", () => {
  addDocument("test-session-4", { id: "u2", title: "Mine", text: "some user text here that is long enough", source: "user", tags: [] });
  updateDocumentTags("test-session-4", "u2", ["Governance & Security"]);
  const session = getSession("test-session-4");
  const doc = session.documents.find((d) => d.id === "u2")!;
  assert.deepStrictEqual(doc.tags, ["Governance & Security"]);
});

test("resetSession restores the session back to just the seed corpus", () => {
  addDocument("test-session-5", { id: "u3", title: "Mine", text: "some user text here that is long enough", source: "user", tags: [] });
  resetSession("test-session-5");
  const session = getSession("test-session-5");
  assert.strictEqual(session.documents.length, seedCorpus.length);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cerebro-archive/session.test.ts`
Expected: FAIL with `Cannot find module './session'`

- [ ] **Step 3: Write `session.ts`**

```typescript
// lib/cerebro-archive/session.ts
// In-memory, per-session document store. Deliberately never written to disk
// (spec §4): unlike AgentOS's memory, this could hold arbitrary pasted text,
// and persisting unmoderated public text indefinitely isn't a risk this
// feature needs to take on.

import { ArchiveDocument, ArchiveSession } from "./types";
import { seedCorpus } from "./corpus";

const sessions = new Map<string, ArchiveSession>();

export function getSession(sessionId: string): ArchiveSession {
  let session = sessions.get(sessionId);
  if (!session) {
    session = { documents: [...seedCorpus] };
    sessions.set(sessionId, session);
  }
  return session;
}

export function addDocument(sessionId: string, doc: ArchiveDocument): ArchiveSession {
  const session = getSession(sessionId);
  session.documents = [...session.documents, doc];
  return session;
}

export function updateDocumentTags(sessionId: string, docId: string, tags: string[]): void {
  const session = getSession(sessionId);
  session.documents = session.documents.map((doc) => (doc.id === docId ? { ...doc, tags } : doc));
}

export function resetSession(sessionId: string): void {
  sessions.set(sessionId, { documents: [...seedCorpus] });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/cerebro-archive/session.test.ts`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add lib/cerebro-archive/session.ts lib/cerebro-archive/session.test.ts
git commit -m "feat(cerebro-archive): add in-memory session store"
```

---

### Task 8: Composed entry point

**Files:**
- Create: `lib/cerebro-archive/index.ts`
- Test: `lib/cerebro-archive/index.test.ts`

**Interfaces:**
- Consumes: `vectorizeDocument` from `./vectorize` (Task 3); `search` from `./search` (Task 4); `buildGraph` from `./graph` (Task 5); `analyzeDocument` from `./intelligence` (Task 6); `getSession`, `addDocument`, `updateDocumentTags`, `resetSession` from `./session` (Task 7); `ArchiveDocument`, `SearchResult`, `DocIntelligenceResult`, `GraphNode`, `GraphEdge` from `./types` (Task 1)
- Produces: `ingestDocument(sessionId: string, title: string, text: string): ArchiveDocument`; `runSearch(sessionId: string, query: string): SearchResult[]`; `runGraph(sessionId: string): { nodes: GraphNode[]; edges: GraphEdge[] }`; `runDocumentIntelligence(sessionId: string, docId: string): DocIntelligenceResult | null`; `resetArchiveSession(sessionId: string): void`; `listDocuments(sessionId: string): ArchiveDocument[]`

This is the module that `app/actions/cerebro-archive-runtime.ts` (Task 9) calls — it mirrors `lib/agentos/index.ts`'s role as a composed entry point, not a flat re-export barrel.

- [ ] **Step 1: Write the failing test**

```typescript
// lib/cerebro-archive/index.test.ts
import { test } from "node:test";
import assert from "node:assert";
import { ingestDocument, runSearch, runGraph, runDocumentIntelligence, resetArchiveSession, listDocuments } from "./index";

test("ingestDocument adds a document that then appears in listDocuments", () => {
  const doc = ingestDocument("entry-session-1", "My Doc", "This is a long enough user document about knowledge graphs.");
  const docs = listDocuments("entry-session-1");
  assert.ok(docs.some((d) => d.id === doc.id));
  assert.strictEqual(doc.source, "user");
});

test("runSearch finds the seed document about knowledge graphs", () => {
  const results = runSearch("entry-session-2", "knowledge graph entities");
  assert.ok(results.some((r) => r.doc.id === "kg"));
});

test("runGraph returns a node for every document in the session, including a newly ingested one", () => {
  ingestDocument("entry-session-3", "Extra Doc", "Another sufficiently long user document about agent memory systems.");
  const { nodes } = runGraph("entry-session-3");
  assert.ok(nodes.length >= 11); // 10 seed + 1 ingested
});

test("runDocumentIntelligence populates the document's tags from its classification", () => {
  runDocumentIntelligence("entry-session-4", "kg");
  const docs = listDocuments("entry-session-4");
  const kg = docs.find((d) => d.id === "kg")!;
  assert.ok(kg.tags.length > 0);
});

test("runDocumentIntelligence returns null for an unknown document id", () => {
  const result = runDocumentIntelligence("entry-session-5", "does-not-exist");
  assert.strictEqual(result, null);
});

test("resetArchiveSession removes previously ingested documents", () => {
  ingestDocument("entry-session-6", "Temp", "A sufficiently long temporary document about vector databases.");
  resetArchiveSession("entry-session-6");
  const docs = listDocuments("entry-session-6");
  assert.ok(!docs.some((d) => d.source === "user"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/cerebro-archive/index.test.ts`
Expected: FAIL with `Cannot find module './index'`

- [ ] **Step 3: Write `index.ts`**

```typescript
// lib/cerebro-archive/index.ts
// Composed entry point — mirrors lib/agentos/index.ts's role. Each exported
// function wires tokenize -> vectorize -> search/graph/intelligence into one
// call, and is what app/actions/cerebro-archive-runtime.ts calls directly.

import { ArchiveDocument, SearchResult, DocIntelligenceResult, GraphNode, GraphEdge } from "./types";
import { DocVector, vectorizeDocument } from "./vectorize";
import { search as searchDocuments } from "./search";
import { buildGraph } from "./graph";
import { analyzeDocument } from "./intelligence";
import { getSession, addDocument, updateDocumentTags, resetSession as resetSessionStore } from "./session";
import { seedCorpus } from "./corpus";

// The seed corpus never changes, so its vectors are computed once here at
// module load (spec §4) rather than re-tokenized on every call — only a
// session's (few) user-added documents get vectorized per request.
const seedVectors: DocVector[] = seedCorpus.map(vectorizeDocument);
const seedIds = new Set(seedCorpus.map((d) => d.id));

function vectorsForSession(documents: ArchiveDocument[]): DocVector[] {
  const userVectors = documents.filter((d) => !seedIds.has(d.id)).map(vectorizeDocument);
  return [...seedVectors, ...userVectors];
}

let idCounter = 0;
function makeDocumentId(): string {
  idCounter += 1;
  return `user_${Date.now().toString(36)}_${idCounter}`;
}

export function ingestDocument(sessionId: string, title: string, text: string): ArchiveDocument {
  const doc: ArchiveDocument = { id: makeDocumentId(), title, text, source: "user", tags: [] };
  addDocument(sessionId, doc);
  return doc;
}

export function runSearch(sessionId: string, query: string): SearchResult[] {
  const session = getSession(sessionId);
  return searchDocuments(query, session.documents, vectorsForSession(session.documents));
}

export function runGraph(sessionId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const session = getSession(sessionId);
  return buildGraph(session.documents, vectorsForSession(session.documents));
}

export function runDocumentIntelligence(sessionId: string, docId: string): DocIntelligenceResult | null {
  const session = getSession(sessionId);
  const doc = session.documents.find((d) => d.id === docId);
  if (!doc) return null;

  const result = analyzeDocument(doc, vectorsForSession(session.documents));
  updateDocumentTags(sessionId, docId, [result.classification.category]);
  return result;
}

export function resetArchiveSession(sessionId: string): void {
  resetSessionStore(sessionId);
}

export function listDocuments(sessionId: string): ArchiveDocument[] {
  return getSession(sessionId).documents;
}
```

Note: `vectorsForSession` distinguishes seed vs. user documents by `id` membership in `seedIds`, not object identity — this stays correct even after `updateDocumentTags` replaces a seed document's object with a new `{ ...doc, tags }` copy, since vectorization only depends on `.text`, which never changes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/cerebro-archive/index.test.ts`
Expected: `# pass 6`, `# fail 0`

- [ ] **Step 5: Run every lib/cerebro-archive test file together to confirm nothing regressed**

Run: `npx tsx --test lib/cerebro-archive/*.test.ts`
Expected: All prior tests plus this task's tests pass — `# fail 0` overall.

- [ ] **Step 6: Commit**

```bash
git add lib/cerebro-archive/index.ts lib/cerebro-archive/index.test.ts
git commit -m "feat(cerebro-archive): add composed runtime entry point"
```

---

### Task 9: Rate-limited server actions

**Files:**
- Create: `app/actions/cerebro-archive-runtime.ts`

**Interfaces:**
- Consumes: `ingestDocument`, `runSearch`, `runGraph`, `runDocumentIntelligence`, `resetArchiveSession`, `listDocuments` from `@/lib/cerebro-archive` (Task 8); `ArchiveDocument`, `SearchResult`, `DocIntelligenceResult`, `GraphNode`, `GraphEdge` from `@/lib/cerebro-archive/types` (Task 1); `rateLimit` from `@/lib/security/rateLimit` (existing)
- Produces: `ingestArchiveDocument`, `runArchiveSearch`, `getArchiveGraph`, `runArchiveDocumentIntelligence`, `getArchiveDocuments`, `resetArchiveSessionAction` — all exported async server actions, consumed by Tasks 10–12

No test file for this task: server actions require a request context (`headers()`) that isn't available outside a running Next.js server, and `lib/agentos`'s equivalent server action file has no dedicated test either — consistent with existing convention. Verification here is a TypeScript compile check plus manual exercise once the UI is wired in Tasks 10–13.

- [ ] **Step 1: Write `app/actions/cerebro-archive-runtime.ts`**

```typescript
"use server";

import { headers } from "next/headers";
import {
  ingestDocument,
  runSearch,
  runGraph,
  runDocumentIntelligence,
  resetArchiveSession,
  listDocuments,
} from "@/lib/cerebro-archive";
import { ArchiveDocument, SearchResult, DocIntelligenceResult, GraphNode, GraphEdge } from "@/lib/cerebro-archive/types";
import { rateLimit } from "@/lib/security/rateLimit";

// Same rationale as app/actions/agentos-runtime.ts: Server Actions already
// get Next.js's built-in Origin-header CSRF protection, so only abuse-rate
// limiting is needed here. The runtime genuinely tokenizes/vectorizes on
// every call, so an unlimited client could still turn this into a real
// CPU-abuse vector even with no database behind it.
async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function ingestArchiveDocument(
  sessionId: string,
  title: string,
  text: string
): Promise<{ data?: ArchiveDocument; error?: string }> {
  if (!title.trim() || !text.trim()) {
    return { error: "Both a title and document text are required." };
  }
  if (text.trim().length < 50) {
    return { error: "Document text must be at least 50 characters." };
  }
  if (text.length > 5000) {
    return { error: "Document text is too long (max 5000 characters)." };
  }

  const key = await clientKey();
  const limited = rateLimit(`archive-ingest:${key}`, 20, 60_000);
  if (!limited.ok) {
    return { error: "Too many requests — please wait a moment before adding another document." };
  }

  try {
    const data = ingestDocument(sessionId, title.trim(), text.trim());
    return { data };
  } catch (error) {
    console.error("CerebroArchive ingest error:", error);
    return { error: "The runtime hit an unexpected error indexing that document." };
  }
}

export async function runArchiveSearch(
  sessionId: string,
  query: string
): Promise<{ data?: SearchResult[]; error?: string }> {
  if (!query.trim()) {
    return { error: "Search query cannot be empty." };
  }

  const key = await clientKey();
  const limited = rateLimit(`archive-search:${key}`, 30, 60_000);
  if (!limited.ok) {
    return { error: "Too many requests — please wait a moment before searching again." };
  }

  try {
    const data = runSearch(sessionId, query.trim());
    return { data };
  } catch (error) {
    console.error("CerebroArchive search error:", error);
    return { error: "The runtime hit an unexpected error running that search." };
  }
}

export async function getArchiveGraph(
  sessionId: string
): Promise<{ data?: { nodes: GraphNode[]; edges: GraphEdge[] }; error?: string }> {
  try {
    const data = runGraph(sessionId);
    return { data };
  } catch (error) {
    console.error("CerebroArchive graph error:", error);
    return { error: "The runtime hit an unexpected error building the graph." };
  }
}

export async function runArchiveDocumentIntelligence(
  sessionId: string,
  docId: string
): Promise<{ data?: DocIntelligenceResult; error?: string }> {
  const key = await clientKey();
  const limited = rateLimit(`archive-intel:${key}`, 30, 60_000);
  if (!limited.ok) {
    return { error: "Too many requests — please wait a moment before running another analysis." };
  }

  try {
    const data = runDocumentIntelligence(sessionId, docId);
    if (!data) return { error: "Document not found in this session." };
    return { data };
  } catch (error) {
    console.error("CerebroArchive document intelligence error:", error);
    return { error: "The runtime hit an unexpected error analyzing that document." };
  }
}

export async function getArchiveDocuments(sessionId: string): Promise<{ data?: ArchiveDocument[] }> {
  return { data: listDocuments(sessionId) };
}

export async function resetArchiveSessionAction(sessionId: string): Promise<{ ok: boolean }> {
  const key = await clientKey();
  const limited = rateLimit(`archive-reset:${key}`, 10, 60_000);
  if (!limited.ok) {
    return { ok: false };
  }
  resetArchiveSession(sessionId);
  return { ok: true };
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors referencing `app/actions/cerebro-archive-runtime.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/actions/cerebro-archive-runtime.ts
git commit -m "feat(cerebro-archive): add rate-limited server actions"
```

---

### Task 10: ArchiveLiveRuntime top-level component

**Files:**
- Create: `components/platform/live-runtime/cerebro-archive/ArchiveLiveRuntime.tsx`

**Interfaces:**
- Consumes: `ingestArchiveDocument`, `getArchiveDocuments` from `@/app/actions/cerebro-archive-runtime` (Task 9); `ArchiveDocument` from `@/lib/cerebro-archive/types` (Task 1); `SearchGraphPanel` (Task 11, imported but not yet created — see note below); `DocumentIntelligencePanel` (Task 12, imported but not yet created — see note below)
- Produces: `ArchiveLiveRuntime` component, consumed by Task 13's page wiring

Note: this component imports `SearchGraphPanel` and `DocumentIntelligencePanel`, which don't exist until Tasks 11 and 12. Create stub files for both first so this task type-checks in isolation, then Tasks 11/12 replace the stubs with real implementations.

- [ ] **Step 1: Create temporary stubs so this task can type-check standalone**

```typescript
// components/platform/live-runtime/cerebro-archive/SearchGraphPanel.tsx (temporary stub — replaced in Task 11)
"use client";
import { ArchiveDocument } from "@/lib/cerebro-archive/types";
export function SearchGraphPanel(_props: { sessionId: string; documents: ArchiveDocument[] }) {
  return null;
}
```

```typescript
// components/platform/live-runtime/cerebro-archive/DocumentIntelligencePanel.tsx (temporary stub — replaced in Task 12)
"use client";
import { ArchiveDocument } from "@/lib/cerebro-archive/types";
export function DocumentIntelligencePanel(_props: { sessionId: string; documents: ArchiveDocument[]; onAnalyzed: () => void }) {
  return null;
}
```

- [ ] **Step 2: Write `ArchiveLiveRuntime.tsx`**

```tsx
// components/platform/live-runtime/cerebro-archive/ArchiveLiveRuntime.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Archive, Search, FileSearch, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ingestArchiveDocument, getArchiveDocuments } from "@/app/actions/cerebro-archive-runtime";
import { ArchiveDocument } from "@/lib/cerebro-archive/types";
import { SearchGraphPanel } from "./SearchGraphPanel";
import { DocumentIntelligencePanel } from "./DocumentIntelligencePanel";

type Tab = "search" | "intelligence";

function getArchiveSessionId(): string {
  if (typeof window === "undefined") return "server";
  const KEY = "cerebro_archive_session_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = `archive_session_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function ArchiveLiveRuntime() {
  const [sessionId, setSessionId] = useState("");
  const [tab, setTab] = useState<Tab>("search");
  const [documents, setDocuments] = useState<ArchiveDocument[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const refreshDocuments = useCallback(async (id: string) => {
    const res = await getArchiveDocuments(id);
    if (res.data) setDocuments(res.data);
  }, []);

  useEffect(() => {
    const id = getArchiveSessionId();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(id);
    refreshDocuments(id);
  }, [refreshDocuments]);

  const handleAddDocument = async () => {
    if (!sessionId) return;
    setAdding(true);
    setAddError(null);
    const res = await ingestArchiveDocument(sessionId, title, text);
    setAdding(false);
    if (res.error) {
      setAddError(res.error);
      return;
    }
    setTitle("");
    setText("");
    setShowAddForm(false);
    await refreshDocuments(sessionId);
  };

  return (
    <section className="section-pad border-b border-border bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary-accent/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-accent/10 border border-primary-accent/30 mb-4">
              <Archive size={12} className="text-primary-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent">CerebroArchive — Live Runtime</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Search, Graph, and Understand</h2>
            <p className="text-text-secondary max-w-2xl font-inter">
              Every search, graph connection, ranking, entity detection, and document analysis shown here is computed by the
              runtime currently executing in this application. Seed documents and anything you paste in pass through the
              identical indexing and retrieval pipeline. Results come from live computation, not pre-recorded responses.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors shrink-0"
          >
            <Plus size={14} /> {showAddForm ? "Cancel" : "Add a Document"}
          </button>
        </div>

        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 p-5 rounded-xl bg-surface border border-border">
            <div className="flex flex-col gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="px-4 py-2.5 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary-accent/60"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste at least 50 characters of document text…"
                rows={4}
                className="px-4 py-2.5 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-primary-accent/60 resize-none"
              />
              {addError && <div className="text-xs text-red-400">{addError}</div>}
              <button
                onClick={handleAddDocument}
                disabled={adding || !title.trim() || text.trim().length < 50}
                className="self-start px-5 py-2.5 bg-primary-accent text-text-primary font-space font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-40 transition-transform hover:-translate-y-0.5"
              >
                {adding ? "Indexing…" : "Index Document"}
              </button>
            </div>
          </motion.div>
        )}

        <div className="inline-flex p-1 rounded-lg bg-surface border border-border gap-1 mb-8">
          <button
            onClick={() => setTab("search")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors",
              tab === "search" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Search size={14} /> Search & Graph
          </button>
          <button
            onClick={() => setTab("intelligence")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors",
              tab === "intelligence" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <FileSearch size={14} /> Document Intelligence
          </button>
        </div>

        {sessionId && tab === "search" && <SearchGraphPanel sessionId={sessionId} documents={documents} />}
        {sessionId && tab === "intelligence" && (
          <DocumentIntelligencePanel sessionId={sessionId} documents={documents} onAnalyzed={() => refreshDocuments(sessionId)} />
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors referencing `ArchiveLiveRuntime.tsx` (the stub panels satisfy the imports for now).

- [ ] **Step 4: Commit**

```bash
git add components/platform/live-runtime/cerebro-archive/ArchiveLiveRuntime.tsx components/platform/live-runtime/cerebro-archive/SearchGraphPanel.tsx components/platform/live-runtime/cerebro-archive/DocumentIntelligencePanel.tsx
git commit -m "feat(cerebro-archive): add ArchiveLiveRuntime top-level component (with panel stubs)"
```

---

### Task 11: SearchGraphPanel component

**Files:**
- Modify: `components/platform/live-runtime/cerebro-archive/SearchGraphPanel.tsx` (replacing Task 10's stub)

**Interfaces:**
- Consumes: `runArchiveSearch`, `getArchiveGraph` from `@/app/actions/cerebro-archive-runtime` (Task 9); `ArchiveDocument`, `SearchResult`, `GraphNode`, `GraphEdge` from `@/lib/cerebro-archive/types` (Task 1)
- Produces: `SearchGraphPanel` component, consumed by `ArchiveLiveRuntime` (Task 10)

The graph is fetched independently of search (on mount and whenever the document list changes), so it's visible before any search runs; running a search only highlights matching nodes/edges in place rather than replacing the graph (spec §6). The layout is a dynamically-computed radial position per node (same percentage-circle technique already proven in `components/home/v4-os/IntegrationIntelligence.tsx`), with edges drawn as raw SVG `<line>` elements — not the `Node`/`Edge` primitives in `components/ui/visualization/`, which are only proven for small, fixed hub-and-spoke layouts (see `LivingEnterpriseBrain.tsx`), not a dynamic N-node graph with peer-to-peer edges.

- [ ] **Step 1: Write `SearchGraphPanel.tsx`**

```tsx
// components/platform/live-runtime/cerebro-archive/SearchGraphPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { runArchiveSearch, getArchiveGraph } from "@/app/actions/cerebro-archive-runtime";
import { ArchiveDocument, SearchResult, GraphNode, GraphEdge } from "@/lib/cerebro-archive/types";

const EXAMPLE_QUERIES = [
  "knowledge graph retrieval",
  "vector database embeddings",
  "AI governance and compliance",
  "agent memory workspace",
];

interface SearchGraphPanelProps {
  sessionId: string;
  documents: ArchiveDocument[];
}

export function SearchGraphPanel({ sessionId, documents }: SearchGraphPanelProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionId) return;
    getArchiveGraph(sessionId).then((res) => {
      if (res.data) setGraph(res.data);
    });
  }, [sessionId, documents.length]);

  const runSearch = async (queryOverride?: string) => {
    const term = (queryOverride ?? query).trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    const res = await runArchiveSearch(sessionId, term);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setResults(res.data);
      setHighlightedIds(new Set(res.data.slice(0, 5).map((r) => r.doc.id)));
    }
  };

  const nodePositions = React.useMemo(() => {
    const nodes = graph?.nodes ?? [];
    const positions = new Map<string, { top: number; left: number }>();
    nodes.forEach((node, index) => {
      const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
      const radius = 38;
      positions.set(node.docId, { top: 50 + Math.sin(angle) * radius, left: 50 + Math.cos(angle) * radius });
    });
    return positions;
  }, [graph]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => {
              setQuery(q);
              runSearch(q);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-full text-[11px] font-space font-semibold bg-surface-elevated border border-border text-text-secondary hover:text-text-primary hover:border-primary-accent/50 transition-colors disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="Search the corpus — try a concept, not just a keyword…"
          className="flex-1 px-4 py-3.5 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-muted font-inter text-sm focus:outline-none focus:border-primary-accent/60"
        />
        <button
          onClick={() => runSearch()}
          disabled={loading || !query.trim()}
          className="px-6 py-3.5 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-0.5 shadow-elevated disabled:opacity-40 disabled:hover:translate-y-0 flex items-center justify-center gap-2 shrink-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <SearchIcon size={16} />}
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface border border-border p-5 md:p-6">
          <h3 className="text-sm font-space font-bold text-text-primary mb-4">Ranked Results</h3>
          {!results && <div className="text-sm text-text-muted">Run a search to see ranked results.</div>}
          {results && results.length === 0 && <div className="text-sm text-text-muted">No documents matched that query.</div>}
          <ul className="space-y-3">
            {results?.map((r) => (
              <li key={r.doc.id} className="p-3 rounded-lg bg-surface-elevated border border-border">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-sm font-medium text-text-primary">{r.doc.title}</span>
                  <span className="text-xs font-mono text-primary-accent">{r.score.toFixed(3)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {r.matchedTerms.slice(0, 5).map((m) => (
                    <span key={m.term} className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-text-muted">
                      {m.term} ({m.contribution.toFixed(3)})
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-5 md:p-6 relative">
          <h3 className="text-sm font-space font-bold text-text-primary mb-4">Knowledge Graph</h3>
          <div className="relative w-full aspect-square">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {graph?.edges.map((edge, i) => {
                const from = nodePositions.get(edge.from);
                const to = nodePositions.get(edge.to);
                if (!from || !to) return null;
                const isHighlighted = highlightedIds.has(edge.from) && highlightedIds.has(edge.to);
                return (
                  <line
                    key={i}
                    x1={`${from.left}%`}
                    y1={`${from.top}%`}
                    x2={`${to.left}%`}
                    y2={`${to.top}%`}
                    stroke={isHighlighted ? "rgba(0,229,255,0.8)" : "rgba(255,255,255,0.15)"}
                    strokeWidth={Math.max(1, edge.weight * 6)}
                  >
                    <title>{`linked via: ${edge.sharedTerms.join(", ")}`}</title>
                  </line>
                );
              })}
            </svg>
            {graph?.nodes.map((node) => {
              const pos = nodePositions.get(node.docId);
              if (!pos) return null;
              const isHighlighted = highlightedIds.has(node.docId);
              return (
                <div key={node.docId} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: `${pos.top}%`, left: `${pos.left}%` }}>
                  <div
                    className={
                      isHighlighted
                        ? "px-2.5 py-1.5 rounded-lg bg-primary-accent/20 border border-primary-accent text-primary-accent text-[10px] font-bold whitespace-nowrap shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                        : "px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border text-text-muted text-[10px] font-medium whitespace-nowrap"
                    }
                  >
                    {node.title}
                  </div>
                </div>
              );
            })}
            {!graph && <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">Loading graph…</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors referencing `SearchGraphPanel.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/platform/live-runtime/cerebro-archive/SearchGraphPanel.tsx
git commit -m "feat(cerebro-archive): implement SearchGraphPanel with live knowledge graph"
```

---

### Task 12: DocumentIntelligencePanel component

**Files:**
- Modify: `components/platform/live-runtime/cerebro-archive/DocumentIntelligencePanel.tsx` (replacing Task 10's stub)

**Interfaces:**
- Consumes: `runArchiveDocumentIntelligence` from `@/app/actions/cerebro-archive-runtime` (Task 9); `ArchiveDocument`, `DocIntelligenceResult` from `@/lib/cerebro-archive/types` (Task 1)
- Produces: `DocumentIntelligencePanel` component, consumed by `ArchiveLiveRuntime` (Task 10)

- [ ] **Step 1: Write `DocumentIntelligencePanel.tsx`**

```tsx
// components/platform/live-runtime/cerebro-archive/DocumentIntelligencePanel.tsx
"use client";

import React, { useState } from "react";
import { Loader2, FileSearch } from "lucide-react";
import { runArchiveDocumentIntelligence } from "@/app/actions/cerebro-archive-runtime";
import { ArchiveDocument, DocIntelligenceResult } from "@/lib/cerebro-archive/types";

interface DocumentIntelligencePanelProps {
  sessionId: string;
  documents: ArchiveDocument[];
  onAnalyzed: () => void;
}

export function DocumentIntelligencePanel({ sessionId, documents, onAnalyzed }: DocumentIntelligencePanelProps) {
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocIntelligenceResult | null>(null);

  const runAnalysis = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    const res = await runArchiveDocumentIntelligence(sessionId, selectedId);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setResult(res.data);
      onAnalyzed();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 px-4 py-3.5 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:border-primary-accent/60"
        >
          <option value="">Select a document to analyze…</option>
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.title} {doc.source === "user" ? "(yours)" : ""}
            </option>
          ))}
        </select>
        <button
          onClick={runAnalysis}
          disabled={loading || !selectedId}
          className="px-6 py-3.5 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-0.5 shadow-elevated disabled:opacity-40 disabled:hover:translate-y-0 flex items-center justify-center gap-2 shrink-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <FileSearch size={16} />}
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {error && <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-surface border border-border p-5 md:p-6">
            <h3 className="text-sm font-space font-bold text-text-primary mb-4">Key Concepts</h3>
            <div className="flex flex-wrap gap-2">
              {result.keyConcepts.map((c) => (
                <span key={c.term} className="text-xs px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-text-secondary">
                  {c.term} <span className="text-text-muted">({c.weight.toFixed(3)})</span>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-5 md:p-6">
            <h3 className="text-sm font-space font-bold text-text-primary mb-4">Summary</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{result.summary || "No summary could be generated."}</p>
          </div>

          <div className="rounded-2xl bg-surface border border-border p-5 md:p-6">
            <h3 className="text-sm font-space font-bold text-text-primary mb-4">Detected Entities (heuristic)</h3>
            {result.detectedEntities.length === 0 ? (
              <div className="text-sm text-text-muted">No capitalized multi-word entities detected.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.detectedEntities.map((entity) => (
                  <span key={entity} className="text-xs px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-text-secondary">
                    {entity}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-surface border border-border p-5 md:p-6">
            <h3 className="text-sm font-space font-bold text-text-primary mb-4">Classification</h3>
            <div className="text-sm font-semibold text-primary-accent mb-2">{result.classification.category}</div>
            <div className="text-xs text-text-muted">
              Matched because: {result.classification.matchedTerms.length > 0 ? result.classification.matchedTerms.join(", ") : "no category keywords matched"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors referencing `DocumentIntelligencePanel.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/platform/live-runtime/cerebro-archive/DocumentIntelligencePanel.tsx
git commit -m "feat(cerebro-archive): implement DocumentIntelligencePanel"
```

---

### Task 13: Wire CerebroArchive into /platform/live-runtime as a third mode

**Files:**
- Modify: `app/platform/live-runtime/page.tsx`

**Interfaces:**
- Consumes: `ArchiveLiveRuntime` from `@/components/platform/live-runtime/cerebro-archive/ArchiveLiveRuntime` (Task 10)

Adds one more `Mode` union member and one more ternary branch to the existing page — no registry/plugin abstraction (Global Constraints). Also adds `?mode=` deep-linking so a CTA elsewhere on the site can navigate straight into the CerebroArchive mode. `useSearchParams()` requires the page content to be wrapped in a `Suspense` boundary in the Next.js App Router — this task's rewrite includes that.

- [ ] **Step 1: Read the current file to confirm nothing has changed since it was last inspected**

Run: `cat app/platform/live-runtime/page.tsx` (or open it in an editor) and confirm it still matches the two-mode (`"kernel" | "backend"`) version described in this plan's context. If it has diverged, re-apply the same `Mode` extension and `Suspense`/`useSearchParams` wrapping shown below onto whatever the current version is instead of overwriting unrelated changes.

- [ ] **Step 2: Rewrite `app/platform/live-runtime/page.tsx`**

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Cpu, Server, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentOSLiveRuntime } from "@/components/platform/live-runtime/AgentOSLiveRuntime";
import { AgentOSBackendGate } from "@/components/platform/live-runtime/AgentOSBackendGate";
import { ArchiveLiveRuntime } from "@/components/platform/live-runtime/cerebro-archive/ArchiveLiveRuntime";

type Mode = "kernel" | "backend" | "cerebro-archive";

function isMode(value: string | null): value is Mode {
  return value === "kernel" || value === "backend" || value === "cerebro-archive";
}

function LiveRuntimeContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("kernel");

  useEffect(() => {
    const requested = searchParams.get("mode");
    if (isMode(requested)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(requested);
    }
  }, [searchParams]);

  return (
    <main className="bg-background min-h-screen">
      <section className="border-b border-border pt-12 pb-10">
        <div className="container-wide">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-accent/10 border border-primary-accent/30 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent">CerebroHive — Live Runtime</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-4">Real, independent runtimes</h1>
          <p className="text-text-secondary max-w-2xl font-inter mb-8">
            Choose which part of the platform to run for real: the deterministic in-browser AgentOS kernel, AgentOS's full
            Python backend service, or the CerebroArchive knowledge runtime. None of these are mockups — each executes your
            input for real.
          </p>

          <div className="inline-flex p-1 rounded-lg bg-surface border border-border gap-1 flex-wrap">
            <button
              onClick={() => setMode("kernel")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors",
                mode === "kernel" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Cpu size={14} /> AgentOS Kernel
            </button>
            <button
              onClick={() => setMode("backend")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors",
                mode === "backend" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Server size={14} /> AgentOS Backend
            </button>
            <button
              onClick={() => setMode("cerebro-archive")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors",
                mode === "cerebro-archive" ? "bg-primary-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Archive size={14} /> CerebroArchive
            </button>
          </div>
        </div>
      </section>

      <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {mode === "kernel" && <AgentOSLiveRuntime />}
        {mode === "backend" && (
          <section className="section-pad container-wide">
            <AgentOSBackendGate />
          </section>
        )}
        {mode === "cerebro-archive" && <ArchiveLiveRuntime />}
      </motion.div>
    </main>
  );
}

export default function LiveRuntimePage() {
  return (
    <React.Suspense fallback={null}>
      <LiveRuntimeContent />
    </React.Suspense>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors referencing `app/platform/live-runtime/page.tsx`.

- [ ] **Step 4: Start the dev server and verify the new mode renders real content**

Run: `npm run dev` (in the background if already running elsewhere, skip starting a second instance)
Then: `curl -sL http://localhost:3000/platform/live-runtime?mode=cerebro-archive | grep -o "Search, Graph, and Understand"`
Expected: The command prints `Search, Graph, and Understand` — confirming the CerebroArchive mode actually renders (not just type-checks).

- [ ] **Step 5: Commit**

```bash
git add app/platform/live-runtime/page.tsx
git commit -m "feat(cerebro-archive): wire CerebroArchive into the shared live-runtime hub"
```

---

### Task 14: Product page CTA — generic `liveDemoUrl` on `PackagedProduct`

**Files:**
- Modify: `lib/data/types.ts`
- Modify: `lib/data/products/cerebro-archive.ts`
- Modify: `components/products/sections/ProductHero.tsx`
- Modify: `components/products/sections/ProductCTA.tsx`

**Interfaces:**
- Produces: `PackagedProduct.liveDemoUrl?: string`, `PackagedProduct.liveDemoLabel?: string` (new optional fields, mirroring the existing `PlatformCapability.liveDemoUrl`/`liveDemoLabel` naming already in `lib/data/types.ts`)

`ProductHero.tsx` and `ProductCTA.tsx` are generic components shared by every product page — this adds a conditional render (mirroring the existing `product.apiReference &&` pattern already in both files) that only activates for products that set `liveDemoUrl`, exactly like `app/platform/[slug]/page.tsx` already does for `PlatformCapability.liveDemoUrl`. No other product is affected.

- [ ] **Step 1: Add the fields to `PackagedProduct` in `lib/data/types.ts`**

Find this block (currently around line 110-113):
```typescript
  // Developer Experience
  apiReference?: string; // link to docs
  sdkLanguages?: string[];
```

Replace it with:
```typescript
  // Developer Experience
  apiReference?: string; // link to docs
  sdkLanguages?: string[];

  // If set, this product has a real, working interactive demo reachable on
  // the site (not just marketing copy) — e.g. the CerebroArchive live runtime.
  // Mirrors PlatformCapability.liveDemoUrl/liveDemoLabel above.
  liveDemoUrl?: string;
  liveDemoLabel?: string;
```

- [ ] **Step 2: Set the fields on the CerebroArchive product data**

In `lib/data/products/cerebro-archive.ts`, find:
```typescript
  apiReference: "/developers/api/cerebro-archive",
  sdkLanguages: ["Python", "TypeScript", "Go"],
```

Replace it with:
```typescript
  apiReference: "/developers/api/cerebro-archive",
  sdkLanguages: ["Python", "TypeScript", "Go"],
  liveDemoUrl: "/platform/live-runtime?mode=cerebro-archive",
  liveDemoLabel: "Run Live Demo",
```

- [ ] **Step 3: Add the conditional CTA to `ProductHero.tsx`**

Find this block:
```tsx
          <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="product_hero" analyticsLabel={`Request Demo ${product.title}`}>
            <AnimatedButton variant="primary" size="lg">
              Request Demo
            </AnimatedButton>
          </TrackedLink>
          {product.apiReference && (
```

Replace it with:
```tsx
          {product.liveDemoUrl && (
            <TrackedLink href={product.liveDemoUrl} analyticsEvent="live_demo_click" analyticsCategory="product_hero" analyticsLabel={`Live Demo ${product.title}`}>
              <AnimatedButton variant="secondary" size="lg">
                {product.liveDemoLabel || "Run Live Demo"}
              </AnimatedButton>
            </TrackedLink>
          )}
          <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="product_hero" analyticsLabel={`Request Demo ${product.title}`}>
            <AnimatedButton variant="primary" size="lg">
              Request Demo
            </AnimatedButton>
          </TrackedLink>
          {product.apiReference && (
```

- [ ] **Step 4: Add the conditional CTA to `ProductCTA.tsx`**

Find this block:
```tsx
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <TrackedLink
              href="/contact"
              analyticsEvent="cta_click"
              analyticsCategory="product_cta"
              analyticsLabel={`Book Demo ${product.title}`}
            >
```

Replace it with:
```tsx
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {product.liveDemoUrl && (
              <TrackedLink
                href={product.liveDemoUrl}
                analyticsEvent="live_demo_click"
                analyticsCategory="product_cta"
                analyticsLabel={`Live Demo ${product.title}`}
              >
                <AnimatedButton variant="secondary" size="lg">
                  {product.liveDemoLabel || "Run Live Demo"}
                </AnimatedButton>
              </TrackedLink>
            )}
            <TrackedLink
              href="/contact"
              analyticsEvent="cta_click"
              analyticsCategory="product_cta"
              analyticsLabel={`Book Demo ${product.title}`}
            >
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors referencing any of the four modified files.

- [ ] **Step 6: Verify the CTA actually renders on the CerebroArchive product page**

Run: `curl -sL http://localhost:3000/products/cerebro-archive/ | grep -o "Run Live Demo"`
Expected: The command prints `Run Live Demo` at least once.

- [ ] **Step 7: Verify no other product page was affected**

Run: `curl -sL http://localhost:3000/products/cerebro-x/ | grep -c "Run Live Demo"`
Expected: `0` — Cerebro X has no `liveDemoUrl` set, so the button must not appear there.

- [ ] **Step 8: Commit**

```bash
git add lib/data/types.ts lib/data/products/cerebro-archive.ts components/products/sections/ProductHero.tsx components/products/sections/ProductCTA.tsx
git commit -m "feat(cerebro-archive): add Run Live Demo CTA to the product page"
```

---

### Task 15: Playwright E2E test

**Files:**
- Create: `tests/visual/cerebro-archive-runtime.spec.ts`

**Interfaces:**
- Consumes: nothing from `lib/` or `components/` directly — this drives the real browser/UI end-to-end.

Placed under `tests/visual/` because that's the only directory `playwright.config.ts`'s `testDir` actually scans today (despite the directory's name suggesting screenshot tests only) — `tests/e2e/` is not scanned and contains a pre-existing broken file (Global Constraints). This is a functional test, not a screenshot test, so it doesn't use `toHaveScreenshot`.

- [ ] **Step 1: Write `tests/visual/cerebro-archive-runtime.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('CerebroArchive Live Runtime', () => {
  test('running an example search produces ranked results and a visible graph', async ({ page }) => {
    await page.goto('/platform/live-runtime?mode=cerebro-archive');

    await expect(page.getByRole('button', { name: /CerebroArchive/i })).toBeVisible();
    await page.getByRole('button', { name: 'knowledge graph retrieval' }).click();

    await expect(page.getByText('Ranked Results')).toBeVisible();
    await expect(page.locator('li', { hasText: 'Knowledge Graphs' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Knowledge Graph').first()).toBeVisible(); // graph node label
  });

  test('selecting a document produces document intelligence output', async ({ page }) => {
    await page.goto('/platform/live-runtime?mode=cerebro-archive');

    await page.getByRole('button', { name: 'Document Intelligence' }).click();
    await page.locator('select').selectOption({ label: /Knowledge Graphs/ });
    await page.getByRole('button', { name: 'Analyze' }).click();

    await expect(page.getByText('Key Concepts')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Detected Entities (heuristic)')).toBeVisible();
    await expect(page.getByText('Classification')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm run test:e2e -- cerebro-archive-runtime`
Expected: Both tests pass (Playwright starts the dev server itself per `playwright.config.ts`'s `webServer` block if one isn't already running on port 3000).

- [ ] **Step 3: Commit**

```bash
git add tests/visual/cerebro-archive-runtime.spec.ts
git commit -m "test(cerebro-archive): add Playwright E2E coverage for the live runtime"
```

---

## Final Verification

- [ ] Run every pure-function test file together: `npx tsx --test lib/cerebro-archive/*.test.ts` — expect all pass, `# fail 0`.
- [ ] Run the full type-check: `npx tsc --noEmit` — expect no errors.
- [ ] Run the new E2E spec: `npm run test:e2e -- cerebro-archive-runtime` — expect both tests pass.
- [ ] Manually visit `/platform/live-runtime`, confirm all three modes (AgentOS Kernel, AgentOS Backend, CerebroArchive) switch correctly and neither AgentOS mode regressed.
- [ ] Manually visit `/products/cerebro-archive/`, confirm the "Run Live Demo" button appears and navigates to `/platform/live-runtime?mode=cerebro-archive` with that mode pre-selected.
