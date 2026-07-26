import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders without crashing', () => {
    const { container } = render(<Text />);
    expect(container).toBeDefined();
  });
});
