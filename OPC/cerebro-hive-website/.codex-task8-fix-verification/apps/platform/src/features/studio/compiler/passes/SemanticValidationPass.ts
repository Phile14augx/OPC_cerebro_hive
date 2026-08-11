
import { CompilerPass, PassResult, CompilationContext } from '../engine/CompilationContext';
import { TypeRegistry, Types } from '../types/TypeSystem';

export const SemanticValidationPass: CompilerPass = {
  id: 'core.semanticValidation',
  phase: 'semantic',
  description: 'Validates type compatibility across edges',
  requires: ['core.typeInference'],
  run: (context: Readonly<CompilationContext>): PassResult => {
    const diagnostics = [];
    const artifacts = context.artifacts;

    // Iterate through edges to validate dataflow types
    context.graph.edges.forEach(edge => {
      const sourceSymbol = artifacts.symbolTable[`var-${edge.source}-output`];
      // MOCK Target Type (in reality, look up Target Node's specific InputPort type)
      const mockTargetInputType = Types.String; // Hardcoding string for mock

      if (sourceSymbol) {
        const compatibility = TypeRegistry.checkCompatibility(sourceSymbol.type, mockTargetInputType);
        
        if (compatibility === 'Invalid') {
          diagnostics.push({
            level: 'Error',
            edgeId: edge.id,
            message: `Cannot connect ${sourceSymbol.type.name} to ${mockTargetInputType.name}. Expected ${mockTargetInputType.name}. Suggestion: Insert an explicit conversion node.`
          });
        } else if (compatibility === 'Implicit') {
          diagnostics.push({
            level: 'Hint',
            edgeId: edge.id,
            message: `Implicit safe conversion from ${sourceSymbol.type.name} to ${mockTargetInputType.name} applied.`
          });
        } else if (compatibility === 'Explicit') {
          diagnostics.push({
            level: 'Error',
            edgeId: edge.id,
            message: `Lossy conversion from ${sourceSymbol.type.name} to ${mockTargetInputType.name} requires an explicit converter node.`
          });
        }
      }
    });

    return {
      context,
      diagnostics
    };
  }
};
