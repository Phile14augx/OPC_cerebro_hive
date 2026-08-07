/**
 * HivePulse — Alert mapper
 * Converts raw Prisma Alert + Incident rows to StrategicAlert shape.
 * Claude enriches the `actions` field; this module handles structural mapping.
 */
import type { StrategicAlert, AlertSeverity } from './types';

/* ── Prisma row shapes (subset of full model) ────────────────────────────── */
export interface RawAlert {
  id: string;
  title: string;
  message: string;
  severity: string;   // e.g. 'WARNING', 'CRITICAL', 'INFO'
  status: string;     // e.g. 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'
  source: string;
  category?: string | null;
  pillar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawIncident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  service?: string | null;
  createdAt: Date;
}

/* ── Severity mapping ───────────────────────────────────────────────────── */
const SEVERITY_MAP: Record<string, AlertSeverity> = {
  CRITICAL:   'critical',
  HIGH:       'high',
  WARNING:    'high',
  MEDIUM:     'medium',
  LOW:        'low',
  INFO:       'info',
  WARN:       'medium',
};

function mapSeverity(raw: string): AlertSeverity {
  return SEVERITY_MAP[raw.toUpperCase()] ?? 'info';
}

/* ── Category mapping ───────────────────────────────────────────────────── */
type AlertCategory = StrategicAlert['category'];

const CATEGORY_MAP: Record<string, AlertCategory> = {
  revenue:    'revenue',
  sales:      'revenue',
  finance:    'revenue',
  operations: 'operations',
  ops:        'operations',
  infra:      'operations',
  risk:       'risk',
  compliance: 'risk',
  people:     'people',
  hr:         'people',
  security:   'security',
  auth:       'security',
  market:     'market',
  product:    'market',
};

function mapCategory(raw?: string | null): AlertCategory {
  if (!raw) return 'operations';
  return CATEGORY_MAP[raw.toLowerCase()] ?? 'operations';
}

/* ── Recency check ──────────────────────────────────────────────────────── */
function isNew(date: Date): boolean {
  const hours = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  return hours < 4;
}

/* ── Mappers ────────────────────────────────────────────────────────────── */
export function mapAlertRow(
  row: RawAlert,
  enrichedActions: string[] = []
): StrategicAlert {
  return {
    id: row.id,
    title: row.title,
    summary: row.message,
    severity: mapSeverity(row.severity),
    category: mapCategory(row.category),
    isNew: isNew(row.createdAt),
    raisedAt: row.createdAt.toISOString(),
    source: row.source ?? 'HiveAlert',
    actions: enrichedActions,
    pillar: row.pillar ?? undefined,
    acknowledged: row.status === 'ACKNOWLEDGED',
  };
}

export function mapIncidentRow(
  row: RawIncident,
  enrichedActions: string[] = []
): StrategicAlert {
  return {
    id: `incident-${row.id}`,
    title: `[Incident] ${row.title}`,
    summary: row.description,
    severity: mapSeverity(row.severity),
    category: mapCategory(row.service),
    isNew: isNew(row.createdAt),
    raisedAt: row.createdAt.toISOString(),
    source: 'HiveIncident',
    actions: enrichedActions,
    acknowledged: row.status !== 'OPEN',
  };
}
