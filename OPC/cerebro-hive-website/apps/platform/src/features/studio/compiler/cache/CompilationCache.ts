
import { Symbol } from '../engine/CompilationContext';

export interface CacheSnapshot {
  versionId: string;
  nodeHashes: Record<string, string>; // node.id -> hash
  symbolTable: Record<string, Symbol>; // Node's compiled symbols
}

export class CompilationCache {
  private currentSnapshot: CacheSnapshot = { versionId: 'init', nodeHashes: {}, symbolTable: {} };

  public getSnapshot(): Readonly<CacheSnapshot> {
    return this.currentSnapshot;
  }

  public commitSnapshot(newSnapshot: CacheSnapshot) {
    this.currentSnapshot = newSnapshot;
  }
}
