const fs = require('fs');
const path = require('path');

const studioDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'apps', 'platform', 'src', 'features', 'studio');
const typesDir = path.join(studioDir, 'compiler', 'types');
const passesDir = path.join(studioDir, 'compiler', 'passes');
const engineDir = path.join(studioDir, 'compiler', 'engine');

[typesDir, passesDir, engineDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ----------------------------------------------------
// 1. SEMANTIC TYPE SYSTEM
// ----------------------------------------------------
fs.writeFileSync(path.join(typesDir, 'TypeSystem.ts'), `
export type TypeCategory = 'Primitive' | 'Structured' | 'AI' | 'Collection' | 'Generic' | 'Unknown';

export interface DataType {
  id: string;
  name: string;
  category: TypeCategory;
  parameters?: DataType[]; // For generics like Array<String>
}

// Built-in Types
export const Types = {
  String: { id: 'primitive.string', name: 'String', category: 'Primitive' } as DataType,
  Integer: { id: 'primitive.int', name: 'Integer', category: 'Primitive' } as DataType,
  Float: { id: 'primitive.float', name: 'Float', category: 'Primitive' } as DataType,
  Boolean: { id: 'primitive.bool', name: 'Boolean', category: 'Primitive' } as DataType,
  
  JSON: { id: 'structured.json', name: 'JSON', category: 'Structured' } as DataType,
  Table: { id: 'structured.table', name: 'Table', category: 'Structured' } as DataType,
  
  Prompt: { id: 'ai.prompt', name: 'Prompt', category: 'AI' } as DataType,
  Embedding: { id: 'ai.embedding', name: 'Embedding', category: 'AI' } as DataType,
  Image: { id: 'ai.image', name: 'Image', category: 'AI' } as DataType,
  Document: { id: 'ai.document', name: 'Document', category: 'AI' } as DataType,
  
  Unknown: { id: 'sys.unknown', name: 'Unknown', category: 'Unknown' } as DataType
};

// Type Compatibility Registry
export type CompatibilityResult = 'Compatible' | 'Implicit' | 'Explicit' | 'Invalid';

export class TypeRegistry {
  private customTypes: Map<string, DataType> = new Map();

  static checkCompatibility(source: DataType, target: DataType): CompatibilityResult {
    if (source.id === target.id) return 'Compatible';
    if (source.id === 'sys.unknown' || target.id === 'sys.unknown') return 'Implicit';
    
    if (source.id === 'primitive.int' && target.id === 'primitive.float') return 'Implicit';
    if (source.id === 'primitive.float' && target.id === 'primitive.int') return 'Explicit'; // Lossy
    
    if (source.id === 'primitive.string' && target.id === 'ai.document') return 'Implicit';
    if (source.id === 'ai.image' && target.id === 'structured.table') return 'Invalid';
    
    return 'Invalid';
  }
}
`);

// ----------------------------------------------------
// 2. ENRICHED SYMBOL TABLE
// ----------------------------------------------------
fs.writeFileSync(path.join(engineDir, 'CompilationContext.ts'), `
import { StudioGraph } from '../../graph/GraphModel';
import { ExecutionPlan } from '../ir/ExecutionPlan';
import { Diagnostic } from '../CompilerErrors';
import { DataType } from '../types/TypeSystem';

export interface Symbol {
  id: string;
  category: 'variable' | 'node' | 'stage';
  scope: string;
  type: DataType;
  producer: string; 
  consumers: string[];
  nullable: boolean;
  mutable: boolean;
  schema?: any; // JSON schema if structured output
}

export interface DebugMetadata {
  sourceNodeId: string;
  executionStageId: string;
  symbolIds: string[];
  sourceLocation: { x: number; y: number };
  breakpointId?: string;
}

export interface CompilationArtifacts {
  symbolTable: Record<string, Symbol>;
  debugMap: Record<string, DebugMetadata>;
}

export interface CompilerMetrics {
  compilationTimeMs: number;
  passTimings: Record<string, number>;
  nodeCount: number;
  stageCount: number;
  optimizationCount: number;
}

export interface CompilationContext {
  graph: StudioGraph;
  plan: ExecutionPlan;
  diagnostics: Diagnostic[];
  artifacts: CompilationArtifacts;
  metrics: CompilerMetrics;
}

export interface PassResult {
  context: CompilationContext;
  diagnostics: Diagnostic[];
}

export interface CompilerPass {
  id: string;
  phase: string;
  description: string;
  requires: string[];
  run: (context: Readonly<CompilationContext>) => PassResult;
}
`);

// ----------------------------------------------------
// 3. COMPILER PASSES
// ----------------------------------------------------
fs.writeFileSync(path.join(passesDir, 'TypeInferencePass.ts'), `
import { CompilerPass, PassResult, CompilationContext, Symbol } from '../engine/CompilationContext';
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

      const symbolId = \`var-\${node.id}-output\`;
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
`);

fs.writeFileSync(path.join(passesDir, 'SemanticValidationPass.ts'), `
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
      const sourceSymbol = artifacts.symbolTable[\`var-\${edge.source}-output\`];
      // MOCK Target Type (in reality, look up Target Node's specific InputPort type)
      const mockTargetInputType = Types.String; // Hardcoding string for mock

      if (sourceSymbol) {
        const compatibility = TypeRegistry.checkCompatibility(sourceSymbol.type, mockTargetInputType);
        
        if (compatibility === 'Invalid') {
          diagnostics.push({
            level: 'Error',
            edgeId: edge.id,
            message: \`Cannot connect \${sourceSymbol.type.name} to \${mockTargetInputType.name}. Expected \${mockTargetInputType.name}. Suggestion: Insert an explicit conversion node.\`
          });
        } else if (compatibility === 'Implicit') {
          diagnostics.push({
            level: 'Hint',
            edgeId: edge.id,
            message: \`Implicit safe conversion from \${sourceSymbol.type.name} to \${mockTargetInputType.name} applied.\`
          });
        } else if (compatibility === 'Explicit') {
          diagnostics.push({
            level: 'Error',
            edgeId: edge.id,
            message: \`Lossy conversion from \${sourceSymbol.type.name} to \${mockTargetInputType.name} requires an explicit converter node.\`
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
`);

console.log('Milestone 23 Dataflow Typing Framework Scaffolded Successfully');
