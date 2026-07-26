import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders without crashing', () => {
    const { container } = render(<Input />);
    expect(container).toBeDefined();
  });
});
