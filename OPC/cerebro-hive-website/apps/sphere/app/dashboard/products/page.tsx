'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SphereCard, SphereCardBody, StatusDot, AIBadge, ProgressBar, Skeleton } from '../../../shared/ui/SphereCard';
import type { DashboardData, ProductHealth } from '../../../shared/lib/types';

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

type LayerFilter = ProductHealth['layer'] | 'all';

const LAYER_COLOR  = { command: '#6366f1', business: '#a78bfa', intelligence: '#38bdf8', agent: '#34d399', data: '#fb923c', infra: '#6b7280' } as const;
const LAYER_LABEL  = { command: 'Command & Control', business: 'Business Apps', intelligence: 'Intelligence', agent: 'Agent Execution', data: 'Data & Knowledge', infra: 'Infrastructure' } as const;
const STATUS_COLOR = { healthy: 'var(--status-healthy)', degraded: 'var(--status-degraded)', critical: 'var(--status-critical)', unknown: 'var(--status-unknown)', offline: 'var(--status-offline)' } as const;

export default function ProductsPage() {
  const [layer, setLayer] = useState<LayerFilter>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });

  const all = data?.products ?? [];
  const filtered = layer === 'all' ? all : all.filter(p => p.layer === layer);

  const healthy  = all.filter(p => p.status === 'healthy').length;
  const degraded = all.filter(p => p.status === 'degraded').length;
  const critical = all.filter(p => p.status === 'critical').length;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1600, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AEOS Product Health Grid</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          All 50 AEOS products · {healthy} healthy · {degraded} degraded · {critical} critical
        </p>
      </div>

      {/* Status summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Healthy', value: healthy,  color: 'var(--status-healthy)' },
          { label: 'Degraded', value: degraded, color: 'var(--status-degraded)' },
          { label: 'Critical', value: critical,  color: critical > 0 ? 'var(--status-critical)' : 'var(--text-muted)' },
        ].map(s => (
          <SphereCard key={s.label}>
            <SphereCardBody style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatusDot status={s.label.toLowerCase() as 'healthy'} size={12} />
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              </div>
            </SphereCardBody>
          </SphereCard>
        ))}
      </div>

      {/* Layer filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['all', 'command', 'business', 'intelligence', 'agent', 'data', 'infra'] as LayerFilter[]).map(l => (
          <button key={l} onClick={() => setLayer(l)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
              background: layer === l ? (l === 'all' ? 'var(--brand-subtle)' : `${LAYER_COLOR[l as keyof typeof LAYER_COLOR]}20`) : 'transparent',
              color: layer === l ? (l === 'all' ? 'var(--brand-bright)' : LAYER_COLOR[l as keyof typeof LAYER_COLOR]) : 'var(--text-muted)',
              border: `1px solid ${layer === l ? (l === 'all' ? 'var(--brand-glow)' : `${LAYER_COLOR[l as keyof typeof LAYER_COLOR]}40`) : 'var(--border-default)'}`,
              fontWeight: layer === l ? 600 : 400,
            }}>
            {l === 'all' ? 'All Layers' : LAYER_LABEL[l as keyof typeof LAYER_LABEL]}
          </button>
        ))}
      </div>

      {/* Product grid — by layer */}
      {layer === 'all'
        ? (['command', 'business', 'intelligence', 'agent', 'data', 'infra'] as ProductHealth['layer'][]).map(lyr => {
            const layerProducts = filtered.filter(p => p.layer === lyr);
            if (!layerProducts.length) return null;
            return (
              <div key={lyr}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 3, height: 16, background: LAYER_COLOR[lyr], borderRadius: 2 }} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: LAYER_COLOR[lyr], textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{LAYER_LABEL[lyr]}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {layerProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            );
          })
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <SphereCard key={i}><SphereCardBody><Skeleton height={80} /></SphereCardBody></SphereCard>)
              : filtered.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        )
      }
    </div>
  );
}

function ProductCard({ product: p }: { product: ProductHealth }) {
  const color = STATUS_COLOR[p.status] as string;
  return (
    <SphereCard interactive glowColor={p.status === 'critical' ? 'var(--status-critical)' : undefined}>
      <SphereCardBody>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot status={p.status} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
          </div>
          <AIBadge ai={p.primaryAI} />
        </div>
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Uptime</span>
            <span style={{ fontSize: 10, fontWeight: 600, color }}>{p.uptimePct.toFixed(1)}%</span>
          </div>
          <ProgressBar value={p.uptimePct} color={color} height={3} />
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>
          {p.status} · {p.layer}
        </p>
      </SphereCardBody>
    </SphereCard>
  );
}
