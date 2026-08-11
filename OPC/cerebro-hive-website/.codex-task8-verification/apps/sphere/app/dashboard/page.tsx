'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  SphereCard, SphereCardHeader, SphereCardBody,
  StatusDot, SeverityBadge, TrendBadge, MetricTile, ProgressBar, AIBadge, Skeleton,
} from '../../shared/ui/SphereCard';
import { useRole } from '../../shared/ui/AppShell';
import { ROLE_PROFILES } from '../../shared/lib/role-config';
import type { DashboardData, RoleNarrative, ProductHealth } from '../../shared/lib/types';

/* ── Fetchers ────────────────────────────────────────────────────────────── */
async function fetchDashboard(): Promise<DashboardData & { cached: boolean }> {
  const res = await fetch('/api/dashboard', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Dashboard API ${res.status}`);
  return res.json();
}

async function fetchNarrative(role: string): Promise<{ narrative: RoleNarrative }> {
  const res = await fetch('/api/narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(`Narrative API ${res.status}`);
  return res.json();
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const STATUS_COLOR = { healthy: 'var(--status-healthy)', degraded: 'var(--status-degraded)', critical: 'var(--status-critical)', unknown: 'var(--status-unknown)', offline: 'var(--status-offline)' } as const;
const LAYER_COLOR  = { command: 'var(--brand-core)', business: '#a78bfa', intelligence: '#38bdf8', agent: '#34d399', data: '#fb923c', infra: '#6b7280' } as const;
const LAYER_LABEL  = { command: 'Command', business: 'Business', intelligence: 'Intel', agent: 'Agent', data: 'Data', infra: 'Infra' } as const;

function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  return `${Math.floor(d / 3_600_000)}h ago`;
}

/* ── Product mini-chip ────────────────────────────────────────────────────── */
function ProductChip({ p }: { p: ProductHealth }) {
  const color = STATUS_COLOR[p.status];
  return (
    <div
      className="sphere-card interactive"
      title={`${p.name} — ${p.status}`}
      style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 7 }}
    >
      <StatusDot status={p.status} />
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.name}</span>
      <AIBadge ai={p.primaryAI} />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { role } = useRole();
  const profile   = ROLE_PROFILES[role];

  const { data: dash, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 20_000,
    staleTime: 15_000,
  });

  const narrativeMutation = useMutation({ mutationFn: (r: string) => fetchNarrative(r) });
  const narrative = narrativeMutation.data?.narrative;

  // Refresh narrative when role changes
  useEffect(() => { narrativeMutation.mutate(role); }, [role]);// eslint-disable-line react-hooks/exhaustive-deps

  const platform   = dash?.platform;
  const alerts     = (dash?.alerts ?? []).filter(a => !a.acknowledged);
  const topKPIs    = (dash?.kpis ?? []).slice(0, 8);
  const products   = dash?.products ?? [];
  const workflows  = (dash?.workflows ?? []).slice(0, 6);
  const finops     = dash?.finops;

  const criticals  = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1600, margin: '0 auto' }} className="fade-in">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            <span className="gradient-brand">CerebroSphere</span> — Unified AEOS Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {profile.label} view · {platform ? relTime(platform.calculatedAt) : 'Loading…'}
            {dash?.cached && <span style={{ marginLeft: 8, color: 'var(--brand-bright)' }}>· cached</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/dashboard/agents" style={{ fontSize: 12, padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', textDecoration: 'none', border: '1px solid var(--border-default)' }}>Agent Fleet →</a>
          <a href="/dashboard/products" style={{ fontSize: 12, padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', textDecoration: 'none', border: '1px solid var(--border-default)' }}>Product Grid →</a>
          <a href="/dashboard/alerts" style={{ fontSize: 12, padding: '8px 14px', borderRadius: 'var(--radius-md)', background: criticals > 0 ? 'rgba(239,68,68,0.10)' : 'var(--bg-elevated)', color: criticals > 0 ? 'var(--status-critical)' : 'var(--text-secondary)', textDecoration: 'none', border: `1px solid ${criticals > 0 ? 'rgba(239,68,68,0.3)' : 'var(--border-default)'}` }}>
            {criticals > 0 ? `◆ ${criticals} Critical` : 'Alerts →'}
          </a>
        </div>
      </div>

      {/* ── Row 1: Platform KPIs ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {dashLoading ? Array.from({ length: 6 }).map((_, i) => (
          <SphereCard key={i}><SphereCardBody><Skeleton height={56} /></SphereCardBody></SphereCard>
        )) : platform && [
          { label: 'Platform Status', value: platform.overallStatus.toUpperCase(), color: STATUS_COLOR[platform.overallStatus] },
          { label: 'Uptime', value: `${platform.uptimePct.toFixed(2)}%`, color: platform.uptimePct >= 99 ? 'var(--status-healthy)' : 'var(--status-degraded)' },
          { label: 'Active Agents', value: platform.activeAgents.toLocaleString(), color: 'var(--brand-bright)' },
          { label: 'Exec / min', value: platform.executionsPerMin.toFixed(1), color: 'var(--text-primary)' },
          { label: 'Avg Latency', value: `${platform.avgLatencyMs}ms`, color: platform.avgLatencyMs < 300 ? 'var(--status-healthy)' : 'var(--status-degraded)' },
          { label: 'Cost Burn', value: `$${platform.costBurnRateHr.toFixed(2)}/hr`, color: 'var(--accent-gold)' },
        ].map(m => (
          <SphereCard key={m.label}>
            <SphereCardBody>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{m.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: m.color, lineHeight: 1 }}>{m.value}</p>
            </SphereCardBody>
          </SphereCard>
        ))}
      </div>

      {/* ── Row 2: AI Narrative + Alert feed ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* Claude narrative */}
        <SphereCard glowColor={profile.color}>
          <SphereCardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AIBadge ai="claude" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                {profile.label} Intelligence Brief
              </span>
            </div>
            <button
              onClick={() => narrativeMutation.mutate(role)}
              disabled={narrativeMutation.isPending}
              style={{ fontSize: 11, padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-subtle)', color: 'var(--brand-bright)', border: '1px solid var(--brand-glow)', cursor: 'pointer' }}
            >
              {narrativeMutation.isPending ? 'Generating…' : '↻ Refresh'}
            </button>
          </SphereCardHeader>
          <SphereCardBody>
            {narrativeMutation.isPending ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Skeleton height={22} width="70%" />
                <Skeleton height={14} />
                <Skeleton height={14} width="90%" />
                <Skeleton height={14} width="80%" />
              </div>
            ) : narrative ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {narrative.headline}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {narrative.summary}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: profile.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Action Items</p>
                    <ol style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {narrative.topActions.map((a, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ color: profile.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                          {a}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-degraded)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Watch Items</p>
                    <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {narrative.watchItems.map((w, i) => (
                        <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⚠ {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Generated by Claude · {relTime(narrative.generatedAt)}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No narrative yet. Click Refresh to generate.</p>
            )}
          </SphereCardBody>
        </SphereCard>

        {/* Alert feed */}
        <SphereCard>
          <SphereCardHeader>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              Active Alerts
              {alerts.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: 'var(--status-critical)' }}>
                  {alerts.length}
                </span>
              )}
            </span>
            <a href="/dashboard/alerts" style={{ fontSize: 11, color: 'var(--brand-bright)', textDecoration: 'none' }}>View all →</a>
          </SphereCardHeader>
          <SphereCardBody style={{ padding: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dashLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={48} />) :
               alerts.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>✓ No active alerts</p>
               ) : alerts.slice(0, 6).map(a => (
                <div key={a.id} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <SeverityBadge severity={a.severity} />
                    {a.isNew && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-bright)' }}>NEW</span>}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>{a.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{a.source} · {relTime(a.raisedAt)}</p>
                </div>
               ))}
            </div>
          </SphereCardBody>
        </SphereCard>
      </div>

      {/* ── Row 3: KPIs ─────────────────────────────────────────────── */}
      {topKPIs.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Business KPIs</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {topKPIs.map(k => (
              <SphereCard key={k.id}>
                <SphereCardBody>
                  <MetricTile
                    label={k.label}
                    value={k.formatted}
                    color="var(--text-primary)"
                    trend={<TrendBadge value={k.delta} formatted={k.deltaFormatted} inverted={k.category === 'risk'} />}
                  />
                </SphereCardBody>
              </SphereCard>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 4: Product grid (mini) + Workflows ───────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* Product mini grid */}
        <SphereCard>
          <SphereCardHeader>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>AEOS Product Health</span>
            <a href="/dashboard/products" style={{ fontSize: 11, color: 'var(--brand-bright)', textDecoration: 'none' }}>Full grid →</a>
          </SphereCardHeader>
          <SphereCardBody>
            {/* Group by layer */}
            {(['command', 'business', 'intelligence', 'agent', 'data', 'infra'] as const).map(layer => {
              const layerProducts = products.filter(p => p.layer === layer);
              if (!layerProducts.length) return null;
              return (
                <div key={layer} style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: LAYER_COLOR[layer], textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                    {LAYER_LABEL[layer]}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {layerProducts.map(p => <ProductChip key={p.id} p={p} />)}
                  </div>
                </div>
              );
            })}
          </SphereCardBody>
        </SphereCard>

        {/* Workflow activity */}
        <SphereCard>
          <SphereCardHeader>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Workflow Activity</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{workflows.filter(w => w.status === 'running').length} running</span>
          </SphereCardHeader>
          <SphereCardBody style={{ padding: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dashLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={52} />) :
               workflows.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No recent workflows.</p>
               ) : workflows.map(w => {
                const statusColor = w.status === 'running' ? 'var(--brand-bright)' : w.status === 'completed' ? 'var(--status-healthy)' : w.status === 'failed' ? 'var(--status-critical)' : 'var(--text-muted)';
                const progress = w.stepsTotal > 0 ? (w.stepsCompleted / w.stepsTotal) * 100 : 0;
                return (
                  <div key={w.id} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{w.name}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, textTransform: 'uppercase' }}>{w.status}</span>
                    </div>
                    {w.stepsTotal > 0 && (
                      <>
                        <ProgressBar value={progress} color={statusColor} />
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                          {w.stepsCompleted}/{w.stepsTotal} steps · {relTime(w.startedAt)}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </SphereCardBody>
        </SphereCard>
      </div>

      {/* ── Row 5: FinOps ───────────────────────────────────────────── */}
      {finops && (
        <SphereCard>
          <SphereCardHeader>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>FinOps — AI Cost Intelligence</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top spender: <strong style={{ color: 'var(--accent-gold)' }}>{finops.topSpender}</strong></span>
          </SphereCardHeader>
          <SphereCardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, alignItems: 'center' }}>
              <MetricTile label="Today" value={`$${finops.costTodayUsd.toFixed(2)}`} color="var(--text-primary)" />
              <MetricTile label="Month-to-date" value={`$${finops.costMtdUsd.toFixed(0)}`} color="var(--accent-gold)" />
              <MetricTile label="Projected Month" value={`$${finops.costProjectedMonthUsd.toFixed(0)}`} color="var(--text-secondary)" />
              <MetricTile label="Budget" value={`$${finops.budgetMonthUsd.toLocaleString()}`} color="var(--text-muted)" />
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Budget Used — {finops.budgetUsedPct.toFixed(1)}%</p>
                <ProgressBar
                  value={finops.budgetUsedPct}
                  color={finops.budgetUsedPct > 90 ? 'var(--status-critical)' : finops.budgetUsedPct > 70 ? 'var(--status-degraded)' : 'var(--status-healthy)'}
                  height={8}
                />
              </div>
            </div>
          </SphereCardBody>
        </SphereCard>
      )}
    </div>
  );
}
