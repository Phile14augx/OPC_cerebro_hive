import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Panel } from './Panel';

describe('Panel', () => {
  it('renders without crashing', () => {
    const { container } = render(<Panel />);
    expect(container).toBeDefined();
  });
});
