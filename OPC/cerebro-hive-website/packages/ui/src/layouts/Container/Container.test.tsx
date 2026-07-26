import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders without crashing', () => {
    const { container } = render(<Container />);
    expect(container).toBeDefined();
  });
});
