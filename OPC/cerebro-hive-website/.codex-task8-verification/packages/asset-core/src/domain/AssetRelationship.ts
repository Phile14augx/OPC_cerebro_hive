export enum RelationshipType {
  DependsOn = 'DependsOn',
  HostedOn = 'HostedOn',
  Contains = 'Contains',
  RunsOn = 'RunsOn',
  Uses = 'Uses',
  Consumes = 'Consumes',
  Exposes = 'Exposes',
  ReplicatesTo = 'ReplicatesTo',
  BacksUp = 'BacksUp',
  Protects = 'Protects',
  Owns = 'Owns',
  ManagedBy = 'ManagedBy',
  ConnectedTo = 'ConnectedTo',
  CommunicatesWith = 'CommunicatesWith',
  Monitors = 'Monitors',
  Implements = 'Implements',
  Supports = 'Supports',
  Provides = 'Provides'
}

export interface AssetRelationship {
  sourceCiId: string;
  targetCiId: string;
  relationshipType: RelationshipType | string; // Hybrid model: Enum core + custom string
}
