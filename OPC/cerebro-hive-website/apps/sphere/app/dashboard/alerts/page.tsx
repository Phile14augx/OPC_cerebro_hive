'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SphereCard, SphereCardBody, SeverityBadge, Skeleton } from '../../../shared/ui/SphereCard';
import type { DashboardData, AlertSeverity } from '../../../shared/lib/types';

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

async function acknowledge(id: string): Promise<void> {
  // Route through HivePulse's /api/alerts endpoint for acknowledge
  const base = process.env.NEXT_PUBLIC_PULSE_URL ?? 'http://localhost:3403';
  await fetch(`${base}/api/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'acknowledge', id }),
  });
}

function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  return `${Math.floor(d / 3_600_000)}h ago`;
}

const SEV_ORDER: AlertSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });

  const mutation = useMutation({
    mutationFn: acknowledge,
    onSuccess: (_, id) => {
      qc.setQueryData<DashboardData>(['dashboard'], (old) =>
        old ? { ...old, alerts: old.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a) } : old
      );
    },
  });

  const alerts = (data?.alerts ?? [])
    .filter(a => filter === 'all' || a.severity === filter)
    .sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity));

  const unack = (data?.alerts ?? []).filter(a => !a.acknowledged).length;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Unified Alert Feed</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {unack} unacknowledged · across all AEOS products
          </p>
        </div>
        {unack > 0 && (
          <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.12)', color: 'var(--status-critical)', border: '1px solid rgba(239,68,68,0.25)' }}>
            ◆ {unack} Open
          </span>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
              background: filter === f ? 'var(--bg-elevated)' : 'transparent',
              color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
              border: `1px solid ${filter === f ? 'var(--border-strong)' : 'var(--border-default)'}`,
              fontWeight: filter === f ? 600 : 400,
            }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading ? Array.from({ length: 5 }).map((_, i) => (
          <SphereCard key={i}><SphereCardBody><Skeleton height={70} /></SphereCardBody></SphereCard>
        )) : alerts.length === 0 ? (
          <SphereCard>
            <SphereCardBody style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>✓ No {filter !== 'all' ? filter : ''} alerts.</p>
            </SphereCardBody>
          </SphereCard>
        ) : alerts.map(a => (
          <SphereCard
            key={a.id}
            glowColor={a.severity === 'critical' && !a.acknowledged ? 'rgba(239,68,68,0.3)' : undefined}
            style={{ opacity: a.acknowledged ? 0.55 : 1 }}
          >
            <SphereCardBody style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <SeverityBadge severity={a.severity} />
                    {a.isNew && !a.acknowledged && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--brand-subtle)', color: 'var(--brand-bright)' }}>NEW</span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{a.category}</span>
                    {a.acknowledged && <span style={{ fontSize: 11, color: 'var(--status-healthy)' }}>✓ Acknowledged</span>}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{a.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{a.summary}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>
                    {a.source} · {relTime(a.raisedAt)}
                  </p>
                </div>
                {!a.acknowledged && (
                  <button
                    onClick={() => mutation.mutate(a.id)}
                    disabled={mutation.isPending}
                    style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </SphereCardBody>
          </SphereCard>
        ))}
      </div>
    </div>
  );
}
