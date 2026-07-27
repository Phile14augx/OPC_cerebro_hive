
export type TypeCategory = 'Primitive' | 'Structured' | 'AI' | 'Collection' | 'Generic' | 'Union' | 'Unknown';

export interface DataType {
  id: string;
  name: string;
  category: TypeCategory;
}

// Skeletons for Future Expansion
export interface GenericType extends DataType {
  category: 'Generic';
  baseType: DataType;
  typeArguments: DataType[];
}

export interface UnionType extends DataType {
  category: 'Union';
  memberTypes: DataType[];
}

// Built-in Types (abridged)
export const Types = {
  String: { id: 'primitive.string', name: 'String', category: 'Primitive' } as DataType,
  JSON: { id: 'structured.json', name: 'JSON', category: 'Structured' } as DataType,
  Document: { id: 'ai.document', name: 'Document', category: 'AI' } as DataType,
  Unknown: { id: 'sys.unknown', name: 'Unknown', category: 'Unknown' } as DataType
};

// Declarative Compatibility Registry
export type CompatibilityResult = 'Compatible' | 'Implicit' | 'Explicit' | 'Invalid';

export interface CompatibilityRule {
  sourceType: string;
  targetType: string;
  compatibilityKind: CompatibilityResult;
  diagnosticHint?: string;
}

export class TypeRegistry {
  private static rules: CompatibilityRule[] = [];

  static registerRule(rule: CompatibilityRule) {
    this.rules.push(rule);
  }

  static checkCompatibility(source: DataType, target: DataType): CompatibilityResult {
    if (source.id === target.id) return 'Compatible';
    if (source.id === 'sys.unknown' || target.id === 'sys.unknown') return 'Implicit';

    const rule = this.rules.find(r => r.sourceType === source.id && r.targetType === target.id);
    if (rule) return rule.compatibilityKind;
    
    return 'Invalid'; // Default to strict safety
  }
}

// Register default rules
TypeRegistry.registerRule({ sourceType: 'primitive.string', targetType: 'ai.document', compatibilityKind: 'Implicit', diagnosticHint: 'Implicit safe conversion applied.' });
