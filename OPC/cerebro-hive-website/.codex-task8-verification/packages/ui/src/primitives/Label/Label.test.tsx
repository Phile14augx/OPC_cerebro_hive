import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
  it('renders without crashing', () => {
    const { container } = render(<Label />);
    expect(container).toBeDefined();
  });
});
