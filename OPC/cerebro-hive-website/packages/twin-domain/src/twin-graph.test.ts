import { describe, expect, it } from 'vitest';
import { buildTwinGraph } from './twin-graph';

describe('buildTwinGraph', () => {
  it('infers an installed-on edge from a persisted motor line attribute', () => {
    const graph = buildTwinGraph({
      relationshipTypes: [{ key: 'installed-on', from: 'motor', to: 'production-line' }],
      entities: [
        {
          id: 'line-id',
          key: 'line-a',
          name: 'Production Line A',
          typeKey: 'production-line',
          attributes: { role: 'parent' },
        },
        {
          id: 'motor-id',
          key: 'motor-07',
          name: 'Motor-07',
          typeKey: 'motor',
          attributes: { line: 'line-a' },
        },
      ],
    });
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toEqual([
      {
        id: 'motor-id:installed-on:line-id:line',
        type: 'installed-on',
        fromEntityId: 'motor-id',
        toEntityId: 'line-id',
        fromKey: 'motor-07',
        toKey: 'line-a',
        viaAttribute: 'line',
      },
    ]);
  });

  it('does not invent edges from relationship types without attribute evidence', () => {
    const graph = buildTwinGraph({
      relationshipTypes: [{ key: 'located-in', from: 'icu-bed', to: 'patient-care-zone' }],
      entities: [
        {
          id: 'zone-id',
          key: 'icu-zone-east',
          name: 'ICU East',
          typeKey: 'patient-care-zone',
          attributes: { level: 4 },
        },
        {
          id: 'bed-id',
          key: 'icu-bed-12',
          name: 'ICU Bed 12',
          typeKey: 'icu-bed',
          attributes: { isolationCapable: true },
        },
      ],
    });
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toEqual([]);
  });

  it('matches hospital zone attributes to located-in edges', () => {
    const graph = buildTwinGraph({
      relationshipTypes: [{ key: 'located-in', from: 'icu-bed', to: 'patient-care-zone' }],
      entities: [
        {
          id: 'zone-id',
          key: 'icu-zone-east',
          name: 'ICU East',
          typeKey: 'patient-care-zone',
          attributes: {},
        },
        {
          id: 'bed-id',
          key: 'icu-bed-12',
          name: 'ICU Bed 12',
          typeKey: 'icu-bed',
          attributes: { zone: 'icu-zone-east' },
        },
      ],
    });
    expect(graph.edges[0]?.type).toBe('located-in');
    expect(graph.edges[0]?.fromKey).toBe('icu-bed-12');
    expect(graph.edges[0]?.toKey).toBe('icu-zone-east');
  });
});
