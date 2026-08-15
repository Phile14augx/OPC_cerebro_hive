export type TwinGraphEntity = {
  id: string;
  key: string;
  name: string;
  typeKey: string;
  attributes: Record<string, unknown>;
};

export type TwinGraphRelationship = {
  key: string;
  from: string;
  to: string;
};

export type TwinGraphNode = {
  id: string;
  key: string;
  name: string;
  typeKey: string;
};

export type TwinGraphEdge = {
  id: string;
  type: string;
  fromEntityId: string;
  toEntityId: string;
  fromKey: string;
  toKey: string;
  viaAttribute: string;
};

export type TwinGraph = {
  nodes: TwinGraphNode[];
  edges: TwinGraphEdge[];
};

function attributeReferencesKey(value: unknown, entityKey: string): boolean {
  if (typeof value === 'string') return value === entityKey;
  if (Array.isArray(value)) return value.some((item) => item === entityKey);
  return false;
}

export function buildTwinGraph(input: {
  relationshipTypes: TwinGraphRelationship[];
  entities: TwinGraphEntity[];
}): TwinGraph {
  const nodes: TwinGraphNode[] = input.entities.map((entity) => ({
    id: entity.id,
    key: entity.key,
    name: entity.name,
    typeKey: entity.typeKey,
  }));
  const edges: TwinGraphEdge[] = [];
  const seen = new Set<string>();

  for (const relationship of input.relationshipTypes) {
    const fromEntities = input.entities.filter((entity) => entity.typeKey === relationship.from);
    const toEntities = input.entities.filter((entity) => entity.typeKey === relationship.to);
    for (const from of fromEntities) {
      for (const to of toEntities) {
        if (from.id === to.id) continue;
        for (const [attributeKey, attributeValue] of Object.entries(from.attributes ?? {})) {
          if (!attributeReferencesKey(attributeValue, to.key)) continue;
          const id = `${from.id}:${relationship.key}:${to.id}:${attributeKey}`;
          if (seen.has(id)) continue;
          seen.add(id);
          edges.push({
            id,
            type: relationship.key,
            fromEntityId: from.id,
            toEntityId: to.id,
            fromKey: from.key,
            toKey: to.key,
            viaAttribute: attributeKey,
          });
        }
      }
    }
  }

  return { nodes, edges };
}
