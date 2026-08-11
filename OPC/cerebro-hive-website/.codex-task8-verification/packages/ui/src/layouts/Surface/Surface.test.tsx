import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Surface } from './Surface';

describe('Surface', () => {
  it('renders without crashing', () => {
    const { container } = render(<Surface />);
    expect(container).toBeDefined();
  });
});
