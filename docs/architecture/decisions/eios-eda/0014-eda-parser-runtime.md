# 0014: CerebroEDA Parser Runtime

**Decision ID:** D3
**Gates:** Phase 1 (Thin Vertical Slice), Phase 7 (Ecosystem)
**Date:** 2026-08-01

## Status

Accepted

## Context

Parsers convert tool output into canonical domain facts (Blueprint §16.3). They are the platform's highest-volume, most-exposed extension point:

- **Volume.** Every job produces reports. A nightly regression generates tens of thousands of files, some multi-gigabyte.
- **Exposure.** Parsers process untrusted text and are the natural place for a malicious plugin to exfiltrate design data — they see everything by definition.
- **Churn.** Tool output formats change between minor versions. Parsers are the most frequently modified component in the system (Blueprint §27 R1).
- **Third-party authorship.** The plugin SDK exists so CAD engineers can support tools we have never seen. Most parsers will not be written by us.
- **Determinism requirement.** Parsers produce the semantic keys that feed signature computation (ADR 0011). Non-deterministic parsing means non-deterministic identity, which corrupts the platform's cornerstone.

The runtime choice must therefore optimise for: safe execution of untrusted code, deterministic output, streaming over large inputs, bounded resource use, and low per-invocation overhead at high volume.

## Decision

**Parsers execute as WebAssembly components under Wasmtime, with the WASI interface restricted to a host-provided streaming API. A container escape hatch exists for parsers that genuinely cannot be expressed in WASM, but is quarantined: container parsers cannot be published to the public marketplace and require explicit installation approval.**

### Why WASM is the right shape here

The properties align unusually well with the requirements:

| Requirement | WASM property |
|---|---|
| Untrusted code | Sandboxed by construction; no ambient authority |
| Exfiltration risk | No syscalls, no network, no filesystem unless the host grants it |
| Determinism | Deterministic execution by specification |
| High volume | Sub-millisecond instantiation; no process or container startup |
| Resource bounds | Fuel metering and memory limits enforced by the runtime |
| Multi-language | Rust, C++, Go, AssemblyScript all compile to WASM |

The last point matters commercially: a CAD engineer can write a parser in Rust or C++ — languages this audience already uses — rather than being forced into our stack.

### Host interface

Parsers receive **no** WASI filesystem or network access. All I/O is host-mediated:

```wit
interface parser {
  record parse-input {
    content-type: string,
    size-bytes: u64,
    tool-hint: option<string>,
  }

  record fact {
    fact-type: string,
    payload: string,              // JSON
    semantic-key: list<tuple<string, string>>,   // feeds ADR 0011
    source-ref: source-ref,
    confidence: float32,
  }

  can-parse: func(input: parse-input, head: list<u8>) -> float32;
  parse: func(input: parse-input) -> result<_, parse-error>;
}

interface host {
  read-chunk: func(max-bytes: u32) -> option<list<u8>>;   // pull-based streaming
  emit-fact: func(f: fact);
  log: func(level: log-level, msg: string);
}
```

Three deliberate properties:

1. **Pull-based streaming.** The parser requests chunks; the host controls the buffer. A 4GB STA report never materialises in memory, and a parser cannot force the host to allocate.
2. **Facts are pushed as they are found**, not returned as a batch. Ingest is incremental and a parser failing at 90% still yields 90% of its facts.
3. **Semantic keys are declared, not hashed.** Parsers supply canonicalised key fields; signature computation happens host-side in `packages/eda-domain` (ADR 0011). Third-party code cannot invent identity.

### Resource limits

```yaml
limits:
  memoryPages:   8192        # 512 MiB
  fuel:          10_000_000_000
  wallclockSec:  300
  maxFacts:      5_000_000
  maxFactBytes:  512
```

Fuel metering makes infinite loops impossible rather than merely detectable. Limits are declared per-parser in the manifest and capped by platform maximums; exceeding a limit fails the parse cleanly with a `parser.limit.exceeded` event, and ingest continues with the facts already emitted.

### Determinism enforcement

- No clock, no randomness, no environment access in the host interface at all.
- The CI signature-stability corpus (ADR 0011) re-parses fixed reports on every build and asserts byte-identical facts. Non-determinism fails the build.
- Parser modules are content-addressed by digest; `parser_version` and module digest are recorded on every fact.

### Container escape hatch

Some parsers genuinely cannot be WASM — those wrapping a vendor's proprietary database reader (FSDB, UCIS, some coverage formats) where only a native shared library exists. For these:

```yaml
runtime: container
justification: "Requires libfsdbreader.so; no source available."
```

Constraints, which together make this a deliberately unattractive path:

- Runs under the same isolation as tool runners (ADR 0013): gVisor, deny-all egress, read-only root, no credentials.
- Cannot be published to the public marketplace — private installation only.
- Requires explicit admin approval at installation, with the justification surfaced in the UI.
- Same host interface, over a pipe rather than in-process.
- Substantially higher per-invocation cost, which naturally discourages use for high-volume formats.

