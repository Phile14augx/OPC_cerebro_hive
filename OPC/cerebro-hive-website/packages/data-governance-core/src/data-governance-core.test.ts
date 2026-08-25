import { describe, expect, it, vi } from 'vitest';
import {
  ClassificationPropagator,
  LineageGraph,
  QualityManager,
  type Dataset,
} from './index';

function dataset(id: string, sensitivity: Dataset['classification']['sensitivity']): Dataset {
  return {
    id,
    name: id,
    description: `${id} dataset`,
    domain: 'commerce',
    classification: {
      sensitivity,
      containsPII: false,
      containsPHI: false,
      residency: [],
    },
    certification: 'Draft',
    tags: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
}

describe('data-governance in-memory contracts', () => {
  it('traverses downstream lineage transitively without duplicate impacts', () => {
    const graph = new LineageGraph();
    graph.addEdge({ id: 'a-b', sourceDatasetId: 'a', targetDatasetId: 'b', edgeType: 'Produces' });
    graph.addEdge({ id: 'a-b-copy', sourceDatasetId: 'a', targetDatasetId: 'b', edgeType: 'ExportsTo' });
    graph.addEdge({ id: 'b-c', sourceDatasetId: 'b', targetDatasetId: 'c', edgeType: 'Produces' });

    expect(graph.getDownstreamImpact('a')).toEqual(['b', 'c']);
  });

  it('propagates stricter sensitivity, personal-data flags, and residency downstream', () => {
    const graph = new LineageGraph();
    graph.addEdge({ id: 'source-derived', sourceDatasetId: 'source', targetDatasetId: 'derived', edgeType: 'Produces' });
    const source = dataset('source', 'Restricted');
    source.classification.containsPII = true;
    source.classification.residency = ['EU'];
    const derived = dataset('derived', 'Internal');
    const catalog = new Map([[source.id, source], [derived.id, derived]]);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    new ClassificationPropagator(graph, catalog).propagate('source');

    expect(derived.classification).toEqual({
      sensitivity: 'Restricted',
      containsPII: true,
      containsPHI: false,
      residency: ['EU'],
    });
  });

  it('derives the quality profile score as the mean of its dimensions', () => {
    const quality = new QualityManager();
    const profile = {
      datasetId: 'orders',
      dimensions: [
        { dimension: 'Completeness' as const, score: 90, lastMeasuredAt: new Date('2026-01-01T00:00:00.000Z') },
        { dimension: 'Accuracy' as const, score: 70, lastMeasuredAt: new Date('2026-01-01T00:00:00.000Z') },
      ],
      overallScore: 0,
    };

    quality.updateProfile(profile);

    expect(quality.getProfile('orders')?.overallScore).toBe(80);
  });
});
