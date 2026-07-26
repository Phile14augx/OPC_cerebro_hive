import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders without crashing', () => {
    const { container } = render(<Stack />);
    expect(container).toBeDefined();
  });
});
