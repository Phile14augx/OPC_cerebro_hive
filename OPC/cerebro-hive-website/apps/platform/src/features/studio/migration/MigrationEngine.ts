
import { StudioGraph } from '../../graph/GraphModel';

export interface MigrationStep {
  fromVersion: string;
  toVersion: string;
}

export interface MigrationProvider {
  nodeType: string;
  canAutoMigrate: (node: any, step: MigrationStep) => boolean;
  apply: (node: any, step: MigrationStep) => any;
}

export class MigrationEngine {
  private providers: Map<string, MigrationProvider> = new Map();

  public registerProvider(provider: MigrationProvider) {
    this.providers.set(provider.nodeType, provider);
  }

  public migrate(graph: StudioGraph, targetVersion: string): { migratedGraph: StudioGraph, diagnostics: string[] } {
    const diagnostics: string[] = [];
    const migratedNodes = graph.nodes.map(node => {
      const provider = this.providers.get(node.type);
      if (!provider) return node;

      const step: MigrationStep = { fromVersion: graph.version || 'v1', toVersion: targetVersion };
      
      if (provider.canAutoMigrate(node, step)) {
        diagnostics.push(`Auto-migrated node ${node.id} (${node.type})`);
        return provider.apply(node, step);
      } else {
        diagnostics.push(`Manual migration required for node ${node.id} (${node.type})`);
        return { ...node, hasMigrationError: true }; // Flags for UI rendering
      }
    });

    return {
      migratedGraph: { ...graph, nodes: migratedNodes, version: targetVersion },
      diagnostics
    };
  }
}
