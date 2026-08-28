import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Uploader } from './Uploader';

// Mock the global fetch
global.fetch = vi.fn();

describe('Uploader Behavioral Contract', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('1. Application/page shell renders meaningful content', () => {
    render(<Uploader />);
    // Meaningful shell rendering
    expect(screen.getByText('Upload to CerebroArchive')).toBeDefined();
    expect(screen.getByText('Upload Document')).toBeDefined();
  });

  it('2. Primary user interaction & 3. State transition', () => {
    render(<Uploader />);
    
    // Find the file input (accessibility/interaction)
    const fileInput = document.querySelector('input[type="file"]');
                   
    expect(fileInput).not.toBeNull();
    
    // Simulate selecting a file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput!, { target: { files: [file] } });
    
    // State transition: filename is rendered
    expect(screen.getByText('test.pdf')).toBeDefined();
    
    // The button should now be enabled
    const uploadButton = screen.getByRole('button', { name: /Upload Document/i });
    expect((uploadButton as HTMLButtonElement).disabled).toBe(false);
  });

  it('4. Empty state (no file selected)', () => {
    render(<Uploader />);
    const uploadButton = screen.getByRole('button', { name: /Upload Document/i });
    
    // Button is disabled when no file is present
    expect((uploadButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('5. Error or invalid-input state (API failure)', async () => {
    render(<Uploader />);
    
    // Setup file
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput!, { target: { files: [file] } });
    
    // Mock API failure
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
    });
    
    // Click upload
    const uploadButton = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(uploadButton);
    
    // State transition to error
    await waitFor(() => {
      expect(screen.getByText('Failed to request upload session')).toBeDefined();
    });
  });

  it('6. Accessibility invariant', () => {
    render(<Uploader />);
    // The upload button should be clearly identifiable
    const uploadButton = screen.getByRole('button', { name: /Upload Document/i });
    expect(uploadButton).toBeDefined();
    expect(uploadButton.tagName).toBe('BUTTON');
  });
});
