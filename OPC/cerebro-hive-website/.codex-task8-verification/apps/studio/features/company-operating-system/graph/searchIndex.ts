import type { OperatingNode } from "@cerebro/shared-types";

export interface OperatingSearchIndex {
  search(query: string): OperatingNode[];
}

const normalise = (value: string) => value.toLocaleLowerCase().replace(/[-_]/g, " ").trim();

export function createOperatingSearchIndex(nodes: readonly OperatingNode[]): OperatingSearchIndex {
  const entries = nodes
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((node) => ({
      node,
      haystack: normalise([node.id, node.label, node.type, ...node.tags].join(" ")),
    }));

  return {
    search(query) {
      const terms = normalise(query).split(/\s+/).filter(Boolean);
      if (terms.length === 0) return entries.map(({ node }) => node);
      return entries
        .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
        .map(({ node }) => node);
    },
  };
}
