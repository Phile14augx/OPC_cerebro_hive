# 0017: CerebroEDA Waveform Strategy

**Decision ID:** D8
**Gates:** Phase 3 (Analysis Depth)
**Date:** 2026-08-01

## Status

Accepted

## Context

Waveform viewing is how verification engineers debug. Any platform positioning itself as a design workspace will be asked for it, and the request will feel obligatory. It is also the single worst fit for a web architecture in the entire product:

1. **File sizes are extreme.** A VCD from a long simulation reaches tens to hundreds of gigabytes. FSDB is compressed but still multi-gigabyte.
2. **Interaction is latency-critical.** Engineers scrub, zoom, and pan continuously. Anything above ~50ms feels broken, and a broken waveform viewer is worse than no waveform viewer.
3. **Formats are proprietary.** FSDB (Verdi) and WLF (Questa) are closed. Reading them requires vendor libraries under vendor licences.
4. **Incumbent tools are excellent.** Verdi is deeply entrenched, extremely capable, and engineers are fast in it. A mediocre web replacement will be rejected immediately and will damage credibility for the rest of the platform.
5. **Data gravity applies.** Blueprint §3.1 forbids pulling large artifacts through application services.

There is also a strategic question. Building a waveform viewer is building an EDA tool — precisely the scope creep of risk R9. But signal-level context is genuinely valuable for AI-assisted debug, and pure orchestration without any waveform capability leaves an obvious gap in the workspace narrative.

## Decision

**We do not build a general-purpose waveform viewer. We provide (a) deep links into the engineer's existing viewer, (b) a lightweight server-rendered signal timeline for narrow, AI-supporting use cases, and (c) an extracted signal-event model for agent reasoning. A full interactive web viewer is explicitly out of scope, including for v2.**

### Three capabilities, sharply bounded

**1. Handoff to native viewers (primary)**

The dominant path. From any failing test, a one-click action opens the waveform in the engineer's local Verdi/GTKWave/Surfer with the right time window and signal set preloaded:

```
cbeda wave open <jobId> --at <failureTime> --signals <group>
```

The CLI fetches the waveform (or mounts it, on a shared filesystem), generates a viewer-specific session file with the signal set and cursor position, and launches the local tool. The platform contributes what it uniquely knows — *which* waveform, *which* time, *which* signals matter given the failure — and leaves rendering to the tool that is already excellent at it.

This is the right division of labour and, notably, is also what engineers actually want. They do not want a worse Verdi in a browser tab; they want to stop hunting for the right dump file and timestamp.

**2. Server-rendered signal timeline (narrow)**

A read-only, non-interactive PNG/SVG strip for a bounded window and a small signal set, rendered server-side near the data:

```
GET /api/waveform/{artifactId}/strip
    ?signals=clk,rst_n,state,valid&from=1042000&to=1048000&width=1200
```

Used for: embedding in failure triage views, agent responses citing signal behaviour, review comments, and regression reports. Constraints that keep it honest — max 32 signals, max 10,000 time units, no zoom, no scrub. It is an *illustration*, not a viewer, and the UI presents it as such with a prominent "open in your viewer" action.

Rendering happens in a job near the storage, not in a web service. The image is a cacheable artifact.

**3. Signal event extraction (for AI)**

The strategically interesting capability. A parser plugin extracts a *bounded* event stream around points of interest:

```
signal_event {
  signal_canonical, time, value, previous_value, driver_scope
}
```

Extracted for the signals and time window relevant to a failure — typically a few hundred events, not billions. This lets an agent reason about actual signal behaviour: "the `valid` handshake asserted at 1042ns but `ready` remained low for 400 cycles, and the FSM entered `WAIT` at 1043ns and never left." That is the observation an engineer would make, grounded in real data with a citation to the waveform and time.

Bounding by relevance is what makes this tractable: the platform never processes a whole waveform for AI purposes, only the neighbourhood of a failure.

### Format support

| Format | Support | Mechanism |
|---|---|---|
| VCD | Full | Open format, WASM parser |
| FST | Full | Open format, WASM parser |
| GHW | Full | Open format |
| FSDB | Extraction only | Container-hatch parser (ADR 0014) using vendor library, customer-licensed |
| WLF | Handoff only | No extraction; deep link to Questa |

Where a vendor library is required, the customer supplies their licence; we do not redistribute. Where we cannot read the format, we still do handoff — which is the primary path anyway, so the degradation is mild.

## Alternatives Considered

