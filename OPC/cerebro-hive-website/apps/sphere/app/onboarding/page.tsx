'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SphereCard, SphereCardHeader, SphereCardBody, AIBadge } from '../../shared/ui/SphereCard';
import type { OnboardingConfig, OnboardingResult, UserRole } from '../../shared/lib/types';

async function submitOnboarding(config: OnboardingConfig): Promise<OnboardingResult> {
  const res = await fetch('/api/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Onboarding failed');
  }
  return res.json();
}

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Legal', 'Education', 'Government', 'Real Estate', 'Other'];
const SIZES = [
  { value: 'startup',      label: 'Startup (1–50)',         desc: 'Early stage, fast moving' },
  { value: 'smb',          label: 'SMB (51–250)',           desc: 'Growing business' },
  { value: 'mid-market',   label: 'Mid-Market (251–1000)',  desc: 'Established enterprise' },
  { value: 'enterprise',   label: 'Enterprise (1000+)',     desc: 'Global operations' },
];
const GOAL_OPTIONS = [
  'Automate repetitive workflows', 'Improve decision-making with AI',
  'Reduce operational costs', 'Scale without increasing headcount',
  'Improve customer experience', 'Strengthen compliance and governance',
  'Accelerate product development', 'Enhance sales and revenue intelligence',
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [config, setConfig] = useState<Partial<OnboardingConfig>>({
    goals: [],
    primaryRole: 'ceo',
  });

  const mutation = useMutation({ mutationFn: submitOnboarding });

  function toggleGoal(g: string) {
    setConfig(c => ({
      ...c,
      goals: c.goals?.includes(g) ? c.goals.filter(x => x !== g) : [...(c.goals ?? []), g],
    }));
  }

  function canAdvance() {
    if (step === 1) return !!config.tenantName?.trim() && !!config.industry;
    if (step === 2) return !!config.size;
    return (config.goals?.length ?? 0) > 0;
  }

  async function finish() {
    if (!canAdvance()) return;
    await mutation.mutateAsync(config as OnboardingConfig);
  }

  const result = mutation.data;

  if (result) {
    return (
      <div style={{ padding: 24, maxWidth: 700, margin: '40px auto' }} className="fade-in">
        <SphereCard glowColor="var(--brand-core)">
          <SphereCardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AIBadge ai="claude" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Welcome to CerebroSphere</span>
            </div>
          </SphereCardHeader>
          <SphereCardBody style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: '16px', background: 'var(--brand-subtle)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--brand-core)' }}>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {result.welcomeNarrative}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-bright)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Recommended Agents</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.defaultAgents.map(a => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: 13 }}>◈</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--role-coo)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Suggested Workflows</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.suggestedWorkflows.map(w => (
                    <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: 13 }}>◧</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Tenant ID</p>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)', margin: 0 }}>{result.tenantId}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Workspace ID</p>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)', margin: 0 }}>{result.workspaceId}</p>
              </div>
            </div>

            <a href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--brand-core), var(--brand-bright))', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Enter CerebroSphere →
            </a>
          </SphereCardBody>
        </SphereCard>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '40px auto' }} className="fade-in">
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>◉</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Set up your AEOS workspace
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Claude will personalise CerebroSphere based on your organisation.
        </p>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: step >= s ? 'var(--brand-core)' : 'var(--bg-elevated)', color: step >= s ? '#fff' : 'var(--text-muted)', border: `2px solid ${step >= s ? 'var(--brand-core)' : 'var(--border-default)'}` }}>
                {s}
              </div>
              {s < 3 && <div style={{ width: 40, height: 2, background: step > s ? 'var(--brand-core)' : 'var(--border-default)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <SphereCard>
        <SphereCardBody style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1: Company info */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Tell us about your organisation</h2>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Company Name</label>
                <input
                  value={config.tenantName ?? ''}
                  onChange={e => setConfig(c => ({ ...c, tenantName: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Industry</label>
                <select
                  value={config.industry ?? ''}
                  onChange={e => setConfig(c => ({ ...c, industry: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13 }}
                >
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Your Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {(['ceo', 'cto', 'coo', 'dept'] as UserRole[]).map(r => (
                    <button key={r} onClick={() => setConfig(c => ({ ...c, primaryRole: r }))}
                      style={{ padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: config.primaryRole === r ? 'var(--brand-subtle)' : 'var(--bg-overlay)', color: config.primaryRole === r ? 'var(--brand-bright)' : 'var(--text-muted)', border: `1px solid ${config.primaryRole === r ? 'var(--brand-glow)' : 'var(--border-default)'}` }}>
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Company size */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>How large is your organisation?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SIZES.map(s => (
                  <button key={s.value} onClick={() => setConfig(c => ({ ...c, size: s.value as OnboardingConfig['size'] }))}
                    style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer', background: config.size === s.value ? 'var(--brand-subtle)' : 'var(--bg-elevated)', border: `1px solid ${config.size === s.value ? 'var(--brand-glow)' : 'var(--border-default)'}`, transition: 'all 120ms' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: config.size === s.value ? 'var(--brand-bright)' : 'var(--text-primary)', margin: 0 }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0' }}>{s.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>What do you want AEOS to help with?</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Select all that apply. Claude uses these to personalise your workspace.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {GOAL_OPTIONS.map(g => {
                  const selected = config.goals?.includes(g);
                  return (
                    <button key={g} onClick={() => toggleGoal(g)}
                      style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: selected ? 'var(--brand-subtle)' : 'var(--bg-elevated)', border: `1px solid ${selected ? 'var(--brand-glow)' : 'var(--border-default)'}` }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selected ? 'var(--brand-core)' : 'var(--border-strong)'}`, background: selected ? 'var(--brand-core)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: '#fff' }}>
                        {selected ? '✓' : ''}
                      </span>
                      <span style={{ fontSize: 12, color: selected ? 'var(--brand-bright)' : 'var(--text-secondary)', fontWeight: selected ? 500 : 400 }}>{g}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
                style={{ flex: 1, padding: '11px', borderRadius: 'var(--radius-md)', background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => (s + 1) as 2 | 3)} disabled={!canAdvance()}
                style={{ flex: 2, padding: '11px', borderRadius: 'var(--radius-md)', background: canAdvance() ? 'linear-gradient(135deg, var(--brand-core), var(--brand-bright))' : 'var(--bg-overlay)', color: canAdvance() ? '#fff' : 'var(--text-muted)', border: 'none', fontSize: 13, cursor: canAdvance() ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                Continue →
              </button>
            ) : (
              <button onClick={finish} disabled={!canAdvance() || mutation.isPending}
                style={{ flex: 2, padding: '11px', borderRadius: 'var(--radius-md)', background: canAdvance() && !mutation.isPending ? 'linear-gradient(135deg, var(--brand-core), var(--brand-bright))' : 'var(--bg-overlay)', color: canAdvance() && !mutation.isPending ? '#fff' : 'var(--text-muted)', border: 'none', fontSize: 13, cursor: canAdvance() ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                {mutation.isPending ? 'Claude is setting up your workspace…' : '✓ Launch AEOS Workspace'}
              </button>
            )}
          </div>

          {mutation.isError && (
            <p style={{ fontSize: 12, color: 'var(--status-critical)', margin: 0 }}>Error: {String(mutation.error)}</p>
          )}
        </SphereCardBody>
      </SphereCard>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16 }}>
        Powered by Claude · Defaults are AI-generated and editable at any time
      </p>
    </div>
  );
}