Being honest about this exception is better than pretending WASM covers 100% of cases and then watching people work around the platform.

## Alternatives Considered

**Containers for all parsers.**
Rejected. Uniform with tool execution and no language constraints, but per-invocation cost (100ms–1s) is prohibitive at tens of thousands of reports per night, isolation is weaker, and determinism is not enforced by anything.

**In-process parsers in the host language (TypeScript/Rust plugins).**
Rejected outright. No isolation whatsoever — a third-party parser would run with full service privileges and direct database access. Fastest and least safe; the wrong trade for the most-exposed extension point in the system.

**Sandboxed subprocess (seccomp + namespaces, no container).**
Rejected. Middle ground with the disadvantages of both: process startup cost, weaker isolation than WASM, and per-platform implementation burden.

**Lua / embedded scripting.**
Rejected. Good sandboxing and cheap embedding, but poor performance on multi-gigabyte text, no realistic path for CAD engineers already writing Rust/C++, and a weak ecosystem for parsing infrastructure.

**Declarative parser DSL (grammar/regex configuration only).**
Rejected as the sole mechanism, retained as a convenience layer. Safest possible option and genuinely sufficient for simple line-oriented reports — a large fraction of first-party parsers may end up expressed this way, compiled to a shared WASM interpreter. But EDA report formats include context-sensitive, multi-pass, and stateful structures that no practical DSL covers. Offering only a DSL would push complex cases outside the platform entirely.

## Consequences

**Positive**

- The most-exposed extension point has the strongest practical sandbox available at this performance point.
- Sub-millisecond instantiation makes per-report parsing cheap at regression scale.
- Determinism is enforced by the runtime rather than by convention, protecting signature stability.
- Fuel metering makes runaway parsers structurally impossible.
- Multi-language authorship suits the actual plugin-developer population.
- No filesystem or network in the interface means exfiltration requires a host bug, not merely a malicious parser.

**Negative**

- WASM toolchain maturity varies. Rust is excellent; C++ via Emscripten is workable but awkward; Go produces large modules. Parser authors will encounter friction, and our documentation and templates must carry that weight.
- Existing parsers cannot be ported directly if they depend on native libraries — hence the escape hatch.
- Debugging WASM is harder than debugging a normal process. Mitigated by host-side logging, a local `cbeda parser test` harness, and source maps in development builds.
- The Component Model and WASI Preview 2 are still stabilising; interface churn is likely in the first year.
- Two runtimes to support (WASM plus the container hatch) is more surface than one.

**Neutral**

- 512 MiB default memory is generous for streaming parsers and insufficient for any parser that tries to buffer a whole report — which is the intended incentive.

## Migration Strategy

**Phase 1** ships first-party WASM parsers for OpenSTA timing and Verilog lint, written in Rust, establishing the reference implementation and the SDK template.

**SDK.** `packages/eda-sdk` provides a Rust crate and an AssemblyScript package with the host bindings, a local test harness, and a corpus-runner that reproduces the CI signature-stability check on a developer's machine.

**Parser corpus.** Every parser ships with sample reports in the corpus. This is a merge requirement, not a guideline — it is the only defence against the R1 fragility risk.

**Version handling.** Parsers declare supported tool version ranges. On encountering an unrecognised version, the highest-confidence parser still runs, but facts are flagged `confidence < 1.0` and a `parser.version.unknown` event fires. Failing soft here is correct: a tool upgrade should degrade fact quality visibly, not halt ingest.

**If WASM proves inadequate**, the host interface is runtime-agnostic by design — the container hatch already implements it over a pipe. A wholesale move would change the execution substrate without changing parser contracts or the fact model.

## Open Questions

1. **Component Model stability.** WASI Preview 2 and the Component Model are evolving. Should we pin to Preview 1 with a custom ABI for stability, or track Preview 2 and accept churn? Current position: track Preview 2, isolate the binding layer in `eda-sdk` so churn is absorbed in one place.
2. **Parser composition.** Should parsers chain — one splitting a multi-section report and delegating sections to others? Powerful, and complicates the security and resource model. Deferred past Phase 3.
3. **Confidence calibration.** `can-parse` returns 0..1, but no calibration standard exists across parser authors. Two parsers both returning 0.9 is meaningless. Needs either a rubric or a learned reranker.
4. **Binary format parsers.** FSDB and some GDS variants are binary and large. Whether WASM streaming is efficient enough, or these belong permanently in the container hatch, is unmeasured.
5. **Fuel-to-wallclock calibration.** Fuel limits are architecture-independent but do not map cleanly to time. Setting defaults that permit legitimate large parses while stopping runaways needs empirical tuning.

## Related ADRs

- 0011: Canonical Artifact and Result Identity — semantic keys parsers must supply
- 0013: CerebroEDA Runner Isolation — isolation model the container hatch inherits
