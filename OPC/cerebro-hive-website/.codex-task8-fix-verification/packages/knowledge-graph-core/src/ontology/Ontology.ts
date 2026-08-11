export enum NodeKind {
  BusinessCapability = 'BusinessCapability',
  BusinessService = 'BusinessService',
  ConfigurationItem = 'ConfigurationItem',
  AIModel = 'AIModel',
  Prompt = 'Prompt',
  Dataset = 'Dataset',
  AIEvaluation = 'AIEvaluation',
  AIProvider = 'AIProvider',
  Risk = 'Risk',
  Policy = 'Policy',
  ChangeRequest = 'ChangeRequest',
  Incident = 'Incident',
  Deployment = 'Deployment'
}

export enum RelationshipType {
  DEPENDS_ON = 'DEPENDS_ON',
  GOVERNS = 'GOVERNS',
  MITIGATES = 'MITIGATES',
  AFFECTS = 'AFFECTS',
  IMPLEMENTS = 'IMPLEMENTS',
  TRAINED_ON = 'TRAINED_ON',
  EVALUATED_BY = 'EVALUATED_BY',
  HOSTED_BY = 'HOSTED_BY'
}

export interface OntologyConstraint {
  sourceKind: NodeKind;
  relationshipType: RelationshipType;
  targetKind: NodeKind;
}

export class EnterpriseOntology {
  // Define valid semantic relationships
  static readonly validRelationships: OntologyConstraint[] = [
    { sourceKind: NodeKind.BusinessService, relationshipType: RelationshipType.DEPENDS_ON, targetKind: NodeKind.ConfigurationItem },
    { sourceKind: NodeKind.ConfigurationItem, relationshipType: RelationshipType.DEPENDS_ON, targetKind: NodeKind.ConfigurationItem },
    { sourceKind: NodeKind.AIModel, relationshipType: RelationshipType.HOSTED_BY, targetKind: NodeKind.AIProvider },
    { sourceKind: NodeKind.AIModel, relationshipType: RelationshipType.TRAINED_ON, targetKind: NodeKind.Dataset },
    { sourceKind: NodeKind.AIEvaluation, relationshipType: RelationshipType.EVALUATED_BY, targetKind: NodeKind.AIModel },
    { sourceKind: NodeKind.Policy, relationshipType: RelationshipType.GOVERNS, targetKind: NodeKind.AIModel },
    { sourceKind: NodeKind.Risk, relationshipType: RelationshipType.AFFECTS, targetKind: NodeKind.ConfigurationItem },
    { sourceKind: NodeKind.ChangeRequest, relationshipType: RelationshipType.AFFECTS, targetKind: NodeKind.ConfigurationItem }
  ];

  static isValid(sourceKind: NodeKind, relationshipType: RelationshipType, targetKind: NodeKind): boolean {
    return this.validRelationships.some(c => 
      c.sourceKind === sourceKind && 
      c.relationshipType === relationshipType && 
      c.targetKind === targetKind
    );
  }
}
