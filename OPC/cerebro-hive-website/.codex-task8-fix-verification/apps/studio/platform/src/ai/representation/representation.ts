import { cosine, deterministicEmbedding, EMBEDDING_DIM } from "../x/mock-provider.js";

/**
 * JEPA-inspired predictive representation layer.
 * Encoders map content into a latent space; the predictor estimates the NEXT
 * latent state from a context window of past states. Implementations are
 * swappable so learned models can replace the deterministic baseline without
 * touching the runtime.
 */
export interface RepresentationModel {
  readonly id: string;
  readonly dimensions: number;
  encode(content: string): number[];
  /** Predict the next latent state from an ordered context of latent states. */
  predictNext(context: number[][]): number[];
  similarity(a: number[], b: number[]): number;
}

/** Deterministic baseline: EMA-extrapolation predictor over hashed embeddings. */
export class HashedProjectionModel implements RepresentationModel {
  readonly id = "hashed-projection-v1";
  readonly dimensions = EMBEDDING_DIM;

  encode(content: string): number[] { return deterministicEmbedding(content, this.dimensions); }

  predictNext(context: number[][]): number[] {
    if (context.length === 0) return new Array(this.dimensions).fill(0);
    if (context.length === 1) return [...context[0]!];
    const last = context[context.length - 1]!;
    const prev = context[context.length - 2]!;
    // Linear extrapolation with decay: next ≈ last + 0.5*(last - prev)
    const out = last.map((v, i) => v + 0.5 * (v - (prev[i] ?? 0)));
    const norm = Math.sqrt(out.reduce((a, v) => a + v * v, 0)) || 1;
    return out.map(v => v / norm);
  }

  similarity(a: number[], b: number[]): number { return cosine(a, b); }
}

export interface AnomalyReport { score: number; anomalous: boolean; expectedSimilarity: number }

/** Detect trajectory anomalies: how far did reality land from the predicted state? */
export class AnomalyDetector {
  constructor(private readonly model: RepresentationModel, private readonly threshold = 0.35) {}
  assess(history: string[], observed: string): AnomalyReport {
    const context = history.map(h => this.model.encode(h));
    const predicted = this.model.predictNext(context);
    const actual = this.model.encode(observed);
    const sim = this.model.similarity(predicted, actual);
    return { score: 1 - sim, anomalous: history.length >= 2 && sim < this.threshold, expectedSimilarity: sim };
  }
}
