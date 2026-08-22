import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentConfig } from './AgentConfig';

// Mock the global fetch
global.fetch = vi.fn();

describe('AgentConfig Behavioral Contract', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('1. Application shell renders meaningful content', () => {
    render(<AgentConfig />);
    expect(screen.getByText('Create New Agent')).toBeDefined();
    expect(screen.getByLabelText(/Agent Name/i)).toBeDefined();
  });

  it('2. Creation/configuration interactions & 3. Resulting state transitions (Success)', async () => {
    render(<AgentConfig />);
    
    const nameInput = screen.getByLabelText(/Agent Name/i);
    const promptInput = screen.getByLabelText(/System Prompt/i);
    const submitBtn = screen.getByRole('button', { name: /Create Agent/i });

    // Configuration interaction
    fireEvent.change(nameInput, { target: { value: 'Test Agent' } });
    fireEvent.change(promptInput, { target: { value: 'You are a test.' } });

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123' })
    });

    fireEvent.click(submitBtn);

    // State transition to creating
    expect(screen.getByRole('button', { name: /Creating.../i })).toBeDefined();

    // State transition to success
    await waitFor(() => {
      expect(screen.getByText("Agent 'Test Agent' created successfully!")).toBeDefined();
    });
  });

  it('4. Empty/Invalid state (Validation error)', () => {
    render(<AgentConfig />);
    const submitBtn = screen.getByRole('button', { name: /Create Agent/i });

    fireEvent.click(submitBtn);

    // Should show validation error without calling fetch
    expect(screen.getByText('Name and System Prompt are required.')).toBeDefined();
    expect((global.fetch as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it('5. Error state (API failure)', async () => {
    render(<AgentConfig />);
    
    const nameInput = screen.getByLabelText(/Agent Name/i);
    const promptInput = screen.getByLabelText(/System Prompt/i);
    const submitBtn = screen.getByRole('button', { name: /Create Agent/i });

    fireEvent.change(nameInput, { target: { value: 'Test Agent' } });
    fireEvent.change(promptInput, { target: { value: 'You are a test.' } });

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to create agent')).toBeDefined();
    });
  });
});
