import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders without crashing', () => {
    const { container } = render(<Grid />);
    expect(container).toBeDefined();
  });
});
