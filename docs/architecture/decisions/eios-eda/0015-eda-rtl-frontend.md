# 0015: CerebroEDA RTL Frontend

**Decision ID:** D5
**Gates:** Phase 1 (Thin Vertical Slice)
**Date:** 2026-08-01

## Status

Accepted

## Context

The RTL structural index is the anchor of the entire knowledge graph (Blueprint §8.2). Module names, ports, parameters, and instantiation relationships become the nodes and edges everything else attaches to. If the index is approximate, every downstream feature — impact analysis, provenance, semantic search, agent context — inherits the error, and the errors compound silently.

SystemVerilog is a genuinely hard language to parse. The IEEE 1800 grammar is large and ambiguous in places, requires elaboration to resolve parameterised types, and real designs use generate blocks, interfaces, packages, macros, and vendor extensions freely. Approximate parsing (regex or a partial grammar) works on tutorial code and fails on production RTL — which is to say, it fails exactly where the product needs to work.

Requirements:

1. **Structural accuracy** for modules, ports, parameters, instances, and their source locations.
2. **Preprocessor fidelity** — `` `define ``, `` `include ``, and conditional compilation are pervasive and change what code exists.
3. **Incremental reparse.** Per-unit `content_hash` (Blueprint §13.2) means a typical commit reparses 3 files out of 4,000. A frontend requiring full-project elaboration on every change is unusable.
4. **Multi-language.** SystemVerilog dominates, but VHDL exists in the target market and Chisel/SpinalHDL emit Verilog.
5. **Error tolerance.** Indexing must produce partial results on incomplete or non-compiling code — engineers query designs mid-refactor.
6. **Embeddable and licence-compatible** for on-prem and air-gapped distribution.

## Decision

**We use Slang as the primary SystemVerilog frontend for structural extraction and elaboration, and Verible for style, lint, and formatting-adjacent analysis. Both, with distinct responsibilities — not one as a fallback for the other.**

| Concern | Tool | Rationale |
|---|---|---|
| Parse, elaborate, type-check | Slang | Most complete open-source SystemVerilog implementation; real elaboration |
| Module/port/parameter/instance extraction | Slang | Requires elaboration to resolve parameterised widths and generate blocks |
| Preprocessing | Slang | Full preprocessor with macro expansion tracking |
| Lint and style | Verible | Purpose-built, configurable rule sets, industry-recognised |
| Formatting, CST-level operations | Verible | Preserves concrete syntax tree including comments |
| Code navigation ranges for the IDE | Verible | Lightweight, error-tolerant, fast on incomplete code |

**Why both.** These are different problems with genuinely different requirements. Slang builds a semantic model and needs code that elaborates; Verible preserves a concrete syntax tree including comments and whitespace and tolerates broken code. Using Slang for linting means poor rule ergonomics and no partial results; using Verible for structural extraction means no elaboration, so a parameterised port width is a token sequence rather than a resolved value. Each is the right tool for its half, and the operational cost of two dependencies is small next to the accuracy cost of forcing one to do both.

### Integration

Both are C++ and are wrapped as services rather than linked into TypeScript:

```
design-service ──gRPC──▶ rtl-index-worker (C++)
                            ├─ Slang: elaborate → structural facts
                            └─ Verible: CST → lint findings, comment extraction
```

The worker runs under the same isolation as other runners (ADR 0013) because it parses untrusted input in a memory-unsafe language — the same reasoning that applies to EDA tools applies here.

### Incremental strategy

Full elaboration is expensive on a large SoC. Two tiers:

1. **Syntactic index (per file, incremental).** Parse each file independently, extract declared modules, ports, parameters, and instantiations as written. Fast, tolerant of incomplete code, keyed by `content_hash`. Runs on every commit; reparses only changed files.
2. **Elaborated index (per revision, batched).** Full elaboration resolving parameters, generate blocks, and interface modports. Slower, requires a complete and compiling design. Runs on tagged revisions and nightly, not on every commit.

The graph carries both, with elaborated facts marked as such. Impact analysis prefers elaborated data when available and degrades to syntactic with a visible confidence marker. This matters because engineers query mid-refactor designs constantly — a system that only works on clean, elaborating code would be unavailable exactly when it is most needed.

### Comment and documentation extraction

Verible's CST retains comments, which the syntactic pass extracts and attaches to their declarations. These become the primary text corpus for embeddings (Blueprint §14.2) — the human-written explanation of intent that makes semantic search useful. A structural-only frontend would have discarded them, and the AI layer would be markedly worse for it.

### VHDL and other languages

Deferred to Phase 3, behind a `LanguageFrontend` interface established now:

```typescript
interface LanguageFrontend {
  languages(): Language[];
  indexFile(file: SourceFile, ctx: IndexContext): Promise<SyntacticFacts>;
  elaborate(unit: CompilationUnit): Promise<ElaboratedFacts>;
  capabilities(): FrontendCapabilities;
}
```

Likely VHDL implementation: GHDL's analyser or `rust_hdl`. Chisel/SpinalHDL are handled by indexing emitted Verilog and linking back to source via emitted metadata where available.

## Alternatives Considered

