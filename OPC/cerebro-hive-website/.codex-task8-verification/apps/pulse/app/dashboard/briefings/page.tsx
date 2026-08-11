'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PulseCard, PulseCardHeader, PulseCardBody, TrendBadge,
} from '../../../shared/ui/PulseCard';
import type { Briefing, BriefingType } from '../../../shared/lib/types';

/* ── Data fetchers ──────────────────────────────────────────────────────── */
async function fetchBriefings(): Promise<{ briefings: Briefing[] }> {
  const res = await fetch('/api/briefings', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch briefings');
  return res.json();
}

async function generateBriefing(type: BriefingType): Promise<{ briefing: Briefing }> {
  const res = await fetch('/api/briefings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Failed to generate briefing');
  }
  return res.json();
}

const TYPE_LABEL: Record<string, string> = {
  daily: 'Daily Brief', weekly: 'Weekly Board Brief',
  monthly: 'Monthly Report', quarterly: 'QBR', board: 'Board Pack',
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SENTIMENT_COLOR = { positive: 'var(--color-text-success)', negative: 'var(--color-text-danger)', neutral: 'var(--color-text-muted)' } as const;
const LIKELIHOOD_COLOR = { high: 'var(--color-text-danger)', medium: 'var(--color-text-warning)', low: 'var(--color-text-success)' } as const;

export default function BriefingsPage() {
  const [selected, setSelected] = useState<Briefing | null>(null);
  const [generating, setGenerating] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['briefings'],
    queryFn: fetchBriefings,
    staleTime: 120_000,
  });

  const mutation = useMutation({
    mutationFn: (type: BriefingType) => generateBriefing(type),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['briefings'] });
      setSelected(result.briefing);
      setGenerating(false);
    },
    onError: (err) => {
      alert(`Failed: ${String(err)}`);
      setGenerating(false);
    },
  });

  const briefings = data?.briefings ?? [];
  const activeBriefing = selected ?? briefings[0] ?? null;

  if (error) {
    return (
      <div className="p-6">
        <PulseCard status="critical">
          <PulseCardBody>
            <p style={{ color: 'var(--color-text-danger)' }}>Failed to load briefings: {String(error)}</p>
          </PulseCardBody>
        </PulseCard>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 60px)' }}>

      {/* ── Left: Briefing list ───────────────────────────────────────── */}
      <div
        className="flex-shrink-0 overflow-y-auto p-4 space-y-2"
        style={{ width: 300, borderRight: '1px solid var(--color-border-default)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider px-1 pb-2" style={{ color: 'var(--color-text-muted)' }}>
          Autonomous Briefings
        </p>

        {isLoading && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
        )}

        {briefings.map(b => (
          <button
            key={b.id}
            onClick={() => setSelected(b)}
            className="w-full text-left"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <PulseCard className={activeBriefing?.id === b.id ? 'ring-2 ring-[var(--color-brand-primary)]' : ''}>
              <PulseCardBody className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ background: 'var(--color-brand-subtle)', color: 'var(--color-brand-secondary)' }}>
                    {TYPE_LABEL[b.type] ?? b.type}
                  </span>
                  {b.isLatest && (
                    <span className="text-xs font-bold" style={{ color: 'var(--color-pulse-gold)' }}>★ Latest</span>
                  )}
                </div>
                <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>{b.period}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {relativeTime(b.generatedAt)} · {b.readTime} min read
                </p>
              </PulseCardBody>
            </PulseCard>
          </button>
        ))}

        {briefings.length === 0 && !isLoading && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
            No briefings yet. Generate the first one →
          </p>
        )}

        {/* Generate CTA */}
        {!generating ? (
          <div className="space-y-2 pt-2">
            {(['daily', 'weekly', 'board'] as BriefingType[]).map(type => (
              <button
                key={type}
                onClick={() => { setGenerating(true); mutation.mutate(type); }}
                disabled={mutation.isPending}
                className="w-full py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all"
                style={{
                  background: 'var(--color-brand-subtle)',
                  border: '1px dashed var(--color-brand-primary)',
                  color: 'var(--color-brand-secondary)',
                  cursor: mutation.isPending ? 'wait' : 'pointer',
                  opacity: mutation.isPending ? 0.6 : 1,
                }}
              >
                + {TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs animate-pulse" style={{ color: 'var(--color-brand-secondary)' }}>
              Claude is generating…
            </p>
          </div>
        )}
      </div>

      {/* ── Right: Briefing detail ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
        {activeBriefing
          ? <BriefingDetail briefing={activeBriefing} />
          : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Select a briefing or generate one to get started.
              </p>
            </div>
          )
        }
      </div>
    </div>
  );
}

function BriefingDetail({ briefing }: { briefing: Briefing }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ background: 'var(--color-brand-subtle)', color: 'var(--color-brand-secondary)' }}>
            {TYPE_LABEL[briefing.type] ?? briefing.type}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Generated by Claude · {new Date(briefing.generatedAt).toLocaleString('en-GB')}
          </span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{briefing.title}</h1>
      </div>

      {/* KPI snapshot */}
      {briefing.kpiSnapshot.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {briefing.kpiSnapshot.map(kpi => (
            <PulseCard key={kpi.id}>
              <PulseCardBody className="py-3">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{kpi.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>{kpi.formatted}</p>
                <TrendBadge delta={kpi.delta} deltaFormatted={kpi.deltaFormatted} />
              </PulseCardBody>
            </PulseCard>
          ))}
        </div>
      )}

      {/* Executive Summary */}
      <PulseCard>
        <PulseCardHeader>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Executive Summary</span>
        </PulseCardHeader>
        <PulseCardBody>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {briefing.executiveSummary}
          </p>
        </PulseCardBody>
      </PulseCard>

      {/* Highlights */}
      {briefing.highlights.length > 0 && (
        <PulseCard>
          <PulseCardHeader>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Period Highlights</span>
          </PulseCardHeader>
          <PulseCardBody className="space-y-2">
            {briefing.highlights.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-1.5"
                   style={{ borderBottom: i < briefing.highlights.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{h.label}</span>
                <span className="text-sm font-semibold" style={{ color: SENTIMENT_COLOR[h.sentiment] }}>{h.value}</span>
              </div>
            ))}
          </PulseCardBody>
        </PulseCard>
      )}

      {/* Risks */}
      {briefing.risks.length > 0 && (
        <PulseCard>
          <PulseCardHeader>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Key Risks</span>
          </PulseCardHeader>
          <PulseCardBody className="space-y-3">
            {briefing.risks.map((r, i) => (
              <div key={i} className="p-3 rounded-[var(--radius-md)]" style={{ background: 'var(--color-surface-subtle)' }}>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{r.title}</span>
                  <span className="text-xs font-medium" style={{ color: LIKELIHOOD_COLOR[r.likelihood] }}>
                    {r.likelihood.toUpperCase()} likelihood
                  </span>
                  <span className="text-xs font-medium" style={{ color: LIKELIHOOD_COLOR[r.impact] }}>
                    {r.impact.toUpperCase()} impact
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.mitigation}</p>
              </div>
            ))}
          </PulseCardBody>
        </PulseCard>
      )}

      {/* Recommendations */}
      {briefing.recommendations.length > 0 && (
        <PulseCard>
          <PulseCardHeader>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Claude Recommendations</span>
          </PulseCardHeader>
          <PulseCardBody>
            <ol className="space-y-2">
              {briefing.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="flex-shrink-0 font-bold" style={{ color: 'var(--color-brand-secondary)' }}>
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </PulseCardBody>
        </PulseCard>
      )}
    </div>
  );
}
