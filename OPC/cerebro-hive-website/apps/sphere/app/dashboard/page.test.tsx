import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleContext } from '../../shared/ui/AppShell';

global.fetch = vi.fn();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function wrapper({ children }: { children: React.ReactNode }) {
  // We need to provide AppShell context
  return (
    <RoleContext.Provider value={{ role: 'ceo', setRole: () => {} }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </RoleContext.Provider>
  );
}

describe('DashboardPage Behavioral Contract', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('1. Renders empty/loading state', () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(new Promise(() => {})); // Never resolves
    render(<DashboardPage />, { wrapper });
    expect(screen.getByText(/Unified AEOS Dashboard/i)).toBeDefined();
  });

  it('2. Shows dashboard data (adapter mocked)', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (url) => {
      if (url === '/api/dashboard') {
        return {
          ok: true,
          json: async () => ({
            platform: {
              overallStatus: 'healthy',
              uptimePct: 99.9,
              activeAgents: 10,
              executionsPerMin: 5,
              avgLatencyMs: 100,
              costBurnRateHr: 10,
              calculatedAt: new Date().toISOString()
            },
            alerts: [],
            kpis: [],
            products: [],
            workflows: []
          })
        };
      }
      if (url === '/api/narrative') {
        return {
          ok: true,
          json: async () => ({
            narrative: {
              headline: 'Test Headline',
              summary: 'Test Summary',
              topActions: [],
              watchItems: [],
              generatedAt: new Date().toISOString()
            }
          })
        };
      }
      return { ok: true, json: async () => ({}) };
    });

    render(<DashboardPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Platform Status')).toBeDefined();
      expect(screen.getByText('HEALTHY')).toBeDefined();
      expect(screen.getByText('Test Headline')).toBeDefined();
    });
  });
});
