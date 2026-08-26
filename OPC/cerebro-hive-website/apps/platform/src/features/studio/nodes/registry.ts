
import { StudioNode } from '../graph/GraphModel';
import { Diagnostic } from '../compiler/CompilerErrors';
import type { ComponentType, FC } from 'react';

export interface NodeDefinition {
  type: string;
  displayName: string;
  icon: ComponentType<{ className?: string }>;
  component: FC<{ node: StudioNode }>;
  validator: (node: StudioNode) => Diagnostic[];
  compiler: (node: StudioNode) => unknown;
  simulator: (node: StudioNode) => Promise<unknown>;
}

const registry = new Map<string, NodeDefinition>();

export const NodeRegistry = {
  register: (def: NodeDefinition) => registry.set(def.type, def),
  get: (type: string) => registry.get(type),
  getAll: () => Array.from(registry.values())
};