**Verible only.**
Rejected as primary. Excellent CST, strong lint, Google-maintained, error-tolerant. But it does not elaborate — parameterised widths, generate-block expansion, and interface resolution are unavailable. Since a large share of production RTL is parameterised, structural facts would be systematically incomplete in exactly the designs that matter most.

**Slang only.**
Rejected as sole tool. Best-in-class parsing and elaboration, but lint rule authoring is not its purpose, it discards comments in the semantic model, and it is less tolerant of non-compiling input. Using it for IDE-adjacent features would give a poor experience on work-in-progress code.

**Yosys frontend.**
Rejected. We already run Yosys as a synthesis tool and its Verilog frontend is competent. But it targets synthesis: it discards non-synthesisable constructs, most of the testbench and assertion code that verification engineers care about, and all comments. It also has weaker SystemVerilog coverage than Slang.

**Surelog / UHDM.**
Seriously considered. Surelog targets full IEEE 1800 with UHDM as a standardised elaborated data model, and UHDM's tool-neutrality is genuinely appealing for future interoperability. Rejected for now on maturity and performance relative to Slang, and a smaller community. Worth re-evaluating at Phase 3 — if UHDM becomes the de facto interchange format, adopting it would improve interoperability with other open-source tooling.

**Commercial frontend (via vendor API).**
Rejected. Licensing cost, no air-gap story without customer licences, and a dependency on a vendor whose interests are not aligned with an orchestration platform sitting above their tools (Blueprint §27 R4).

**Tree-sitter grammar.**
Rejected for structural indexing, viable for editor highlighting. Fast and error-tolerant, but no preprocessing or elaboration and grammar coverage of SystemVerilog is incomplete. Fine for syntax colouring, insufficient for facts the knowledge graph depends on.

**Write our own.**
Rejected without much deliberation. SystemVerilog parsing is a multi-year effort that has consumed entire teams. It is not our differentiator, and choosing to do it would be an instance of exactly the scope creep flagged as risk R9.

## Consequences

**Positive**

- Structural facts are semantically accurate, including parameterised and generated structure — the knowledge graph rests on real elaboration.
- Comment extraction gives the AI layer human-authored intent, not just structure.
- Two-tier indexing keeps per-commit cost low while retaining full accuracy where it matters.
- Both tools are permissively licensed (Slang: MIT; Verible: Apache 2.0) and embeddable in on-prem and air-gapped distributions.
- Verible lint gives Phase 1 a genuinely useful feature almost for free.

**Negative**

- Two C++ dependencies to build, package, version, and patch across supported platforms. Mitigated by containerising the index worker and pinning digests.
- The C++/TypeScript boundary requires a gRPC hop and schema maintenance. Accepted — the alternative (native bindings) is worse for isolation and deployment.
- Slang tracks the SystemVerilog standard closely but not exhaustively; some vendor extensions will fail. Failures must degrade to syntactic indexing rather than failing the ingest.
- Elaboration requires a complete, compiling design with correct file ordering and include paths, which we must infer or accept as configuration. In practice this is filelist-driven and messy in real projects.

**Neutral**

- Two indexes (syntactic and elaborated) mean the graph can hold two versions of a fact. Handled by explicit provenance marking, but it is a source of subtle bugs if consumers ignore the marker — the API should make ignoring it awkward.

## Migration Strategy

**Phase 1**: syntactic indexing with Slang's parser plus Verible lint. Elaboration deferred to Phase 2, when multi-stage flows make filelists and include paths available as first-class flow inputs.

**Filelist discovery**: initially explicit configuration (`.f` files, which every real project already has). Inference from directory structure is a convenience feature, never the primary mechanism — guessing wrong produces a silently wrong index.

**Version pinning**: Slang and Verible versions are pinned by digest and recorded on every indexed revision, so an index built by an older version is identifiable and re-indexable. Same discipline as parser versioning (ADR 0011).

**Frontend interface**: the `LanguageFrontend` interface is defined in Phase 1 even though only one implementation exists, so VHDL support in Phase 3 does not require restructuring `design-service`.

## Open Questions

1. **Elaboration cost on a large SoC.** Unmeasured. If full elaboration takes hours on a real design, the nightly cadence may be insufficient and partial or hierarchical elaboration becomes necessary.
2. **Filelist and include-path inference.** Real projects have baroque build systems. How much can be inferred versus configured is unknown and is a significant onboarding-friction risk.
3. **UHDM adoption.** Should elaborated facts be persisted as UHDM for tool interoperability rather than our own schema? Would ease future frontend swaps at the cost of coupling to an evolving standard.
4. **Assertion and coverage constructs.** SVA and covergroups are structurally important for the verification persona. Slang parses them; whether our fact model represents them richly enough is unresolved and should be settled before Phase 3.
5. **Macro-heavy codebases.** Some designs generate most RTL through macros. Whether post-expansion facts, pre-expansion facts, or both should be indexed affects how engineers navigate the design, and getting this wrong will be immediately obvious to users.

## Related ADRs

- 0011: Canonical Artifact and Result Identity — `lint_finding` semantic keys use AST paths, not line numbers
- 0012: CerebroEDA Knowledge Graph Store — consumer of structural facts
- 0013: CerebroEDA Runner Isolation — index worker isolation