**Full interactive web waveform viewer (streaming to a WASM renderer).**
Rejected, and this is the load-bearing rejection. Technically feasible: WASM plus WebGL can render waveforms well, and Surfer demonstrates the approach. But it requires a tiled, indexed, streamable representation of the waveform (a substantial data-engineering effort), then continuous investment to approach a tool engineers already have and like. It is a multi-year effort to reach parity with free GTKWave, let alone Verdi. Every month spent on it is a month not spent on the orchestration and knowledge capabilities that are actually differentiated. This is the clearest instance of R9 in the roadmap and the discipline to decline it is the decision.

**Embed an existing open-source viewer (Surfer, WaveDrom, d3-based).**
Partially adopted, not as a primary strategy. Surfer is genuinely good and WASM-capable. But embedding it means owning the data pipeline that feeds it — the indexed, tiled representation — which is most of the work regardless of who wrote the renderer. Revisit if Surfer's remote-data protocol matures: the calculus changes materially if the tiling problem is solved upstream. Recorded as an open question rather than a closed door.

**VNC/remote-desktop streaming of a native viewer.**
Rejected. Works, and several EDA cloud vendors do exactly this. But it requires a full desktop session per user, vendor licences server-side, and delivers a poor experience over anything but excellent networks. It also inverts the platform's positioning — we would be a remote-desktop provider that happens to have a knowledge graph.

**Convert everything to a canonical format on ingest.**
Rejected as a blanket strategy. Converting a 100GB FSDB to FST costs hours and doubles storage for a file that will likely never be opened. Conversion on demand, cached, is the sensible variant and is available as an explicit user action.

**No waveform capability at all.**
Rejected. Handoff and signal extraction are cheap and high-value. Extraction in particular is a genuine differentiator for AI-assisted debug and would be lost entirely under a purist position.

## Consequences

**Positive**

- Avoids the largest scope-creep trap in the roadmap.
- Handoff solves the real pain (finding the right dump and timestamp) without competing with incumbents.
- Signal extraction gives agents grounded signal-level evidence — differentiated capability at a fraction of the cost of a viewer.
- Server-rendered strips make failure reports and agent responses concrete and visual.
- No large artifacts pulled through application services; data gravity respected.

**Negative**

- Engineers must leave the browser to debug seriously. This will be raised in every demo and must be answered as a deliberate position rather than a gap — "we make your viewer faster to reach; we don't replace it."
- Handoff requires local tooling and filesystem access to the waveform. Awkward in pure SaaS with no shared filesystem; mitigated by CLI download with resumable transfer, but a 100GB download is not a good experience.
- Competitors offering in-browser viewers will demo better. Accepted; demo appeal is not the same as sustained value, and we should be able to articulate why.
- FSDB extraction depends on a customer-licensed vendor library, adding installation friction for the most common commercial format.

**Neutral**

- The bounded strip renderer may attract feature requests to widen its limits incrementally. The limits should be treated as architectural, not as parameters — each relaxation is a step toward the rejected alternative.

## Migration Strategy

Phase 3, alongside regression triage, where waveforms are needed.

**Sequence:**

1. VCD/FST WASM parser and signal extraction for AI (highest value, lowest cost).
2. `cbeda wave open` handoff for GTKWave and Surfer.
3. Server-rendered strips.
4. Verdi handoff (session file generation) and FSDB extraction via container-hatch parser.

**Scope guard.** Any proposal to widen the strip renderer toward interactivity requires an ADR superseding this one. Making the boundary formally expensive to cross is the mechanism, since the pressure to cross it will be continuous and will always seem locally reasonable.

## Open Questions

1. **Surfer remote-data protocol.** If it matures into a standard tiled-streaming protocol, embedding Surfer against a server-side tiler becomes far cheaper. Re-evaluate at Phase 4. This is the most likely reason to revise this ADR.
2. **Waveform retention.** Waveforms are the largest artifacts and are rarely re-opened. Default retention (7 days for passing tests, 90 for failing) needs validation against actual debug workflows.
3. **Dump-on-demand.** Rather than storing waveforms, could failing tests be re-run with dumping enabled? Cheaper storage, requires reproducibility (available via `reproducibilityKey`, ADR 0011) and deterministic simulation. Attractive but non-deterministic tests break it — probably an option, not a default.
4. **Signal relevance selection.** Which signals to extract around a failure is currently heuristic (assertion cone plus enclosing FSM state). A learned or static-analysis-driven approach would be better and is unspecified.
5. **Transaction-level views.** Higher-value than raw signals for protocol debug, and requires transaction recording in the testbench. Out of scope now; possibly a stronger differentiator than signal-level extraction if UVM transaction streams are available.

## Related ADRs

- 0011: Canonical Artifact and Result Identity — waveform artifacts, `reproducibilityKey` for dump-on-demand
- 0014: CerebroEDA Parser Runtime — waveform parsers as WASM/container plugins
- 0016: CerebroEDA Coverage Model — sibling analysis capability in Phase 3
