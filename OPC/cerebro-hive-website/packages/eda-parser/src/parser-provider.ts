/**
 * Parser host contract — ADR 0014 (D3).
 *
 * Parsers are the highest-volume, most-exposed extension point: they process
 * untrusted text over customer IP, and most will not be written by us. They run
 * as WASM under Wasmtime with no WASI filesystem or network access — all I/O is
 * host-mediated through this interface.
 */

import type { ArtifactId, SemanticKey } from '@cerebro/eda-domain';

export interface ParseInput {
  readonly artifactId: ArtifactId;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly toolHint?: string;
}

export interface Fact {
  readonly factType: string;
  readonly payload: Readonly<Record<string, unknown>>;
  /**
   * Parsers supply canonicalised key fields; the host computes the hash
   * (ADR 0011). Third-party code cannot invent identity.
   */
  readonly semanticKey: SemanticKey;
  /**
   * Points back to the exact source line. Essential for trust — when an agent
   * says "your worst path is X", the engineer clicks through to the literal
   * report line. Also how parser bugs get found.
   */
  readonly sourceRef: { readonly line?: number; readonly byteOffset?: number };
  readonly confidence: number;
}

export interface ParserProvider {
  readonly id: string;
  readonly supportedToolVersions: string;
  /** Cheap sniff over the head of the file. Registry picks the highest and records the choice. */
  canParse(input: ParseInput, head: Uint8Array): Promise<number>;
  /** Streaming and incremental: a 4GB report never materialises, and a parse failing at 90% still yields 90% of its facts. */
  parse(input: ParseInput, host: ParserHost): AsyncIterable<Fact>;
}

export interface ParserHost {
  /** Pull-based: the parser requests, the host controls the buffer. A parser cannot force an allocation. */
  readChunk(maxBytes: number): Promise<Uint8Array | null>;
  log(level: 'debug' | 'info' | 'warn', msg: string): void;
}

export interface ParserLimits {
  readonly memoryPages: number;
  /** Fuel metering makes infinite loops impossible rather than merely detectable. */
  readonly fuel: number;
  readonly wallclockSec: number;
  readonly maxFacts: number;
  readonly maxFactBytes: number;
}

export const DEFAULT_PARSER_LIMITS: ParserLimits = {
  memoryPages: 8192,
  fuel: 10_000_000_000,
  wallclockSec: 300,
  maxFacts: 5_000_000,
  maxFactBytes: 512,
};

export type ParserRuntime =
  | { readonly kind: 'wasm' }
  /**
   * Quarantined escape hatch for parsers wrapping proprietary native libraries
   * (FSDB, UCIS). Cannot be published to the public marketplace; requires explicit
   * admin approval with the justification surfaced in the UI.
   */
  | { readonly kind: 'container'; readonly justification: string; readonly approvedBy: string };
