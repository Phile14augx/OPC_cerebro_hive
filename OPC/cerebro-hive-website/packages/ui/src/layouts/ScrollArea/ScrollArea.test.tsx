import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollArea } from './ScrollArea';

describe('ScrollArea', () => {
  it('renders without crashing', () => {
    const { container } = render(<ScrollArea />);
    expect(container).toBeDefined();
  });
});
