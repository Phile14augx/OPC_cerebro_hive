'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PulseCard, PulseCardHeader, PulseCardBody, StatusDot, SeverityBadge } from '../../../shared/ui/PulseCard';
import type { StrategicAlert, AlertSeverity } from '../../../shared/lib/types';

/* ── Data fetchers ──────────────────────────────────────────────────────── */
async function fetchAlerts(): Promise<{ alerts: StrategicAlert[]; total: number }> {
  const res = await fetch('/api/alerts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

async function acknowledgeAlert(id: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'acknowledge', id }),
  });
  if (!res.ok) throw new Error('Failed to acknowledge alert');
  return res.json();
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
const CATEGORY_ICON: Record<string, string> = {
  revenue: '◈', operations: '⊛', risk: '◆', people: '◉', security: '⊕', market: '◧',
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SEV_ORDER: AlertSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

export default function AlertsPage() {
  const [selected, setSelected] = useState<StrategicAlert | null>(null);
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all');
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 60_000,
    staleTime: 55_000,
  });

  const mutation = useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: (_, id) => {
      // Optimistically update cached data
      qc.setQueryData<{ alerts: StrategicAlert[]; total: number }>(['alerts'], (old) =>
        old
          ? { ...old, alerts: old.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a) }
          : old
      );
      if (selected?.id === id) setSelected(s => s ? { ...s, acknowledged: true } : s);
    },
  });

  const alerts = data?.alerts ?? [];

  const visible = alerts
    .filter(a => filter === 'all' || a.severity === filter)
    .sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity));

  const unackCount = alerts.filter(a => !a.acknowledged).length;
  const activeSelected = selected && alerts.find(a => a.id === selected.id)
    ? alerts.find(a => a.id === selected.id)!
    : selected;

  if (error) {
    return (
      <div className="p-6">
        <PulseCard status="critical">
          <PulseCardBody>
            <p style={{ color: 'var(--color-text-danger)' }}>Failed to load alerts: {String(error)}</p>
          </PulseCardBody>
        </PulseCard>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 60px)' }}>

      {/* ── Alert list ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 overflow-y-auto flex flex-col"
           style={{ width: 340, borderRight: '1px solid var(--color-border-default)' }}>

        {/* Filter bar */}
        <div className="p-3 space-y-2 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Strategic Alerts
            </p>
            {unackCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-text-danger)', color: '#fff' }}>
                {unackCount} open
              </span>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                      className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                      style={{
                        background: filter === f ? 'var(--color-surface-raised)' : 'transparent',
                        color: filter === f ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        border: `1px solid ${filter === f ? 'var(--color-border-strong)' : 'var(--color-border-subtle)'}`,
                        cursor: 'pointer',
                      }}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Loading alerts…</p>
          )}
          {visible.map(alert => (
            <button key={alert.id} onClick={() => setSelected(alert)}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <PulseCard
                status={alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'degraded' : 'healthy'}
                className={`transition-all ${activeSelected?.id === alert.id ? 'ring-2 ring-[var(--color-brand-primary)]' : ''} ${alert.acknowledged ? 'opacity-50' : ''}`}
              >
                <PulseCardBody className="py-3">
                  <div className="flex items-start gap-2">
                    <StatusDot
                      status={alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'degraded' : 'healthy'}
                      pulse={alert.severity === 'critical' && !alert.acknowledged}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {alert.isNew && !alert.acknowledged && (
                          <span className="text-xs font-bold px-1.5 py-0 rounded"
                                style={{ background: 'var(--color-brand-subtle)', color: 'var(--color-brand-secondary)' }}>
                            NEW
                          </span>
                        )}
                        <SeverityBadge severity={alert.severity} />
                      </div>
                      <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                        {alert.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {CATEGORY_ICON[alert.category]} {alert.category}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>· {relativeTime(alert.raisedAt)}</span>
                      </div>
                    </div>
                  </div>
                </PulseCardBody>
              </PulseCard>
            </button>
          ))}
          {!isLoading && visible.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              No {filter === 'all' ? '' : filter + ' '}alerts found.
            </p>
          )}
        </div>
      </div>

      {/* ── Alert detail ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSelected ? (
          <AlertDetail
            alert={activeSelected}
            onAcknowledge={() => mutation.mutate(activeSelected.id)}
            acknowledging={mutation.isPending}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Select an alert to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertDetail({
  alert,
  onAcknowledge,
  acknowledging,
}: {
  alert: StrategicAlert;
  onAcknowledge: () => void;
  acknowledging: boolean;
}) {
  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <SeverityBadge severity={alert.severity} />
          <span className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}>
            {CATEGORY_ICON[alert.category]} {alert.category}
          </span>
          {alert.acknowledged && (
            <span className="text-xs px-2 py-0.5 rounded"
                  style={{ background: 'rgba(34,197,94,0.10)', color: 'var(--color-text-success)' }}>
              ✓ Acknowledged
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{alert.title}</h1>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Raised {relativeTime(alert.raisedAt)} · Source: {alert.source}
        </p>
      </div>

      {/* Summary */}
      <PulseCard>
        <PulseCardHeader>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Alert Summary</span>
        </PulseCardHeader>
        <PulseCardBody>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{alert.summary}</p>
        </PulseCardBody>
      </PulseCard>

      {/* Recommended actions */}
      {alert.actions.length > 0 && (
        <PulseCard>
          <PulseCardHeader>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Claude Recommended Actions
            </span>
          </PulseCardHeader>
          <PulseCardBody className="space-y-2.5">
            {alert.actions.map((action, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-[var(--radius-md)]"
                   style={{ background: 'var(--color-surface-subtle)' }}>
                <span className="flex-shrink-0 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--color-brand-primary)', color: '#fff' }}>
                  {i + 1}
                </span>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{action}</p>
              </div>
            ))}
          </PulseCardBody>
        </PulseCard>
      )}

      {/* Acknowledge button */}
      {!alert.acknowledged && (
        <button
          onClick={onAcknowledge}
          disabled={acknowledging}
          className="w-full py-3 text-sm font-semibold rounded-[var(--radius-lg)] transition-all"
          style={{
            background: acknowledging ? 'var(--color-surface-raised)' : 'var(--color-brand-primary)',
            color: '#fff',
            border: 'none',
            cursor: acknowledging ? 'wait' : 'pointer',
            opacity: acknowledging ? 0.7 : 1,
          }}
        >
          {acknowledging ? 'Acknowledging…' : 'Acknowledge Alert'}
        </button>
      )}
    </div>
  );
}
