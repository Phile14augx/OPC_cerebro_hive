import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders without crashing', () => {
    const { container } = render(<Icon />);
    expect(container).toBeDefined();
  });
});
