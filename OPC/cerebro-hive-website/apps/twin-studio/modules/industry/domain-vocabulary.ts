import type { IndustryKey, TwinDefinition } from '@cerebro/twin-contracts';

type Vocabulary = {
  title: string;
  type: string;
  definition: TwinDefinition;
};

export const domainVocabulary: Record<Exclude<IndustryKey, 'generic'>, Vocabulary> = {
  manufacturing: {
    title: 'Production line',
    type: 'MANUFACTURING',
    definition: {
      entityTypes: [
        { key: 'production-line', name: 'Production line' },
        { key: 'motor', name: 'Motor' },
      ],
      relationshipTypes: [{ key: 'installed-on', from: 'motor', to: 'production-line' }],
      variables: [
        { key: 'temperature', unit: '°C' },
        { key: 'vibration', unit: 'mm/s' },
        { key: 'production-rate', unit: '%' },
      ],
      rules: [{ key: 'bearing-risk', expression: 'vibration > 6.5 && temperature > 76' }],
      entities: [
        {
          key: 'line-a',
          name: 'Production Line A',
          typeKey: 'production-line',
          attributes: { role: 'parent' },
        },
        {
          key: 'motor-07',
          name: 'Motor-07',
          typeKey: 'motor',
          attributes: { line: 'line-a' },
        },
      ],
    },
  },
  airport: {
    title: 'Airport operations',
    type: 'AIRPORT',
    definition: {
      entityTypes: [
        { key: 'gate', name: 'Gate' },
        { key: 'aircraft', name: 'Aircraft' },
        { key: 'stand', name: 'Stand' },
      ],
      relationshipTypes: [
        { key: 'assigned-to', from: 'aircraft', to: 'gate' },
        { key: 'parked-at', from: 'aircraft', to: 'stand' },
      ],
      variables: [
        { key: 'turnaround-minutes', unit: 'min' },
        { key: 'occupancy', unit: 'boolean' },
        { key: 'boarding-status', unit: 'enum' },
      ],
      rules: [{ key: 'turnaround-delay', expression: 'turnaround-minutes > 55' }],
      entities: [
        {
          key: 'gate-b12',
          name: 'Gate B12',
          typeKey: 'gate',
          attributes: { concourse: 'B', international: true },
        },
        {
          key: 'stand-b12',
          name: 'Stand B12',
          typeKey: 'stand',
          attributes: { gate: 'gate-b12' },
        },
        {
          key: 'flight-441',
          name: 'Flight 441',
          typeKey: 'aircraft',
          attributes: { gate: 'gate-b12', stand: 'stand-b12' },
        },
      ],
    },
  },
  hospital: {
    title: 'Hospital ICU',
    type: 'HEALTHCARE',
    definition: {
      entityTypes: [
        { key: 'icu-bed', name: 'ICU bed' },
        { key: 'patient-care-zone', name: 'Patient care zone' },
      ],
      relationshipTypes: [{ key: 'located-in', from: 'icu-bed', to: 'patient-care-zone' }],
      variables: [
        { key: 'occupancy', unit: 'boolean' },
        { key: 'turnover-minutes', unit: 'min' },
        { key: 'oxygen-flow', unit: 'L/min' },
      ],
      rules: [{ key: 'turnover-delay', expression: 'turnover-minutes > 45' }],
      entities: [
        {
          key: 'icu-zone-east',
          name: 'ICU East',
          typeKey: 'patient-care-zone',
          attributes: { level: 4 },
        },
        {
          key: 'icu-bed-12',
          name: 'ICU Bed 12',
          typeKey: 'icu-bed',
          attributes: { zone: 'icu-zone-east', isolationCapable: true },
        },
      ],
    },
  },
  banking: {
    title: 'Retail bank branch',
    type: 'BANKING',
    definition: {
      entityTypes: [
        { key: 'branch', name: 'Branch' },
        { key: 'atm', name: 'ATM' },
        { key: 'vault', name: 'Vault' },
      ],
      relationshipTypes: [
        { key: 'located-in', from: 'atm', to: 'branch' },
        { key: 'secures', from: 'vault', to: 'branch' },
      ],
      variables: [
        { key: 'cash-level', unit: 'currency' },
        { key: 'queue-length', unit: 'count' },
        { key: 'availability', unit: '%' },
      ],
      rules: [{ key: 'cash-low', expression: 'cash-level < 15000' }],
      entities: [
        {
          key: 'branch-riverside',
          name: 'Riverside Branch',
          typeKey: 'branch',
          attributes: { region: 'north' },
        },
        {
          key: 'atm-01',
          name: 'ATM 01',
          typeKey: 'atm',
          attributes: { branch: 'branch-riverside' },
        },
        {
          key: 'vault-main',
          name: 'Main vault',
          typeKey: 'vault',
          attributes: { branch: 'branch-riverside' },
        },
      ],
    },
  },
  'supply-chain': {
    title: 'Shipment network',
    type: 'SUPPLY_CHAIN',
    definition: {
      entityTypes: [
        { key: 'warehouse-zone', name: 'Warehouse zone' },
        { key: 'shipment', name: 'Shipment' },
      ],
      relationshipTypes: [{ key: 'staged-in', from: 'shipment', to: 'warehouse-zone' }],
      variables: [
        { key: 'dwell-hours', unit: 'h' },
        { key: 'fill-rate', unit: '%' },
        { key: 'exception-count', unit: 'count' },
      ],
      rules: [{ key: 'dwell-breach', expression: 'dwell-hours > 18' }],
      entities: [
        {
          key: 'zone-cold',
          name: 'Cold chain zone',
          typeKey: 'warehouse-zone',
          attributes: { temperatureBand: '2-8C' },
        },
        {
          key: 'shipment-8841',
          name: 'Shipment 8841',
          typeKey: 'shipment',
          attributes: { zone: 'zone-cold', incoterms: 'DAP' },
        },
      ],
    },
  },
  building: {
    title: 'Building systems',
    type: 'BUILDING',
    definition: {
      entityTypes: [
        { key: 'floor', name: 'Floor' },
        { key: 'hvac-zone', name: 'HVAC zone' },
      ],
      relationshipTypes: [{ key: 'serves', from: 'hvac-zone', to: 'floor' }],
      variables: [
        { key: 'temperature', unit: '°C' },
        { key: 'co2', unit: 'ppm' },
        { key: 'occupancy', unit: 'count' },
      ],
      rules: [{ key: 'air-quality', expression: 'co2 > 1200' }],
      entities: [
        { key: 'floor-3', name: 'Floor 3', typeKey: 'floor', attributes: {} },
        { key: 'hvac-3a', name: 'HVAC 3A', typeKey: 'hvac-zone', attributes: { floor: 'floor-3' } },
      ],
    },
  },
  'energy-grid': {
    title: 'Distribution feeder',
    type: 'ENERGY',
    definition: {
      entityTypes: [
        { key: 'feeder', name: 'Feeder' },
        { key: 'substation', name: 'Substation' },
      ],
      relationshipTypes: [{ key: 'fed-from', from: 'feeder', to: 'substation' }],
      variables: [
        { key: 'load-mw', unit: 'MW' },
        { key: 'voltage', unit: 'kV' },
        { key: 'loss-percent', unit: '%' },
      ],
      rules: [{ key: 'overload', expression: 'load-mw > 18' }],
      entities: [
        { key: 'substation-north', name: 'North substation', typeKey: 'substation', attributes: {} },
        { key: 'feeder-12', name: 'Feeder 12', typeKey: 'feeder', attributes: { substation: 'substation-north' } },
      ],
    },
  },
  'data-center': {
    title: 'Data hall',
    type: 'DATA_CENTER',
    definition: {
      entityTypes: [
        { key: 'data-hall', name: 'Data hall' },
        { key: 'rack', name: 'Rack' },
      ],
      relationshipTypes: [{ key: 'installed-in', from: 'rack', to: 'data-hall' }],
      variables: [
        { key: 'inlet-temperature', unit: '°C' },
        { key: 'power-kw', unit: 'kW' },
        { key: 'pue', unit: 'ratio' },
      ],
      rules: [{ key: 'thermal-risk', expression: 'inlet-temperature > 27' }],
      entities: [
        { key: 'hall-a', name: 'Hall A', typeKey: 'data-hall', attributes: {} },
        { key: 'rack-a12', name: 'Rack A12', typeKey: 'rack', attributes: { hall: 'hall-a' } },
      ],
    },
  },
};

