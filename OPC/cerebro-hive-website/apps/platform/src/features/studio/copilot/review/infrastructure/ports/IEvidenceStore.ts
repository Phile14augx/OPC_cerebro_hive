
import type { EvidenceGraph } from '../../domain/entities/EvidenceGraph';

export interface IEvidenceStore {
  saveGraph(graph: EvidenceGraph): Promise<void>;
  loadGraph(graphId: string): Promise<EvidenceGraph | null>;
}
