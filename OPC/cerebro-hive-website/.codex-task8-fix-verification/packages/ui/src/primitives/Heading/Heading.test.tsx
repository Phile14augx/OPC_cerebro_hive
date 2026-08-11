import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders without crashing', () => {
    const { container } = render(<Heading />);
    expect(container).toBeDefined();
  });
});
