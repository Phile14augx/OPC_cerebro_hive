import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SplitView } from './SplitView';

describe('SplitView', () => {
  it('renders without crashing', () => {
    const { container } = render(<SplitView />);
    expect(container).toBeDefined();
  });
});
