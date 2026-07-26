import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<Skeleton />);
    expect(container).toBeDefined();
  });
});
