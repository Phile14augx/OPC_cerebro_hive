
import { CompilerPass, PassResult, CompilationContext } from '../engine/CompilationContext';
import { Types } from '../types/TypeSystem';

export const TypeInferencePass: CompilerPass = {
  id: 'core.typeInference',
  phase: 'semantic',
  description: 'Resolves generic types and infers outputs from node configurations',
  requires: ['core.normalize'],
  run: (context: Readonly<CompilationContext>): PassResult => {
    const newArtifacts = JSON.parse(JSON.stringify(context.artifacts));
    const diagnostics = [];

    // MOCK: Hybrid Type Inference
    // Iterate through nodes, check static port declarations or infer from configuration.
    context.graph.nodes.forEach(node => {
      let resolvedType = Types.Unknown;
      
      if (node.type === 'LLM') {
        resolvedType = node.configuration.jsonMode ? Types.JSON : Types.String;
      } else if (node.type === 'DataIngestion') {
        resolvedType = Types.Document;
      }

      const symbolId = `var-${node.id}-output`;
      newArtifacts.symbolTable[symbolId] = {
        id: symbolId,
        category: 'variable',
        scope: 'global',
        type: resolvedType,
        producer: node.id,
        consumers: [], // Filled during semantic validation
        nullable: false,
        mutable: false
      };
    });

    return {
      context: { ...context, artifacts: newArtifacts },
      diagnostics
    };
  }
};
