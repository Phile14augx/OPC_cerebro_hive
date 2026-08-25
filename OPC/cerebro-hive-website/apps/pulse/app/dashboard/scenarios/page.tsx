'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PulseCard, PulseCardHeader, PulseCardBody, TrendBadge } from '../../../shared/ui/PulseCard';
import type { Scenario, EnterpriseHealthScore } from '../../../shared/lib/types';

/* ── Data fetchers ──────────────────────────────────────────────────────── */
async function fetchScenarios(): Promise<{ scenarios: Scenario[] }> {
  const res = await fetch('/api/scenarios', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

async function fetchHealth(): Promise<{ health: EnterpriseHealthScore }> {
  const res = await fetch('/api/health', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

async function createScenario(body: {
  title: string;
  description: string;
  assumption: string;
  timeHorizon: Scenario['timeHorizon'];
}): Promise<{ scenario: Scenario }> {
  const res = await fetch('/api/scenarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Failed to create scenario');
  }
  return res.json();
}

const HORIZON_LABEL: Record<string, string> = {
  '30d': '30 days', '90d': '90 days', '180d': '6 months', '1y': '1 year',
};

export default function ScenariosPage() {
  const [active, setActive] = useState<Scenario | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assumption: '', timeHorizon: '90d' as Scenario['timeHorizon'] });
  const qc = useQueryClient();

  const { data: scenData, isLoading: scenLoading } = useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
    staleTime: 300_000,
  });

  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 25_000,
  });

  const mutation = useMutation({
    mutationFn: createScenario,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['scenarios'] });
      setActive(result.scenario);
      setShowForm(false);
      setForm({ title: '', description: '', assumption: '', timeHorizon: '90d' });
    },
    onError: (err) => {
      alert(`Failed: ${String(err)}`);
    },
  });

  const scenarios = scenData?.scenarios ?? [];
  const baseScore = healthData?.health.score ?? 0;
  const current = active ?? scenarios[0] ?? null;

  const projectedScore = current ? Math.min(100, Math.max(0, baseScore + current.healthImpact)) : baseScore;
  const projectedColor = projectedScore >= 75 ? 'var(--color-text-success)'
    : projectedScore >= 50 ? 'var(--color-text-warning)'
    : 'var(--color-text-danger)';

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Scenario Modelling
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          What-if analysis powered by Claude · No production data is modified
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Scenario selector */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Saved Scenarios
          </p>

          {scenLoading && (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
          )}

          {scenarios.map(sc => (
            <button key={sc.id} onClick={() => setActive(sc)}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <PulseCard className={current?.id === sc.id ? 'ring-2 ring-[var(--color-brand-primary)]' : ''}>
                <PulseCardBody className="py-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{sc.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded"
                          style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' }}>
                      {HORIZON_LABEL[sc.timeHorizon]}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {Math.round(sc.probability * 100)}% probability
                    </span>
                  </div>
                  <TrendBadge
                    delta={sc.healthImpact}
                    deltaFormatted={`Health ${sc.healthImpact > 0 ? '+' : ''}${sc.healthImpact}pts`}
                  />
                </PulseCardBody>
              </PulseCard>
            </button>
          ))}

          {scenarios.length === 0 && !scenLoading && !showForm && (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No scenarios yet. Create one with Claude →
            </p>
          )}

          {showForm ? (
            <PulseCard>
              <PulseCardBody className="space-y-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>New Scenario</p>
                {(['title', 'description', 'assumption'] as const).map(field => (
                  <div key={field}>
                    <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-[var(--radius-md)]"
                      style={{
                        background: 'var(--color-surface-subtle)',
                        border: '1px solid var(--color-border-default)',
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                      }}
                      placeholder={field === 'title' ? 'e.g. Lose top 3 clients' : field === 'assumption' ? 'Key assumption...' : 'What would happen?'}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Time Horizon</label>
                  <select
                    value={form.timeHorizon}
                    onChange={e => setForm(f => ({ ...f, timeHorizon: e.target.value as Scenario['timeHorizon'] }))}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-[var(--radius-md)]"
                    style={{ background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
                  >
                    {(['30d', '90d', '180d', '1y'] as const).map(h => (
                      <option key={h} value={h}>{HORIZON_LABEL[h]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => mutation.mutate(form)}
                    disabled={mutation.isPending || !form.title || !form.assumption}
                    className="flex-1 py-2 text-sm font-semibold rounded-[var(--radius-md)]"
                    style={{
                      background: 'var(--color-brand-primary)', color: '#fff', border: 'none',
                      cursor: mutation.isPending ? 'wait' : 'pointer',
                      opacity: mutation.isPending || !form.title ? 0.6 : 1,
                    }}
                  >
                    {mutation.isPending ? 'Analysing…' : 'Analyse with Claude'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-3 py-2 text-sm rounded-[var(--radius-md)]"
                    style={{ background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)', border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </PulseCardBody>
            </PulseCard>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 text-sm font-medium rounded-[var(--radius-lg)] transition-all"
              style={{
                background: 'var(--color-brand-subtle)',
                border: '1px dashed var(--color-brand-primary)',
                color: 'var(--color-brand-secondary)',
                cursor: 'pointer',
              }}
            >
              + New Scenario
            </button>
          )}
        </div>

        {/* Scenario detail */}
        {current && (
          <div className="lg:col-span-2 space-y-4">
            <PulseCard>
              <PulseCardBody>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{current.title}</h2>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{current.description}</p>
                <div className="mt-3 p-3 rounded-[var(--radius-md)]"
                     style={{ background: 'var(--color-surface-subtle)', borderLeft: '3px solid var(--color-brand-primary)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Assumption</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{current.assumption}</p>
                </div>
              </PulseCardBody>
            </PulseCard>

            {/* Health score projection */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Current Score', value: baseScore, color: 'var(--color-text-success)' },
                {
                  label: 'Impact',
                  value: current.healthImpact,
                  color: current.healthImpact >= 0 ? 'var(--color-text-success)' : 'var(--color-text-danger)',
                  prefix: current.healthImpact >= 0 ? '+' : '',
                  suffix: 'pts',
                },
                { label: 'Projected Score', value: projectedScore, color: projectedColor },
              ].map((item, i) => (
                <PulseCard key={i}>
                  <PulseCardBody className="text-center py-5">
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{item.label}</p>
                    <p className="text-4xl font-bold" style={{ color: item.color }}>
                      {item.prefix ?? ''}{item.value}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{item.suffix ?? '/100'}</p>
                  </PulseCardBody>
                </PulseCard>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PulseCard>
                <PulseCardBody>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Revenue Impact</p>
                  <p className="text-2xl font-bold mt-1" style={{
                    color: current.revenueImpact >= 0 ? 'var(--color-text-success)' : 'var(--color-text-danger)'
                  }}>
                    {current.revenueImpact >= 0 ? '+' : ''}${Math.abs(current.revenueImpact).toFixed(1)}M
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    over {HORIZON_LABEL[current.timeHorizon]}
                  </p>
                </PulseCardBody>
              </PulseCard>
              <PulseCard>
                <PulseCardBody>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Probability Estimate</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                    {Math.round(current.probability * 100)}%
                  </p>
                  <div className="h-1.5 rounded-full mt-2" style={{ background: 'var(--color-border-default)' }}>
                    <div className="h-1.5 rounded-full"
                         style={{ width: `${current.probability * 100}%`, background: 'var(--color-brand-primary)' }} />
                  </div>
                </PulseCardBody>
              </PulseCard>
            </div>

            {current.pillarImpacts.length > 0 && (
              <PulseCard>
                <PulseCardHeader>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Pillar-Level Impact</span>
                </PulseCardHeader>
                <PulseCardBody className="space-y-3">
                  {current.pillarImpacts.map(pi => {
                    const absMax = Math.max(...current.pillarImpacts.map(x => Math.abs(x.delta)), 1);
                    const pct = Math.abs(pi.delta) / absMax * 100;
                    const color = pi.delta >= 0 ? 'var(--color-text-success)' : 'var(--color-text-danger)';
                    return (
                      <div key={pi.pillarId}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span style={{ color: 'var(--color-text-secondary)' }}>{pi.label}</span>
                          <span style={{ color, fontWeight: 600 }}>{pi.delta > 0 ? '+' : ''}{pi.delta}pts</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--color-border-default)' }}>
                          <div className="h-1.5 rounded-full transition-all duration-500"
                               style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </PulseCardBody>
              </PulseCard>
            )}
          </div>
        )}

        {!current && !scenLoading && (
          <div className="lg:col-span-2 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Create a scenario to see Claude&apos;s analysis here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
