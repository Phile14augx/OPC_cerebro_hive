'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PulseCard, PulseCardHeader, PulseCardBody, SeverityBadge } from '../../../shared/ui/PulseCard';
import type { StrategicAlert } from '../../../shared/lib/types';

async function fetchAlerts(): Promise<{ alerts: StrategicAlert[]; total: number }> {
  const res = await fetch('/api/alerts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

/* ── War Room page ──────────────────────────────────────────────────────────
   Activated during a crisis. Claude coordinates all AEOS agents from a single
   command surface. Zero human intervention required — the CEO observes and
   optionally overrides.
────────────────────────────────────────────────────────────────────────────── */

const TIMELINE_EVENTS = [
  { time: '09:14:22', actor: 'HiveShield', action: 'PAT anomaly detected — external IP attempted clone', type: 'alert' },
  { time: '09:14:25', actor: 'Claude', action: 'Escalated to War Room. Notifying executive team.', type: 'system' },
  { time: '09:14:31', actor: 'HiveOps', action: 'Isolated affected CI runners. Network segment quarantined.', type: 'action' },
  { time: '09:15:10', actor: 'Claude', action: 'Drafting incident report. Engaging security runbook §4.2.', type: 'system' },
  { time: '09:16:44', actor: 'HiveShield', action: 'PAT revoked. Token invalidated across all surfaces.', type: 'action' },
  { time: '09:17:02', actor: 'HiveOps', action: 'New PAT issued and rotated into .env. CI re-authorised.', type: 'action' },
  { time: '09:18:55', actor: 'Claude', action: 'All systems confirmed secure. Awaiting executive sign-off to exit War Room.', type: 'system' },
];

const WARROOM_AGENTS = [
  { name: 'Claude', role: 'Incident Commander', status: 'active', tasks: 'Coordinating response, drafting comms, running runbooks' },
  { name: 'HiveShield', role: 'Security Lead', status: 'active', tasks: 'Threat containment, PAT rotation, DLP scan' },
  { name: 'HiveOps', role: 'Infrastructure Lead', status: 'active', tasks: 'Network isolation, CI quarantine, service health' },
  { name: 'HivePulse', role: 'Exec Comms', status: 'active', tasks: 'Briefing C-suite, updating enterprise health score' },
  { name: 'HiveLegal', role: 'Legal / Compliance', status: 'standby', tasks: 'On standby for regulatory notification if required' },
  { name: 'HiveSupport', role: 'Customer Comms', status: 'standby', tasks: 'On standby for client-facing communication' },
];

export default function WarRoomPage() {
  const [activated, setActivated] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [visibleEvents, setVisibleEvents] = useState(1);

  useEffect(() => {
    if (!activated) return;
    const tick = setInterval(() => setElapsed(e => e + 1), 1000);
    const reveal = setInterval(() => {
      setVisibleEvents(v => Math.min(v + 1, TIMELINE_EVENTS.length));
    }, 1800);
    return () => { clearInterval(tick); clearInterval(reveal); };
  }, [activated]);

  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 60_000,
    staleTime: 55_000,
  });

  const criticalAlerts = (alertsData?.alerts ?? []).filter(a => a.severity === 'critical' && !a.acknowledged);

  const fmtElapsed = `${String(Math.floor(elapsed / 60)).padStart(2,'0')}:${String(elapsed % 60).padStart(2,'0')}`;

  if (!activated) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="text-5xl mb-4">⊕</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            War Room
          </h1>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Activate War Room when a critical incident requires coordinated response
            across all AEOS agents. Claude takes the role of Incident Commander and
            coordinates every remediation action autonomously. You observe and override.
          </p>

          {criticalAlerts.length > 0 && (
            <PulseCard className="mb-6 text-left">
              <PulseCardHeader>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-danger)' }}>
                  {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} — War Room Recommended
                </span>
              </PulseCardHeader>
              <PulseCardBody className="space-y-2 py-3">
                {criticalAlerts.map(a => (
                  <div key={a.id} className="flex items-center gap-2">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{a.title}</span>
                  </div>
                ))}
              </PulseCardBody>
            </PulseCard>
          )}

          <button
            onClick={() => setActivated(true)}
            className="px-8 py-4 text-sm font-bold rounded-[var(--radius-lg)] transition-all"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: '0 0 24px rgba(220,38,38,0.4)',
            }}
          >
            ⊕ Activate War Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-5">

      {/* Banner */}
      <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)]"
           style={{
             background: 'rgba(220,38,38,0.12)',
             border: '1px solid rgba(220,38,38,0.4)',
           }}>
        <div className="flex items-center gap-3">
          <span className="alert-flash text-xl">⊕</span>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text-danger)' }}>WAR ROOM ACTIVE</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Claude is Incident Commander · All AEOS agents coordinated · Duration: {fmtElapsed}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActivated(false)}
          className="text-xs font-semibold px-4 py-2 rounded-[var(--radius-md)]"
          style={{
            background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-default)', cursor: 'pointer',
          }}
        >
          ✓ Stand Down
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Timeline */}
        <div className="lg:col-span-2">
          <PulseCard>
            <PulseCardHeader>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Incident Timeline — Live
              </span>
            </PulseCardHeader>
            <PulseCardBody className="space-y-3">
              {TIMELINE_EVENTS.slice(0, visibleEvents).map((ev, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-xs font-mono flex-shrink-0 pt-0.5"
                        style={{ color: 'var(--color-text-muted)', minWidth: 60 }}>
                    {ev.time}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs font-bold mr-2" style={{
                      color: ev.type === 'alert' ? 'var(--color-text-danger)'
                           : ev.type === 'action' ? 'var(--color-text-success)'
                           : 'var(--color-brand-secondary)',
                    }}>
                      [{ev.actor}]
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {ev.action}
                    </span>
                  </div>
                </div>
              ))}
              {visibleEvents < TIMELINE_EVENTS.length && (
                <div className="flex gap-2 items-center">
                  <div className="h-1 w-1 rounded-full alert-flash" style={{ background: 'var(--color-brand-primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Agents working...</span>
                </div>
              )}
            </PulseCardBody>
          </PulseCard>
        </div>

        {/* Agent status */}
        <div>
          <PulseCard>
            <PulseCardHeader>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Agent Assignments
              </span>
            </PulseCardHeader>
            <PulseCardBody className="space-y-3 py-3">
              {WARROOM_AGENTS.map(agent => (
                <div key={agent.name} className="p-3 rounded-[var(--radius-md)]"
                     style={{ background: 'var(--color-surface-subtle)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {agent.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: agent.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(113,113,122,0.12)',
                            color: agent.status === 'active' ? 'var(--color-text-success)' : 'var(--color-text-muted)',
                          }}>
                      {agent.status === 'active' ? '● Active' : '○ Standby'}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{agent.role}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{agent.tasks}</p>
                </div>
              ))}
            </PulseCardBody>
          </PulseCard>
        </div>
      </div>

      {/* Executive override */}
      <PulseCard>
        <PulseCardHeader>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Executive Override Console
          </span>
        </PulseCardHeader>
        <PulseCardBody>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Issue natural language commands to override or redirect agent actions.
            Claude will interpret and dispatch immediately.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. 'Pause all outbound communications until further notice'"
              className="flex-1 text-sm px-4 py-2.5 rounded-[var(--radius-md)]"
              style={{
                background: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border-default)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
            <button
              className="px-5 py-2.5 text-sm font-semibold rounded-[var(--radius-md)]"
              style={{ background: 'var(--color-brand-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Dispatch
            </button>
          </div>
        </PulseCardBody>
      </PulseCard>
    </div>
  );
}
