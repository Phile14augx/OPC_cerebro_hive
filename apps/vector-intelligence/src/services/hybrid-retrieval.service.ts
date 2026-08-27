import { Injectable } from '@nestjs/common';
import { HybridSearchDto, SearchResponseDto, SearchResultItemDto } from '../dto/hybrid-search.dto';
import { VectorStoreService } from './vector-store.service';

@Injectable()
export class HybridRetrievalService {
  constructor(private readonly vectorStoreService: VectorStoreService) {}

  private tokenize(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase().split(/\W+/).filter(t => t.length > 0);
  }

  private computeBM25(query: string, docs: any[]): Map<string, number> {
    const k1 = 1.5;
    const b = 0.75;
    const queryTerms = this.tokenize(query);
    const N = docs.length;
    const docTermFreqs = new Map<string, Map<string, number>>();
    const docLengths = new Map<string, number>();
    const df = new Map<string, number>();

    let totalLength = 0;

    for (const doc of docs) {
      const textFields = [];
      if (doc.metadata) {
        for (const key of Object.keys(doc.metadata)) {
          if (typeof doc.metadata[key] === 'string') {
            textFields.push(doc.metadata[key]);
          }
        }
      }
      const text = textFields.join(' ');
      const terms = this.tokenize(text);
      docLengths.set(doc.id, terms.length);
      totalLength += terms.length;

      const tf = new Map<string, number>();
      for (const term of terms) {
        tf.set(term, (tf.get(term) || 0) + 1);
      }
      docTermFreqs.set(doc.id, tf);

      for (const term of new Set(terms)) {
        df.set(term, (df.get(term) || 0) + 1);
      }
    }

    const avgdl = N > 0 ? totalLength / N : 0;
    const scores = new Map<string, number>();

    for (const doc of docs) {
      let score = 0;
      const tf = docTermFreqs.get(doc.id)!;
      const dl = docLengths.get(doc.id)!;

      for (const term of queryTerms) {
        const n = df.get(term) || 0;
        if (n === 0) continue;
        const idf = Math.log((N - n + 0.5) / (n + 0.5) + 1);
        const f = tf.get(term) || 0;
        const termScore = idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * (dl / avgdl)));
        score += termScore;
      }
      if (score > 0) {
        scores.set(doc.id, score);
      }
    }
    return scores;
  }

  async search(dto: HybridSearchDto): Promise<SearchResponseDto> {
    // Dense Search
    let denseResults: any[] = [];
    if (dto.query_vector && dto.query_vector.length > 0) {
      denseResults = await this.vectorStoreService.query(
        dto.namespace,
        dto.query_vector,
        1000,
        dto.filter
      );
    }

    // Sparse Search
    const sparseResults: any[] = [];
    if (dto.query_text) {
      const allDocs = await this.vectorStoreService.getAll(dto.namespace);
      const filteredDocs = dto.filter ? allDocs.filter(doc => {
        for (const key of Object.keys(dto.filter!)) {
          if (!doc.metadata || doc.metadata[key] !== dto.filter![key]) return false;
        }
        return true;
      }) : allDocs;

      const bm25Scores = this.computeBM25(dto.query_text, filteredDocs);
      for (const [id, score] of bm25Scores.entries()) {
        const doc = filteredDocs.find(d => d.id === id);
        sparseResults.push({ id, score, metadata: doc?.metadata });
      }
      sparseResults.sort((a, b) => b.score - a.score);
    }

    // RRF Fusion
    const rrfK = 60;
    const rrfScores = new Map<string, { score: number; metadata: any }>();

    denseResults.forEach((res, rank) => {
      rrfScores.set(res.id, {
        score: 1 / (rrfK + rank + 1),
        metadata: res.metadata
      });
    });

    sparseResults.forEach((res, rank) => {
      const existing = rrfScores.get(res.id);
      if (existing) {
        existing.score += 1 / (rrfK + rank + 1);
      } else {
        rrfScores.set(res.id, {
          score: 1 / (rrfK + rank + 1),
          metadata: res.metadata
        });
      }
    });

    const finalResults: SearchResultItemDto[] = Array.from(rrfScores.entries())
      .map(([id, data]) => ({
        id,
        score: data.score,
        metadata: data.metadata
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, dto.top_k);

    if (dto.include_metadata === false) {
      for (const res of finalResults) {
        delete res.metadata;
      }
    }

    return { results: finalResults };
  }
}
