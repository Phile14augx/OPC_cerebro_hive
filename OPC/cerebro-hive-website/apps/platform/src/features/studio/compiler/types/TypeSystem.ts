
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
