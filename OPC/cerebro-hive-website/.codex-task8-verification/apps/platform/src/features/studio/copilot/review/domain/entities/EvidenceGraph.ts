
export interface EvidenceNode {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly data: unknown;
  readonly addedAt: Date;
}

export interface EvidenceEdge {
  readonly from: string;
  readonly to: string;
  readonly relation: string;
}

export class EvidenceGraph {
  constructor(
    public readonly graphId: string,
    public readonly nodes: ReadonlyArray<EvidenceNode>,
    public readonly edges: ReadonlyArray<EvidenceEdge>
  ) {}
}
