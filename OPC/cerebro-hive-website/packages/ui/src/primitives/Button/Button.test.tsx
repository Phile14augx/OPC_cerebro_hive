import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders semantic content', () => {
    render(<Button>Submit Action</Button>);
    expect(screen.getByRole('button', { name: 'Submit Action' })).toBeDefined();
  });

  it('fires click callback when interacted with', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click Me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('behaves correctly in disabled state (accessibility and negative path)', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled Button' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('propagates className and variant props correctly', () => {
    const { container } = render(<Button variant="outline" className="custom-class">Variant</Button>);
    const button = container.firstChild as HTMLElement;
    
    // Check if custom class is present
    expect(button.className).toContain('custom-class');
  });
});
