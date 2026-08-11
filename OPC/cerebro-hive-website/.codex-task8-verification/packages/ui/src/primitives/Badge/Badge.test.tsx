import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders without crashing', () => {
    const { container } = render(<Badge />);
    expect(container).toBeDefined();
  });
});
