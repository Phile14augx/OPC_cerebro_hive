
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000 } }
});

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Parse current dashboard module for breadcrumbs
  const pathParts = pathname.split('/').filter(Boolean);
  const currentModule = pathParts[pathParts.length - 1] || 'Mission Control';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-screen bg-[var(--color-bg-primary)] overflow-hidden text-[var(--color-text-primary)] font-sans">
        
        {/* Global Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-surface-default)] flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)] font-bold tracking-tight">
            Cerebro Hive
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* These would eventually be dynamically generated from Plugin Manifests */}
            <a href="/dashboard/mission-control" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname.includes('mission-control') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}`}>Mission Control</a>
            <a href="/dashboard/telemetry" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname.includes('telemetry') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}`}>Telemetry</a>
            <a href="/dashboard/governance" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname.includes('governance') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}`}>Governance</a>
            <a href="/dashboard/observability" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname.includes('observability') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}`}>Observability</a>
            <a href="/dashboard/intelligence" className={`block px-3 py-2 rounded-md text-sm font-medium ${pathname.includes('intelligence') ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]'}`}>Intelligence</a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Global Header / Breadcrumbs */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-default)]/50 backdrop-blur-sm z-10 flex-shrink-0">
            <div className="flex items-center text-sm font-medium text-[var(--color-text-muted)] space-x-2">
              <span>Platform</span>
              <span>/</span>
              <span className="text-[var(--color-text-primary)] capitalize">{currentModule.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                Cmd+K to Search
              </button>
            </div>
          </header>

          {/* Dashboard Canvas Wrapper */}
          <div className="flex-1 overflow-y-auto relative bg-[var(--color-bg-secondary)]">
            {children}
          </div>

        </main>
      </div>
    </QueryClientProvider>
  );
}
