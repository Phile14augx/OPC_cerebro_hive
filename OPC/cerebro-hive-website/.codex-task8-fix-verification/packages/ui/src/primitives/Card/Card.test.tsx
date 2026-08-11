import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders without crashing', () => {
    const { container } = render(<Card />);
    expect(container).toBeDefined();
  });
});
