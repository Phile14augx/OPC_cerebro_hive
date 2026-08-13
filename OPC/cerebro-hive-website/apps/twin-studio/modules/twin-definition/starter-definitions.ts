import type { TwinDefinition } from '@cerebro/twin-contracts';
import { domainVocabulary, genericDefinition } from '../industry/domain-vocabulary';

const typeToIndustry = {
  GENERIC: 'generic',
  MANUFACTURING: 'manufacturing',
  HEALTHCARE: 'hospital',
  AIRPORT: 'airport',
  BANKING: 'banking',
  SUPPLY_CHAIN: 'supply-chain',
  BUILDING: 'building',
  ENERGY: 'energy-grid',
  DATA_CENTER: 'data-center',
} as const;

export function starterDefinitionForType(type: string): TwinDefinition {
  const industry = typeToIndustry[type as keyof typeof typeToIndustry] ?? 'generic';
  if (industry === 'generic') return genericDefinition(type.toLowerCase());
  return structuredClone(domainVocabulary[industry].definition);
}

export function starterTypeLabel(type: string) {
  return typeToIndustry[type as keyof typeof typeToIndustry] ? type : 'GENERIC';
}
