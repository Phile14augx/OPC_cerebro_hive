'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SphereCard, SphereCardBody, StatusDot, ProgressBar, Skeleton } from '../../../shared/ui/SphereCard';
import type { DashboardData, AgentSummary } from '../../../shared/lib/types';

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

type AgentStatus = AgentSummary['status'] | 'all';

function relTime(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  return `${Math.floor(d / 3_600_000)}h ago`;
}

const STATUS_MAP = { active: 'healthy', idle: 'unknown', error: 'critical', offline: 'offline' } as const;

export default function AgentsPage() {
  const [filter, setFilter] = useState<AgentStatus>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 15_000,
    staleTime: 12_000,
  });

  const agents = (data?.agents ?? [])
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  const activeCount  = data?.agents.filter(a => a.status === 'active').length ?? 0;
  const errorCount   = data?.agents.filter(a => a.status === 'error').length ?? 0;
  const totalExecs   = data?.agents.reduce((s, a) => s + a.executionsLast24h, 0) ?? 0;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Agent Fleet</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Live view of all AEOS agents and their execution stats</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Agents',       value: data?.agents.length ?? 0,  color: 'var(--text-primary)' },
          { label: 'Active Now',         value: activeCount,                color: 'var(--status-healthy)' },
          { label: 'Errors',             value: errorCount,                 color: errorCount > 0 ? 'var(--status-critical)' : 'var(--text-muted)' },
          { label: 'Executions (24h)',   value: totalExecs.toLocaleString(), color: 'var(--brand-bright)' },
        ].map(s => (
          <SphereCard key={s.label}>
            <SphereCardBody>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
            </SphereCardBody>
          </SphereCard>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search agents…"
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: 240 }}
        />
        {(['all', 'active', 'idle', 'error', 'offline'] as AgentStatus[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: filter === f ? 'var(--brand-subtle)' : 'transparent',
              color: filter === f ? 'var(--brand-bright)' : 'var(--text-muted)',
              border: `1px solid ${filter === f ? 'var(--brand-glow)' : 'var(--border-default)'}`,
            }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Agent grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SphereCard key={i}><SphereCardBody><Skeleton height={100} /></SphereCardBody></SphereCard>)
          : agents.map(agent => (
            <SphereCard key={agent.id} interactive>
              <SphereCardBody>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusDot status={STATUS_MAP[agent.status]} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{agent.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{agent.type}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_MAP[agent.status] === 'healthy' ? 'var(--status-healthy)' : STATUS_MAP[agent.status] === 'critical' ? 'var(--status-critical)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {agent.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Success Rate</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: agent.successRate >= 95 ? 'var(--status-healthy)' : agent.successRate >= 80 ? 'var(--status-degraded)' : 'var(--status-critical)' }}>
                        {agent.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={agent.successRate}
                      color={agent.successRate >= 95 ? 'var(--status-healthy)' : agent.successRate >= 80 ? 'var(--status-degraded)' : 'var(--status-critical)'}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>Executions (24h)</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{agent.executionsLast24h.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>Avg Latency</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{agent.avgLatencyMs}ms</p>
                    </div>
                  </div>

                  <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>Last active: {relTime(agent.lastActiveAt)}</p>
                </div>
              </SphereCardBody>
            </SphereCard>
          ))}
        {!isLoading && agents.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
            No agents match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
