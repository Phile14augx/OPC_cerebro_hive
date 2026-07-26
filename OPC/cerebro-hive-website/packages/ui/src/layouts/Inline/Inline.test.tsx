import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Inline } from './Inline';

describe('Inline', () => {
  it('renders without crashing', () => {
    const { container } = render(<Inline />);
    expect(container).toBeDefined();
  });
});