const keywordMap: Array<{ industry: Exclude<IndustryKey, 'generic'>; pattern: RegExp }> = [
  { industry: 'airport', pattern: /\b(airport|gate|aircraft|turnaround|runway|flight)\b/i },
  { industry: 'hospital', pattern: /\b(hospital|icu|clinic|patient|bed|oxygen)\b/i },
  { industry: 'banking', pattern: /\b(bank|atm|branch|vault|cash|ledger)\b/i },
  { industry: 'supply-chain', pattern: /\b(shipment|warehouse|logistics|supply.?chain|freight)\b/i },
  { industry: 'building', pattern: /\b(hvac|building|floor|occupancy|co2)\b/i },
  { industry: 'energy-grid', pattern: /\b(grid|feeder|substation|voltage|megawatt)\b/i },
  { industry: 'data-center', pattern: /\b(data.?center|rack|pue|server.?hall)\b/i },
  { industry: 'manufacturing', pattern: /\b(factory|motor|production|manufactur|vibration)\b/i },
];

export function inferIndustry(brief: string, explicit?: IndustryKey): IndustryKey {
  if (explicit && explicit !== 'generic') return explicit;
  return keywordMap.find((entry) => entry.pattern.test(brief))?.industry ?? 'generic';
}

export function genericDefinition(brief: string): TwinDefinition {
  return {
    entityTypes: [
      { key: 'asset', name: 'Asset' },
      { key: 'site', name: 'Site' },
    ],
    relationshipTypes: [{ key: 'located-at', from: 'asset', to: 'site' }],
    variables: [
      { key: 'status-index', unit: 'score' },
      { key: 'utilization', unit: '%' },
    ],
    rules: [{ key: 'utilization-high', expression: 'utilization > 90' }],
    entities: [
      { key: 'primary-site', name: 'Primary site', typeKey: 'site', attributes: { brief } },
      { key: 'primary-asset', name: 'Primary asset', typeKey: 'asset', attributes: { site: 'primary-site' } },
    ],
  };
}
