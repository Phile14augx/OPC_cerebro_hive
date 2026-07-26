import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  it('renders without crashing', () => {
    const { container } = render(<Tooltip />);
    expect(container).toBeDefined();
  });
});
