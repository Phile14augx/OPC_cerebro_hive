import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WarRoomPage from './page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

global.fetch = vi.fn();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('WarRoomPage Behavioral Contract', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('1. Renders empty/inactive state', () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ alerts: [], total: 0 })
    });
    render(<WarRoomPage />, { wrapper });
    expect(screen.getByText('War Room')).toBeDefined();
    expect(screen.getByRole('button', { name: /Activate War Room/i })).toBeDefined();
  });

  it('2. Shows critical alerts in inactive state (adapter mocked)', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ alerts: [{ id: '1', title: 'DB Down', severity: 'critical', acknowledged: false }], total: 1 })
    });
    render(<WarRoomPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/1 Critical Alert/i)).toBeDefined();
      expect(screen.getByText('DB Down')).toBeDefined();
    });
  });

  it('3. Activates war room state transition', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ alerts: [], total: 0 })
    });
    render(<WarRoomPage />, { wrapper });
    
    const activateBtn = screen.getByRole('button', { name: /Activate War Room/i });
    fireEvent.click(activateBtn);

    expect(screen.getByText('WAR ROOM ACTIVE')).toBeDefined();
    expect(screen.getByText('Executive Override Console')).toBeDefined();
  });
});
