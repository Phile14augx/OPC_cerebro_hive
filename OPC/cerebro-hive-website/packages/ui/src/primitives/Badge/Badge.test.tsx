import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders semantic content', () => {
    render(<Badge>Status: Active</Badge>);
    expect(screen.getByText('Status: Active')).toBeDefined();
  });

  it('propagates className and variant props correctly', () => {
    const { container } = render(<Badge variant="destructive" className="custom-badge">Alert</Badge>);
    const badge = container.firstChild as HTMLElement;
    
    // Check if variant and custom class are present
    expect(badge.className).toContain('custom-badge');
    expect(badge.className).toContain('bg-[var(--color-text-danger)]');
  });
});
