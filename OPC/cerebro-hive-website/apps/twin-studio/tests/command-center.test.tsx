import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommandCenter } from '../features/command-center';

describe('command center', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      }),
    );
  });

  it('renders an empty state with a create action when no twins exist', async () => {
    render(<CommandCenter />);
    expect(await screen.findByRole('heading', { name: 'No digital twins' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Create twin' }).length).toBeGreaterThan(0);
  });
});
