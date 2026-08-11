/**
 * Ingest pipeline — the Phase 1 spine.
 *
 *   RTL input → execution → report artifact → parse → facts → signatures → store
 *
 * This is the chain the Blueprint calls the platform's spine (§25 Phase 1).
 * Everything else — flows, knowledge graph, agents — is breadth over this depth,
 * so it is worth building and testing before anything is layered on top.
 *
 * The pipeline is backend-agnostic by construction: it takes an
 * `ExecutionProvider`, so the same code drives the local child-process backend
 * today and a gVisor-sandboxed Kubernetes backend later (ADR 0013).
 */

import { readFile } from 'node:fs/promises';

import type { ArtifactId, FindingSignature, JobId, ProjectId, SemanticKey } from '@cerebro/eda-domain';
import { assertComparable } from '@cerebro/eda-domain';
import type { ExecutionProvider, ExecutionSpec } from '@cerebro/eda-execution';
import { classify } from '@cerebro/eda-workflow';
import type { Fact, ParseInput, ParserHost, ParserProvider } from '@cerebro/eda-parser';
import type { SignatureComputer, SignatureRegistry } from '@cerebro/eda-findings';

export interface IngestedFinding {
  readonly signature: FindingSignature;
  readonly factType: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly semanticKey: SemanticKey;
  readonly sourceRef: { readonly line?: number; readonly byteOffset?: number };
  readonly runId: string;
}

export interface RunResult {
  readonly runId: string;
  readonly jobId: JobId;
  /** Domain outcome of the tool, distinct from whether the pipeline worked. */
  readonly toolExitCode: number | null;
  readonly infrastructureFailure: string | null;
  readonly findings: readonly IngestedFinding[];
  readonly collisions: number;
}

export interface PipelineDeps {
  readonly execution: ExecutionProvider & {
    wait(ref: { backend: string; nativeId: string }): Promise<import('@cerebro/eda-execution').ExecutionResult>;
    collectOutputs(ref: { backend: string; nativeId: string }): Promise<
      readonly { logicalPath: string; absolutePath: string; contentHash: string; sizeBytes: number }[]
    >;
  };
  readonly parsers: readonly ParserProvider[];
  readonly signatures: SignatureComputer;
  readonly registry: SignatureRegistry;
}

/** File-backed host: pull-based so a multi-GB report never materialises. */
function fileHost(bytes: Buffer): ParserHost {
  let pos = 0;
  return {
    async readChunk(maxBytes: number) {
      if (pos >= bytes.length) return null;
      const slice = bytes.subarray(pos, pos + maxBytes);
      pos += slice.length;
      return new Uint8Array(slice);
    },
    log() {
      /* routed to observability in production */
    },
  };
}

/** Highest-confidence parser wins, and the choice is recorded (ADR 0014). */
async function selectParser(
  parsers: readonly ParserProvider[],
  input: ParseInput,
  head: Uint8Array,
): Promise<{ parser: ParserProvider; confidence: number } | null> {
  let best: { parser: ParserProvider; confidence: number } | null = null;
  for (const parser of parsers) {
    const confidence = await parser.canParse(input, head);
    if (confidence > 0 && (!best || confidence > best.confidence)) best = { parser, confidence };
  }
  return best;
}

export async function runIngest(
  deps: PipelineDeps,
  spec: ExecutionSpec,
  opts: { runId: string; projectId: ProjectId; signatureVersion?: number },
): Promise<RunResult> {
  const version = opts.signatureVersion ?? 1;

  const ref = await deps.execution.submit(spec);
  const result = await deps.execution.wait(ref);

  // The disposition, not the exit code, decides what happens next (ADR 0009).
  const disposition = classify(result, 1);
  if (disposition.action === 'retry' || disposition.action === 'fail-permanently') {
    return {
      runId: opts.runId,
      jobId: spec.jobId,
      toolExitCode: null,
      infrastructureFailure: result.kind === 'infrastructure' ? result.reason : 'unknown',
      findings: [],
      collisions: 0,
    };
  }

  const exitCode = result.kind === 'outcome' ? result.exitCode : null;

  // A non-zero exit is a domain outcome — the tool ran and said no. Its reports
  // are still worth ingesting: a failed run's timing data is exactly what an
  // engineer needs to debug why it failed.
  const outputs = await deps.execution.collectOutputs(ref);
  const findings: IngestedFinding[] = [];
  let collisions = 0;

  for (const artifact of outputs) {
    const bytes = await readFile(artifact.absolutePath);
    const input: ParseInput = {
      artifactId: `art_${artifact.contentHash.slice(-26).toUpperCase()}` as ArtifactId,
      contentType: 'text/plain',
      sizeBytes: artifact.sizeBytes,
    };

    const chosen = await selectParser(deps.parsers, input, new Uint8Array(bytes.subarray(0, 4096)));
    if (!chosen) continue;

    for await (const fact of chosen.parser.parse(input, fileHost(bytes)) as AsyncIterable<Fact>) {
      const signature = deps.signatures.compute(fact.factType.replace('.', '_'), version, fact.semanticKey);
      const collision = await deps.registry.checkAndRecord(signature, fact.semanticKey);
      if (collision) collisions++;
      findings.push({
        signature,
        factType: fact.factType,
        payload: fact.payload,
        semanticKey: fact.semanticKey,
        sourceRef: fact.sourceRef,
        runId: opts.runId,
      });
    }
  }

  return {
    runId: opts.runId,
    jobId: spec.jobId,
    toolExitCode: exitCode,
    infrastructureFailure: null,
    findings,
    collisions,
  };
}

// ---------------------------------------------------------------------------
// Run-over-run comparison — the reason signatures exist at all.
// ---------------------------------------------------------------------------

export interface Comparison {
  readonly newFindings: readonly IngestedFinding[];
  readonly resolved: readonly IngestedFinding[];
  readonly persisting: readonly { before: IngestedFinding; after: IngestedFinding }[];
  readonly regressed: readonly { before: IngestedFinding; after: IngestedFinding; deltaPs: number }[];
}

/**
 * Compare two runs by signature.
 *
 * This is the payoff of ADR 0011: because identity excludes measured values, a
 * path whose slack moved is *the same path with a different number*, not a new
 * finding. Without that, every run would report 100% new findings and none of
 * this would be answerable.
 */
export function compareRuns(before: RunResult, after: RunResult, metric = 'slackPs'): Comparison {
  const beforeBySig = new Map(before.findings.map((f) => [f.signature, f]));
  const afterBySig = new Map(after.findings.map((f) => [f.signature, f]));

  const newFindings: IngestedFinding[] = [];
  const resolved: IngestedFinding[] = [];
  const persisting: { before: IngestedFinding; after: IngestedFinding }[] = [];
  const regressed: { before: IngestedFinding; after: IngestedFinding; deltaPs: number }[] = [];

  for (const [sig, f] of afterBySig) {
    const prior = beforeBySig.get(sig);
    if (!prior) {
      newFindings.push(f);
      continue;
    }
    // Refuses to compare across signature versions rather than silently
    // reporting everything as new (ADR 0011).
    assertComparable(prior.signature, f.signature);
    persisting.push({ before: prior, after: f });

    const a = prior.payload[metric];
    const b = f.payload[metric];
    if (typeof a === 'number' && typeof b === 'number' && b < a) {
      regressed.push({ before: prior, after: f, deltaPs: b - a });
    }
  }

  for (const [sig, f] of beforeBySig) {
    if (!afterBySig.has(sig)) resolved.push(f);
  }

  return { newFindings, resolved, persisting, regressed };
}
