
import { CompilerPass, PassResult, CompilationContext } from '../engine/CompilationContext';

export const CompatibilityAnalyzerPass: CompilerPass = {
  id: 'core.compatibilityAnalyzer',
  phase: 'policy',
  description: 'Analyzes breaking changes against the parent workflow version',
  requires: ['core.semanticValidation'],
  run: (context: Readonly<CompilationContext>): PassResult => {
    const diagnostics = [];
    
    // MOCK: In reality, we'd compare the context.artifacts.symbolTable against the parent's table.
    // If an InputPort changed from Optional to Required, emit a Major Breaking Change diagnostic.
    
    const hasBreakingChange = false; // Mock
    
    if (hasBreakingChange) {
      diagnostics.push({
        level: 'Error',
        message: 'Major Version Bump Required: Input Port "Document" changed from Optional to Required.'
      });
    }

    return {
      context,
      diagnostics
    };
  }
};
