export interface DiscoveryEntity {
  name: string;
  alternateName?: string;
  description: string;
  url: string;
  sameAs?: string[];
  applicationCategory?: string;
  operatingSystem?: string;
}

export interface EntityRef {
  name: string;
  url: string;
}

export interface KnowledgeGraphNode {
  entity: DiscoveryEntity;
  relatedServices?: string[];
  relatedProducts?: string[];
  relatedIndustries?: string[];
  relatedGuides?: string[];
  relatedCourses?: string[];
}
