
import { NodeDefinition } from '../registry';

export const LLMNodeDef: NodeDefinition = {
  type: 'LLM',
  displayName: 'Large Language Model',
  icon: null,
  component: () => null, // React component injected here
  validator: (node) => {
    const diagnostics = [];
    if (!node.configuration.model) {
      diagnostics.push({ level: 'Error', message: 'LLM node missing model selection.' });
    }
    return diagnostics;
  },
  compiler: (node) => ({
    id: node.id,
    type: 'LLM_REASONING',
    parameters: node.configuration
  }),
  simulator: async () => ({ output: 'Simulated LLM response' })
};
