import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders without crashing', () => {
    const { container } = render(<Sidebar />);
    expect(container).toBeDefined();
  });
});
