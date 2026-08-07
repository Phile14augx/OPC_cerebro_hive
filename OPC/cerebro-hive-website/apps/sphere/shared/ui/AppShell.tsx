'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UserRole } from '../lib/types';
import { ROLE_PROFILES, ROLE_ORDER } from '../lib/role-config';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 15_000 } },
});

/* ── Role context ─────────────────────────────────────────────────────────── */
import { createContext, useContext } from 'react';

interface RoleCtx { role: UserRole; setRole: (r: UserRole) => void; }
export const RoleContext = createContext<RoleCtx>({ role: 'ceo', setRole: () => {} });
export const useRole = () => useContext(RoleContext);

/* ── Nav items ────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: '/dashboard',          icon: '◉', label: 'Overview'    },
  { href: '/dashboard/agents',   icon: '◈', label: 'Agents'      },
  { href: '/dashboard/products', icon: '⊞', label: 'Products'    },
  { href: '/dashboard/alerts',   icon: '◆', label: 'Alerts'      },
  { href: '/onboarding',         icon: '⊕', label: 'Onboarding'  },
];

/* ── Live clock ───────────────────────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>{time}</span>;
}

/* ── AppShell ─────────────────────────────────────────────────────────────── */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('ceo');
  const [collapsed, setCollapsed] = useState(false);
  const profile = ROLE_PROFILES[role];

  return (
    <QueryClientProvider client={queryClient}>
      <RoleContext.Provider value={{ role, setRole }}>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-void)' }}>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside
            style={{
              width: collapsed ? 64 : 240,
              flexShrink: 0,
              background: 'var(--bg-primary)',
              borderRight: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 200ms ease',
              overflow: 'hidden',
            }}
          >
            {/* Logo */}
            <div style={{ padding: collapsed ? '20px 16px' : '20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, var(--brand-core), var(--brand-bright))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                    boxShadow: '0 0 16px var(--brand-glow)',
                  }}
                >
                  CS
                </div>
                {!collapsed && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>CerebroSphere</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AEOS Command</div>
                  </div>
                )}
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV_ITEMS.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: collapsed ? '10px 16px' : '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: 13,
                    transition: 'background 120ms, color 120ms',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </a>
              ))}
            </nav>

            {/* Role switcher */}
            {!collapsed && (
              <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 12px 8px' }}>
                  View As
                </p>
                {ROLE_ORDER.map(r => {
                  const p = ROLE_PROFILES[r];
                  return (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      style={{
                        width: '100%', textAlign: 'left', background: role === r ? 'var(--bg-elevated)' : 'transparent',
                        border: role === r ? `1px solid ${p.color}30` : '1px solid transparent',
                        borderRadius: 'var(--radius-md)', padding: '8px 12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2,
                        transition: 'all 120ms',
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: role === r ? 600 : 400, color: role === r ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center', fontSize: 12,
              }}
            >
              {collapsed ? '→' : '←'}
            </button>
          </aside>

          {/* ── Main ──────────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

            {/* Header */}
            <header style={{
              height: 52, flexShrink: 0,
              background: 'var(--bg-primary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  CerebroSphere
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unified AEOS Dashboard</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <LiveClock />

                {/* Role indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: profile.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: profile.color }}>{profile.label} View</span>
                </div>

                {/* Live indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="status-dot healthy" style={{ width: 7, height: 7 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--status-healthy)', letterSpacing: '0.05em' }}>LIVE</span>
                </div>
              </div>
            </header>

            {/* Page content */}
            <main style={{ flex: 1, overflow: 'auto' }}>
              {children}
            </main>
          </div>
        </div>
      </RoleContext.Provider>
    </QueryClientProvider>
  );
}
