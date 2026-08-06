'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const NAV_ITEMS = [
  { href: '/dashboard/mission-control', label: 'Mission Control', icon: '◉' },
  { href: '/dashboard/briefings',       label: 'Briefings',       icon: '◈' },
  { href: '/dashboard/scenarios',       label: 'Scenarios',       icon: '◧' },
  { href: '/dashboard/alerts',          label: 'Alerts',          icon: '◆', badge: 3 },
  { href: '/dashboard/war-room',        label: 'War Room',        icon: '◉' },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const currentItem = NAV_ITEMS.find(n => pathname.startsWith(n.href));
  const currentLabel = currentItem?.label ?? 'HivePulse';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-screen overflow-hidden text-[var(--color-text-primary)] font-sans"
           style={{ background: 'var(--color-bg-primary)' }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          style={{
            width: collapsed ? 64 : 240,
            background: 'var(--color-surface-default)',
            borderRight: '1px solid var(--color-border-default)',
            transition: 'width 200ms ease',
          }}
          className="flex-shrink-0 flex flex-col"
        >
          {/* Logo */}
          <div
            style={{ borderBottom: '1px solid var(--color-border-subtle)', height: 60 }}
            className="flex items-center px-4 gap-3 flex-shrink-0"
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-pulse-gold))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff',
              }}
            >
              HP
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  HivePulse
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Command Centre
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const isActive = pathname.startsWith(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    background: isActive ? 'var(--color-surface-raised)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 150ms',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  {'badge' in item && item.badge && item.badge > 0 && !collapsed && (
                    <span
                      style={{
                        background: 'var(--color-text-danger)',
                        color: '#fff',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 6px',
                        lineHeight: '16px',
                        minWidth: 18,
                        textAlign: 'center',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Collapse toggle */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', padding: 12 }}>
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 8, fontSize: 12,
                color: 'var(--color-text-muted)', background: 'transparent',
                border: 'none', cursor: 'pointer', textAlign: collapsed ? 'center' : 'left',
              }}
            >
              {collapsed ? '→' : '← Collapse'}
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">

          {/* Header */}
          <header
            style={{
              height: 60,
              borderBottom: '1px solid var(--color-border-subtle)',
              background: 'rgba(20,20,24,0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 24px', flexShrink: 0, zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>HivePulse</span>
              <span style={{ color: 'var(--color-border-strong)' }}>/</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{currentLabel}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <LiveClock />
              <span
                style={{
                  fontSize: 11, color: 'var(--color-text-success)',
                  background: 'rgba(34,197,94,0.10)',
                  border: '1px solid rgba(34,197,94,0.20)',
                  borderRadius: 999, padding: '3px 10px', fontWeight: 600,
                }}
              >
                ● LIVE
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg-secondary)' }}>
            {children}
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

function LiveClock() {
  const [time, setTime] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
      {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}
