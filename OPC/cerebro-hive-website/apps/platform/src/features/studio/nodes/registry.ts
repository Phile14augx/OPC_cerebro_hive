
import { StudioNode } from '../graph/GraphModel';
import { Diagnostic } from '../compiler/CompilerErrors';

export interface NodeDefinition {
  type: string;
  displayName: string;
  icon: any; // Lucide icon component
  component: React.FC<{ node: StudioNode }>;
  validator: (node: StudioNode) => Diagnostic[];
  compiler: (node: StudioNode) => any;
  simulator: (node: StudioNode) => Promise<any>;
}

const registry = new Map<string, NodeDefinition>();

export const NodeRegistry = {
  register: (def: NodeDefinition) => registry.set(def.type, def),
  get: (type: string) => registry.get(type),
  getAll: () => Array.from(registry.values())
};
