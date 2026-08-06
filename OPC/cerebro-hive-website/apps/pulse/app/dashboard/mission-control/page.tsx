'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PulseCard, PulseCardHeader, PulseCardBody,
  StatusDot, TrendBadge, SeverityBadge,
  STATUS_COLOR,
} from '../../../shared/ui/PulseCard';
import type { EnterpriseHealthScore, PillarScore, StrategicAlert } from '../../../shared/lib/types';

/* ── Data fetchers ──────────────────────────────────────────────────────── */
async function fetchHealth(): Promise<{ health: EnterpriseHealthScore; pillars: PillarScore[] }> {
  const res = await fetch('/api/health', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch health score');
  return res.json();
}

async function fetchAlerts(): Promise<{ alerts: StrategicAlert[]; total: number }> {
  const res = await fetch('/api/alerts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function fmt(ts: string) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/* ── Mission Control page ─────────────────────────────────────────────────── */
export default function MissionControlPage() {
  const [activePillar, setActivePillar] = useState<string | null>(null);

  const { data: healthData, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });

  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 60_000,
    staleTime: 55_000,
  });

  // SSE for live health updates
  useEffect(() => {
    const es = new EventSource('/api/stream/health');
    es.addEventListener('health', () => {
      // TanStack Query will re-fetch from the cache bust; just refetch on event
      // (Could also directly update query cache, but re-fetch keeps it simple)
    });
    return () => es.close();
  }, []);

  const health = healthData?.health;
  const pillars = healthData?.pillars ?? [];
  const criticalAlerts = (alertsData?.alerts ?? []).filter(a => !a.acknowledged);
  const pillar = activePillar ? pillars.find(p => p.id === activePillar) : null;

  const scoreColor = !health ? 'var(--color-text-muted)'
    : health.score >= 80 ? 'var(--color-text-success)'
    : health.score >= 60 ? 'var(--color-text-warning)'
    : 'var(--color-text-danger)';

  if (healthError) {
    return (
      <div className="p-6">
        <PulseCard status="critical">
          <PulseCardBody>
            <p style={{ color: 'var(--color-text-danger)' }}>
              Failed to load health data: {String(healthError)}
            </p>
          </PulseCardBody>
        </PulseCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Page title ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Mission Control
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Real-time enterprise health
            {health ? ` · Last updated ${fmt(health.calculatedAt)}` : healthLoading ? ' · Loading…' : ''}
          </p>
        </div>
        <a
          href="/dashboard/briefings"
          className="text-sm font-medium px-4 py-2 rounded-[var(--radius-md)] transition-all"
          style={{
            background: 'var(--color-brand-subtle)',
            color: 'var(--color-brand-secondary)',
            border: '1px solid var(--color-brand-primary)',
            textDecoration: 'none',
          }}
        >
          View Latest Brief →
        </a>
      </div>

      {/* ── Row 1: Health score + active alerts ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Enterprise Health Score */}
        <div className="lg:col-span-1">
          <PulseCard status={health?.status ?? 'unknown'} className="h-full">
            <PulseCardBody className="flex flex-col items-center justify-center py-8 gap-4">
              {healthLoading ? (
                <div className="text-center" style={{ color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: 14 }}>Computing health score…</div>
                </div>
              ) : health ? (
                <>
                  {/* Score ring */}
                  <div
                    className="health-ring-pulse"
                    style={{
                      width: 140, height: 140, borderRadius: '50%',
                      border: `4px solid ${scoreColor}`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      background: `radial-gradient(circle, ${scoreColor}10, transparent 70%)`,
                    }}
                  >
                    <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: scoreColor }}>
                      {health.score}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>/100</span>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                      Enterprise Health
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <StatusDot status={health.status} />
                      <span className="text-sm capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                        {health.status}
                      </span>
                      <TrendBadge delta={health.delta} deltaFormatted={`${health.delta > 0 ? '+' : ''}${health.delta}pts`} />
                    </div>
                  </div>

                  <div className="w-full space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                      Primary Drivers
                    </p>
                    {health.primaryDrivers.map((d, i) => (
                      <p key={i} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        · {d}
                      </p>
                    ))}
                  </div>
                </>
              ) : null}
            </PulseCardBody>
          </PulseCard>
        </div>

        {/* Active Alerts Summary */}
        <div className="lg:col-span-2">
          <PulseCard className="h-full">
            <PulseCardHeader>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Active Strategic Alerts
                  {alertsData && (
                    <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>
                      ({alertsData.total})
                    </span>
                  )}
                </span>
                <a href="/dashboard/alerts" className="text-xs" style={{ color: 'var(--color-brand-secondary)', textDecoration: 'none' }}>
                  View all →
                </a>
              </div>
            </PulseCardHeader>
            <PulseCardBody className="space-y-3 py-3">
              {alertsLoading && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  Loading alerts…
                </p>
              )}
              {!alertsLoading && criticalAlerts.slice(0, 4).map(alert => (
                <a key={alert.id} href="/dashboard/alerts" style={{ textDecoration: 'none' }}>
                  <div
                    className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] transition-all"
                    style={{ background: 'var(--color-surface-subtle)', cursor: 'pointer' }}
                  >
                    <StatusDot
                      status={alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'degraded' : 'healthy'}
                      pulse={alert.severity === 'critical'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {alert.title}
                        </span>
                        {alert.isNew && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                                style={{ background: 'var(--color-brand-subtle)', color: 'var(--color-brand-secondary)' }}>
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
                        {alert.summary}
                      </p>
                    </div>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                </a>
              ))}
              {!alertsLoading && criticalAlerts.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  ✓ No active alerts
                </p>
              )}
            </PulseCardBody>
          </PulseCard>
        </div>
      </div>

      {/* ── Row 2: Pillar scores ────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Business Pillars
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {healthLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <PulseCard key={i} status="unknown">
                  <PulseCardBody>
                    <div style={{ height: 80, background: 'var(--color-surface-subtle)', borderRadius: 4 }} />
                  </PulseCardBody>
                </PulseCard>
              ))
            : pillars.map(p => (
                <PillarCard
                  key={p.id}
                  pillar={p}
                  isActive={activePillar === p.id}
                  onClick={() => setActivePillar(activePillar === p.id ? null : p.id)}
                />
              ))
          }
        </div>
      </div>

      {/* ── Row 3: Pillar KPI drill-down ───────────────────────────────── */}
      {pillar && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              {pillar.label} — KPI Detail
            </h2>
            <button
              onClick={() => setActivePillar(null)}
              className="text-xs"
              style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {pillar.kpis.map(kpi => (
              <PulseCard key={kpi.id} status={kpi.status}>
                <PulseCardBody>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: STATUS_COLOR[kpi.status] }}>
                    {kpi.formatted}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendBadge delta={kpi.delta} deltaFormatted={kpi.deltaFormatted} />
                    {kpi.targetFormatted && (
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Target: {kpi.targetFormatted}
                      </span>
                    )}
                  </div>
                </PulseCardBody>
              </PulseCard>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 4: Quick actions ────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Generate Board Brief', href: '/dashboard/briefings', icon: '◈', color: 'var(--color-brand-primary)' },
            { label: 'Run Scenario Model', href: '/dashboard/scenarios', icon: '◧', color: 'var(--color-text-info)' },
            { label: 'Acknowledge Alerts', href: '/dashboard/alerts', icon: '◆', color: 'var(--color-text-warning)' },
            { label: 'Activate War Room', href: '/dashboard/war-room', icon: '⊕', color: 'var(--color-text-danger)' },
          ].map(action => (
            <a
              key={action.href}
              href={action.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface-default)',
                border: '1px solid var(--color-border-default)',
                textDecoration: 'none', transition: 'all 150ms',
              }}
            >
              <span style={{ fontSize: 20, color: action.color }}>{action.icon}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── PillarCard sub-component ──────────────────────────────────────────────── */
function PillarCard({ pillar, isActive, onClick }: { pillar: PillarScore; isActive: boolean; onClick: () => void }) {
  const color = STATUS_COLOR[pillar.status];
  return (
    <PulseCard
      status={pillar.status}
      onClick={onClick}
      className={isActive ? 'ring-2 ring-[var(--color-brand-primary)]' : ''}
    >
      <PulseCardBody>
        <div className="flex items-center justify-between mb-2">
          <StatusDot status={pillar.status} />
          <TrendBadge delta={pillar.delta} deltaFormatted={`${pillar.delta > 0 ? '+' : ''}${pillar.delta}`} />
        </div>
        <div className="mb-3">
          <div className="flex justify-between items-baseline mb-1">
            <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{pillar.score}</span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/100</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--color-border-default)' }}>
            <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${pillar.score}%`, background: color }} />
          </div>
        </div>
        <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{pillar.label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {pillar.kpis.length} KPIs · Click to expand
        </p>
      </PulseCardBody>
    </PulseCard>
  );
}
