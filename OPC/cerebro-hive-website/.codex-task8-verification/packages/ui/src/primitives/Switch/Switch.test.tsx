import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders without crashing', () => {
    const { container } = render(<Switch />);
    expect(container).toBeDefined();
  });
});
